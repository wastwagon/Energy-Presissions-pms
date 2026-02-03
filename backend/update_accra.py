#!/usr/bin/env python3
"""Quick script to update Accra peak sun hours to 5.0"""
import os
import sys

# Set up environment
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import PeakSunHours

db = SessionLocal()
try:
    accra = db.query(PeakSunHours).filter(
        PeakSunHours.city == "Accra",
        PeakSunHours.state == "Greater Accra"
    ).first()
    
    if accra:
        old = accra.peak_sun_hours
        accra.peak_sun_hours = 5.0
        db.commit()
        print(f"✅ Updated: Accra peak sun hours {old} → 5.0")
    else:
        accra = PeakSunHours(city="Accra", state="Greater Accra", country="Ghana", peak_sun_hours=5.0)
        db.add(accra)
        db.commit()
        print("✅ Created: Accra peak sun hours = 5.0")
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()




