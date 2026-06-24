#!/usr/bin/env python3
"""
Import bundled public site images into the media library (DB-backed).

Sources:
  - /website_images/*  (logos, service cards, illustrative portfolio PNGs)
  - /portfolio/*       (real install photos used on the portfolio CMS page)

Fresh production databases have no media rows — files are loaded from disk in dev
or fetched via FRONTEND_URL in Docker.

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

REPO_ROOT = Path(__file__).resolve().parents[3]
REPO_WEBSITE_IMAGES = REPO_ROOT / "frontend" / "public" / "website_images"
REPO_PORTFOLIO = REPO_ROOT / "frontend" / "public" / "portfolio"
MANIFEST_PATH = Path(__file__).resolve().parents[2] / "website_content" / "images_manifest.json"

# CMS service/portfolio PNGs under /website_images (not in images_manifest.json)
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

# Real install gallery under /portfolio (videos stay as static /portfolio/*.mp4 URLs)
EXTRA_PORTFOLIO_FILENAMES = [f"ep-install-{i:02d}.jpg" for i in range(1, 16)]


def _scan_public_dir(directory: Path) -> set[str]:
    names: set[str] = set()
    if not directory.is_dir():
        return names
    for path in directory.iterdir():
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            names.add(path.name)
    return names


def _collect_website_image_filenames() -> list[str]:
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
    names.update(_scan_public_dir(REPO_WEBSITE_IMAGES))
    return sorted(names)


def _collect_portfolio_filenames() -> list[str]:
    names: set[str] = set(EXTRA_PORTFOLIO_FILENAMES)
    try:
        from app.portfolio_defaults import get_default_portfolio_items

        for item in get_default_portfolio_items():
            image = str(item.get("image") or "")
            if image.startswith("/portfolio/"):
                filename = Path(image).name
                if Path(filename).suffix.lower() in IMAGE_EXTENSIONS:
                    names.add(filename)
    except Exception as exc:
        print(f"  warning: could not parse portfolio defaults: {exc}")
    names.update(_scan_public_dir(REPO_PORTFOLIO))
    return sorted(names)


def _guess_mime(filename: str) -> str:
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"


def _load_bytes(filename: str, base_url: str, *, public_subdir: str) -> bytes | None:
    local_path = REPO_ROOT / "frontend" / "public" / public_subdir / filename
    if local_path.is_file():
        return local_path.read_bytes()

    url = f"{base_url.rstrip('/')}/{public_subdir}/{filename}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EnergyPrecisions-MediaSeed/1.0"})
        with urllib.request.urlopen(req, timeout=45) as resp:
            if resp.status != 200:
                return None
            return resp.read()
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"  skip {public_subdir}/{filename}: {exc}")
        return None


def _already_imported(db: Session, filename: str, public_subdir: str) -> bool:
    stem = Path(filename).stem
    tag = f"{public_subdir}/{filename}"
    rows = db.query(MediaItem).filter(
        (MediaItem.original_filename == filename)
        | (MediaItem.filename == filename)
        | (MediaItem.title == filename)
        | (MediaItem.title == tag)
    ).all()
    for row in rows:
        if row.content:
            return True
        if stem and stem in (row.original_filename or ""):
            return True
    return False


def _import_public_assets(
    db: Session,
    *,
    base_url: str,
    public_subdir: str,
    filenames: list[str],
) -> int:
    created = 0
    for filename in filenames:
        tag = f"{public_subdir}/{filename}"
        if _already_imported(db, filename, public_subdir):
            print(f"  exists: {tag}")
            continue
        data = _load_bytes(filename, base_url, public_subdir=public_subdir)
        if not data:
            continue
        item = create_db_backed_media_item(
            db,
            contents=data,
            original_name=filename,
            mime_type=_guess_mime(filename),
            title=tag,
        )
        created += 1
        print(f"  imported: {tag} -> {item.url}")
    return created


def seed_website_images_to_media() -> int:
    base_url = os.environ.get("FRONTEND_URL", "https://energyprecisions.com").strip()
    db: Session = SessionLocal()
    created = 0
    try:
        print("==> website_images")
        created += _import_public_assets(
            db,
            base_url=base_url,
            public_subdir="website_images",
            filenames=_collect_website_image_filenames(),
        )
        print("==> portfolio")
        created += _import_public_assets(
            db,
            base_url=base_url,
            public_subdir="portfolio",
            filenames=_collect_portfolio_filenames(),
        )
        return created
    finally:
        db.close()


def main() -> None:
    count = seed_website_images_to_media()
    print(f"\nDone: {count} public image(s) imported into media library.")


if __name__ == "__main__":
    main()
