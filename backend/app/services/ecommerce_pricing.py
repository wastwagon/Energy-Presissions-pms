"""
Single source for "one catalog unit" price on the shop and in orders.
Aligns with quote line logic in pricing.py for panels, inverters, and batteries.
"""
from typing import Optional

from app.models import Product


def catalog_unit_price_from_fields(
    base_price: float,
    price_type: Optional[str],
    wattage: Optional[int] = None,
    capacity_kw: Optional[float] = None,
    capacity_kwh: Optional[float] = None,
) -> float:
    """Price for quantity 1 of this SKU."""
    pt = (price_type or "fixed").lower()
    base = float(base_price or 0)

    if pt == "per_panel":
        return base
    if pt == "per_watt":
        w = wattage or 0
        if w:
            return base * (w / 1000.0)
        return base
    if pt == "per_kw":
        kw = capacity_kw or 0
        if kw:
            return base * kw
        return base
    if pt == "per_kwh":
        kwh = capacity_kwh or 0
        if kwh:
            return base * kwh
        return base
    if pt == "percentage":
        return base
    return base


def catalog_unit_price(product: Product) -> float:
    return catalog_unit_price_from_fields(
        product.base_price,
        product.price_type,
        product.wattage,
        product.capacity_kw,
        product.capacity_kwh,
    )
