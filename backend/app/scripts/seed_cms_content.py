#!/usr/bin/env python3
"""
Idempotent CMS seed: blog posts, FAQs, and portfolio page gallery into the database.

Run once after deploy when tables are empty:
  DATABASE_URL=... python -m app.scripts.seed_cms_content
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.orm import Session

from app.cms_defaults import get_page_defaults
from app.faq_defaults import get_default_faqs
from app.database import SessionLocal
from app.models_content import CmsBlogPost, CmsFaqItem, CmsPageContent
from app.portfolio_defaults import get_default_portfolio_items
from app.location_defaults import get_default_location_items

BLOG_SEED = [
    {
        "slug": "site-assessment-before-solar-sizing",
        "title": "Why a site assessment matters before solar sizing",
        "excerpt": (
            "Accurate bills, roof or ground space, and how you use power all change the right "
            "system size — not just panel count."
        ),
        "category": "Planning",
        "display_date": "2026-04-01",
        "read_time": "4 min read",
        "body": "\n\n".join(
            [
                "Solar sizing is not guesswork. The same number of panels can be right for one home and wrong for another because tariffs, usage patterns, and available roof or ground space differ.",
                "A proper site assessment reviews your recent electricity consumption (or expected loads for a new build), shading, orientation, and whether you want backup during outages. That drives inverter and battery choices as much as it drives panel count.",
                "When you request a quote, sharing honest usage data and photos of your service entry and roof helps engineers avoid oversized systems you pay too much for — or undersized systems that disappoint.",
                "Energy Precisions combines load analysis with on-site or remote checks so proposals stay tied to what you actually need. When you are ready, start with a quote request and we will guide the rest.",
            ]
        ),
    },
    {
        "slug": "grid-tied-vs-hybrid-ghana",
        "title": "Grid-tied vs hybrid solar in Ghana: what to consider",
        "excerpt": (
            "Grid-tied systems maximise savings when the grid is stable; hybrid adds batteries for "
            "backup and smoother evening use."
        ),
        "category": "Systems",
        "display_date": "2026-04-03",
        "read_time": "5 min read",
        "body": "\n\n".join(
            [
                "Grid-tied solar feeds excess energy to the grid where net metering or export rules apply, reducing your bill when the sun is up. It is often the most cost-effective path when outages are rare and your goal is lower energy cost.",
                "Hybrid systems add battery storage so critical circuits — or the whole premises — can run when the grid drops. Batteries also help shift solar energy into the evening, which matters when peak tariffs or self-consumption goals dominate.",
                "In Ghana, grid reliability varies by area. If your operations or comfort depend on continuity, budgeting for a hybrid design early avoids expensive retrofits later.",
                "There is no universal winner: the right design matches your tariff, outage experience, budget, and maintenance appetite. We document assumptions clearly in every proposal so you can compare options on merit.",
            ]
        ),
    },
]


def seed_faqs(db: Session) -> int:
    if db.query(CmsFaqItem).count() > 0:
        print("ℹ️  FAQs already exist — skipping")
        return 0
    faqs = get_default_faqs()
    if not faqs:
        print("⚠️  No bundled FAQs found — skipping")
        return 0
    for i, row in enumerate(faqs):
        db.add(
            CmsFaqItem(
                question=row["question"],
                answer=row["answer"],
                sort_order=i,
                published=True,
            )
        )
    db.commit()
    print(f"✅ Seeded {len(faqs)} FAQ items")
    return len(faqs)


def seed_blog(db: Session) -> int:
    if db.query(CmsBlogPost).count() > 0:
        print("ℹ️  Blog posts already exist — skipping")
        return 0
    for i, row in enumerate(BLOG_SEED):
        db.add(
            CmsBlogPost(
                slug=row["slug"],
                title=row["title"],
                excerpt=row["excerpt"],
                body=row["body"],
                display_date=row["display_date"],
                read_time=row["read_time"],
                category=row.get("category", "Ghana"),
                published=True,
                sort_order=i,
            )
        )
    db.commit()
    print(f"✅ Seeded {len(BLOG_SEED)} blog posts")
    return len(BLOG_SEED)


def seed_portfolio_page(db: Session) -> int:
    if db.query(CmsPageContent).filter(CmsPageContent.page == "portfolio").first():
        print("ℹ️  Portfolio CMS page already stored — skipping")
        return 0
    items = get_default_portfolio_items()
    if not items:
        print("⚠️  No portfolio items found — skipping portfolio page seed")
        return 0
    sections = get_page_defaults("portfolio")
    sections["items"] = items
    db.add(CmsPageContent(page="portfolio", sections=json.dumps(sections)))
    db.commit()
    print(f"✅ Seeded portfolio CMS page with {len(items)} gallery items")
    return len(items)


def seed_locations_page(db: Session) -> int:
    if db.query(CmsPageContent).filter(CmsPageContent.page == "locations").first():
        print("ℹ️  Locations CMS page already stored — skipping")
        return 0
    items = get_default_location_items()
    if not items:
        print("⚠️  No location items found — skipping locations page seed")
        return 0
    db.add(CmsPageContent(page="locations", sections=json.dumps({"items": items})))
    db.commit()
    print(f"✅ Seeded locations CMS page with {len(items)} cities")
    return len(items)


def seed_cms_content() -> None:
    db = SessionLocal()
    try:
        seed_faqs(db)
        seed_blog(db)
        seed_portfolio_page(db)
        seed_locations_page(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed_cms_content()
