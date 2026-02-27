from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SALES = "sales"
    VIEWER = "viewer"


class CustomerType(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"


class SystemType(str, enum.Enum):
    GRID_TIED = "grid_tied"
    HYBRID = "hybrid"
    OFF_GRID = "off_grid"


class ProjectStatus(str, enum.Enum):
    NEW = "new"
    QUOTED = "quoted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    INSTALLED = "installed"


class ApplianceCategory(str, enum.Enum):
    LIGHTING = "lighting"
    COOLING = "cooling"
    HEATING = "heating"
    COOKING = "cooking"
    REFRIGERATION = "refrigeration"
    LAUNDRY = "laundry"
    ENTERTAINMENT = "entertainment"
    COMPUTING = "computing"
    WATER_HEATING = "water_heating"
    WATER_PUMPING = "water_pumping"
    VENTILATION = "ventilation"
    SECURITY = "security"
    MEDICAL = "medical"
    INDUSTRIAL = "industrial"
    COMMERCIAL = "commercial"
    OTHER = "other"


class ApplianceType(str, enum.Enum):
    # Lighting
    LED_BULB = "led_bulb"
    LED_BULB_30W = "led_bulb_30w"
    LED_BULB_40W = "led_bulb_40w"
    CFL_BULB = "cfl_bulb"
    INCANDESCENT = "incandescent"
    FLUORESCENT_TUBE = "fluorescent_tube"
    LED_PANEL = "led_panel"
    LED_SPOT_LIGHT = "led_spot_light"
    LED_SPOT_LIGHT_6W = "led_spot_light_6w"
    STREET_LIGHT = "street_light"
    SECURITY_LIGHT = "security_light"
    
    # Cooling
    WINDOW_AC = "window_ac"
    SPLIT_AC = "split_ac"
    SPLIT_AC_1_5HP = "split_ac_1_5hp"
    SPLIT_AC_2_5HP = "split_ac_2_5hp"
    CENTRAL_AC = "central_ac"
    PORTABLE_AC = "portable_ac"
    CEILING_FAN = "ceiling_fan"
    TABLE_FAN = "table_fan"
    COOLING_EXHAUST_FAN = "cooling_exhaust_fan"
    EVAPORATIVE_COOLER = "evaporative_cooler"
    
    # Heating
    SPACE_HEATER = "space_heater"
    RADIATOR = "radiator"
    ELECTRIC_FIREPLACE = "electric_fireplace"
    HEAT_PUMP = "heat_pump"
    BASEBOARD_HEATER = "baseboard_heater"
    
    # Cooking
    ELECTRIC_STOVE = "electric_stove"
    INDUCTION_COOKTOP = "induction_cooktop"
    MICROWAVE = "microwave"
    OVEN = "oven"
    TOASTER = "toaster"
    COFFEE_MAKER = "coffee_maker"
    ELECTRIC_KETTLE = "electric_kettle"
    RICE_COOKER = "rice_cooker"
    SLOW_COOKER = "slow_cooker"
    BLENDER = "blender"
    FOOD_PROCESSOR = "food_processor"
    DISHWASHER = "dishwasher"
    
    # Refrigeration
    REFRIGERATOR = "refrigerator"
    SINGLE_DOOR_FRIDGE = "single_door_fridge"
    DOUBLE_DOOR_FRIDGE = "double_door_fridge"
    TABLE_TOP_FRIDGE = "table_top_fridge"
    FREEZER = "freezer"
    WINE_COOLER = "wine_cooler"
    ICE_MAKER = "ice_maker"
    
    # Laundry
    WASHING_MACHINE = "washing_machine"
    CLOTHES_DRYER = "clothes_dryer"
    IRON = "iron"
    
    # Entertainment
    TV = "tv"
    TV_40INCH_LED = "tv_40inch_led"
    TV_42INCH_LED = "tv_42inch_led"
    TV_45INCH_LED = "tv_45inch_led"
    TV_55INCH_LED = "tv_55inch_led"
    TV_65INCH_LED = "tv_65inch_led"
    SOUND_SYSTEM = "sound_system"
    GAMING_CONSOLE = "gaming_console"
    PS5 = "ps5"
    PS4 = "ps4"
    XBOX_SERIES_X = "xbox_series_x"
    PROJECTOR = "projector"
    
    # Computing
    DESKTOP_PC = "desktop_pc"
    LAPTOP = "laptop"
    MONITOR = "monitor"
    MONITOR_24INCH = "monitor_24inch"
    PRINTER = "printer"
    PRINTER_SMALL = "printer_small"
    PRINTER_LARGE = "printer_large"
    ROUTER = "router"
    SERVER = "server"
    
    # Water Heating
    WATER_HEATER = "water_heater"
    IMMERSION_HEATER = "immersion_heater"
    GEYSER = "geyser"
    
    # Water Pumping
    WATER_PUMP = "water_pump"
    SUBMERSIBLE_PUMP = "submersible_pump"
    BOOSTER_PUMP = "booster_pump"
    SEWAGE_PUMP = "sewage_pump"
    
    # Ventilation
    EXHAUST_FAN = "exhaust_fan"
    VENTILATION_FAN = "ventilation_fan"
    AIR_PURIFIER = "air_purifier"
    HUMIDIFIER = "humidifier"
    DEHUMIDIFIER = "dehumidifier"
    
    # Security
    CCTV_CAMERA = "cctv_camera"
    ALARM_SYSTEM = "alarm_system"
    ELECTRIC_GATE = "electric_gate"
    
    # Medical
    OXYGEN_CONCENTRATOR = "oxygen_concentrator"
    CPAP_MACHINE = "cpap_machine"
    MEDICAL_REFRIGERATOR = "medical_refrigerator"
    
    # Industrial
    COMPRESSOR = "compressor"
    WELDING_MACHINE = "welding_machine"
    GRINDER = "grinder"
    DRILL = "drill"
    SAW = "saw"
    CONVEYOR_BELT = "conveyor_belt"
    INDUSTRIAL_FAN = "industrial_fan"
    INDUSTRIAL_HEATER = "industrial_heater"
    
    # Commercial
    COMMERCIAL_REFRIGERATOR = "commercial_refrigerator"
    COMMERCIAL_FREEZER = "commercial_freezer"
    COMMERCIAL_OVEN = "commercial_oven"
    COMMERCIAL_DISHWASHER = "commercial_dishwasher"
    ICE_MACHINE = "ice_machine"
    POS_SYSTEM = "pos_system"
    
    # Other
    CUSTOM = "custom"
    OTHER = "other"


class PowerUnit(str, enum.Enum):
    W = "W"
    KW = "kW"
    HP = "HP"


class ProductType(str, enum.Enum):
    PANEL = "panel"
    INVERTER = "inverter"
    BATTERY = "battery"
    MOUNTING = "mounting"
    BOS = "bos"
    INSTALLATION = "installation"
    TRANSPORT = "transport"
    OTHER = "other"


class QuoteStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.SALES, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_projects = relationship("Project", back_populates="created_by_user", foreign_keys="Project.created_by")
    created_quotes = relationship("Quote", back_populates="created_by_user", foreign_keys="Quote.created_by")


class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    phone = Column(String)
    email = Column(String, index=True)
    address = Column(Text)
    city = Column(String)
    country = Column(String)
    customer_type = Column(SQLEnum(CustomerType), default=CustomerType.RESIDENTIAL)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="customer", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    name = Column(String, nullable=False)
    reference_code = Column(String, unique=True, index=True)
    system_type = Column(SQLEnum(SystemType), nullable=False)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.NEW)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="projects")
    created_by_user = relationship("User", foreign_keys=[created_by])
    appliances = relationship("Appliance", back_populates="project", cascade="all, delete-orphan")
    sizing_result = relationship("SizingResult", back_populates="project", uselist=False, cascade="all, delete-orphan")
    quotes = relationship("Quote", back_populates="project", cascade="all, delete-orphan")
    status_updates = relationship("ProjectStatusUpdate", back_populates="project", cascade="all, delete-orphan")


