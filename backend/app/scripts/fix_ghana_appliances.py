"""
Fix appliances for Ghana specifications
- Update spot lights to correct indoor LED wattage (12W)
- Review and update all appliances for Ghana market
"""
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models import Appliance, ApplianceCategory, ApplianceType, PowerUnit
from sqlalchemy import func

def fix_spot_lights():
    """Fix spot lights to correct indoor LED wattage for Ghana"""
    db = SessionLocal()
    
    # Find all spot lights
    spot_lights = db.query(Appliance).filter(
        func.lower(Appliance.description).contains('spot')
    ).all()
    
    print(f"Found {len(spot_lights)} spot light(s) to fix")
    print("="*80)
    
    for app in spot_lights:
        print(f"\nFixing: {app.description} (ID: {app.id})")
        print(f"  Current: {app.power_value}W, Category: {app.category}")
        
        # Update to indoor LED spot light specs for Ghana
        app.category = ApplianceCategory.LIGHTING
        app.appliance_type = ApplianceType.LED_SPOT_LIGHT
        app.power_value = 12.0  # Correct wattage for indoor LED spot lights in Ghana
        app.power_unit = PowerUnit.W
        
        # Recalculate daily_kwh
        if app.power_unit == PowerUnit.W:
            daily_kwh = (app.power_value * app.quantity * app.hours_per_day) / 1000
        elif app.power_unit == PowerUnit.HP:
            # Convert HP to watts (1 HP = 746W for pumps, but varies)
            hp_to_watts = 746  # Standard conversion
            daily_kwh = (app.power_value * hp_to_watts * app.quantity * app.hours_per_day) / 1000
        else:
            daily_kwh = (app.power_value * app.quantity * app.hours_per_day) / 1000
        
        app.daily_kwh = daily_kwh
        
        print(f"  Updated: {app.power_value}W, Category: {app.category.value}, Type: {app.appliance_type.value}")
        print(f"  Daily kWh: {app.daily_kwh:.2f} kWh")
    
    db.commit()
    print("\n✅ Spot lights fixed!")
    
    db.close()


def review_all_appliances():
    """Review all appliances for Ghana specifications"""
    db = SessionLocal()
    
    # Get all projects
    from app.models import Project
    projects = db.query(Project).all()
    
    print("\n" + "="*80)
    print("REVIEWING ALL APPLIANCES FOR GHANA SPECIFICATIONS")
    print("="*80)
    
    ghana_specs = {
        # Lighting
        "LED Bulb": {"wattage": (5, 15), "note": "Standard LED bulbs"},
        "LED Spot Light": {"wattage": (10, 15), "note": "Indoor LED spot lights"},
        "Security Light": {"wattage": (30, 100), "note": "Outdoor security lights"},
        
        # Cooling
        "Ceiling Fan": {"wattage": (50, 80), "note": "Standard ceiling fans"},
        
        # Refrigeration
        "Refrigerator": {"wattage": (100, 200), "note": "Energy-efficient models"},
        "Deep Freezer": {"wattage": (300, 500), "note": "Standard freezers"},
        
        # Cooking
        "Electric Kettle": {"wattage": (1500, 2000), "note": "Standard kettles"},
        "Microwave": {"wattage": (700, 1000), "note": "Standard microwaves"},
        
        # Laundry
        "Washing Machine": {"wattage": (350, 500), "note": "Standard washing machines"},
        "Electric Iron": {"wattage": (1000, 1500), "note": "Standard irons"},
    }
    
    for project in projects:
        appliances = db.query(Appliance).filter(Appliance.project_id == project.id).all()
        if not appliances:
            continue
        
        print(f"\nProject: {project.name}")
        print("-"*80)
        
        for app in appliances:
            desc = app.description
            current_wattage = app.power_value if app.power_unit == PowerUnit.W else None
            
            # Check if wattage is reasonable for Ghana
            issues = []
            if current_wattage:
                # Check against known specs
                for key, spec in ghana_specs.items():
                    if key.lower() in desc.lower():
                        min_w, max_w = spec["wattage"]
                        if current_wattage < min_w or current_wattage > max_w:
                            issues.append(f"Wattage {current_wattage}W may be outside typical range ({min_w}-{max_w}W) for {key}")
                        break
            
            if issues:
                print(f"  ⚠️  {desc}: {app.power_value} {app.power_unit.value}")
                for issue in issues:
                    print(f"      {issue}")
            else:
                print(f"  ✓ {desc}: {app.power_value} {app.power_unit.value}")
    
    db.close()


if __name__ == "__main__":
    print("Fixing appliances for Ghana specifications...")
    fix_spot_lights()
    review_all_appliances()
    print("\n✅ Review complete!")






