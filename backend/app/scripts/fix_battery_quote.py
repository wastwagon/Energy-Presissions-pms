"""
Script to fix battery quantity in quote QT-A5672B13
Replace 175 × 5kWh batteries with 16kWh batteries
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal
from app.models import Quote, QuoteItem, Product, ProductType
from sqlalchemy.orm import joinedload

def fix_battery_quote():
    db = SessionLocal()
    
    try:
        # Find the quote
        quote = db.query(Quote).filter(Quote.quote_number == 'QT-A5672B13').first()
        if not quote:
            print("Quote QT-A5672B13 not found")
            return
        
        print(f"Found quote: {quote.quote_number}")
        
        # Find the battery item
        battery_item = db.query(QuoteItem).filter(
            QuoteItem.quote_id == quote.id,
            QuoteItem.description.like('%Battery%')
        ).first()
        
        if not battery_item:
            print("No battery item found in quote")
            return
        
        print(f"\nCurrent Battery Item:")
        print(f"  Description: {battery_item.description}")
        print(f"  Quantity: {battery_item.quantity}")
        print(f"  Unit Price: GH₵ {battery_item.unit_price:,.2f}")
        print(f"  Total: GH₵ {battery_item.total_price:,.2f}")
        
        # Calculate total kWh (assuming 5kWh batteries)
        total_kwh = battery_item.quantity * 5.0
        print(f"\n  Total Capacity: {total_kwh} kWh (assuming 5kWh per battery)")
        
        # Find 16kWh battery product
        battery_16kwh = db.query(Product).filter(
            Product.product_type == ProductType.BATTERY,
            Product.capacity_kwh == 16.0,
            Product.is_active == True
        ).first()
        
        if not battery_16kwh:
            print("\n❌ 16kWh battery product not found in database!")
            return
        
        print(f"\n16kWh Battery Product:")
        print(f"  Brand: {battery_16kwh.brand}")
        print(f"  Capacity: {battery_16kwh.capacity_kwh} kWh")
        print(f"  Price: GH₵ {battery_16kwh.base_price:,.2f}")
        
        # Calculate new quantity
        import math
        new_quantity = math.ceil(total_kwh / 16.0)
        new_unit_price = battery_16kwh.base_price
        new_total_price = new_unit_price * new_quantity
        
        print(f"\n📊 Calculation:")
        print(f"  {total_kwh} kWh ÷ 16 kWh = {new_quantity} batteries")
        print(f"  New Unit Price: GH₵ {new_unit_price:,.2f}")
        print(f"  New Total: GH₵ {new_total_price:,.2f}")
        print(f"  Savings: GH₵ {battery_item.total_price - new_total_price:,.2f}")
        
        # Update the battery item
        old_total = battery_item.total_price
        battery_item.description = f"{battery_16kwh.brand} {battery_16kwh.capacity_kwh}kWh Battery"
        battery_item.quantity = new_quantity
        battery_item.unit_price = new_unit_price
        battery_item.total_price = new_total_price
        battery_item.product_id = battery_16kwh.id
        
        # Update quote totals
        diff = new_total_price - old_total
        quote.equipment_subtotal += diff
        
        # Recalculate grand total
        subtotal = quote.equipment_subtotal + quote.services_subtotal
        tax_amount = subtotal * (quote.tax_percent / 100)
        discount_amount = subtotal * (quote.discount_percent / 100)
        quote.tax_amount = tax_amount
        quote.discount_amount = discount_amount
        quote.grand_total = subtotal + tax_amount - discount_amount
        
        db.commit()
        
        print(f"\n✅ Battery item updated successfully!")
        print(f"\nUpdated Quote Totals:")
        print(f"  Equipment Subtotal: GH₵ {quote.equipment_subtotal:,.2f}")
        print(f"  Services Subtotal: GH₵ {quote.services_subtotal:,.2f}")
        print(f"  Grand Total: GH₵ {quote.grand_total:,.2f}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    fix_battery_quote()






