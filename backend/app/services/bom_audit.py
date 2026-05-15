"""
Audit itemized catalog BOM: expected SKUs vs products in DB vs lines on quote.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import Product, Project, Quote, QuoteItem, QuoteOption, SystemType
from app.services.bom_catalog_usage import RECOMMENDED_MANUAL_LINES
from app.services.bom_from_catalog import _BOM_SKU_ORDER
from app.services.bom_quantities import catalog_bom_append_enabled, compute_bom_quantities
from app.services.bom_sync import derive_effective_sizing_from_quote

_BOM_SKUS = set(_BOM_SKU_ORDER)


def _product_by_sku(db: Session, sku: str) -> Optional[Product]:
    return (
        db.query(Product)
        .filter(Product.sku == sku, Product.is_active.is_(True))
        .first()
    )


def _quote_bom_lines(
    db: Session, quote_id: int, quote_option_id: int
) -> Dict[str, Dict[str, Any]]:
    """SKU on quote → {quantity, item_id, description}."""
    out: Dict[str, Dict[str, Any]] = {}
    items = (
        db.query(QuoteItem)
        .filter(
            QuoteItem.quote_id == quote_id,
            QuoteItem.quote_option_id == quote_option_id,
        )
        .all()
    )
    for item in items:
        if not item.product_id:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.sku:
            continue
        if product.sku not in _BOM_SKUS:
            continue
        out[product.sku] = {
            "quantity": float(item.quantity or 0),
            "item_id": item.id,
            "description": item.description,
        }
    return out


def audit_catalog_bom_for_option(
    db: Session,
    project_id: int,
    system_type: SystemType,
    quote_id: Optional[int] = None,
    quote_option_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Compare computed BOM quantities to catalog products and (optional) quote lines.
    """
    if quote_id and quote_option_id:
        sizing = derive_effective_sizing_from_quote(
            db, project_id, quote_id, quote_option_id
        )
    else:
        from app.models import SizingResult as SizingResultModel

        sizing = (
            db.query(SizingResultModel)
            .filter(SizingResultModel.project_id == project_id)
            .first()
        )

    if not sizing:
        return {
            "ok": False,
            "error": "no_sizing",
            "message": "No sizing result for this project. Run sizing first.",
            "catalog_bom_enabled": catalog_bom_append_enabled(db),
        }

    qty_map = compute_bom_quantities(db, sizing, system_type=system_type)
    expected: Dict[str, float] = dict(qty_map.lines)

    missing_products: List[Dict[str, Any]] = []
    ready_skus: List[Dict[str, Any]] = []

    for sku, qty in sorted(expected.items()):
        product = _product_by_sku(db, sku)
        note = qty_map.notes.get(sku, "")
        if not product:
            missing_products.append(
                {
                    "sku": sku,
                    "expected_qty": qty,
                    "note": note,
                    "fix": "Run: python -m app.scripts.seed_proforma_catalog_items",
                }
            )
        else:
            ready_skus.append(
                {
                    "sku": sku,
                    "expected_qty": qty,
                    "unit_price": float(product.base_price or 0),
                    "product_name": product.name,
                    "note": note,
                }
            )

    result: Dict[str, Any] = {
        "ok": len(missing_products) == 0,
        "catalog_bom_enabled": catalog_bom_append_enabled(db),
        "project_id": project_id,
        "quote_id": quote_id,
        "quote_option_id": quote_option_id,
        "sizing_snapshot": {
            "panels": sizing.number_of_panels,
            "system_kw": sizing.system_size_kw,
            "dc_string_count": getattr(sizing, "dc_string_count", None),
            "inverter_kw": sizing.inverter_size_kw,
            "battery_kwh": sizing.battery_capacity_kwh,
        },
        "expected_line_count": len(expected),
        "missing_products": missing_products,
        "ready_skus": ready_skus,
        "recommended_manual_lines": RECOMMENDED_MANUAL_LINES,
    }

    if not quote_id or not quote_option_id:
        return result

    on_quote = _quote_bom_lines(db, quote_id, quote_option_id)
    missing_on_quote: List[Dict[str, Any]] = []
    qty_mismatch: List[Dict[str, Any]] = []
    stale_on_quote: List[Dict[str, Any]] = []

    missing_sku_set = {m["sku"] for m in missing_products}

    for sku, exp_qty in expected.items():
        if sku in missing_sku_set:
            continue
        line = on_quote.get(sku)
        if not line:
            missing_on_quote.append(
                {"sku": sku, "expected_qty": exp_qty, "note": qty_map.notes.get(sku, "")}
            )
        elif abs(line["quantity"] - exp_qty) > 0.01:
            qty_mismatch.append(
                {
                    "sku": sku,
                    "expected_qty": exp_qty,
                    "quote_qty": line["quantity"],
                    "item_id": line["item_id"],
                }
            )

    for sku, line in on_quote.items():
        if sku not in expected:
            stale_on_quote.append(
                {
                    "sku": sku,
                    "quote_qty": line["quantity"],
                    "item_id": line["item_id"],
                    "description": line["description"],
                }
            )

    result["on_quote_count"] = len(on_quote)
    result["missing_on_quote"] = missing_on_quote
    result["qty_mismatch"] = qty_mismatch
    result["stale_on_quote"] = stale_on_quote
    result["ok"] = (
        result["ok"]
        and not missing_on_quote
        and not qty_mismatch
    )
    result["message"] = _audit_message(result)
    return result


def _audit_message(audit: Dict[str, Any]) -> str:
    parts = []
    n = len(audit.get("missing_products") or [])
    if n:
        parts.append(f"{n} SKU(s) missing from product catalog")
    n = len(audit.get("missing_on_quote") or [])
    if n:
        parts.append(f"{n} expected BOM line(s) not on quote")
    n = len(audit.get("qty_mismatch") or [])
    if n:
        parts.append(f"{n} quantity mismatch(es)")
    n = len(audit.get("stale_on_quote") or [])
    if n:
        parts.append(f"{n} stale BOM line(s) on quote (rebuild recommended)")
    if not parts:
        return "BOM matches sizing and catalog."
    return "; ".join(parts) + "."


def audit_quote(
    db: Session,
    quote_id: int,
    quote_option_id: Optional[int] = None,
) -> Dict[str, Any]:
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        return {"ok": False, "error": "quote_not_found"}
    project = db.query(Project).filter(Project.id == quote.project_id).first()
    if not project:
        return {"ok": False, "error": "project_not_found"}

    from app.services.quote_totals import get_primary_quote_option_id

    opt_id = quote_option_id or get_primary_quote_option_id(db, quote_id)
    if not opt_id:
        return {"ok": False, "error": "no_quote_option"}

    audit = audit_catalog_bom_for_option(
        db,
        project.id,
        project.system_type,
        quote_id=quote_id,
        quote_option_id=opt_id,
    )
    audit["quote_number"] = quote.quote_number
    return audit


def audit_project_bom_preview(db: Session, project_id: int) -> Dict[str, Any]:
    """Expected BOM from sizing only (no quote comparison)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {"ok": False, "error": "project_not_found"}
    return audit_catalog_bom_for_option(
        db, project_id, project.system_type
    )
