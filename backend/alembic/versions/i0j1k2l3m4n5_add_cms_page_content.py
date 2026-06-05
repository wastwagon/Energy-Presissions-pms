"""add cms_page_content table for full page CMS

Revision ID: i0j1k2l3m4n5
Revises: b2c3d4e5f6a7
Create Date: 2026-06-05

"""
from alembic import op
import sqlalchemy as sa

revision = "i0j1k2l3m4n5"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cms_page_content",
        sa.Column("page", sa.String(64), primary_key=True, nullable=False),
        sa.Column("sections", sa.Text(), nullable=False, server_default="{}"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("cms_page_content")
