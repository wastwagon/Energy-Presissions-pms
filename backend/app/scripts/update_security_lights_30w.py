#!/usr/bin/env python3
"""
Update all existing security/outdoor lights to 30W
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models import Appliance, ApplianceCategory, ApplianceType, PowerUnit
from app.services.load_calculator import calculate_appliance_daily_kwh
from sqlalchemy import func

def update_security_lights_to_30w():
    """Update all security/outdoor lights to 30W"""
    db = SessionLocal()
    
    try:
        # Find all security lights by type
        security_lights_by_type = db.query(Appliance).filter(
            Appliance.appliance_type == ApplianceType.SECURITY_LIGHT.value
        ).all()
        
        # Find all outdoor/security lights by description
        security_lights_by_desc = db.query(Appliance).filter(
            (func.lower(Appliance.description).contains('security')) |
            (func.lower(Appliance.description).contains('outdoor')) |
            (func.lower(Appliance.description).contains('outside'))
        ).filter(
            Appliance.appliance_type != ApplianceType.SECURITY_LIGHT.value  # Exclude already found ones
        ).all()
        
        # Combine and deduplicate
        all_security_lights = list(set(security_lights_by_type + security_lights_by_desc))
        
        print(f"Found {len(all_security_lights)} security/outdoor light(s) to update")
        print("="*80)
        
        if not all_security_lights:
            print("No security lights found to update.")
            return
        
        updated_count = 0
        for app in all_security_lights:
            old_wattage = app.power_value
            old_daily_kwh = app.daily_kwh
            
            # Skip if already 30W
            if app.power_value == 30.0 and app.power_unit == PowerUnit.W:
                print(f"\n⏭️  Skipping: {app.description} (Project ID: {app.project_id})")
                print(f"   Already at 30W")
                continue
            
            print(f"\nUpdating: {app.description} (ID: {app.id}, Project ID: {app.project_id})")
            print(f"  Current: {old_wattage}W, Daily kWh: {old_daily_kwh:.3f} kWh")
            
            # Update to 30W
            app.category = ApplianceCategory.LIGHTING
            app.appliance_type = ApplianceType.SECURITY_LIGHT
            app.power_value = 30.0
            app.power_unit = PowerUnit.W
            
            # Recalculate daily_kwh using the proper service
            daily_kwh = calculate_appliance_daily_kwh(
                app.power_value,
                app.power_unit.value,
                app.quantity,
                app.hours_per_day,
                app.appliance_type.value,
                db
            )
            app.daily_kwh = daily_kwh
            
            print(f"  Updated: {app.power_value}W, Daily kWh: {app.daily_kwh:.3f} kWh")
            print(f"  Change: {old_wattage}W → 30W, {old_daily_kwh:.3f} → {app.daily_kwh:.3f} kWh")
            
            updated_count += 1
        
        db.commit()
        print(f"\n✅ Successfully updated {updated_count} security/outdoor light(s) to 30W!")
        
        # Show summary
        if updated_count > 0:
            print("\n" + "="*80)
            print("SUMMARY")
            print("="*80)
            print(f"Total security lights found: {len(all_security_lights)}")
            print(f"Updated to 30W: {updated_count}")
            print(f"Already at 30W: {len(all_security_lights) - updated_count}")
        
    except Exception as e:
        print(f"❌ Error updating security lights: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Updating all security/outdoor lights to 30W...")
    print("="*80)
    update_security_lights_to_30w()
    print("\n✅ Update complete!")




