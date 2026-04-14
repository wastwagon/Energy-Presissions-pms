"""website_admin role, cart user_id, CMS tables (blog, faq, site_settings)

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-04-06

"""
from alembic import op
import sqlalchemy as sa

revision = "e5f6a7b8c9d0"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enum value add must run outside an implicit transaction on some PostgreSQL versions
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE userrole ADD VALUE 'website_admin'")

    op.add_column(
        "cart_items",
        sa.Column("user_id", sa.Integer(), nullable=True),
    )
    op.create_index("ix_cart_items_user_id", "cart_items", ["user_id"])
    op.create_foreign_key(
        "fk_cart_items_user_id_users",
        "cart_items",
        "users",
        ["user_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "site_settings",
        sa.Column("key", sa.String(120), primary_key=True, nullable=False),
        sa.Column("value", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "cms_blog_posts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(200), nullable=False, unique=True, index=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=False, server_default=""),
        sa.Column("body", sa.Text(), nullable=False, server_default=""),
        sa.Column("display_date", sa.String(32), nullable=False, server_default=""),
        sa.Column("read_time", sa.String(32), nullable=False, server_default=""),
        sa.Column("published", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        "cms_faq_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("published", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("cms_faq_items")
    op.drop_table("cms_blog_posts")
    op.drop_table("site_settings")

    op.drop_constraint("fk_cart_items_user_id_users", "cart_items", type_="foreignkey")
    op.drop_index("ix_cart_items_user_id", table_name="cart_items")
    op.drop_column("cart_items", "user_id")

    # Cannot remove enum value safely in PostgreSQL; leave userrole as-is
