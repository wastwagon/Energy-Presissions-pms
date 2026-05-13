#!/usr/bin/env python3
"""
Migrate PMS data from a local database to a production (or staging) database.

Requires:
  PROD_DATABASE_URL — full PostgreSQL URL for the target database (never commit this).

Optional:
  LOCAL_DATABASE_URL — source database (default: docker-compose service hostname).
  LOCAL_DATABASE_URL_FALLBACK — second URL to try if the first fails (default: localhost).

Example:
  export PROD_DATABASE_URL='postgresql://user:pass@host:5432/dbname?sslmode=require'
  python migrate_data_to_prod.py
"""
import sys
import os
from pathlib import Path

# Add app to path before imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import (
    Customer,
    Project,
    Appliance,
    SizingResult,
    Quote,
    QuoteItem,
    QuoteOption,
    Product,
    User,
    UserRole,
)


def _normalize_url(url: str) -> str:
    u = url.strip()
    if u.startswith("postgres://"):
        u = u.replace("postgres://", "postgresql://", 1)
    return u


PROD_DB_URL = _normalize_url(os.environ.get("PROD_DATABASE_URL", ""))
if not PROD_DB_URL:
    print(
        "ERROR: Set PROD_DATABASE_URL to the target PostgreSQL URL.\n"
        "Example: export PROD_DATABASE_URL='postgresql://user:pass@host:5432/dbname?sslmode=require'",
        file=sys.stderr,
    )
    sys.exit(1)

LOCAL_DB_URL = _normalize_url(
    os.environ.get(
        "LOCAL_DATABASE_URL",
        "postgresql://energy_pms:changeme@db:5432/energy_pms",
    )
)
LOCAL_DB_URL_FALLBACK = _normalize_url(
    os.environ.get(
        "LOCAL_DATABASE_URL_FALLBACK",
        "postgresql://energy_pms:changeme@localhost:5432/energy_pms",
    )
)

print("=" * 60)
print("Energy Precision PMS - Data Migration to Production")
print("=" * 60)

# Create engines
print("\n📍 Connecting to databases...")
# Try Docker network first, then fallback to localhost
local_engine = None
try:
    local_engine = create_engine(LOCAL_DB_URL, echo=False)
    with local_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Connected to local database via Docker network")
except Exception as e:
    print(f"⚠️  Docker network connection failed, trying localhost...")
    try:
        local_engine = create_engine(LOCAL_DB_URL_FALLBACK, echo=False)
        with local_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Connected to local database via localhost")
    except Exception as e2:
        print(f"❌ Local database connection failed: {e2}")
        print("\n💡 Make sure your local Docker database is running:")
        print("   docker-compose up -d db")
        sys.exit(1)

prod_engine = create_engine(PROD_DB_URL, echo=False)

# Test connections
try:
    with local_engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM customers"))
        local_customers = result.fetchone()[0]
        result = conn.execute(text("SELECT COUNT(*) FROM projects"))
        local_projects = result.fetchone()[0]
    print(f"✅ Local database: {local_customers} customers, {local_projects} projects")
except Exception as e:
    print(f"❌ Local database query failed: {e}")
    sys.exit(1)

try:
    with prod_engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM customers"))
        prod_customers = result.fetchone()[0]
        result = conn.execute(text("SELECT COUNT(*) FROM projects"))
        prod_projects = result.fetchone()[0]
    print(f"✅ Production database: {prod_customers} customers, {prod_projects} projects")
except Exception as e:
    print(f"❌ Production database connection failed: {e}")
    sys.exit(1)

# Create sessions
LocalSession = sessionmaker(bind=local_engine)
ProdSession = sessionmaker(bind=prod_engine)

local_db = LocalSession()
prod_db = ProdSession()

