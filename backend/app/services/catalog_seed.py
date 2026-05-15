"""Insert missing proforma / BOM catalog products by SKU."""
from __future__ import annotations

from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import Product


def upsert_catalog_row(db: Session, row: dict) -> str:
    sku = row["sku"]
    existing = db.query(Product).filter(Product.sku == sku).first()
    if existing:
        return "skip"
    db.add(Product(**row))
    return "insert"


def ensure_catalog_skus(
    db: Session,
    skus: Optional[List[str]] = None,
) -> Dict[str, object]:
    """
    Insert catalog products for the given SKUs (or entire proforma catalog if skus is None).
    Commits the session.
    """
    from app.scripts.seed_proforma_catalog_items import build_catalog_rows

    rows_by_sku = {r["sku"]: r for r in build_catalog_rows()}
    targets = list(skus) if skus else list(rows_by_sku.keys())

    inserted: List[str] = []
    skipped: List[str] = []
    not_found: List[str] = []

    for sku in targets:
        row = rows_by_sku.get(sku)
        if not row:
            not_found.append(sku)
            continue
        if upsert_catalog_row(db, row) == "insert":
            inserted.append(sku)
        else:
            skipped.append(sku)

    db.commit()
    return {
        "inserted": inserted,
        "skipped": skipped,
        "not_found": not_found,
    }
