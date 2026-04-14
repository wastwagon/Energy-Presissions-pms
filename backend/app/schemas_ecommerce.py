"""
E-commerce Schemas
Pydantic schemas for e-commerce functionality
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime
from app.schemas import ProductType
from app.services.ecommerce_pricing import catalog_unit_price_from_fields


class ProductPublic(BaseModel):
    """Public product schema for e-commerce"""
    id: int
    product_type: ProductType
    brand: Optional[str] = None
    model: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    base_price: Optional[float] = None
    price_type: Optional[str] = None
    wattage: Optional[int] = None
    capacity_kw: Optional[float] = None
    capacity_kwh: Optional[float] = None
    image_url: Optional[str] = None
    gallery_images: Optional[dict] = None
    stock_quantity: int = 0
    manage_stock: bool = False
    in_stock: bool = True
    # Same formula as PMS quotes for one catalog unit (panel / inverter / battery)
    catalog_unit_price: float = 0.0

    @model_validator(mode="after")
    def set_catalog_unit_price(self):
        bp = float(self.base_price or 0)
        object.__setattr__(
            self,
            "catalog_unit_price",
            catalog_unit_price_from_fields(
                bp,
                self.price_type,
                self.wattage,
                self.capacity_kw,
                self.capacity_kwh,
            ),
        )
        return self

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    customer_id: Optional[int] = None
    session_id: Optional[str] = None


class CartMergeRequest(BaseModel):
    session_id: str = Field(..., min_length=8, max_length=200)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    customer_id: Optional[int] = None
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    created_at: datetime
    product: Optional[ProductPublic] = None
    
    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None
    items: List[OrderItemCreate]
    shipping_address: dict
    billing_address: Optional[dict] = None
    shipping_method: Optional[str] = None
    shipping_cost: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0  # ignored — discount comes from coupon_code only
    coupon_code: Optional[str] = None
    # paystack: customer email is sent after payment; cod: send confirmation on order create
    payment_method: Optional[str] = "paystack"


class OrderItemResponse(BaseModel):
    product_name: str
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    status: str
    payment_status: str
    subtotal: float
    shipping_cost: float
    discount_amount: float
    total_amount: float
    shipping_address: Optional[dict] = None
    billing_address: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrderDetailResponse(OrderResponse):
    items: Optional[List[OrderItemResponse]] = None
    
    class Config:
        from_attributes = True


class OrderConfirmationItemPublic(BaseModel):
    """Line items safe to show on the post-payment confirmation page (no addresses or PII)."""

    product_name: str
    quantity: int
    unit_price: float
    total_price: float


class OrderConfirmationPublic(BaseModel):
    """Subset of order data returned after Paystack verify — not a substitute for authenticated order admin APIs."""

    order_number: str
    status: str
    payment_status: str
    subtotal: float
    shipping_cost: float
    discount_amount: float
    total_amount: float
    items: List[OrderConfirmationItemPublic] = Field(default_factory=list)


class PaystackVerifyResponse(BaseModel):
    verified: bool
    order: Optional[str] = None
    status: Optional[str] = None
    detail: Optional[str] = None
    order_confirmation: Optional[OrderConfirmationPublic] = None


class OrderStatusUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None


class CouponValidate(BaseModel):
    code: str
    amount: float


class CouponAdmin(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    minimum_amount: float
    usage_limit: Optional[int] = None
    used_count: int = 0
    expires_at: Optional[datetime] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CouponCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=64)
    discount_type: str  # percentage | fixed
    discount_value: float = Field(..., gt=0)
    minimum_amount: float = Field(0, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)
    expires_at: Optional[datetime] = None
    is_active: bool = True


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=64)
    discount_type: Optional[str] = None
    discount_value: Optional[float] = Field(None, gt=0)
    minimum_amount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

