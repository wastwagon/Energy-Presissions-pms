"""
Audit catalog BOM for a quote or project sizing preview.

  python -m app.scripts.audit_quote_bom --quote-id 2
  python -m app.scripts.audit_quote_bom --project-id 5
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.services.bom_audit import audit_project_bom_preview, audit_quote


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit catalog BOM vs sizing/quote")
    parser.add_argument("--quote-id", type=int)
    parser.add_argument("--project-id", type=int)
    parser.add_argument("--quote-option-id", type=int)
    args = parser.parse_args()

    if not args.quote_id and not args.project_id:
        parser.error("Provide --quote-id or --project-id")

    db = SessionLocal()
    try:
        if args.quote_id:
            result = audit_quote(db, args.quote_id, args.quote_option_id)
        else:
            result = audit_project_bom_preview(db, args.project_id)
        print(json.dumps(result, indent=2, default=str))
        if not result.get("ok"):
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
