"""
PDF Generation Service

Generates professional quotation PDFs using WeasyPrint.
"""
from io import BytesIO
from typing import Optional
from pathlib import Path
import base64
from jinja2 import Template, Environment
from weasyprint import HTML
from sqlalchemy.orm import Session
from app.models import Quote, Customer, Project, SizingResult as SizingResultModel, Setting, Product, ProductType
from app.config import settings


def format_currency(value):
    """Format number with commas and 2 decimal places"""
    if value is None:
        return "0.00"
    return f"{float(value):,.2f}"


QUOTATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            background: #ffffff;
        }
        .header-section {
            padding: 25px 40px 15px 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            background: #ffffff;
        }
        .left-header {
            flex: 1;
        }
        .logo-container {
            margin-bottom: 20px;
        }
        .company-logo {
            max-height: 160px;
            max-width: 200px;
            object-fit: contain;
        }
        .placeholder-text {
            font-size: 9pt;
            color: #999;
            font-style: italic;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        .customer-section {
            margin-top: 15px;
        }
        .customer-section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #00E676;
            margin-bottom: 10px;
        }
        .customer-details {
            font-size: 10pt;
            color: #333;
            line-height: 1.6;
        }
        .customer-details div {
            margin: 3px 0;
        }
        .right-header {
            text-align: right;
            min-width: 300px;
            max-width: 350px;
        }
        .quotation-title {
            font-size: 25pt;
            font-weight: bold;
            color: #00E676;
            margin-bottom: 8px;
            line-height: 1;
        }
        .company-name-header {
            font-size: 12pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 12px;
        }
        .company-contact-header {
            font-size: 10pt;
            color: #333;
            line-height: 1.6;
            text-align: right;
            margin-bottom: 15px;
        }
        .company-contact-header div {
            margin: 4px 0;
        }
        .quote-details {
            font-size: 9pt;
            color: #666;
            line-height: 1.6;
            margin-top: 10px;
        }
        .quote-details div {
            margin: 3px 0;
        }
        .divider-line {
            height: 2px;
            background: #00E676;
            margin: 0 40px;
        }
        .main-content {
            background: #1a4d7a;
            padding: 15px 40px 20px 40px;
            position: relative;
            min-height: 400px;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            /* transform: translate(-50%, -50%) rotate(-45deg); WeasyPrint doesn't support CSS transforms */
            font-size: 72pt;
            color: rgba(255, 255, 255, 0.05);
            font-weight: bold;
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
        }
        .pricing-table-wrapper {
            position: relative;
            z-index: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            background: #ffffff;
        }
        th {
            background: #00E676;
            color: #ffffff;
            padding: 8px 10px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
            border: 1px solid #00C85F;
        }
        th.text-right {
            text-align: right;
        }
        td {
            padding: 8px 10px;
            border: 1px solid #ddd;
            color: #333;
            background: #ffffff;
            font-size: 10pt;
        }
        tbody tr {
            border-bottom: 1px solid #ddd;
        }
        .text-right {
            text-align: right;
        }
        .totals-container {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
            position: relative;
            z-index: 1;
        }
        .totals-box {
            background: #ffffff;
            border: 2px solid #333;
            width: 280px;
            padding: 15px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 11pt;
            border-bottom: 1px solid #ddd;
        }
        .total-row:last-child {
            border-bottom: none;
        }
        .total-label {
            color: #333;
            font-weight: normal;
        }
        .total-value {
            color: #333;
            font-weight: bold;
        }
        .total-row.grand-total {
            background: #00E676;
            color: #000;
            padding: 12px 10px;
            margin: 10px -15px -15px -15px;
            width: calc(100% + 30px);
            font-size: 13pt;
            font-weight: bold;
        }
        .total-row.grand-total .total-label,
        .total-row.grand-total .total-value {
            color: #ffffff;
        }
        .footer-section {
            padding: 20px 40px;
            background: #ffffff;
            page-break-before: always;
        }
        .footer-title {
            font-size: 11pt;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .footer-text {
            font-size: 10pt;
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .bank-details-box {
            font-size: 10pt;
            color: #333;
            line-height: 1.6;
            margin-bottom: 15px;
            padding: 12px 15px;
            background: #f5f5f5;
            border-left: 4px solid #00E676;
        }
        .bank-details-box div {
            margin: 4px 0;
        }
        .bank-note {
            font-size: 9pt;
            color: #666;
            margin-top: 8px;
            font-style: italic;
        }
        .thank-you {
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
            color: #00E676;
            margin-top: 20px;
        }
        .specs-section {
            page-break-before: always;
            background: #ffffff;
            padding: 30px 50px 20px 50px;
            margin: 0;
        }
        .specs-title {
            font-size: 12pt;
            font-weight: 700;
            color: #1a4d7a;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
            position: relative;
            padding-bottom: 12px;
            border-bottom: 3px solid #00E676;
        }
        .specs-grid {
            width: 100%;
            margin-bottom: 15px;
            font-size: 0;
            letter-spacing: 0;
            word-spacing: 0;
        }
        .spec-item {
            background: #ffffff;
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-left: 4px solid #00E676;
            border-radius: 4px;
            width: 24%;
            display: inline-block;
            vertical-align: top;
            margin-right: 1.33%;
            margin-bottom: 15px;
            box-sizing: border-box;
            min-height: 100px;
            font-size: 10pt;
            letter-spacing: normal;
            word-spacing: normal;
        }
        .spec-item:nth-child(4n) {
            margin-right: 0;
        }
        .spec-label {
            font-size: 8pt;
            color: #666;
            margin-bottom: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.4;
        }
        .spec-value-container {
            margin-bottom: 6px;
        }
        .spec-value {
            color: #1a4d7a;
            font-size: 14pt;
            font-weight: 700;
            line-height: 1.3;
            display: inline-block;
        }
        .spec-value span {
            font-size: 9pt;
            font-weight: 500;
            color: #999;
            margin-left: 3px;
            display: inline-block;
        }
        .spec-subtext {
            font-size: 7.5pt;
            color: #888;
            margin-top: 6px;
            font-style: italic;
            line-height: 1.4;
            padding-top: 6px;
            border-top: 1px solid #f0f0f0;
        }
        .specs-note {
            font-size: 9pt;
            color: #555;
            margin-top: 15px;
            padding: 12px 20px;
            background: #f8f9fa;
            border-left: 4px solid #1a4d7a;
            border-radius: 4px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header-section">
        <div class="left-header">
            <div class="logo-container">
                {% if logo_data_uri %}
                <img src="{{ logo_data_uri }}" alt="Company Logo" class="company-logo" />
                {% endif %}
            </div>
            <div class="customer-section">
                <div class="customer-section-title">Customer Information</div>
                <div class="customer-details">
                    <div><strong>{{ customer.name }}</strong></div>
                    {% if customer.phone %}<div>{{ customer.phone }}</div>{% endif %}
                    {% if customer.email %}<div>{{ customer.email }}</div>{% endif %}
                    {% if customer.address %}<div>{{ customer.address }}</div>{% endif %}
                    {% if customer.city or customer.country %}
                    <div>
                        {% if customer.city %}{{ customer.city }}{% endif %}{% if customer.city and customer.country %}, {% endif %}{% if customer.country %}{{ customer.country }}{% endif %}
                    </div>
                    {% endif %}
                </div>
            </div>
        </div>
        <div class="right-header">
            <div class="quotation-title">{{ document_title }}</div>
            <div class="company-name-header">{{ company_name }}</div>
            <div class="company-contact-header">
                {% if company_address %}<div>{{ company_address }}</div>{% endif %}
                {% if company_email %}<div>{{ company_email }}</div>{% endif %}
                {% if company_phone %}<div>{{ company_phone }}</div>{% endif %}
            </div>
            <div class="quote-details">
                <div><strong>Quote #:</strong> {{ quote.quote_number }}</div>
                <div><strong>Date:</strong> {{ quote.created_at.strftime('%B %d, %Y') }}</div>
                {% if quote.validity_days %}
                <div><strong>Valid for:</strong> {{ quote.validity_days }} days</div>
                {% endif %}
            </div>
        </div>
    </div>

    <!-- Divider Line -->
    <div class="divider-line"></div>

    <!-- Main Content with Dark Blue Background -->
    <div class="main-content">
        <div class="pricing-table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Item Details</th>
                        <th class="text-right" style="width: 120px;">Estimated Cost (GHS)</th>
                        <th class="text-right" style="width: 100px;">Quantity</th>
                        <th class="text-right" style="width: 120px;">Total (GHS)</th>
                    </tr>
                </thead>
                <tbody>
                    {% if quote.items %}
                    {% for item in quote.items %}
                    <tr>
                        <td>{{ item.description }}</td>
                        <td class="text-right">{{ item.unit_price|format_currency }}</td>
                        <td class="text-right">{{ item.quantity }}</td>
                        <td class="text-right">{{ item.total_price|format_currency }}</td>
                    </tr>
                    {% endfor %}
                    {% endif %}
                </tbody>
            </table>
        </div>

        <!-- Totals Box -->
        <div class="totals-container">
            <div class="totals-box">
                <div class="total-row">
                    <span class="total-label">Sub Total:</span>
                    <span class="total-value">{{ (quote.equipment_subtotal + quote.services_subtotal)|format_currency }}</span>
                </div>
                {% if quote.tax_percent and quote.tax_percent > 0 %}
                <div class="total-row">
                    <span class="total-label">Tax ({{ quote.tax_percent|round(1) }}%):</span>
                    <span class="total-value">{{ quote.tax_amount|format_currency }}</span>
                </div>
                {% else %}
                <div class="total-row">
                    <span class="total-label">Tax (0%):</span>
                    <span class="total-value">0.00</span>
                </div>
                {% endif %}
                {% if quote.discount_percent and quote.discount_percent > 0 %}
                <div class="total-row">
                    <span class="total-label">Discount ({{ quote.discount_percent|round(1) }}%):</span>
                    <span class="total-value">-{{ quote.discount_amount|format_currency }}</span>
                </div>
                {% else %}
                <div class="total-row">
                    <span class="total-label">Discount (0%):</span>
                    <span class="total-value">0.00</span>
                </div>
                {% endif %}
                <div class="total-row">
                    <span class="total-label">Others:</span>
                    <span class="total-value">0.00</span>
                </div>
                <div class="total-row grand-total">
                    <span class="total-label">Total (GHS):</span>
                    <span class="total-value">{{ quote.grand_total|format_currency }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer Section -->
    <div class="footer-section">
        {% if sizing_result %}
        <div class="specs-section">
            <div class="specs-title">System Specifications & Engineering Details</div>
            <div class="specs-grid">
                <div class="spec-item">
                    <div class="spec-label">Daily Energy Requirement</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.total_daily_kwh|round(2) }}</div>
                        <span>kWh/day</span>
                    </div>
                </div>
                {% if sizing_result.effective_daily_kwh %}
                <div class="spec-item">
                    <div class="spec-label">Effective Daily Energy</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.effective_daily_kwh|round(2) }}</div>
                        <span>kWh/day</span>
                    </div>
                    <div class="spec-subtext">After system losses</div>
                </div>
                {% endif %}
                <div class="spec-item">
                    <div class="spec-label">Monthly Generation</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ ((sizing_result.effective_daily_kwh or sizing_result.total_daily_kwh) * 30)|round(1) }}</div>
                        <span>kWh</span>
                    </div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Peak Sun Hours</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.peak_sun_hours|round(1) }}</div>
                        <span>hrs/day</span>
                    </div>
                    <div class="spec-subtext">Location: {{ project.location or 'N/A' }}</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">PV Array Capacity</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ ((sizing_result.number_of_panels * sizing_result.panel_wattage) / 1000.0)|round(2) }}</div>
                        <span>kW</span>
                    </div>
                    <div class="spec-subtext">{{ sizing_result.number_of_panels }} × {{ sizing_result.panel_wattage }}W panels</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Panel Brand</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.panel_brand }}</div>
                    </div>
                    <div class="spec-subtext">{{ sizing_result.panel_wattage }}W model</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Inverter Capacity</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ (sizing_result.min_inverter_kw if sizing_result.min_inverter_kw else sizing_result.inverter_size_kw)|round(1) }}</div>
                        <span>kW</span>
                    </div>
                    {% if sizing_result.min_inverter_kw and sizing_result.inverter_size_kw and (sizing_result.inverter_size_kw - sizing_result.min_inverter_kw) > 0.01 %}
                    <div style="font-size: 9pt; color: #666; margin-top: 4px;">Selected: {{ sizing_result.inverter_size_kw|round(1) }}kW (for quote)</div>
                    {% endif %}
                </div>
                <div class="spec-item">
                    <div class="spec-label">DC/AC Ratio</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.dc_ac_ratio|round(2) }}</div>
                    </div>
                    <div class="spec-subtext">Optimized</div>
                </div>
                {% if sizing_result.battery_capacity_kwh %}
                <div class="spec-item">
                    <div class="spec-label">Battery Capacity</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.battery_capacity_kwh|round(1) }}</div>
                        <span>kWh</span>
                    </div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Backup Duration</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.backup_hours|round(0)|int }}</div>
                        <span>hours</span>
                    </div>
                </div>
                {% endif %}
                <div class="spec-item">
                    <div class="spec-label">Required Roof Area</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ sizing_result.roof_area_m2|round(1) }}</div>
                        <span>m²</span>
                    </div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">System Efficiency</div>
                    <div class="spec-value-container">
                        <div class="spec-value">{{ (sizing_result.system_efficiency * 100)|round(1) }}</div>
                        <span>%</span>
                    </div>
                </div>
            </div>
            <div class="specs-note">
                <strong>Engineering Notes:</strong> This system is designed using industry-standard engineering factors, including system efficiency (accounting for inverter, wiring, and temperature), an optimized DC/AC ratio to prevent inverter clipping, and location-specific peak sun hours for accurate energy‑generation calculations. All calculations include appropriate safety margins for reliable performance.
            </div>
        </div>
        {% endif %}
        {% if show_bank_details and (company_bank_name or company_account_number) %}
        <div class="footer-title">Payment – Bank Details</div>
        <div class="bank-details-box">
            {% if company_bank_name %}<div><strong>Bank:</strong> {{ company_bank_name }}</div>{% endif %}
            {% if company_account_name %}<div><strong>Account Name:</strong> {{ company_account_name }}</div>{% endif %}
            {% if company_account_number %}<div><strong>Account Number:</strong> {{ company_account_number }}</div>{% endif %}
            {% if company_bank_branch %}<div><strong>Branch:</strong> {{ company_bank_branch }}</div>{% endif %}
            {% if company_swift_code %}<div><strong>SWIFT/BIC:</strong> {{ company_swift_code }}</div>{% endif %}
            <div class="bank-note">Please use this invoice number or quote reference when making payment.</div>
        </div>
        {% endif %}
        <div class="footer-title">Terms & Conditions</div>
        <div class="footer-text">
            This {{ document_title|lower }} is valid for {{ quote.validity_days }} days from the date of issue. All prices are subject to change without notice. Installation and project delivery terms will be discussed upon acceptance.
        </div>
        {% if quote.payment_terms %}
        <div class="footer-title">Payment Terms</div>
        <div class="footer-text">{{ quote.payment_terms }}</div>
        {% endif %}
        {% if quote.notes %}
        <div class="footer-title">Notes</div>
        <div class="footer-text">{{ quote.notes }}</div>
        {% endif %}
        <div class="thank-you">Thank you for your business!</div>
    </div>
