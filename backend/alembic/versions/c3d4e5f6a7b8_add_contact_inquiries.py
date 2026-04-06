"""add contact_inquiries table

Revision ID: c3d4e5f6a7b8
Revises: f4a5b6c7d8e9
Create Date: 2026-04-06

"""
from alembic import op
import sqlalchemy as sa


revision = "c3d4e5f6a7b8"
down_revision = "d4e5f6a7b8c9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "contact_inquiries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("service", sa.String(), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contact_inquiries_email"), "contact_inquiries", ["email"], unique=False)
    op.create_index(op.f("ix_contact_inquiries_id"), "contact_inquiries", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_contact_inquiries_id"), table_name="contact_inquiries")
    op.drop_index(op.f("ix_contact_inquiries_email"), table_name="contact_inquiries")
    op.drop_table("contact_inquiries")
