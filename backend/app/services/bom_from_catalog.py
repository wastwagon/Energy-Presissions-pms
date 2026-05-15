"""
Append standard balance-of-system line items from the product catalog after sizing-based quote lines.

Uses SKUs aligned with `seed_proforma_catalog_items.py`. Missing SKUs are skipped (no error).
Does not duplicate mounting / %-BOS / transport / installation — those remain from `generate_quote_items_from_sizing`.

When ``mounting_rails_estimate`` is provided and catalog SKU ``MNT-RAIL-18FT`` exists, one BOM line is appended
(quantity = estimate) for per-stick rail pricing.
"""
from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models import Product, QuoteItem, SystemType


# (SKU, default quantity or None to derive from panel count)
_STANDARD_BOM: List[Tuple[str, Optional[float]]] = [
    ("BOS-PV-CLAMP-EA", None),  # qty ≈ round(panels * 3.5) — proforma-scale clamps
    ("CAB-RR10MM-100M", 2.0),
    ("CAB-PV-4MM-100M", 4.0),
    ("CAB-BATT-35MM-M", 20.0),
    ("PRT-DC63-2P", 2.0),
    ("PRT-AC100-1P", 2.0),
    ("PRT-CO-100A", 1.0),
    ("BOX-DB-6WAY", 1.0),
    ("BOX-DB-13WAY", 2.0),
    ("PRT-SPD-500V", 1.0),
    ("PRT-MCCB-250A", 2.0),
    ("KIT-MISC-BOS", 1.0),
]


def _clamp_quantity(panel_count: int) -> float:
    if panel_count <= 0:
        return 1.0
    return max(1.0, float(round(panel_count * 3.5)))


def append_standard_bom_from_catalog(
    db: Session,
    quote_id: int,
    quote_option_id: int,
    system_type: SystemType,
    number_of_panels: int,
    start_sort_order: int = 0,
    mounting_rails_estimate: Optional[int] = None,
) -> int:
    """
    Insert catalog BOM lines for hybrid / off-grid quotes. Returns number of lines added.

    ``start_sort_order`` should be the next free ``sort_order`` after sizing lines (those rows
    may not be flushed yet, so callers pass max(sort_order)+1 from the in-memory item list).
    """
    if system_type not in (SystemType.HYBRID, SystemType.OFF_GRID):
        return 0

    sort_order = start_sort_order

    added = 0
    for sku, default_qty in _STANDARD_BOM:
        product = (
            db.query(Product)
            .filter(Product.sku == sku, Product.is_active.is_(True))
            .first()
        )
        if not product:
            continue

        qty = default_qty if default_qty is not None else _clamp_quantity(number_of_panels)
        if qty <= 0:
            continue

        unit = float(product.base_price or 0.0)
        line_desc = (product.name or product.model or sku).strip()
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

    if mounting_rails_estimate and mounting_rails_estimate > 0:
        rail_product = (
            db.query(Product)
            .filter(Product.sku == "MNT-RAIL-18FT", Product.is_active.is_(True))
            .first()
        )
        if rail_product:
            qty = float(mounting_rails_estimate)
            unit = float(rail_product.base_price or 0.0)
            label = (rail_product.name or rail_product.model or "MNT-RAIL-18FT").strip()
            db.add(
                QuoteItem(
                    quote_id=quote_id,
                    quote_option_id=quote_option_id,
                    product_id=rail_product.id,
                    description=label,
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
