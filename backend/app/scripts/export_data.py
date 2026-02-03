"""
Export data from local database to JSON files
Usage: python -m app.scripts.export_data
"""
import sys
import json
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Project, Appliance, SizingResult, Quote, QuoteItem, Product

def export_data():
    db: Session = SessionLocal()
    try:
        export_dir = Path(__file__).parent.parent.parent / "data_export"
        export_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Export Customers
        customers = db.query(Customer).all()
        customers_data = []
        for c in customers:
            customers_data.append({
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "address": c.address,
                "contact_person": c.contact_person,
            })
        
        # Export Projects
        projects = db.query(Project).all()
        projects_data = []
        for p in projects:
            projects_data.append({
                "reference": p.reference,
                "name": p.name,
                "customer_id": None,  # Will need to match by name/email
                "customer_name": p.customer.name if p.customer else None,
                "customer_email": p.customer.email if p.customer else None,
                "system_type": p.system_type.value if p.system_type else None,
                "status": p.status.value if p.status else None,
                "location": p.location,
                "monthly_consumption_kwh": p.monthly_consumption_kwh,
                "notes": p.notes,
            })
        
        # Export Appliances
        appliances = db.query(Appliance).all()
        appliances_data = []
        for a in appliances:
            appliances_data.append({
                "project_reference": a.project.reference if a.project else None,
                "category": a.category,
                "appliance_type": a.appliance_type,
                "description": a.description,
                "power_value": a.power_value,
                "power_unit": a.power_unit.value if a.power_unit else None,
                "quantity": a.quantity,
                "hours_per_day": a.hours_per_day,
                "is_essential": a.is_essential,
            })
        
        # Export Products
        products = db.query(Product).all()
        products_data = []
        for p in products:
            products_data.append({
                "name": p.name,
                "product_type": p.product_type.value if p.product_type else None,
                "price_type": p.price_type.value if p.price_type else None,
                "specifications": p.specifications,
                "unit_price": float(p.unit_price) if p.unit_price else None,
                "is_active": p.is_active,
            })
        
        # Save to files
        with open(export_dir / f"customers_{timestamp}.json", "w") as f:
            json.dump(customers_data, f, indent=2)
        
        with open(export_dir / f"projects_{timestamp}.json", "w") as f:
            json.dump(projects_data, f, indent=2)
        
        with open(export_dir / f"appliances_{timestamp}.json", "w") as f:
            json.dump(appliances_data, f, indent=2)
        
        with open(export_dir / f"products_{timestamp}.json", "w") as f:
            json.dump(products_data, f, indent=2)
        
        print(f"✓ Data exported to {export_dir}/")
        print(f"  - customers_{timestamp}.json ({len(customers_data)} customers)")
        print(f"  - projects_{timestamp}.json ({len(projects_data)} projects)")
        print(f"  - appliances_{timestamp}.json ({len(appliances_data)} appliances)")
        print(f"  - products_{timestamp}.json ({len(products_data)} products)")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    export_data()








