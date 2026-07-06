#!/usr/bin/env python3
"""
Overwrite stored CMS page sections with bundled defaults on deploy.

Runs automatically when AUTO_SEED or AUTO_SYNC_CMS_PAGES is true (see main.py).
Manual run:
  DATABASE_URL=... python -m app.scripts.sync_cms_pages
  python -m app.scripts.sync_cms_pages --pages global packages home
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import Session

from app.cms_defaults import CMS_PAGES, get_page_defaults
from app.database import SessionLocal
from app.models_content import CmsPageContent


def sync_cms_pages(db: Session, pages: list[str] | None = None) -> int:
    """Upsert bundled defaults for each CMS page. Returns number of pages written."""
    targets = pages or list(CMS_PAGES)
    written = 0
    for page in targets:
        if page not in CMS_PAGES:
            print(f"Skip unknown page: {page}", file=sys.stderr)
            continue
        sections = get_page_defaults(page)
        if not sections:
            print(f"Skip empty defaults for '{page}'", file=sys.stderr)
            continue
        payload = json.dumps(sections)
        row = db.query(CmsPageContent).filter(CmsPageContent.page == page).first()
        if row:
            row.sections = payload
            print(f"Updated CMS page '{page}' from bundled defaults")
        else:
            db.add(CmsPageContent(page=page, sections=payload))
            print(f"Seeded CMS page '{page}' from bundled defaults")
        written += 1
    if written:
        db.commit()
    return written


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Sync CMS page content from bundled defaults (overwrites stored overrides)"
    )
    parser.add_argument(
        "--pages",
        nargs="*",
        default=None,
        help=f"Page slug(s) to sync. Default: all ({len(CMS_PAGES)} pages)",
    )
    args = parser.parse_args()
    db = SessionLocal()
    try:
        count = sync_cms_pages(db, args.pages)
        if count:
            print(f"✅ Synced {count} CMS page(s)")
        else:
            print("ℹ️  No CMS pages synced")
    finally:
        db.close()


if __name__ == "__main__":
    main()
