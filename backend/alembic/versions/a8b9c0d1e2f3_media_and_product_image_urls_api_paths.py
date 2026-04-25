"""Point media and product images at /api-served paths (works when only /api is proxied).

Revision ID: a8b9c0d1e2f3
Revises: f7a8b9c0d1e2
Create Date: 2026-04-24

"""
from alembic import op

revision = "a8b9c0d1e2f3"
down_revision = "f7a8b9c0d1e2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Products that used the same URL as a media library row
    op.execute(
        """
        UPDATE products AS p
        SET image_url = '/api/media/file/' || m.id::text
        FROM media_items AS m
        WHERE p.image_url = m.url AND m.url LIKE '/static/media/%'
        """
    )
    # Media library rows → served by id
    op.execute(
        """
        UPDATE media_items
        SET url = '/api/media/file/' || id::text
        WHERE url LIKE '/static/media/%' OR url = ''
        """
    )
    # Product-only uploads under static/products/
    op.execute(
        """
        UPDATE products
        SET image_url = '/api/products/image/' || split_part(image_url, '/', -1)
        WHERE image_url LIKE '/static/products/%'
        """
    )


def downgrade() -> None:
    pass
