"""
PDF Generation Service for Reports & Analytics
"""
from io import BytesIO
from jinja2 import Template, Environment
from weasyprint import HTML
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Setting


def format_currency(value):
    """Format currency value"""
    if value is None:
        return "0.00"
    return f"{float(value):,.2f}"


REPORT_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 1.5cm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #333;
            background: #ffffff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #00E676;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24pt;
            color: #00E676;
            margin-bottom: 10px;
        }
        .header h2 {
            font-size: 14pt;
            color: #666;
            font-weight: normal;
        }
        .period-info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
            font-size: 11pt;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 16pt;
            font-weight: bold;
            color: #00E676;
            margin-bottom: 15px;
            border-bottom: 2px solid #00E676;
            padding-bottom: 5px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            padding: 15px;
            background: #f9f9f9;
        }
        .stat-label {
            font-size: 9pt;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-value {
            font-size: 18pt;
            font-weight: bold;
            color: #00E676;
        }
        .stat-subvalue {
            font-size: 9pt;
            color: #999;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th {
            background: #00E676;
            color: #ffffff;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 10pt;
        }
        th.text-right {
            text-align: right;
        }
        td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 10pt;
        }
        td.text-right {
            text-align: right;
        }
        .insights-box {
            background: #f0f8ff;
            border-left: 4px solid #00E676;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .insights-title {
            font-weight: bold;
            color: #00E676;
            margin-bottom: 10px;
            font-size: 11pt;
        }
        .insight-item {
            margin: 8px 0;
            font-size: 10pt;
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 9pt;
        }
        .highlight {
            color: #00E676;
            font-weight: bold;
        }
        .positive {
            color: #4caf50;
        }
        .negative {
            color: #f44336;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>REPORTS & ANALYTICS</h1>
        <h2>{{ company_name }}</h2>
    </div>
    
    <div class="period-info">
        <strong>Report Period:</strong> {{ period_start }} to {{ period_end }}<br>
        <strong>Generated:</strong> {{ generated_date }}
    </div>

    <!-- Key Metrics Section -->
    <div class="section">
        <div class="section-title">Key Performance Metrics</div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Quotes</div>
                <div class="stat-value">{{ total_quotes }}</div>
                <div class="stat-subvalue">Quotes in period</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Conversion Rate</div>
                <div class="stat-value">{{ conversion_rate }}%</div>
                <div class="stat-subvalue">{{ accepted_quotes }} accepted</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Quoted Value</div>
                <div class="stat-value">GH₵ {{ total_quoted_value|format_currency }}</div>
                <div class="stat-subvalue">All quotes combined</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Accepted Value</div>
                <div class="stat-value">GH₵ {{ accepted_value|format_currency }}</div>
                <div class="stat-subvalue">Revenue potential</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average Quote Value</div>
                <div class="stat-value">GH₵ {{ average_quote_value|format_currency }}</div>
                <div class="stat-subvalue">Per quote</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Average System Size</div>
                <div class="stat-value">{{ average_system_size_kw }} kW</div>
                <div class="stat-subvalue">PV capacity</div>
            </div>
        </div>
    </div>

    <!-- Calculation Insights -->
    <div class="section">
        <div class="section-title">Calculation Insights</div>
        <div class="insights-box">
            <div class="insights-title">📊 Performance Analysis</div>
            <div class="insight-item">
                • <strong>Conversion Rate:</strong> {{ conversion_rate }}% of quotes were accepted
                {% if conversion_rate >= 30 %}
                <span class="positive">(Excellent performance)</span>
                {% elif conversion_rate >= 20 %}
                <span class="highlight">(Good performance)</span>
                {% else %}
                <span class="negative">(Needs improvement)</span>
                {% endif %}
            </div>
            <div class="insight-item">
                • <strong>Average Quote Value:</strong> GH₵ {{ average_quote_value|format_currency }} per quote
                {% if average_quote_value > 0 %}
                <span class="highlight">({{ (accepted_value / total_quoted_value * 100)|round(1) }}% of total value accepted)</span>
                {% endif %}
            </div>
            <div class="insight-item">
                • <strong>Revenue Trend:</strong> 
                {% if revenue_change_percent > 0 %}
                <span class="positive">+{{ revenue_change_percent|round(1) }}%</span> increase compared to previous period
                {% elif revenue_change_percent < 0 %}
                <span class="negative">{{ revenue_change_percent|round(1) }}%</span> decrease compared to previous period
                {% else %}
                No change from previous period
                {% endif %}
            </div>
            <div class="insight-item">
                • <strong>System Sizing:</strong> Average system size of {{ average_system_size_kw }} kW indicates 
                {% if average_system_size_kw >= 10 %}
                <span class="highlight">large-scale installations</span>
                {% elif average_system_size_kw >= 5 %}
                <span class="highlight">medium-scale installations</span>
                {% else %}
                <span class="highlight">residential-scale installations</span>
                {% endif %}
            </div>
            {% if pending_quotes > 0 %}
            <div class="insight-item">
                • <strong>Pending Quotes:</strong> {{ pending_quotes }} quotes awaiting response
                <span class="highlight">({{ (pending_quotes / total_quotes * 100)|round(1) }}% of total)</span>
            </div>
            {% endif %}
            {% if rejected_quotes > 0 %}
            <div class="insight-item">
                • <strong>Rejected Quotes:</strong> {{ rejected_quotes }} quotes were rejected
                <span class="negative">({{ (rejected_quotes / total_quotes * 100)|round(1) }}% of total)</span>
            </div>
            {% endif %}
        </div>
    </div>

    <!-- Quotes by Status -->
    <div class="section">
        <div class="section-title">Quotes by Status</div>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th class="text-right">Count</th>
                    <th class="text-right">Percentage</th>
                </tr>
            </thead>
            <tbody>
                {% for status, count in quotes_by_status.items() %}
                <tr>
                    <td>{{ status|upper }}</td>
                    <td class="text-right">{{ count }}</td>
                    <td class="text-right">{{ (count / total_quotes * 100)|round(1) }}%</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>

    <!-- Quotes by Month -->
    <div class="section">
        <div class="section-title">Quotes by Month</div>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th class="text-right">Quote Count</th>
                </tr>
            </thead>
            <tbody>
                {% for item in quotes_by_month %}
                <tr>
                    <td>{{ item.month }}</td>
                    <td class="text-right">{{ item.count }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>

</body>
</html>
"""


def generate_report_pdf(
    db: Session,
    analytics_data: dict
) -> BytesIO:
    """
    Generate a PDF report from analytics data
    
    Returns a BytesIO object containing the PDF
    """
    # Fetch company settings
    company_name_setting = db.query(Setting).filter(Setting.key == "company_name").first()
    company_email_setting = db.query(Setting).filter(Setting.key == "company_email").first()
    
    company_name = company_name_setting.value if company_name_setting else "Energy Precisions"
    company_email = company_email_setting.value if company_email_setting else None
    
    # Format dates
    period_start = datetime.fromisoformat(analytics_data['period']['start'].replace('Z', '+00:00')).strftime('%B %d, %Y')
    period_end = datetime.fromisoformat(analytics_data['period']['end'].replace('Z', '+00:00')).strftime('%B %d, %Y')
    generated_date = datetime.now().strftime('%B %d, %Y at %I:%M %p')
    
    # Render template
    env = Environment()
    env.filters['format_currency'] = format_currency
    
    template = env.from_string(REPORT_TEMPLATE)
    html_content = template.render(
        company_name=company_name,
        company_email=company_email,
        period_start=period_start,
        period_end=period_end,
        generated_date=generated_date,
        **analytics_data
    )
    
    # Generate PDF
    pdf_bytes = BytesIO()
    HTML(string=html_content).write_pdf(pdf_bytes, presentational_hints=True)
    pdf_bytes.seek(0)
    
    return pdf_bytes

