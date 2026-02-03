from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from sqlalchemy.sql import extract
from datetime import datetime, timedelta
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Quote, Project, Customer, QuoteStatus, ProjectStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get dashboard statistics based on user role"""
    
    # For sales users, filter by their created records
    # For admin users, show all records
    
    if current_user.role.value == "admin":
        # Admin sees all data
        total_customers = db.query(Customer).count()
        # Active projects are those not yet installed
        active_projects = db.query(Project).filter(
            Project.status != ProjectStatus.INSTALLED
        ).count()
        total_quotes = db.query(Quote).count()
        
        # Quotes by status
        quotes_by_status = db.query(
            Quote.status,
            func.count(Quote.id).label('count')
        ).group_by(Quote.status).all()
        
        status_counts = {status.value: count for status, count in quotes_by_status}
        accepted_quotes = status_counts.get("accepted", 0)
        conversion_rate = (accepted_quotes / total_quotes * 100) if total_quotes > 0 else 0
        
        # Recent quotes (all) - eager load relationships
        recent_quotes = db.query(Quote).options(
            joinedload(Quote.project).joinedload(Project.customer)
        ).order_by(Quote.created_at.desc()).limit(5).all()
        
    else:
        # Sales users see only their data
        total_customers = db.query(Customer).join(Project).filter(
            Project.created_by == current_user.id
        ).distinct().count()
        
        # Active projects are those not yet installed
        active_projects = db.query(Project).filter(
            Project.created_by == current_user.id,
            Project.status != ProjectStatus.INSTALLED
        ).count()
        
        total_quotes = db.query(Quote).filter(
            Quote.created_by == current_user.id
        ).count()
        
        # Quotes by status (user's quotes)
        quotes_by_status = db.query(
            Quote.status,
            func.count(Quote.id).label('count')
        ).filter(
            Quote.created_by == current_user.id
        ).group_by(Quote.status).all()
        
        status_counts = {status.value: count for status, count in quotes_by_status}
        accepted_quotes = status_counts.get("accepted", 0)
        conversion_rate = (accepted_quotes / total_quotes * 100) if total_quotes > 0 else 0
        
        # Recent quotes (user's quotes) - eager load relationships
        recent_quotes = db.query(Quote).options(
            joinedload(Quote.project).joinedload(Project.customer)
        ).filter(
            Quote.created_by == current_user.id
        ).order_by(Quote.created_at.desc()).limit(5).all()
    
    # Calculate totals for quotes
    this_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    if current_user.role.value == "admin":
        total_quoted_value = db.query(func.sum(Quote.grand_total)).scalar() or 0
        accepted_value = db.query(func.sum(Quote.grand_total)).filter(
            Quote.status == QuoteStatus.ACCEPTED
        ).scalar() or 0
        pending_quotes = db.query(Quote).filter(
            Quote.status.in_([QuoteStatus.DRAFT, QuoteStatus.SENT])
        ).count()
        this_month_quotes = db.query(Quote).filter(
            Quote.created_at >= this_month_start
        ).count()
    else:
        total_quoted_value = db.query(func.sum(Quote.grand_total)).filter(
            Quote.created_by == current_user.id
        ).scalar() or 0
        accepted_value = db.query(func.sum(Quote.grand_total)).filter(
            Quote.status == QuoteStatus.ACCEPTED,
            Quote.created_by == current_user.id
        ).scalar() or 0
        pending_quotes = db.query(Quote).filter(
            Quote.status.in_([QuoteStatus.DRAFT, QuoteStatus.SENT]),
            Quote.created_by == current_user.id
        ).count()
        this_month_quotes = db.query(Quote).filter(
            Quote.created_at >= this_month_start,
            Quote.created_by == current_user.id
        ).count()
    
    # Format recent quotes
    recent_quotes_data = []
    for quote in recent_quotes:
        recent_quotes_data.append({
            "id": quote.id,
            "quote_number": quote.quote_number,
            "customer_name": quote.project.customer.name if quote.project and quote.project.customer else "N/A",
            "project_name": quote.project.name if quote.project else "N/A",
            "status": quote.status.value,
            "grand_total": float(quote.grand_total),
            "created_at": quote.created_at.isoformat() if quote.created_at else None
        })
    
    return {
        "role": current_user.role.value,
        "total_customers": total_customers,
        "active_projects": active_projects,
        "total_quotes": total_quotes,
        "quotes_by_status": status_counts,
        "accepted_quotes": accepted_quotes,
        "conversion_rate": round(conversion_rate, 2),
        "total_quoted_value": float(total_quoted_value),
        "accepted_value": float(accepted_value),
        "pending_quotes": pending_quotes,
        "this_month_quotes": this_month_quotes,
        "recent_quotes": recent_quotes_data
    }

