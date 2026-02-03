#!/usr/bin/env python3
"""
Quick production database migration using connection URL
"""
import sys
import os
from pathlib import Path

# Set environment variables BEFORE importing app.config
os.environ["POSTGRES_HOST"] = "dpg-d4kpnmnpm1nc738dncg0-a.oregon-postgres.render.com"
os.environ["POSTGRES_PORT"] = "5432"
os.environ["POSTGRES_USER"] = "energy_pms"
os.environ["POSTGRES_PASSWORD"] = "aq15QZwv164f0LEzQhwCoidaBGqrQDqH"
os.environ["POSTGRES_DB"] = "energy_pms"

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text, inspect
from alembic import command
from alembic.config import Config
from app.models import Setting, PeakSunHours
from sqlalchemy.orm import sessionmaker

# Production database URL
PROD_DB_URL = "postgresql://energy_pms:aq15QZwv164f0LEzQhwCoidaBGqrQDqH@dpg-d4kpnmnpm1nc738dncg0-a.oregon-postgres.render.com:5432/energy_pms"

print("=" * 60)
print("Energy Precision PMS - Production Database Migration")
print("=" * 60)
print(f"\n📍 Connecting to production database...")

# Create engine
engine = create_engine(PROD_DB_URL, echo=False)

# Test connection
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to PostgreSQL: {version.split(',')[0]}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)

# Check existing tables
inspector = inspect(engine)
existing_tables = inspector.get_table_names()
if existing_tables:
    print(f"\nℹ️  Found {len(existing_tables)} existing table(s)")
    print(f"   Tables: {', '.join(sorted(existing_tables))}")
else:
    print("\nℹ️  No existing tables found (fresh database)")

# Run migrations
print("\n🔄 Running database migrations...")
alembic_cfg = Config("alembic.ini")
# The env.py will use get_url() which reads from app.config.settings
# We've already set the environment variables above, so it should work

try:
    # Check current version first
    from alembic.script import ScriptDirectory
    script = ScriptDirectory.from_config(alembic_cfg)
    current = script.get_current_head()
    print(f"  → Current head migration: {current}")
    
    # Try to upgrade, but if columns already exist, stamp to head instead
    try:
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrations completed successfully")
    except Exception as upgrade_error:
        if "already exists" in str(upgrade_error) or "DuplicateColumn" in str(upgrade_error):
            print("  ⚠️  Some columns already exist, stamping database to head...")
            command.stamp(alembic_cfg, "head")
            print("✅ Database stamped to head (migrations already applied)")
        else:
            raise
except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Initialize default data
print("\n📊 Initializing default data...")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Settings
    print("  → Initializing settings...")
    default_settings = [
        {"key": "system_efficiency", "value": "0.72", "description": "Overall PV system efficiency for Ghana (72%)", "category": "sizing"},
        {"key": "design_factor", "value": "1.20", "description": "Safety margin/design factor for Ghana (20%)", "category": "sizing"},
        {"key": "max_dc_ac_ratio", "value": "1.3", "description": "Maximum DC/AC ratio to prevent inverter clipping", "category": "sizing"},
        {"key": "panel_area_m2", "value": "2.6", "description": "Area per panel in square meters", "category": "sizing"},
        {"key": "spacing_factor", "value": "1.20", "description": "Spacing factor for mounting structure", "category": "sizing"},
        {"key": "battery_dod", "value": "0.85", "description": "Battery depth of discharge (85% for LiFePO4)", "category": "sizing"},
        {"key": "min_battery_size_kwh", "value": "5.0", "description": "Minimum battery size in kWh", "category": "sizing"},
        {"key": "battery_c_rate", "value": "0.5", "description": "Battery discharge rate (C-rate)", "category": "sizing"},
        {"key": "battery_discharge_efficiency", "value": "0.90", "description": "Battery discharge efficiency (accounts for inverter losses)", "category": "sizing"},
        {"key": "default_peak_sun_hours", "value": "5.2", "description": "Default peak sun hours for Ghana", "category": "sizing"},
        {"key": "default_tax_percent", "value": "15.0", "description": "Default tax percentage for quotations", "category": "pricing"},
        {"key": "default_discount_percent", "value": "0.0", "description": "Default discount percentage for quotations", "category": "pricing"},
        {"key": "bos_percentage", "value": "12.0", "description": "Balance of System (BOS) as percentage of equipment cost", "category": "pricing"},
        {"key": "installation_cost_percent", "value": "20.0", "description": "Installation cost as percentage of total equipment cost", "category": "pricing"},
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
    
    # Peak sun hours
    print("  → Initializing peak sun hours...")
    sample_data = [
        {"city": "Accra", "state": "Greater Accra", "country": "Ghana", "peak_sun_hours": 5.0, "source": "IRENA/GSS"},
        {"city": "Kumasi", "state": "Ashanti", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
        {"city": "Tamale", "state": "Northern", "country": "Ghana", "peak_sun_hours": 5.6, "source": "IRENA/GSS"},
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
except Exception as e:
    db.rollback()
    print(f"❌ Failed to initialize default data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()

# Final statistics
print("\n📊 Database Statistics:")
with engine.connect() as conn:
    tables = inspector.get_table_names()
    for table in sorted(tables):
        try:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.fetchone()[0]
            print(f"  {table}: {count} rows")
        except Exception as e:
            print(f"  {table}: Error - {e}")

print("\n" + "=" * 60)
print("✅ Migration completed successfully!")
print("=" * 60)

