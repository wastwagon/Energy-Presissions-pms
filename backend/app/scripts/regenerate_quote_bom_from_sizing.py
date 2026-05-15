#!/usr/bin/env python3
"""
Re-build itemized BOM lines on an existing quote from its project sizing.

  python -m app.scripts.regenerate_quote_bom_from_sizing --quote-id 2
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session, joinedload

from app.database import SessionLocal
from app.models import Product, Project, Quote, QuoteItem, QuoteOption, SizingResult
from app.services.bom_from_catalog import append_standard_bom_from_catalog, _BOM_SKU_ORDER
from app.services.pricing import generate_quote_items_from_sizing
from app.services.quote_totals import refresh_quote_header_totals

_BOM_SKUS = set(_BOM_SKU_ORDER)


def _is_catalog_bom_line(item: QuoteItem) -> bool:
    if item.product_id:
        p = item.product  # may not be loaded
        return bool(p and p.sku in _BOM_SKUS)
    return False


def regenerate(db: Session, quote_id: int) -> None:
    quote = (
        db.query(Quote)
        .options(joinedload(Quote.options).joinedload(QuoteOption.items))
        .filter(Quote.id == quote_id)
        .first()
    )
    if not quote:
        raise SystemExit(f"Quote {quote_id} not found")

    project = db.query(Project).filter(Project.id == quote.project_id).first()
    sizing = db.query(SizingResult).filter(SizingResult.project_id == quote.project_id).first()
    if not sizing:
        raise SystemExit("No sizing on project — run Calculate Sizing first")

    for opt in list(quote.options or []):
        for item in list(opt.items or []):
            if item.product_id:
                prod = db.query(Product).filter(Product.id == item.product_id).first()
                if prod and prod.sku in _BOM_SKUS:
                    db.delete(item)
                    continue
            desc = (item.description or "").upper()
            if any(
                k in desc
                for k in (
                    "TRANSPORT",
                    "INSTALLATION",
                    "MOUNTING",
                    "CLAMP",
                    "CABLE",
                    "BREAKER",
                    "CHANGEOVER",
                    "SPD",
                    "MCCB",
                    "MISCELLANEOUS",
                    "BREAKER BOX",
                )
            ) and "PANEL" not in desc and "INVERTER" not in desc and "BATTERY" not in desc:
                db.delete(item)
        db.flush()

        # Remove core lines to regenerate cleanly
        for item in list(opt.items or []):
            if item.product_id:
                prod = db.query(Product).filter(Product.id == item.product_id).first()
                if prod and prod.product_type.value in ("panel", "inverter", "battery", "mounting"):
                    db.delete(item)
        db.flush()

        items = generate_quote_items_from_sizing(db, sizing, quote.id, opt.id)
        for item in items:
            db.add(item)
        db.flush()

        next_so = max((i.sort_order for i in opt.items), default=-1) + 1
        append_standard_bom_from_catalog(
            db, quote.id, opt.id, project.system_type, sizing, start_sort_order=next_so
        )

    refresh_quote_header_totals(db, quote.id)
    db.commit()
    db.refresh(quote)
    print(f"Regenerated quote {quote.quote_number}: GHS {quote.grand_total:,.2f}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--quote-id", type=int, required=True)
    args = p.parse_args()
    db = SessionLocal()
    try:
        regenerate(db, args.quote_id)
    finally:
        db.close()
