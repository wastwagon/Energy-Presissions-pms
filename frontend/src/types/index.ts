export enum UserRole {
  ADMIN = "admin",
  SALES = "sales",
  VIEWER = "viewer",
}

export enum CustomerType {
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
}

export enum SystemType {
  GRID_TIED = "grid_tied",
  HYBRID = "hybrid",
  OFF_GRID = "off_grid",
}

export enum ProjectStatus {
  NEW = "new",
  QUOTED = "quoted",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  INSTALLED = "installed",
}

export enum ApplianceCategory {
  LIGHTING = "lighting",
  COOLING = "cooling",
  HEATING = "heating",
  COOKING = "cooking",
  REFRIGERATION = "refrigeration",
  LAUNDRY = "laundry",
  ENTERTAINMENT = "entertainment",
  COMPUTING = "computing",
  WATER_HEATING = "water_heating",
  WATER_PUMPING = "water_pumping",
  VENTILATION = "ventilation",
  SECURITY = "security",
  MEDICAL = "medical",
  INDUSTRIAL = "industrial",
  COMMERCIAL = "commercial",
  OTHER = "other",
}

export enum ApplianceType {
  // Lighting
  LED_BULB = "led_bulb",
  CFL_BULB = "cfl_bulb",
  INCANDESCENT = "incandescent",
  FLUORESCENT_TUBE = "fluorescent_tube",
  LED_PANEL = "led_panel",
  STREET_LIGHT = "street_light",
  SECURITY_LIGHT = "security_light",
  // Cooling
  WINDOW_AC = "window_ac",
  SPLIT_AC = "split_ac",
  CENTRAL_AC = "central_ac",
  PORTABLE_AC = "portable_ac",
  CEILING_FAN = "ceiling_fan",
  TABLE_FAN = "table_fan",
  COOLING_EXHAUST_FAN = "cooling_exhaust_fan",
  EVAPORATIVE_COOLER = "evaporative_cooler",
  // Heating
  SPACE_HEATER = "space_heater",
  RADIATOR = "radiator",
  ELECTRIC_FIREPLACE = "electric_fireplace",
  HEAT_PUMP = "heat_pump",
  BASEBOARD_HEATER = "baseboard_heater",
  // Cooking
  ELECTRIC_STOVE = "electric_stove",
  INDUCTION_COOKTOP = "induction_cooktop",
  MICROWAVE = "microwave",
  OVEN = "oven",
  TOASTER = "toaster",
  COFFEE_MAKER = "coffee_maker",
  ELECTRIC_KETTLE = "electric_kettle",
  RICE_COOKER = "rice_cooker",
  SLOW_COOKER = "slow_cooker",
  BLENDER = "blender",
  FOOD_PROCESSOR = "food_processor",
  DISHWASHER = "dishwasher",
  // Refrigeration
  REFRIGERATOR = "refrigerator",
  FREEZER = "freezer",
  WINE_COOLER = "wine_cooler",
  ICE_MAKER = "ice_maker",
  // Laundry
  WASHING_MACHINE = "washing_machine",
  CLOTHES_DRYER = "clothes_dryer",
  IRON = "iron",
  // Entertainment
  TV = "tv",
  TV_42INCH_LED = "tv_42inch_led",
  SOUND_SYSTEM = "sound_system",
  GAMING_CONSOLE = "gaming_console",
  PS5 = "ps5",
  PS4 = "ps4",
  XBOX_SERIES_X = "xbox_series_x",
  PROJECTOR = "projector",
  // Computing
  DESKTOP_PC = "desktop_pc",
  LAPTOP = "laptop",
  MONITOR = "monitor",
  MONITOR_24INCH = "monitor_24inch",
  PRINTER = "printer",
  PRINTER_SMALL = "printer_small",
  PRINTER_LARGE = "printer_large",
  ROUTER = "router",
  SERVER = "server",
  // Water Heating
  WATER_HEATER = "water_heater",
  IMMERSION_HEATER = "immersion_heater",
  GEYSER = "geyser",
  // Water Pumping
  WATER_PUMP = "water_pump",
  SUBMERSIBLE_PUMP = "submersible_pump",
  BOOSTER_PUMP = "booster_pump",
  SEWAGE_PUMP = "sewage_pump",
  // Ventilation
  EXHAUST_FAN = "exhaust_fan",
  VENTILATION_FAN = "ventilation_fan",
  AIR_PURIFIER = "air_purifier",
  HUMIDIFIER = "humidifier",
  DEHUMIDIFIER = "dehumidifier",
  // Security
  CCTV_CAMERA = "cctv_camera",
  ALARM_SYSTEM = "alarm_system",
  ELECTRIC_GATE = "electric_gate",
  // Medical
  OXYGEN_CONCENTRATOR = "oxygen_concentrator",
  CPAP_MACHINE = "cpap_machine",
  MEDICAL_REFRIGERATOR = "medical_refrigerator",
  // Industrial
  COMPRESSOR = "compressor",
  WELDING_MACHINE = "welding_machine",
  GRINDER = "grinder",
  DRILL = "drill",
  SAW = "saw",
  CONVEYOR_BELT = "conveyor_belt",
  INDUSTRIAL_FAN = "industrial_fan",
  INDUSTRIAL_HEATER = "industrial_heater",
  // Commercial
  COMMERCIAL_REFRIGERATOR = "commercial_refrigerator",
  COMMERCIAL_FREEZER = "commercial_freezer",
  COMMERCIAL_OVEN = "commercial_oven",
  COMMERCIAL_DISHWASHER = "commercial_dishwasher",
  ICE_MACHINE = "ice_machine",
  POS_SYSTEM = "pos_system",
  // Other
  CUSTOM = "custom",
  OTHER = "other",
}

