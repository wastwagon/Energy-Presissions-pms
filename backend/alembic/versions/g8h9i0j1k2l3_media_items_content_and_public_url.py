"""media_items: store file bytes and original filename for durable public URLs

Revision ID: g8h9i0j1k2l3
Revises: f7a8b9c0d1e2
Create Date: 2026-04-24

"""
import sqlalchemy as sa
from alembic import op

revision = "g8h9i0j1k2l3"
down_revision = "f7a8b9c0d1e2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("media_items", sa.Column("content", sa.LargeBinary(), nullable=True))
    op.add_column("media_items", sa.Column("original_filename", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("media_items", "original_filename")
    op.drop_column("media_items", "content")
