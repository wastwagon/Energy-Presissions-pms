"""
Export BOM checklist PDF to a local path (e.g. user Downloads folder).

Usage:
  python -m app.scripts.export_bom_checklist_pdf --quote-id 2
  python -m app.scripts.export_bom_checklist_pdf --quote-id 2 --output ~/Downloads/bom_checklist.pdf
  python -m app.scripts.export_bom_checklist_pdf --latest
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models import Quote
from app.services.bom_checklist_pdf import generate_bom_checklist_pdf
from app.services.bom_fix import fix_quote_bom


def main() -> None:
    parser = argparse.ArgumentParser(description="Export BOM checklist PDF")
    parser.add_argument("--quote-id", type=int)
    parser.add_argument("--latest", action="store_true", help="Use most recent quote")
    parser.add_argument(
        "--output",
        type=str,
        default="",
        help="Output file path (default: ~/Downloads/bom_checklist_<quote_number>.pdf)",
    )
    parser.add_argument("--fix-bom", action="store_true", help="Run fix-bom before PDF")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        quote_id = args.quote_id
        if args.latest or not quote_id:
            quote = db.query(Quote).order_by(Quote.id.desc()).first()
            if not quote:
                print("No quotes in database. Create a project and quote first.")
                sys.exit(1)
            quote_id = quote.id
        else:
            quote = db.query(Quote).filter(Quote.id == quote_id).first()
            if not quote:
                print(f"Quote {quote_id} not found")
                sys.exit(1)

        if args.fix_bom:
            print(f"Fixing BOM for quote {quote.quote_number} (id={quote_id})...")
            result = fix_quote_bom(db, quote_id)
            print(result.get("message", result))

        print(f"Generating BOM checklist PDF for quote {quote.quote_number}...")
        pdf = generate_bom_checklist_pdf(db, quote_id)
        data = pdf.read()

        if args.output:
            out = Path(args.output).expanduser().resolve()
        else:
            downloads = Path.home() / "Downloads"
            downloads.mkdir(parents=True, exist_ok=True)
            safe_num = (quote.quote_number or str(quote_id)).replace("/", "-")
            out = downloads / f"bom_checklist_{safe_num}.pdf"

        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        print(f"Saved: {out} ({len(data)} bytes)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
