"""add_ecommerce_tables_and_product_fields

Revision ID: a1b2c3d4e5f6
Revises: 304a25b97468
Create Date: 2025-12-03 23:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '304a25b97468'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add e-commerce fields to products table
    op.add_column('products', sa.Column('name', sa.String(), nullable=True))
    op.add_column('products', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('products', sa.Column('short_description', sa.Text(), nullable=True))
    op.add_column('products', sa.Column('image_url', sa.String(), nullable=True))
    op.add_column('products', sa.Column('gallery_images', sa.JSON(), nullable=True))
    op.add_column('products', sa.Column('category', sa.String(), nullable=True))
    op.add_column('products', sa.Column('sku', sa.String(), nullable=True))
    op.create_index('ix_products_sku', 'products', ['sku'], unique=True)
    op.add_column('products', sa.Column('stock_quantity', sa.Integer(), server_default='0', nullable=False))
    op.add_column('products', sa.Column('manage_stock', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('products', sa.Column('in_stock', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('products', sa.Column('weight', sa.Float(), nullable=True))
    op.add_column('products', sa.Column('dimensions', sa.JSON(), nullable=True))
    
    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_number', sa.String(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), server_default='pending', nullable=False),
        sa.Column('payment_status', sa.String(), server_default='pending', nullable=True),
        sa.Column('payment_method', sa.String(), nullable=True),
        sa.Column('payment_reference', sa.String(), nullable=True),
        sa.Column('subtotal', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('shipping_cost', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('tax_amount', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('discount_amount', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('total_amount', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('shipping_address', sa.JSON(), nullable=True),
        sa.Column('billing_address', sa.JSON(), nullable=True),
        sa.Column('shipping_method', sa.String(), nullable=True),
        sa.Column('tracking_number', sa.String(), nullable=True),
        sa.Column('customer_name', sa.String(), nullable=True),
        sa.Column('customer_email', sa.String(), nullable=True),
        sa.Column('customer_phone', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('shipped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_orders_order_number', 'orders', ['order_number'], unique=True)
    
    # Create order_items table
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('product_name', sa.String(), nullable=False),
        sa.Column('product_sku', sa.String(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('total_price', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create cart_items table
    op.create_table(
        'cart_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), server_default='1', nullable=False),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_cart_items_session_id', 'cart_items', ['session_id'], unique=False)
    
    # Create coupons table
    op.create_table(
        'coupons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(), nullable=False),
        sa.Column('discount_type', sa.String(), nullable=False),
        sa.Column('discount_value', sa.Float(), nullable=False),
        sa.Column('minimum_amount', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('usage_limit', sa.Integer(), nullable=True),
        sa.Column('used_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )
    op.create_index('ix_coupons_code', 'coupons', ['code'], unique=True)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('ix_coupons_code', table_name='coupons')
    op.drop_table('coupons')
    op.drop_index('ix_cart_items_session_id', table_name='cart_items')
    op.drop_table('cart_items')
    op.drop_table('order_items')
    op.drop_index('ix_orders_order_number', table_name='orders')
    op.drop_table('orders')
    
    # Remove e-commerce fields from products
    op.drop_column('products', 'dimensions')
    op.drop_column('products', 'weight')
    op.drop_column('products', 'in_stock')
    op.drop_column('products', 'manage_stock')
    op.drop_column('products', 'stock_quantity')
    op.drop_index('ix_products_sku', table_name='products')
    op.drop_column('products', 'sku')
    op.drop_column('products', 'category')
    op.drop_column('products', 'gallery_images')
    op.drop_column('products', 'image_url')
    op.drop_column('products', 'short_description')
    op.drop_column('products', 'description')
    op.drop_column('products', 'name')

