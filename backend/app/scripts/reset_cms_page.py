"""Clear stored CMS overrides for one or more pages (bundled defaults apply on read)."""
from __future__ import annotations

import argparse
import sys

from app.cms_defaults import CMS_PAGES
from app.database import SessionLocal
from app.models_content import CmsPageContent


def reset_pages(pages: list[str]) -> int:
    db = SessionLocal()
    removed = 0
    try:
        for page in pages:
            if page not in CMS_PAGES:
                print(f"Skip unknown page: {page}", file=sys.stderr)
                continue
            row = db.query(CmsPageContent).filter(CmsPageContent.page == page).first()
            if row:
                db.delete(row)
                removed += 1
                print(f"Reset CMS overrides for '{page}'")
            else:
                print(f"No stored overrides for '{page}' (already on defaults)")
        db.commit()
    finally:
        db.close()
    return removed


def main() -> None:
    parser = argparse.ArgumentParser(description="Reset CMS page content to bundled defaults")
    parser.add_argument(
        "pages",
        nargs="*",
        default=["home"],
        help=f"Page slug(s) to reset. Known: {', '.join(CMS_PAGES)}",
    )
    args = parser.parse_args()
    reset_pages(list(args.pages))


if __name__ == "__main__":
    main()
