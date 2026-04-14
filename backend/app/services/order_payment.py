"""
Idempotent completion of e-commerce orders after Paystack success.
Validates charged amount (pesewas) matches order total; deducts stock once; sends emails once.
"""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Tuple

from sqlalchemy.orm import Session

from app.models_ecommerce import Order
from app.services.stock import deduct_stock_on_order_paid

logger = logging.getLogger(__name__)


def order_confirmation_public(order: Order):
    """Non-sensitive order summary for post-checkout UI (after Paystack verify)."""
    from app.schemas_ecommerce import OrderConfirmationPublic, OrderConfirmationItemPublic

    items = [
        OrderConfirmationItemPublic(
            product_name=i.product_name,
            quantity=int(i.quantity),
            unit_price=float(i.unit_price),
            total_price=float(i.total_price),
        )
        for i in (order.items or [])
    ]
    return OrderConfirmationPublic(
        order_number=order.order_number,
        status=(order.status or "pending"),
        payment_status=(order.payment_status or "pending"),
        subtotal=float(order.subtotal or 0),
        shipping_cost=float(order.shipping_cost or 0),
        discount_amount=float(order.discount_amount or 0),
        total_amount=float(order.total_amount or 0),
        items=items,
    )


def order_amount_matches_paystack_kobo(order: Order, amount_kobo: int | None) -> bool:
    """Paystack amounts are in the smallest currency unit (pesewas for GHS)."""
    if amount_kobo is None:
        return False
    expected = int(round(float(order.total_amount) * 100))
    return abs(int(amount_kobo) - expected) <= 1


def send_paid_order_emails(order: Order, notify_admin: bool = False) -> None:
    """
    Customer confirmation when payment completes.
    Admin is notified on order create; set notify_admin=True only if you need a second admin ping.
    """
    from app.services.email_service import email_service
    from app.config import settings
    import os

    order_dict = {
        "order_number": order.order_number,
        "customer_name": order.customer_name or "Customer",
        "customer_email": order.customer_email,
        "subtotal": float(order.subtotal),
        "shipping_cost": float(order.shipping_cost or 0),
        "total_amount": float(order.total_amount),
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            }
            for item in order.items
        ],
    }

    if order.customer_email:
        email_service.send_order_confirmation(order_dict, order.customer_email)

    if notify_admin:
        admin_email = os.getenv("ADMIN_EMAIL", settings.COMPANY_EMAIL)
        if admin_email:
            email_service.send_admin_notification(order_dict, admin_email)


def finalize_order_paid_from_paystack(
    db: Session,
    order: Order,
    reference: str,
    amount_kobo: int | None,
) -> Tuple[bool, str]:
    """
    Mark order paid, deduct stock (idempotent), send emails once.
    Returns (ok, error_message). On ok=False, caller should not commit payment state.
    """
    if order.payment_status == "paid":
        return True, ""

    if not order_amount_matches_paystack_kobo(order, amount_kobo):
        logger.warning(
            "Paystack amount mismatch for order %s: expected ~%s pesewas, got %s",
            order.order_number,
            int(round(float(order.total_amount) * 100)),
            amount_kobo,
        )
        return False, "Payment amount does not match order total"

    order.payment_status = "paid"
    order.status = "processing"
    order.payment_reference = reference
    order.paid_at = datetime.now()

    deduct_stock_on_order_paid(db, order.id)
    send_paid_order_emails(order)

    return True, ""
