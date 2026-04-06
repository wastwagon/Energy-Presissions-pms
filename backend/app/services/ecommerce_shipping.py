"""Server-side shipping calculation for checkout (single source of truth)."""
from app.config import settings


def compute_shipping_cost(subtotal: float) -> float:
    """
    If subtotal meets free-shipping threshold, shipping is 0; else flat rate.
    Threshold <= 0 or unset (None) disables the free-shipping rule.
    """
    threshold = settings.ECOMMERCE_FREE_SHIPPING_THRESHOLD_GHS
    if threshold is not None and float(threshold) > 0 and subtotal >= float(threshold):
        return 0.0
    return float(settings.ECOMMERCE_SHIPPING_FLAT_GHS or 0.0)
