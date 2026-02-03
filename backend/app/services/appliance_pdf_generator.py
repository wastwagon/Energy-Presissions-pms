"""
PDF Generation Service for Appliance Load Analysis
"""
from io import BytesIO
from pathlib import Path
import base64
from jinja2 import Template, Environment
from weasyprint import HTML
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Project, Appliance, Setting
from app.config import settings


APPLIANCE_REPORT_TEMPLATE = """
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
            padding: 30px 40px;
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
            font-size: 16pt;
            font-weight: bold;
            color: #00E676;
            margin: 25px 0 15px 0;
            border-bottom: 2px solid #00E676;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 9pt;
        }
        th {
            background: #00E676;
            color: #ffffff;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #00C85F;
        }
        th.text-right {
            text-align: right;
        }
        td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        td.text-right {
            text-align: right;
        }
        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total-box {
            margin-top: 25px;
            padding: 20px;
            background: #00E676;
            color: #ffffff;
            text-align: center;
            border-radius: 5px;
            font-size: 14pt;
            font-weight: bold;
        }
        .summary-section {
            margin-top: 30px;
            padding: 15px;
            background: #f0f8ff;
            border-left: 4px solid #00E676;
            border-radius: 4px;
        }
        .summary-item {
            margin: 8px 0;
            font-size: 10pt;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 9pt;
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
            padding: 12px 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11pt;
            border: 1px solid #00C85F;
        }
        th.text-right {
            text-align: right;
        }
        td {
            padding: 12px 10px;
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
        .total-box {
            margin-top: 20px;
            padding: 20px;
            background: #00E676;
            color: #ffffff;
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            border-radius: 5px;
        }
        .summary-section {
            margin-top: 30px;
            padding: 15px;
            background: #f0f8ff;
            border-left: 4px solid #00E676;
            border-radius: 4px;
        }
        .summary-item {
            margin: 8px 0;
            font-size: 10pt;
        }
        .footer-section {
            padding: 30px 40px;
            background: #ffffff;
        }
        .footer-title {
            font-size: 14pt;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }
        .footer-text {
            font-size: 10pt;
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
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
            <div class="report-title">LOAD ANALYSIS</div>
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
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th class="text-right">Power</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Hours/Day</th>
                        <th class="text-right">Daily kWh</th>
                    </tr>
                </thead>
                <tbody>
                    {% for appliance in appliances %}
                    <tr>
                        <td>{{ appliance.category.replace('_', ' ').upper() }}</td>
                        <td>{{ appliance.appliance_type.replace('_', ' ').title() }}</td>
                        <td>{{ appliance.description }}</td>
                        <td class="text-right">{{ appliance.power_value }} {{ appliance.power_unit }}</td>
                        <td class="text-right">{{ appliance.quantity }}</td>
                        <td class="text-right">{{ appliance.hours_per_day }}</td>
                        <td class="text-right">{{ "%.2f"|format(appliance.daily_kwh) }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>

            <div class="total-box">
                Total Daily Energy Consumption: {{ "%.2f"|format(total_daily_kwh) }} kWh
            </div>
        </div>
    </div>

    <!-- Footer Section -->
    <div class="footer-section">
        <div class="summary-section">
            <div class="footer-title">Load Analysis Summary</div>
            <div class="footer-text">
                <div class="summary-item">
                    <strong>Total Appliances:</strong> {{ appliances|length }} items
                </div>
                <div class="summary-item">
                    <strong>Monthly Energy Requirement:</strong> {{ "%.2f"|format(total_daily_kwh * 30) }} kWh/month
                </div>
                <div class="summary-item">
                    <strong>Annual Energy Requirement:</strong> {{ "%.2f"|format(total_daily_kwh * 365) }} kWh/year
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""


def generate_appliance_report_pdf(
    db: Session,
    project_id: int
) -> BytesIO:
    """
    Generate a PDF report for appliance load analysis
    
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
    
    # Fetch appliances
    appliances = db.query(Appliance).filter(Appliance.project_id == project_id).order_by(Appliance.category, Appliance.id).all()
    
    if not appliances:
        raise ValueError(f"No appliances found for project {project_id}")
    
    # Calculate totals
    total_daily_kwh = sum(app.daily_kwh or 0 for app in appliances)
    essential_appliances = [app for app in appliances if app.is_essential]
    essential_count = len(essential_appliances)
    essential_kwh = sum(app.daily_kwh or 0 for app in essential_appliances)
    non_essential_count = len(appliances) - essential_count
    non_essential_kwh = total_daily_kwh - essential_kwh
    
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
    
    template = env.from_string(APPLIANCE_REPORT_TEMPLATE)
    html_content = template.render(
        company_name=company_name,
        company_address=company_address,
        company_phone=company_phone,
        company_email=company_email,
        project=project,
        customer=customer,
        appliances=appliances,
        total_daily_kwh=total_daily_kwh,
        essential_count=essential_count,
        essential_kwh=essential_kwh,
        non_essential_count=non_essential_count,
        non_essential_kwh=non_essential_kwh,
        generated_date=generated_date,
        logo_data_uri=logo_data_uri
    )
    
    # Generate PDF
    pdf_bytes = BytesIO()
    HTML(string=html_content).write_pdf(pdf_bytes, presentational_hints=True)
    pdf_bytes.seek(0)
    
    return pdf_bytes

