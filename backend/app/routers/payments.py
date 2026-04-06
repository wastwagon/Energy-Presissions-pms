"""
Payment API Routes
Paystack payment integration endpoints
"""
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models_ecommerce import Order
from app.services.paystack_service import paystack_service
from app.services.order_payment import finalize_order_paid_from_paystack

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/paystack/initialize")
async def initialize_paystack_payment(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Initialize Paystack payment for an order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")
    
    # Convert amount to kobo (GHS * 100); match webhook verification rounding
    amount_kobo = int(round(float(order.total_amount) * 100))
    
    # Generate callback URL
    from app.config import settings
    callback_url = f"{settings.FRONTEND_URL}/checkout/success?order={order.order_number}"
    
    try:
        response = paystack_service.initialize_transaction(
            email=order.customer_email or "customer@example.com",
            amount=amount_kobo,
            reference=order.order_number,
            callback_url=callback_url,
            metadata={
                "order_id": order.id,
                "order_number": order.order_number,
                "customer_id": order.customer_id
            }
        )
        
        if response.get("status"):
            return {
                "authorization_url": response["data"]["authorization_url"],
                "access_code": response["data"]["access_code"],
                "reference": order.order_number
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to initialize payment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/paystack/webhook")
async def paystack_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Paystack webhook notifications"""
    # Get signature from header
    signature = request.headers.get("x-paystack-signature")
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")
    
    # Get raw body
    body = await request.body()
    
    # Verify signature
    if not paystack_service.verify_webhook_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    payload = json.loads(body.decode('utf-8'))
    event = payload.get("event")
    data = payload.get("data", {})
    
    if event == "charge.success":
        reference = data.get("reference")
        amount_kobo = data.get("amount")
        order = db.query(Order).filter(Order.order_number == reference).first()

        if order:
            ok, err = finalize_order_paid_from_paystack(db, order, reference, amount_kobo)
            if ok:
                db.commit()
                return {"status": "success", "message": "Payment confirmed"}
            db.rollback()
            logger.error("Paystack webhook: could not finalize order %s: %s", reference, err)
            return {"status": "rejected", "message": err}
    
    return {"status": "received"}


@router.get("/paystack/verify/{reference}")
async def verify_payment(
    reference: str,
    db: Session = Depends(get_db)
):
    """
    Verify Paystack transaction and, if successful, finalize the order (same as webhook).
    Used when the customer returns from Paystack before the webhook runs.
    """
    order = db.query(Order).filter(Order.order_number == reference).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "paid":
        return {
            "verified": True,
            "order": order.order_number,
            "status": order.payment_status,
        }

    try:
        response = paystack_service.verify_transaction(reference)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not response.get("status") or response.get("data", {}).get("status") != "success":
        return {"verified": False}

    data = response["data"]
    amount_kobo = data.get("amount")
    ok, err = finalize_order_paid_from_paystack(db, order, reference, amount_kobo)
    if not ok:
        logger.warning("Paystack verify finalize failed for %s: %s", reference, err)
        return {"verified": False, "detail": err}

    db.commit()
    db.refresh(order)
    return {
        "verified": True,
        "order": order.order_number,
        "status": order.payment_status,
    }

