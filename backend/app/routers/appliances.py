from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User, Appliance, Project, ApplianceCategory
from app.schemas import Appliance as ApplianceSchema, ApplianceCreate, ApplianceUpdate
from app.services.load_calculator import calculate_appliance_daily_kwh
from app.services.appliance_catalog import get_appliances_by_category, search_appliances
from app.services.appliance_pdf_generator import generate_appliance_report_pdf

router = APIRouter(prefix="/appliances", tags=["appliances"])


@router.get("/", response_model=List[ApplianceSchema])
async def list_appliances(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all appliances for a project"""
    appliances = db.query(Appliance).filter(Appliance.project_id == project_id).all()
    return appliances


@router.get("/project/{project_id}/total-daily-kwh")
async def get_total_daily_kwh(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get total daily kWh for a project with diversity factor applied"""
    from app.services.load_calculator import calculate_total_daily_kwh
    
    # Calculate total with diversity factor applied (default behavior)
    total_kwh = calculate_total_daily_kwh(db, project_id, apply_diversity_factor=True)
    
    # Also get total without diversity factor for comparison
    total_kwh_without_diversity = calculate_total_daily_kwh(db, project_id, apply_diversity_factor=False)
    
    return {
        "total_daily_kwh": total_kwh,
        "total_daily_kwh_without_diversity": total_kwh_without_diversity,
        "diversity_factor_applied": True
    }


@router.get("/{appliance_id}", response_model=ApplianceSchema)
async def get_appliance(
    appliance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific appliance"""
    appliance = db.query(Appliance).filter(Appliance.id == appliance_id).first()
    if not appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return appliance


@router.post("/", response_model=ApplianceSchema, status_code=status.HTTP_201_CREATED)
async def create_appliance(
    appliance_data: ApplianceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new appliance"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Log what we received
    logger.info(f"Received appliance data: category={appliance_data.category}, type={appliance_data.appliance_type}, power_unit={appliance_data.power_unit}")
    logger.info(f"Category value: {appliance_data.category.value}, Type value: {appliance_data.appliance_type.value}")
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == appliance_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get enum values as strings for calculation
    category_value_str = appliance_data.category.value
    appliance_type_value_str = appliance_data.appliance_type.value
    power_unit_value_str = appliance_data.power_unit.value
    
    # Calculate daily kWh
    daily_kwh = calculate_appliance_daily_kwh(
        appliance_data.power_value,
        power_unit_value_str,
        appliance_data.quantity,
        appliance_data.hours_per_day,
        appliance_type_value_str,
        db
    )
    
    # Import enum classes
    from app.models import ApplianceCategory, ApplianceType, PowerUnit
    
    # Ensure values are lowercase strings
    category_value_str = category_value_str.lower()
    appliance_type_value_str = appliance_type_value_str.lower()
    
    # Find enum by value (not by name) - Python enums match by name first, so we need to search by value
    category_enum = None
    for e in ApplianceCategory:
        if e.value == category_value_str:
            category_enum = e
            break
    if not category_enum:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category_value_str}")
    
    appliance_type_enum = None
    for e in ApplianceType:
        if e.value == appliance_type_value_str:
            appliance_type_enum = e
            break
    if not appliance_type_enum:
        raise HTTPException(status_code=400, detail=f"Invalid appliance_type: {appliance_type_value_str}")
    
    power_unit_enum = None
    for e in PowerUnit:
        if e.value == power_unit_value_str:
            power_unit_enum = e
            break
    if not power_unit_enum:
        power_unit_enum = PowerUnit.W  # Default fallback
    
    logger.info(f"Using enum values: category={category_enum.value}, type={appliance_type_enum.value}, power_unit={power_unit_enum.value}")
    
    # Now that we're using String columns, we can pass the enum values directly as strings
    db_appliance = Appliance(
        project_id=appliance_data.project_id,
        category=category_value_str,  # Pass lowercase string value
        appliance_type=appliance_type_value_str,  # Pass lowercase string value
        description=appliance_data.description,
        power_value=appliance_data.power_value,
        power_unit=power_unit_enum,  # Keep as enum for now (PowerUnit column is still enum)
        quantity=appliance_data.quantity,
        hours_per_day=appliance_data.hours_per_day,
        is_essential=appliance_data.is_essential,
        daily_kwh=daily_kwh
    )
    db.add(db_appliance)
    db.commit()
    db.refresh(db_appliance)
    return db_appliance


@router.put("/{appliance_id}", response_model=ApplianceSchema)
async def update_appliance(
    appliance_id: int,
    appliance_data: ApplianceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an appliance"""
    appliance = db.query(Appliance).filter(Appliance.id == appliance_id).first()
    if not appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")
    
    update_data = appliance_data.dict(exclude_unset=True)
    
    # Convert enum values to their string values if they're being updated
    if 'category' in update_data:
        if hasattr(update_data['category'], 'value'):
            update_data['category'] = update_data['category'].value.lower()
        elif isinstance(update_data['category'], str):
            update_data['category'] = update_data['category'].lower()
    
    if 'appliance_type' in update_data:
        if hasattr(update_data['appliance_type'], 'value'):
            update_data['appliance_type'] = update_data['appliance_type'].value.lower()
        elif isinstance(update_data['appliance_type'], str):
            update_data['appliance_type'] = update_data['appliance_type'].lower()
    
    if 'power_unit' in update_data:
        if hasattr(update_data['power_unit'], 'value'):
            update_data['power_unit'] = update_data['power_unit'].value
        # If it's already a string, keep it as is (PowerUnit values are case-sensitive like "W", "kW")
    
    # Recalculate daily_kwh if power-related fields changed
    if any(field in update_data for field in ["power_value", "power_unit", "quantity", "hours_per_day", "appliance_type"]):
        power_value = update_data.get("power_value", appliance.power_value)
        
        # Get power_unit as string
        power_unit = update_data.get("power_unit", None)
        if power_unit is None:
            # Get from existing appliance - it might be a string or enum
            power_unit = appliance.power_unit.value if hasattr(appliance.power_unit, 'value') else str(appliance.power_unit)
        elif hasattr(power_unit, 'value'):
            power_unit = power_unit.value
        else:
            power_unit = str(power_unit)
        
        quantity = update_data.get("quantity", appliance.quantity)
        hours_per_day = update_data.get("hours_per_day", appliance.hours_per_day)
        
        # Get appliance_type as string
        appliance_type = update_data.get("appliance_type", None)
        if appliance_type is None:
            # Get from existing appliance - it might be a string or enum
            appliance_type = appliance.appliance_type.value if hasattr(appliance.appliance_type, 'value') else str(appliance.appliance_type)
        elif hasattr(appliance_type, 'value'):
            appliance_type = appliance_type.value
        else:
            appliance_type = str(appliance_type).lower()
        
        daily_kwh = calculate_appliance_daily_kwh(
            power_value, power_unit, quantity, hours_per_day, appliance_type, db
        )
        update_data["daily_kwh"] = daily_kwh
    
    for field, value in update_data.items():
        setattr(appliance, field, value)
    
    db.commit()
    db.refresh(appliance)
    return appliance


@router.delete("/{appliance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appliance(
    appliance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an appliance"""
    appliance = db.query(Appliance).filter(Appliance.id == appliance_id).first()
    if not appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")
    
    db.delete(appliance)
    db.commit()
    return None


@router.get("/catalog/categories")
async def get_appliance_categories(
    current_user: User = Depends(get_current_active_user)
):
    """Get all appliance categories"""
    return [{"value": cat.value, "label": cat.value.replace("_", " ").title()} 
            for cat in ApplianceCategory]


@router.get("/catalog/list")
async def get_appliance_catalog(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search appliances"),
    current_user: User = Depends(get_current_active_user)
):
    """Get appliance catalog - predefined appliances with typical ratings"""
    if search:
        return search_appliances(search)
    
    if category:
        try:
            cat_enum = ApplianceCategory(category)
            return get_appliances_by_category(cat_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    return get_appliances_by_category()


@router.get("/project/{project_id}/pdf")
async def get_appliance_report_pdf(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate and download appliance load analysis report as PDF"""
    try:
        # Verify project exists and user has access
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Generate PDF
        pdf_bytes = generate_appliance_report_pdf(db, project_id)
        
        # Generate filename
        project_name_safe = project.name.replace(' ', '_').replace('/', '_')
        filename = f"load_analysis_{project_name_safe}_{project_id}.pdf"
        
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
        logger.error(f"Error generating PDF for project {project_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

