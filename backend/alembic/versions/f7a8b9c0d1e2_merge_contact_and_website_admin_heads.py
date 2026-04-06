"""merge contact_inquiries (c3d4) and website_admin CMS (e5f6) heads

Revision ID: f7a8b9c0d1e2
Revises: c3d4e5f6a7b8, e5f6a7b8c9d0
Create Date: 2026-04-06

"""
from alembic import op

revision = "f7a8b9c0d1e2"
down_revision = ("c3d4e5f6a7b8", "e5f6a7b8c9d0")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
