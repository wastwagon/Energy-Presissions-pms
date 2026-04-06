"""
Public contact form — stores inquiries and emails admin (optional SendGrid).
"""
import os
import time
from collections import defaultdict
from datetime import datetime
from threading import Lock
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import ContactInquiry, User
from app.auth import require_role
from app.services.email_service import email_service
from app.config import settings

router = APIRouter(prefix="/api/contact", tags=["contact"])

# In-process limiter (per server process). Use a proxy CDN/WAF for production scale.
_CONTACT_SUBMITS: dict[str, list[float]] = defaultdict(list)
_CONTACT_LOCK = Lock()
_CONTACT_MAX_PER_WINDOW = 8
_CONTACT_WINDOW_SEC = 600


def _client_ip(request: Request) -> str:
    xf = request.headers.get("x-forwarded-for")
    if xf:
        return xf.split(",")[0].strip()[:80]
    if request.client:
        return request.client.host or "unknown"
    return "unknown"


def _check_contact_rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.time()
    with _CONTACT_LOCK:
        bucket = _CONTACT_SUBMITS[ip]
        bucket[:] = [t for t in bucket if now - t < _CONTACT_WINDOW_SEC]
        if len(bucket) >= _CONTACT_MAX_PER_WINDOW:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many submissions. Please try again later.",
            )
        bucket.append(now)


class ContactSubmit(BaseModel):
    name: str = Field(..., max_length=200)
    email: EmailStr
    phone: str = Field("", max_length=80)
    service: Optional[str] = Field(None, max_length=120)
    message: str = Field(..., max_length=8000)
    company_website: Optional[str] = Field(None, max_length=200)  # honeypot — leave blank


class ContactInquiryOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    service: Optional[str] = None
    message: str
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_contact(
    request: Request,
    data: ContactSubmit,
    db: Session = Depends(get_db),
):
    """Submit website contact form (public)."""
    if data.company_website:
        return {"message": "Thank you for your message.", "status": "success"}

    _check_contact_rate_limit(request)

    row = ContactInquiry(
        name=data.name.strip(),
        email=str(data.email).lower().strip(),
        phone=(data.phone or "").strip() or None,
        service=(data.service or "").strip() or None,
        message=data.message.strip(),
        source="website",
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    admin_email = os.getenv("ADMIN_EMAIL", settings.COMPANY_EMAIL)
    if admin_email:
        email_service.send_contact_inquiry(
            admin_email,
            {
                "name": row.name,
                "email": row.email,
                "phone": row.phone or "",
                "service": row.service or "",
                "message": row.message,
            },
        )

    return {"message": "Thank you for your message. We will contact you soon.", "status": "success"}


@router.get("/inquiries", response_model=List[ContactInquiryOut])
async def list_contact_inquiries(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """List recent contact submissions (admin)."""
    rows = (
        db.query(ContactInquiry)
        .order_by(desc(ContactInquiry.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return rows
