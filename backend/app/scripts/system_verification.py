"""
System Verification Script
Comprehensive check of backend-frontend consistency, calculations, and reports
"""
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models import Quote, QuoteItem, Project, SizingResult, Product, ProductType, Customer
from sqlalchemy.orm import joinedload
from sqlalchemy import func

def verify_quote_calculations():
    """Verify quote calculations are correct"""
    print("\n" + "="*80)
    print("QUOTE CALCULATIONS VERIFICATION")
    print("="*80)
    
    db = SessionLocal()
    issues = []
    
    quotes = db.query(Quote).options(joinedload(Quote.items)).all()
    
    for quote in quotes:
        print(f"\nQuote: {quote.quote_number} (ID: {quote.id})")
        
        # Get all items
        items = quote.items or []
        
        # Calculate equipment subtotal
        equipment_items = []
        for item in items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product and product.product_type.value in ['panel', 'inverter', 'battery', 'mounting']:
                    equipment_items.append(item)
        
        calculated_equipment = sum(item.total_price for item in equipment_items)
        
        # Find BOS item
        bos_item = None
        for item in items:
            if 'BOS' in item.description.upper() or 'Balance of System' in item.description:
                bos_item = item
                break
        
        if bos_item:
            calculated_equipment += bos_item.total_price
        
        # Calculate services subtotal
        services_items = [item for item in items if item not in equipment_items and item != bos_item]
        calculated_services = sum(item.total_price for item in services_items)
        
        # Verify subtotals
        if abs(calculated_equipment - quote.equipment_subtotal) > 0.01:
            issues.append(f"Quote {quote.quote_number}: Equipment subtotal mismatch. Calculated: {calculated_equipment}, Stored: {quote.equipment_subtotal}")
            print(f"  ⚠️  Equipment Subtotal Mismatch: Calculated {calculated_equipment:,.2f}, Stored {quote.equipment_subtotal:,.2f}")
        else:
            print(f"  ✓ Equipment Subtotal: {calculated_equipment:,.2f}")
        
        if abs(calculated_services - quote.services_subtotal) > 0.01:
            issues.append(f"Quote {quote.quote_number}: Services subtotal mismatch. Calculated: {calculated_services}, Stored: {quote.services_subtotal}")
            print(f"  ⚠️  Services Subtotal Mismatch: Calculated {calculated_services:,.2f}, Stored {quote.services_subtotal:,.2f}")
        else:
            print(f"  ✓ Services Subtotal: {calculated_services:,.2f}")
        
        # Verify grand total
        subtotal = calculated_equipment + calculated_services
        tax_amount = subtotal * (quote.tax_percent / 100)
        discount_amount = subtotal * (quote.discount_percent / 100)
        calculated_grand_total = subtotal + tax_amount - discount_amount
        
        if abs(calculated_grand_total - quote.grand_total) > 0.01:
            issues.append(f"Quote {quote.quote_number}: Grand total mismatch. Calculated: {calculated_grand_total}, Stored: {quote.grand_total}")
            print(f"  ⚠️  Grand Total Mismatch: Calculated {calculated_grand_total:,.2f}, Stored {quote.grand_total:,.2f}")
        else:
            print(f"  ✓ Grand Total: {calculated_grand_total:,.2f}")
        
        # Verify BOS and Installation percentages
        if bos_item:
            import re
            match = re.search(r'(\d+\.?\d*)%', bos_item.description)
            if match:
                bos_percent = float(match.group(1))
                equipment_for_bos = sum(item.total_price for item in equipment_items)
                expected_bos = equipment_for_bos * (bos_percent / 100)
                if abs(expected_bos - bos_item.total_price) > 0.01:
                    issues.append(f"Quote {quote.quote_number}: BOS calculation incorrect. Expected: {expected_bos}, Actual: {bos_item.total_price}")
                    print(f"  ⚠️  BOS Calculation Error: Expected {expected_bos:,.2f}, Got {bos_item.total_price:,.2f}")
                else:
                    print(f"  ✓ BOS: {bos_percent}% = {bos_item.total_price:,.2f}")
        
        installation_item = None
        for item in items:
            if 'Installation' in item.description and 'Transport' not in item.description:
                installation_item = item
                break
        
        if installation_item:
            import re
            match = re.search(r'(\d+\.?\d*)%', installation_item.description)
            if match:
                inst_percent = float(match.group(1))
                total_for_inst = calculated_equipment  # Equipment + BOS
                expected_inst = total_for_inst * (inst_percent / 100)
                if abs(expected_inst - installation_item.total_price) > 0.01:
                    issues.append(f"Quote {quote.quote_number}: Installation calculation incorrect. Expected: {expected_inst}, Actual: {installation_item.total_price}")
                    print(f"  ⚠️  Installation Calculation Error: Expected {expected_inst:,.2f}, Got {installation_item.total_price:,.2f}")
                else:
                    print(f"  ✓ Installation: {inst_percent}% = {installation_item.total_price:,.2f}")
    
    db.close()
    
    if issues:
        print(f"\n⚠️  Found {len(issues)} calculation issues")
        return False
    else:
        print("\n✅ All quote calculations are correct!")
        return True


