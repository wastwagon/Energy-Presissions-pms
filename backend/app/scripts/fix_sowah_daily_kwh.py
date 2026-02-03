"""
Script to calculate and update daily_kwh for all appliances in Mr. Sowah's project
Usage: python -m app.scripts.fix_sowah_daily_kwh
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Appliance, Project
from app.services.load_calculator import calculate_appliance_daily_kwh

def fix_daily_kwh():
    db: Session = SessionLocal()
    try:
        # Get project 6 (Mr. Sowah's project)
        project = db.query(Project).filter(Project.id == 6).first()
        if not project:
            print("❌ Project 6 not found!")
            return False
        
        print(f"✅ Found project: {project.name} (ID: {project.id})")
        
        # Get all appliances for this project
        appliances = db.query(Appliance).filter(Appliance.project_id == 6).all()
        print(f"📋 Found {len(appliances)} appliances to update\n")
        
        total_kwh = 0.0
        updated_count = 0
        
        for appliance in appliances:
            # Calculate daily_kwh
            # Note: power_unit and appliance_type are stored as strings in the database
            power_unit_str = appliance.power_unit.value if hasattr(appliance.power_unit, 'value') else str(appliance.power_unit)
            appliance_type_str = appliance.appliance_type.value if hasattr(appliance.appliance_type, 'value') else str(appliance.appliance_type)
            
            daily_kwh = calculate_appliance_daily_kwh(
                appliance.power_value,
                power_unit_str,
                appliance.quantity,
                appliance.hours_per_day,
                appliance_type_str,
                db
            )
            
            # Update appliance
            appliance.daily_kwh = daily_kwh
            total_kwh += daily_kwh
            updated_count += 1
            
            print(f"  ✅ {appliance.description}: {appliance.quantity}x × {appliance.power_value}{appliance.power_unit.value} × {appliance.hours_per_day}h/day = {daily_kwh:.3f} kWh/day")
        
        db.commit()
        
        print(f"\n✅ Successfully updated {updated_count} appliances")
        print(f"📊 Total Daily Energy Consumption: {total_kwh:.2f} kWh/day")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = fix_daily_kwh()
    sys.exit(0 if success else 1)
