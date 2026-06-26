"""add featured_image column to cms_blog_posts

Revision ID: k2l3m4n5o6p7
Revises: j1k2l3m4n5o6
Create Date: 2026-06-26

"""
from alembic import op
import sqlalchemy as sa

revision = "k2l3m4n5o6p7"
down_revision = "j1k2l3m4n5o6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cms_blog_posts",
        sa.Column("featured_image", sa.String(500), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("cms_blog_posts", "featured_image")
