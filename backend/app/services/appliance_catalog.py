"""
Appliance Catalog - Predefined appliances with typical power ratings
This provides a comprehensive list of common residential, commercial, and industrial appliances

Power consumption values are based on real-world research from multiple sources including:
- Energy.gov appliance energy consumption data
- Industry-standard appliance wattage charts
- Manufacturer specifications and typical usage patterns
- Solar installation guides and energy calculators

Values represent typical/average power consumption and may vary by model, size, and usage patterns.
Typical ranges are provided to account for variations across different models and brands.
"""
from typing import Dict, List, Optional
from app.models import ApplianceCategory, ApplianceType, PowerUnit


class ApplianceTemplate:
    """Template for a predefined appliance"""
    def __init__(
        self,
        category: ApplianceCategory,
        appliance_type: ApplianceType,
        name: str,
        description: str,
        power_value: float,
        power_unit: PowerUnit,
        default_hours: float = 0,
        default_quantity: int = 1,
        is_essential: bool = False,
        typical_range: Optional[str] = None
    ):
        self.category = category
        self.appliance_type = appliance_type
        self.name = name
        self.description = description
        self.power_value = power_value
        self.power_unit = power_unit
        self.default_hours = default_hours
        self.default_quantity = default_quantity
        self.is_essential = is_essential
        self.typical_range = typical_range
    
    def to_dict(self):
        return {
            "category": self.category.value,
            "appliance_type": self.appliance_type.value,
            "name": self.name,
            "description": self.description,
            "power_value": self.power_value,
            "power_unit": self.power_unit.value,
            "default_hours": self.default_hours,
            "default_quantity": self.default_quantity,
            "is_essential": self.is_essential,
            "typical_range": self.typical_range
        }


