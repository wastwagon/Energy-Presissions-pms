"""
Append standard balance-of-system line items from the product catalog after sizing-based quote lines.

Quantities come from ``bom_quantities.compute_bom_quantities`` (panels, inverter, battery, rails).
Itemized BOS replaces the legacy lump-sum BOS % line (see ``use_bos_percentage`` setting).
"""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models import Product, QuoteItem, SizingResult as SizingResultModel, SystemType
from app.services.bom_quantities import compute_bom_quantities

# Display order for catalog BOM (after core equipment from pricing.py)
_BOM_SKU_ORDER: List[str] = [
    "MNT-RAIL-SET-350",
    "MNT-RAIL-18FT",
    "BOS-ROOF-HOOK-EA",
    "BOS-PV-CLAMP-EA",
    "CAB-PV-4MM-100M",
    "CAB-PV-6MM-100M",
    "BOS-MC4-PAIR",
    "CAB-RR10MM-100M",
    "CAB-AC-6MM-100M",
    "CAB-BATT-50MM-M",
    "CAB-BATT-35MM-M",
    "PRT-DC63-2P",
    "BOS-DC-ISO-32A",
    "PRT-AC100-1P",
    "PRT-AC125-1P",
    "BOS-AC-ISO-40A",
    "PRT-CO-100A",
    "BOX-DB-6WAY",
    "BOX-DB-13WAY",
    "PRT-SPD-500V",
    "PRT-SPD-1000V",
    "PRT-MCCB-250A",
    "BOS-EARTH-KIT",
    "BOS-TRUNK-25MM-M",
    "BOS-LABEL-KIT",
    "KIT-MISC-BOS",
    "KIT-MISC-BOS-L",
    "SRV-TRANSPORT-STD",
    "SRV-INSTALL-6000",
    "SRV-INSTALL-8000",
]


def append_standard_bom_from_catalog(
    db: Session,
    quote_id: int,
    quote_option_id: int,
    system_type: SystemType,
    sizing: SizingResultModel,
    start_sort_order: int = 0,
    *,
    number_of_panels: Optional[int] = None,
    mounting_rails_estimate: Optional[int] = None,
) -> int:
    """
    Insert catalog BOM lines for hybrid, off-grid, and grid-tied quotes. Returns number of lines added.

    Prefer passing ``sizing`` (full SizingResult). Legacy kwargs ``number_of_panels`` /
    ``mounting_rails_estimate`` are only used if sizing is incomplete.
    """
    if system_type not in (
        SystemType.HYBRID,
        SystemType.OFF_GRID,
        SystemType.GRID_TIED,
    ):
        return 0

    if sizing.number_of_panels is None and number_of_panels is not None:
        sizing.number_of_panels = number_of_panels
    if sizing.mounting_rails_estimate is None and mounting_rails_estimate is not None:
        sizing.mounting_rails_estimate = mounting_rails_estimate

    qty_map = compute_bom_quantities(db, sizing, system_type=system_type)
    sort_order = start_sort_order
    added = 0

    existing_skus = set()
    for row in (
        db.query(Product.sku)
        .join(QuoteItem, QuoteItem.product_id == Product.id)
        .filter(
            QuoteItem.quote_id == quote_id,
            QuoteItem.quote_option_id == quote_option_id,
            Product.sku.isnot(None),
        )
        .all()
    ):
        if row[0]:
            existing_skus.add(row[0])

    for sku in _BOM_SKU_ORDER:
        qty = qty_map.get(sku)
        if not qty or sku in existing_skus:
            continue

        product = (
            db.query(Product)
            .filter(Product.sku == sku, Product.is_active.is_(True))
            .first()
        )
        if not product:
            continue

        unit = float(product.base_price or 0.0)
        line_desc = (product.name or product.model or sku).strip()
        note = qty_map.notes.get(sku)
        if note:
            line_desc = f"{line_desc} ({note})"

        db.add(
            QuoteItem(
                quote_id=quote_id,
                quote_option_id=quote_option_id,
                product_id=product.id,
                description=line_desc,
                quantity=qty,
                unit_price=unit,
                total_price=round(qty * unit, 2),
                is_custom=False,
                sort_order=sort_order,
            )
        )
        sort_order += 1
        added += 1

    return added
