"""
Script to reset admin password and verify it works
Usage: python -m app.scripts.reset_admin_password
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash, verify_password

def reset_admin_password():
    db: Session = SessionLocal()
    try:
        email = "admin@energyprecisions.com"
        password = "admin123"
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"User with email {email} does not exist. Creating new user...")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✓ Admin user created: {email}")
        else:
            print(f"✓ User found: {email}")
            print(f"  - Role: {user.role}")
            print(f"  - Active: {user.is_active}")
            print(f"  - Full Name: {user.full_name}")
            
            # Reset password
            new_hash = get_password_hash(password)
            user.hashed_password = new_hash
            user.is_active = True  # Ensure user is active
            db.commit()
            print(f"✓ Password reset for {email}")
        
        # Verify the password works
        db.refresh(user)
        test_result = verify_password(password, user.hashed_password)
        
        if test_result:
            print(f"✓ Password verification successful!")
            print(f"\nLogin credentials:")
            print(f"  Email: {email}")
            print(f"  Password: {password}")
        else:
            print(f"✗ Password verification FAILED!")
            print(f"  This should not happen. Please check the password hashing.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()








