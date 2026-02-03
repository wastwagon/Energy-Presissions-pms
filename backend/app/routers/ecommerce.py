"""
E-commerce API Routes
Public-facing e-commerce endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Product, ProductType, Customer
from app.models_ecommerce import Order, OrderItem, CartItem, Coupon
from app.schemas_ecommerce import (
    ProductPublic, OrderCreate, OrderResponse, CartItemCreate, CartItemResponse,
    CouponValidate
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/ecommerce", tags=["ecommerce"])


@router.get("/products", response_model=List[ProductPublic])
async def get_public_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    product_type: Optional[ProductType] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get products for public website/e-commerce (no auth required)"""
    query = db.query(Product).filter(
        Product.is_active == True,
        Product.base_price.isnot(None)  # Only return products with prices
    )
    
    if category:
        query = query.filter(Product.category == category)
    
    if product_type:
        query = query.filter(Product.product_type == product_type)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.model.ilike(search_term)
            )
        )
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/products/{product_id}", response_model=ProductPublic)
async def get_public_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get single product details (no auth required)"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories"""
    categories = db.query(Product.category).filter(
        Product.is_active == True,
        Product.category.isnot(None)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]


@router.post("/cart/add", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Add item to cart (supports both logged-in and guest users)"""
    # Check if product exists and is active
    product = db.query(Product).filter(
        Product.id == item.product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check stock
    if product.manage_stock and product.stock_quantity < item.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {product.stock_quantity}"
        )
    
    # Get session ID for guest users
    session_id = item.session_id
    if not session_id:
        # Try to get from request cookies
        session_id = request.cookies.get("session_id")
        if not session_id:
            session_id = str(uuid.uuid4())
    
    # Check if item already in cart
    existing_item = None
    if item.customer_id:
        existing_item = db.query(CartItem).filter(
            CartItem.customer_id == item.customer_id,
            CartItem.product_id == item.product_id
        ).first()
    elif session_id:
        existing_item = db.query(CartItem).filter(
            CartItem.session_id == session_id,
            CartItem.product_id == item.product_id,
            CartItem.customer_id.is_(None)
        ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    # Create new cart item
    cart_item = CartItem(
        customer_id=item.customer_id,
        product_id=item.product_id,
        quantity=item.quantity,
        session_id=session_id if not item.customer_id else None
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    
    return cart_item


@router.get("/cart", response_model=List[CartItemResponse])
async def get_cart(
    customer_id: Optional[int] = None,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get cart items"""
    query = db.query(CartItem)
    
    if customer_id:
        query = query.filter(CartItem.customer_id == customer_id)
    elif session_id:
        query = query.filter(
            CartItem.session_id == session_id,
            CartItem.customer_id.is_(None)
        )
    else:
        return []
    
    cart_items = query.all()
    return cart_items


@router.delete("/cart/{item_id}")
async def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}


@router.put("/cart/{item_id}")
async def update_cart_item(
    item_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if quantity <= 0:
        db.delete(cart_item)
    else:
        # Check stock
        if cart_item.product.manage_stock and cart_item.product.stock_quantity < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {cart_item.product.stock_quantity}"
            )
        cart_item.quantity = quantity
    
    db.commit()
    return {"message": "Cart item updated"}


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    """Create a new order"""
    # Generate order number
    order_number = f"EP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate totals from items
    subtotal = sum(item.unit_price * item.quantity for item in order_data.items)
    total_amount = subtotal + (order_data.shipping_cost or 0) - (order_data.discount_amount or 0)
    
    # Create order
    order = Order(
        order_number=order_number,
        customer_id=order_data.customer_id,
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        status="pending",
        payment_status="pending",
        subtotal=subtotal,
        shipping_cost=order_data.shipping_cost or 0,
        discount_amount=order_data.discount_amount or 0,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address or order_data.shipping_address,
        shipping_method=order_data.shipping_method
    )
    db.add(order)
    db.flush()
    
    # Create order items
    for item_data in order_data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            product_sku=item_data.product_sku,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.unit_price * item_data.quantity
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(order)
    
    # Send order confirmation email
    from app.services.email_service import email_service
    from app.config import settings
    import os
    
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
    
    return order


@router.get("/orders/{order_number}", response_model=OrderResponse)
async def get_order(
    order_number: str,
    db: Session = Depends(get_db)
):
    """Get order by order number"""
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/coupons/validate")
async def validate_coupon(
    coupon_data: CouponValidate,
    db: Session = Depends(get_db)
):
    """Validate a coupon code"""
    coupon = db.query(Coupon).filter(
        Coupon.code == coupon_data.code.upper(),
        Coupon.is_active == True
    ).first()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    # Check expiration
    if coupon.expires_at and coupon.expires_at < datetime.now():
        raise HTTPException(status_code=400, detail="Coupon has expired")
    
    # Check usage limit
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    # Check minimum amount
    if coupon.minimum_amount > coupon_data.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order amount of GHS {coupon.minimum_amount} required"
        )
    
    # Calculate discount
    if coupon.discount_type == "percentage":
        discount_amount = coupon_data.amount * (coupon.discount_value / 100)
    else:
        discount_amount = coupon.discount_value
    
    return {
        "valid": True,
        "discount_amount": discount_amount,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value
    }

