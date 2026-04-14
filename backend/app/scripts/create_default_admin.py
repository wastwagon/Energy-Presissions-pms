"""
Script to create a default admin user (non-interactive)
Usage: python -m app.scripts.create_default_admin
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash

def create_default_admin():
    db: Session = SessionLocal()
    try:
        email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@energyprecisions.com").strip()
        password = os.getenv("DEFAULT_ADMIN_PASSWORD", "").strip()
        force_reset = os.getenv("FORCE_RESET_ADMIN_PASSWORD", "false").lower() in ("1", "true", "yes")
        full_name = "System Administrator"

        if not password:
            print("Error: DEFAULT_ADMIN_PASSWORD is required. Refusing to use an insecure default password.")
            return
        
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists!")
            if force_reset:
                existing.hashed_password = get_password_hash(password)
                db.commit()
                print(f"Password reset for {email} (FORCE_RESET_ADMIN_PASSWORD=true)")
            else:
                print("Leaving existing password unchanged. Set FORCE_RESET_ADMIN_PASSWORD=true to reset.")
            return
        
        # Create admin user
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        print(f"Admin user {email} created successfully!")
        print("IMPORTANT: Change this admin password immediately after first login.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_admin()








