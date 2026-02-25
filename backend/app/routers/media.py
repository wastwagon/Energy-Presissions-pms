from pathlib import Path
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.auth import get_current_active_user, require_role
from app.models import User, MediaItem
from app.schemas_media import MediaItemResponse

router = APIRouter(prefix="/media", tags=["media"])

MEDIA_DIR = Path("static") / "media"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("/", response_model=List[MediaItemResponse])
async def list_media(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all media items with optional search and pagination."""
    query = db.query(MediaItem)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                MediaItem.filename.ilike(search_term),
                MediaItem.title.ilike(search_term),
                MediaItem.alt_text.ilike(search_term),
            )
        )
    items = query.order_by(MediaItem.created_at.desc()).offset(skip).limit(limit).all()
    return items


@router.post("/", response_model=MediaItemResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Upload a file (admin only). Saves to static/media/ and creates MediaItem record."""
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size must be less than {MAX_FILE_SIZE // (1024 * 1024)}MB",
        )
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    filename = f"{uuid.uuid4().hex[:12]}{ext}"
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    file_path = MEDIA_DIR / filename
    with open(file_path, "wb") as f:
        f.write(contents)
    url = f"/static/media/{filename}"
    mime_type = file.content_type or "application/octet-stream"
    db_item = MediaItem(
        filename=filename,
        url=url,
        title=title,
        alt_text=alt_text,
        mime_type=mime_type,
        file_size=len(contents),
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/{item_id}", response_model=MediaItemResponse)
async def get_media(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific media item by ID."""
    item = db.query(MediaItem).filter(MediaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    """Delete a media item (admin only). Removes file from disk and database record."""
    item = db.query(MediaItem).filter(MediaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    file_path = MEDIA_DIR / item.filename
    if file_path.exists():
        file_path.unlink()
    db.delete(item)
    db.commit()
