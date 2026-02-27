"""add_stock_movements

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = 'e3f4a5b6c7d8'
down_revision = 'd2e3f4a5b6c7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DO $$ BEGIN CREATE TYPE stockmovementtype AS ENUM ('deduction_on_accept', 'restore_on_reject'); EXCEPTION WHEN duplicate_object THEN NULL; END $$")
    op.create_table(
        'stock_movements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('movement_type', sa.Enum('deduction_on_accept', 'restore_on_reject', name='stockmovementtype'), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('quote_id', sa.Integer(), nullable=False),
        sa.Column('quote_item_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['quote_id'], ['quotes.id'], ),
        sa.ForeignKeyConstraint(['quote_item_id'], ['quote_items.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_stock_movements_project_id', 'stock_movements', ['project_id'], unique=False)
    op.create_index('ix_stock_movements_product_id', 'stock_movements', ['product_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_stock_movements_product_id', table_name='stock_movements')
    op.drop_index('ix_stock_movements_project_id', table_name='stock_movements')
    op.drop_table('stock_movements')
    op.execute("DROP TYPE stockmovementtype")
