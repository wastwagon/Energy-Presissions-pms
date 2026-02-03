#!/usr/bin/env python3
"""
Update Kofi Oppong quote with:
- Installation: 5.05 kW @ GH₵100/kW
- Battery: Energy Precisions 16.0kWh × 1
- Panels: JA Solar 570W
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models import Quote, QuoteItem, Product, ProductType, SizingResult, Project
from sqlalchemy.orm import joinedload
from sqlalchemy import func

def update_quote():
    db = SessionLocal()
    try:
        # Get the quote
        quote = db.query(Quote).options(joinedload(Quote.items)).filter(Quote.id == 6).first()
        if not quote:
            print("✗ Quote 6 not found")
            return False
        
        print(f"Updating quote: {quote.quote_number}")
        
        # Get project and sizing
        project = db.query(Project).filter(Project.id == quote.project_id).first()
        sizing = db.query(SizingResult).filter(SizingResult.project_id == project.id).first()
        
        if not sizing:
            print("✗ Sizing result not found")
            return False
        
        print(f"\nCurrent sizing:")
        print(f"  Panel Brand: {sizing.panel_brand}")
        print(f"  Panel Wattage: {sizing.panel_wattage}W")
        print(f"  System Size: {sizing.system_size_kw} kW")
        
        # Update sizing to JA Solar
        print(f"\n1. Updating sizing to JA Solar 570W...")
        sizing.panel_brand = "JA"
        sizing.panel_wattage = 570
        
        # Recalculate number of panels with JA Solar 570W
        import math
        system_size_w = sizing.system_size_kw * 1000
        new_number_of_panels = math.ceil(system_size_w / 570)
        sizing.number_of_panels = new_number_of_panels
        
        print(f"  ✓ Updated to JA Solar 570W")
        print(f"  ✓ Number of panels: {new_number_of_panels}")
        
        # Get products
        ja_panel = db.query(Product).filter(
            Product.product_type == ProductType.PANEL,
            Product.brand.ilike("%JA%"),
            Product.wattage == 570,
            Product.is_active == True
        ).first()
        
        battery_16kwh = db.query(Product).filter(
            Product.product_type == ProductType.BATTERY,
            Product.capacity_kwh == 16.0,
            Product.is_active == True
        ).first()
        
        if not ja_panel:
            print("✗ JA Solar 570W panel not found in products")
            return False
        
        if not battery_16kwh:
            print("✗ Energy Precisions 16.0kWh battery not found in products")
            return False
        
        print(f"\n2. Updating quote items...")
        
        # Delete existing items
        for item in quote.items:
            db.delete(item)
        db.flush()
        
        # Add new items
        sort_order = 0
        
        # 1. JA Solar Panels
        panel_price = ja_panel.base_price if ja_panel.price_type == "per_panel" else ja_panel.base_price * (570 / 1000)
        panel_item = QuoteItem(
            quote_id=quote.id,
            product_id=ja_panel.id,
            description=f"{ja_panel.brand} {ja_panel.wattage}W Panel",
            quantity=new_number_of_panels,
            unit_price=panel_price,
            total_price=panel_price * new_number_of_panels,
            sort_order=sort_order
        )
        db.add(panel_item)
        sort_order += 1
        print(f"  ✓ Added: {ja_panel.brand} {ja_panel.wattage}W Panel × {new_number_of_panels}")
        
        # 2. Inverter
        inverter = db.query(Product).filter(
            Product.product_type == ProductType.INVERTER,
            Product.is_active == True
        ).first()
        inverter_item = None
        if inverter:
            inverter_price = inverter.base_price if inverter.price_type == "fixed" else inverter.base_price * sizing.inverter_size_kw
            inverter_item = QuoteItem(
                quote_id=quote.id,
                product_id=inverter.id,
                description=f"{inverter.brand or ''} {sizing.inverter_size_kw}kW Inverter",
                quantity=1,
                unit_price=inverter_price,
                total_price=inverter_price,
                sort_order=sort_order
            )
            db.add(inverter_item)
            sort_order += 1
            print(f"  ✓ Added: Inverter {sizing.inverter_size_kw}kW")
        
        # 3. Battery: 1 × 16.0kWh
        battery_price = battery_16kwh.base_price if battery_16kwh.price_type == "fixed" else battery_16kwh.base_price * 16.0
        battery_item = QuoteItem(
            quote_id=quote.id,
            product_id=battery_16kwh.id,
            description=f"{battery_16kwh.brand} {battery_16kwh.capacity_kwh}kWh Battery",
            quantity=1,
            unit_price=battery_price,
            total_price=battery_price,
            sort_order=sort_order
        )
        db.add(battery_item)
        sort_order += 1
        print(f"  ✓ Added: {battery_16kwh.brand} {battery_16kwh.capacity_kwh}kWh Battery × 1")
        
        # 4. Mounting (if exists)
        mounting = db.query(Product).filter(
            Product.product_type == ProductType.MOUNTING,
            Product.is_active == True
        ).first()
        mounting_item = None
        if mounting:
            mounting_price = mounting.base_price
            if mounting.price_type == "per_kw":
                mounting_price = mounting.base_price * sizing.system_size_kw
            elif mounting.price_type == "per_panel":
                mounting_price = mounting.base_price * new_number_of_panels
            
            mounting_item = QuoteItem(
                quote_id=quote.id,
                product_id=mounting.id,
                description="Mounting Structure",
                quantity=1,
                unit_price=mounting_price,
                total_price=mounting_price,
                sort_order=sort_order
            )
            db.add(mounting_item)
            sort_order += 1
            print(f"  ✓ Added: Mounting Structure")
        
        # 5. BOS
        equipment_total = panel_item.total_price + (inverter_item.total_price if inverter_item else 0) + battery_item.total_price + (mounting_item.total_price if mounting_item else 0)
        bos = db.query(Product).filter(
            Product.product_type == ProductType.BOS,
            Product.is_active == True
        ).first()
        bos_item = None
        if bos:
            if bos.price_type == "percentage":
                bos_price = equipment_total * (bos.base_price / 100)
            elif bos.price_type == "per_kw":
                bos_price = bos.base_price * sizing.system_size_kw
            else:
                bos_price = bos.base_price
            
            bos_item = QuoteItem(
                quote_id=quote.id,
                product_id=bos.id,
                description="Balance of System (BOS)",
                quantity=1,
                unit_price=bos_price,
                total_price=bos_price,
                sort_order=sort_order
            )
            db.add(bos_item)
            sort_order += 1
            print(f"  ✓ Added: BOS")
        
        # 6. Installation: Percentage of total equipment cost (including BOS)
        from app.services.pricing import get_setting_value
        # Calculate total equipment cost including BOS
        total_equipment_cost = equipment_total + (bos_item.total_price if bos_item else 0)
        installation_cost_percent = get_setting_value(db, "installation_cost_percent", 10.0)
        installation_price = total_equipment_cost * (installation_cost_percent / 100)
        installation_item = QuoteItem(
            quote_id=quote.id,
            product_id=None,
            description=f"Installation ({installation_cost_percent:.1f}% of total equipment cost)",
            quantity=1,
            unit_price=installation_price,
            total_price=installation_price,
            sort_order=sort_order,
            is_custom=True
        )
        db.add(installation_item)
        sort_order += 1
        print(f"  ✓ Added: Installation ({installation_cost_percent:.1f}% of equipment) = GH₵ {installation_price:,.2f}")
        
        # 7. Transport
        transport = db.query(Product).filter(
            Product.product_type == ProductType.TRANSPORT,
            Product.is_active == True
        ).first()
        transport_item = None
        if transport:
            transport_item = QuoteItem(
                quote_id=quote.id,
                product_id=transport.id,
                description="Transport & Logistics",
                quantity=1,
                unit_price=transport.base_price,
                total_price=transport.base_price,
                sort_order=sort_order
            )
            db.add(transport_item)
            sort_order += 1
            print(f"  ✓ Added: Transport & Logistics")
        
        # Calculate totals from new items
        db.flush()
        
        # Collect all new items
        new_items = [panel_item, battery_item]
        if inverter_item:
            new_items.append(inverter_item)
        if mounting:
            new_items.append(mounting_item)
        if bos:
            new_items.append(bos_item)
        new_items.append(installation_item)
        if transport:
            new_items.append(transport_item)
        
        # Calculate equipment subtotal (panels, inverter, battery, mounting)
        equipment_items = [panel_item, battery_item]
        if inverter_item:
            equipment_items.append(inverter_item)
        if mounting:
            equipment_items.append(mounting_item)
        
        equipment_subtotal = sum(item.total_price for item in equipment_items)
        
        # Calculate services subtotal (BOS, installation, transport)
        services_items = []
        if bos:
            services_items.append(bos_item)
        services_items.append(installation_item)
        if transport:
            services_items.append(transport_item)
        
        services_subtotal = sum(item.total_price for item in services_items)
        
        quote.equipment_subtotal = equipment_subtotal
        quote.services_subtotal = services_subtotal
        quote.grand_total = equipment_subtotal + services_subtotal + (quote.tax_amount or 0) - (quote.discount_amount or 0)
        
        db.commit()
        
        print(f"\n✓ Quote updated successfully!")
        print(f"\n=== Updated Quote Summary ===")
        print(f"Quote: {quote.quote_number}")
        print(f"Equipment Subtotal: GH₵ {quote.equipment_subtotal:,.2f}")
        print(f"Services Subtotal: GH₵ {quote.services_subtotal:,.2f}")
        print(f"Grand Total: GH₵ {quote.grand_total:,.2f}")
        
        # Refresh to get all items
        db.refresh(quote)
        
        print(f"\n=== Items ===")
        for item in sorted(quote.items, key=lambda x: x.sort_order or 0):
            print(f"  {item.description}: {item.quantity} × GH₵ {item.unit_price:,.2f} = GH₵ {item.total_price:,.2f}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = update_quote()
    sys.exit(0 if success else 1)

