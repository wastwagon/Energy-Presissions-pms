"""User management endpoints (admin only)"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User
from app.schemas import User as UserSchema

router = APIRouter(prefix="/users", tags=["users"])


def require_admin(current_user: User) -> User:
    """Ensure current user is admin"""
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access user management"
        )
    return current_user


@router.get("/", response_model=List[UserSchema])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all users (admin only)"""
    require_admin(current_user)
    users = db.query(User).all()
    return users
