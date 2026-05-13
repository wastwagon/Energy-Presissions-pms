"""normalize product image urls from /api/media/file/{id} to /api/media/public/{id}

Revision ID: h9i0j1k2l3m4
Revises: g8h9i0j1k2l3
Create Date: 2026-04-27
"""

from alembic import op
import sqlalchemy as sa


revision = "h9i0j1k2l3m4"
down_revision = "g8h9i0j1k2l3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name
    if dialect == "postgresql":
        bind.execute(
            sa.text(
                """
                UPDATE products
                SET image_url = regexp_replace(image_url, '/api/media/file/([0-9]+)$', '/api/media/public/\\1')
                WHERE image_url LIKE '/api/media/file/%'
                """
            )
        )
    else:
        # Portable fallback for sqlite/other engines.
        bind.execute(
            sa.text(
                """
                UPDATE products
                SET image_url = REPLACE(image_url, '/api/media/file/', '/api/media/public/')
                WHERE image_url LIKE '/api/media/file/%'
                """
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            UPDATE products
            SET image_url = REPLACE(image_url, '/api/media/public/', '/api/media/file/')
            WHERE image_url LIKE '/api/media/public/%'
            """
        )
    )
