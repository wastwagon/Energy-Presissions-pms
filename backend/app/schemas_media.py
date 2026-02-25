from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MediaItemCreate(BaseModel):
    title: Optional[str] = None
    alt_text: Optional[str] = None


class MediaItemResponse(BaseModel):
    id: int
    filename: str
    url: str
    title: Optional[str] = None
    alt_text: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
