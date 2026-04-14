"""Public website content (blog, FAQ, whitelisted settings) + admin CRUD."""
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.models_content import SiteSetting, CmsBlogPost, CmsFaqItem
from app.auth import require_role

router = APIRouter(prefix="/api/content", tags=["content"])

WEB_OR_ADMIN = [UserRole.ADMIN, UserRole.WEBSITE_ADMIN]

# Keys readable anonymously (URLs / text for marketing pages)
PUBLIC_SETTING_KEYS = frozenset(
    {
        "home_hero_image",
        "about_hero_image",
        "services_hero_image",
    }
)


# --- Public ---


class BlogPostPublic(BaseModel):
    slug: str
    title: str
    excerpt: str
    body: str
    display_date: str
    read_time: str

    class Config:
        from_attributes = True


@router.get("/blog", response_model=List[BlogPostPublic])
async def list_blog_posts_public(db: Session = Depends(get_db)):
    rows = (
        db.query(CmsBlogPost)
        .filter(CmsBlogPost.published == True)
        .order_by(CmsBlogPost.sort_order.asc(), CmsBlogPost.display_date.desc())
        .all()
    )
    return rows


@router.get("/blog/{slug}", response_model=BlogPostPublic)
async def get_blog_post_public(slug: str, db: Session = Depends(get_db)):
    row = (
        db.query(CmsBlogPost)
        .filter(CmsBlogPost.slug == slug, CmsBlogPost.published == True)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row


class FaqPublic(BaseModel):
    question: str
    answer: str

    class Config:
        from_attributes = True


@router.get("/faqs", response_model=List[FaqPublic])
async def list_faqs_public(db: Session = Depends(get_db)):
    rows = (
        db.query(CmsFaqItem)
        .filter(CmsFaqItem.published == True)
        .order_by(CmsFaqItem.sort_order.asc(), CmsFaqItem.id.asc())
        .all()
    )
    return rows


@router.get("/settings/public")
async def get_public_settings(db: Session = Depends(get_db)) -> Dict[str, str]:
    rows = (
        db.query(SiteSetting)
        .filter(SiteSetting.key.in_(PUBLIC_SETTING_KEYS))
        .all()
    )
    return {r.key: r.value or "" for r in rows}


# --- Admin ---


class SiteSettingWrite(BaseModel):
    value: str = Field(default="", max_length=50000)


class BlogPostAdmin(BaseModel):
    slug: str = Field(..., min_length=1, max_length=200)
    title: str = Field(..., min_length=1, max_length=300)
    excerpt: str = ""
    body: str = ""
    display_date: str = ""
    read_time: str = ""
    published: bool = False
    sort_order: int = 0


class BlogPostAdminOut(BlogPostAdmin):
    id: int

    class Config:
        from_attributes = True


class FaqAdmin(BaseModel):
    question: str
    answer: str
    sort_order: int = 0
    published: bool = True


class FaqAdminOut(FaqAdmin):
    id: int

    class Config:
        from_attributes = True


@router.put("/admin/settings/{key}")
async def admin_put_setting(
    key: str,
    body: SiteSettingWrite,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    if len(key) > 120:
        raise HTTPException(status_code=400, detail="Invalid key")
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if row:
        row.value = body.value
    else:
        row = SiteSetting(key=key, value=body.value)
        db.add(row)
    db.commit()
    return {"key": key, "value": body.value}


@router.get("/admin/settings")
async def admin_list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
) -> Dict[str, str]:
    rows = db.query(SiteSetting).order_by(SiteSetting.key.asc()).all()
    return {r.key: r.value or "" for r in rows}


@router.get("/admin/blog", response_model=List[BlogPostAdminOut])
async def admin_list_blog(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    return db.query(CmsBlogPost).order_by(CmsBlogPost.sort_order.asc(), CmsBlogPost.id.asc()).all()


@router.post("/admin/blog", response_model=BlogPostAdminOut)
async def admin_create_blog(
    body: BlogPostAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    exists = db.query(CmsBlogPost).filter(CmsBlogPost.slug == body.slug).first()
    if exists:
        raise HTTPException(status_code=400, detail="Slug already exists")
    row = CmsBlogPost(**body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/admin/blog/{post_id}", response_model=BlogPostAdminOut)
async def admin_update_blog(
    post_id: int,
    body: BlogPostAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    row = db.query(CmsBlogPost).filter(CmsBlogPost.id == post_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    clash = (
        db.query(CmsBlogPost)
        .filter(CmsBlogPost.slug == body.slug, CmsBlogPost.id != post_id)
        .first()
    )
    if clash:
        raise HTTPException(status_code=400, detail="Slug already exists")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/admin/blog/{post_id}")
async def admin_delete_blog(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    row = db.query(CmsBlogPost).filter(CmsBlogPost.id == post_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/admin/faqs", response_model=List[FaqAdminOut])
async def admin_list_faqs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    return db.query(CmsFaqItem).order_by(CmsFaqItem.sort_order.asc(), CmsFaqItem.id.asc()).all()


@router.post("/admin/faqs", response_model=FaqAdminOut)
async def admin_create_faq(
    body: FaqAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    row = CmsFaqItem(**body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/admin/faqs/{faq_id}", response_model=FaqAdminOut)
async def admin_update_faq(
    faq_id: int,
    body: FaqAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    row = db.query(CmsFaqItem).filter(CmsFaqItem.id == faq_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/admin/faqs/{faq_id}")
async def admin_delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    row = db.query(CmsFaqItem).filter(CmsFaqItem.id == faq_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(row)
    db.commit()
    return {"ok": True}
