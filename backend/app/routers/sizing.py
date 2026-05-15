from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Project, SizingResult as SizingResultModel
from app.schemas import SizingInput, SizingResult, SizingFromAppliancesInput
from app.services.sizing import calculate_sizing
from app.services.load_calculator import calculate_total_daily_kwh, calculate_from_monthly_consumption
from app.services.bom_sync import sync_all_quote_boms_for_project
from app.services.bom_audit import audit_project_bom_preview
from app.services.bom_fix import fix_project_catalog
from app.routers.sizing_persist import save_sizing_result

router = APIRouter(prefix="/sizing", tags=["sizing"])


@router.post("/calculate", response_model=SizingResult, status_code=status.HTTP_201_CREATED)
async def calculate_system_sizing(
    sizing_input: SizingInput,
    sync_quote_bom: bool = Query(
        False,
        description="Rebuild catalog BOM on all quotes for this project after saving sizing",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculate PV system sizing"""
    project = db.query(Project).filter(Project.id == sizing_input.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sizing_input.system_type = project.system_type
    sizing_result = calculate_sizing(db, sizing_input)
    return save_sizing_result(db, sizing_result, sync_quote_bom=sync_quote_bom)


@router.post("/project/{project_id}/fix-catalog")
async def fix_project_catalog_endpoint(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Seed missing proforma catalog SKUs for BOM preview (before quote exists)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return fix_project_catalog(db, project_id)


@router.get("/project/{project_id}/bom-preview")
async def get_project_bom_preview(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Expected catalog BOM from sizing (catalog products + quantities; no quote)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return audit_project_bom_preview(db, project_id)


@router.get("/project/{project_id}", response_model=SizingResult)
async def get_sizing_result(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get sizing result for a project"""
    sizing_result = db.query(SizingResultModel).filter(
        SizingResultModel.project_id == project_id
    ).first()

    if not sizing_result:
        raise HTTPException(status_code=404, detail="Sizing result not found")

    return sizing_result


@router.post(
    "/project/{project_id}/sync-quote-boms",
    status_code=status.HTTP_200_OK,
)
async def sync_project_quote_boms(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Rebuild itemized catalog BOM on every quote option for a project (uses current sizing)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sizing = (
        db.query(SizingResultModel)
        .filter(SizingResultModel.project_id == project_id)
        .first()
    )
    if not sizing:
        raise HTTPException(
            status_code=400,
            detail="No sizing result for this project. Run sizing first.",
        )

    return sync_all_quote_boms_for_project(db, project_id)


@router.post("/from-appliances/{project_id}", response_model=SizingResult, status_code=status.HTTP_201_CREATED)
async def calculate_from_appliances(
    project_id: int,
    sizing_params: SizingFromAppliancesInput,
    sync_quote_bom: bool = Query(
        False,
        description="Rebuild catalog BOM on existing quotes after saving sizing",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculate sizing from project appliances"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    total_daily_kwh = calculate_total_daily_kwh(db, project_id)

    if total_daily_kwh <= 0:
        raise HTTPException(
            status_code=400,
            detail="No appliances found or total daily kWh is zero",
        )

    sizing_input = SizingInput(
        project_id=project_id,
        total_daily_kwh=total_daily_kwh,
        location=sizing_params.location,
        panel_brand=sizing_params.panel_brand,
        backup_hours=sizing_params.backup_hours,
        essential_load_percent=sizing_params.essential_load_percent,
    )
    sizing_input.system_type = project.system_type

    sizing_result = calculate_sizing(db, sizing_input)
    return save_sizing_result(db, sizing_result, sync_quote_bom=sync_quote_bom)


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
    sync_quote_bom: bool = Query(
        False,
        description="Rebuild catalog BOM on existing quotes after saving sizing",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculate sizing from monthly consumption"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        total_daily_kwh = calculate_from_monthly_consumption(
            monthly_kwh=monthly_kwh,
            monthly_bill=monthly_bill,
            tariff=tariff,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    sizing_input = SizingInput(
        project_id=project_id,
        total_daily_kwh=total_daily_kwh,
        location=location,
        panel_brand=panel_brand,
        backup_hours=backup_hours,
        essential_load_percent=essential_load_percent,
    )
    sizing_input.system_type = project.system_type

    sizing_result = calculate_sizing(db, sizing_input)
    return save_sizing_result(db, sizing_result, sync_quote_bom=sync_quote_bom)