</body>
</html>
"""


def generate_quotation_pdf(
    db: Session,
    quote_id: int,
    document_type: str = "quotation"
) -> BytesIO:
    """
    Generate a PDF for a quote: Quotation or Proforma Invoice.
    document_type: "quotation" | "proforma_invoice"
    Proforma Invoice shows the same content with title "PROFORMA INVOICE" and bank details.
    Returns a BytesIO object containing the PDF.
    """
    # Fetch quote with relationships (eagerly load items)
    from sqlalchemy.orm import joinedload
    quote = db.query(Quote).options(joinedload(Quote.items)).filter(Quote.id == quote_id).first()
    if not quote:
        raise ValueError(f"Quote {quote_id} not found")
    
    project = db.query(Project).filter(Project.id == quote.project_id).first()
    if not project:
        raise ValueError(f"Project {quote.project_id} not found")
    
    customer = db.query(Customer).filter(Customer.id == project.customer_id).first()
    if not customer:
        raise ValueError(f"Customer {project.customer_id} not found")
    
    sizing_result = db.query(SizingResultModel).filter(
        SizingResultModel.project_id == project.id
    ).first()
    
    # Get actual panel brand from quote items (source of truth)
    # This ensures PDF shows what's actually in the quote, not what was in sizing
    # This prevents mismatches when sizing was done with one brand but quote uses another
    panel_brand_from_quote = None
    panel_wattage_from_quote = None
    if quote.items:
        for item in quote.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product and product.product_type == ProductType.PANEL:
                    # Use product brand first (most reliable)
                    panel_brand_from_quote = product.brand
                    panel_wattage_from_quote = product.wattage
                    
                    # If product brand is not set, try to extract from description
                    if not panel_brand_from_quote and item.description:
                        # Try to extract brand from description like "JA Solar 570W Panel" or "Jinko 580W Panel"
                        desc_upper = item.description.upper()
                        # Check for common brands
                        if 'JA' in desc_upper or 'JA SOLAR' in desc_upper:
                            panel_brand_from_quote = 'JA'
                        elif 'JINKO' in desc_upper:
                            panel_brand_from_quote = 'Jinko'
                        elif 'LONGI' in desc_upper:
                            panel_brand_from_quote = 'Longi'
                        elif 'CANADIAN' in desc_upper:
                            panel_brand_from_quote = 'Canadian'
                        elif 'TRINA' in desc_upper:
                            panel_brand_from_quote = 'Trina'
                        else:
                            # Fallback: use first word of description
                            parts = item.description.split()
                            if len(parts) > 0:
                                panel_brand_from_quote = parts[0]
                    break
    
    # Update sizing_result temporarily for PDF display if we found panel info in quote
    # This ensures System Specifications section shows what's actually in the quote
    if sizing_result:
        if panel_brand_from_quote:
            sizing_result.panel_brand = panel_brand_from_quote
        if panel_wattage_from_quote:
            sizing_result.panel_wattage = panel_wattage_from_quote
    
    # Document title and whether to show bank details (Proforma Invoice only)
    is_proforma = (document_type or "").strip().lower() == "proforma_invoice"
    document_title = "PROFORMA INVOICE" if is_proforma else "QUOTATION"
    show_bank_details = is_proforma

    # Fetch company settings from database
    company_name_setting = db.query(Setting).filter(Setting.key == "company_name").first()
    company_address_setting = db.query(Setting).filter(Setting.key == "company_address").first()
    company_phone_setting = db.query(Setting).filter(Setting.key == "company_phone").first()
    company_email_setting = db.query(Setting).filter(Setting.key == "company_email").first()
    company_logo_url_setting = db.query(Setting).filter(Setting.key == "company_logo_url").first()
    company_bank_name_setting = db.query(Setting).filter(Setting.key == "company_bank_name").first()
    company_account_name_setting = db.query(Setting).filter(Setting.key == "company_account_name").first()
    company_account_number_setting = db.query(Setting).filter(Setting.key == "company_account_number").first()
    company_bank_branch_setting = db.query(Setting).filter(Setting.key == "company_bank_branch").first()
    company_swift_code_setting = db.query(Setting).filter(Setting.key == "company_swift_code").first()

    # Get company details (prefer database settings, fallback to config)
    company_name = company_name_setting.value if company_name_setting else settings.COMPANY_NAME
    company_address = company_address_setting.value if company_address_setting else settings.COMPANY_ADDRESS
    company_phone = company_phone_setting.value if company_phone_setting else settings.COMPANY_PHONE
    company_email = company_email_setting.value if company_email_setting else settings.COMPANY_EMAIL
    company_bank_name = (company_bank_name_setting.value or "").strip() if company_bank_name_setting else ""
    company_account_name = (company_account_name_setting.value or "").strip() if company_account_name_setting else ""
    company_account_number = (company_account_number_setting.value or "").strip() if company_account_number_setting else ""
    company_bank_branch = (company_bank_branch_setting.value or "").strip() if company_bank_branch_setting else ""
    company_swift_code = (company_swift_code_setting.value or "").strip() if company_swift_code_setting else ""
    
    # Find and encode logo for PDF
    logo_data_uri = None
    logo_path = None
    
    # First, try to get logo from settings
    if company_logo_url_setting and company_logo_url_setting.value:
        logo_url = company_logo_url_setting.value
        # Remove leading slash if present
        if logo_url.startswith('/'):
            logo_url = logo_url[1:]
        
        # Try static directory first
        static_logo = Path("static") / logo_url.split('/')[-1]
        if static_logo.exists():
            logo_path = static_logo
        else:
            # Try the full path from settings
            full_path = Path(logo_url)
            if full_path.exists():
                logo_path = full_path
    
    # If no logo from settings, try default locations
    if not logo_path:
        static_dir = Path("static")
        if static_dir.exists():
            for logo_file in ["logo.jpg", "logo.png", "logo.jpeg"]:
                logo_file_path = static_dir / logo_file
                if logo_file_path.exists():
                    logo_path = logo_file_path
                    break
    
    # If still no logo, try frontend public directory (mounted in container)
    if not logo_path:
        # Try multiple possible paths
        possible_paths = [
            Path("frontend_public/logo.jpg"),  # Mounted volume
            Path("static/logo.jpg"),  # Backend static directory
            Path("../frontend/public/logo.jpg"),  # Relative path (if not in container)
            Path("logo.jpg"),  # Current directory
        ]
        for possible_path in possible_paths:
            if possible_path.exists():
                logo_path = possible_path
                break
    
    # Convert logo to base64 data URI for WeasyPrint
    if logo_path and logo_path.exists():
        try:
            with open(logo_path, 'rb') as f:
                logo_data = f.read()
                # Determine MIME type from extension
                ext = logo_path.suffix.lower()
                mime_type = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif'
                }.get(ext, 'image/jpeg')
                logo_base64 = base64.b64encode(logo_data).decode('utf-8')
                logo_data_uri = f"data:{mime_type};base64,{logo_base64}"
        except Exception as e:
            print(f"Error reading logo file: {e}")
            logo_data_uri = None
    
    # Render template
    # Create Jinja2 environment with custom filter
    env = Environment()
    env.filters['format_currency'] = format_currency
    
    template = env.from_string(QUOTATION_TEMPLATE)
    html_content = template.render(
        quote=quote,
        customer=customer,
        project=project,
        sizing_result=sizing_result,
        company_name=company_name,
        company_address=company_address,
        company_phone=company_phone,
        company_email=company_email,
        logo_data_uri=logo_data_uri,
        document_title=document_title,
        show_bank_details=show_bank_details,
        company_bank_name=company_bank_name,
        company_account_name=company_account_name,
        company_account_number=company_account_number,
        company_bank_branch=company_bank_branch,
        company_swift_code=company_swift_code,
    )
    
    # Generate PDF
    pdf_bytes = BytesIO()
    HTML(string=html_content).write_pdf(pdf_bytes)
    pdf_bytes.seek(0)
    
    return pdf_bytes

