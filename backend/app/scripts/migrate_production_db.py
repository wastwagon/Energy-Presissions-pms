"""
Production Database Migration Script
Migrates local database schema and data to production PostgreSQL database.

Usage:
    python -m app.scripts.migrate_production_db

Environment Variables Required:
    PROD_POSTGRES_HOST - Production database host
    PROD_POSTGRES_PORT - Production database port (default: 5432)
    PROD_POSTGRES_USER - Production database user
    PROD_POSTGRES_PASSWORD - Production database password
    PROD_POSTGRES_DB - Production database name

Or pass as arguments:
    python -m app.scripts.migrate_production_db \
        --host <host> \
        --port <port> \
        --user <user> \
        --password <password> \
        --database <database>
"""
import sys
import os
import argparse
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session, sessionmaker
from alembic import command
from alembic.config import Config
from app.database import Base
from app.models import *
from app.scripts.init_db import init_settings, init_peak_sun_hours


def get_production_db_url(args=None):
    """Get production database URL from args or environment variables"""
    if args:
        host = args.host
        port = args.port or 5432
        user = args.user
        password = args.password
        database = args.database
    else:
        host = os.getenv("PROD_POSTGRES_HOST")
        port = os.getenv("PROD_POSTGRES_PORT", "5432")
        user = os.getenv("PROD_POSTGRES_USER")
        password = os.getenv("PROD_POSTGRES_PASSWORD")
        database = os.getenv("PROD_POSTGRES_DB")
    
    if not all([host, user, password, database]):
        raise ValueError(
            "Missing required database credentials. "
            "Provide via environment variables or command-line arguments."
        )
    
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


def test_connection(engine):
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


def check_existing_tables(engine):
    """Check if tables already exist"""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    return existing_tables


def run_migrations(prod_db_url):
    """Run Alembic migrations on production database"""
    print("\n🔄 Running database migrations...")
    
    # Create Alembic config
    alembic_cfg = Config("alembic.ini")
    
    # Override database URL
    alembic_cfg.set_main_option("sqlalchemy.url", prod_db_url)
    
    try:
        # Run migrations to head
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrations completed successfully")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False