export enum PowerUnit {
  W = "W",
  KW = "kW",
  HP = "HP",
}

export enum ProductType {
  PANEL = "panel",
  INVERTER = "inverter",
  BATTERY = "battery",
  MOUNTING = "mounting",
  BOS = "bos",
  INSTALLATION = "installation",
  TRANSPORT = "transport",
  OTHER = "other",
}

export enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  customer_type: CustomerType;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectCreator {
  id: number;
  full_name: string;
  email: string;
}

export interface ProjectStatusUpdate {
  id: number;
  project_id: number;
  status: ProjectStatus;
  message: string;
  updated_by: number;
  created_at: string;
}

export interface Project {
  id: number;
  customer_id: number;
  name: string;
  reference_code?: string;
  system_type: SystemType;
  status: ProjectStatus;
  created_by: number;
  created_at: string;
  updated_at?: string;
  customer?: Customer;
  created_by_user?: ProjectCreator;
  status_updates?: ProjectStatusUpdate[];
}

export interface Appliance {
  id: number;
  project_id: number;
  category: ApplianceCategory;
  appliance_type: ApplianceType;
  description: string;
  power_value: number;
  power_unit: PowerUnit;
  quantity: number;
  hours_per_day: number;
  is_essential: boolean;
  daily_kwh?: number;
  created_at: string;
}

export interface ApplianceTemplate {
  category: string;
  appliance_type: string;
  name: string;
  description: string;
  power_value: number;
  power_unit: string;
  default_hours: number;
  default_quantity: number;
  is_essential: boolean;
  typical_range?: string;
}

export interface SizingResult {
  id: number;
  project_id: number;
  total_daily_kwh: number;
  location?: string;
  peak_sun_hours?: number;
  panel_brand?: string;
  panel_wattage?: number;
  backup_hours?: number;
  essential_load_percent?: number;
  effective_daily_kwh?: number;  // Daily energy after system losses
  system_size_kw?: number;
  number_of_panels?: number;
  roof_area_m2?: number;
  min_inverter_kw?: number;  // Minimum required inverter capacity (calculated)
  inverter_size_kw?: number;  // Total inverter capacity (selected product size)
  inverter_count?: number;  // Number of parallel inverters
  inverter_unit_size_kw?: number;  // Size of each inverter unit (selected product size)
  battery_capacity_kwh?: number;
  system_efficiency?: number;
  dc_ac_ratio?: number;
  design_factor?: number;
  created_at: string;
}

export interface Product {
  id: number;
  product_type: ProductType;
  brand?: string;
  model?: string;
  wattage?: number;
  capacity_kw?: number;
  capacity_kwh?: number;
  price_type: string;
  base_price: number;
  image_url?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
}

export interface Quote {
  id: number;
  project_id: number;
  quote_number: string;
  status: QuoteStatus;
  created_by: number;
  equipment_subtotal: number;
  services_subtotal: number;
  tax_percent: number;
  tax_amount: number;
  discount_percent: number;
  discount_amount: number;
  grand_total: number;
  validity_days: number;
  payment_terms?: string;
  notes?: string;
  emailed_at?: string;
  created_at: string;
  updated_at?: string;
  items?: QuoteItem[];
  project?: Project;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  category?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

