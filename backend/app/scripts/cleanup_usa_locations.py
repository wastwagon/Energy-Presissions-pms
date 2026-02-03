"""
Script to remove USA locations from peak_sun_hours table
Run this to clean up existing database entries
"""
from app.database import SessionLocal
from app.models import PeakSunHours

def cleanup_usa_locations():
    """Remove all USA entries from peak_sun_hours table"""
    db = SessionLocal()
    try:
        usa_entries = db.query(PeakSunHours).filter(PeakSunHours.country == "USA").all()
        count = len(usa_entries)
        for entry in usa_entries:
            db.delete(entry)
        
        db.commit()
        print(f"Removed {count} USA location entries from database.")
    except Exception as e:
        print(f"Error cleaning up USA locations: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_usa_locations()