# Comprehensive Appliance Catalog
APPLIANCE_CATALOG: Dict[ApplianceCategory, List[ApplianceTemplate]] = {
    ApplianceCategory.LIGHTING: [
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.LED_BULB,
            "LED Bulb", "Energy-efficient LED light bulb",
            10, PowerUnit.W, 8, 1, False, "5-15W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.LED_BULB_30W,
            "30W LED Bulb", "30W LED light bulb (Ghana typical)",
            30, PowerUnit.W, 8, 1, False, "30W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.LED_BULB_40W,
            "40W LED Bulb", "40W LED light bulb (Ghana typical)",
            40, PowerUnit.W, 8, 1, False, "40W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.CFL_BULB,
            "CFL Bulb", "Compact fluorescent light bulb",
            15, PowerUnit.W, 8, 1, False, "10-25W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.INCANDESCENT,
            "Incandescent Bulb", "Traditional incandescent light bulb",
            60, PowerUnit.W, 8, 1, False, "40-100W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.FLUORESCENT_TUBE,
            "Fluorescent Tube", "Fluorescent tube light",
            40, PowerUnit.W, 10, 1, False, "20-60W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.LED_PANEL,
            "LED Panel", "LED panel light",
            50, PowerUnit.W, 8, 1, False, "30-100W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.LED_SPOT_LIGHT,
            "LED Spot Light", "Indoor LED spot light (Ghana spec)",
            12, PowerUnit.W, 6, 1, False, "10-15W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.LED_SPOT_LIGHT_6W,
            "6W LED Spot Light", "Small 6W LED spot light (Ghana typical)",
            6, PowerUnit.W, 6, 1, False, "6W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.STREET_LIGHT,
            "Street Light", "LED street light",
            100, PowerUnit.W, 12, 1, True, "50-200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LIGHTING, ApplianceType.SECURITY_LIGHT,
            "Security Light", "Outdoor motion-activated security light",
            30, PowerUnit.W, 6, 1, True, "30-100W"
        ),
    ],
    
    ApplianceCategory.COOLING: [
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.WINDOW_AC,
            "Window AC", "Window air conditioner",
            1.5, PowerUnit.HP, 8, 1, False, "0.75-2.5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.SPLIT_AC,
            "Split AC", "Split air conditioner",
            1.5, PowerUnit.HP, 8, 1, False, "1-3 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.SPLIT_AC_1_5HP,
            "1.5 HP Split AC", "1.5 HP split air conditioner (Ghana typical)",
            1.5, PowerUnit.HP, 8, 1, False, "1.5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.SPLIT_AC_2_5HP,
            "2.5 HP Split AC", "2.5 HP split air conditioner (Ghana typical)",
            2.5, PowerUnit.HP, 8, 1, False, "2.5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.CENTRAL_AC,
            "Central AC", "Central air conditioning system",
            5, PowerUnit.HP, 8, 1, False, "3-10 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.PORTABLE_AC,
            "Portable AC", "Portable air conditioner",
            1, PowerUnit.HP, 6, 1, False, "0.75-1.5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.CEILING_FAN,
            "Ceiling Fan", "Ceiling fan (Ghana typical)",
            70, PowerUnit.W, 12, 1, False, "50-175W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.TABLE_FAN,
            "Table Fan", "Table/desk fan",
            50, PowerUnit.W, 8, 1, False, "30-80W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.COOLING_EXHAUST_FAN,
            "Exhaust Fan", "Bathroom/kitchen exhaust fan",
            30, PowerUnit.W, 4, 1, False, "20-50W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOLING, ApplianceType.EVAPORATIVE_COOLER,
            "Evaporative Cooler", "Swamp cooler/evaporative cooler",
            200, PowerUnit.W, 6, 1, False, "100-400W"
        ),
    ],
    
    ApplianceCategory.HEATING: [
        ApplianceTemplate(
            ApplianceCategory.HEATING, ApplianceType.SPACE_HEATER,
            "Space Heater", "Electric space heater",
            1500, PowerUnit.W, 4, 1, False, "1000-2000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.HEATING, ApplianceType.RADIATOR,
            "Electric Radiator", "Electric radiator heater",
            2000, PowerUnit.W, 6, 1, False, "1500-3000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.HEATING, ApplianceType.ELECTRIC_FIREPLACE,
            "Electric Fireplace", "Electric fireplace",
            1500, PowerUnit.W, 4, 1, False, "1000-2000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.HEATING, ApplianceType.HEAT_PUMP,
            "Heat Pump", "Electric heat pump",
            3, PowerUnit.KW, 8, 1, False, "2-5 kW"
        ),
        ApplianceTemplate(
            ApplianceCategory.HEATING, ApplianceType.BASEBOARD_HEATER,
            "Baseboard Heater", "Electric baseboard heater",
            1500, PowerUnit.W, 6, 1, False, "1000-2000W"
        ),
    ],
    
    ApplianceCategory.COOKING: [
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.ELECTRIC_STOVE,
            "Electric Stove", "Electric cooking stove",
            2000, PowerUnit.W, 2, 1, False, "1500-3000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.INDUCTION_COOKTOP,
            "Induction Cooktop", "Induction cooktop",
            1800, PowerUnit.W, 1.5, 1, False, "1200-2400W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.MICROWAVE,
            "Microwave Oven", "Microwave oven",
            800, PowerUnit.W, 0.5, 1, False, "600-1200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.OVEN,
            "Electric Oven", "Electric oven",
            3000, PowerUnit.W, 1, 1, False, "2000-5000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.TOASTER,
            "Toaster", "Electric toaster",
            1000, PowerUnit.W, 0.2, 1, False, "800-1500W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.COFFEE_MAKER,
            "Coffee Maker", "Coffee maker",
            1000, PowerUnit.W, 0.5, 1, False, "800-1200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.ELECTRIC_KETTLE,
            "Electric Kettle", "Electric kettle",
            1500, PowerUnit.W, 0.3, 1, False, "1000-2000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.RICE_COOKER,
            "Rice Cooker", "Rice cooker",
            500, PowerUnit.W, 1, 1, False, "300-800W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.SLOW_COOKER,
            "Slow Cooker", "Slow cooker/Crock-Pot",
            200, PowerUnit.W, 6, 1, False, "100-300W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.BLENDER,
            "Blender", "Electric blender",
            500, PowerUnit.W, 0.2, 1, False, "300-1000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.FOOD_PROCESSOR,
            "Food Processor", "Food processor",
            600, PowerUnit.W, 0.3, 1, False, "400-1000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COOKING, ApplianceType.DISHWASHER,
            "Dishwasher", "Dishwasher",
            1300, PowerUnit.W, 1.5, 1, False, "1200-2400W"
        ),
    ],
    
    ApplianceCategory.REFRIGERATION: [
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.REFRIGERATOR,
            "Refrigerator", "Standard refrigerator (modern frost-free)",
            250, PowerUnit.W, 24, 1, True, "100-800W"
        ),
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.SINGLE_DOOR_FRIDGE,
            "Single Door Fridge", "Single door refrigerator (Ghana typical)",
            150, PowerUnit.W, 24, 1, True, "120-200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.DOUBLE_DOOR_FRIDGE,
            "Double Door Fridge", "Double door refrigerator (Ghana typical)",
            350, PowerUnit.W, 24, 1, True, "300-450W"
        ),
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.TABLE_TOP_FRIDGE,
            "Table Top Fridge", "Small table top/mini refrigerator (Ghana typical)",
            100, PowerUnit.W, 24, 1, True, "80-150W"
        ),
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.FREEZER,
            "Deep Freezer", "Standalone deep freezer (common in Ghana)",
            400, PowerUnit.W, 24, 1, True, "300-500W"
        ),
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.WINE_COOLER,
            "Wine Cooler", "Wine cooler/refrigerator",
            100, PowerUnit.W, 24, 1, False, "50-200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.REFRIGERATION, ApplianceType.ICE_MAKER,
            "Ice Maker", "Ice maker",
            200, PowerUnit.W, 8, 1, False, "100-400W"
        ),
    ],
    
    ApplianceCategory.LAUNDRY: [
        ApplianceTemplate(
            ApplianceCategory.LAUNDRY, ApplianceType.WASHING_MACHINE,
            "Washing Machine", "Washing machine",
            400, PowerUnit.W, 1, 1, False, "350-500W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LAUNDRY, ApplianceType.CLOTHES_DRYER,
            "Clothes Dryer", "Electric clothes dryer",
            3000, PowerUnit.W, 1, 1, False, "2000-5000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.LAUNDRY, ApplianceType.IRON,
            "Iron", "Electric iron",
            1200, PowerUnit.W, 0.5, 1, False, "1000-1800W"
        ),
    ],
    
    ApplianceCategory.ENTERTAINMENT: [
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.TV,
            "TV", "Television (generic)",
            100, PowerUnit.W, 6, 1, False, "50-300W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.TV_40INCH_LED,
            "40-inch LED TV", "40-inch LED television (Ghana typical)",
            90, PowerUnit.W, 6, 1, False, "80-110W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.TV_42INCH_LED,
            "42-inch LED TV", "42-inch LED television",
            120, PowerUnit.W, 6, 1, False, "98-156W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.TV_45INCH_LED,
            "45-inch LED TV", "45-inch LED television (Ghana typical)",
            130, PowerUnit.W, 6, 1, False, "110-150W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.TV_55INCH_LED,
            "55-inch LED TV", "55-inch LED television (Ghana typical)",
            150, PowerUnit.W, 6, 1, False, "130-180W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.TV_65INCH_LED,
            "65-inch LED TV", "65-inch LED television (Ghana typical)",
            180, PowerUnit.W, 6, 1, False, "160-220W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.SOUND_SYSTEM,
            "Sound System", "Audio system/stereo",
            200, PowerUnit.W, 4, 1, False, "100-500W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.GAMING_CONSOLE,
            "Gaming Console", "Video game console (generic)",
            180, PowerUnit.W, 4, 1, False, "160-200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.PS5,
            "PlayStation 5 (PS5)", "Sony PlayStation 5 gaming console",
            180, PowerUnit.W, 4, 1, False, "180W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.PS4,
            "PlayStation 4 (PS4)", "Sony PlayStation 4 gaming console",
            89, PowerUnit.W, 4, 1, False, "89W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.XBOX_SERIES_X,
            "Xbox Series X", "Microsoft Xbox Series X gaming console",
            200, PowerUnit.W, 4, 1, False, "200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.ENTERTAINMENT, ApplianceType.PROJECTOR,
            "Projector", "Video projector",
            300, PowerUnit.W, 3, 1, False, "200-500W"
        ),
    ],
    
    ApplianceCategory.COMPUTING: [
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.DESKTOP_PC,
            "Desktop PC", "Desktop computer (CPU only, monitor separate)",
            200, PowerUnit.W, 8, 1, False, "100-300W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.DESKTOP_PC,
            "Computer Set", "Complete desktop computer system with monitor (Ghana typical)",
            250, PowerUnit.W, 8, 1, False, "200-350W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.LAPTOP,
            "Laptop", "Laptop computer",
            50, PowerUnit.W, 8, 1, False, "30-100W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.MONITOR,
            "Monitor", "Computer monitor (generic)",
            150, PowerUnit.W, 8, 1, False, "50-200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.MONITOR_24INCH,
            "24-inch Monitor", "24-inch computer monitor",
            28, PowerUnit.W, 8, 1, False, "25-30W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.PRINTER,
            "Printer", "Printer (generic)",
            40, PowerUnit.W, 0.5, 1, False, "30-50W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.PRINTER_SMALL,
            "Small Printer", "Small inkjet printer",
            50, PowerUnit.W, 0.5, 1, False, "20-100W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.PRINTER_LARGE,
            "Large Printer", "Large laser printer",
            650, PowerUnit.W, 0.5, 1, False, "650W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.ROUTER,
            "Router", "WiFi router/modem",
            10, PowerUnit.W, 24, 1, False, "5-20W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMPUTING, ApplianceType.SERVER,
            "Server", "Server computer",
            500, PowerUnit.W, 24, 1, True, "200-1000W"
        ),
    ],
    
    ApplianceCategory.WATER_HEATING: [
        ApplianceTemplate(
            ApplianceCategory.WATER_HEATING, ApplianceType.WATER_HEATER,
            "Water Heater", "Electric water heater",
            3000, PowerUnit.W, 2, 1, True, "2000-5000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.WATER_HEATING, ApplianceType.IMMERSION_HEATER,
            "Immersion Heater", "Immersion water heater",
            2000, PowerUnit.W, 2, 1, False, "1500-3000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.WATER_HEATING, ApplianceType.GEYSER,
            "Geyser", "Instant water heater/geyser",
            3000, PowerUnit.W, 1, 1, False, "2000-5000W"
        ),
    ],
    
    ApplianceCategory.WATER_PUMPING: [
        ApplianceTemplate(
            ApplianceCategory.WATER_PUMPING, ApplianceType.WATER_PUMP,
            "Water Pump", "Water pump",
            0.5, PowerUnit.HP, 4, 1, True, "0.25-2 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.WATER_PUMPING, ApplianceType.SUBMERSIBLE_PUMP,
            "Submersible Pump", "Submersible water pump",
            1, PowerUnit.HP, 4, 1, True, "0.5-5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.WATER_PUMPING, ApplianceType.BOOSTER_PUMP,
            "Booster Pump", "Booster pump",
            0.75, PowerUnit.HP, 3, 1, False, "0.5-2 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.WATER_PUMPING, ApplianceType.SEWAGE_PUMP,
            "Sewage Pump", "Sewage pump",
            1.5, PowerUnit.HP, 2, 1, False, "1-5 HP"
        ),
    ],
    
    ApplianceCategory.VENTILATION: [
        ApplianceTemplate(
            ApplianceCategory.VENTILATION, ApplianceType.AIR_PURIFIER,
            "Air Purifier", "Air purifier",
            50, PowerUnit.W, 12, 1, False, "30-100W"
        ),
        ApplianceTemplate(
            ApplianceCategory.VENTILATION, ApplianceType.HUMIDIFIER,
            "Humidifier", "Humidifier",
            100, PowerUnit.W, 8, 1, False, "50-200W"
        ),
        ApplianceTemplate(
            ApplianceCategory.VENTILATION, ApplianceType.DEHUMIDIFIER,
            "Dehumidifier", "Dehumidifier",
            785, PowerUnit.W, 6, 1, False, "200-1000W"
        ),
    ],
    
    ApplianceCategory.SECURITY: [
        ApplianceTemplate(
            ApplianceCategory.SECURITY, ApplianceType.CCTV_CAMERA,
            "CCTV Camera", "Security camera",
            10, PowerUnit.W, 24, 1, True, "5-20W"
        ),
        ApplianceTemplate(
            ApplianceCategory.SECURITY, ApplianceType.ALARM_SYSTEM,
            "Alarm System", "Security alarm system",
            20, PowerUnit.W, 24, 1, True, "10-50W"
        ),
        ApplianceTemplate(
            ApplianceCategory.SECURITY, ApplianceType.ELECTRIC_GATE,
            "Electric Gate", "Electric gate motor",
            500, PowerUnit.W, 0.1, 1, False, "300-1000W"
        ),
    ],
    
    ApplianceCategory.MEDICAL: [
        ApplianceTemplate(
            ApplianceCategory.MEDICAL, ApplianceType.OXYGEN_CONCENTRATOR,
            "Oxygen Concentrator", "Medical oxygen concentrator",
            300, PowerUnit.W, 24, 1, True, "200-500W"
        ),
        ApplianceTemplate(
            ApplianceCategory.MEDICAL, ApplianceType.CPAP_MACHINE,
            "CPAP Machine", "CPAP machine",
            60, PowerUnit.W, 8, 1, True, "30-100W"
        ),
        ApplianceTemplate(
            ApplianceCategory.MEDICAL, ApplianceType.MEDICAL_REFRIGERATOR,
            "Medical Refrigerator", "Medical refrigerator",
            200, PowerUnit.W, 24, 1, True, "150-400W"
        ),
    ],
    
    ApplianceCategory.INDUSTRIAL: [
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.COMPRESSOR,
            "Air Compressor", "Industrial air compressor",
            5, PowerUnit.HP, 4, 1, False, "2-20 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.WELDING_MACHINE,
            "Welding Machine", "Arc welding machine",
            5, PowerUnit.KW, 2, 1, False, "3-10 kW"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.GRINDER,
            "Grinder", "Industrial grinder",
            2, PowerUnit.HP, 2, 1, False, "1-5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.DRILL,
            "Drill", "Industrial drill",
            1, PowerUnit.HP, 1, 1, False, "0.5-3 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.SAW,
            "Saw", "Industrial saw",
            2, PowerUnit.HP, 2, 1, False, "1-5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.CONVEYOR_BELT,
            "Conveyor Belt", "Conveyor belt system",
            3, PowerUnit.HP, 8, 1, False, "2-10 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.INDUSTRIAL_FAN,
            "Industrial Fan", "Large industrial fan",
            1, PowerUnit.HP, 8, 1, False, "0.5-5 HP"
        ),
        ApplianceTemplate(
            ApplianceCategory.INDUSTRIAL, ApplianceType.INDUSTRIAL_HEATER,
            "Industrial Heater", "Industrial heating system",
            10, PowerUnit.KW, 6, 1, False, "5-50 kW"
        ),
    ],
    
    ApplianceCategory.COMMERCIAL: [
        ApplianceTemplate(
            ApplianceCategory.COMMERCIAL, ApplianceType.COMMERCIAL_REFRIGERATOR,
            "Commercial Refrigerator", "Commercial refrigerator",
            500, PowerUnit.W, 24, 1, True, "300-1000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMMERCIAL, ApplianceType.COMMERCIAL_FREEZER,
            "Commercial Freezer", "Commercial freezer",
            800, PowerUnit.W, 24, 1, True, "500-1500W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMMERCIAL, ApplianceType.COMMERCIAL_OVEN,
            "Commercial Oven", "Commercial oven",
            10, PowerUnit.KW, 4, 1, False, "5-20 kW"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMMERCIAL, ApplianceType.COMMERCIAL_DISHWASHER,
            "Commercial Dishwasher", "Commercial dishwasher",
            5, PowerUnit.KW, 3, 1, False, "3-10 kW"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMMERCIAL, ApplianceType.ICE_MACHINE,
            "Ice Machine", "Commercial ice machine",
            1000, PowerUnit.W, 12, 1, False, "500-2000W"
        ),
        ApplianceTemplate(
            ApplianceCategory.COMMERCIAL, ApplianceType.POS_SYSTEM,
            "POS System", "Point of sale system",
            50, PowerUnit.W, 12, 1, False, "30-100W"
        ),
    ],
}


def get_appliances_by_category(category: Optional[ApplianceCategory] = None) -> Dict[str, List[dict]]:
    """Get appliances grouped by category"""
    if category:
        return {
            category.value: [t.to_dict() for t in APPLIANCE_CATALOG.get(category, [])]
        }
    return {
        cat.value: [t.to_dict() for t in templates]
        for cat, templates in APPLIANCE_CATALOG.items()
    }


def get_appliance_template(category: ApplianceCategory, appliance_type: ApplianceType) -> Optional[ApplianceTemplate]:
    """Get a specific appliance template"""
    templates = APPLIANCE_CATALOG.get(category, [])
    for template in templates:
        if template.appliance_type == appliance_type:
            return template
    return None


def search_appliances(query: str) -> List[dict]:
    """Search appliances by name or description"""
    results = []
    query_lower = query.lower()
    for templates in APPLIANCE_CATALOG.values():
        for template in templates:
            if (query_lower in template.name.lower() or 
                query_lower in template.description.lower()):
                results.append(template.to_dict())
    return results

