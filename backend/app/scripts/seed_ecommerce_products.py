#!/usr/bin/env python3
"""
Seed e-commerce products with sample data
Creates sample products if none exist
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Product, ProductType

def seed_products():
    """Seed sample e-commerce products"""
    db: Session = SessionLocal()
    try:
        # Check if products already exist
        existing_count = db.query(Product).count()
        if existing_count > 0:
            print(f"ℹ️  {existing_count} products already exist. Skipping seed.")
            return
        
        sample_products = [
            {
                "product_type": ProductType.PANEL,
                "brand": "JA Solar",
                "model": "570W",
                "wattage": 570,
                "name": "JA Solar 570W Solar Panel",
                "description": "High-efficiency monocrystalline solar panel with 570W output. Perfect for residential and commercial installations. Features advanced PERC technology for maximum efficiency.",
                "short_description": "High-efficiency 570W solar panel with advanced PERC technology",
                "category": "Solar Panels",
                "base_price": 1400.0,
                "price_type": "fixed",
                "sku": "PAN-0001",
                "in_stock": True,
                "stock_quantity": 100,
            },
            {
                "product_type": ProductType.PANEL,
                "brand": "Jinko",
                "model": "580W",
                "wattage": 580,
                "name": "Jinko 580W Solar Panel",
                "description": "Premium Jinko solar panel with 580W output. Advanced technology ensures excellent performance in various weather conditions.",
                "short_description": "Premium 580W solar panel with excellent performance",
                "category": "Solar Panels",
                "base_price": 1500.0,
                "price_type": "fixed",
                "sku": "PAN-0002",
                "in_stock": True,
                "stock_quantity": 80,
            },
            {
                "product_type": ProductType.INVERTER,
                "brand": "Energy Precision",
                "model": "10kW",
                "capacity_kw": 10.0,
                "name": "Energy Precision 10kW Inverter",
                "description": "High-performance hybrid inverter for residential use. Supports grid-tied, hybrid, and off-grid configurations.",
                "short_description": "10kW hybrid inverter for solar systems",
                "category": "Inverters",
                "base_price": 11000.0,
                "price_type": "fixed",
                "sku": "INV-0001",
                "in_stock": True,
                "stock_quantity": 20,
            },
            {
                "product_type": ProductType.BATTERY,
                "brand": "Energy Precisions",
                "model": "16kWh",
                "capacity_kwh": 16.0,
                "name": "Energy Precisions 16kWh Battery",
                "description": "LiFePO4 battery storage system with 16kWh capacity. Long lifespan and excellent performance for solar energy storage.",
                "short_description": "16kWh LiFePO4 battery storage system",
                "category": "Batteries",
                "base_price": 26000.0,
                "price_type": "fixed",
                "sku": "BAT-0001",
                "in_stock": True,
                "stock_quantity": 15,
            },
            {
                "product_type": ProductType.PANEL,
                "brand": "Longi",
                "model": "550W",
                "wattage": 550,
                "name": "Longi 550W Solar Panel",
                "description": "Reliable Longi solar panel with 550W output. Excellent performance and durability.",
                "short_description": "Reliable 550W solar panel",
                "category": "Solar Panels",
                "base_price": 1350.0,
                "price_type": "fixed",
                "sku": "PAN-0003",
                "in_stock": True,
                "stock_quantity": 90,
            },
            {
                "product_type": ProductType.INVERTER,
                "brand": "Energy Precision",
                "model": "5kW",
                "capacity_kw": 5.0,
                "name": "Energy Precision 5kW Inverter",
                "description": "Compact 5kW inverter perfect for small installations. Efficient and reliable.",
                "short_description": "5kW inverter for small installations",
                "category": "Inverters",
                "base_price": 6500.0,
                "price_type": "fixed",
                "sku": "INV-0002",
                "in_stock": True,
                "stock_quantity": 25,
            },
            {
                "product_type": ProductType.BATTERY,
                "brand": "Energy Precisions",
                "model": "8kWh",
                "capacity_kwh": 8.0,
                "name": "Energy Precisions 8kWh Battery",
                "description": "Mid-range 8kWh battery storage solution. Perfect for smaller solar systems.",
                "short_description": "8kWh battery storage solution",
                "category": "Batteries",
                "base_price": 14000.0,
                "price_type": "fixed",
                "sku": "BAT-0002",
                "in_stock": True,
                "stock_quantity": 20,
            },
        ]
        
        for product_data in sample_products:
            product = Product(**product_data)
            db.add(product)
            print(f"✅ Created: {product.name}")
        
        db.commit()
        print(f"\n✅ Created {len(sample_products)} sample products")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()



