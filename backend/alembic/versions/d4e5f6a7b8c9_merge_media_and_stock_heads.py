"""merge media_items (b0c1) and stock_ecom (f4a5) heads

Revision ID: d4e5f6a7b8c9
Revises: b0c1d2e3f4a5, f4a5b6c7d8e9
Create Date: 2026-04-06

"""
from alembic import op

revision = "d4e5f6a7b8c9"
down_revision = ("b0c1d2e3f4a5", "f4a5b6c7d8e9")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
