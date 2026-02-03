"""
E-commerce Schemas
Pydantic schemas for e-commerce functionality
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.schemas import ProductType


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
    image_url: Optional[str] = None
    gallery_images: Optional[dict] = None
    stock_quantity: int = 0
    manage_stock: bool = False
    in_stock: bool = True
    
    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    customer_id: Optional[int] = None
    session_id: Optional[str] = None


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    customer_id: Optional[int] = None
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
    discount_amount: Optional[float] = 0.0


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int] = None
    status: str
    payment_status: str
    subtotal: float
    shipping_cost: float
    discount_amount: float
    total_amount: float
    shipping_address: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CouponValidate(BaseModel):
    code: str
    amount: float

