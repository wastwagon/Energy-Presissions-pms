"""add category column to cms_blog_posts

Revision ID: j1k2l3m4n5o6
Revises: i0j1k2l3m4n5
Create Date: 2026-06-05

"""
from alembic import op
import sqlalchemy as sa

revision = "j1k2l3m4n5o6"
down_revision = "i0j1k2l3m4n5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cms_blog_posts",
        sa.Column("category", sa.String(64), nullable=False, server_default="Ghana"),
    )


def downgrade() -> None:
    op.drop_column("cms_blog_posts", "category")
