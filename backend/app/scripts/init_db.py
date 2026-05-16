"""
Initialize database with default settings and sample data
Usage: python -m app.scripts.init_db
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Setting, PeakSunHours

# Create all tables
Base.metadata.create_all(bind=engine)


def init_settings():
    """Initialize default settings"""
    db: Session = SessionLocal()
    try:
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
                "key": "mounting_rail_length_m",
                "value": "5.4864",
                "description": "Standard rail stick length in metres (18 ft × 0.3048) for mounting rail quantity estimates",
                "category": "sizing"
            },
            {
                "key": "panel_module_aspect_ratio",
                "value": "1.93",
                "description": "Module length/width ratio (long ÷ short) used with panel_area_m2 to infer short edge for rail-span estimates (portrait layout)",
                "category": "sizing"
            },
            {
                "key": "mounting_rails_per_panel_rank",
                "value": "2.0",
                "description": "Parallel rail runs per horizontal panel rank (typically 2 for twin-rail systems)",
                "category": "sizing"
            },
            {
                "key": "mounting_rail_waste_factor",
                "value": "1.08",
                "description": "Multiplier on estimated linear rail metres for offcuts, stagger, and hardware margins (≥ 1.0)",
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
                "key": "temperature_derating_factor",
                "value": "0.92",
                "description": "Temperature derating factor for Ghana's hot climate (panels lose ~0.4-0.5% per °C above 25°C, average ambient 28-32°C)",
                "category": "sizing"
            },
            {
                "key": "soiling_loss_factor",
                "value": "0.96",
                "description": "Soiling loss factor for Ghana (3-4% average, higher during Harmattan season in northern regions)",
                "category": "sizing"
            },
            # Appliance factors - Ghana-specific
            {
                "key": "fridge_duty_cycle",
                "value": "0.65",
                "description": "Refrigerator duty cycle factor for Ghana (65% - higher due to frequent door opening in hot climate)",
                "category": "sizing"
            },
            {
                "key": "hp_to_watts_ac",
                "value": "900",
                "description": "HP to Watts conversion for AC units (1 HP = 900W)",
                "category": "sizing"
            },
            {
                "key": "hp_to_watts_motor",
                "value": "746",
                "description": "HP to Watts conversion for motors/pumps (1 HP = 746W)",
                "category": "sizing"
            },
            # Pricing settings - Ghana-specific
            {
                "key": "default_tax_percent",
                "value": "12.5",
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
                "key": "default_quote_validity_days",
                "value": "30",
                "description": "Default quotation validity period in days",
                "category": "pricing"
            },
            {
                "key": "use_bos_percentage",
                "value": "false",
                "description": "When false, quotes use itemized catalog BOM (cables, breakers, rails, etc.) instead of a lump-sum BOS % line. Set true only for legacy pricing.",
                "category": "pricing"
            },
            {
                "key": "bos_percentage",
                "value": "12.0",
                "description": "Legacy: BOS as % of equipment cost (only used when use_bos_percentage is true). Itemized BOM SKUs replace this for new quotes.",
                "category": "pricing"
            },
            {
                "key": "installation_cost_percent",
                "value": "20.0",
                "description": "Installation cost as % of core equipment (panels, inverter, battery, mounting; legacy BOS % if enabled). Typical range: 8-20% for Ghana.",
                "category": "pricing"
            },
            {
                "key": "transport_cost_fixed",
                "value": "1500",
                "description": "Fixed transport/logistics cost for Ghana (GH₵1,500 - includes delivery, handling, and local transport)",
                "category": "pricing"
            },
            {
                "key": "append_catalog_bom_on_quote",
                "value": "true",
                "description": "When true, creating a quote from sizing (hybrid/off-grid) appends standard BOM lines from catalog SKUs (cables, breakers, DBs, etc.) if those products exist. Set false to disable.",
                "category": "pricing"
            },
            {
                "key": "bom_clamps_per_panel",
                "value": "3.5",
                "description": "PV mid/end clamp multiplier per panel when bom_mounting_qty_model=legacy_per_panel (rail_span model ignores this).",
                "category": "pricing"
            },
            {
                "key": "bom_mounting_qty_model",
                "value": "rail_span",
                "description": "Mounting BOM math: 'rail_span' (2 rails per N panels, mid/end clamps per span) or 'legacy_per_panel' (bom_clamps_per_panel + old rail set / sizing sticks).",
                "category": "pricing"
            },
            {
                "key": "bom_panels_per_rail_span",
                "value": "5",
                "description": "Panels covered by one twin-rail span (rail pairs and clamp blocks scale with ceil(panels / this)).",
                "category": "pricing"
            },
            {
                "key": "bom_mid_clamps_per_rail_span",
                "value": "8",
                "description": "Mid clamps per rail-span block (used with bom_end_clamps_per_rail_span for total BOS-PV-CLAMP-EA qty).",
                "category": "pricing"
            },
            {
                "key": "bom_end_clamps_per_rail_span",
                "value": "4",
                "description": "End clamps per rail-span block (with mid clamps drives BOS-PV-CLAMP-EA when bom_clamp_count_model=discrete_spans).",
                "category": "pricing"
            },
            {
                "key": "bom_clamp_count_model",
                "value": "discrete_spans",
                "description": "Clamp BOM: 'discrete_spans' (mid+end = spans×(8+4), matches rail set count) or 'linear_panel' (rounded panels×rates, can disagree with spans).",
                "category": "pricing"
            },
            {
                "key": "bom_rail_sticks_per_rail_span",
                "value": "2",
                "description": "Rail sticks per span (typically 2 parallel rails) when bom_rail_pricing_mode=sticks.",
                "category": "pricing"
            },
            {
                "key": "panels_per_string",
                "value": "12",
                "description": "Modules per DC string for BOM (dc_string_count = ceil(panels / this)). Tune per module Voc and inverter MPPT.",
                "category": "pricing"
            },
            {
                "key": "module_isc_factor",
                "value": "1.25",
                "description": "OCPD sizing factor vs Isc (IEC 62548 planning reference; full Isc calc not automated yet).",
                "category": "pricing"
            },
            {
                "key": "bom_rail_pricing_mode",
                "value": "sets",
                "description": "Rail BOM: 'sets' (MNT-RAIL-SET-350, one per rail span) or 'sticks' (MNT-RAIL-18FT count from panel rail-span model when bom_mounting_qty_model=rail_span; else from sizing). Never both.",
                "category": "pricing"
            },
            {
                "key": "bom_explicit_consumables",
                "value": "true",
                "description": "When true, quote MC4, DC/AC isolators, earth kit, trunking, labels as separate lines (not only in misc kit).",
                "category": "pricing"
            },
            {
                "key": "bom_include_roof_hooks",
                "value": "false",
                "description": "When true, add BOS-ROOF-HOOK-EA (omit if rail set price already includes hooks).",
                "category": "pricing"
            },
            {
                "key": "bom_roof_hooks_per_panel",
                "value": "2",
                "description": "Roof hooks per panel when bom_include_roof_hooks is true.",
                "category": "pricing"
            },
            {
                "key": "bom_skip_changeover_grid_tied",
                "value": "true",
                "description": "When true, grid-tied quotes without backup omit PRT-CO-100A changeover.",
                "category": "pricing"
            },
            {
                "key": "maintenance_cost_annual",
                "value": "2000",
                "description": "Annual maintenance cost estimate for Ghana (GH₵2,000 - optional, can be added to quotes)",
                "category": "pricing"
            },
            # Other settings
            {
                "key": "company_name",
                "value": "Energy Precisions",
                "description": "Company name for quotations and reports",
                "category": "other"
            },
            {
                "key": "company_email",
                "value": "info@energyprecisions.com",
                "description": "Company contact email",
                "category": "other"
            },
            {
                "key": "company_phone",
                "value": "",
                "description": "Company contact phone number",
                "category": "other"
            },
            {
                "key": "company_address",
                "value": "",
                "description": "Company address for quotations",
                "category": "other"
            },
            # Bank details (shown on Proforma Invoice)
            {
                "key": "company_bank_name",
                "value": "",
                "description": "Bank name for Proforma Invoice payments",
                "category": "other"
            },
            {
                "key": "company_account_name",
                "value": "",
                "description": "Bank account name (beneficiary name)",
                "category": "other"
            },
            {
                "key": "company_account_number",
                "value": "",
                "description": "Bank account number for Proforma Invoice",
                "category": "other"
            },
            {
                "key": "company_bank_branch",
                "value": "",
                "description": "Bank branch (e.g. branch name or address)",
                "category": "other"
            },
            {
                "key": "company_swift_code",
                "value": "",
                "description": "SWIFT/BIC code (optional, for international transfers)",
                "category": "other"
            },
        ]
        
        for setting_data in default_settings:
            existing = db.query(Setting).filter(Setting.key == setting_data["key"]).first()
            if existing:
                # Update existing setting (description and value if needed)
                existing.description = setting_data.get("description", existing.description)
                # Only update value if it's not been manually changed (optional - you can remove this to always update)
                # existing.value = setting_data.get("value", existing.value)
            else:
                # Create new setting
                setting = Setting(**setting_data)
                db.add(setting)
        
        db.commit()
        print("Default settings initialized!")
    except Exception as e:
        print(f"Error initializing settings: {e}")
        db.rollback()
    finally:
        db.close()


def init_peak_sun_hours():
    """Initialize sample peak sun hours data"""
    db: Session = SessionLocal()
    try:
        sample_data = [
            # All 16 Regions of Ghana with accurate peak sun hours
            # Northern Regions (5.5-5.7 kWh/m²/day - highest solar irradiation)
            {"city": "Tamale", "state": "Northern", "country": "Ghana", "peak_sun_hours": 5.6, "source": "IRENA/GSS"},
            {"city": "Bolgatanga", "state": "Upper East", "country": "Ghana", "peak_sun_hours": 5.5, "source": "IRENA/GSS"},
            {"city": "Wa", "state": "Upper West", "country": "Ghana", "peak_sun_hours": 5.6, "source": "IRENA/GSS"},
            {"city": "Nalerigu", "state": "North East", "country": "Ghana", "peak_sun_hours": 5.7, "source": "IRENA/GSS"},
            {"city": "Damongo", "state": "Savannah", "country": "Ghana", "peak_sun_hours": 5.6, "source": "IRENA/GSS"},
            
            # Middle Belt Regions (5.0-5.3 kWh/m²/day - moderate solar irradiation)
            {"city": "Kumasi", "state": "Ashanti", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
            {"city": "Sunyani", "state": "Bono", "country": "Ghana", "peak_sun_hours": 5.2, "source": "IRENA/GSS"},
            {"city": "Techiman", "state": "Bono East", "country": "Ghana", "peak_sun_hours": 5.2, "source": "IRENA/GSS"},
            {"city": "Goaso", "state": "Ahafo", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
            {"city": "Koforidua", "state": "Eastern", "country": "Ghana", "peak_sun_hours": 5.0, "source": "IRENA/GSS"},
            {"city": "Ho", "state": "Volta", "country": "Ghana", "peak_sun_hours": 5.0, "source": "IRENA/GSS"},
            {"city": "Sefwi Wiawso", "state": "Western North", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
            {"city": "Dambai", "state": "Oti", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
            
            # Coastal Regions (4.8-5.2 kWh/m²/day - moderate solar irradiation)
            {"city": "Accra", "state": "Greater Accra", "country": "Ghana", "peak_sun_hours": 5.0, "source": "IRENA/GSS"},
            {"city": "Tema", "state": "Greater Accra", "country": "Ghana", "peak_sun_hours": 5.0, "source": "IRENA/GSS"},
            {"city": "Cape Coast", "state": "Central", "country": "Ghana", "peak_sun_hours": 4.9, "source": "IRENA/GSS"},
            {"city": "Takoradi", "state": "Western", "country": "Ghana", "peak_sun_hours": 4.8, "source": "IRENA/GSS"},
            {"city": "Sekondi", "state": "Western", "country": "Ghana", "peak_sun_hours": 4.8, "source": "IRENA/GSS"},
            
            # Additional major cities
            {"city": "Obuasi", "state": "Ashanti", "country": "Ghana", "peak_sun_hours": 5.1, "source": "IRENA/GSS"},
            {"city": "Tarkwa", "state": "Western", "country": "Ghana", "peak_sun_hours": 4.9, "source": "IRENA/GSS"},
            {"city": "Winneba", "state": "Central", "country": "Ghana", "peak_sun_hours": 4.9, "source": "IRENA/GSS"},
        ]
        
        # Remove USA entries (if any exist)
        usa_entries = db.query(PeakSunHours).filter(PeakSunHours.country == "USA").all()
        for entry in usa_entries:
            db.delete(entry)
        
        # Add/update Ghana cities
        for data in sample_data:
            existing = db.query(PeakSunHours).filter(
                PeakSunHours.city == data["city"],
                PeakSunHours.state == data["state"]
            ).first()
            if existing:
                # Update existing entry
                existing.peak_sun_hours = data["peak_sun_hours"]
                existing.source = data.get("source", existing.source)
            else:
                # Create new entry
                psd = PeakSunHours(**data)
                db.add(psd)
        
        db.commit()
        print("Peak sun hours data initialized! (Ghana cities only)")
    except Exception as e:
        print(f"Error initializing peak sun hours: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_settings()
    init_peak_sun_hours()
    print("Database initialization complete!")

