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
            # Create new setting with default 65% (0.65)
            # This means on average, only 65% of appliances are on at the same time
            diversity_setting = Setting(
                key="load_diversity_factor",
                value="0.65",
                description="Load diversity factor: percentage of appliances used simultaneously (0.65 = 65%)"
            )
            db.add(diversity_setting)
            db.commit()
            print("✅ Created load_diversity_factor setting: 0.65 (65%)")
            print("   This accounts for realistic usage - not all appliances run at once")
        
        print("\n📊 Load Diversity Factor Explanation:")
        print("   - 0.65 (65%) = Default for residential/commercial")
        print("   - Accounts for: staggered usage, load management, not all ACs on at once")
        print("   - Adjustable in Settings if needed")
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
