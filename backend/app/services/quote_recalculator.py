"""
Service to recalculate dependent quote items (BOS, Installation) when equipment changes
"""
from sqlalchemy.orm import Session
from app.models import Quote, QuoteItem, Product, ProductType, Setting
from app.services.pricing import get_setting_value


def recalculate_dependent_items(db: Session, quote_id: int) -> None:
    """
    Recalculate BOS and Installation items when equipment totals change
    
    BOS is typically a percentage of equipment cost
    Installation is typically a percentage of total equipment cost
    """
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        return
    
    # Get all quote items
    all_items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote_id).all()
    
    # Calculate equipment total (panels, inverter, battery, mounting)
    equipment_items = []
    for item in all_items:
        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.product_type.value in ["panel", "inverter", "battery", "mounting"]:
                equipment_items.append(item)
    
    equipment_total = sum(item.total_price for item in equipment_items)
    
    # Find and update BOS item
    bos_item = None
    for item in all_items:
        if "BOS" in item.description.upper() or "Balance of System" in item.description:
            bos_item = item
            break
    
    if bos_item:
        # Check if BOS has a product
        if bos_item.product_id:
            bos_product = db.query(Product).filter(Product.id == bos_item.product_id).first()
            if bos_product and bos_product.price_type == "percentage":
                new_bos_price = equipment_total * (bos_product.base_price / 100)
                bos_item.unit_price = new_bos_price
                bos_item.total_price = new_bos_price
            elif bos_product and bos_product.price_type == "per_kw":
                # Need system size - try to get from description or use a default
                # For now, skip per_kw as we don't have system_size_kw here
                pass
        else:
            # BOS is using settings or quote-specific percentage - extract percentage from description
            import re
            match = re.search(r'(\d+\.?\d*)%', bos_item.description)
            if match:
                bos_percentage = float(match.group(1))
            else:
                # Fallback to settings
                bos_percentage = get_setting_value(db, "bos_percentage", 12.0)
            
            new_bos_price = equipment_total * (bos_percentage / 100)
            bos_item.unit_price = new_bos_price
            bos_item.total_price = new_bos_price
            # Update description to ensure it has the percentage
            if not match:  # Only update if percentage wasn't in description
                bos_item.description = f"Balance of System (BOS) - {bos_percentage}% of equipment"
    
    # Find and update Installation item
    installation_item = None
    for item in all_items:
        if "Installation" in item.description and "Transport" not in item.description:
            installation_item = item
            break
    
    if installation_item:
        # Calculate total equipment cost for installation (includes BOS)
        # This is equipment_total + BOS (if BOS exists)
        total_equipment_for_installation = equipment_total
        if bos_item:
            total_equipment_for_installation += bos_item.total_price
        
        # Check if Installation has a product
        if installation_item.product_id:
            installation_product = db.query(Product).filter(Product.id == installation_item.product_id).first()
            if installation_product and installation_product.price_type == "percentage":
                new_installation_price = total_equipment_for_installation * (installation_product.base_price / 100)
                installation_item.unit_price = new_installation_price
                installation_item.total_price = new_installation_price
            elif installation_product and installation_product.price_type == "per_kw":
                # Would need system_size_kw - skip for now
                pass
        else:
            # Installation is using settings or quote-specific percentage - extract percentage from description
            import re
            match = re.search(r'(\d+\.?\d*)%', installation_item.description)
            if match:
                installation_percentage = float(match.group(1))
            else:
                # Fallback to settings
                installation_percentage = get_setting_value(db, "installation_cost_percent", 20.0)
            
            new_installation_price = total_equipment_for_installation * (installation_percentage / 100)
            installation_item.unit_price = new_installation_price
            installation_item.total_price = new_installation_price
            # Update description to ensure it has the percentage
            if not match:  # Only update if percentage wasn't in description
                installation_item.description = f"Installation ({installation_percentage}% of total equipment cost)"
    
    # Recalculate quote subtotals
    # Equipment subtotal = panels + inverter + battery + mounting + BOS
    equipment_subtotal = sum(item.total_price for item in equipment_items)
    if bos_item:
        equipment_subtotal += bos_item.total_price
    
    # Services subtotal = installation + transport + other services
    services_items = []
    for item in all_items:
        # Skip equipment items and BOS
        if item not in equipment_items and item != bos_item:
            services_items.append(item)
    
    services_subtotal = sum(item.total_price for item in services_items)
    # Installation is already included in services_items if it exists
    
    quote.equipment_subtotal = equipment_subtotal
    quote.services_subtotal = services_subtotal
    
    # Recalculate grand total
    subtotal = quote.equipment_subtotal + quote.services_subtotal
    tax_amount = subtotal * (quote.tax_percent / 100)
    discount_amount = subtotal * (quote.discount_percent / 100)
    quote.tax_amount = tax_amount
    quote.discount_amount = discount_amount
    quote.grand_total = subtotal + tax_amount - discount_amount
    
    db.commit()

