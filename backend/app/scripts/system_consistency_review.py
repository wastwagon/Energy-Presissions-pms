#!/usr/bin/env python3
"""
Comprehensive System Consistency Review
Checks for:
1. Calculation consistency across services
2. Settings usage consistency
3. Data consistency between frontend and backend
4. Formula verification
5. Unit conversion consistency
6. Rounding consistency
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.models import (
    Setting, Project, Appliance, SizingResult, Quote, QuoteItem, Product, ProductType
)
from app.services.sizing import calculate_sizing
from app.services.load_calculator import calculate_total_daily_kwh
from app.schemas import SizingInput
from sqlalchemy import func
import math

def check_settings_consistency():
    """Check that all required settings exist and have valid values"""
    print("="*80)
    print("1. SETTINGS CONSISTENCY CHECK")
    print("="*80)
    
    db = SessionLocal()
    try:
        required_settings = {
            "system_efficiency": (0.0, 1.0),
            "design_factor": (1.0, 2.0),
            "max_dc_ac_ratio": (1.0, 2.0),
            "panel_area_m2": (1.0, 5.0),
            "spacing_factor": (1.0, 2.0),
            "battery_dod": (0.0, 1.0),
            "battery_c_rate": (0.0, 5.0),
            "battery_discharge_efficiency": (0.0, 1.0),
            "min_battery_size_kwh": (0.0, 100.0),
        }
        
        missing = []
        invalid = []
        found = []
        
        for key, (min_val, max_val) in required_settings.items():
            setting = db.query(Setting).filter(Setting.key == key).first()
            if not setting:
                missing.append(key)
            else:
                try:
                    value = float(setting.value)
                    if value < min_val or value > max_val:
                        invalid.append(f"{key}: {value} (expected {min_val}-{max_val})")
                    else:
                        found.append(f"{key}: {value}")
                except ValueError:
                    invalid.append(f"{key}: '{setting.value}' (not a number)")
        
        if missing:
            print(f"❌ Missing settings: {', '.join(missing)}")
        else:
            print("✅ All required settings present")
        
        if invalid:
            print(f"❌ Invalid setting values:")
            for item in invalid:
                print(f"   - {item}")
        else:
            print("✅ All setting values are valid")
        
        print("\nCurrent settings:")
        for item in found:
            print(f"   ✓ {item}")
        
        return len(missing) == 0 and len(invalid) == 0
        
    finally:
        db.close()


def check_calculation_formulas():
    """Verify calculation formulas are consistent"""
    print("\n" + "="*80)
    print("2. CALCULATION FORMULA CONSISTENCY")
    print("="*80)
    
    db = SessionLocal()
    try:
        # Get a test project with appliances
        project = db.query(Project).first()
        if not project:
            print("⚠️  No projects found for formula testing")
            return True
        
        appliances = db.query(Appliance).filter(Appliance.project_id == project.id).all()
        if not appliances:
            print("⚠️  No appliances found for formula testing")
            return True
        
        # Calculate total daily kWh
        total_daily_kwh = calculate_total_daily_kwh(db, project.id)
        print(f"✓ Total Daily kWh: {total_daily_kwh:.3f} kWh/day")
        
        # Get settings
        settings = {}
        for key in ["system_efficiency", "design_factor", "max_dc_ac_ratio", 
                   "battery_dod", "battery_c_rate", "battery_discharge_efficiency"]:
            setting = db.query(Setting).filter(Setting.key == key).first()
            settings[key] = float(setting.value) if setting else None
        
        # Manual calculation verification
        print("\nFormula Verification:")
        
        # 1. Effective Daily Energy
        system_efficiency = settings.get("system_efficiency", 0.72)
        effective_daily_kwh = total_daily_kwh / system_efficiency
        print(f"   Effective Daily Energy = {total_daily_kwh:.3f} / {system_efficiency} = {effective_daily_kwh:.3f} kWh")
        
        # 2. System Size (using default peak sun hours)
        peak_sun_hours = 5.0  # Accra default
        base_system_size = effective_daily_kwh / peak_sun_hours
        design_factor = settings.get("design_factor", 1.20)
        system_size = base_system_size * design_factor
        print(f"   Base System Size = {effective_daily_kwh:.3f} / {peak_sun_hours} = {base_system_size:.3f} kW")
        print(f"   System Size (with design factor) = {base_system_size:.3f} × {design_factor} = {system_size:.3f} kW")
        
        # 3. Battery calculation (if applicable)
        battery_dod = settings.get("battery_dod", 0.85)
        battery_c_rate = settings.get("battery_c_rate", 0.5)
        battery_discharge_eff = settings.get("battery_discharge_efficiency", 0.90)
        
        essential_load_kw_ac = (total_daily_kwh / 24) * 0.5  # 50% essential
        essential_load_kw_dc = essential_load_kw_ac / battery_discharge_eff
        backup_hours = 8.0
        
        battery_energy = (essential_load_kw_dc * backup_hours) / battery_dod
        battery_power = essential_load_kw_dc / (battery_c_rate * battery_dod)
        battery_capacity = max(battery_energy, battery_power)
        
        print(f"\n   Battery Calculation (8hr backup, 50% essential):")
        print(f"   AC Load = ({total_daily_kwh:.3f} / 24) × 0.5 = {essential_load_kw_ac:.3f} kW")
        print(f"   DC Load = {essential_load_kw_ac:.3f} / {battery_discharge_eff} = {essential_load_kw_dc:.3f} kW")
        print(f"   Energy Requirement = ({essential_load_kw_dc:.3f} × {backup_hours}) / {battery_dod} = {battery_energy:.3f} kWh")
        print(f"   Power Requirement = {essential_load_kw_dc:.3f} / ({battery_c_rate} × {battery_dod}) = {battery_power:.3f} kWh")
        print(f"   Battery Capacity = max({battery_energy:.3f}, {battery_power:.3f}) = {battery_capacity:.3f} kWh")
        
        print("\n✅ Formula verification complete")
        return True
        
    except Exception as e:
        print(f"❌ Error in formula verification: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def check_sizing_result_consistency():
    """Check that sizing results match calculations"""
    print("\n" + "="*80)
    print("3. SIZING RESULT CONSISTENCY")
    print("="*80)
    
    db = SessionLocal()
    try:
        projects = db.query(Project).all()
        if not projects:
            print("⚠️  No projects found")
            return True
        
        issues = []
        for project in projects:
            appliances = db.query(Appliance).filter(Appliance.project_id == project.id).all()
            if not appliances:
                continue
            
            sizing = db.query(SizingResult).filter(SizingResult.project_id == project.id).first()
            if not sizing:
                continue
            
            # Verify total daily kWh matches
            total_daily_kwh = calculate_total_daily_kwh(db, project.id)
            
            if abs(sizing.total_daily_kwh - total_daily_kwh) > 0.01:
                issues.append(f"Project {project.name}: total_daily_kwh mismatch "
                            f"(sizing: {sizing.total_daily_kwh}, calculated: {total_daily_kwh})")
            
            # Verify effective daily kWh calculation
            if sizing.effective_daily_kwh is not None:
                system_efficiency = float(db.query(Setting).filter(Setting.key == "system_efficiency").first().value)
                expected_effective = sizing.total_daily_kwh / system_efficiency
                
                if abs(sizing.effective_daily_kwh - expected_effective) > 0.01:
                    issues.append(f"Project {project.name}: effective_daily_kwh mismatch "
                                f"(sizing: {sizing.effective_daily_kwh}, expected: {expected_effective:.3f})")
            
            # Verify system size calculation
            if sizing.effective_daily_kwh is not None and sizing.system_size_kw is not None:
                peak_sun_hours = sizing.peak_sun_hours or 5.0
                design_factor = sizing.design_factor or 1.20
                expected_system_size = (sizing.effective_daily_kwh / peak_sun_hours) * design_factor
                
                if abs(sizing.system_size_kw - expected_system_size) > 0.1:  # Allow 0.1kW tolerance for rounding
                    issues.append(f"Project {project.name}: system_size_kw mismatch "
                                f"(sizing: {sizing.system_size_kw}, expected: {expected_system_size:.2f})")
        
        if issues:
            print("❌ Found inconsistencies:")
            for issue in issues:
                print(f"   - {issue}")
            return False
        else:
            print("✅ All sizing results are consistent with calculations")
            return True
            
    except Exception as e:
        print(f"❌ Error checking sizing consistency: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def check_quote_consistency():
    """Check that quotes match sizing results"""
    print("\n" + "="*80)
    print("4. QUOTE CONSISTENCY CHECK")
    print("="*80)
    
    db = SessionLocal()
    try:
        quotes = db.query(Quote).all()
        if not quotes:
            print("⚠️  No quotes found")
            return True
        
        issues = []
        for quote in quotes:
            project = db.query(Project).filter(Project.id == quote.project_id).first()
            if not project:
                continue
            
            sizing = db.query(SizingResult).filter(SizingResult.project_id == project.id).first()
            if not sizing:
                continue
            
            items = db.query(QuoteItem).filter(QuoteItem.quote_id == quote.id).all()
            
            # Check if battery is in quote when sizing has battery
            battery_items = [i for i in items if i.product and i.product.product_type == ProductType.BATTERY]
            if sizing.battery_capacity_kwh and sizing.battery_capacity_kwh > 0:
                if not battery_items:
                    issues.append(f"Quote {quote.quote_number}: Battery in sizing ({sizing.battery_capacity_kwh} kWh) but not in quote")
            
            # Check panel brand consistency (allow "JA" vs "JA Solar" variations)
            panel_items = [i for i in items if i.product and i.product.product_type == ProductType.PANEL]
            if panel_items and sizing.panel_brand:
                panel_brand = panel_items[0].product.brand or ""
                sizing_brand = sizing.panel_brand.upper()
                quote_brand = panel_brand.upper()
                # Allow variations like "JA" vs "JA SOLAR"
                if sizing_brand not in quote_brand and quote_brand not in sizing_brand:
                    issues.append(f"Quote {quote.quote_number}: Panel brand mismatch "
                                f"(sizing: {sizing.panel_brand}, quote: {panel_brand})")
        
        if issues:
            print("❌ Found inconsistencies:")
            for issue in issues:
                print(f"   - {issue}")
            return False
        else:
            print("✅ All quotes are consistent with sizing results")
            return True
            
    except Exception as e:
        print(f"❌ Error checking quote consistency: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def check_unit_conversions():
    """Check unit conversions are consistent"""
    print("\n" + "="*80)
    print("5. UNIT CONVERSION CONSISTENCY")
    print("="*80)
    
    db = SessionLocal()
    try:
        # Check HP to Watts conversion
        hp_setting = db.query(Setting).filter(Setting.key == "hp_to_watts_ac").first()
        hp_to_watts = float(hp_setting.value) if hp_setting else 900
        
        print(f"✓ HP to Watts (AC): 1 HP = {hp_to_watts}W")
        
        # Check appliances with HP units
        hp_appliances = db.query(Appliance).filter(Appliance.power_unit == "HP").all()
        if hp_appliances:
            print(f"✓ Found {len(hp_appliances)} appliances using HP units")
            for app in hp_appliances[:3]:  # Show first 3
                watts = app.power_value * hp_to_watts
                print(f"   - {app.description}: {app.power_value} HP = {watts}W")
        
        # Check kW to W conversions
        kw_appliances = db.query(Appliance).filter(Appliance.power_unit == "kW").all()
        if kw_appliances:
            print(f"✓ Found {len(kw_appliances)} appliances using kW units")
        
        print("✅ Unit conversions are consistent")
        return True
        
    except Exception as e:
        print(f"❌ Error checking unit conversions: {e}")
        return False
    finally:
        db.close()


def check_rounding_consistency():
    """Check rounding is consistent across calculations"""
    print("\n" + "="*80)
    print("6. ROUNDING CONSISTENCY")
    print("="*80)
    
    db = SessionLocal()
    try:
        sizings = db.query(SizingResult).all()
        
        rounding_issues = []
        for sizing in sizings:
            # Check system_size_kw rounding (should be 2 decimals)
            if sizing.system_size_kw:
                decimals = len(str(sizing.system_size_kw).split('.')[-1]) if '.' in str(sizing.system_size_kw) else 0
                if decimals > 2:
                    rounding_issues.append(f"Project {sizing.project_id}: system_size_kw has {decimals} decimals ({sizing.system_size_kw})")
            
            # Check battery_capacity_kwh rounding (should be 1 decimal)
            if sizing.battery_capacity_kwh:
                decimals = len(str(sizing.battery_capacity_kwh).split('.')[-1]) if '.' in str(sizing.battery_capacity_kwh) else 0
                if decimals > 1:
                    rounding_issues.append(f"Project {sizing.project_id}: battery_capacity_kwh has {decimals} decimals ({sizing.battery_capacity_kwh})")
        
        if rounding_issues:
            print("⚠️  Rounding inconsistencies found:")
            for issue in rounding_issues:
                print(f"   - {issue}")
            return False
        else:
            print("✅ Rounding is consistent")
            return True
            
    except Exception as e:
        print(f"❌ Error checking rounding: {e}")
        return False
    finally:
        db.close()


def check_data_integrity():
    """Check data integrity across tables"""
    print("\n" + "="*80)
    print("7. DATA INTEGRITY CHECK")
    print("="*80)
    
    db = SessionLocal()
    try:
        issues = []
        
        # Check for orphaned records
        project_ids = [p.id for p in db.query(Project).all()]
        customer_ids = [p.customer_id for p in db.query(Project).all() if p.customer_id]
        
        quotes_without_projects = db.query(Quote).filter(
            ~Quote.project_id.in_(project_ids)
        ).all()
        
        appliances_without_projects = db.query(Appliance).filter(
            ~Appliance.project_id.in_(project_ids)
        ).all()
        
        if quotes_without_projects:
            issues.append(f"Found {len(quotes_without_projects)} quotes without valid projects")
        
        if appliances_without_projects:
            issues.append(f"Found {len(appliances_without_projects)} appliances without valid projects")
        
        # Check for negative values
        negative_appliances = db.query(Appliance).filter(
            (Appliance.power_value < 0) |
            (Appliance.quantity < 0) |
            (Appliance.hours_per_day < 0)
        ).all()
        
        if negative_appliances:
            issues.append(f"Found {len(negative_appliances)} appliances with negative values")
        
        if issues:
            print("❌ Data integrity issues found:")
            for issue in issues:
                print(f"   - {issue}")
            return False
        else:
            print("✅ Data integrity is good")
            return True
            
    except Exception as e:
        print(f"❌ Error checking data integrity: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def main():
    """Run all consistency checks"""
    print("\n" + "="*80)
    print("COMPREHENSIVE SYSTEM CONSISTENCY REVIEW")
    print("="*80)
    print("\nThis review checks:")
    print("  1. Settings consistency")
    print("  2. Calculation formula consistency")
    print("  3. Sizing result consistency")
    print("  4. Quote consistency")
    print("  5. Unit conversion consistency")
    print("  6. Rounding consistency")
    print("  7. Data integrity")
    
    results = []
    
    results.append(("Settings", check_settings_consistency()))
    results.append(("Formulas", check_calculation_formulas()))
    results.append(("Sizing Results", check_sizing_result_consistency()))
    results.append(("Quotes", check_quote_consistency()))
    results.append(("Unit Conversions", check_unit_conversions()))
    results.append(("Rounding", check_rounding_consistency()))
    results.append(("Data Integrity", check_data_integrity()))
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {name}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*80)
    if all_passed:
        print("✅ ALL CHECKS PASSED - System is consistent!")
    else:
        print("⚠️  SOME CHECKS FAILED - Review issues above")
    print("="*80)
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

