"""Public website content (blog, FAQ, whitelisted settings, page CMS) + admin CRUD."""
import json
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.cms_defaults import CMS_PAGES, merge_page_sections
from app.database import get_db
from app.models import User, UserRole
from app.models_content import SiteSetting, CmsBlogPost, CmsFaqItem, CmsPageContent
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


def _parse_sections(raw: str | None) -> Dict[str, Any]:
    if not raw or not raw.strip():
        return {}
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def _load_page_sections(db: Session, page: str) -> Dict[str, Any]:
    row = db.query(CmsPageContent).filter(CmsPageContent.page == page).first()
    stored = _parse_sections(row.sections if row else None)
    return merge_page_sections(page, stored)


class PageContentPublic(BaseModel):
    page: str
    sections: Dict[str, Any]


@router.get("/pages/{page}", response_model=PageContentPublic)
async def get_page_content_public(page: str, db: Session = Depends(get_db)):
    if page not in CMS_PAGES:
        raise HTTPException(status_code=404, detail="Unknown page")
    return {"page": page, "sections": _load_page_sections(db, page)}


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


class PageContentWrite(BaseModel):
    sections: Dict[str, Any] = Field(default_factory=dict)


class PageContentAdminOut(BaseModel):
    page: str
    sections: Dict[str, Any]
    stored_sections: Dict[str, Any]


@router.get("/admin/pages", response_model=List[str])
async def admin_list_pages(
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    return list(CMS_PAGES)


@router.get("/admin/pages/{page}", response_model=PageContentAdminOut)
async def admin_get_page(
    page: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    if page not in CMS_PAGES:
        raise HTTPException(status_code=404, detail="Unknown page")
    row = db.query(CmsPageContent).filter(CmsPageContent.page == page).first()
    stored = _parse_sections(row.sections if row else None)
    return {
        "page": page,
        "sections": merge_page_sections(page, stored),
        "stored_sections": stored,
    }


@router.put("/admin/pages/{page}", response_model=PageContentAdminOut)
async def admin_put_page(
    page: str,
    body: PageContentWrite,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(WEB_OR_ADMIN)),
):
    if page not in CMS_PAGES:
        raise HTTPException(status_code=404, detail="Unknown page")
    if not isinstance(body.sections, dict):
        raise HTTPException(status_code=400, detail="sections must be an object")
    payload = json.dumps(body.sections)
    row = db.query(CmsPageContent).filter(CmsPageContent.page == page).first()
    if row:
        row.sections = payload
    else:
        row = CmsPageContent(page=page, sections=payload)
        db.add(row)
    db.commit()
    db.refresh(row)
    stored = _parse_sections(row.sections)
    return {
        "page": page,
        "sections": merge_page_sections(page, stored),
        "stored_sections": stored,
    }
