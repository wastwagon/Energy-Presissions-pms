"""
Newsletter subscription API - public endpoint (no auth required)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models import NewsletterSubscriber

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])


class SubscribeRequest(BaseModel):
    email: EmailStr


@router.post("/subscribe")
async def subscribe(
    data: SubscribeRequest,
    db: Session = Depends(get_db)
):
    """Subscribe an email to the newsletter. Idempotent - returns success if already subscribed."""
    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == data.email.lower()
    ).first()
    
    if existing:
        if existing.is_active:
            return {"message": "Already subscribed", "status": "success"}
        existing.is_active = True
        db.commit()
        return {"message": "Resubscribed successfully", "status": "success"}
    
    subscriber = NewsletterSubscriber(email=data.email.lower(), is_active=True)
    db.add(subscriber)
    db.commit()
    return {"message": "Subscribed successfully", "status": "success"}