def initialize_default_data(prod_db_url):
    """Initialize default settings and peak sun hours"""
    print("\n📊 Initializing default data...")
    
    engine = create_engine(prod_db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        from app.models import Setting, PeakSunHours
        
        # Initialize settings (will update existing if present)
        print("  → Initializing settings...")
        default_settings = [
            # Sizing factors - Ghana-specific optimized values
            {
                "key": "system_efficiency",
                "value": "0.72",
                "description": "Overall PV system efficiency for Ghana (72% - accounts for inverter ~95%, wiring ~98%, temperature losses ~5-8% in hot climate, soiling ~3-5% during Harmattan, mismatch ~2%)",
                "category": "sizing"
            },
            {
                "key": "design_factor",
                "value": "1.20",
                "description": "Safety margin/design factor for Ghana (20% over-sizing - accounts for hot climate, dust accumulation, and seasonal variations)",
                "category": "sizing"
            },
            {
                "key": "max_dc_ac_ratio",
                "value": "1.3",
                "description": "Maximum DC/AC ratio to prevent inverter clipping (standard for Ghana installations)",
                "category": "sizing"
            },
            {
                "key": "panel_area_m2",
                "value": "2.6",
                "description": "Area per panel in square meters (typical for 500-600W panels used in Ghana)",
                "category": "sizing"
            },
            {
                "key": "spacing_factor",
                "value": "1.20",
                "description": "Spacing factor for mounting structure (accounts for maintenance access and dust cleaning in Ghana)",
                "category": "sizing"
            },
            {
                "key": "battery_dod",
                "value": "0.85",
                "description": "Battery depth of discharge for modern lithium batteries in Ghana (85% for LiFePO4 batteries)",
                "category": "sizing"
            },
            {
                "key": "min_battery_size_kwh",
                "value": "5.0",
                "description": "Minimum battery size in kWh (standard for residential systems in Ghana)",
                "category": "sizing"
            },
            {
                "key": "battery_c_rate",
                "value": "0.5",
                "description": "Battery discharge rate (C-rate) - maximum power as fraction of capacity. 0.5C = battery can discharge 50% of capacity per hour (typical for LiFePO4). Affects power delivery capability.",
                "category": "sizing"
            },
            {
                "key": "battery_discharge_efficiency",
                "value": "0.90",
                "description": "Battery discharge efficiency - accounts for inverter losses when battery powers AC load. Battery (DC) → Inverter → Load (AC). Typical: 90-95% (inverter efficiency ~95% minus wiring losses).",
                "category": "sizing"
            },
            {
                "key": "default_peak_sun_hours",
                "value": "5.2",
                "description": "Default peak sun hours for Ghana (average 4.5-6.0 kWh/m²/day, using 5.2 as national average)",
                "category": "sizing"
            },
            {
                "key": "default_tax_percent",
                "value": "15.0",
                "description": "Default tax percentage for quotations (Ghana VAT: 12.5%)",
                "category": "pricing"
            },
            {
                "key": "default_discount_percent",
                "value": "0.0",
                "description": "Default discount percentage for quotations (applied to subtotal)",
                "category": "pricing"
            },
            {
                "key": "bos_percentage",
                "value": "12.0",
                "description": "Balance of System (BOS) as percentage of equipment cost for Ghana",
                "category": "pricing"
            },
            {
                "key": "installation_cost_percent",
                "value": "20.0",
                "description": "Installation cost as percentage of total equipment cost",
                "category": "pricing"
            },
        ]
        
        for setting_data in default_settings:
            existing = db.query(Setting).filter(Setting.key == setting_data["key"]).first()
            if existing:
                existing.value = setting_data["value"]
                existing.description = setting_data["description"]
                existing.category = setting_data["category"]
            else:
                setting = Setting(**setting_data)
                db.add(setting)
        
        print("  ✅ Settings initialized")
        
        # Initialize peak sun hours
        print("  → Initializing peak sun hours...")
        sample_data = [
            {"city": "Accra", "state": "Greater Accra", "country": "Ghana", "peak_sun_hours": 5.0, "source": "IRENA/GSS"},
            {"city": "Kumasi", "state": "Ashanti", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
            {"city": "Tamale", "state": "Northern", "country": "Ghana", "peak_sun_hours": 5.6, "source": "IRENA/GSS"},
            # Add more cities as needed
        ]
        
        for data in sample_data:
            existing = db.query(PeakSunHours).filter(
                PeakSunHours.city == data["city"],
                PeakSunHours.state == data["state"]
            ).first()
            if existing:
                existing.peak_sun_hours = data["peak_sun_hours"]
                existing.source = data.get("source", existing.source)
            else:
                psd = PeakSunHours(**data)
                db.add(psd)
        
        print("  ✅ Peak sun hours initialized")
        
        db.commit()
        print("✅ Default data initialized successfully")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to initialize default data: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def verify_schema(engine):
    """Verify that all expected tables exist"""
    print("\n🔍 Verifying database schema...")
    
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    
    # Expected tables from models
    expected_tables = {
        "users", "customers", "projects", "appliances",
        "sizing_results", "quotes", "quote_items", "products",
        "settings", "peak_sun_hours"
    }
    
    missing_tables = expected_tables - existing_tables
    extra_tables = existing_tables - expected_tables
    
    if missing_tables:
        print(f"⚠️  Missing tables: {missing_tables}")
        return False
    
    if extra_tables:
        print(f"ℹ️  Extra tables found (not an error): {extra_tables}")
    
    print("✅ All expected tables exist")
    return True


def get_table_counts(engine):
    """Get row counts for all tables"""
    print("\n📊 Database Statistics:")
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    with engine.connect() as conn:
        for table in sorted(tables):
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                print(f"  {table}: {count} rows")
            except Exception as e:
                print(f"  {table}: Error - {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Migrate database schema and data to production PostgreSQL"
    )
    parser.add_argument("--host", help="Production database host")
    parser.add_argument("--port", type=int, help="Production database port (default: 5432)")
    parser.add_argument("--user", help="Production database user")
    parser.add_argument("--password", help="Production database password")
    parser.add_argument("--database", help="Production database name")
    parser.add_argument("--skip-migrations", action="store_true", help="Skip running migrations")
    parser.add_argument("--skip-data", action="store_true", help="Skip initializing default data")
    parser.add_argument("--verify-only", action="store_true", help="Only verify connection and schema")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Energy Precision PMS - Production Database Migration")
    print("=" * 60)
    
    # Get production database URL
    try:
        prod_db_url = get_production_db_url(args)
        # Mask password in display
        display_url = prod_db_url.split("@")[0].split(":")[0] + ":***@" + prod_db_url.split("@")[1]
        print(f"\n📍 Target Database: {display_url}")
    except ValueError as e:
        print(f"\n❌ Error: {e}")
        print("\nUsage:")
        print("  Set environment variables:")
        print("    PROD_POSTGRES_HOST, PROD_POSTGRES_USER, PROD_POSTGRES_PASSWORD, PROD_POSTGRES_DB")
        print("\n  Or use command-line arguments:")
        print("    --host <host> --user <user> --password <password> --database <database>")
        sys.exit(1)
    
    # Create engine
    engine = create_engine(prod_db_url, echo=False)
    
    # Test connection
    if not test_connection(engine):
        print("\n❌ Cannot proceed without database connection")
        sys.exit(1)
    
    # Check existing tables
    existing_tables = check_existing_tables(engine)
    if existing_tables:
        print(f"\nℹ️  Found {len(existing_tables)} existing table(s)")
        print(f"   Tables: {', '.join(sorted(existing_tables))}")
    else:
        print("\nℹ️  No existing tables found (fresh database)")
    
    # Verify-only mode
    if args.verify_only:
        verify_schema(engine)
        get_table_counts(engine)
        print("\n✅ Verification complete")
        return
    
    # Confirm before proceeding
    if existing_tables:
        response = input("\n⚠️  WARNING: Database already has tables. Continue? (yes/no): ")
        if response.lower() != "yes":
            print("Migration cancelled")
            sys.exit(0)
    
    # Run migrations
    if not args.skip_migrations:
        if not run_migrations(prod_db_url):
            print("\n❌ Migration failed. Please review errors above.")
            sys.exit(1)
    else:
        print("\n⏭️  Skipping migrations (--skip-migrations)")
    
    # Verify schema
    if not verify_schema(engine):
        print("\n⚠️  Schema verification failed. Some tables may be missing.")
        response = input("Continue anyway? (yes/no): ")
        if response.lower() != "yes":
            sys.exit(1)
    
    # Initialize default data
    if not args.skip_data:
        if not initialize_default_data(prod_db_url):
            print("\n⚠️  Default data initialization had issues. Review above.")
            response = input("Continue? (yes/no): ")
            if response.lower() != "yes":
                sys.exit(1)
    else:
        print("\n⏭️  Skipping default data initialization (--skip-data)")
    
    # Final statistics
    get_table_counts(engine)
    
    print("\n" + "=" * 60)
    print("✅ Migration completed successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Update your application environment variables")
    print("  2. Test the application connection")
    print("  3. Verify all functionality")
    print("\n⚠️  Remember to:")
    print("  - Backup your production database regularly")
    print("  - Test migrations in staging first")
    print("  - Monitor application logs after deployment")


if __name__ == "__main__":
    main()

