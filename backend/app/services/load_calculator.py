"""
Load Calculation Service

Calculates daily energy consumption from appliances.
Handles unit conversions (HP to Watts) and duty cycles.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Appliance, Setting
from app.schemas import ApplianceCreate


def get_setting_value(db: Session, key: str, default: float) -> float:
    """Get a setting value as float, or return default"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        try:
            return float(setting.value)
        except (ValueError, TypeError):
            return default
    return default


def hp_to_watts(hp: float, db: Session, appliance_type: str = "ac") -> float:
    """
    Convert HP to Watts
    
    For AC units: 1 HP ≈ 900W (accounts for compressor efficiency)
    For motors/pumps: 1 HP ≈ 746W (standard conversion)
    """
    if appliance_type.lower() in ["ac", "air_conditioner", "air conditioner"]:
        conversion_factor = get_setting_value(db, "hp_to_watts_ac", 900.0)
    else:
        conversion_factor = get_setting_value(db, "hp_to_watts_motor", 746.0)
    
    return hp * conversion_factor


def get_duty_cycle(db: Session, appliance_type: str) -> float:
    """
    Get duty cycle factor for an appliance type
    
    Duty cycle accounts for the fact that appliances don't run continuously.
    - Refrigerators: 50-70% (default 0.6)
    - AC units: Based on usage hours (already accounted in hours_per_day)
    - Other: 1.0 (no adjustment)
    """
    if appliance_type.lower() in ["fridge", "freezer", "refrigerator"]:
        return get_setting_value(db, "fridge_duty_cycle", 0.6)
    # AC and other appliances: duty cycle is already reflected in hours_per_day
    return 1.0


def calculate_appliance_daily_kwh(
    power_value: float,
    power_unit: str,
    quantity: int,
    hours_per_day: float,
    appliance_type: str,
    db: Session
) -> float:
    """
    Calculate daily kWh for a single appliance
    
    Steps:
    1. Convert power to Watts (handle HP, kW, W)
    2. Apply duty cycle if applicable
    3. Calculate: daily_kwh = (power_w * quantity * hours_per_day * duty_cycle) / 1000
    """
    # Convert to Watts
    if power_unit.upper() == "HP":
        power_watts = hp_to_watts(power_value, db, appliance_type)
    elif power_unit.upper() == "KW":
        power_watts = power_value * 1000
    else:  # W
        power_watts = power_value
    
    # Get duty cycle
    duty_cycle = get_duty_cycle(db, appliance_type)
    
    # Calculate daily kWh
    daily_wh = power_watts * quantity * hours_per_day * duty_cycle
    daily_kwh = daily_wh / 1000
    
    return round(daily_kwh, 3)


def calculate_total_daily_kwh(db: Session, project_id: int, apply_diversity_factor: bool = True) -> float:
    """
    Calculate total daily kWh for all appliances in a project
    
    Args:
        db: Database session
        project_id: Project ID
        apply_diversity_factor: If True, apply load diversity factor to account for 
                               simultaneous usage (not all appliances on at once)
    
    Returns:
        Total daily kWh consumption (adjusted for diversity if enabled)
    """
    appliances = db.query(Appliance).filter(Appliance.project_id == project_id).all()
    
    total_kwh = 0.0
    for appliance in appliances:
        if appliance.daily_kwh:
            total_kwh += appliance.daily_kwh
        else:
            # Calculate if not already calculated
            daily_kwh = calculate_appliance_daily_kwh(
                appliance.power_value,
                appliance.power_unit.value,
                appliance.quantity,
                appliance.hours_per_day,
                appliance.appliance_type.value,
                db
            )
            appliance.daily_kwh = daily_kwh
            total_kwh += daily_kwh
    
    # Apply load diversity factor to account for realistic simultaneous usage
    # Not all appliances will be on at the same time - people manage their usage
    if apply_diversity_factor:
        diversity_factor = get_setting_value(db, "load_diversity_factor", 0.65)  # Default 65% simultaneous usage
        total_kwh = total_kwh * diversity_factor
    
    db.commit()
    return round(total_kwh, 3)


def calculate_from_monthly_consumption(
    monthly_kwh: Optional[float] = None,
    monthly_bill: Optional[float] = None,
    tariff: Optional[float] = None
) -> float:
    """
    Calculate daily kWh from monthly consumption data
    
    If monthly_bill and tariff provided, calculate monthly_kwh first
    Then: daily_kwh = monthly_kwh / 30
    """
    if monthly_kwh is None:
        if monthly_bill and tariff and tariff > 0:
            monthly_kwh = monthly_bill / tariff
        else:
            raise ValueError("Either monthly_kwh or (monthly_bill and tariff) must be provided")
    
    daily_kwh = monthly_kwh / 30
    return round(daily_kwh, 3)








