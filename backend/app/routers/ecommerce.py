"""
E-commerce API Routes
Public-facing e-commerce endpoints and admin order management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models import Product, ProductType, Customer, User
from app.models_ecommerce import Order, OrderItem, CartItem, Coupon
from app.schemas_ecommerce import (
    ProductPublic, OrderCreate, OrderResponse, OrderDetailResponse, OrderStatusUpdate,
    CartItemCreate, CartItemResponse, CouponValidate,
    CouponAdmin, CouponCreate, CouponUpdate,
)
from app.auth import get_current_active_user, require_role
from app.services.ecommerce_pricing import catalog_unit_price
from app.services.ecommerce_shipping import compute_shipping_cost
from app.services.coupon_order import compute_order_coupon_discount
from datetime import datetime, timezone
import uuid

# Category dropdown on shop may send product_type values (panel, inverter, …)
_ECOM_CATEGORY_AS_PRODUCT_TYPE = {pt.value for pt in ProductType}

router = APIRouter(prefix="/api/ecommerce", tags=["ecommerce"])


@router.get("/shipping-estimate")
async def shipping_estimate(subtotal: float = Query(..., ge=0)):
    """Server-side shipping for checkout (matches order creation)."""
    from app.config import settings

    return {
        "shipping_cost": compute_shipping_cost(subtotal),
        "free_shipping_threshold_ghs": settings.ECOMMERCE_FREE_SHIPPING_THRESHOLD_GHS,
        "flat_rate_ghs": settings.ECOMMERCE_SHIPPING_FLAT_GHS,
    }


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
        Product.base_price.isnot(None),  # Only return products with prices
        or_(
            Product.price_type.is_(None),
            Product.price_type != "percentage",
        ),
    )
    
    if category:
        if category in _ECOM_CATEGORY_AS_PRODUCT_TYPE:
            query = query.filter(Product.product_type == category)
        else:
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
        Product.is_active == True,
        Product.base_price.isnot(None),
        or_(
            Product.price_type.is_(None),
            Product.price_type != "percentage",
        ),
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

    # Resolve unit prices from catalog (same rules as PMS quotes); ignore client-supplied amounts
    line_totals: list[tuple] = []
    for item_data in order_data.items:
        if item_data.product_id is not None:
            product = db.query(Product).filter(
                Product.id == item_data.product_id,
                Product.is_active == True,
            ).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product id {item_data.product_id} is not available",
                )
            unit_price = catalog_unit_price(product)
        else:
            unit_price = item_data.unit_price
        line_totals.append((item_data, unit_price))

    subtotal = sum(up * item.quantity for item, up in line_totals)
    shipping_cost = compute_shipping_cost(subtotal)
    discount_amount, coupon_applied = compute_order_coupon_discount(
        db, order_data.coupon_code, subtotal
    )
    total_amount = subtotal + shipping_cost - discount_amount
    if total_amount < 0:
        total_amount = 0.0

    pm = (order_data.payment_method or "paystack").lower()
    if pm not in ("paystack", "cod", "cash_on_delivery"):
        pm = "paystack"
    if pm == "cash_on_delivery":
        pm = "cod"

    # Create order
    order = Order(
        order_number=order_number,
        customer_id=order_data.customer_id,
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        status="pending",
        payment_status="pending",
        payment_method=pm,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        discount_amount=discount_amount,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address or order_data.shipping_address,
        shipping_method=order_data.shipping_method
    )
    db.add(order)
    db.flush()
    
    # Create order items
    for item_data, unit_price in line_totals:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            product_sku=item_data.product_sku,
            quantity=item_data.quantity,
            unit_price=unit_price,
            total_price=unit_price * item_data.quantity,
        )
        db.add(order_item)

    if coupon_applied:
        coupon_applied.used_count = (coupon_applied.used_count or 0) + 1

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
    
    # Customer email: COD only here; Paystack sends after successful payment (webhook/verify)
    if order.customer_email and pm != "paystack":
        email_service.send_order_confirmation(order_dict, order.customer_email)

    # Notify admin for all new orders
    admin_email = os.getenv("ADMIN_EMAIL", settings.COMPANY_EMAIL)
    if admin_email:
        email_service.send_admin_notification(order_dict, admin_email)

    return order


@router.get("/orders", response_model=List[OrderResponse])
async def list_orders_admin(
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Admin: List all e-commerce orders (auth required)"""
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(term),
                Order.customer_name.ilike(term),
                Order.customer_email.ilike(term),
                Order.customer_phone.ilike(term)
            )
        )
    orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
    return orders