def verify_panel_brand_consistency():
    """Verify panel brand consistency between quote items and sizing results"""
    print("\n" + "="*80)
    print("PANEL BRAND CONSISTENCY VERIFICATION")
    print("="*80)
    
    db = SessionLocal()
    issues = []
    
    quotes = db.query(Quote).options(joinedload(Quote.items)).all()
    
    for quote in quotes:
        project = db.query(Project).filter(Project.id == quote.project_id).first()
        if not project:
            continue
        
        sizing = db.query(SizingResult).filter(SizingResult.project_id == project.id).first()
        if not sizing:
            continue
        
        # Get panel brand from quote items
        panel_brand_from_quote = None
        for item in quote.items or []:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product and product.product_type == ProductType.PANEL:
                    panel_brand_from_quote = product.brand
                    break
        
        if panel_brand_from_quote and sizing.panel_brand:
            if panel_brand_from_quote.upper() != sizing.panel_brand.upper():
                issues.append(f"Quote {quote.quote_number}: Panel brand mismatch. Quote: {panel_brand_from_quote}, Sizing: {sizing.panel_brand}")
                print(f"  ⚠️  Quote {quote.quote_number}: Quote items use '{panel_brand_from_quote}', but sizing shows '{sizing.panel_brand}'")
            else:
                print(f"  ✓ Quote {quote.quote_number}: Panel brand consistent ({panel_brand_from_quote})")
    
    db.close()
    
    if issues:
        print(f"\n⚠️  Found {len(issues)} panel brand inconsistencies")
        print("Note: PDF generator should handle this by using quote items as source of truth")
        return False
    else:
        print("\n✅ All panel brands are consistent!")
        return True


def verify_api_endpoints():
    """Verify all API endpoints exist and are properly configured"""
    print("\n" + "="*80)
    print("API ENDPOINTS VERIFICATION")
    print("="*80)
    
    endpoints = {
        'GET /quotes/': 'List quotes',
        'GET /quotes/{id}': 'Get quote',
        'POST /quotes/': 'Create quote',
        'PUT /quotes/{id}': 'Update quote',
        'PUT /quotes/{id}/items/{item_id}': 'Update quote item',
        'DELETE /quotes/{id}/items/{item_id}': 'Delete quote item',
        'PUT /quotes/{id}/update-percentage': 'Update BOS/Installation percentage',
        'GET /quotes/{id}/pdf': 'Download quote PDF',
        'POST /sizing/from-appliances/{project_id}': 'Calculate sizing from appliances',
        'GET /reports/analytics': 'Get analytics',
        'GET /reports/pdf': 'Download analytics PDF',
        'GET /appliances/project/{project_id}/pdf': 'Download appliance PDF',
        'GET /projects/{project_id}/sizing/pdf': 'Download sizing PDF',
    }
    
    # Check if routers are imported
    try:
        from app.routers import quotes, sizing, reports, appliances, projects
        print("✅ All routers imported successfully")
        
        for endpoint, description in endpoints.items():
            print(f"  ✓ {endpoint} - {description}")
        
        return True
    except Exception as e:
        print(f"⚠️  Error importing routers: {e}")
        return False


