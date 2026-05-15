"""Export quotation or proforma PDF to a file path."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models import Quote
from app.services.pdf_generator import generate_quotation_pdf


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quote-id", type=int)
    parser.add_argument("--latest", action="store_true")
    parser.add_argument("--proforma", action="store_true")
    parser.add_argument("--output", type=str, default="")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.latest or not args.quote_id:
            quote = db.query(Quote).order_by(Quote.id.desc()).first()
            if not quote:
                sys.exit("No quotes found")
            quote_id = quote.id
        else:
            quote_id = args.quote_id
            quote = db.query(Quote).filter(Quote.id == quote_id).first()
            if not quote:
                sys.exit(f"Quote {quote_id} not found")

        doc = "proforma_invoice" if args.proforma else "quotation"
        pdf = generate_quotation_pdf(db, quote_id, document_type=doc)
        data = pdf.read()

        if args.output:
            out = Path(args.output).expanduser()
        else:
            downloads = Path.home() / "Downloads"
            tag = "proforma" if args.proforma else "quotation"
            safe = (quote.quote_number or str(quote_id)).replace("/", "-")
            out = downloads / f"{tag}_{safe}.pdf"

        out = out.resolve()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        print(f"Saved: {out} ({len(data)} bytes)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
