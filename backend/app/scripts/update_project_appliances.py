#!/usr/bin/env python3
"""
Update Kofi Oppong project appliances based on handwritten list:
- Update existing appliances with new quantities/wattages
- Add missing appliances
- Remove items not in the list
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models import (
    Project, Appliance, ApplianceCategory, ApplianceType, PowerUnit
)
from app.services.appliance_catalog import get_appliance_template

def update_appliances():
    db = SessionLocal()
    try:
        # Get the project
        project = db.query(Project).filter(Project.name.ilike('%Solaris%')).first()
        if not project:
            print("✗ Project not found")
            return False
        
        print(f"Updating project: {project.name}")
        print(f"Customer: {project.customer.name}\n")
        
        # Get current appliances
        current_appliances = db.query(Appliance).filter(Appliance.project_id == project.id).all()
        print(f"Current appliances: {len(current_appliances)}")
        
        # Delete all current appliances
        for app in current_appliances:
            db.delete(app)
        db.flush()
        print("✓ Cleared existing appliances\n")
        
        # Define new appliances based on handwritten list
        new_appliances = []
        
        # 1. Outside bulb - 5, 20W
        template = get_appliance_template(ApplianceCategory.LIGHTING, ApplianceType.LED_BULB)
        new_appliances.append({
            'category': ApplianceCategory.LIGHTING,
            'appliance_type': ApplianceType.LED_BULB,
            'description': 'Outside Bulbs',
            'power_value': 20.0,  # 20W as specified
            'power_unit': PowerUnit.W,
            'quantity': 5,
            'hours_per_day': 12.0,  # Typical for outdoor lights
            'is_essential': True
        })
        
        # 2. Bulbs - 13, 15W
        new_appliances.append({
            'category': ApplianceCategory.LIGHTING,
            'appliance_type': ApplianceType.LED_BULB,
            'description': 'Interior Bulbs',
            'power_value': 15.0,  # 15W as specified
            'power_unit': PowerUnit.W,
            'quantity': 13,
            'hours_per_day': 5.0,  # Typical for interior lights
            'is_essential': False
        })
        
        # 3. Pressure pump - 1 (using BOOSTER_PUMP)
        template = get_appliance_template(ApplianceCategory.WATER_PUMPING, ApplianceType.BOOSTER_PUMP)
        new_appliances.append({
            'category': ApplianceCategory.WATER_PUMPING,
            'appliance_type': ApplianceType.BOOSTER_PUMP,
            'description': 'Pressure Pump',
            'power_value': template.power_value if template else 0.75,
            'power_unit': PowerUnit.HP,
            'quantity': 1,
            'hours_per_day': 3.0,  # Typical for booster pumps
            'is_essential': True
        })
        
        # 4. Bore hole pump - 1.5 HP
        template = get_appliance_template(ApplianceCategory.WATER_PUMPING, ApplianceType.SUBMERSIBLE_PUMP)
        new_appliances.append({
            'category': ApplianceCategory.WATER_PUMPING,
            'appliance_type': ApplianceType.SUBMERSIBLE_PUMP,
            'description': 'Bore Hole Pump',
            'power_value': 1.5,  # 1.5 HP as specified
            'power_unit': PowerUnit.HP,
            'quantity': 1,
            'hours_per_day': 4.0,  # Typical for submersible pumps
            'is_essential': True
        })
        
        # 5. Fans - 8
        template = get_appliance_template(ApplianceCategory.COOLING, ApplianceType.CEILING_FAN)
        new_appliances.append({
            'category': ApplianceCategory.COOLING,
            'appliance_type': ApplianceType.CEILING_FAN,
            'description': 'Ceiling Fans',
            'power_value': template.power_value if template else 70.0,
            'power_unit': PowerUnit.W,
            'quantity': 8,
            'hours_per_day': 10.0,  # Typical for fans
            'is_essential': False
        })
        
        # 6. Spot lights - 25 bulbs (using SECURITY_LIGHT)
        template = get_appliance_template(ApplianceCategory.LIGHTING, ApplianceType.SECURITY_LIGHT)
        new_appliances.append({
            'category': ApplianceCategory.LIGHTING,
            'appliance_type': ApplianceType.SECURITY_LIGHT,
            'description': 'Spot Lights',
            'power_value': template.power_value if template else 50.0,
            'power_unit': PowerUnit.W,
            'quantity': 25,
            'hours_per_day': 6.0,  # Typical for security lights
            'is_essential': True
        })
        
        # 7. Washing machine - 1
        template = get_appliance_template(ApplianceCategory.LAUNDRY, ApplianceType.WASHING_MACHINE)
        new_appliances.append({
            'category': ApplianceCategory.LAUNDRY,
            'appliance_type': ApplianceType.WASHING_MACHINE,
            'description': 'Washing Machine',
            'power_value': template.power_value if template else 400.0,
            'power_unit': PowerUnit.W,
            'quantity': 1,
            'hours_per_day': 1.0,  # Typical for washing machine
            'is_essential': False
        })
        
        # 8. Kettle - 2
        template = get_appliance_template(ApplianceCategory.COOKING, ApplianceType.ELECTRIC_KETTLE)
        new_appliances.append({
            'category': ApplianceCategory.COOKING,
            'appliance_type': ApplianceType.ELECTRIC_KETTLE,
            'description': 'Electric Kettle',
            'power_value': template.power_value if template else 1500.0,
            'power_unit': PowerUnit.W,
            'quantity': 2,
            'hours_per_day': 0.3,  # Typical for kettle (18 minutes)
            'is_essential': False
        })
        
        # 9. Microwave - 2
        template = get_appliance_template(ApplianceCategory.COOKING, ApplianceType.MICROWAVE)
        new_appliances.append({
            'category': ApplianceCategory.COOKING,
            'appliance_type': ApplianceType.MICROWAVE,
            'description': 'Microwave Oven',
            'power_value': template.power_value if template else 800.0,
            'power_unit': PowerUnit.W,
            'quantity': 2,
            'hours_per_day': 0.5,  # Typical for microwave
            'is_essential': False
        })
        
        # 10. Deep freezer - 1
        template = get_appliance_template(ApplianceCategory.REFRIGERATION, ApplianceType.FREEZER)
        new_appliances.append({
            'category': ApplianceCategory.REFRIGERATION,
            'appliance_type': ApplianceType.FREEZER,
            'description': 'Deep Freezer',
            'power_value': template.power_value if template else 400.0,
            'power_unit': PowerUnit.W,
            'quantity': 1,
            'hours_per_day': 24.0,  # Freezers run continuously
            'is_essential': True
        })
        
        # 11. Fridge - 1
        template = get_appliance_template(ApplianceCategory.REFRIGERATION, ApplianceType.REFRIGERATOR)
        new_appliances.append({
            'category': ApplianceCategory.REFRIGERATION,
            'appliance_type': ApplianceType.REFRIGERATOR,
            'description': 'Refrigerator',
            'power_value': 120.0,  # Using current value (can be updated to 250W if needed)
            'power_unit': PowerUnit.W,
            'quantity': 1,
            'hours_per_day': 10.0,  # Typical for refrigerator (not continuous)
            'is_essential': True
        })
        
        # 12. Iron - 1
        template = get_appliance_template(ApplianceCategory.LAUNDRY, ApplianceType.IRON)
        new_appliances.append({
            'category': ApplianceCategory.LAUNDRY,
            'appliance_type': ApplianceType.IRON,
            'description': 'Electric Iron',
            'power_value': template.power_value if template else 1200.0,
            'power_unit': PowerUnit.W,
            'quantity': 1,
            'hours_per_day': 0.5,  # Typical for iron
            'is_essential': False
        })
        
        # 13. Electric fence - 1 (using SECURITY category, ALARM_SYSTEM as closest match)
        # Note: Electric fence energizers typically consume 5-50W
        template = get_appliance_template(ApplianceCategory.SECURITY, ApplianceType.ALARM_SYSTEM)
        new_appliances.append({
            'category': ApplianceCategory.SECURITY,
            'appliance_type': ApplianceType.ALARM_SYSTEM,  # Using as closest match
            'description': 'Electric Fence Energizer',
            'power_value': 30.0,  # Typical for electric fence energizer (5-50W range)
            'power_unit': PowerUnit.W,
            'quantity': 1,
            'hours_per_day': 24.0,  # Electric fences run continuously
            'is_essential': True
        })
        
        # Create appliances in database
        print("Creating new appliances...")
        for i, app_data in enumerate(new_appliances, 1):
            # Calculate daily_kwh
            power_watts = app_data['power_value']
            if app_data['power_unit'] == PowerUnit.HP:
                power_watts = app_data['power_value'] * 746  # Convert HP to watts
            elif app_data['power_unit'] == PowerUnit.KW:
                power_watts = app_data['power_value'] * 1000
            
            daily_kwh = (power_watts * app_data['quantity'] * app_data['hours_per_day']) / 1000
            
            appliance = Appliance(
                project_id=project.id,
                category=app_data['category'].value,
                appliance_type=app_data['appliance_type'].value,
                description=app_data['description'],
                power_value=app_data['power_value'],
                power_unit=app_data['power_unit'],
                quantity=app_data['quantity'],
                hours_per_day=app_data['hours_per_day'],
                is_essential=app_data['is_essential'],
                daily_kwh=daily_kwh
            )
            db.add(appliance)
            
            print(f"  {i}. {app_data['description']}: {app_data['quantity']} × {app_data['power_value']}{app_data['power_unit'].value} × {app_data['hours_per_day']}h/day")
        
        db.commit()
        
        # Calculate total daily energy
        total_daily_kwh = sum(app.daily_kwh for app in db.query(Appliance).filter(Appliance.project_id == project.id).all())
        
        print(f"\n✓ Successfully updated appliances!")
        print(f"\nTotal Daily Energy: {total_daily_kwh:.2f} kWh/day")
        print(f"Total Appliances: {len(new_appliances)}")
        
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
    success = update_appliances()
    sys.exit(0 if success else 1)






