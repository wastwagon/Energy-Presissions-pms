"""
PDF Generation Service for System Sizing Reports
"""
from io import BytesIO
from pathlib import Path
import base64
from jinja2 import Template, Environment
from weasyprint import HTML
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Project, SizingResult, Setting
from app.config import settings


SIZING_REPORT_TEMPLATE = """
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
            padding: 30px 40px 20px 40px;
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
        .report-title {
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
        .report-details {
            font-size: 9pt;
            color: #666;
            line-height: 1.6;
            margin-top: 10px;
        }
        .report-details div {
            margin: 3px 0;
        }
        .divider-line {
            height: 2px;
            background: #00E676;
            margin: 0 40px;
        }
        .main-content {
            background: #1a4d7a;
            padding: 20px 30px;
            position: relative;
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
        .content-wrapper {
            position: relative;
            z-index: 1;
        }
        .section-title {
            color: #ffffff;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 12px;
            border-bottom: 2px solid #00E676;
            padding-bottom: 6px;
        }
        .specs-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        .spec-card {
            background: #ffffff;
            border-radius: 4px;
            padding: 12px;
            border-left: 4px solid #00E676;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .spec-label {
            font-size: 8pt;
            color: #666;
            margin-bottom: 4px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .spec-value {
            font-size: 20pt;
            font-weight: bold;
            color: #00E676;
            line-height: 1.2;
            margin-bottom: 3px;
        }
        .spec-subvalue {
            font-size: 8pt;
            color: #999;
            margin-top: 2px;
            line-height: 1.3;
        }
        .summary-box {
            background: #ffffff;
            border-radius: 4px;
            padding: 15px;
            margin-top: 15px;
        }
        .summary-title {
            font-size: 11pt;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 6px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .summary-row:last-child {
            border-bottom: none;
        }
        .summary-label {
            color: #666;
            font-size: 9pt;
        }
        .summary-value {
            color: #333;
            font-weight: bold;
            font-size: 9pt;
        }
        .footer-section {
            padding: 30px 40px;
            background: #ffffff;
        }
        .notes-section {
            background: #f0f8ff;
            border-left: 4px solid #00E676;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .notes-title {
            font-size: 12pt;
            font-weight: bold;
            color: #00E676;
            margin-bottom: 10px;
        }
        .notes-list {
            font-size: 9pt;
            color: #666;
            line-height: 1.6;
        }
        .notes-list li {
            margin: 5px 0;
        }
        .footer-text {
            font-size: 9pt;
            color: #666;
            line-height: 1.5;
            text-align: center;
            margin-top: 15px;
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
            <div class="report-title">SYSTEM SIZING</div>
            <div class="company-name-header">{{ company_name }}</div>
            <div class="company-contact-header">
                {% if company_address %}<div>{{ company_address }}</div>{% endif %}
                {% if company_email %}<div>{{ company_email }}</div>{% endif %}
                {% if company_phone %}<div>{{ company_phone }}</div>{% endif %}
            </div>
            <div class="report-details">
                <div><strong>Project:</strong> {{ project.name }}</div>
                {% if project.reference_code %}
                <div><strong>Reference:</strong> {{ project.reference_code }}</div>
                {% endif %}
                <div><strong>Date:</strong> {{ generated_date }}</div>
            </div>
        </div>
    </div>

    <!-- Divider Line -->
    <div class="divider-line"></div>

    <!-- Main Content with Dark Blue Background -->
    <div class="main-content">
        <div class="watermark">{{ company_name|upper }}</div>
        <div class="content-wrapper">
            <div class="section-title">System Specifications</div>
            
            <div class="specs-grid">
                <div class="spec-card">
                    <div class="spec-label">PV System Capacity</div>
                    <div class="spec-value">{{ "%.2f"|format(sizing_result.system_size_kw) }}<span style="font-size: 12pt;"> kW</span></div>
                </div>
                
                <div class="spec-card">
                    <div class="spec-label">Number of Panels</div>
                    <div class="spec-value">{{ sizing_result.number_of_panels }}</div>
                    <div class="spec-subvalue">{{ sizing_result.number_of_panels }} × {{ sizing_result.panel_brand }} {{ sizing_result.panel_wattage }}W</div>
                </div>
                
                <div class="spec-card">
                    <div class="spec-label">Inverter Size</div>
                    <div class="spec-value">{{ "%.1f"|format(sizing_result.min_inverter_kw if sizing_result.min_inverter_kw else sizing_result.inverter_size_kw) }}<span style="font-size: 12pt;"> kW</span></div>
                    <div class="spec-subvalue">DC/AC: {{ "%.2f"|format(sizing_result.dc_ac_ratio) }}</div>
                    {% if sizing_result.min_inverter_kw and sizing_result.inverter_size_kw and (sizing_result.inverter_size_kw - sizing_result.min_inverter_kw) > 0.01 %}
                    <div class="spec-subvalue" style="font-size: 8pt; color: #666; margin-top: 2px;">Selected: {{ "%.1f"|format(sizing_result.inverter_size_kw) }}kW (for quote)</div>
                    {% endif %}
                </div>
                
                {% if sizing_result.battery_capacity_kwh %}
                <div class="spec-card">
                    <div class="spec-label">Battery Capacity</div>
                    <div class="spec-value">{{ "%.1f"|format(sizing_result.battery_capacity_kwh) }}<span style="font-size: 12pt;"> kWh</span></div>
                    {% if sizing_result.backup_hours %}
                    <div class="spec-subvalue">{{ sizing_result.backup_hours }}h backup</div>
                    {% endif %}
                </div>
                {% endif %}
                
                <div class="spec-card">
                    <div class="spec-label">Roof Area</div>
                    <div class="spec-value">{{ "%.1f"|format(sizing_result.roof_area_m2) }}<span style="font-size: 12pt;"> m²</span></div>
                </div>
                
                <div class="spec-card">
                    <div class="spec-label">System Efficiency</div>
                    <div class="spec-value">{{ "%.0f"|format(sizing_result.system_efficiency * 100) }}%</div>
                    <div class="spec-subvalue">Inverter, wiring, temp, soiling</div>
                </div>
            </div>

            <div class="summary-box">
                <div class="summary-title">Calculation Summary</div>
                <div class="summary-row">
                    <span class="summary-label">Total Daily Energy Requirement:</span>
                    <span class="summary-value">{{ "%.2f"|format(sizing_result.total_daily_kwh) }} kWh/day</span>
                </div>
                {% if sizing_result.effective_daily_kwh %}
                <div class="summary-row">
                    <span class="summary-label">Effective Daily Energy (after losses):</span>
                    <span class="summary-value">{{ "%.2f"|format(sizing_result.effective_daily_kwh) }} kWh/day</span>
                </div>
                {% endif %}
                <div class="summary-row">
                    <span class="summary-label">Peak Sun Hours:</span>
                    <span class="summary-value">{{ "%.1f"|format(sizing_result.peak_sun_hours) }} hrs/day ({{ sizing_result.location }})</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Panel Array Capacity:</span>
                    <span class="summary-value">{{ sizing_result.number_of_panels }} × {{ sizing_result.panel_wattage }}W = {{ "%.2f"|format((sizing_result.number_of_panels * sizing_result.panel_wattage) / 1000) }} kW</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Design Factor (Safety Margin):</span>
                    <span class="summary-value">{{ "%.0f"|format((sizing_result.design_factor - 1) * 100) }}%</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer Section -->
    <div class="footer-section">
        <div class="notes-section">
            <div class="notes-title">System Design Notes</div>
            <ul class="notes-list">
                <li>The system is sized to meet your daily energy requirement of {{ "%.2f"|format(sizing_result.total_daily_kwh) }} kWh.</li>
                <li>Roof area requirement includes spacing for mounting structures and maintenance access.</li>
                <li>Inverter size is optimized to prevent clipping while maintaining cost efficiency (DC/AC ratio: {{ "%.2f"|format(sizing_result.dc_ac_ratio) }}).</li>
                <li>All calculations use industry-standard derating factors for system reliability.</li>
                <li>System efficiency of {{ "%.0f"|format(sizing_result.system_efficiency * 100) }}% accounts for inverter losses, wiring losses, temperature effects, and soiling.</li>
                {% if sizing_result.battery_capacity_kwh %}
                <li>Battery capacity is calculated for {{ sizing_result.backup_hours }} hours of backup at {{ "%.0f"|format(sizing_result.essential_load_percent * 100) }}% essential load.</li>
                {% endif %}
            </ul>
        </div>
        
    </div>
</body>
</html>
"""