try:
    # 1. Export and Import Customers
    print("\n📦 Step 1: Migrating Customers...")
    local_customers = local_db.query(Customer).all()
    imported_customers = 0
    customer_id_map = {}  # Map old IDs to new IDs
    
    for local_customer in local_customers:
        # Check if customer already exists in production
        existing = prod_db.query(Customer).filter(
            Customer.email == local_customer.email
        ).first()
        
        if existing:
            print(f"  ⏭️  Customer already exists: {local_customer.name} ({local_customer.email})")
            customer_id_map[local_customer.id] = existing.id
            continue
        
        # Create new customer
        new_customer = Customer(
            name=local_customer.name,
            phone=local_customer.phone,
            email=local_customer.email,
            address=local_customer.address,
            city=local_customer.city,
            country=local_customer.country,
            customer_type=local_customer.customer_type,
            notes=local_customer.notes,
        )
        prod_db.add(new_customer)
        prod_db.flush()  # Get the new ID
        customer_id_map[local_customer.id] = new_customer.id
        imported_customers += 1
        print(f"  ✅ Imported: {local_customer.name}")
    
    prod_db.commit()
    print(f"✅ Imported {imported_customers} customers")

    admin_user = prod_db.query(User).filter(User.role == UserRole.ADMIN).first()
    if not admin_user:
        print("❌ No admin user in production. Create one before migrating projects or quotes.")
        sys.exit(1)

    # 2. Export and Import Projects
    print("\n📦 Step 2: Migrating Projects...")
    local_projects = local_db.query(Project).all()
    imported_projects = 0
    project_id_map = {}  # Map old IDs to new IDs
    
    for local_project in local_projects:
        # Check if project already exists
        existing = prod_db.query(Project).filter(
            Project.reference_code == local_project.reference_code
        ).first()
        
        if existing:
            print(f"  ⏭️  Project already exists: {local_project.reference_code}")
            project_id_map[local_project.id] = existing.id
            continue
        
        # Get new customer ID
        new_customer_id = customer_id_map.get(local_project.customer_id)
        if not new_customer_id:
            print(f"  ⚠️  Customer not found for project {local_project.reference_code}, skipping")
            continue

        # Create new project
        new_project = Project(
            customer_id=new_customer_id,
            name=local_project.name,
            reference_code=local_project.reference_code,
            system_type=local_project.system_type,
            status=local_project.status,
            created_by=admin_user.id,
        )
        prod_db.add(new_project)
        prod_db.flush()
        project_id_map[local_project.id] = new_project.id
        imported_projects += 1
        print(f"  ✅ Imported: {local_project.reference_code} - {local_project.name}")
    
    prod_db.commit()
    print(f"✅ Imported {imported_projects} projects")
    
    # 3. Export and Import Appliances
    print("\n📦 Step 3: Migrating Appliances...")
    local_appliances = local_db.query(Appliance).all()
    imported_appliances = 0
    
    for local_appliance in local_appliances:
        new_project_id = project_id_map.get(local_appliance.project_id)
        if not new_project_id:
            continue
        
        # Create new appliance
        new_appliance = Appliance(
            project_id=new_project_id,
            category=local_appliance.category,
            appliance_type=local_appliance.appliance_type,
            description=local_appliance.description,
            power_value=local_appliance.power_value,
            power_unit=local_appliance.power_unit,
            quantity=local_appliance.quantity,
            hours_per_day=local_appliance.hours_per_day,
            is_essential=local_appliance.is_essential,
            daily_kwh=local_appliance.daily_kwh,
        )
        prod_db.add(new_appliance)
        imported_appliances += 1
    
    prod_db.commit()
    print(f"✅ Imported {imported_appliances} appliances")
    
    # 4. Export and Import Sizing Results
    print("\n📦 Step 4: Migrating Sizing Results...")
    local_sizings = local_db.query(SizingResult).all()
    imported_sizings = 0
    
    for local_sizing in local_sizings:
        new_project_id = project_id_map.get(local_sizing.project_id)
        if not new_project_id:
            continue
        
        # Check if sizing already exists
        existing = prod_db.query(SizingResult).filter(
            SizingResult.project_id == new_project_id
        ).first()
        
        if existing:
            continue
        
        # Create new sizing result
        new_sizing = SizingResult(
            project_id=new_project_id,
            total_daily_kwh=local_sizing.total_daily_kwh,
            location=local_sizing.location,
            peak_sun_hours=local_sizing.peak_sun_hours,
            panel_brand=local_sizing.panel_brand,
            panel_wattage=local_sizing.panel_wattage,
            backup_hours=local_sizing.backup_hours,
            essential_load_percent=local_sizing.essential_load_percent,
            effective_daily_kwh=local_sizing.effective_daily_kwh,
            system_size_kw=local_sizing.system_size_kw,
            number_of_panels=local_sizing.number_of_panels,
            roof_area_m2=local_sizing.roof_area_m2,
            inverter_size_kw=local_sizing.inverter_size_kw,
            battery_capacity_kwh=local_sizing.battery_capacity_kwh,
            system_efficiency=local_sizing.system_efficiency,
            dc_ac_ratio=local_sizing.dc_ac_ratio,
            design_factor=local_sizing.design_factor,
        )
        prod_db.add(new_sizing)
        imported_sizings += 1
    
    prod_db.commit()
    print(f"✅ Imported {imported_sizings} sizing results")
    
    # 5. Export and Import Products (BEFORE quotes, since quote items reference products)
    print("\n📦 Step 5: Migrating Products...")
    local_products = local_db.query(Product).all()
    imported_products = 0
    product_id_map = {}  # Map old IDs to new IDs
    
    for local_product in local_products:
        # Check if product already exists
        existing = prod_db.query(Product).filter(
            Product.brand == local_product.brand,
            Product.model == local_product.model,
            Product.product_type == local_product.product_type
        ).first()
        
        if existing:
            product_id_map[local_product.id] = existing.id
            continue
        
        # Create new product
        new_product = Product(
            product_type=local_product.product_type,
            brand=local_product.brand,
            model=local_product.model,
            wattage=local_product.wattage,
            capacity_kw=local_product.capacity_kw,
            capacity_kwh=local_product.capacity_kwh,
            price_type=local_product.price_type,
            base_price=local_product.base_price,
            is_active=local_product.is_active,
        )
        prod_db.add(new_product)
        prod_db.flush()  # Get the new ID
        product_id_map[local_product.id] = new_product.id
        imported_products += 1
        print(f"  ✅ Imported: {local_product.brand} {local_product.model}")
    
    prod_db.commit()
    print(f"✅ Imported {imported_products} products")
    
    # 6. Export and Import Quotes
    print("\n📦 Step 6: Migrating Quotes...")
    local_quotes = local_db.query(Quote).all()
    imported_quotes = 0
    quote_id_map = {}  # Map old IDs to new IDs
    
    for local_quote in local_quotes:
        new_project_id = project_id_map.get(local_quote.project_id)
        if not new_project_id:
            continue
        
        # Check if quote already exists
        existing = prod_db.query(Quote).filter(
            Quote.quote_number == local_quote.quote_number
        ).first()
        
        if existing:
            quote_id_map[local_quote.id] = existing.id
            continue
        
        # Create new quote
        new_quote = Quote(
            project_id=new_project_id,
            quote_number=local_quote.quote_number,
            status=local_quote.status,
            created_by=admin_user.id,
            equipment_subtotal=local_quote.equipment_subtotal,
            services_subtotal=local_quote.services_subtotal,
            tax_percent=local_quote.tax_percent,
            tax_amount=local_quote.tax_amount,
            discount_percent=local_quote.discount_percent,
            discount_amount=local_quote.discount_amount,
            grand_total=local_quote.grand_total,
            validity_days=local_quote.validity_days,
            payment_terms=local_quote.payment_terms,
            notes=local_quote.notes,
        )
        prod_db.add(new_quote)
        prod_db.flush()
        prod_db.add(QuoteOption(quote_id=new_quote.id, title="Option 1", sort_order=0))
        quote_id_map[local_quote.id] = new_quote.id
        imported_quotes += 1
        print(f"  ✅ Imported: {local_quote.quote_number}")
    
    prod_db.commit()
    print(f"✅ Imported {imported_quotes} quotes")
    
    # 7. Export and Import Quote Items
    print("\n📦 Step 7: Migrating Quote Items...")
    local_quote_items = local_db.query(QuoteItem).all()
    imported_items = 0
    
    for local_item in local_quote_items:
        new_quote_id = quote_id_map.get(local_item.quote_id)
        if not new_quote_id:
            continue
        
        # Map product_id if it exists
        new_product_id = None
        if local_item.product_id:
            new_product_id = product_id_map.get(local_item.product_id)
            if not new_product_id:
                print(f"  ⚠️  Product ID {local_item.product_id} not found, setting to NULL")
        
        opt_row = (
            prod_db.query(QuoteOption)
            .filter(QuoteOption.quote_id == new_quote_id)
            .order_by(QuoteOption.sort_order, QuoteOption.id)
            .first()
        )
        if not opt_row:
            opt_row = QuoteOption(quote_id=new_quote_id, title="Option 1", sort_order=0)
            prod_db.add(opt_row)
            prod_db.flush()

        # Create new quote item
        new_item = QuoteItem(
            quote_id=new_quote_id,
            quote_option_id=opt_row.id,
            product_id=new_product_id,  # Use mapped product ID or None
            description=local_item.description,
            quantity=local_item.quantity,
            unit_price=local_item.unit_price,
            total_price=local_item.total_price,
            is_custom=local_item.is_custom,
            sort_order=local_item.sort_order,
        )
        prod_db.add(new_item)
        imported_items += 1
    
    prod_db.commit()
    print(f"✅ Imported {imported_items} quote items")
    
    # Final statistics
    print("\n" + "=" * 60)
    print("✅ Data Migration Completed Successfully!")
    print("=" * 60)
    
    with prod_engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM customers"))
        print(f"  Customers: {result.fetchone()[0]}")
        result = conn.execute(text("SELECT COUNT(*) FROM projects"))
        print(f"  Projects: {result.fetchone()[0]}")
        result = conn.execute(text("SELECT COUNT(*) FROM appliances"))
        print(f"  Appliances: {result.fetchone()[0]}")
        result = conn.execute(text("SELECT COUNT(*) FROM sizing_results"))
        print(f"  Sizing Results: {result.fetchone()[0]}")
        result = conn.execute(text("SELECT COUNT(*) FROM quotes"))
        print(f"  Quotes: {result.fetchone()[0]}")
        result = conn.execute(text("SELECT COUNT(*) FROM quote_items"))
        print(f"  Quote Items: {result.fetchone()[0]}")
        result = conn.execute(text("SELECT COUNT(*) FROM products"))
        print(f"  Products: {result.fetchone()[0]}")

except Exception as e:
    prod_db.rollback()
    print(f"\n❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    local_db.close()
    prod_db.close()

