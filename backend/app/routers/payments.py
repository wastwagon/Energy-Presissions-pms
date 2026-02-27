"""
Payment API Routes
Paystack payment integration endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models_ecommerce import Order
from app.services.paystack_service import paystack_service
from app.schemas_ecommerce import OrderResponse
from typing import Dict
import json
import os

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
    
    # Convert amount to kobo (GHS * 100)
    amount_kobo = int(order.total_amount * 100)
    
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
        order = db.query(Order).filter(Order.order_number == reference).first()
        
        if order:
            # Update order status
            from datetime import datetime
            order.payment_status = "paid"
            order.status = "processing"
            order.payment_reference = reference
            order.paid_at = datetime.now()

            # Deduct stock for products with manage_stock
            from app.services.stock import deduct_stock_on_order_paid
            deduct_stock_on_order_paid(db, order.id)

            db.commit()
            
            # Send confirmation email
            from app.services.email_service import email_service
            from app.config import settings
            
            order_dict = {
                "order_number": order.order_number,
                "customer_name": order.customer_name or "Customer",
                "customer_email": order.customer_email,
                "subtotal": float(order.subtotal),
                "shipping_cost": float(order.shipping_cost),
                "total_amount": float(order.total_amount),
                "items": [
                    {
                        "product_name": item.product_name,
                        "quantity": item.quantity,
                        "unit_price": float(item.unit_price),
                        "total_price": float(item.total_price),
                    }
                    for item in order.items
                ]
            }
            
            if order.customer_email:
                email_service.send_order_confirmation(order_dict, order.customer_email)
            
            # Notify admin
            admin_email = os.getenv("ADMIN_EMAIL", settings.COMPANY_EMAIL)
            if admin_email:
                email_service.send_admin_notification(order_dict, admin_email)
            
            # TODO: Update inventory
            
            return {"status": "success", "message": "Payment confirmed"}
    
    return {"status": "received"}


@router.get("/paystack/verify/{reference}")
async def verify_payment(
    reference: str,
    db: Session = Depends(get_db)
):
    """Verify a Paystack payment"""
    try:
        response = paystack_service.verify_transaction(reference)
        
        if response.get("status") and response["data"]["status"] == "success":
            order = db.query(Order).filter(Order.order_number == reference).first()
            if order:
                return {
                    "verified": True,
                    "order": order.order_number,
                    "status": order.payment_status
                }
        
        return {"verified": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

