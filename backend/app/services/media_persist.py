"""Create media rows stored in the database so files survive ephemeral server disks."""

import re
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.models import MediaItem


IMAGE_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"})
VIDEO_EXTENSIONS = frozenset({".mp4", ".webm", ".ogg", ".mov", ".m4v"})
DOCUMENT_EXTENSIONS = frozenset({".pdf"})
ALLOWED_MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS | DOCUMENT_EXTENSIONS
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024


def media_extension(original_name: Optional[str]) -> str:
    """Return a normalized extension only when the media type is supported."""
    ext = Path(original_name or "").suffix.lower()
    return ext if ext in ALLOWED_MEDIA_EXTENSIONS else ""


def max_upload_size_for_extension(ext: str) -> int:
    """Return the upload ceiling for an already-normalized media extension."""
    return MAX_VIDEO_FILE_SIZE if ext.lower() in VIDEO_EXTENSIONS else MAX_FILE_SIZE


def _sanitize_base_name(name: str) -> str:
    base = Path(name or "upload").name
    base = re.sub(r"[^a-zA-Z0-9._-]", "_", base).strip("._") or "upload"
    return base[:180]


def unique_safe_filename(db: Session, desired_base: str, ext: str) -> str:
    """Collision-safe filename for the `filename` column (display + legacy path)."""
    stem = Path(desired_base).stem or "file"
    suffix = ext.lower() if ext else ""
    if suffix and not suffix.startswith("."):
        suffix = "." + suffix
    candidate = f"{stem}{suffix}"
    n = 0
    while db.query(MediaItem.id).filter(MediaItem.filename == candidate).first():
        n += 1
        candidate = f"{stem}_{n}{suffix}"
    return candidate


def create_db_backed_media_item(
    db: Session,
    *,
    contents: bytes,
    original_name: Optional[str],
    mime_type: Optional[str],
    title: Optional[str] = None,
    alt_text: Optional[str] = None,
) -> MediaItem:
    ext = media_extension(original_name) or ".bin"
    safe_original = _sanitize_base_name(original_name or f"upload{ext}")
    if not safe_original.lower().endswith(ext.lower()):
        safe_original = f"{Path(safe_original).stem}{ext}"
    filename = unique_safe_filename(db, safe_original, ext)
    display_name = _sanitize_base_name(original_name or filename)
    if not display_name.lower().endswith(ext.lower()) and ext != ".bin":
        display_name = f"{Path(display_name).stem}{ext}"

    item = MediaItem(
        filename=filename,
        url="",  # set after flush
        title=title or display_name,
        alt_text=alt_text,
        mime_type=mime_type or "application/octet-stream",
        file_size=len(contents),
        content=contents,
        original_filename=display_name,
    )
    db.add(item)
    db.flush()
    item.url = f"/api/media/public/{item.id}"
    db.commit()
    db.refresh(item)
    return item