class ProjectStatusUpdate(Base):
    """Tracks project status changes with messages for milestone achievement"""
    __tablename__ = "project_status_updates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    status = Column(SQLEnum(ProjectStatus), nullable=False)
    message = Column(Text, nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="status_updates")
    updated_by_user = relationship("User", foreign_keys=[updated_by])


class Appliance(Base):
    __tablename__ = "appliances"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    # Use String columns to store enum values directly (lowercase)
    # This avoids SQLAlchemy's enum name vs value confusion
    category = Column(String, nullable=False)
    appliance_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    power_value = Column(Float, nullable=False)
    power_unit = Column(SQLEnum(PowerUnit), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    hours_per_day = Column(Float, nullable=False)
    is_essential = Column(Boolean, default=False)
    daily_kwh = Column(Float)  # Calculated field
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="appliances")


class SizingResult(Base):
    __tablename__ = "sizing_results"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)
    
    # Inputs
    total_daily_kwh = Column(Float, nullable=False)
    location = Column(String)
    peak_sun_hours = Column(Float)
    panel_brand = Column(String)  # Jinko, Longi, JA
    panel_wattage = Column(Integer)  # 580, 570, 560
    backup_hours = Column(Float)  # For hybrid/off-grid
    essential_load_percent = Column(Float)  # Percentage of load considered essential
    
    # Calculated outputs
    effective_daily_kwh = Column(Float)  # Daily energy after accounting for system losses
    system_size_kw = Column(Float)
    number_of_panels = Column(Integer)
    roof_area_m2 = Column(Float)
    min_inverter_kw = Column(Float)  # Minimum required inverter capacity (calculated)
    inverter_size_kw = Column(Float)  # Total inverter capacity (selected product size)
    inverter_count = Column(Integer, default=1)  # Number of parallel inverters
    inverter_unit_size_kw = Column(Float)  # Size of each inverter unit (selected product size)
    battery_capacity_kwh = Column(Float)
    
    # Design factors used
    system_efficiency = Column(Float)  # e.g., 0.77
    dc_ac_ratio = Column(Float)  # e.g., 1.3
    design_factor = Column(Float)  # Safety margin
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="sizing_result")


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    product_type = Column(SQLEnum(ProductType), nullable=False)
    brand = Column(String)
    model = Column(String)
    wattage = Column(Integer)  # For panels
    capacity_kw = Column(Float)  # For inverters
    capacity_kwh = Column(Float)  # For batteries
    price_type = Column(String)  # "per_panel", "per_watt", "per_kw", "per_kwh", "fixed", "percentage"
    base_price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # E-commerce fields
    name = Column(String)  # Display name for e-commerce
    description = Column(Text)  # Product description
    short_description = Column(Text)  # Short description for listings
    image_url = Column(String)  # Main product image
    gallery_images = Column(JSON)  # Additional images
    category = Column(String)  # E-commerce category (Solar Panels, Inverters, etc.)
    sku = Column(String, unique=True, index=True)  # Stock keeping unit
    stock_quantity = Column(Integer, default=0)  # Inventory quantity
    manage_stock = Column(Boolean, default=False)  # Whether to track inventory
    in_stock = Column(Boolean, default=True)  # Stock status
    weight = Column(Float)  # Product weight for shipping
    dimensions = Column(JSON)  # Length, width, height
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Quote(Base):
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    quote_number = Column(String, unique=True, index=True, nullable=False)
    status = Column(SQLEnum(QuoteStatus), default=QuoteStatus.DRAFT)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Pricing
    equipment_subtotal = Column(Float, default=0.0)
    services_subtotal = Column(Float, default=0.0)
    tax_percent = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount_percent = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    
    # Terms
    validity_days = Column(Integer, default=30)
    payment_terms = Column(Text)
    notes = Column(Text)
    
    # Email tracking
    emailed_at = Column(DateTime(timezone=True))
    emailed_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="quotes")
    created_by_user = relationship("User", foreign_keys=[created_by])
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")


class QuoteItem(Base):
    __tablename__ = "quote_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # Nullable for custom items
    description = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    is_custom = Column(Boolean, default=False)  # True if manually added, not from catalog
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quote = relationship("Quote", back_populates="items")
    product = relationship("Product")


class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String)  # "sizing", "pricing", "company", "email", etc.
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"))


class PeakSunHours(Base):
    __tablename__ = "peak_sun_hours"
    
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    country = Column(String, index=True)
    state = Column(String, index=True)
    peak_sun_hours = Column(Float, nullable=False)
    source = Column(String)  # Reference source
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class MediaItem(Base):
    __tablename__ = "media_items"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)  # Path like /static/media/xxx.jpg
    title = Column(String)
    alt_text = Column(String)
    mime_type = Column(String)
    file_size = Column(Integer)  # Size in bytes
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