def generate_sizing_report_pdf(
    db: Session,
    project_id: int
) -> BytesIO:
    """
    Generate a PDF report for system sizing
    
    Returns a BytesIO object containing the PDF
    """
    # Fetch project with customer
    from sqlalchemy.orm import joinedload
    project = db.query(Project).options(joinedload(Project.customer)).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project {project_id} not found")
    
    customer = project.customer
    if not customer:
        raise ValueError(f"Customer not found for project {project_id}")
    
    # Fetch sizing result
    sizing_result = db.query(SizingResult).filter(SizingResult.project_id == project_id).first()
    if not sizing_result:
        raise ValueError(f"No sizing result found for project {project_id}")
    
    # Fetch company settings
    company_name_setting = db.query(Setting).filter(Setting.key == "company_name").first()
    company_address_setting = db.query(Setting).filter(Setting.key == "company_address").first()
    company_phone_setting = db.query(Setting).filter(Setting.key == "company_phone").first()
    company_email_setting = db.query(Setting).filter(Setting.key == "company_email").first()
    company_logo_url_setting = db.query(Setting).filter(Setting.key == "company_logo_url").first()
    
    # Get company details (prefer database settings, fallback to config)
    company_name = company_name_setting.value if company_name_setting else settings.COMPANY_NAME
    company_address = company_address_setting.value if company_address_setting else settings.COMPANY_ADDRESS
    company_phone = company_phone_setting.value if company_phone_setting else settings.COMPANY_PHONE
    company_email = company_email_setting.value if company_email_setting else settings.COMPANY_EMAIL
    
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
    
    generated_date = datetime.now().strftime('%B %d, %Y at %I:%M %p')
    
    # Render template
    env = Environment()
    
    template = env.from_string(SIZING_REPORT_TEMPLATE)
    html_content = template.render(
        company_name=company_name,
        company_address=company_address,
        company_phone=company_phone,
        company_email=company_email,
        project=project,
        customer=customer,
        sizing_result=sizing_result,
        generated_date=generated_date,
        logo_data_uri=logo_data_uri
    )
    
    # Generate PDF
    pdf_bytes = BytesIO()
    HTML(string=html_content).write_pdf(pdf_bytes, presentational_hints=True)
    pdf_bytes.seek(0)
    
    return pdf_bytes

