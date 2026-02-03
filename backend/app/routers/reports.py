from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from sqlalchemy.sql import extract
from datetime import datetime, timedelta
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Quote, Project, Customer, QuoteStatus, SizingResult
from app.services.report_pdf_generator import generate_report_pdf
from io import StringIO
import csv

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/analytics")
async def get_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analytics and statistics"""
    # Parse dates
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    else:
        start = datetime.utcnow() - timedelta(days=90)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    else:
        end = datetime.utcnow()
    
    # Total quotes
    total_quotes = db.query(Quote).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).count()
    
    # Quotes by status
    quotes_by_status = db.query(
        Quote.status,
        func.count(Quote.id).label('count')
    ).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).group_by(Quote.status).all()
    
    status_counts = {status.value: count for status, count in quotes_by_status}
    
    # Accepted quotes
    accepted_quotes = db.query(Quote).filter(
        Quote.status == QuoteStatus.ACCEPTED,
        Quote.created_at >= start,
        Quote.created_at <= end
    ).count()
    
    # Conversion rate
    conversion_rate = (accepted_quotes / total_quotes * 100) if total_quotes > 0 else 0
    
    # Total quoted value
    total_quoted = db.query(func.sum(Quote.grand_total)).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).scalar() or 0
    
    # Accepted value
    accepted_value = db.query(func.sum(Quote.grand_total)).filter(
        Quote.status == QuoteStatus.ACCEPTED,
        Quote.created_at >= start,
        Quote.created_at <= end
    ).scalar() or 0
    
    # Average system size (from projects with sizing)
    from sqlalchemy.orm import joinedload
    quotes_with_sizing = db.query(Quote).join(Project).join(SizingResult).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).all()
    
    if quotes_with_sizing:
        system_sizes = []
        for quote in quotes_with_sizing:
            if quote.project and quote.project.sizing_result:
                system_sizes.append(quote.project.sizing_result.system_size_kw)
        avg_system_size = sum(system_sizes) / len(system_sizes) if system_sizes else 0
    else:
        # Fallback: calculate from all sizing results in period
        sizing_results = db.query(SizingResult).join(Project).join(Quote).filter(
            Quote.created_at >= start,
            Quote.created_at <= end
        ).all()
        if sizing_results:
            avg_system_size = sum(sr.system_size_kw for sr in sizing_results) / len(sizing_results)
        else:
            avg_system_size = 0
    
    # Average quote value
    avg_quote_value = (total_quoted / total_quotes) if total_quotes > 0 else 0
    
    # Average accepted quote value
    avg_accepted_value = (accepted_value / accepted_quotes) if accepted_quotes > 0 else 0
    
    # Pending quotes
    pending_quotes = status_counts.get('pending', 0)
    
    # Rejected quotes
    rejected_quotes = status_counts.get('rejected', 0)
    
    # Revenue trend (compare with previous period)
    prev_start = start - (end - start)
    prev_total_quoted = db.query(func.sum(Quote.grand_total)).filter(
        Quote.created_at >= prev_start,
        Quote.created_at < start
    ).scalar() or 0
    revenue_change = ((total_quoted - prev_total_quoted) / prev_total_quoted * 100) if prev_total_quoted > 0 else 0
    
    # Quotes by month
    quotes_by_month = db.query(
        extract('year', Quote.created_at).label('year'),
        extract('month', Quote.created_at).label('month'),
        func.count(Quote.id).label('count')
    ).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).group_by(
        extract('year', Quote.created_at),
        extract('month', Quote.created_at)
    ).order_by('year', 'month').all()
    
    monthly_data = [
        {
            "month": f"{int(year)}-{int(month):02d}",
            "count": count
        }
        for year, month, count in quotes_by_month
    ]
    
    return {
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "total_quotes": total_quotes,
        "quotes_by_status": status_counts,
        "accepted_quotes": accepted_quotes,
        "pending_quotes": pending_quotes,
        "rejected_quotes": rejected_quotes,
        "conversion_rate": round(conversion_rate, 2),
        "total_quoted_value": float(total_quoted),
        "accepted_value": float(accepted_value),
        "average_quote_value": round(float(avg_quote_value), 2),
        "average_accepted_value": round(float(avg_accepted_value), 2),
        "average_system_size_kw": round(float(avg_system_size), 2),
        "revenue_change_percent": round(float(revenue_change), 2),
        "quotes_by_month": monthly_data
    }


@router.get("/export/quotes")
async def export_quotes_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export quotes to CSV"""
    query = db.query(Quote).join(Project).join(Customer)
    
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(Quote.created_at >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(Quote.created_at <= end)
    
    if status:
        query = query.filter(Quote.status == status)
    
    quotes = query.all()
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'Quote Number',
        'Customer',
        'Project',
        'System Type',
        'Status',
        'Equipment Subtotal',
        'Services Subtotal',
        'Tax Amount',
        'Discount Amount',
        'Grand Total',
        'Created Date',
        'Valid Until'
    ])
    
    # Data rows
    for quote in quotes:
        valid_until = (datetime.fromisoformat(quote.created_at.replace('Z', '+00:00')) + timedelta(days=quote.validity_days)).date() if quote.created_at else None
        writer.writerow([
            quote.quote_number,
            quote.project.customer.name if quote.project and quote.project.customer else '',
            quote.project.name if quote.project else '',
            quote.project.system_type.value if quote.project else '',
            quote.status.value,
            quote.equipment_subtotal,
            quote.services_subtotal,
            quote.tax_amount,
            quote.discount_amount,
            quote.grand_total,
            quote.created_at.date() if quote.created_at else '',
            valid_until
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=quotes_export.csv"}
    )


@router.get("/export/customers")
async def export_customers_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export customers to CSV"""
    customers = db.query(Customer).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'ID',
        'Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'Country',
        'Type',
        'Created Date'
    ])
    
    # Data rows
    for customer in customers:
        writer.writerow([
            customer.id,
            customer.name,
            customer.email or '',
            customer.phone or '',
            customer.address or '',
            customer.city or '',
            customer.country or '',
            customer.customer_type.value,
            customer.created_at.date() if customer.created_at else ''
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers_export.csv"}
    )


@router.get("/export/projects")
async def export_projects_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export projects to CSV"""
    projects = db.query(Project).join(Customer).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'Reference Code',
        'Name',
        'Customer',
        'System Type',
        'Status',
        'Created Date'
    ])
    
    # Data rows
    for project in projects:
        writer.writerow([
            project.reference_code or '',
            project.name,
            project.customer.name if project.customer else '',
            project.system_type.value,
            project.status.value,
            project.created_at.date() if project.created_at else ''
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=projects_export.csv"}
    )


@router.get("/pdf")
async def get_report_pdf(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate and download analytics report as PDF"""
    # Parse dates (same logic as get_analytics)
    if start_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    else:
        start = datetime.utcnow() - timedelta(days=90)
    
    if end_date:
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    else:
        end = datetime.utcnow()
    
    # Get analytics data (reuse logic from get_analytics)
    # Total quotes
    total_quotes = db.query(Quote).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).count()
    
    # Quotes by status
    quotes_by_status = db.query(
        Quote.status,
        func.count(Quote.id).label('count')
    ).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).group_by(Quote.status).all()
    
    status_counts = {status.value: count for status, count in quotes_by_status}
    
    # Accepted quotes
    accepted_quotes = db.query(Quote).filter(
        Quote.status == QuoteStatus.ACCEPTED,
        Quote.created_at >= start,
        Quote.created_at <= end
    ).count()
    
    # Conversion rate
    conversion_rate = (accepted_quotes / total_quotes * 100) if total_quotes > 0 else 0
    
    # Total quoted value
    total_quoted = db.query(func.sum(Quote.grand_total)).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).scalar() or 0
    
    # Accepted value
    accepted_value = db.query(func.sum(Quote.grand_total)).filter(
        Quote.status == QuoteStatus.ACCEPTED,
        Quote.created_at >= start,
        Quote.created_at <= end
    ).scalar() or 0
    
    # Average system size
    from sqlalchemy.orm import joinedload
    quotes_with_sizing = db.query(Quote).join(Project).join(SizingResult).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).all()
    
    if quotes_with_sizing:
        system_sizes = []
        for quote in quotes_with_sizing:
            if quote.project and quote.project.sizing_result:
                system_sizes.append(quote.project.sizing_result.system_size_kw)
        avg_system_size = sum(system_sizes) / len(system_sizes) if system_sizes else 0
    else:
        sizing_results = db.query(SizingResult).join(Project).join(Quote).filter(
            Quote.created_at >= start,
            Quote.created_at <= end
        ).all()
        if sizing_results:
            avg_system_size = sum(sr.system_size_kw for sr in sizing_results) / len(sizing_results)
        else:
            avg_system_size = 0
    
    # Average quote value
    avg_quote_value = (total_quoted / total_quotes) if total_quotes > 0 else 0
    
    # Average accepted quote value
    avg_accepted_value = (accepted_value / accepted_quotes) if accepted_quotes > 0 else 0
    
    # Pending quotes
    pending_quotes = status_counts.get('pending', 0)
    
    # Rejected quotes
    rejected_quotes = status_counts.get('rejected', 0)
    
    # Revenue trend
    prev_start = start - (end - start)
    prev_total_quoted = db.query(func.sum(Quote.grand_total)).filter(
        Quote.created_at >= prev_start,
        Quote.created_at < start
    ).scalar() or 0
    revenue_change = ((total_quoted - prev_total_quoted) / prev_total_quoted * 100) if prev_total_quoted > 0 else 0
    
    # Quotes by month
    quotes_by_month = db.query(
        extract('year', Quote.created_at).label('year'),
        extract('month', Quote.created_at).label('month'),
        func.count(Quote.id).label('count')
    ).filter(
        Quote.created_at >= start,
        Quote.created_at <= end
    ).group_by(
        extract('year', Quote.created_at),
        extract('month', Quote.created_at)
    ).order_by('year', 'month').all()
    
    monthly_data = [
        {
            "month": f"{int(year)}-{int(month):02d}",
            "count": count
        }
        for year, month, count in quotes_by_month
    ]
    
    analytics = {
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "total_quotes": total_quotes,
        "quotes_by_status": status_counts,
        "accepted_quotes": accepted_quotes,
        "pending_quotes": pending_quotes,
        "rejected_quotes": rejected_quotes,
        "conversion_rate": round(conversion_rate, 2),
        "total_quoted_value": float(total_quoted),
        "accepted_value": float(accepted_value),
        "average_quote_value": round(float(avg_quote_value), 2),
        "average_accepted_value": round(float(avg_accepted_value), 2),
        "average_system_size_kw": round(float(avg_system_size), 2),
        "revenue_change_percent": round(float(revenue_change), 2),
        "quotes_by_month": monthly_data
    }
    
    # Generate PDF
    pdf_bytes = generate_report_pdf(db, analytics)
    
    # Generate filename
    start_str = start_date[:10] if start_date else "all"
    end_str = end_date[:10] if end_date else "all"
    filename = f"analytics_report_{start_str}_to_{end_str}.pdf"
    
    return StreamingResponse(
        pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


