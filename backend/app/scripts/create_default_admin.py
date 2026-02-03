"""
Script to create a default admin user (non-interactive)
Usage: python -m app.scripts.create_default_admin
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_default_admin():
    db: Session = SessionLocal()
    try:
        email = "admin@energyprecisions.com"
        password = "admin123"
        full_name = "System Administrator"
        
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists!")
            # Update password to ensure it's correct
            existing.hashed_password = get_password_hash(password)
            db.commit()
            print(f"Password updated for {email}")
            return
        
        # Create admin user
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role="admin"
        )
        db.add(admin)
        db.commit()
        print(f"Admin user {email} created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_admin()








