"""add_newsletter_subscribers

Revision ID: c1d2e3f4a5b6
Revises: 8dea1447cce3
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = 'c1d2e3f4a5b6'
down_revision = '8dea1447cce3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'newsletter_subscribers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_newsletter_subscribers_email', 'newsletter_subscribers', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_newsletter_subscribers_email', table_name='newsletter_subscribers')
    op.drop_table('newsletter_subscribers')
