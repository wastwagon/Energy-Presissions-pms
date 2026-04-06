"""
Server-side coupon discount for checkout orders. Never trust client discount_amount.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models_ecommerce import Coupon


def _utc_now():
    return datetime.now(timezone.utc)


def compute_order_coupon_discount(
    db: Session,
    code: Optional[str],
    subtotal: float,
) -> Tuple[float, Optional[Coupon]]:
    """
    Returns (discount_amount, coupon_row) or (0, None) if no code.
    Raises HTTPException if code is invalid, expired, or not applicable.
    """
    if not code or not str(code).strip():
        return 0.0, None

    normalized = str(code).strip().upper()
    coupon = (
        db.query(Coupon)
        .filter(Coupon.code == normalized, Coupon.is_active == True)
        .first()
    )
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid coupon code",
        )

    now = _utc_now()
    if coupon.expires_at:
        exp = coupon.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon has expired",
            )

    if coupon.usage_limit is not None and (coupon.used_count or 0) >= coupon.usage_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon usage limit reached",
        )

    min_amt = float(coupon.minimum_amount or 0)
    if min_amt > float(subtotal):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order amount of GHS {min_amt:g} required",
        )

    if coupon.discount_type == "percentage":
        discount = float(subtotal) * (float(coupon.discount_value) / 100.0)
    else:
        discount = float(coupon.discount_value)

    discount = max(0.0, min(discount, float(subtotal)))
    return discount, coupon
