#!/usr/bin/env python3
"""
Regenerate quote items for Kofi Oppong project based on updated sizing
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models import Project, Quote, QuoteItem, QuoteOption, SizingResult, Product, ProductType
from app.services.pricing import generate_quote_items_from_sizing
from app.services.quote_totals import refresh_quote_header_totals
from sqlalchemy.orm import joinedload

def regenerate_quote():
    db = SessionLocal()
    try:
        # Get project
        project = db.query(Project).filter(Project.name.ilike('%Solaris%')).first()
        if not project:
            print("✗ Project not found")
            return False
        
        print(f"Project: {project.name}")
        print(f"Customer: {project.customer.name}\n")
        
        # Get sizing
        sizing = db.query(SizingResult).filter(SizingResult.project_id == project.id).first()
        if not sizing:
            print("✗ Sizing result not found")
            return False
        
        print(f"Sizing:")
        print(f"  System Size: {sizing.system_size_kw:.2f} kW")
        print(f"  Panels: {sizing.number_of_panels} × {sizing.panel_wattage}W ({sizing.panel_brand})")
        print(f"  Inverter: {sizing.inverter_size_kw:.2f} kW")
        if sizing.battery_capacity_kwh:
            print(f"  Battery: {sizing.battery_capacity_kwh:.2f} kWh")
        print()
        
        # Get quote
        quote = db.query(Quote).options(joinedload(Quote.items), joinedload(Quote.options)).filter(Quote.project_id == project.id).first()
        if not quote:
            print("✗ Quote not found")
            return False
        
        print(f"Quote: {quote.quote_number}")
        print(f"Current items: {len(quote.items)}\n")
        
        # Delete existing items
        for item in quote.items:
            db.delete(item)
        db.flush()
        print("✓ Deleted existing quote items\n")
        
        opt = (
            db.query(QuoteOption)
            .filter(QuoteOption.quote_id == quote.id)
            .order_by(QuoteOption.sort_order, QuoteOption.id)
            .first()
        )
        if not opt:
            print("✗ No quote option row — run DB migration")
            return False

        # Generate new items from sizing
        print("Generating new quote items from sizing...")
        items = generate_quote_items_from_sizing(db, sizing, quote.id, opt.id)
        
        for item in items:
            db.add(item)
        
        db.flush()

        refresh_quote_header_totals(db, quote.id)
        db.commit()
        
        print(f"✓ Generated {len(items)} quote items\n")
        print("NEW QUOTE ITEMS:")
        print("=" * 70)
        for item in sorted(items, key=lambda x: x.sort_order or 0):
            print(f"  {item.description}")
            print(f"    {item.quantity} × GH₵ {item.unit_price:,.2f} = GH₵ {item.total_price:,.2f}")
            print()
        
        print("TOTALS:")
        print(f"  Equipment Subtotal: GH₵ {quote.equipment_subtotal:,.2f}")
        print(f"  Services Subtotal: GH₵ {quote.services_subtotal:,.2f}")
        print(f"  Grand Total: GH₵ {quote.grand_total:,.2f}")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = regenerate_quote()
    sys.exit(0 if success else 1)






