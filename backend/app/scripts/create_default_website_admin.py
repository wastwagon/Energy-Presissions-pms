"""
Create a default website_admin user (non-interactive, development only).
Shop + marketing CMS only — change password before any real use.

Usage: python -m app.scripts.create_default_website_admin
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash


def create_default_website_admin():
    db: Session = SessionLocal()
    try:
        email = "webadmin@energyprecisions.com"
        password = "webadmin123"
        full_name = "Website Administrator"

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists!")
            existing.hashed_password = get_password_hash(password)
            existing.role = UserRole.WEBSITE_ADMIN
            db.commit()
            print(f"Password reset and role set to website_admin for {email}")
            return

        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=UserRole.WEBSITE_ADMIN,
        )
        db.add(user)
        db.commit()
        print(f"Website admin {email} created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("Sign in at /web/admin (frontend).")
    except Exception as e:
        print(f"Error: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_default_website_admin()
