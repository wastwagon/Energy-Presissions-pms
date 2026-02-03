"""add_company_specific_appliances

Revision ID: feb357a15984
Revises: 79c9baf6500d
Create Date: 2025-11-26 21:50:28.883324

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'feb357a15984'
down_revision = '79c9baf6500d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new appliance type enum values
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'tv_42inch_led'")
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'ps5'")
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'ps4'")
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'xbox_series_x'")
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'monitor_24inch'")
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'printer_small'")
    op.execute("ALTER TYPE appliancetype ADD VALUE IF NOT EXISTS 'printer_large'")


def downgrade() -> None:
    # Note: PostgreSQL does not support removing enum values
    # If needed, recreate the enum type without these values
    pass

