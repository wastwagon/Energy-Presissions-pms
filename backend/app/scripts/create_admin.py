"""
Script to create an admin user
Usage: python -m app.scripts.create_admin
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_admin():
    db: Session = SessionLocal()
    try:
        email = input("Enter admin email: ")
        password = input("Enter admin password: ")
        full_name = input("Enter admin full name: ")
        
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists!")
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
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()








