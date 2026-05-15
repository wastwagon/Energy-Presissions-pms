"""
Script to set up load diversity factor setting
Usage: python -m app.scripts.setup_load_diversity
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Setting

def setup_load_diversity():
    db: Session = SessionLocal()
    try:
        # Check if setting exists
        existing = db.query(Setting).filter(Setting.key == "load_diversity_factor").first()
        
        if existing:
            print(f"✅ Load diversity factor already exists: {existing.value}")
            print(f"   Current value: {existing.value}")
            print(f"   This means {float(existing.value)*100:.0f}% of appliances are used simultaneously")
        else:
            # Default 1.0 = 100% (full load / no diversity reduction until lowered in Settings)
            diversity_setting = Setting(
                key="load_diversity_factor",
                value="1",
                description="Load diversity factor: fraction applied to daily load (1.0 = full load; lower e.g. 0.65 for staggered use)"
            )
            db.add(diversity_setting)
            db.commit()
            print("✅ Created load_diversity_factor setting: 1.0 (100% — full load)")
            print("   Lower in Settings if you want simultaneous-use diversity applied to totals")
        
        print("\n📊 Load Diversity Factor Explanation:")
        print("   - 1.0 (100%) = full daily load (default; no reduction)")
        print("   - Lower values (e.g. 0.65) = fraction of load assumed on at once")
        print("   - Adjust in Settings to match site usage")
        print("\n💡 To change the factor:")
        print("   - Go to Settings in the PMS")
        print("   - Or update directly in database: Setting where key='load_diversity_factor'")
        
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
    success = setup_load_diversity()
    sys.exit(0 if success else 1)
