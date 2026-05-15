"""merge alembic heads; add mounting rail estimate columns to sizing_results

Revision ID: b2c3d4e5f6a7
Revises: a9b8c7d6e5f4, h9i0j1k2l3m4
Create Date: 2026-05-11

"""
from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6a7"
down_revision = ("a9b8c7d6e5f4", "h9i0j1k2l3m4")
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "sizing_results",
        sa.Column("mounting_rail_linear_m_estimate", sa.Float(), nullable=True),
    )
    op.add_column(
        "sizing_results",
        sa.Column("mounting_rails_estimate", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("sizing_results", "mounting_rails_estimate")
    op.drop_column("sizing_results", "mounting_rail_linear_m_estimate")
