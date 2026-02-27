from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Project, Customer, ProjectStatusUpdate, ProjectStatus
from app.schemas import Project as ProjectSchema, ProjectCreate, ProjectUpdate, ProjectStatusUpdateCreate
from app.services.sizing_pdf_generator import generate_sizing_report_pdf
from app.services.stock import (
    check_stock_availability,
    deduct_stock_on_project_accept,
    restore_stock_on_project_reject,
)
from app.project_status_messages import PROJECT_STATUS_MESSAGES
import uuid

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[ProjectSchema])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    customer_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all projects"""
    query = db.query(Project).options(
        joinedload(Project.customer),
        joinedload(Project.created_by_user)
    )
    if customer_id:
        query = query.filter(Project.customer_id == customer_id)
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/status-messages", response_model=Dict[str, List[str]])
async def get_status_messages(
    current_user: User = Depends(get_current_active_user)
):
    """Get predefined status update messages for each project status"""
    return {s.value: [m for m in msgs] for s, msgs in PROJECT_STATUS_MESSAGES.items()}


@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific project"""
    project = db.query(Project).options(
        joinedload(Project.customer),
        joinedload(Project.created_by_user),
        joinedload(Project.status_updates)
    ).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new project"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == project_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate reference code if not provided
    reference_code = project_data.reference_code
    if not reference_code:
        reference_code = f"PRJ-{uuid.uuid4().hex[:8].upper()}"
    
    # Create project data dict, excluding reference_code to avoid duplicate
    project_dict = project_data.dict(exclude={'reference_code'})
    db_project = Project(
        **project_dict,
        reference_code=reference_code,
        created_by=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    # Reload with relationships for response
    project = db.query(Project).options(
        joinedload(Project.customer),
        joinedload(Project.created_by_user)
    ).filter(Project.id == db_project.id).first()
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a project"""
    project = db.query(Project).options(
        joinedload(Project.customer),
        joinedload(Project.created_by_user),
        joinedload(Project.status_updates)
    ).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.patch("/{project_id}/status", response_model=ProjectSchema)
async def update_project_status(
    project_id: int,
    data: ProjectStatusUpdateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update project status with a message (tracks milestone achievement).
    Stock is deducted when status → ACCEPTED, restored when ACCEPTED → REJECTED."""
    project = db.query(Project).options(
        joinedload(Project.customer),
        joinedload(Project.created_by_user),
        joinedload(Project.status_updates)
    ).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    old_status = project.status
    new_status = data.status

    # Transition TO ACCEPTED: check stock and deduct
    if new_status == ProjectStatus.ACCEPTED and old_status != ProjectStatus.ACCEPTED:
        ok, errors = check_stock_availability(db, project_id)
        if not ok:
            msg = "Cannot accept project: insufficient stock. " + "; ".join(errors)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        success, deduct_errors = deduct_stock_on_project_accept(db, project_id, current_user.id)
        if not success:
            msg = "Stock deduction failed. " + "; ".join(deduct_errors)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    # Transition FROM ACCEPTED to REJECTED: restore stock
    if new_status == ProjectStatus.REJECTED and old_status == ProjectStatus.ACCEPTED:
        restore_stock_on_project_reject(db, project_id, current_user.id)

    project.status = new_status
    status_update = ProjectStatusUpdate(
        project_id=project_id,
        status=new_status,
        message=data.message,
        updated_by=current_user.id
    )
    db.add(status_update)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return None


@router.get("/{project_id}/sizing/pdf")
async def get_sizing_report_pdf(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate and download system sizing report as PDF"""
    try:
        # Verify project exists and user has access
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Generate PDF
        pdf_bytes = generate_sizing_report_pdf(db, project_id)
        
        # Generate filename
        project_name_safe = project.name.replace(' ', '_').replace('/', '_')
        filename = f"system_sizing_{project_name_safe}_{project_id}.pdf"
        
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error generating sizing PDF for project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

