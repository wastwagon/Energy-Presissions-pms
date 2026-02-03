from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Quote, QuoteItem, Project, Product, SizingResult as SizingResultModel, Customer
from app.schemas import Quote as QuoteSchema, QuoteCreate, QuoteUpdate, QuoteItem as QuoteItemSchema, QuoteItemUpdate
from app.services.pricing import generate_quote_items_from_sizing
from app.services.pdf_generator import generate_quotation_pdf
from app.services.email_service import send_quotation_email
from app.services.quote_recalculator import recalculate_dependent_items
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/quotes", tags=["quotes"])


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
    from sqlalchemy.orm import joinedload
    query = db.query(Quote).options(joinedload(Quote.items))
    if project_id:
        query = query.filter(Quote.project_id == project_id)
    if status:
        query = query.filter(Quote.status == status)
    quotes = query.order_by(Quote.created_at.desc()).offset(skip).limit(limit).all()
    return quotes


@router.get("/{quote_id}", response_model=QuoteSchema)
async def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific quote"""
    from sqlalchemy.orm import joinedload
    quote = db.query(Quote).options(
        joinedload(Quote.items),
        joinedload(Quote.project).joinedload(Project.customer)
    ).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
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
    from app.models import Setting
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
    
    # Auto-generate items from sizing if requested
    if auto_generate_items:
        sizing_result = db.query(SizingResultModel).filter(
            SizingResultModel.project_id == quote_data.project_id
        ).first()
        
        if sizing_result:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Generating quote items for sizing result: project_id={sizing_result.project_id}, panels={sizing_result.number_of_panels}, inverter={sizing_result.inverter_size_kw}")
            
            items = generate_quote_items_from_sizing(db, sizing_result, db_quote.id)
            logger.info(f"Generated {len(items)} quote items")
            
            for item in items:
                db.add(item)
                logger.info(f"Added item: {item.description}, qty={item.quantity}, price={item.unit_price}, total={item.total_price}")
            
            # Calculate totals - categorize items by product type
            equipment_subtotal = 0
            services_subtotal = 0
            
            for item in items:
                if item.product_id:
                    product = db.query(Product).filter(Product.id == item.product_id).first()
                    if product and product.product_type.value in ["panel", "inverter", "battery", "mounting"]:
                        # Equipment: panels, inverters, batteries, mounting structures
                        equipment_subtotal += item.total_price
                    else:
                        # Services: BOS, installation, transport, etc.
                        services_subtotal += item.total_price
                else:
                    # Items without product_id (using settings) are services
                    # Check description to categorize
                    desc_lower = item.description.lower()
                    if any(keyword in desc_lower for keyword in ["bos", "balance of system", "installation", "transport", "logistics", "maintenance"]):
                        services_subtotal += item.total_price
                    else:
                        # Default to services if unclear
                        services_subtotal += item.total_price
            
            db_quote.equipment_subtotal = equipment_subtotal
            db_quote.services_subtotal = services_subtotal
            
            # Calculate tax and discount amounts
            subtotal = equipment_subtotal + services_subtotal
            tax_percent = db_quote.tax_percent or 0.0
            discount_percent = db_quote.discount_percent or 0.0
            tax_amount = subtotal * (tax_percent / 100) if tax_percent else 0
            discount_amount = subtotal * (discount_percent / 100) if discount_percent else 0
            db_quote.tax_amount = tax_amount
            db_quote.discount_amount = discount_amount
            db_quote.grand_total = subtotal + tax_amount - discount_amount
            
            logger.info(f"Quote totals: equipment={equipment_subtotal}, services={services_subtotal}, tax={tax_amount}, discount={discount_amount}, grand={db_quote.grand_total}")
        else:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"No sizing result found for project_id={quote_data.project_id}")
    
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
    
    update_data = quote_data.dict(exclude_unset=True)
    
    # Recalculate totals if tax or discount changed
    if "tax_percent" in update_data or "discount_percent" in update_data:
        tax_percent = update_data.get("tax_percent", quote.tax_percent) or 0
        discount_percent = update_data.get("discount_percent", quote.discount_percent) or 0
        
        subtotal = quote.equipment_subtotal + quote.services_subtotal
        tax_amount = subtotal * (tax_percent / 100) if tax_percent else 0
        discount_amount = subtotal * (discount_percent / 100) if discount_percent else 0
        grand_total = subtotal + tax_amount - discount_amount
        
        update_data["tax_percent"] = tax_percent
        update_data["discount_percent"] = discount_percent
        update_data["tax_amount"] = tax_amount
        update_data["discount_amount"] = discount_amount
        update_data["grand_total"] = grand_total
    
    for field, value in update_data.items():
        setattr(quote, field, value)
    
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
    item_data: QuoteItemSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add an item to a quote"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    db_item = QuoteItem(
        quote_id=quote_id,
        **item_data.dict(exclude={"id", "quote_id", "created_at"})
    )
    db.add(db_item)
    
    # Update quote totals
    if item_data.product_id:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if product and product.product_type.value in ["panel", "inverter", "battery"]:
            quote.equipment_subtotal += item_data.total_price
        else:
            quote.services_subtotal += item_data.total_price
    else:
        quote.services_subtotal += item_data.total_price
    
    # Recalculate grand total
    subtotal = quote.equipment_subtotal + quote.services_subtotal
    tax_amount = subtotal * (quote.tax_percent / 100)
    discount_amount = subtotal * (quote.discount_percent / 100)
    quote.tax_amount = tax_amount
    quote.discount_amount = discount_amount
    quote.grand_total = subtotal + tax_amount - discount_amount
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{quote_id}/items/{item_id}", response_model=QuoteItemSchema)
async def update_quote_item(
    quote_id: int,
    item_id: int,
    item_data: QuoteItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a quote item"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    item = db.query(QuoteItem).filter(QuoteItem.id == item_id, QuoteItem.quote_id == quote_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Quote item not found")
    
    # Store old total for recalculation
    old_total = item.total_price
    old_is_equipment = False
    if item.product_id:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.product_type.value in ["panel", "inverter", "battery"]:
            old_is_equipment = True
    
    # Update item fields (only provided fields)
    update_data = item_data.dict(exclude_unset=True)
    
    # Recalculate total_price if quantity or unit_price changed
    if "quantity" in update_data or "unit_price" in update_data:
        quantity = update_data.get("quantity", item.quantity)
        unit_price = update_data.get("unit_price", item.unit_price)
        update_data["total_price"] = quantity * unit_price
    
    for field, value in update_data.items():
        setattr(item, field, value)
    
    # Update quote totals
    new_total = item.total_price
    diff = new_total - old_total
    
    if old_is_equipment:
        quote.equipment_subtotal += diff
    else:
        quote.services_subtotal += diff
    
    # If an equipment item changed, recalculate BOS and Installation
    if old_is_equipment:
        recalculate_dependent_items(db, quote_id)
    else:
        # Recalculate grand total for non-equipment items
        subtotal = quote.equipment_subtotal + quote.services_subtotal
        tax_amount = subtotal * (quote.tax_percent / 100)
        discount_amount = subtotal * (quote.discount_percent / 100)
        quote.tax_amount = tax_amount
        quote.discount_amount = discount_amount
        quote.grand_total = subtotal + tax_amount - discount_amount
        db.commit()
    
    db.refresh(item)
    return item


@router.delete("/{quote_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote_item(
    quote_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a quote item"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    item = db.query(QuoteItem).filter(QuoteItem.id == item_id, QuoteItem.quote_id == quote_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Quote item not found")
    
    # Determine if it's equipment or service
    is_equipment = False
    if item.product_id:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.product_type.value in ["panel", "inverter", "battery"]:
            is_equipment = True
    
    # Update quote totals
    if is_equipment:
        quote.equipment_subtotal -= item.total_price
        # Recalculate BOS and Installation if equipment item deleted
        recalculate_dependent_items(db, quote_id)
    else:
        quote.services_subtotal -= item.total_price
        # Recalculate grand total for non-equipment items
        subtotal = quote.equipment_subtotal + quote.services_subtotal
        tax_amount = subtotal * (quote.tax_percent / 100)
        discount_amount = subtotal * (quote.discount_percent / 100)
        quote.tax_amount = tax_amount
        quote.discount_amount = discount_amount
        quote.grand_total = subtotal + tax_amount - discount_amount
    
    db.delete(item)
    db.commit()
    return None


class PercentageUpdate(BaseModel):
    percentage: float


@router.put("/{quote_id}/update-percentage", response_model=QuoteSchema)
async def update_quote_percentage(
    quote_id: int,
    item_type: str,  # "bos" or "installation"
    percentage_data: PercentageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update BOS or Installation percentage for a quote"""
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Get all quote items
    all_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    
    # Find BOS or Installation item
    target_item = None
    if item_type.lower() == "bos":
        for item in all_items:
            if "BOS" in item.description.upper() or "Balance of System" in item.description:
                target_item = item
                break
    elif item_type.lower() == "installation":
        for item in all_items:
            if "Installation" in item.description and "Transport" not in item.description:
                target_item = item
                break
    else:
        raise HTTPException(status_code=400, detail="item_type must be 'bos' or 'installation'")
    
    if not target_item:
        raise HTTPException(status_code=404, detail=f"{item_type} item not found in quote")
    
    # Update description with new percentage
    percentage = percentage_data.percentage
    if item_type.lower() == "bos":
        target_item.description = f"Balance of System (BOS) - {percentage:.1f}% of equipment"
    else:  # installation
        target_item.description = f"Installation ({percentage:.1f}% of total equipment cost)"
    
    # Recalculate the item and dependent items
    recalculate_dependent_items(db, quote_id)
    
    db.commit()
    db.refresh(quote)
    return quote
