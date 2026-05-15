"""
Sync itemized catalog BOM with sizing / core quote equipment (panels, inverter, battery).

When those drivers change, catalog line quantities are rebuilt and quote totals refreshed.
"""
from __future__ import annotations

from copy import copy
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Product, ProductType, Project, QuoteItem, SizingResult as SizingResultModel, SystemType
from app.services.bom_from_catalog import _BOM_SKU_ORDER, append_standard_bom_from_catalog
from app.services.bom_quantities import _dc_string_count, catalog_bom_append_enabled


def derive_effective_sizing_from_quote(
    db: Session,
    project_id: int,
    quote_id: int,
    quote_option_id: int,
) -> Optional[SizingResultModel]:
    """
    Start from project sizing, then override counts from current quote core lines
    so editing panel/inverter/battery qty on the quote updates BOM drivers.
    """
    base = (
        db.query(SizingResultModel)
        .filter(SizingResultModel.project_id == project_id)
        .first()
    )
    if not base:
        return None

    effective = copy(base)
    items = (
        db.query(QuoteItem)
        .filter(
            QuoteItem.quote_id == quote_id,
            QuoteItem.quote_option_id == quote_option_id,
        )
        .all()
    )

    panel_qty = 0
    inv_count = 0
    inv_unit_kw: Optional[float] = None
    battery_kwh = 0.0

    for item in items:
        if not item.product_id:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        ptype = product.product_type.value

        if ptype == ProductType.PANEL.value:
            panel_qty = int(item.quantity or 0)
            if product.wattage:
                effective.panel_wattage = product.wattage
            if product.brand:
                effective.panel_brand = product.brand
        elif ptype == ProductType.INVERTER.value:
            inv_count = int(item.quantity or 1)
            unit_kw = float(product.capacity_kw or item.unit_price or 0)
            if unit_kw > 0:
                inv_unit_kw = unit_kw
        elif ptype == ProductType.BATTERY.value:
            cap = float(product.capacity_kwh or 0)
            if cap > 0:
                battery_kwh += cap * float(item.quantity or 0)

    if panel_qty > 0:
        effective.number_of_panels = panel_qty
        effective.dc_string_count = _dc_string_count(db, effective)
        if effective.panel_wattage:
            effective.system_size_kw = round(
                (panel_qty * effective.panel_wattage) / 1000.0, 2
            )
    if inv_count > 0:
        effective.inverter_count = inv_count
    if inv_unit_kw:
        effective.inverter_unit_size_kw = inv_unit_kw
        effective.inverter_size_kw = round(inv_unit_kw * inv_count, 2) if inv_count > 1 else inv_unit_kw
    if battery_kwh > 0:
        effective.battery_capacity_kwh = round(battery_kwh, 1)

    return effective


def _delete_catalog_bom_lines(
    db: Session, quote_id: int, quote_option_id: int
) -> int:
    removed = 0
    items = (
        db.query(QuoteItem)
        .filter(
            QuoteItem.quote_id == quote_id,
            QuoteItem.quote_option_id == quote_option_id,
        )
        .all()
    )
    bom_skus = set(_BOM_SKU_ORDER)
    for item in items:
        if not item.product_id:
            continue
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.sku in bom_skus:
            db.delete(item)
            removed += 1
    if removed:
        db.flush()
    return removed


def rebuild_catalog_bom_for_option(
    db: Session,
    quote_id: int,
    quote_option_id: int,
    project_id: int,
    system_type: SystemType,
) -> int:
    """Remove and re-append catalog BOM lines from effective sizing. Returns lines added."""
    if not catalog_bom_append_enabled(db):
        return 0

    effective = derive_effective_sizing_from_quote(
        db, project_id, quote_id, quote_option_id
    )
    if not effective:
        return 0

    _delete_catalog_bom_lines(db, quote_id, quote_option_id)

    existing = (
        db.query(QuoteItem)
        .filter(
            QuoteItem.quote_id == quote_id,
            QuoteItem.quote_option_id == quote_option_id,
        )
        .all()
    )
    next_so = max((i.sort_order for i in existing), default=-1) + 1

    return append_standard_bom_from_catalog(
        db,
        quote_id,
        quote_option_id,
        system_type,
        effective,
        start_sort_order=next_so,
    )


def sync_all_quote_boms_for_project(db: Session, project_id: int) -> dict:
    """
    Rebuild catalog BOM on every quote option for a project (after sizing changes).
    Returns counts for API feedback.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {"quotes": 0, "options_updated": 0, "lines_added": 0}

    from app.models import Quote

    quotes = db.query(Quote).filter(Quote.project_id == project_id).all()
    options_updated = 0
    lines_added = 0

    for quote in quotes:
        from app.models import QuoteOption

        options = db.query(QuoteOption).filter(QuoteOption.quote_id == quote.id).all()
        if not options:
            continue
        for opt in options:
            added = rebuild_catalog_bom_for_option(
                db, quote.id, opt.id, project.id, project.system_type
            )
            if added >= 0:
                options_updated += 1
                lines_added += added
        from app.services.quote_totals import refresh_quote_header_totals

        refresh_quote_header_totals(db, quote.id)

    if options_updated:
        db.commit()

    return {
        "quotes": len(quotes),
        "options_updated": options_updated,
        "lines_added": lines_added,
    }


def item_triggers_catalog_bom_rebuild(db: Session, item: QuoteItem) -> bool:
    """Core equipment drives catalog BOM; manual edits to catalog SKUs do not."""
    if item.product_id:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.product_type.value in (
            ProductType.PANEL.value,
            ProductType.INVERTER.value,
            ProductType.BATTERY.value,
        ):
            return True
    return False