@router.patch("/orders/{order_number}", response_model=OrderDetailResponse)
async def update_order_status(
    order_number: str,
    update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Admin: Update order status (auth required)"""
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if update.status is not None:
        order.status = update.status
    if update.payment_status is not None:
        order.payment_status = update.payment_status
    if update.tracking_number is not None:
        order.tracking_number = update.tracking_number
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/{order_number}", response_model=OrderDetailResponse)
async def get_order(
    order_number: str,
    db: Session = Depends(get_db)
):
    """Get order by order number (includes items)"""
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
    
    # Check expiration (timezone-aware)
    if coupon.expires_at:
        now = datetime.now(timezone.utc)
        exp = coupon.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
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


def _normalize_coupon_discount_type(discount_type: str) -> str:
    dt = (discount_type or "").lower().strip()
    if dt not in ("percentage", "fixed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="discount_type must be percentage or fixed",
        )
    return dt


def _validate_coupon_values(discount_type: str, discount_value: float) -> None:
    if discount_type == "percentage" and discount_value > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Percentage discount cannot exceed 100",
        )


@router.get("/coupons", response_model=List[CouponAdmin])
async def list_coupons_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """List all promo codes (admin)."""
    return db.query(Coupon).order_by(desc(Coupon.created_at)).all()


@router.post("/coupons", response_model=CouponAdmin, status_code=status.HTTP_201_CREATED)
async def create_coupon_admin(
    body: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Create a promo code (admin)."""
    code = body.code.strip().upper()
    if db.query(Coupon).filter(Coupon.code == code).first():
        raise HTTPException(status_code=400, detail="A coupon with this code already exists")
    dt = _normalize_coupon_discount_type(body.discount_type)
    _validate_coupon_values(dt, body.discount_value)

    row = Coupon(
        code=code,
        discount_type=dt,
        discount_value=float(body.discount_value),
        minimum_amount=float(body.minimum_amount or 0),
        usage_limit=body.usage_limit,
        used_count=0,
        expires_at=body.expires_at,
        is_active=body.is_active,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/coupons/{coupon_id}", response_model=CouponAdmin)
async def get_coupon_admin(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    row = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return row


@router.patch("/coupons/{coupon_id}", response_model=CouponAdmin)
async def update_coupon_admin(
    coupon_id: int,
    body: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    row = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Coupon not found")

    data = body.model_dump(exclude_unset=True)
    if "code" in data and data["code"] is not None:
        new_code = str(data["code"]).strip().upper()
        clash = db.query(Coupon).filter(Coupon.code == new_code, Coupon.id != coupon_id).first()
        if clash:
            raise HTTPException(status_code=400, detail="A coupon with this code already exists")
        row.code = new_code
    if "discount_type" in data and data["discount_type"] is not None:
        row.discount_type = _normalize_coupon_discount_type(data["discount_type"])
    if "discount_value" in data and data["discount_value"] is not None:
        row.discount_value = float(data["discount_value"])
    if "minimum_amount" in data and data["minimum_amount"] is not None:
        row.minimum_amount = float(data["minimum_amount"])
    if "usage_limit" in data:
        row.usage_limit = data["usage_limit"]
    if "expires_at" in data:
        row.expires_at = data["expires_at"]
    if "is_active" in data and data["is_active"] is not None:
        row.is_active = data["is_active"]

    _validate_coupon_values(row.discount_type, row.discount_value)

    db.commit()
    db.refresh(row)
    return row


@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_coupon_admin(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Soft-deactivate a coupon (does not delete history)."""
    row = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Coupon not found")
    row.is_active = False
    db.commit()
    return None

