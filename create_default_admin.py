#!/usr/bin/env python3
"""
Quick script to create a default admin user
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_default_admin():
    db = SessionLocal()
    try:
        email = 'admin@energyprecisions.com'
        password = 'admin123'
        
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists!")
            print(f"Email: {email}")
            print(f"Password: (use existing password or reset)")
            return
        
        # Create admin user
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name='Admin User',
            role='admin'
        )
        db.add(admin)
        db.commit()
        print("=" * 50)
        print("Admin user created successfully!")
        print("=" * 50)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("=" * 50)
        print("⚠️  IMPORTANT: Change this password after first login!")
        print("=" * 50)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_admin()








