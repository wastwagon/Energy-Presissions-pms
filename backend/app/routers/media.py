from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.auth import get_current_active_user, require_role
from app.models import User, MediaItem
from app.schemas_media import MediaItemResponse
from app.storage import get_static_root
from app.services.media_persist import create_db_backed_media_item

router = APIRouter(prefix="/media", tags=["media"])

MEDIA_DIR = get_static_root() / "media"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("/public/{item_id}")
async def serve_public_media(item_id: int, db: Session = Depends(get_db)):
    """Serve uploaded media without auth (used by shop and public pages)."""
    item = db.query(MediaItem).filter(MediaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if item.content is not None:
        return Response(
            content=bytes(item.content),
            media_type=item.mime_type or "application/octet-stream",
        )
    file_path = MEDIA_DIR / item.filename
    if file_path.is_file():
        return FileResponse(file_path, media_type=item.mime_type or "application/octet-stream")
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")


@router.get("/file/{item_id}")
async def serve_legacy_file_media(item_id: int, db: Session = Depends(get_db)):
    """Backward-compatible alias for older image URLs stored as /api/media/file/{id}."""
    return await serve_public_media(item_id=item_id, db=db)


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
                MediaItem.original_filename.ilike(search_term),
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
    current_user: User = Depends(require_role(["admin", "website_admin"])),
):
    """Upload a file (admin only). Stores bytes in DB so URLs keep working after redeploy."""
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
            detail=f"Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    mime_type = file.content_type or "application/octet-stream"
    return create_db_backed_media_item(
        db,
        contents=contents,
        original_name=file.filename,
        mime_type=mime_type,
        title=title,
        alt_text=alt_text,
    )


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
    current_user: User = Depends(require_role(["admin", "website_admin"])),
):
    """Delete a media item (admin only). Removes legacy disk file if present."""
    item = db.query(MediaItem).filter(MediaItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")
    file_path = MEDIA_DIR / item.filename
    if file_path.exists():
        file_path.unlink()
    db.delete(item)
    db.commit()
