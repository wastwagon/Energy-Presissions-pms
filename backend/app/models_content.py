"""CMS-style content: site settings, blog posts, FAQs (public + admin APIs)."""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class SiteSetting(Base):
    __tablename__ = "site_settings"

    key = Column(String(120), primary_key=True, index=True)
    value = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CmsBlogPost(Base):
    __tablename__ = "cms_blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    excerpt = Column(Text, nullable=False, default="")
    body = Column(Text, nullable=False, default="")
    display_date = Column(String(32), nullable=False, default="")
    read_time = Column(String(32), nullable=False, default="")
    published = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CmsFaqItem(Base):
    __tablename__ = "cms_faq_items"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    published = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
