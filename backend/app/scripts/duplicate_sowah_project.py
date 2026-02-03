"""
Script to duplicate Mr. Sowah's project with modifications:
- Remove: Electric Oven, Kettle, all ACs
- Keep only 2 TVs (largest ones)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal
from app.models import Project, Customer, Appliance, User, ApplianceType, ProjectStatus, SystemType
from app.services.load_calculator import calculate_appliance_daily_kwh
from datetime import datetime

def duplicate_sowah_project():
    db = SessionLocal()
    
    try:
        # Find Mr. Sowah's customer
        sowah = db.query(Customer).filter(
            Customer.name.ilike('%sowah%')
        ).first()
        
        if not sowah:
            print("❌ Mr. Sowah customer not found")
            return
        
        print(f"✅ Found customer: {sowah.name}")
        
        # Find original project (project 6)
        original_project = db.query(Project).filter(Project.id == 6).first()
        if not original_project:
            print("❌ Original project 6 not found")
            return
        
        print(f"✅ Found original project: {original_project.name}")
        
        # Get admin user for created_by
        admin_user = db.query(User).filter(User.email == 'admin@energyprecisions.com').first()
        if not admin_user:
            print("❌ Admin user not found")
            return
        
        # Create new project
        new_project = Project(
            customer_id=sowah.id,
            name=f"{original_project.name} - Modified",
            reference_code=f"{original_project.reference_code}-MOD",
            status=ProjectStatus.NEW,
            system_type=original_project.system_type or SystemType.HYBRID,
            created_by=admin_user.id
        )
        db.add(new_project)
        db.flush()  # Get the ID
        
        print(f"✅ Created new project: {new_project.name} (ID: {new_project.id})")
        
        # Get all appliances from original project
        original_appliances = db.query(Appliance).filter(Appliance.project_id == 6).all()
        
        print(f"\n📦 Processing {len(original_appliances)} appliances...")
        
        # Items to remove
        remove_keywords = ['oven', 'kettle', 'ac', 'air_condition', 'air_conditioner']
        
        # Track TVs
        tvs = []
        tv_count = 0
        max_tv_quantity = 2
        
        appliances_added = 0
        appliances_removed = 0
        
        for app in original_appliances:
            app_type_str = app.appliance_type.value if hasattr(app.appliance_type, 'value') else str(app.appliance_type)
            description_lower = app.description.lower() if app.description else ''
            
            # Check if should be removed
            should_remove = any(keyword in app_type_str.lower() or keyword in description_lower for keyword in remove_keywords)
            
            # Handle TVs separately
            is_tv = 'tv' in app_type_str.lower() or 'television' in description_lower
            
            if is_tv:
                tvs.append((app, app_type_str))
                # We'll add TVs after processing all appliances
                continue
            
            if should_remove:
                print(f"   ❌ Removing: {app.description} ({app_type_str})")
                appliances_removed += 1
                continue
            
            # Copy appliance
            new_appliance = Appliance(
                project_id=new_project.id,
                category=app.category,
                appliance_type=app.appliance_type,
                description=app.description,
                power_value=app.power_value,
                power_unit=app.power_unit,
                quantity=app.quantity,
                hours_per_day=app.hours_per_day,
                is_essential=app.is_essential,
                daily_kwh=None  # Will calculate below
            )
            
            # Calculate daily_kwh
            daily_kwh = calculate_appliance_daily_kwh(
                power_value=app.power_value,
                power_unit=app.power_unit.value if hasattr(app.power_unit, 'value') else str(app.power_unit),
                quantity=app.quantity,
                hours_per_day=app.hours_per_day,
                appliance_type=app_type_str,
                db=db
            )
            new_appliance.daily_kwh = daily_kwh
            
            db.add(new_appliance)
            appliances_added += 1
            print(f"   ✅ Added: {app.description} - {daily_kwh:.2f} kWh/day")
        
        # Handle TVs - keep only 2 (prefer larger ones)
        print(f"\n📺 Processing TVs (keeping only {max_tv_quantity}):")
        # Sort TVs by power (largest first) or by description
        tvs_sorted = sorted(tvs, key=lambda x: x[0].power_value * x[0].quantity, reverse=True)
        
        for tv_app, tv_type in tvs_sorted:
            if tv_count >= max_tv_quantity:
                print(f"   ❌ Skipping: {tv_app.description} (limit reached)")
                appliances_removed += 1
                continue
            
            # Add TV with quantity 1 (or adjust if needed)
            new_appliance = Appliance(
                project_id=new_project.id,
                category=tv_app.category,
                appliance_type=tv_app.appliance_type,
                description=tv_app.description,
                power_value=tv_app.power_value,
                power_unit=tv_app.power_unit,
                quantity=1,  # Only 1 of each TV type
                hours_per_day=tv_app.hours_per_day,
                is_essential=tv_app.is_essential,
                daily_kwh=None
            )
            
            # Calculate daily_kwh for quantity 1
            daily_kwh = calculate_appliance_daily_kwh(
                power_value=tv_app.power_value,
                power_unit=tv_app.power_unit.value if hasattr(tv_app.power_unit, 'value') else str(tv_app.power_unit),
                quantity=1,  # Only 1 TV
                hours_per_day=tv_app.hours_per_day,
                appliance_type=tv_type,
                db=db
            )
            new_appliance.daily_kwh = daily_kwh
            
            db.add(new_appliance)
            tv_count += 1
            appliances_added += 1
            print(f"   ✅ Added: {tv_app.description} (1 unit) - {daily_kwh:.2f} kWh/day")
        
        db.commit()
        
        print(f"\n✅ Project duplication complete!")
        print(f"   Project ID: {new_project.id}")
        print(f"   Appliances added: {appliances_added}")
        print(f"   Appliances removed: {appliances_removed}")
        print(f"   TVs kept: {tv_count}")
        
        # Calculate total daily kWh
        from app.services.load_calculator import calculate_total_daily_kwh
        total_kwh = calculate_total_daily_kwh(db, new_project.id, apply_diversity_factor=False)
        total_kwh_with_diversity = calculate_total_daily_kwh(db, new_project.id, apply_diversity_factor=True)
        
        print(f"\n📊 Energy Consumption:")
        print(f"   Total (without diversity): {total_kwh:.2f} kWh/day")
        print(f"   Total (with diversity): {total_kwh_with_diversity:.2f} kWh/day")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    duplicate_sowah_project()
