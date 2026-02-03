from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import (
    UserRole, CustomerType, SystemType, ProjectStatus, ApplianceType,
    ApplianceCategory, PowerUnit, ProductType, QuoteStatus
)


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.SALES


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    customer_type: CustomerType = CustomerType.RESIDENTIAL
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    customer_type: Optional[CustomerType] = None
    notes: Optional[str] = None


class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Project Schemas
class ProjectBase(BaseModel):
    customer_id: int
    name: str
    reference_code: Optional[str] = None
    system_type: SystemType
    status: ProjectStatus = ProjectStatus.NEW


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    reference_code: Optional[str] = None
    system_type: Optional[SystemType] = None
    status: Optional[ProjectStatus] = None


class Project(ProjectBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer: Optional[Customer] = None
    
    class Config:
        from_attributes = True


# Appliance Schemas
class ApplianceBase(BaseModel):
    category: ApplianceCategory
    appliance_type: ApplianceType
    description: str
    power_value: float
    power_unit: PowerUnit
    quantity: int = 1
    hours_per_day: float
    is_essential: bool = False


class ApplianceCreate(ApplianceBase):
    project_id: int
    
    @field_validator('category', 'appliance_type', mode='before')
    @classmethod
    def normalize_enum_values(cls, v):
        """Normalize enum values to lowercase strings"""
        if isinstance(v, str):
            return v.lower()
        return v


class ApplianceUpdate(BaseModel):
    category: Optional[ApplianceCategory] = None
    appliance_type: Optional[ApplianceType] = None
    description: Optional[str] = None
    power_value: Optional[float] = None
    power_unit: Optional[PowerUnit] = None
    quantity: Optional[int] = None
    hours_per_day: Optional[float] = None
    is_essential: Optional[bool] = None


class Appliance(ApplianceBase):
    id: int
    project_id: int
    daily_kwh: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Sizing Schemas
class SizingInput(BaseModel):
    project_id: int
    total_daily_kwh: float
    location: Optional[str] = None
    panel_brand: str  # "Jinko", "Longi", "JA"
    backup_hours: Optional[float] = None  # For hybrid/off-grid
    essential_load_percent: Optional[float] = None
    system_type: Optional[SystemType] = None  # For determining battery requirements


class SizingFromAppliancesInput(BaseModel):
    location: Optional[str] = None
    panel_brand: str = "Jinko"
    backup_hours: Optional[float] = None
    essential_load_percent: Optional[float] = None


class SizingResult(BaseModel):
    id: Optional[int] = None
    project_id: int
    total_daily_kwh: float
    location: Optional[str] = None
    peak_sun_hours: Optional[float] = None
    panel_brand: Optional[str] = None
    panel_wattage: Optional[int] = None
    backup_hours: Optional[float] = None
    essential_load_percent: Optional[float] = None
    effective_daily_kwh: Optional[float] = None  # Daily energy after system losses
    system_size_kw: Optional[float] = None
    number_of_panels: Optional[int] = None
    roof_area_m2: Optional[float] = None
    min_inverter_kw: Optional[float] = None  # Minimum required inverter capacity (calculated)
    inverter_size_kw: Optional[float] = None  # Total inverter capacity (selected product size)
    inverter_count: Optional[int] = None  # Number of parallel inverters
    inverter_unit_size_kw: Optional[float] = None  # Size of each inverter unit (selected product size)
    battery_capacity_kwh: Optional[float] = None
    system_efficiency: Optional[float] = None
    dc_ac_ratio: Optional[float] = None
    design_factor: Optional[float] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    product_type: ProductType
    brand: Optional[str] = None
    model: Optional[str] = None
    wattage: Optional[int] = None
    capacity_kw: Optional[float] = None
    capacity_kwh: Optional[float] = None
    price_type: str
    base_price: float


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    product_type: Optional[ProductType] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    wattage: Optional[int] = None
    capacity_kw: Optional[float] = None
    capacity_kwh: Optional[float] = None
    price_type: Optional[str] = None
    base_price: Optional[float] = None
    is_active: Optional[bool] = None


class Product(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Quote Schemas
class QuoteItemBase(BaseModel):
    product_id: Optional[int] = None
    description: str
    quantity: float
    unit_price: float
    total_price: float
    is_custom: bool = False
    sort_order: int = 0


class QuoteItemCreate(QuoteItemBase):
    quote_id: int


class QuoteItemUpdate(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    product_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_custom: Optional[bool] = None


class QuoteItem(QuoteItemBase):
    id: int
    quote_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuoteBase(BaseModel):
    project_id: int
    validity_days: int = 30
    payment_terms: Optional[str] = None
    notes: Optional[str] = None


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    status: Optional[QuoteStatus] = None
    tax_percent: Optional[float] = None
    discount_percent: Optional[float] = None
    validity_days: Optional[int] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None


class Quote(QuoteBase):
    id: int
    quote_number: str
    status: QuoteStatus
    created_by: int
    equipment_subtotal: float
    services_subtotal: float
    tax_percent: float
    tax_amount: float
    discount_percent: float
    discount_amount: float
    grand_total: float
    emailed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[QuoteItem] = []
    project: Optional[Project] = None
    
    class Config:
        from_attributes = True


# Settings Schemas
class SettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    category: Optional[str] = None


class SettingCreate(SettingBase):
    pass


class Setting(SettingBase):
    id: int
    updated_at: Optional[datetime] = None
    updated_by: Optional[int] = None
    
    class Config:
        from_attributes = True


# Peak Sun Hours Schemas
class PeakSunHoursBase(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    peak_sun_hours: float
    source: Optional[str] = None


class PeakSunHoursCreate(PeakSunHoursBase):
    pass


class PeakSunHoursUpdate(BaseModel):
    peak_sun_hours: Optional[float] = None
    source: Optional[str] = None


class PeakSunHours(PeakSunHoursBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

