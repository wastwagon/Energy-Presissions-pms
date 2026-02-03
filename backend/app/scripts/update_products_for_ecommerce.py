#!/usr/bin/env python3
"""
Update existing products with e-commerce fields
This script generates names, descriptions, and categories for existing products
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Product, ProductType

def update_products():
    """Update products with e-commerce fields"""
    db: Session = SessionLocal()
    try:
        products = db.query(Product).all()
        updated_count = 0
        
        for product in products:
            updated = False
            
            # Generate name if not set
            if not product.name:
                if product.brand and product.model:
                    product.name = f"{product.brand} {product.model}"
                elif product.brand:
                    product.name = product.brand
                elif product.product_type == ProductType.PANEL:
                    product.name = f"Solar Panel {product.wattage}W"
                elif product.product_type == ProductType.INVERTER:
                    product.name = f"Inverter {product.capacity_kw}kW"
                elif product.product_type == ProductType.BATTERY:
                    product.name = f"Battery {product.capacity_kwh}kWh"
                else:
                    product.name = f"Product {product.id}"
                updated = True
            
            # Generate short description
            if not product.short_description:
                if product.product_type == ProductType.PANEL:
                    product.short_description = f"High-efficiency {product.wattage}W solar panel"
                elif product.product_type == ProductType.INVERTER:
                    product.short_description = f"{product.capacity_kw}kW hybrid inverter for solar systems"
                elif product.product_type == ProductType.BATTERY:
                    product.short_description = f"{product.capacity_kwh}kWh LiFePO4 battery storage system"
                else:
                    product.short_description = "Quality solar energy product"
                updated = True
            
            # Generate full description
            if not product.description:
                product.description = product.short_description + ". Perfect for residential and commercial solar installations."
                updated = True
            
            # Set category
            if not product.category:
                if product.product_type == ProductType.PANEL:
                    product.category = "Solar Panels"
                elif product.product_type == ProductType.INVERTER:
                    product.category = "Inverters"
                elif product.product_type == ProductType.BATTERY:
                    product.category = "Batteries"
                else:
                    product.category = "Accessories"
                updated = True
            
            # Generate SKU
            if not product.sku:
                prefix = {
                    ProductType.PANEL: "PAN",
                    ProductType.INVERTER: "INV",
                    ProductType.BATTERY: "BAT",
                }.get(product.product_type, "PROD")
                product.sku = f"{prefix}-{product.id:04d}"
                updated = True
            
            # Set stock status
            if product.in_stock is None:
                product.in_stock = True
                updated = True
            
            if updated:
                db.add(product)
                updated_count += 1
                print(f"✅ Updated: {product.name} (ID: {product.id})")
        
        db.commit()
        print(f"\n✅ Updated {updated_count} products with e-commerce fields")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    update_products()



