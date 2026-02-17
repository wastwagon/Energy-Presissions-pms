"""
Create customer Francis (Afieya) and project with appliance list:
- 1 deep freeze, 1 fridge, 1 TV 55", 1 sound system, 2 ceiling fans,
- 7× 15W light bulbs, 1 microwave, 1 blender, 1 washing machine, 1 iron
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Project, Appliance, ApplianceCategory, ApplianceType, PowerUnit, SystemType, ProjectStatus, User
from app.services.load_calculator import calculate_appliance_daily_kwh, calculate_total_daily_kwh
from datetime import datetime


def create_francis_project():
    db: Session = SessionLocal()
    try:
        customer = db.query(Customer).filter(Customer.name.ilike("%Francis%")).first()
        if customer:
            print(f"✅ Customer already exists: {customer.name} (ID: {customer.id})")
        else:
            customer = Customer(
                name="Francis",
                phone="+233261863689",
                email="francis.afieya@dummy.com",
                address="Afieya",
                city="Afieya",
                country="Ghana",
            )
            db.add(customer)
            db.flush()
            print(f"✅ Created customer: {customer.name} (ID: {customer.id})")

        admin_user = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
        if not admin_user:
            admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            print("❌ No admin user found!")
            return False

        existing = db.query(Project).filter(
            Project.customer_id == customer.id,
            Project.name.ilike("%Afieya%"),
        ).first()
        if existing:
            print(f"⚠️  Project already exists: {existing.name} (ID: {existing.id})")
            return False

        project = Project(
            customer_id=customer.id,
            name="Francis - Afieya (Residential)",
            reference_code=f"FR-{datetime.now().strftime('%Y%m%d')}-001",
            system_type=SystemType.HYBRID,
            status=ProjectStatus.NEW,
            created_by=admin_user.id,
        )
        db.add(project)
        db.flush()
        print(f"✅ Created project: {project.name} (ID: {project.id})")

        appliances_data = [
            {"category": ApplianceCategory.REFRIGERATION, "appliance_type": ApplianceType.FREEZER,
             "description": "Deep Freezer", "power_value": 400, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 24.0, "is_essential": True},
            {"category": ApplianceCategory.REFRIGERATION, "appliance_type": ApplianceType.SINGLE_DOOR_FRIDGE,
             "description": "Fridge", "power_value": 150, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 24.0, "is_essential": True},
            {"category": ApplianceCategory.ENTERTAINMENT, "appliance_type": ApplianceType.TV_55INCH_LED,
             "description": "55-inch LED TV", "power_value": 150, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 6.0, "is_essential": False},
            {"category": ApplianceCategory.ENTERTAINMENT, "appliance_type": ApplianceType.SOUND_SYSTEM,
             "description": "Sound System", "power_value": 200, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 4.0, "is_essential": False},
            {"category": ApplianceCategory.COOLING, "appliance_type": ApplianceType.CEILING_FAN,
             "description": "Ceiling Fan", "power_value": 70, "power_unit": PowerUnit.W,
             "quantity": 2, "hours_per_day": 12.0, "is_essential": False},
            {"category": ApplianceCategory.LIGHTING, "appliance_type": ApplianceType.LED_BULB,
             "description": "15W LED Bulb", "power_value": 15, "power_unit": PowerUnit.W,
             "quantity": 7, "hours_per_day": 8.0, "is_essential": False},
            {"category": ApplianceCategory.COOKING, "appliance_type": ApplianceType.MICROWAVE,
             "description": "Microwave", "power_value": 800, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 0.5, "is_essential": False},
            {"category": ApplianceCategory.COOKING, "appliance_type": ApplianceType.BLENDER,
             "description": "Blender", "power_value": 500, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 0.2, "is_essential": False},
            {"category": ApplianceCategory.LAUNDRY, "appliance_type": ApplianceType.WASHING_MACHINE,
             "description": "Washing Machine", "power_value": 400, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 1.0, "is_essential": False},
            {"category": ApplianceCategory.LAUNDRY, "appliance_type": ApplianceType.IRON,
             "description": "Pressing Iron", "power_value": 1200, "power_unit": PowerUnit.W,
             "quantity": 1, "hours_per_day": 0.5, "is_essential": False},
        ]

        print("\n📋 Adding appliances...")
        total_kwh = 0.0
        for app_data in appliances_data:
            power_unit_str = app_data["power_unit"].value if hasattr(app_data["power_unit"], "value") else str(app_data["power_unit"])
            appliance_type_str = app_data["appliance_type"].value if hasattr(app_data["appliance_type"], "value") else str(app_data["appliance_type"])
            daily_kwh = calculate_appliance_daily_kwh(
                app_data["power_value"],
                power_unit_str,
                app_data["quantity"],
                app_data["hours_per_day"],
                appliance_type_str,
                db,
            )
            appliance = Appliance(
                project_id=project.id,
                daily_kwh=daily_kwh,
                **app_data,
            )
            db.add(appliance)
            total_kwh += daily_kwh
            print(f"  ✅ {app_data['quantity']}x {app_data['description']} ({daily_kwh:.2f} kWh/day)")

        db.commit()
        db.refresh(project)

        total_with_diversity = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=True)
        print(f"\n✅ Done!")
        print(f"   Project ID: {project.id}")
        print(f"   Location: Afieya")
        print(f"   Total Daily Energy (raw): {total_kwh:.2f} kWh/day")
        print(f"   Total Daily Energy (with diversity): {total_with_diversity:.2f} kWh/day")
        print(f"\n🔄 Next: Projects → Open project {project.id} → Calculate sizing → Create quote")
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
    success = create_francis_project()
    sys.exit(0 if success else 1)
