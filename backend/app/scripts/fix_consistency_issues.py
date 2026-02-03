#!/usr/bin/env python3
"""
Fix consistency issues identified in system review
1. Recalculate sizing for project with outdated data
2. Add missing battery to quote
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models import Project, SizingResult, Quote, QuoteItem, Product, ProductType
from app.schemas import SizingInput
from app.services.sizing import calculate_sizing
from app.services.load_calculator import calculate_total_daily_kwh
from app.services.pricing import generate_quote_items_from_sizing
from sqlalchemy.orm import joinedload
from sqlalchemy import func

def fix_project_sizing():
    """Recalculate sizing for project with outdated data"""
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.name.ilike('%Solaris%')).first()
        if not project:
            print("⚠️  Project 'Solaris Power System - Standard Load' not found")
            return False
        
        print(f"📊 Fixing sizing for: {project.name}")
        
        # Get current total daily kWh
        total_daily_kwh = calculate_total_daily_kwh(db, project.id)
        print(f"   Current total_daily_kwh: {total_daily_kwh:.3f} kWh/day")
        
        # Get existing sizing
        existing_sizing = db.query(SizingResult).filter(SizingResult.project_id == project.id).first()
        if existing_sizing:
            print(f"   Old sizing total_daily_kwh: {existing_sizing.total_daily_kwh:.3f} kWh/day")
            print(f"   Difference: {abs(existing_sizing.total_daily_kwh - total_daily_kwh):.3f} kWh/day")
        
        # Prepare sizing input
        sizing_input = SizingInput(
            project_id=project.id,
            total_daily_kwh=total_daily_kwh,
            location=existing_sizing.location if existing_sizing else None,
            panel_brand=existing_sizing.panel_brand if existing_sizing else "JA",
            backup_hours=existing_sizing.backup_hours if existing_sizing else 0,
            essential_load_percent=existing_sizing.essential_load_percent if existing_sizing else 0.5,
            system_type=project.system_type if hasattr(project, 'system_type') else None
        )
        
        # Recalculate sizing
        new_sizing = calculate_sizing(db, sizing_input)
        
        # Update existing sizing or create new
        if existing_sizing:
            for key, value in new_sizing.__dict__.items():
                if not key.startswith('_') and key != 'id':
                    setattr(existing_sizing, key, value)
            sizing_result = existing_sizing
        else:
            sizing_result = SizingResult(**new_sizing.__dict__)
            db.add(sizing_result)
        
        db.commit()
        db.refresh(sizing_result)
        
        print(f"   ✅ Updated sizing:")
        print(f"      - System Size: {sizing_result.system_size_kw:.2f} kW")
        print(f"      - Panels: {sizing_result.number_of_panels}")
        print(f"      - Inverter: {sizing_result.inverter_size_kw:.1f} kW")
        if sizing_result.battery_capacity_kwh:
            print(f"      - Battery: {sizing_result.battery_capacity_kwh:.1f} kWh")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing project sizing: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


def fix_quote_battery():
    """Add missing battery to quote"""
    db = SessionLocal()
    try:
        quote = db.query(Quote).filter(Quote.quote_number == 'QT-0350E4BB').first()
        if not quote:
            print("⚠️  Quote QT-0350E4BB not found")
            return False
        
        print(f"📋 Fixing quote: {quote.quote_number}")
        
        # Get sizing result
        sizing = db.query(SizingResult).filter(SizingResult.project_id == quote.project_id).first()
        if not sizing:
            print("   ⚠️  No sizing result found for this project")
            return False
        
        if not sizing.battery_capacity_kwh or sizing.battery_capacity_kwh <= 0:
            print("   ⚠️  No battery in sizing result")
            return False
        
        print(f"   Battery in sizing: {sizing.battery_capacity_kwh:.1f} kWh")
        
        # Check if battery already exists in quote
        existing_battery = db.query(QuoteItem).join(Product).filter(
            QuoteItem.quote_id == quote.id,
            Product.product_type == ProductType.BATTERY
        ).first()
        
        if existing_battery:
            print("   ✅ Battery already exists in quote")
            return True
        
        # Find battery product
        # Try to find battery closest to required capacity
        battery_product = db.query(Product).filter(
            Product.product_type == ProductType.BATTERY,
            Product.capacity_kwh >= sizing.battery_capacity_kwh,
            Product.is_active == True
        ).order_by(Product.capacity_kwh.asc()).first()
        
        # If no battery found with sufficient capacity, get largest available
        if not battery_product:
            battery_product = db.query(Product).filter(
                Product.product_type == ProductType.BATTERY,
                Product.is_active == True
            ).order_by(Product.capacity_kwh.desc()).first()
        
        if not battery_product:
            print("   ❌ No battery product found in catalog")
            return False
        
        print(f"   Found battery product: {battery_product.brand} {battery_product.capacity_kwh}kWh")
        
        # Calculate number of batteries needed
        import math
        num_batteries = math.ceil(sizing.battery_capacity_kwh / battery_product.capacity_kwh)
        
        # Get highest sort_order
        max_sort_order = db.query(func.max(QuoteItem.sort_order)).filter(
            QuoteItem.quote_id == quote.id
        ).scalar() or -1
        
        # Calculate unit price
        if battery_product.price_type == "per_kwh":
            unit_price = battery_product.base_price * battery_product.capacity_kwh
        elif battery_product.price_type == "fixed":
            unit_price = battery_product.base_price
        else:
            unit_price = battery_product.base_price
        
        # Create battery item
        battery_item = QuoteItem(
            quote_id=quote.id,
            product_id=battery_product.id,
            description=f"{battery_product.brand or ''} {battery_product.capacity_kwh}kWh Battery",
            quantity=num_batteries,
            unit_price=unit_price,
            total_price=unit_price * num_batteries,
            sort_order=max_sort_order + 1
        )
        
        db.add(battery_item)
        db.commit()
        db.refresh(battery_item)
        
        print(f"   ✅ Added battery item:")
        print(f"      - Description: {battery_item.description}")
        print(f"      - Quantity: {battery_item.quantity}")
        print(f"      - Unit Price: GH₵{battery_item.unit_price:,.2f}")
        print(f"      - Total Price: GH₵{battery_item.total_price:,.2f}")
        
        # Note: Quote totals will need to be recalculated
        print(f"   ⚠️  Note: Quote totals need to be recalculated")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing quote battery: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


def main():
    """Fix all consistency issues"""
    print("="*80)
    print("FIXING CONSISTENCY ISSUES")
    print("="*80)
    print()
    
    results = []
    
    print("1. Fixing project sizing...")
    results.append(("Project Sizing", fix_project_sizing()))
    print()
    
    print("2. Fixing quote battery...")
    results.append(("Quote Battery", fix_quote_battery()))
    print()
    
    # Summary
    print("="*80)
    print("SUMMARY")
    print("="*80)
    
    all_fixed = True
    for name, fixed in results:
        status = "✅ FIXED" if fixed else "❌ FAILED"
        print(f"{status}: {name}")
        if not fixed:
            all_fixed = False
    
    print("="*80)
    if all_fixed:
        print("✅ ALL ISSUES FIXED!")
    else:
        print("⚠️  SOME ISSUES COULD NOT BE FIXED")
    print("="*80)
    
    return all_fixed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

