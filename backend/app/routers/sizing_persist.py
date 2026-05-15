"""Persist sizing results and optionally sync quote BOMs."""
from sqlalchemy.orm import Session

from app.models import SizingResult as SizingResultModel
from app.schemas import SizingResult
from app.services.bom_sync import sync_all_quote_boms_for_project


def save_sizing_result(
    db: Session,
    sizing_result: SizingResult,
    *,
    sync_quote_bom: bool = False,
) -> SizingResultModel:
    try:
        sizing_dict = sizing_result.model_dump(exclude={"id", "created_at"})
    except AttributeError:
        sizing_dict = sizing_result.dict(exclude={"id", "created_at"})

    existing = (
        db.query(SizingResultModel)
        .filter(SizingResultModel.project_id == sizing_result.project_id)
        .first()
    )

    if existing:
        for field, value in sizing_dict.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = SizingResultModel(**sizing_dict)
        db.add(record)
        db.commit()
        db.refresh(record)

    if sync_quote_bom:
        sync_all_quote_boms_for_project(db, sizing_result.project_id)

    return record
