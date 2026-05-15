from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import uuid

from app.database import get_db
from app.auth import get_current_active_user
from app.models import (
    User,
    Quote,
    QuoteItem,
    QuoteOption,
    Project,
    Product,
    Setting,
    SizingResult as SizingResultModel,
    Customer,
)
from app.schemas import (
    Quote as QuoteSchema,
    QuoteCreate,
    QuoteUpdate,
    QuoteItem as QuoteItemSchema,
    QuoteItemUpdate,
    QuoteItemAddRequest,
    QuoteOption as QuoteOptionSchema,
    QuoteOptionCreate,
    QuoteOptionUpdate,
)
from app.services.pricing import generate_quote_items_from_sizing, use_bos_percentage_pricing
from app.services.pdf_generator import generate_quotation_pdf
from app.services.email_service import send_quotation_email
from app.services.quote_recalculator import recalculate_dependent_items
from app.services.quote_totals import get_primary_quote_option_id, refresh_quote_header_totals
from app.services.bom_from_catalog import _BOM_SKU_ORDER, append_standard_bom_from_catalog
from app.services.bom_sync import item_triggers_catalog_bom_rebuild, rebuild_catalog_bom_for_option
from app.services.bom_rules_reference import full_bom_rules_reference
from app.services.bom_audit import audit_quote
from app.services.bom_fix import fix_quote_bom
from app.services.bom_checklist_pdf import generate_bom_checklist_pdf

router = APIRouter(prefix="/quotes", tags=["quotes"])


def _item_triggers_bos_recalc(db: Session, item: QuoteItem) -> bool:
    """Legacy lump-sum BOS % / installation % only (equipment drivers)."""
    if item.product_id:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.product_type.value in ["panel", "inverter", "battery", "mounting"]:
            return True
    desc = item.description or ""
    desc_upper = desc.upper()
    if "Balance of System" in desc or "BOS) -" in desc_upper or "BOS -" in desc_upper:
        return True
    return False


def _is_manual_service_line(db: Session, item: QuoteItem) -> bool:
    """Transport, installation, and catalog BOM lines — edit price only, no % cascade."""
    if item.product_id:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            return False
        if product.product_type.value in ("transport", "installation"):
            return True
        if product.sku and product.sku in _BOM_SKU_ORDER:
            return True
    desc_lower = (item.description or "").lower()
    if "transport" in desc_lower and "logistics" in desc_lower:
        return True
    if "installation" in desc_lower and "transport" not in desc_lower:
        return True
    return False


def _finalize_quote_item_change(
    db: Session,
    quote_id: int,
    quote_option_id: int,
    item: QuoteItem,
) -> None:
    """Recalculate itemized BOM and/or legacy % lines, then quote header totals."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    project = db.query(Project).filter(Project.id == quote.project_id).first() if quote else None

    if _is_manual_service_line(db, item):
        refresh_quote_header_totals(db, quote_id)
        db.commit()
        return

    if (
        quote
        and project
        and item_triggers_catalog_bom_rebuild(db, item)
    ):
        rebuild_catalog_bom_for_option(
            db, quote_id, quote_option_id, project.id, project.system_type
        )
        refresh_quote_header_totals(db, quote_id)
        db.commit()
        return

    if _item_triggers_bos_recalc(db, item):
        recalculate_dependent_items(db, quote_id, quote_option_id)
    else:
        refresh_quote_header_totals(db, quote_id)
        db.commit()


@router.get("/", response_model=List[QuoteSchema])
async def list_quotes(
    skip: int = 0,
    limit: int = 100,
    project_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all quotes"""
    query = db.query(Quote).options(
        joinedload(Quote.items),
        joinedload(Quote.options).joinedload(QuoteOption.items),
    )
    if project_id:
        query = query.filter(Quote.project_id == project_id)
    if status:
        query = query.filter(Quote.status == status)
    quotes = query.order_by(Quote.created_at.desc()).offset(skip).limit(limit).all()
    return quotes


@router.get("/bom-rules-reference")
async def get_bom_rules_reference(
    current_user: User = Depends(get_current_active_user),
):
    """How itemized BOM quantities are derived (for admin / quote UI help)."""
    return full_bom_rules_reference()


