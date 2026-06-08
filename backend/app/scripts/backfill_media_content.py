#!/usr/bin/env python3
"""
Backfill media_items.content from other rows or disk files.

Render (and similar) use ephemeral disks — uploads stored only on disk are lost
after redeploy. This script copies bytes into the DB and normalizes URLs to
/api/media/public/{id}.

Usage:
  DATABASE_URL=postgresql://... python -m app.scripts.backfill_media_content
  DATABASE_URL=... python -m app.scripts.backfill_media_content --from-disk
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import MediaItem, Product
from app.storage import get_static_root

# Orphan id -> donor id (same filenames, re-uploaded with DB bytes)
DEFAULT_DONOR_MAP: dict[int, int] = {
    9: 23,   # Battery_2.webp
    11: 25,  # inverter
    12: 20,  # jinko_panel
    13: 22,  # 10Kw_Inverter
    15: 24,  # Battery_1
    16: 21,  # longi_panel
    17: 19,  # J.A_Solar_560W
}

PRODUCT_TYPE_DEFAULT_MEDIA: dict[str, str] = {
    "PANEL": "/api/media/public/19",
    "INVERTER": "/api/media/public/22",
    "BATTERY": "/api/media/public/23",
    "MOUNTING": "/api/media/public/22",
    "BOS": "/api/media/public/22",
    "OTHER": "/api/media/public/22",
}

# Service-line items — no catalog image (quote-only SKUs)
SKIP_IMAGE_PRODUCT_TYPES = frozenset({"INSTALLATION", "TRANSPORT"})

CATEGORY_DEFAULT_MEDIA: dict[str, str] = {
    "SOLAR PANELS": "/api/media/public/19",
    "INVERTERS": "/api/media/public/22",
    "BATTERIES": "/api/media/public/23",
    "ACCESSORIES": "/api/media/public/22",
}


def copy_content(db: Session, target_id: int, donor_id: int) -> bool:
    target = db.query(MediaItem).filter(MediaItem.id == target_id).first()
    donor = db.query(MediaItem).filter(MediaItem.id == donor_id).first()
    if not target or not donor or not donor.content:
        print(f"  skip copy {target_id} <- {donor_id}: missing row or donor bytes")
        return False
    target.content = bytes(donor.content)
    target.mime_type = donor.mime_type or target.mime_type
    target.file_size = len(target.content)
    target.url = f"/api/media/public/{target.id}"
    print(f"  copied bytes {donor_id} -> {target_id} ({target.filename})")
    return True


def backfill_from_disk(db: Session, item: MediaItem) -> bool:
    if item.content:
        return False
    media_dir = get_static_root() / "media"
    path = media_dir / item.filename
    if not path.is_file():
        return False
    data = path.read_bytes()
    item.content = data
    item.file_size = len(data)
    item.url = f"/api/media/public/{item.id}"
    print(f"  loaded from disk: {item.id} {item.filename}")
    return True


def normalize_urls(db: Session) -> int:
    updated = 0
    for item in db.query(MediaItem).all():
        desired = f"/api/media/public/{item.id}"
        if item.url != desired and item.content:
            item.url = desired
            updated += 1
    return updated


def assign_missing_product_images(db: Session) -> int:
    assigned = 0
    rows = (
        db.query(Product)
        .filter((Product.image_url.is_(None)) | (Product.image_url == ""))
        .all()
    )
    for product in rows:
        ptype = (product.product_type.value if hasattr(product.product_type, "value") else product.product_type) or ""
        ptype = str(ptype).upper()
        if ptype in SKIP_IMAGE_PRODUCT_TYPES:
            continue
        sku = (product.sku or "").upper()
        if "LONGI" in sku and "570" in sku:
            product.image_url = "/api/media/public/21"
        elif "JINKO" in sku:
            product.image_url = "/api/media/public/20"
        elif ptype == "PANEL" and ("JA" in sku or "J.A" in sku or "560" in sku or "570" in sku):
            product.image_url = "/api/media/public/19"
        elif ptype in PRODUCT_TYPE_DEFAULT_MEDIA:
            product.image_url = PRODUCT_TYPE_DEFAULT_MEDIA[ptype]
        else:
            cat = (product.category or "").upper()
            if cat in CATEGORY_DEFAULT_MEDIA:
                product.image_url = CATEGORY_DEFAULT_MEDIA[cat]
            else:
                continue
        assigned += 1
        print(f"  product {product.id} {product.sku} -> {product.image_url}")
    return assigned


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill media_items.content for durable Render storage")
    parser.add_argument("--from-disk", action="store_true", help="Also try backend/static/media files")
    parser.add_argument("--assign-products", action="store_true", help="Set default image_url on products missing images")
    parser.add_argument("--donor-map", action="store_true", default=True, help="Copy bytes using DEFAULT_DONOR_MAP")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        copied = 0
        if args.from_disk:
            for item in db.query(MediaItem).filter(MediaItem.content.is_(None)).all():
                if backfill_from_disk(db, item):
                    copied += 1

        if args.donor_map:
            for target_id, donor_id in DEFAULT_DONOR_MAP.items():
                item = db.query(MediaItem).filter(MediaItem.id == target_id).first()
                if item and not item.content:
                    if copy_content(db, target_id, donor_id):
                        copied += 1

        url_fixes = normalize_urls(db)
        product_fixes = assign_missing_product_images(db) if args.assign_products else 0

        db.commit()
        print(
            f"\nDone: {copied} media row(s) backfilled, "
            f"{url_fixes} URL(s) normalized, {product_fixes} product image(s) assigned."
        )
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
