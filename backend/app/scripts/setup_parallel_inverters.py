"""
Script to set up parallel inverter configuration settings
Usage: python -m app.scripts.setup_parallel_inverters
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Setting

def setup_parallel_inverters():
    db: Session = SessionLocal()
    try:
        settings = [
            {
                "key": "use_parallel_inverters",
                "value": "1",
                "description": "Enable parallel inverters (1 = enabled, 0 = disabled)"
            },
            {
                "key": "standard_inverter_sizes",
                "value": "10,15,20,25,30",
                "description": "Standard inverter sizes in kW (comma-separated)"
            },
            {
                "key": "max_parallel_inverters",
                "value": "4",
                "description": "Maximum number of inverters that can be paralleled"
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for setting_data in settings:
            existing = db.query(Setting).filter(Setting.key == setting_data["key"]).first()
            
            if existing:
                existing.value = setting_data["value"]
                existing.description = setting_data["description"]
                updated_count += 1
                print(f"✅ Updated: {setting_data['key']} = {setting_data['value']}")
            else:
                new_setting = Setting(
                    key=setting_data["key"],
                    value=setting_data["value"],
                    description=setting_data["description"]
                )
                db.add(new_setting)
                created_count += 1
                print(f"✅ Created: {setting_data['key']} = {setting_data['value']}")
        
        db.commit()
        
        print(f"\n✅ Setup complete!")
        print(f"   Created: {created_count} settings")
        print(f"   Updated: {updated_count} settings")
        print("\n📊 Parallel Inverter Configuration:")
        print("   - Enabled: Yes")
        print("   - Standard Sizes: 10kW, 15kW, 20kW, 25kW, 30kW")
        print("   - Max Parallel: 4 inverters")
        print("\n💡 Example:")
        print("   - Required: 31kW → 2× 20kW inverters (40kW total)")
        print("   - Required: 50kW → 2× 25kW inverters (50kW total)")
        print("   - Required: 60kW → 3× 20kW inverters (60kW total)")
        
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
    success = setup_parallel_inverters()
    sys.exit(0 if success else 1)
