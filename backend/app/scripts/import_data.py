"""
Import data from JSON files to production database
Usage: python -m app.scripts.import_data <path_to_json_file>
"""
import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Project, Appliance, Product
from app.schemas import SystemType, ProjectStatus, PowerUnit, ProductType, PriceType

def import_data(json_file_path: str):
    db: Session = SessionLocal()
    try:
        file_path = Path(json_file_path)
        if not file_path.exists():
            print(f"Error: File not found: {json_file_path}")
            return
        
        with open(file_path, "r") as f:
            data = json.load(f)
        
        file_name = file_path.stem.lower()
        
        if "customer" in file_name:
            import_customers(db, data)
        elif "project" in file_name:
            import_projects(db, data)
        elif "appliance" in file_name:
            import_appliances(db, data)
        elif "product" in file_name:
            import_products(db, data)
        else:
            print(f"Error: Unknown file type. Expected: customers, projects, appliances, or products")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def import_customers(db: Session, data: list):
    """Import customers"""
    imported = 0
    skipped = 0
    
    for item in data:
        # Check if customer already exists
        existing = db.query(Customer).filter(Customer.email == item.get("email")).first()
        if existing:
            print(f"  Skipping customer (already exists): {item.get('email')}")
            skipped += 1
            continue
        
        customer = Customer(
            name=item["name"],
            email=item.get("email"),
            phone=item.get("phone"),
            address=item.get("address"),
            contact_person=item.get("contact_person"),
        )
        db.add(customer)
        imported += 1
    
    db.commit()
    print(f"✓ Imported {imported} customers, skipped {skipped}")

def import_projects(db: Session, data: list):
    """Import projects"""
    imported = 0
    skipped = 0
    
    for item in data:
        # Check if project already exists
        existing = db.query(Project).filter(Project.reference == item.get("reference")).first()
        if existing:
            print(f"  Skipping project (already exists): {item.get('reference')}")
            skipped += 1
            continue
        
        # Find customer
        customer = None
        if item.get("customer_email"):
            customer = db.query(Customer).filter(Customer.email == item["customer_email"]).first()
        elif item.get("customer_name"):
            customer = db.query(Customer).filter(Customer.name == item["customer_name"]).first()
        
        if not customer:
            print(f"  Warning: Customer not found for project {item.get('reference')}, skipping")
            skipped += 1
            continue
        
        project = Project(
            reference=item["reference"],
            name=item["name"],
            customer_id=customer.id,
            system_type=SystemType(item["system_type"]) if item.get("system_type") else None,
            status=ProjectStatus(item["status"]) if item.get("status") else ProjectStatus.DRAFT,
            location=item.get("location"),
            monthly_consumption_kwh=item.get("monthly_consumption_kwh"),
            notes=item.get("notes"),
        )
        db.add(project)
        imported += 1
    
    db.commit()
    print(f"✓ Imported {imported} projects, skipped {skipped}")

def import_appliances(db: Session, data: list):
    """Import appliances"""
    imported = 0
    skipped = 0
    
    for item in data:
        # Find project
        project = None
        if item.get("project_reference"):
            project = db.query(Project).filter(Project.reference == item["project_reference"]).first()
        
        if not project:
            print(f"  Warning: Project not found for appliance, skipping")
            skipped += 1
            continue
        
        appliance = Appliance(
            project_id=project.id,
            category=item.get("category"),
            appliance_type=item.get("appliance_type"),
            description=item.get("description"),
            power_value=item.get("power_value"),
            power_unit=PowerUnit(item["power_unit"]) if item.get("power_unit") else PowerUnit.WATTS,
            quantity=item.get("quantity", 1),
            hours_per_day=item.get("hours_per_day", 0),
            is_essential=item.get("is_essential", False),
        )
        db.add(appliance)
        imported += 1
    
    db.commit()
    print(f"✓ Imported {imported} appliances, skipped {skipped}")

def import_products(db: Session, data: list):
    """Import products"""
    imported = 0
    skipped = 0
    
    for item in data:
        # Check if product already exists
        existing = db.query(Product).filter(Product.name == item.get("name")).first()
        if existing:
            print(f"  Skipping product (already exists): {item.get('name')}")
            skipped += 1
            continue
        
        product = Product(
            name=item["name"],
            product_type=ProductType(item["product_type"]) if item.get("product_type") else None,
            price_type=PriceType(item["price_type"]) if item.get("price_type") else None,
            specifications=item.get("specifications"),
            unit_price=item.get("unit_price"),
            is_active=item.get("is_active", True),
        )
        db.add(product)
        imported += 1
    
    db.commit()
    print(f"✓ Imported {imported} products, skipped {skipped}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.scripts.import_data <path_to_json_file>")
        sys.exit(1)
    
    import_data(sys.argv[1])








