"""
Pricing Service

Generates quote items from sizing results based on product catalog.
Falls back to settings values when products are not found.
"""
from typing import List
from sqlalchemy.orm import Session
from app.models import Product, QuoteItem, SizingResult as SizingResultModel, ProductType, Setting
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


def generate_quote_items_from_sizing(
    db: Session,
    sizing_result: SizingResultModel,
    quote_id: int
) -> List[QuoteItem]:
    """
    Generate quote items from sizing result
    
    Creates line items for:
    - PV panels (based on brand and quantity)
    - Inverter (based on calculated size)
    - Battery (if applicable)
    - Mounting structure
    - BOS (Balance of System)
    - Installation
    - Transport
    """
    items = []
    sort_order = 0
    
    # 1. PV Panels
    # Try exact match first
    panel_product = db.query(Product).filter(
        Product.product_type == ProductType.PANEL,
        Product.brand.ilike(f"%{sizing_result.panel_brand}%"),
        Product.wattage == sizing_result.panel_wattage,
        Product.is_active == True
    ).first()
    
    # If no exact match, try brand match only (case-insensitive)
    if not panel_product:
        panel_product = db.query(Product).filter(
            Product.product_type == ProductType.PANEL,
            Product.brand.ilike(f"%{sizing_result.panel_brand}%"),
            Product.is_active == True
        ).first()
    
    # If still no match, get any active panel product
    if not panel_product:
        panel_product = db.query(Product).filter(
            Product.product_type == ProductType.PANEL,
            Product.is_active == True
        ).first()
    
    if panel_product:
        if panel_product.price_type == "per_panel":
            unit_price = panel_product.base_price
        elif panel_product.price_type == "per_watt":
            unit_price = panel_product.base_price * (sizing_result.panel_wattage / 1000)
        else:
            unit_price = panel_product.base_price
        
        # Use sizing result wattage if product wattage is not set
        panel_wattage = panel_product.wattage or sizing_result.panel_wattage
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=panel_product.id,
            description=f"{panel_product.brand or sizing_result.panel_brand} {panel_wattage}W Panel",
            quantity=sizing_result.number_of_panels,
            unit_price=unit_price,
            total_price=unit_price * sizing_result.number_of_panels,
            sort_order=sort_order
        ))
        sort_order += 1
    
    # 2. Inverter(s) - Support for parallel inverters
    inverter_count = getattr(sizing_result, 'inverter_count', 1) or 1
    inverter_unit_size = getattr(sizing_result, 'inverter_unit_size_kw', sizing_result.inverter_size_kw) or sizing_result.inverter_size_kw
    
    # Find inverter product matching the calculated unit size
    # Priority: exact match > closest smaller > closest larger
    target_size = inverter_unit_size if inverter_count > 1 else sizing_result.inverter_size_kw
    
    # First, try to find exact match
    inverter_product = db.query(Product).filter(
        Product.product_type == ProductType.INVERTER,
        Product.capacity_kw == target_size,
        Product.is_active == True
    ).first()
    
    # If no exact match, try closest smaller (can use more units if needed)
    if not inverter_product:
        inverter_product = db.query(Product).filter(
            Product.product_type == ProductType.INVERTER,
            Product.capacity_kw <= target_size,
            Product.is_active == True
        ).order_by(Product.capacity_kw.desc()).first()
    
    # If still no match, try closest larger (but prefer not to oversize)
    if not inverter_product:
        inverter_product = db.query(Product).filter(
            Product.product_type == ProductType.INVERTER,
            Product.capacity_kw >= target_size,
            Product.is_active == True
        ).order_by(Product.capacity_kw.asc()).first()
    
    # Last resort: get any available inverter
    if not inverter_product:
        inverter_product = db.query(Product).filter(
            Product.product_type == ProductType.INVERTER,
            Product.is_active == True
        ).order_by(Product.capacity_kw.asc()).first()
    
    if inverter_product:
        # Calculate unit price based on price type
        if inverter_product.price_type == "per_kw":
            unit_price = inverter_product.base_price * inverter_unit_size
        elif inverter_product.price_type == "fixed":
            unit_price = inverter_product.base_price
        else:
            unit_price = inverter_product.base_price
        
        # Use the calculated unit size from sizing result (not product capacity)
        # This ensures we use the size that was calculated, not what's in the product catalog
        inverter_capacity = inverter_unit_size
        
        # Create description based on parallel or single inverter
        if inverter_count > 1:
            description = f"{inverter_product.brand or 'Energy Precisions'} {inverter_product.model or ''} {inverter_capacity}kW Inverter (×{inverter_count} parallel)"
        else:
            description = f"{inverter_product.brand or 'Energy Precisions'} {inverter_product.model or ''} {inverter_capacity}kW Inverter"
        
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=inverter_product.id,
            description=description,
            quantity=inverter_count,
            unit_price=unit_price,
            total_price=unit_price * inverter_count,
            sort_order=sort_order
        ))
        sort_order += 1
    
    # 3. Battery (if applicable)
    # Add batteries if battery capacity is calculated (for HYBRID/OFF_GRID systems)
    # OR if backup hours are specified (for GRID_TIED with backup)
    if (sizing_result.battery_capacity_kwh and 
        sizing_result.battery_capacity_kwh > 0):
        
        # Strategy: Prefer larger batteries to minimize quantity and cost
        # First, try to find a single battery that meets the requirement
        single_battery = db.query(Product).filter(
            Product.product_type == ProductType.BATTERY,
            Product.capacity_kwh >= sizing_result.battery_capacity_kwh,
            Product.is_active == True
        ).order_by(Product.capacity_kwh.asc()).first()
        
        if single_battery:
            # Use single large battery
            battery_product = single_battery
            num_batteries = 1
        else:
            # No single battery large enough, find the largest available battery
            # Prefer 16kWh batteries specifically for cost efficiency in Ghana
            battery_product = db.query(Product).filter(
                Product.product_type == ProductType.BATTERY,
                Product.capacity_kwh == 16.0,  # Prefer 16kWh specifically
                Product.is_active == True
            ).first()
            
            # If 16kWh not available, try other large batteries (10kWh+)
            if not battery_product:
                battery_product = db.query(Product).filter(
                    Product.product_type == ProductType.BATTERY,
                    Product.capacity_kwh >= 10.0,
                    Product.is_active == True
                ).order_by(Product.capacity_kwh.desc()).first()  # Get largest first
            
            # Fallback to any battery >= 5kWh if no larger available
            if not battery_product:
                battery_product = db.query(Product).filter(
                    Product.product_type == ProductType.BATTERY,
                    Product.capacity_kwh >= 5.0,
                    Product.is_active == True
                ).order_by(Product.capacity_kwh.desc()).first()  # Get largest available
            
            if battery_product:
                # Calculate number of battery units needed
                num_batteries = math.ceil(sizing_result.battery_capacity_kwh / battery_product.capacity_kwh)
                
                # Safety check: Cap at reasonable maximum (e.g., 20 batteries)
                # If more needed, suggest larger battery or reduce backup hours
                if num_batteries > 20:
                    # Try to find a larger battery to reduce quantity
                    larger_battery = db.query(Product).filter(
                        Product.product_type == ProductType.BATTERY,
                        Product.capacity_kwh >= (sizing_result.battery_capacity_kwh / 20),
                        Product.is_active == True
                    ).order_by(Product.capacity_kwh.desc()).first()
                    
                    if larger_battery:
                        battery_product = larger_battery
                        num_batteries = math.ceil(sizing_result.battery_capacity_kwh / battery_product.capacity_kwh)
        
        if battery_product:
            if battery_product.price_type == "per_kwh":
                unit_price = battery_product.base_price * battery_product.capacity_kwh
            elif battery_product.price_type == "fixed":
                unit_price = battery_product.base_price
            else:
                unit_price = battery_product.base_price
            
            items.append(QuoteItem(
                quote_id=quote_id,
                product_id=battery_product.id,
                description=f"{battery_product.brand or ''} {battery_product.capacity_kwh}kWh Battery",
                quantity=num_batteries,
                unit_price=unit_price,
                total_price=unit_price * num_batteries,
                sort_order=sort_order
            ))
            sort_order += 1
    
    # 4. Mounting Structure
    mounting_product = db.query(Product).filter(
        Product.product_type == ProductType.MOUNTING,
        Product.is_active == True
    ).first()
    
    if mounting_product:
        if mounting_product.price_type == "per_kw":
            unit_price = mounting_product.base_price * sizing_result.system_size_kw
        elif mounting_product.price_type == "per_panel":
            unit_price = mounting_product.base_price * sizing_result.number_of_panels
        elif mounting_product.price_type == "fixed":
            unit_price = mounting_product.base_price
        else:
            unit_price = mounting_product.base_price
        
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=mounting_product.id,
            description="Mounting Structure",
            quantity=1,
            unit_price=unit_price,
            total_price=unit_price,
            sort_order=sort_order
        ))
        sort_order += 1
    
    # 5. BOS (Balance of System)
    # Calculate equipment total first (panels, inverter, battery)
    equipment_total = sum(item.total_price for item in items)
    
    bos_product = db.query(Product).filter(
        Product.product_type == ProductType.BOS,
        Product.is_active == True
    ).first()
    
    if bos_product:
        # Use product pricing
        if bos_product.price_type == "percentage":
            unit_price = equipment_total * (bos_product.base_price / 100)
        elif bos_product.price_type == "per_kw":
            unit_price = bos_product.base_price * sizing_result.system_size_kw
        elif bos_product.price_type == "fixed":
            unit_price = bos_product.base_price
        else:
            unit_price = bos_product.base_price
        
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=bos_product.id,
            description="Balance of System (BOS)",
            quantity=1,
            unit_price=unit_price,
            total_price=unit_price,
            sort_order=sort_order
        ))
        sort_order += 1
    else:
        # Fallback to settings: bos_percentage
        bos_percentage = get_setting_value(db, "bos_percentage", 10.0)
        unit_price = equipment_total * (bos_percentage / 100)
        
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=None,  # No product, using setting
            description=f"Balance of System (BOS) - {bos_percentage}% of equipment",
            quantity=1,
            unit_price=unit_price,
            total_price=unit_price,
            sort_order=sort_order
        ))
        sort_order += 1
    
    # Equipment total for installation % (panels, inverter, battery, mounting, BOS only – exclude transport)
    total_equipment_cost = sum(item.total_price for item in items)
    
    # 6. Transport & Logistics (before Installation – display order: Panel, Inverter, Battery, BOS, Transport, Installation)
    transport_product = db.query(Product).filter(
        Product.product_type == ProductType.TRANSPORT,
        Product.is_active == True
    ).first()
    
    if transport_product:
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=transport_product.id,
            description="Transport & Logistics",
            quantity=1,
            unit_price=transport_product.base_price,
            total_price=transport_product.base_price,
            sort_order=sort_order
        ))
        sort_order += 1
    else:
        transport_cost = get_setting_value(db, "transport_cost_fixed", 1000.0)
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=None,
            description="Transport & Logistics",
            quantity=1,
            unit_price=transport_cost,
            total_price=transport_cost,
            sort_order=sort_order
        ))
        sort_order += 1
    
    # 7. Installation (percentage of total_equipment_cost – panels, inverter, battery, mounting, BOS only)
    installation_product = db.query(Product).filter(
        Product.product_type == ProductType.INSTALLATION,
        Product.is_active == True
    ).first()
    
    if installation_product:
        if installation_product.price_type == "percentage":
            unit_price = total_equipment_cost * (installation_product.base_price / 100)
        elif installation_product.price_type == "per_kw":
            unit_price = installation_product.base_price * sizing_result.system_size_kw
        elif installation_product.price_type == "fixed":
            unit_price = installation_product.base_price
        else:
            unit_price = installation_product.base_price
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=installation_product.id,
            description="Installation",
            quantity=1,
            unit_price=unit_price,
            total_price=unit_price,
            sort_order=sort_order
        ))
        sort_order += 1
    else:
        installation_cost_percent = get_setting_value(db, "installation_cost_percent", 10.0)
        unit_price = total_equipment_cost * (installation_cost_percent / 100)
        items.append(QuoteItem(
            quote_id=quote_id,
            product_id=None,
            description=f"Installation ({installation_cost_percent:.1f}% of total equipment cost)",
            quantity=1,
            unit_price=unit_price,
            total_price=unit_price,
            sort_order=sort_order
        ))
        sort_order += 1
    
    return items