@router.get("/{quote_id}/bom-audit")
async def get_quote_bom_audit(
    quote_id: int,
    quote_option_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Compare expected catalog BOM (from sizing) to products and quote lines."""
    return audit_quote(db, quote_id, quote_option_id)


@router.post("/{quote_id}/fix-bom")
async def fix_quote_bom_endpoint(
    quote_id: int,
    quote_option_id: Optional[int] = Query(None),
    sync_all_options: bool = Query(
        False,
        description="Rebuild BOM on every quote option for this project",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Seed missing catalog SKUs, rebuild BOM from sizing, return audit summary."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    result = fix_quote_bom(
        db,
        quote_id,
        quote_option_id,
        sync_all_options=sync_all_options,
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/{quote_id}/bom-checklist-pdf")
async def get_bom_checklist_pdf(
    quote_id: int,
    quote_option_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Site handover checklist PDF with tick boxes per BOM line."""
    try:
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        pdf_bytes = generate_bom_checklist_pdf(db, quote_id, quote_option_id)
        filename = f"bom_checklist_{quote.quote_number}.pdf"
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import logging

        logging.getLogger(__name__).error(
            "BOM checklist PDF failed for quote %s: %s", quote_id, e, exc_info=True
        )
        raise HTTPException(status_code=500, detail=f"Error generating checklist PDF: {e}")


@router.get("/{quote_id}", response_model=QuoteSchema)
async def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific quote"""
    quote = db.query(Quote).options(
        joinedload(Quote.items),
        joinedload(Quote.options).joinedload(QuoteOption.items),
        joinedload(Quote.project).joinedload(Project.customer),
    ).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    refresh_quote_header_totals(db, quote_id)
    db.commit()
    db.refresh(quote)
    return quote


@router.get("/{quote_id}/pdf")
async def get_quote_pdf(
    quote_id: int,
    document_type: str = "quotation",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate and download quote PDF. Use document_type=proforma_invoice for Proforma Invoice (includes bank details)."""
    try:
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail=f"Quote {quote_id} not found")
        pdf_bytes = generate_quotation_pdf(db, quote_id, document_type=document_type or "quotation")
        is_proforma = (document_type or "").strip().lower() == "proforma_invoice"
        filename = f"proforma_invoice_{quote.quote_number}.pdf" if is_proforma else f"quotation_{quote.quote_number}.pdf"

        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error generating PDF for quote {quote_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")


@router.post("/{quote_id}/send-email")
async def send_quote_email(
    quote_id: int,
    recipient_email: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Send quote PDF via email"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    project = db.query(Project).filter(Project.id == quote.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    customer = db.query(Customer).filter(Customer.id == project.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate PDF
    pdf_bytes = generate_quotation_pdf(db, quote_id)
    
    # Send email
    success = send_quotation_email(quote, customer, pdf_bytes, recipient_email)
    
    if success:
        # Update quote tracking
        quote.emailed_at = datetime.utcnow()
        quote.emailed_by = current_user.id
        quote.status = "sent"
        db.commit()
        return {"message": "Email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email. Check SMTP configuration.")


@router.post("/", response_model=QuoteSchema, status_code=status.HTTP_201_CREATED)
async def create_quote(
    quote_data: QuoteCreate,
    auto_generate_items: bool = True,
    auto_append_catalog_bom: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new quote"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == quote_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate quote number
    quote_number = f"QT-{uuid.uuid4().hex[:8].upper()}"
    
    # Get default tax and discount from settings
    default_tax_setting = db.query(Setting).filter(Setting.key == "default_tax_percent").first()
    default_discount_setting = db.query(Setting).filter(Setting.key == "default_discount_percent").first()
    
    default_tax_percent = float(default_tax_setting.value) if default_tax_setting else 0.0
    default_discount_percent = float(default_discount_setting.value) if default_discount_setting else 0.0
    
    # Create quote
    # Convert Pydantic model to dict (handle both v1 and v2)
    try:
        quote_dict = quote_data.model_dump(exclude_unset=True)
    except AttributeError:
        quote_dict = quote_data.dict(exclude_unset=True)
    
    # Apply default tax and discount if not provided
    if "tax_percent" not in quote_dict or quote_dict.get("tax_percent") is None:
        quote_dict["tax_percent"] = default_tax_percent
    if "discount_percent" not in quote_dict or quote_dict.get("discount_percent") is None:
        quote_dict["discount_percent"] = default_discount_percent
    
    db_quote = Quote(
        **quote_dict,
        quote_number=quote_number,
        created_by=current_user.id
    )
    db.add(db_quote)
    db.flush()  # Get the ID

    default_option = QuoteOption(quote_id=db_quote.id, title="Option 1", sort_order=0)
    db.add(default_option)
    db.flush()

    # Auto-generate items from sizing if requested
    if auto_generate_items:
        sizing_result = db.query(SizingResultModel).filter(
            SizingResultModel.project_id == quote_data.project_id
        ).first()

        if sizing_result:
            import logging

            logger = logging.getLogger(__name__)
            logger.info(
                f"Generating quote items for sizing result: project_id={sizing_result.project_id}, "
                f"panels={sizing_result.number_of_panels}, inverter={sizing_result.inverter_size_kw}"
            )

            items = generate_quote_items_from_sizing(
                db, sizing_result, db_quote.id, default_option.id
            )
            logger.info(f"Generated {len(items)} quote items")

            for item in items:
                db.add(item)
                logger.info(
                    f"Added item: {item.description}, qty={item.quantity}, price={item.unit_price}, total={item.total_price}"
                )

            bom_setting = db.query(Setting).filter(Setting.key == "append_catalog_bom_on_quote").first()
            bom_enabled = (
                auto_append_catalog_bom
                and (not bom_setting or str(bom_setting.value).strip().lower() not in ("0", "false", "no"))
            )
            if bom_enabled:
                next_so = max((i.sort_order for i in items), default=-1) + 1
                n_extra = append_standard_bom_from_catalog(
                    db,
                    db_quote.id,
                    default_option.id,
                    project.system_type,
                    sizing_result,
                    start_sort_order=next_so,
                )
                if n_extra:
                    logger.info(f"Appended {n_extra} catalog BOM line(s) after sizing items")
        else:
            import logging

            logger = logging.getLogger(__name__)
            logger.warning(f"No sizing result found for project_id={quote_data.project_id}")

    db.flush()
    refresh_quote_header_totals(db, db_quote.id)
    db.commit()
    db.refresh(db_quote)
    return db_quote


@router.put("/{quote_id}", response_model=QuoteSchema)
async def update_quote(
    quote_id: int,
    quote_data: QuoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a quote"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    try:
        update_data = quote_data.model_dump(exclude_unset=True)
    except AttributeError:
        update_data = quote_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(quote, field, value)

    if any(k in update_data for k in ("tax_percent", "discount_percent")):
        refresh_quote_header_totals(db, quote_id)

    db.commit()
    db.refresh(quote)
    return quote


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a quote"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    db.delete(quote)
    db.commit()
    return None


@router.post("/{quote_id}/items", response_model=QuoteItemSchema, status_code=status.HTTP_201_CREATED)
async def add_quote_item(
    quote_id: int,
    item_data: QuoteItemAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Add an item to a quote option (defaults to first option)."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    try:
        payload = item_data.model_dump(exclude_unset=True)
    except AttributeError:
        payload = item_data.dict()

    opt_id = payload.pop("quote_option_id", None) or get_primary_quote_option_id(db, quote_id)
    if not opt_id:
        raise HTTPException(status_code=400, detail="Quote has no options; create a quote again or add an option.")

    db_item = QuoteItem(
        quote_id=quote_id,
        quote_option_id=opt_id,
        product_id=payload.get("product_id"),
        description=payload["description"],
        quantity=payload["quantity"],
        unit_price=payload["unit_price"],
        total_price=payload["total_price"],
        is_custom=payload.get("is_custom", False),
        sort_order=payload.get("sort_order", 0),
    )
    db.add(db_item)
    db.flush()

    _finalize_quote_item_change(db, quote_id, opt_id, db_item)

    db.refresh(db_item)
    return db_item


@router.post("/{quote_id}/rebuild-bom")
async def rebuild_quote_bom(
    quote_id: int,
    quote_option_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Rebuild catalog BOM lines from project sizing + current panel/inverter/battery on quote."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    project = db.query(Project).filter(Project.id == quote.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    opt_id = quote_option_id or get_primary_quote_option_id(db, quote_id)
    if not opt_id:
        raise HTTPException(status_code=400, detail="Quote has no options")

    added = rebuild_catalog_bom_for_option(
        db, quote_id, opt_id, project.id, project.system_type
    )
    refresh_quote_header_totals(db, quote_id)
    db.commit()
    db.refresh(quote)
    return {"lines_added": added, "quote": quote}


@router.put("/{quote_id}/items/{item_id}", response_model=QuoteItemSchema)
async def update_quote_item(
    quote_id: int,
    item_id: int,
    item_data: QuoteItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a quote item"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    item = db.query(QuoteItem).filter(QuoteItem.id == item_id, QuoteItem.quote_id == quote_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Quote item not found")

    try:
        update_data = item_data.model_dump(exclude_unset=True)
    except AttributeError:
        update_data = item_data.dict(exclude_unset=True)

    if "quantity" in update_data or "unit_price" in update_data:
        quantity = update_data.get("quantity", item.quantity)
        unit_price = update_data.get("unit_price", item.unit_price)
        update_data["total_price"] = quantity * unit_price

    for field, value in update_data.items():
        setattr(item, field, value)

    db.flush()

    _finalize_quote_item_change(db, quote_id, item.quote_option_id, item)

    db.refresh(item)
    return item


@router.delete("/{quote_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote_item(
    quote_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a quote item"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    item = db.query(QuoteItem).filter(QuoteItem.id == item_id, QuoteItem.quote_id == quote_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Quote item not found")

    option_id = item.quote_option_id
    triggers_bom = item_triggers_catalog_bom_rebuild(db, item)
    triggers_legacy = _item_triggers_bos_recalc(db, item)

    db.delete(item)
    db.flush()

    if triggers_bom and option_id:
        quote = db.query(Quote).filter(Quote.id == quote_id).first()
        project = (
            db.query(Project).filter(Project.id == quote.project_id).first()
            if quote
            else None
        )
        if quote and project:
            rebuild_catalog_bom_for_option(
                db, quote_id, option_id, project.id, project.system_type
            )
            refresh_quote_header_totals(db, quote_id)
            db.commit()
    elif triggers_legacy and option_id:
        recalculate_dependent_items(db, quote_id, option_id)
    else:
        refresh_quote_header_totals(db, quote_id)
        db.commit()
    return None


class PercentageUpdate(BaseModel):
    percentage: float


@router.put("/{quote_id}/update-percentage", response_model=QuoteSchema)
async def update_quote_percentage(
    quote_id: int,
    item_type: str,
    percentage_data: PercentageUpdate,
    quote_option_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update BOS or Installation percentage for one quote option."""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    opt_id = quote_option_id or get_primary_quote_option_id(db, quote_id)
    if not opt_id:
        raise HTTPException(status_code=400, detail="No quote options found")

    all_items = (
        db.query(QuoteItem)
        .filter(QuoteItem.quote_id == quote_id, QuoteItem.quote_option_id == opt_id)
        .all()
    )

    target_item = None
    if item_type.lower() == "bos":
        if not use_bos_percentage_pricing(db):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Lump-sum BOS % pricing is disabled. BOS is itemized from the product catalog "
                    "(cables, breakers, rails, etc.). Edit those line items directly."
                ),
            )
        for it in all_items:
            if "BOS" in it.description.upper() or "Balance of System" in it.description:
                target_item = it
                break
    elif item_type.lower() == "installation":
        for it in all_items:
            if "Installation" in it.description and "Transport" not in it.description:
                target_item = it
                break
    else:
        raise HTTPException(status_code=400, detail="item_type must be 'bos' or 'installation'")

    if not target_item:
        raise HTTPException(status_code=404, detail=f"{item_type} item not found for this option")

    percentage = percentage_data.percentage
    if item_type.lower() == "bos":
        target_item.description = f"Balance of System (BOS) - {percentage:.1f}% of equipment"
    else:
        target_item.description = f"Installation ({percentage:.1f}% of total equipment cost)"

    recalculate_dependent_items(db, quote_id, opt_id)

    db.refresh(quote)
    return quote


@router.post(
    "/{quote_id}/options",
    response_model=QuoteOptionSchema,
    status_code=status.HTTP_201_CREATED,
)
async def add_quote_option(
    quote_id: int,
    body: QuoteOptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    max_so = (
        db.query(func.max(QuoteOption.sort_order)).filter(QuoteOption.quote_id == quote_id).scalar()
    )
    next_order = (max_so if max_so is not None else -1) + 1

    try:
        fields = body.model_dump(exclude_unset=True)
    except AttributeError:
        fields = body.dict(exclude_unset=True)  # type: ignore[union-attr]

    opt = QuoteOption(
        quote_id=quote_id,
        title=fields.get("title", f"Option {next_order + 1}"),
        narrative=fields.get("narrative"),
        sort_order=fields.get("sort_order", next_order),
    )
    db.add(opt)
    db.commit()
    db.refresh(opt)
    return opt


@router.patch("/{quote_id}/options/{option_id}", response_model=QuoteOptionSchema)
async def update_quote_option(
    quote_id: int,
    option_id: int,
    body: QuoteOptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    opt = (
        db.query(QuoteOption)
        .filter(QuoteOption.id == option_id, QuoteOption.quote_id == quote_id)
        .first()
    )
    if not opt:
        raise HTTPException(status_code=404, detail="Quote option not found")

    try:
        data = body.model_dump(exclude_unset=True)
    except AttributeError:
        data = body.dict(exclude_unset=True)

    for k, v in data.items():
        setattr(opt, k, v)
    db.commit()
    db.refresh(opt)
    return opt


@router.delete("/{quote_id}/options/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote_option(
    quote_id: int,
    option_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    count = db.query(QuoteOption).filter(QuoteOption.quote_id == quote_id).count()
    if count <= 1:
        raise HTTPException(status_code=400, detail="Cannot delete the only option on a quote")

    opt = (
        db.query(QuoteOption)
        .filter(QuoteOption.id == option_id, QuoteOption.quote_id == quote_id)
        .first()
    )
    if not opt:
        raise HTTPException(status_code=404, detail="Quote option not found")

    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if quote and quote.accepted_quote_option_id == option_id:
        quote.accepted_quote_option_id = None

    db.delete(opt)
    db.flush()
    refresh_quote_header_totals(db, quote_id)
    db.commit()
    return None
