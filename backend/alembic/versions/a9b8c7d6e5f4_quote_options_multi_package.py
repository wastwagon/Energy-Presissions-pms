"""quote_options: multi-package lines per quote; accepted option for stock

Revision ID: a9b8c7d6e5f4
Revises: f7a8b9c0d1e2
Create Date: 2026-05-11

"""
from alembic import op
import sqlalchemy as sa

revision = "a9b8c7d6e5f4"
down_revision = "f7a8b9c0d1e2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quote_options",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False, server_default="Option 1"),
        sa.Column("narrative", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quote_options_quote_id"), "quote_options", ["quote_id"], unique=False)

    op.add_column("quote_items", sa.Column("quote_option_id", sa.Integer(), nullable=True))

    op.execute(
        """
        INSERT INTO quote_options (quote_id, title, narrative, sort_order)
        SELECT id, 'Option 1', NULL, 0 FROM quotes
        """
    )
    op.execute(
        """
        UPDATE quote_items AS qi
        SET quote_option_id = qo.id
        FROM quote_options AS qo
        WHERE qi.quote_id = qo.quote_id AND qo.sort_order = 0
        """
    )

    op.alter_column("quote_items", "quote_option_id", existing_type=sa.Integer(), nullable=False)
    op.create_foreign_key(
        "quote_items_quote_option_id_fkey",
        "quote_items",
        "quote_options",
        ["quote_option_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(op.f("ix_quote_items_quote_option_id"), "quote_items", ["quote_option_id"], unique=False)

    op.add_column("quotes", sa.Column("accepted_quote_option_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "quotes_accepted_quote_option_id_fkey",
        "quotes",
        "quote_options",
        ["accepted_quote_option_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("quotes_accepted_quote_option_id_fkey", "quotes", type_="foreignkey")
    op.drop_column("quotes", "accepted_quote_option_id")

    op.drop_index(op.f("ix_quote_items_quote_option_id"), table_name="quote_items")
    op.drop_constraint("quote_items_quote_option_id_fkey", "quote_items", type_="foreignkey")
    op.drop_column("quote_items", "quote_option_id")

    op.drop_index(op.f("ix_quote_options_quote_id"), table_name="quote_options")
    op.drop_table("quote_options")
