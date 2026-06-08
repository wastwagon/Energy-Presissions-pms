"""
Newsletter subscription API - public subscribe + admin list/update.
"""
from collections import defaultdict
from datetime import datetime
from threading import Lock
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from app.database import get_db
from app.models import NewsletterSubscriber, User, UserRole
from app.auth import require_role
from app.rate_limit import check_rate_limit

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

_NEWSLETTER_SUBMITS: dict[str, list[float]] = defaultdict(list)
_NEWSLETTER_LOCK = Lock()
_NEWSLETTER_MAX_PER_WINDOW = 5
_NEWSLETTER_WINDOW_SEC = 600


class SubscribeRequest(BaseModel):
    email: EmailStr
    company_website: str = Field("", max_length=200)  # honeypot — leave blank


@router.post("/subscribe")
async def subscribe(
    request: Request,
    data: SubscribeRequest,
    db: Session = Depends(get_db),
):
    """Subscribe an email to the newsletter. Idempotent - returns success if already subscribed."""
    if data.company_website:
        return {"message": "Subscribed successfully", "status": "success"}

    check_rate_limit(
        _NEWSLETTER_SUBMITS,
        _NEWSLETTER_LOCK,
        request,
        max_per_window=_NEWSLETTER_MAX_PER_WINDOW,
        window_sec=_NEWSLETTER_WINDOW_SEC,
        detail="Too many subscription attempts. Please try again later.",
    )

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


class SubscriberOut(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriberPatch(BaseModel):
    is_active: bool


@router.get("/subscribers", response_model=List[SubscriberOut])
async def list_subscribers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.WEBSITE_ADMIN])),
):
    q = db.query(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc())
    if active_only:
        q = q.filter(NewsletterSubscriber.is_active.is_(True))
    return q.offset(skip).limit(limit).all()


@router.patch("/subscribers/{subscriber_id}", response_model=SubscriberOut)
async def update_subscriber(
    subscriber_id: int,
    body: SubscriberPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.WEBSITE_ADMIN])),
):
    row = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.id == subscriber_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    row.is_active = body.is_active
    db.commit()
    db.refresh(row)
    return row
