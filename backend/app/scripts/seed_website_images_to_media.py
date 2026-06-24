#!/usr/bin/env python3
"""
Import bundled /website_images assets into the media library (DB-backed).

Fresh production databases have no media rows — this seeds the library from
static files shipped with the frontend (fetched via FRONTEND_URL in Docker).

Usage:
  python -m app.scripts.seed_website_images_to_media
"""
from __future__ import annotations

import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import MediaItem
from app.services.media_persist import create_db_backed_media_item

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}

# CMS service/portfolio assets (not always listed in images_manifest.json)
EXTRA_WEBSITE_IMAGE_FILENAMES = [
    "service-agricultural-productive-use.png",
    "service-battery-storage-solutions.png",
    "service-commercial-solar.png",
    "service-industrial-solar.png",
    "service-maintenance-monitoring.png",
    "service-solar-energy-consultation.png",
    "services-agricultural-productive-use.png",
    "services-battery-storage-solutions.png",
    "services-commercial-solar.png",
    "services-industrial-solar.png",
    "services-maintenance-monitoring.png",
    "services-solar-energy-consultation.png",
    "portfolio-commercial-office-solar.png",
    "portfolio-hospital-backup-power.png",
    "portfolio-residential-estate.png",
    "portfolio-school-solar-project.png",
]

REPO_WEBSITE_IMAGES = (
    Path(__file__).resolve().parents[3] / "frontend" / "public" / "website_images"
)
MANIFEST_PATH = Path(__file__).resolve().parents[2] / "website_content" / "images_manifest.json"


def _collect_filenames() -> list[str]:
    names: set[str] = set(EXTRA_WEBSITE_IMAGE_FILENAMES)
    if MANIFEST_PATH.is_file():
        try:
            entries = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
            for entry in entries:
                filename = entry.get("filename")
                if filename:
                    names.add(filename)
        except (json.JSONDecodeError, OSError) as exc:
            print(f"  warning: could not read manifest: {exc}")
    if REPO_WEBSITE_IMAGES.is_dir():
        for path in REPO_WEBSITE_IMAGES.iterdir():
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
                names.add(path.name)
    return sorted(names)


def _guess_mime(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"


def _load_bytes(filename: str, base_url: str) -> bytes | None:
    local_path = REPO_WEBSITE_IMAGES / filename
    if local_path.is_file():
        return local_path.read_bytes()

    url = f"{base_url.rstrip('/')}/website_images/{filename}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EnergyPrecisions-MediaSeed/1.0"})
        with urllib.request.urlopen(req, timeout=45) as resp:
            if resp.status != 200:
                return None
            return resp.read()
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"  skip {filename}: {exc}")
        return None


def _already_imported(db: Session, filename: str) -> bool:
    stem = Path(filename).stem
    rows = db.query(MediaItem).filter(
        (MediaItem.original_filename == filename)
        | (MediaItem.filename == filename)
        | (MediaItem.title == filename)
    ).all()
    for row in rows:
        if row.content:
            return True
        if stem and stem in (row.original_filename or ""):
            return True
    return False


def seed_website_images_to_media() -> int:
    base_url = os.environ.get("FRONTEND_URL", "https://energyprecisions.com").strip()
    db: Session = SessionLocal()
    created = 0
    try:
        for filename in _collect_filenames():
            if _already_imported(db, filename):
                print(f"  exists: {filename}")
                continue
            data = _load_bytes(filename, base_url)
            if not data:
                continue
            item = create_db_backed_media_item(
                db,
                contents=data,
                original_name=filename,
                mime_type=_guess_mime(filename),
                title=filename,
            )
            created += 1
            print(f"  imported: {filename} -> {item.url}")
        return created
    finally:
        db.close()


def main() -> None:
    count = seed_website_images_to_media()
    print(f"\nDone: {count} website image(s) imported into media library.")


if __name__ == "__main__":
    main()
