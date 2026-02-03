import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import PeakSunHours

db = SessionLocal()
accra = db.query(PeakSunHours).filter(PeakSunHours.city == "Accra").first()
if accra:
    accra.peak_sun_hours = 5.0
    db.commit()
    print(f"Updated Accra: {accra.peak_sun_hours}")
db.close()




