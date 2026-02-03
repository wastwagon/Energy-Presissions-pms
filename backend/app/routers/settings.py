from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from app.database import get_db
from app.auth import get_current_active_user, require_role
from app.models import User, Setting, PeakSunHours
from app.schemas import Setting as SettingSchema, SettingCreate, PeakSunHours as PeakSunHoursSchema, PeakSunHoursCreate, PeakSunHoursUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=List[SettingSchema])
async def list_settings(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all settings"""
    query = db.query(Setting)
    if category:
        query = query.filter(Setting.category == category)
    settings = query.all()
    return settings


@router.get("/{key}", response_model=SettingSchema)
async def get_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific setting"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.post("/", response_model=SettingSchema, status_code=status.HTTP_201_CREATED)
async def create_setting(
    setting_data: SettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create a new setting (admin only)"""
    # Check if setting already exists
    existing = db.query(Setting).filter(Setting.key == setting_data.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
    
    db_setting = Setting(**setting_data.dict(), updated_by=current_user.id)
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting


@router.put("/{key}", response_model=SettingSchema)
async def update_setting(
    key: str,
    value: str,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update a setting (admin only)"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    setting.value = value
    if description is not None:
        setting.description = description
    setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    return setting


# Peak Sun Hours endpoints
@router.get("/peak-sun-hours/", response_model=List[PeakSunHoursSchema])
async def list_peak_sun_hours(
    city: str = None,
    country: str = None,
    state: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List peak sun hours data"""
    query = db.query(PeakSunHours)
    if city:
        query = query.filter(PeakSunHours.city.ilike(f"%{city}%"))
    if country:
        query = query.filter(PeakSunHours.country.ilike(f"%{country}%"))
    if state:
        query = query.filter(PeakSunHours.state.ilike(f"%{state}%"))
    return query.all()


@router.post("/peak-sun-hours/", response_model=PeakSunHoursSchema, status_code=status.HTTP_201_CREATED)
async def create_peak_sun_hours(
    data: PeakSunHoursCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create peak sun hours data (admin only)"""
    db_psd = PeakSunHours(**data.dict())
    db.add(db_psd)
    db.commit()
    db.refresh(db_psd)
    return db_psd


@router.put("/peak-sun-hours/{psh_id}", response_model=PeakSunHoursSchema)
async def update_peak_sun_hours(
    psh_id: int,
    data: PeakSunHoursUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update peak sun hours data (admin only)"""
    psh = db.query(PeakSunHours).filter(PeakSunHours.id == psh_id).first()
    if not psh:
        raise HTTPException(status_code=404, detail="Peak sun hours entry not found")
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(psh, field, value)
    
    db.commit()
    db.refresh(psh)
    return psh


@router.put("/peak-sun-hours/by-location", response_model=PeakSunHoursSchema)
async def update_peak_sun_hours_by_location(
    city: str,
    state: str,
    country: str,
    data: PeakSunHoursUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update peak sun hours by location (admin only)"""
    psh = db.query(PeakSunHours).filter(
        PeakSunHours.city == city,
        PeakSunHours.state == state,
        PeakSunHours.country == country
    ).first()
    
    if not psh:
        raise HTTPException(status_code=404, detail=f"Peak sun hours entry not found for {city}, {state}, {country}")
    
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(psh, field, value)
    
    db.commit()
    db.refresh(psh)
    return psh


@router.post("/upload-logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["admin"]))
):
    """Upload company logo (admin only)"""
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file size (max 2MB)
    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 2MB")
    
    # Determine file extension
    file_ext = Path(file.filename).suffix.lower() if file.filename else '.jpg'
    if file_ext not in ['.jpg', '.jpeg', '.png', '.gif', '.svg']:
        file_ext = '.jpg'
    
    # Save to static directory
    static_dir = Path("static")
    static_dir.mkdir(exist_ok=True)
    
    logo_path = static_dir / f"logo{file_ext}"
    
    # Write file
    with open(logo_path, "wb") as buffer:
        buffer.write(contents)
    
    # Also save as logo.jpg for consistent access
    if file_ext != '.jpg':
        logo_jpg_path = static_dir / "logo.jpg"
        with open(logo_jpg_path, "wb") as buffer:
            buffer.write(contents)
    
    return {"message": "Logo uploaded successfully", "path": f"/static/logo{file_ext}"}


@router.get("/logo")
async def get_logo():
    """Get company logo"""
    static_dir = Path("static")
    logo_paths = [
        static_dir / "logo.jpg",
        static_dir / "logo.png",
        static_dir / "logo.jpeg",
    ]
    
    for logo_path in logo_paths:
        if logo_path.exists():
            from fastapi.responses import FileResponse
            return FileResponse(logo_path)
    
    raise HTTPException(status_code=404, detail="Logo not found")

