"""One-click BOM repair: seed missing catalog SKUs and rebuild quote lines."""
from __future__ import annotations

from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import Project, Quote, QuoteOption
from app.services.bom_audit import audit_quote
from app.services.bom_sync import rebuild_catalog_bom_for_option, sync_all_quote_boms_for_project
from app.services.catalog_seed import ensure_catalog_skus
from app.services.quote_totals import get_primary_quote_option_id, refresh_quote_header_totals


def fix_quote_bom(
    db: Session,
    quote_id: int,
    quote_option_id: Optional[int] = None,
    *,
    sync_all_options: bool = False,
) -> Dict[str, object]:
    """
    1. Audit BOM vs sizing
    2. Seed any missing catalog product SKUs
    3. Rebuild catalog BOM line(s) and refresh totals
    4. Return before/after audit
    """
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        return {"ok": False, "error": "quote_not_found"}

    project = db.query(Project).filter(Project.id == quote.project_id).first()
    if not project:
        return {"ok": False, "error": "project_not_found"}

    opt_id = quote_option_id or get_primary_quote_option_id(db, quote_id)
    if not opt_id:
        return {"ok": False, "error": "no_quote_option"}

    audit_before = audit_quote(db, quote_id, opt_id)
    missing_skus: List[str] = [
        m["sku"] for m in (audit_before.get("missing_products") or [])
    ]

    seed_result = ensure_catalog_skus(db, missing_skus if missing_skus else None)

    lines_added = 0
    options_updated = 0

    if sync_all_options:
        sync_result = sync_all_quote_boms_for_project(db, project.id)
        lines_added = int(sync_result.get("lines_added") or 0)
        options_updated = int(sync_result.get("options_updated") or 0)
    else:
        lines_added = rebuild_catalog_bom_for_option(
            db, quote_id, opt_id, project.id, project.system_type
        )
        refresh_quote_header_totals(db, quote_id)
        db.commit()
        options_updated = 1

    audit_after = audit_quote(db, quote_id, opt_id)

    return {
        "ok": bool(audit_after.get("ok")),
        "message": audit_after.get("message"),
        "quote_id": quote_id,
        "quote_option_id": opt_id,
        "quote_number": quote.quote_number,
        "seed": seed_result,
        "lines_added": lines_added,
        "options_updated": options_updated,
        "audit_before": audit_before,
        "audit_after": audit_after,
    }


def fix_project_catalog(db: Session, project_id: int) -> Dict[str, object]:
    """Seed all proforma catalog SKUs (for BOM preview before a quote exists)."""
    from app.services.bom_audit import audit_project_bom_preview

    audit_before = audit_project_bom_preview(db, project_id)
    missing = [m["sku"] for m in (audit_before.get("missing_products") or [])]
    seed_result = ensure_catalog_skus(db, missing if missing else None)
    audit_after = audit_project_bom_preview(db, project_id)
    return {
        "ok": bool(audit_after.get("ok")),
        "seed": seed_result,
        "audit_before": audit_before,
        "audit_after": audit_after,
    }
