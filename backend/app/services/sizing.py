"""
Solar PV System Sizing Calculations

This module implements sizing calculations based on industry best practices.
All factors are configurable through the Settings table.

References:
- PV system efficiency: 75-80% (accounts for inverter, wiring, temperature, soiling losses)
- DC/AC ratio: 1.2-1.3 maximum (prevents inverter clipping)
- Panel area: ~2.6 m² per panel (typical for 500-600W panels)
- Spacing factor: 1.1-1.2 (accounts for mounting structure spacing)
- Battery DoD: 80% for lithium batteries
"""
from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from app.models import Setting, PeakSunHours, Product, ProductType
from app.schemas import SizingInput, SizingResult
import math


def get_setting_value(db: Session, key: str, default: float) -> float:
    """Get a setting value as float, or return default"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        try:
            return float(setting.value)
        except (ValueError, TypeError):
            return default
    return default


def get_peak_sun_hours(db: Session, location: Optional[str]) -> Optional[float]:
    """Get peak sun hours for a location"""
    if not location:
        return None
    
    # Try to find by city, state, or country
    location_lower = location.lower()
    psd = db.query(PeakSunHours).filter(
        (PeakSunHours.city.ilike(f"%{location_lower}%")) |
        (PeakSunHours.state.ilike(f"%{location_lower}%")) |
        (PeakSunHours.country.ilike(f"%{location_lower}%"))
    ).first()
    
    if psd:
        return psd.peak_sun_hours
    
    # Default fallback
    return get_setting_value(db, "default_peak_sun_hours", 5.0)


def get_panel_wattage(panel_brand: str) -> int:
    """Get panel wattage based on brand"""
    panel_map = {
        "Jinko": 580,
        "Longi": 570,
        "JA": 560
    }
    return panel_map.get(panel_brand, 580)


def calculate_parallel_inverters(
    required_kw: float,
    available_sizes: List[float],
    max_parallel: int = 4,
    use_parallel: bool = True,
    prefer_parallel_above_kw: float = 30.0
) -> Dict:
    """
    Calculate optimal parallel inverter configuration
    
    Priority:
    1. For systems > prefer_parallel_above_kw: Prefer parallel inverters (better for 48V batteries, redundancy)
    2. For smaller systems: Use single inverter if available, otherwise parallel
    3. Parallel inverters (if no single inverter is sufficient)
    
    Args:
        required_kw: Required total inverter capacity
        available_sizes: List of available inverter sizes in kW (sorted ascending)
        max_parallel: Maximum number of inverters that can be paralleled
        use_parallel: Whether to use parallel inverters (if False, returns single large inverter)
        prefer_parallel_above_kw: Prefer parallel inverters for systems above this threshold (default 30kW)
    
    Returns:
        Dict with:
            - count: Number of inverters
            - unit_size: Size of each inverter in kW
            - total_capacity: Total capacity in kW
            - configuration: List of inverter sizes (for multiple different sizes)
    """
    if not available_sizes:
        # No sizes available, use calculated size
        single_size = max(6.5, math.ceil(required_kw * 2) / 2)
        return {
            "count": 1,
            "unit_size": single_size,
            "total_capacity": single_size,
            "configuration": [single_size]
        }
    
    # For large systems (>30kW), prefer parallel inverters for:
    # - Better compatibility with 48V batteries (lower current per inverter)
    # - Redundancy (if one fails, others continue)
    # - Easier installation and maintenance
    prefer_parallel = required_kw > prefer_parallel_above_kw and use_parallel
    
    if not prefer_parallel:
        # PRIORITY 1: For smaller systems, check if a single inverter can meet the requirement
        # Find the smallest single inverter that is >= required_kw
        single_inverter = None
        for size in available_sizes:
            if size >= required_kw:
                single_inverter = size
                break  # Use the smallest that meets requirement
        
        # If found, use single inverter (don't parallel if one size fits)
        if single_inverter:
            return {
                "count": 1,
                "unit_size": single_inverter,
                "total_capacity": single_inverter,
                "configuration": [single_inverter]
            }
    
    # PRIORITY 2: No single inverter is sufficient, use parallel inverters
    # (Only if use_parallel is enabled)
    if not use_parallel:
        # Parallel disabled, use calculated size
        single_size = max(6.5, math.ceil(required_kw * 2) / 2)
        return {
            "count": 1,
            "unit_size": single_size,
            "total_capacity": single_size,
            "configuration": [single_size]
        }
    
    # Find the best parallel configuration
    best_config = None
    best_waste = float('inf')
    
    # Try different combinations
    for size in available_sizes:
        # Calculate how many of this size we need
        count = math.ceil(required_kw / size)
        
        # Check if within max parallel limit
        if count > max_parallel:
            continue
        
        total_capacity = count * size
        waste = total_capacity - required_kw  # Excess capacity
        
        # Prefer configurations with less waste
        if waste < best_waste or (waste == best_waste and count < best_config["count"]):
            best_waste = waste
            best_config = {
                "count": count,
                "unit_size": size,
                "total_capacity": total_capacity,
                "configuration": [size] * count
            }
    
    # If no good parallel config found, use calculated single size
    if not best_config:
        single_size = max(6.5, math.ceil(required_kw * 2) / 2)
        return {
            "count": 1,
            "unit_size": single_size,
            "total_capacity": single_size,
            "configuration": [single_size]
        }
    
    return best_config


def calculate_sizing(db: Session, sizing_input: SizingInput) -> SizingResult:
    """
    Calculate PV system sizing based on daily energy requirements
    
    Formula:
    1. Account for system losses: effective_daily_kwh = daily_kwh / system_efficiency
    2. Calculate system size: system_size_kw = effective_daily_kwh / peak_sun_hours
    3. Apply design factor (safety margin): system_size_kw *= design_factor
    4. Calculate panels: panels = ceil(system_size_kw * 1000 / panel_wattage)
    5. Calculate roof area: roof_area = panels * panel_area * spacing_factor
    6. Calculate inverter: min_inverter_kw = system_size_kw / max_dc_ac_ratio
    7. Calculate battery (if needed): battery_kwh = (essential_load_kw * backup_hours) / dod
    """
    # Get configurable factors from settings (Ghana-optimized defaults)
    system_efficiency = get_setting_value(db, "system_efficiency", 0.72)  # 72% default for Ghana
    design_factor = get_setting_value(db, "design_factor", 1.20)  # 20% safety margin for Ghana
    max_dc_ac_ratio = get_setting_value(db, "max_dc_ac_ratio", 1.3)
    panel_area_m2 = get_setting_value(db, "panel_area_m2", 2.6)
    spacing_factor = get_setting_value(db, "spacing_factor", 1.15)
    battery_dod = get_setting_value(db, "battery_dod", 0.85)  # 85% depth of discharge for modern LiFePO4
    battery_c_rate = get_setting_value(db, "battery_c_rate", 0.5)  # 0.5C = can discharge 50% of capacity per hour (typical for LiFePO4)
    battery_discharge_efficiency = get_setting_value(db, "battery_discharge_efficiency", 0.90)  # 90% efficiency for battery → inverter → load (accounts for inverter losses)
    min_battery_size = get_setting_value(db, "min_battery_size_kwh", 5.0)
    
    # Get peak sun hours
    peak_sun_hours = get_peak_sun_hours(db, sizing_input.location)
    if not peak_sun_hours:
        peak_sun_hours = get_setting_value(db, "default_peak_sun_hours", 5.2)  # Ghana average default
    
    # Get panel wattage
    panel_wattage = get_panel_wattage(sizing_input.panel_brand)
    
    # Step 1: Account for system losses
    effective_daily_kwh = sizing_input.total_daily_kwh / system_efficiency
    
    # Step 2: Calculate system size
    system_size_kw = effective_daily_kwh / peak_sun_hours
    
    # Step 3: Apply design factor (safety margin)
    system_size_kw *= design_factor
    
    # Step 4: Calculate number of panels
    import math
    number_of_panels = math.ceil(system_size_kw * 1000 / panel_wattage)
    
    # Calculate actual panel array capacity (using actual number of panels)
    panel_array_capacity_kw = (number_of_panels * panel_wattage) / 1000
    
    # Step 5: Calculate roof area
    roof_area_m2 = number_of_panels * panel_area_m2 * spacing_factor
    
    # Step 6: Calculate inverter size (with parallel inverter support)
    min_inverter_kw = system_size_kw / max_dc_ac_ratio
    
    # Get parallel inverter configuration settings
    use_parallel_inverters = get_setting_value(db, "use_parallel_inverters", 1.0)  # 1.0 = enabled
    
    # Get standard inverter sizes from settings (for parallel configuration)
    standard_inverter_sizes_setting = db.query(Setting).filter(Setting.key == "standard_inverter_sizes").first()
    if standard_inverter_sizes_setting:
        standard_inverter_sizes_str = standard_inverter_sizes_setting.value
    else:
        standard_inverter_sizes_str = "10,15,20,25,30"
    
    max_parallel_inverters = get_setting_value(db, "max_parallel_inverters", 4.0)  # Maximum inverters in parallel
    prefer_parallel_above_kw = get_setting_value(db, "prefer_parallel_above_kw", 30.0)  # Prefer parallel above this threshold
    
    # Get actual available inverter sizes from product catalog
    # This ensures we check real products, not just configured standard sizes
    actual_inverter_products = db.query(Product).filter(
        Product.product_type == ProductType.INVERTER,
        Product.is_active == True
    ).order_by(Product.capacity_kw.asc()).all()
    
    actual_inverter_sizes = [float(p.capacity_kw) for p in actual_inverter_products if p.capacity_kw]
    
    # Parse standard inverter sizes (for parallel configuration)
    try:
        standard_sizes = [float(x.strip()) for x in standard_inverter_sizes_str.split(",")]
        standard_sizes.sort()  # Sort ascending
    except:
        # Default sizes if parsing fails
        standard_sizes = [10.0, 15.0, 20.0, 25.0, 30.0]
    
    # Combine actual product sizes with standard sizes, remove duplicates, and sort
    # This ensures we check actual products first, but can also use standard sizes for parallel config
    all_available_sizes = list(set(actual_inverter_sizes + standard_sizes))
    all_available_sizes.sort()
    
    # Use combined list for inverter selection
    inverter_sizes = all_available_sizes
    
    # Calculate parallel inverter configuration
    inverter_config = calculate_parallel_inverters(
        required_kw=min_inverter_kw,
        available_sizes=inverter_sizes,
        max_parallel=int(max_parallel_inverters),
        use_parallel=use_parallel_inverters > 0,
        prefer_parallel_above_kw=prefer_parallel_above_kw
    )
    
    # Store inverter configuration
    inverter_size_kw = inverter_config["total_capacity"]
    inverter_count = inverter_config["count"]
    inverter_unit_size = inverter_config["unit_size"]
    
    # Calculate DC/AC ratio using actual panel array capacity
    dc_ac_ratio = panel_array_capacity_kw / inverter_size_kw
    
    # Step 7: Calculate battery
    # For HYBRID and OFF_GRID systems, batteries are essential
    # For GRID_TIED systems, only add if backup_hours > 0
    battery_capacity_kwh = None
    system_type = getattr(sizing_input, 'system_type', None)
    
    # Determine if battery is needed
    needs_battery = False
    backup_hours_to_use = sizing_input.backup_hours or 0
    
    if system_type:
        # If system type is provided, use it to determine battery need
        if system_type.value in ['hybrid', 'off_grid']:
            # HYBRID and OFF_GRID systems always need batteries
            needs_battery = True
            # Default backup hours if not specified:
            # - OFF_GRID: 24 hours (full day backup)
            # - HYBRID: 8 hours (typical backup for grid outages)
            if not sizing_input.backup_hours or sizing_input.backup_hours == 0:
                backup_hours_to_use = 24.0 if system_type.value == 'off_grid' else 8.0
        elif system_type.value == 'grid_tied':
            # GRID_TIED only needs battery if backup_hours > 0
            needs_battery = sizing_input.backup_hours and sizing_input.backup_hours > 0
            backup_hours_to_use = sizing_input.backup_hours or 0
    else:
        # Fallback: use backup_hours if provided
        needs_battery = sizing_input.backup_hours and sizing_input.backup_hours > 0
        backup_hours_to_use = sizing_input.backup_hours or 0
    
    if needs_battery and backup_hours_to_use > 0:
        # Estimate essential load (use percentage if provided, else assume 50%)
        # This is the AC load requirement (what the user needs)
        essential_percent = sizing_input.essential_load_percent or 0.5
        essential_load_kw_ac = (sizing_input.total_daily_kwh / 24) * essential_percent
        
        # Account for battery discharge efficiency (battery DC → inverter → AC load)
        # If load needs 5kW AC, battery must provide: 5kW / efficiency = 5.56kW DC (at 90% efficiency)
        essential_load_kw_dc = essential_load_kw_ac / battery_discharge_efficiency
        
        # Step 1: Calculate battery capacity based on ENERGY requirement
        # Formula: capacity = (load_power_dc × backup_hours) / depth_of_discharge
        # We use DC power because battery stores/discharges DC
        battery_capacity_kwh_energy = (essential_load_kw_dc * backup_hours_to_use) / battery_dod
        
        # Step 2: Calculate battery capacity based on POWER requirement (C-rate)
        # Formula: capacity = load_power_dc / (C-rate × DOD)
        # The battery must be able to deliver the required DC power continuously
        # Max power battery can deliver = C-rate × Capacity × DOD
        # Therefore: Capacity = load_power_dc / (C-rate × DOD)
        battery_capacity_kwh_power = essential_load_kw_dc / (battery_c_rate * battery_dod)
        
        # Step 3: Use the LARGER of the two (must satisfy both energy AND power requirements)
        battery_capacity_kwh = max(battery_capacity_kwh_energy, battery_capacity_kwh_power)
        
        # Round to nearest multiple of 5 kWh, minimum min_battery_size
        battery_capacity_kwh = max(min_battery_size, math.ceil(battery_capacity_kwh / 5) * 5)
    
    # Create sizing result
    sizing_result = SizingResult(
        project_id=sizing_input.project_id,
        total_daily_kwh=sizing_input.total_daily_kwh,
        location=sizing_input.location,
        peak_sun_hours=peak_sun_hours,
        panel_brand=sizing_input.panel_brand,
        panel_wattage=panel_wattage,
        backup_hours=backup_hours_to_use if needs_battery else (sizing_input.backup_hours or 0),
        essential_load_percent=sizing_input.essential_load_percent or 0.5,
        effective_daily_kwh=round(effective_daily_kwh, 2),  # Store calculated effective energy
        system_size_kw=round(system_size_kw, 2),
        number_of_panels=number_of_panels,
        roof_area_m2=round(roof_area_m2, 2),
        min_inverter_kw=round(min_inverter_kw, 1),  # Minimum required (calculated)
        inverter_size_kw=round(inverter_size_kw, 1),  # Selected product size
        inverter_count=inverter_config["count"],  # Number of parallel inverters
        inverter_unit_size_kw=round(inverter_config["unit_size"], 1),  # Selected product unit size
        battery_capacity_kwh=round(battery_capacity_kwh, 1) if battery_capacity_kwh else None,
        system_efficiency=system_efficiency,
        dc_ac_ratio=round(dc_ac_ratio, 2),  # Use actual panel array capacity for accurate ratio
        design_factor=design_factor
    )
    
    return sizing_result

