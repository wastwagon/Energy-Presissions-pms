#!/usr/bin/env python3
"""
Switch to itemized BOS (catalog lines) and remove legacy lump-sum BOS % quote lines.

  python -m app.scripts.migrate_itemized_bos
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Quote, QuoteItem, Setting
from app.services.quote_recalculator import recalculate_dependent_items
from app.services.quote_totals import refresh_quote_header_totals

_LUMP_BOS = re.compile(
    r"balance\s+of\s+system|\bbos\b.*%|%\s+of\s+equipment",
    re.IGNORECASE,
)


def _is_lump_sum_bos_line(item: QuoteItem) -> bool:
    desc = (item.description or "").strip()
    if not desc:
        return False
    if not _LUMP_BOS.search(desc):
        return False
    # Itemized catalog lines use product SKUs / product names, not this pattern
    if item.product_id and "%" not in desc:
        return False
    return "%" in desc or desc.upper().startswith("BALANCE OF SYSTEM")


def migrate_itemized_bos(db: Session) -> None:
    setting = db.query(Setting).filter(Setting.key == "use_bos_percentage").first()
    if setting:
        setting.value = "false"
    else:
        db.add(
            Setting(
                key="use_bos_percentage",
                value="false",
                description="Itemized catalog BOM instead of lump-sum BOS %",
                category="pricing",
            )
        )
    db.flush()

    removed = 0
    quotes = db.query(Quote).all()
    for quote in quotes:
        items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote.id).all()
        option_ids = {i.quote_option_id for i in items if i.quote_option_id}
        changed = False
        for item in items:
            if _is_lump_sum_bos_line(item):
                db.delete(item)
                removed += 1
                changed = True
        if changed:
            for opt_id in option_ids:
                if opt_id:
                    recalculate_dependent_items(db, quote.id, opt_id)
            refresh_quote_header_totals(db, quote.id)

    db.commit()
    print(f"use_bos_percentage = false")
    print(f"Removed {removed} lump-sum BOS line(s) from {len(quotes)} quote(s)")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        migrate_itemized_bos(db)
    finally:
        db.close()
