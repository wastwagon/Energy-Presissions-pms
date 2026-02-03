"""
Script to create project and add appliances for Mr. Sowah
Usage: python -m app.scripts.create_sowah_project
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Project, Appliance, ApplianceCategory, ApplianceType, PowerUnit, SystemType, ProjectStatus, User
from app.services.load_calculator import calculate_appliance_daily_kwh
from datetime import datetime

def create_sowah_project():
    db: Session = SessionLocal()
    try:
        # Find Mr. Sowah customer
        customer = db.query(Customer).filter(Customer.name.ilike('%Sowah%')).first()
        if not customer:
            print("❌ Customer 'Mr. Sowah' not found!")
            print("Please create the customer first.")
            return False
        
        print(f"✅ Found customer: {customer.name} (ID: {customer.id})")
        
        # Get admin user
        admin_user = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
        if not admin_user:
            # Get first admin user
            admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            print("❌ No admin user found!")
            return False
        
        print(f"✅ Using admin user: {admin_user.email} (ID: {admin_user.id})")
        
        # Create project
        project = Project(
            customer_id=customer.id,
            name="Mr. Sowah - Residential Solar System",
            reference_code=f"SOWAH-{datetime.now().strftime('%Y%m%d')}-001",
            system_type=SystemType.HYBRID,
            status=ProjectStatus.NEW,
            created_by=admin_user.id
        )
        db.add(project)
        db.flush()
        print(f"✅ Created project: {project.name} (ID: {project.id})")
        
        # Define all appliances with Ghana-typical values
        appliances_data = [
            # Ceiling Fans - 11 units
            {
                "category": ApplianceCategory.COOLING,
                "appliance_type": ApplianceType.CEILING_FAN,
                "description": "Ceiling Fan",
                "power_value": 70,
                "power_unit": PowerUnit.W,
                "quantity": 11,
                "hours_per_day": 12,
                "is_essential": False
            },
            
            # Air Conditioners - 10 x 1.5 HP
            {
                "category": ApplianceCategory.COOLING,
                "appliance_type": ApplianceType.SPLIT_AC_1_5HP,
                "description": "1.5 HP Split Air Conditioner",
                "power_value": 1.5,
                "power_unit": PowerUnit.HP,
                "quantity": 10,
                "hours_per_day": 8,
                "is_essential": False
            },
            
            # Air Conditioner - 1 x 2.5 HP
            {
                "category": ApplianceCategory.COOLING,
                "appliance_type": ApplianceType.SPLIT_AC_2_5HP,
                "description": "2.5 HP Split Air Conditioner",
                "power_value": 2.5,
                "power_unit": PowerUnit.HP,
                "quantity": 1,
                "hours_per_day": 8,
                "is_essential": False
            },
            
            # Table Top Fridges - 4 units
            {
                "category": ApplianceCategory.REFRIGERATION,
                "appliance_type": ApplianceType.TABLE_TOP_FRIDGE,
                "description": "Table Top Fridge",
                "power_value": 100,
                "power_unit": PowerUnit.W,
                "quantity": 4,
                "hours_per_day": 24,
                "is_essential": True
            },
            
            # Deep Freezers - 4 units
            {
                "category": ApplianceCategory.REFRIGERATION,
                "appliance_type": ApplianceType.FREEZER,
                "description": "Deep Freezer",
                "power_value": 400,
                "power_unit": PowerUnit.W,
                "quantity": 4,
                "hours_per_day": 24,
                "is_essential": True
            },
            
            # Double Door Fridge - 1 unit
            {
                "category": ApplianceCategory.REFRIGERATION,
                "appliance_type": ApplianceType.DOUBLE_DOOR_FRIDGE,
                "description": "Double Door Refrigerator",
                "power_value": 350,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 24,
                "is_essential": True
            },
            
            # Single Door Fridge - 1 unit
            {
                "category": ApplianceCategory.REFRIGERATION,
                "appliance_type": ApplianceType.SINGLE_DOOR_FRIDGE,
                "description": "Single Door Refrigerator",
                "power_value": 150,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 24,
                "is_essential": True
            },
            
            # Blender - 1 unit
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.BLENDER,
                "description": "Electric Blender",
                "power_value": 500,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 0.2,
                "is_essential": False
            },
            
            # Kettle - 1 unit
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.ELECTRIC_KETTLE,
                "description": "Electric Kettle",
                "power_value": 1500,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 0.3,
                "is_essential": False
            },
            
            # Microwaves - 2 units
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.MICROWAVE,
                "description": "Microwave Oven",
                "power_value": 800,
                "power_unit": PowerUnit.W,
                "quantity": 2,
                "hours_per_day": 0.5,
                "is_essential": False
            },
            
            # Electric Oven - 1 unit
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.OVEN,
                "description": "Electric Oven",
                "power_value": 3000,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 1,
                "is_essential": False
            },
            
            # Washing Machine - 1 unit
            {
                "category": ApplianceCategory.LAUNDRY,
                "appliance_type": ApplianceType.WASHING_MACHINE,
                "description": "Washing Machine",
                "power_value": 400,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 1,
                "is_essential": False
            },
            
            # Pressing Iron - 1 unit
            {
                "category": ApplianceCategory.LAUNDRY,
                "appliance_type": ApplianceType.IRON,
                "description": "Pressing Iron",
                "power_value": 1200,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 0.5,
                "is_essential": False
            },
            
            # Computer Set - 1 unit
            {
                "category": ApplianceCategory.COMPUTING,
                "appliance_type": ApplianceType.DESKTOP_PC,
                "description": "Computer Set (Desktop with Monitor)",
                "power_value": 250,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 8,
                "is_essential": False
            },
            
            # TVs - 2 x 65"
            {
                "category": ApplianceCategory.ENTERTAINMENT,
                "appliance_type": ApplianceType.TV_65INCH_LED,
                "description": "65-inch LED TV",
                "power_value": 180,
                "power_unit": PowerUnit.W,
                "quantity": 2,
                "hours_per_day": 6,
                "is_essential": False
            },
            
            # TV - 1 x 55"
            {
                "category": ApplianceCategory.ENTERTAINMENT,
                "appliance_type": ApplianceType.TV_55INCH_LED,
                "description": "55-inch LED TV",
                "power_value": 150,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 6,
                "is_essential": False
            },
            
            # TV - 1 x 40"
            {
                "category": ApplianceCategory.ENTERTAINMENT,
                "appliance_type": ApplianceType.TV_40INCH_LED,
                "description": "40-inch LED TV",
                "power_value": 90,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 6,
                "is_essential": False
            },
            
            # TVs - 2 x 45"
            {
                "category": ApplianceCategory.ENTERTAINMENT,
                "appliance_type": ApplianceType.TV_45INCH_LED,
                "description": "45-inch LED TV",
                "power_value": 130,
                "power_unit": PowerUnit.W,
                "quantity": 2,
                "hours_per_day": 6,
                "is_essential": False
            },
            
            # LED Bulbs - 8 x 30W
            {
                "category": ApplianceCategory.LIGHTING,
                "appliance_type": ApplianceType.LED_BULB_30W,
                "description": "30W LED Bulb",
                "power_value": 30,
                "power_unit": PowerUnit.W,
                "quantity": 8,
                "hours_per_day": 8,
                "is_essential": False
            },
            
            # LED Bulbs - 7 x 40W
            {
                "category": ApplianceCategory.LIGHTING,
                "appliance_type": ApplianceType.LED_BULB_40W,
                "description": "40W LED Bulb",
                "power_value": 40,
                "power_unit": PowerUnit.W,
                "quantity": 7,
                "hours_per_day": 8,
                "is_essential": False
            },
            
            # LED Spot Lights - 180 x 6W
            {
                "category": ApplianceCategory.LIGHTING,
                "appliance_type": ApplianceType.LED_SPOT_LIGHT_6W,
                "description": "6W LED Spot Light",
                "power_value": 6,
                "power_unit": PowerUnit.W,
                "quantity": 180,
                "hours_per_day": 6,
                "is_essential": False
            },
        ]
        
        # Add all appliances
        print("\n📋 Adding appliances to project...")
        total_appliances = 0
        total_kwh = 0.0
        for app_data in appliances_data:
            # Calculate daily_kwh before creating appliance
            power_unit_str = app_data['power_unit'].value if hasattr(app_data['power_unit'], 'value') else str(app_data['power_unit'])
            appliance_type_str = app_data['appliance_type'].value if hasattr(app_data['appliance_type'], 'value') else str(app_data['appliance_type'])
            
            daily_kwh = calculate_appliance_daily_kwh(
                app_data['power_value'],
                power_unit_str,
                app_data['quantity'],
                app_data['hours_per_day'],
                appliance_type_str,
                db
            )
            
            appliance = Appliance(
                project_id=project.id,
                daily_kwh=daily_kwh,
                **app_data
            )
            db.add(appliance)
            total_appliances += app_data["quantity"]
            total_kwh += daily_kwh
            print(f"  ✅ Added: {app_data['quantity']}x {app_data['description']} ({daily_kwh:.3f} kWh/day)")
        
        db.commit()
        db.refresh(project)
        
        print(f"\n✅ Successfully created project with {len(appliances_data)} appliance types")
        print(f"   Total appliance units: {total_appliances}")
        print(f"   Total Daily Energy Consumption: {total_kwh:.2f} kWh/day")
        print(f"\n📊 Project Details:")
        print(f"   Project ID: {project.id}")
        print(f"   Reference: {project.reference_code}")
        print(f"   Customer: {customer.name}")
        print(f"   System Type: {project.system_type.value}")
        print(f"\n🌐 Access project at: http://localhost:5000/pms/projects/{project.id}")
        
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
    success = create_sowah_project()
    sys.exit(0 if success else 1)
