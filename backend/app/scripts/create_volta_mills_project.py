"""
Script to create project for Volta Mills and Allied Farms
- Customer: Volta Mills and Allied Farms
- Appliances: 1.5 HP Borehole Pump + 4× 20W LED Outdoor Bulbs
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Project, Appliance, ApplianceCategory, ApplianceType, PowerUnit, SystemType, ProjectStatus, User
from app.services.load_calculator import calculate_appliance_daily_kwh
from datetime import datetime

def create_volta_mills_project():
    db: Session = SessionLocal()
    try:
        # Check if customer already exists
        customer = db.query(Customer).filter(
            Customer.name.ilike('%Volta Mills%')
        ).first()
        
        if customer:
            print(f"✅ Customer already exists: {customer.name} (ID: {customer.id})")
        else:
            # Create customer
            customer = Customer(
                name="Volta Mills and Allied Farms",
                phone="0552519980",
                email="volta.mills@dummy.com",
                address="Ghana",
                city="",
                country="Ghana"
            )
            db.add(customer)
            db.flush()
            print(f"✅ Created customer: {customer.name} (ID: {customer.id})")
        
        # Get admin user
        admin_user = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
        if not admin_user:
            admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            print("❌ No admin user found!")
            return False
        
        print(f"✅ Using admin user: {admin_user.email} (ID: {admin_user.id})")
        
        # Check if project already exists
        existing_project = db.query(Project).filter(
            Project.customer_id == customer.id,
            Project.name.ilike('%Borehole%')
        ).first()
        
        if existing_project:
            print(f"⚠️  Project already exists: {existing_project.name} (ID: {existing_project.id})")
            print("   Skipping project creation. Use existing project or delete it first.")
            return False
        
        # Create project
        project = Project(
            customer_id=customer.id,
            name="Volta Mills - Borehole Solar System",
            reference_code=f"VOLTA-{datetime.now().strftime('%Y%m%d')}-001",
            system_type=SystemType.HYBRID,
            status=ProjectStatus.NEW,
            created_by=admin_user.id
        )
        db.add(project)
        db.flush()
        print(f"✅ Created project: {project.name} (ID: {project.id})")
        
        # Define appliances
        appliances_data = [
            # 1.5 HP Borehole Pump
            {
                "category": ApplianceCategory.WATER_PUMPING,
                "appliance_type": ApplianceType.SUBMERSIBLE_PUMP,  # Submersible pump for borehole
                "description": "1.5 HP Borehole Water Pump",
                "power_value": 1.5,
                "power_unit": PowerUnit.HP,
                "quantity": 1,
                "hours_per_day": 8.0,  # Typical borehole operation: 8 hours/day
                "is_essential": True  # Critical for water supply
            },
            
            # 4× 20W LED Outdoor Bulbs
            {
                "category": ApplianceCategory.LIGHTING,
                "appliance_type": ApplianceType.LED_BULB,  # Generic LED bulb
                "description": "20W LED Outdoor Bulb",
                "power_value": 20,
                "power_unit": PowerUnit.W,
                "quantity": 4,
                "hours_per_day": 12.0,  # Outdoor lights typically run 12 hours (dusk to dawn)
                "is_essential": True  # Security lighting
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
        
        # Calculate total with diversity factor
        from app.services.load_calculator import calculate_total_daily_kwh
        total_with_diversity = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=True)
        
        print(f"\n✅ Successfully created project!")
        print(f"   Project ID: {project.id}")
        print(f"   Customer: {customer.name}")
        print(f"   Total appliance units: {total_appliances}")
        print(f"   Total Daily Energy (raw): {total_kwh:.2f} kWh/day")
        print(f"   Total Daily Energy (with diversity): {total_with_diversity:.2f} kWh/day")
        print(f"\n📊 Project Details:")
        print(f"   Reference Code: {project.reference_code}")
        print(f"   System Type: {project.system_type.value if project.system_type else 'HYBRID'}")
        print(f"\n🔄 Next Steps:")
        print(f"   1. Go to Projects page")
        print(f"   2. Open Project ID: {project.id}")
        print(f"   3. Calculate sizing")
        print(f"   4. Create quote")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_volta_mills_project()
    if success:
        print("\n✅ Project creation completed successfully!")
    else:
        print("\n❌ Project creation failed!")
