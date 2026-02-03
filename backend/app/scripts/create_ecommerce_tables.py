#!/usr/bin/env python3
"""
Create e-commerce database tables
Run this script to add e-commerce tables to the database
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import engine, Base
from app import models_ecommerce  # Import to register models

def create_ecommerce_tables():
    """Create e-commerce tables"""
    print("Creating e-commerce tables...")
    
    # Import all models to ensure they're registered
    from app.models_ecommerce import Order, OrderItem, CartItem, Coupon
    
    # Create tables
    Base.metadata.create_all(bind=engine, tables=[
        Order.__table__,
        OrderItem.__table__,
        CartItem.__table__,
        Coupon.__table__,
    ])
    
    print("✅ E-commerce tables created successfully!")
    print("  - orders")
    print("  - order_items")
    print("  - cart_items")
    print("  - coupons")

if __name__ == "__main__":
    create_ecommerce_tables()



