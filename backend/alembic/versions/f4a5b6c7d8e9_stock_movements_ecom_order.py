"""stock_movements_ecom_order - add ecom order deduction, nullable project/quote, order_id

Revision ID: f4a5b6c7d8e9
Revises: e3f4a5b6c7d8
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = 'f4a5b6c7d8e9'
down_revision = 'e3f4a5b6c7d8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DO $$ BEGIN ALTER TYPE stockmovementtype ADD VALUE 'deduction_ecom_order'; EXCEPTION WHEN duplicate_object THEN NULL; END $$")
    op.alter_column(
        'stock_movements',
        'project_id',
        existing_type=sa.Integer(),
        nullable=True
    )
    op.alter_column(
        'stock_movements',
        'quote_id',
        existing_type=sa.Integer(),
        nullable=True
    )
    op.add_column('stock_movements', sa.Column('order_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_stock_movements_order_id', 'stock_movements', 'orders', ['order_id'], ['id'])
    op.create_index('ix_stock_movements_order_id', 'stock_movements', ['order_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_stock_movements_order_id', table_name='stock_movements')
    op.drop_constraint('fk_stock_movements_order_id', 'stock_movements', type_='foreignkey')
    op.drop_column('stock_movements', 'order_id')
    op.alter_column('stock_movements', 'quote_id', existing_type=sa.Integer(), nullable=False)
    op.alter_column('stock_movements', 'project_id', existing_type=sa.Integer(), nullable=False)
    # Note: removing enum value in PostgreSQL is not straightforward; leave type as-is
