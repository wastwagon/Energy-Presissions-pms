from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Project, SizingResult as SizingResultModel
from app.schemas import SizingInput, SizingResult, SizingFromAppliancesInput
from app.services.sizing import calculate_sizing
from app.services.load_calculator import calculate_total_daily_kwh, calculate_from_monthly_consumption

router = APIRouter(prefix="/sizing", tags=["sizing"])


@router.post("/calculate", response_model=SizingResult, status_code=status.HTTP_201_CREATED)
async def calculate_system_sizing(
    sizing_input: SizingInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Calculate PV system sizing"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == sizing_input.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate sizing
    sizing_result = calculate_sizing(db, sizing_input)
    
    # Save to database
    # Convert Pydantic model to dict, excluding id and created_at (will be set by DB)
    # Pydantic v2 uses model_dump(), v1 uses dict()
    try:
        sizing_dict = sizing_result.model_dump(exclude={'id', 'created_at'})
    except AttributeError:
        # Fallback for Pydantic v1
        sizing_dict = sizing_result.dict(exclude={'id', 'created_at'})
    db_sizing = SizingResultModel(**sizing_dict)
    
    # Check if sizing result already exists for this project
    existing = db.query(SizingResultModel).filter(
        SizingResultModel.project_id == sizing_input.project_id
    ).first()
    
    if existing:
        # Update existing
        for field, value in sizing_dict.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new
        db.add(db_sizing)
        db.commit()
        db.refresh(db_sizing)
        return db_sizing


@router.get("/project/{project_id}", response_model=SizingResult)
async def get_sizing_result(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get sizing result for a project"""
    sizing_result = db.query(SizingResultModel).filter(
        SizingResultModel.project_id == project_id
    ).first()
    
    if not sizing_result:
        raise HTTPException(status_code=404, detail="Sizing result not found")
    
    return sizing_result


@router.post("/from-appliances/{project_id}", response_model=SizingResult, status_code=status.HTTP_201_CREATED)
async def calculate_from_appliances(
    project_id: int,
    sizing_params: SizingFromAppliancesInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Calculate sizing from project appliances
    
    Accepts parameters in request body (JSON).
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate total daily kWh from appliances
    total_daily_kwh = calculate_total_daily_kwh(db, project_id)
    
    if total_daily_kwh <= 0:
        raise HTTPException(
            status_code=400,
            detail="No appliances found or total daily kWh is zero"
        )
    
    # Create sizing input
    sizing_input = SizingInput(
        project_id=project_id,
        total_daily_kwh=total_daily_kwh,
        location=sizing_params.location,
        panel_brand=sizing_params.panel_brand,
        backup_hours=sizing_params.backup_hours,
        essential_load_percent=sizing_params.essential_load_percent
    )
    
    # Add system_type to sizing_input for battery calculation
    sizing_input.system_type = project.system_type
    
    # Calculate sizing
    sizing_result = calculate_sizing(db, sizing_input)
    
    # Save to database
    # Convert Pydantic model to dict, excluding id and created_at (will be set by DB)
    # Pydantic v2 uses model_dump(), v1 uses dict()
    try:
        sizing_dict = sizing_result.model_dump(exclude={'id', 'created_at'})
    except AttributeError:
        # Fallback for Pydantic v1
        sizing_dict = sizing_result.dict(exclude={'id', 'created_at'})
    db_sizing = SizingResultModel(**sizing_dict)
    
    # Check if sizing result already exists
    existing = db.query(SizingResultModel).filter(
        SizingResultModel.project_id == project_id
    ).first()
    
    if existing:
        for field, value in sizing_dict.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db.add(db_sizing)
        db.commit()
        db.refresh(db_sizing)
        return db_sizing


@router.post("/from-monthly", response_model=SizingResult, status_code=status.HTTP_201_CREATED)
async def calculate_from_monthly(
    project_id: int,
    monthly_kwh: float = None,
    monthly_bill: float = None,
    tariff: float = None,
    location: str = None,
    panel_brand: str = "Jinko",
    backup_hours: float = None,
    essential_load_percent: float = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Calculate sizing from monthly consumption"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate daily kWh from monthly data
    try:
        total_daily_kwh = calculate_from_monthly_consumption(
            monthly_kwh=monthly_kwh,
            monthly_bill=monthly_bill,
            tariff=tariff
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Create sizing input
    sizing_input = SizingInput(
        project_id=project_id,
        total_daily_kwh=total_daily_kwh,
        location=location,
        panel_brand=panel_brand,
        backup_hours=backup_hours,
        essential_load_percent=essential_load_percent
    )
    
    # Calculate sizing
    sizing_result = calculate_sizing(db, sizing_input)
    
    # Save to database
    # Convert Pydantic model to dict, excluding id and created_at (will be set by DB)
    # Pydantic v2 uses model_dump(), v1 uses dict()
    try:
        sizing_dict = sizing_result.model_dump(exclude={'id', 'created_at'})
    except AttributeError:
        # Fallback for Pydantic v1
        sizing_dict = sizing_result.dict(exclude={'id', 'created_at'})
    db_sizing = SizingResultModel(**sizing_dict)
    
    # Check if sizing result already exists
    existing = db.query(SizingResultModel).filter(
        SizingResultModel.project_id == project_id
    ).first()
    
    if existing:
        for field, value in sizing_dict.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db.add(db_sizing)
        db.commit()
        db.refresh(db_sizing)
        return db_sizing

