#!/usr/bin/env python3
"""
Script to update Accra's peak sun hours to 5.0
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models import PeakSunHours

def update_accra_peak_sun_hours():
    """Update Accra's peak sun hours to 5.0"""
    db = SessionLocal()
    try:
        # Find Accra entry
        accra = db.query(PeakSunHours).filter(
            PeakSunHours.city == "Accra",
            PeakSunHours.state == "Greater Accra",
            PeakSunHours.country == "Ghana"
        ).first()
        
        if accra:
            old_value = accra.peak_sun_hours
            accra.peak_sun_hours = 5.0
            db.commit()
            print(f"✅ Updated Accra peak sun hours: {old_value} → 5.0")
        else:
            # Create if doesn't exist
            accra = PeakSunHours(
                city="Accra",
                state="Greater Accra",
                country="Ghana",
                peak_sun_hours=5.0,
                source="IRENA/GSS"
            )
            db.add(accra)
            db.commit()
            print("✅ Created Accra peak sun hours entry: 5.0")
        
        db.refresh(accra)
        print(f"   City: {accra.city}")
        print(f"   State: {accra.state}")
        print(f"   Peak Sun Hours: {accra.peak_sun_hours}")
        
    except Exception as e:
        print(f"❌ Error updating Accra peak sun hours: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_accra_peak_sun_hours()




