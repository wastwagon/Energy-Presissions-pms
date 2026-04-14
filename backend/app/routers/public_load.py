"""
Public load calculator — same catalog and kWh math as PMS; no auth; rate-limited previews.
"""
import time
from collections import defaultdict
from threading import Lock
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ApplianceCategory
from app.services.appliance_catalog import get_appliances_by_category, search_appliances
from app.services.load_calculator import preview_load_from_lines

router = APIRouter(prefix="/api/public/load", tags=["public-load"])

_PREVIEW_BUCKETS: dict[str, list[float]] = defaultdict(list)
_PREVIEW_LOCK = Lock()
_PREVIEW_MAX = 24
_PREVIEW_WINDOW_SEC = 600

_CATALOG_BUCKETS: dict[str, list[float]] = defaultdict(list)
_CATALOG_LOCK = Lock()
_CATALOG_MAX = 100
_CATALOG_WINDOW_SEC = 600


def _client_ip(request: Request) -> str:
    xf = request.headers.get("x-forwarded-for")
    if xf:
        return xf.split(",")[0].strip()[:80]
    if request.client:
        return request.client.host or "unknown"
    return "unknown"


def _check_preview_rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.time()
    with _PREVIEW_LOCK:
        bucket = _PREVIEW_BUCKETS[ip]
        bucket[:] = [t for t in bucket if now - t < _PREVIEW_WINDOW_SEC]
        if len(bucket) >= _PREVIEW_MAX:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many calculations. Please try again in a few minutes.",
            )
        bucket.append(now)


def _check_catalog_rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.time()
    with _CATALOG_LOCK:
        bucket = _CATALOG_BUCKETS[ip]
        bucket[:] = [t for t in bucket if now - t < _CATALOG_WINDOW_SEC]
        if len(bucket) >= _CATALOG_MAX:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many catalog requests. Please try again in a few minutes.",
            )
        bucket.append(now)


class PublicLoadLine(BaseModel):
    power_value: float = Field(..., gt=0, le=1_000_000)
    power_unit: str = Field(..., min_length=1, max_length=8)
    quantity: int = Field(1, ge=1, le=500)
    hours_per_day: float = Field(..., gt=0, le=24)
    appliance_type: str = Field(..., min_length=1, max_length=80)
    label: Optional[str] = Field(None, max_length=200)

    @field_validator("power_unit", mode="before")
    @classmethod
    def norm_power_unit(cls, v: Any) -> str:
        u = str(v).strip().upper()
        if u in ("W", "KW", "HP"):
            return u
        raise ValueError("power_unit must be W, kW, or HP")

    @field_validator("appliance_type", mode="before")
    @classmethod
    def strip_type(cls, v: Any) -> str:
        if v is None:
            raise ValueError("appliance_type required")
        s = str(v).strip().lower()
        if not s:
            raise ValueError("appliance_type required")
        return s


class PublicLoadPreviewIn(BaseModel):
    lines: List[PublicLoadLine] = Field(..., min_length=1, max_length=40)
    apply_diversity_factor: bool = True


@router.get("/categories")
async def public_load_categories(request: Request) -> List[dict]:
    _check_catalog_rate_limit(request)
    return [
        {"value": cat.value, "label": cat.value.replace("_", " ").title()}
        for cat in ApplianceCategory
    ]


@router.get("/catalog")
async def public_load_catalog(
    request: Request,
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None, max_length=120),
) -> Union[Dict[str, List[dict]], List[dict]]:
    _check_catalog_rate_limit(request)
    if search and search.strip():
        return search_appliances(search.strip())
    if category:
        try:
            cat_enum = ApplianceCategory(category)
            return get_appliances_by_category(cat_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    return get_appliances_by_category()


@router.post("/preview")
async def public_load_preview(
    request: Request,
    body: PublicLoadPreviewIn,
    db: Session = Depends(get_db),
) -> dict:
    _check_preview_rate_limit(request)
    raw_lines: List[dict] = []
    for line in body.lines:
        raw_lines.append(
            {
                "power_value": line.power_value,
                "power_unit": line.power_unit,
                "quantity": line.quantity,
                "hours_per_day": line.hours_per_day,
                "appliance_type": line.appliance_type,
                "label": line.label,
            }
        )
    return preview_load_from_lines(db, raw_lines, apply_diversity_factor=body.apply_diversity_factor)