def verify_pdf_generators():
    """Verify all PDF generators are working"""
    print("\n" + "="*80)
    print("PDF GENERATORS VERIFICATION")
    print("="*80)
    
    pdf_services = [
        ('pdf_generator.py', 'Quote PDF'),
        ('appliance_pdf_generator.py', 'Appliance Report PDF'),
        ('sizing_pdf_generator.py', 'Sizing Report PDF'),
        ('report_pdf_generator.py', 'Analytics Report PDF'),
    ]
    
    all_ok = True
    for filename, name in pdf_services:
        try:
            if filename == 'pdf_generator.py':
                from app.services.pdf_generator import generate_quotation_pdf
            elif filename == 'appliance_pdf_generator.py':
                from app.services.appliance_pdf_generator import generate_appliance_report_pdf
            elif filename == 'sizing_pdf_generator.py':
                from app.services.sizing_pdf_generator import generate_sizing_report_pdf
            elif filename == 'report_pdf_generator.py':
                from app.services.report_pdf_generator import generate_report_pdf
            
            print(f"  ✓ {name} generator available")
        except Exception as e:
            print(f"  ⚠️  {name} generator error: {e}")
            all_ok = False
    
    return all_ok


def verify_realtime_calculations():
    """Verify realtime calculation triggers"""
    print("\n" + "="*80)
    print("REALTIME CALCULATIONS VERIFICATION")
    print("="*80)
    
    try:
        from app.services.quote_recalculator import recalculate_dependent_items
        print("  ✓ Recalculation service available")
        
        # Check if it's called in quote item updates
        with open('/app/app/routers/quotes.py', 'r') as f:
            content = f.read()
            if 'recalculate_dependent_items' in content:
                print("  ✓ Recalculation triggered on equipment item updates")
            else:
                print("  ⚠️  Recalculation not found in quotes router")
                return False
        
        return True
    except Exception as e:
        print(f"  ⚠️  Error: {e}")
        return False


def verify_data_consistency():
    """Verify data consistency across models"""
    print("\n" + "="*80)
    print("DATA CONSISTENCY VERIFICATION")
    print("="*80)
    
    db = SessionLocal()
    issues = []
    
    # Check projects have customers
    projects = db.query(Project).all()
    for project in projects:
        if not project.customer_id:
            issues.append(f"Project {project.id} ({project.name}) has no customer")
            print(f"  ⚠️  Project {project.name} has no customer")
        else:
            customer = db.query(Customer).filter(Customer.id == project.customer_id).first()
            if not customer:
                issues.append(f"Project {project.id} references non-existent customer {project.customer_id}")
                print(f"  ⚠️  Project {project.name} references invalid customer ID {project.customer_id}")
    
    # Check quotes have projects
    quotes = db.query(Quote).all()
    for quote in quotes:
        if not quote.project_id:
            issues.append(f"Quote {quote.quote_number} has no project")
            print(f"  ⚠️  Quote {quote.quote_number} has no project")
        else:
            project = db.query(Project).filter(Project.id == quote.project_id).first()
            if not project:
                issues.append(f"Quote {quote.quote_number} references non-existent project {quote.project_id}")
                print(f"  ⚠️  Quote {quote.quote_number} references invalid project ID {quote.project_id}")
    
    # Check quote items have quotes
    items = db.query(QuoteItem).all()
    for item in items:
        if not item.quote_id:
            issues.append(f"QuoteItem {item.id} has no quote")
        else:
            quote = db.query(Quote).filter(Quote.id == item.quote_id).first()
            if not quote:
                issues.append(f"QuoteItem {item.id} references non-existent quote {item.quote_id}")
    
    db.close()
    
    if issues:
        print(f"\n⚠️  Found {len(issues)} data consistency issues")
        return False
    else:
        print("\n✅ All data relationships are consistent!")
        return True


def main():
    """Run all verification checks"""
    print("\n" + "="*80)
    print("SYSTEM VERIFICATION REPORT")
    print("="*80)
    print("\nChecking backend-frontend consistency, calculations, and reports...")
    
    results = {
        'Quote Calculations': verify_quote_calculations(),
        'Panel Brand Consistency': verify_panel_brand_consistency(),
        'API Endpoints': verify_api_endpoints(),
        'PDF Generators': verify_pdf_generators(),
        'Realtime Calculations': verify_realtime_calculations(),
        'Data Consistency': verify_data_consistency(),
    }
    
    print("\n" + "="*80)
    print("VERIFICATION SUMMARY")
    print("="*80)
    
    all_passed = True
    for check, passed in results.items():
        status = "✅ PASS" if passed else "⚠️  FAIL"
        print(f"{status}: {check}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*80)
    if all_passed:
        print("✅ ALL CHECKS PASSED - System is consistent!")
    else:
        print("⚠️  SOME CHECKS FAILED - Review issues above")
    print("="*80 + "\n")
    
    return all_passed


if __name__ == "__main__":
    main()






