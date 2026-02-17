"""
Create customer Albert Amonoo and a 76 kW power system project.
Uses a single commercial/industrial load sized so that Calculate Sizing yields ~76 kW.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Project, Appliance, ApplianceCategory, ApplianceType, PowerUnit, SystemType, ProjectStatus, User
from app.services.load_calculator import calculate_appliance_daily_kwh, calculate_total_daily_kwh
from datetime import datetime


def create_albert_amonoo_project():
    db: Session = SessionLocal()
    try:
        customer = db.query(Customer).filter(Customer.name.ilike("%Albert Amonoo%")).first()
        if customer:
            print(f"✅ Customer already exists: {customer.name} (ID: {customer.id})")
        else:
            customer = Customer(
                name="Albert Amonoo",
                phone="0242222222",
                email="albert.amonoo@dummy.com",
                address="Ghana",
                city="",
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
            Project.name.ilike("%76%"),
        ).first()
        if existing:
            print(f"⚠️  Project already exists: {existing.name} (ID: {existing.id})")
            return False

        project = Project(
            customer_id=customer.id,
            name="Albert Amonoo - 76kW Power System",
            reference_code=f"AA-{datetime.now().strftime('%Y%m%d')}-001",
            system_type=SystemType.HYBRID,
            status=ProjectStatus.NEW,
            created_by=admin_user.id,
        )
        db.add(project)
        db.flush()
        print(f"✅ Created project: {project.name} (ID: {project.id})")

        # Load sized to target ~76 kW system (total_daily_kwh ~228–237 gives ~76 kW with typical settings)
        # 76 kW × 3 h/day = 228 kWh/day
        appliances_data = [
            {
                "category": ApplianceCategory.INDUSTRIAL,
                "appliance_type": ApplianceType.OTHER,
                "description": "76kW Commercial / Industrial Load",
                "power_value": 76.0,
                "power_unit": PowerUnit.KW,
                "quantity": 1,
                "hours_per_day": 3.0,
                "is_essential": True,
            },
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
            print(f"  ✅ Added: {app_data['quantity']}x {app_data['description']} ({daily_kwh:.1f} kWh/day)")

        db.commit()
        db.refresh(project)

        total_with_diversity = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=True)
        print(f"\n✅ Done!")
        print(f"   Project ID: {project.id}")
        print(f"   Target system size: 76 kW")
        print(f"   Total Daily Energy (raw): {total_kwh:.1f} kWh/day")
        print(f"   Total Daily Energy (with diversity): {total_with_diversity:.1f} kWh/day")
        print(f"\n🔄 Next: Projects → Open project {project.id} → Calculate sizing (should yield ~76 kW) → Create quote")
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
    success = create_albert_amonoo_project()
    sys.exit(0 if success else 1)
