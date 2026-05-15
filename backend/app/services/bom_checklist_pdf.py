"""
Site handover BOM checklist PDF — tick boxes for install / commissioning sign-off.
"""
from __future__ import annotations

from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional

import base64
from jinja2 import Environment
from sqlalchemy.orm import Session, joinedload
from weasyprint import HTML

from app.config import settings
from app.models import (
    Customer,
    Product,
    Project,
    Quote,
    QuoteItem,
    QuoteOption,
    Setting,
    SizingResult as SizingResultModel,
)
from app.services.bom_audit import audit_quote
from app.services.bom_catalog_usage import CATALOG_BOM_ITEMS, RECOMMENDED_MANUAL_LINES
from app.services.quote_totals import get_primary_quote_option_id


def _logo_data_uri(db: Session) -> Optional[str]:
    company_logo_url_setting = db.query(Setting).filter(Setting.key == "company_logo_url").first()
    logo_path = None
    if company_logo_url_setting and company_logo_url_setting.value:
        logo_url = company_logo_url_setting.value.lstrip("/")
        static_logo = Path("static") / logo_url.split("/")[-1]
        if static_logo.exists():
            logo_path = static_logo
    if not logo_path:
        for candidate in (
            Path("static/logo.jpg"),
            Path("frontend_public/logo.jpg"),
            Path("logo.jpg"),
        ):
            if candidate.exists():
                logo_path = candidate
                break
    if not logo_path:
        return None
    try:
        ext = logo_path.suffix.lower()
        mime = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}.get(
            ext, "image/jpeg"
        )
        data = base64.b64encode(logo_path.read_bytes()).decode("utf-8")
        return f"data:{mime};base64,{data}"
    except OSError:
        return None


CHECKLIST_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #222; }
    h1 { color: #00a85a; font-size: 18pt; margin: 0 0 4px 0; }
    h2 { font-size: 12pt; margin: 18px 0 8px 0; color: #333; border-bottom: 2px solid #00E676; padding-bottom: 4px; }
    .meta { font-size: 9pt; color: #555; margin-bottom: 12px; }
    .meta div { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f0f0f0; font-size: 9pt; }
    .chk { width: 28px; text-align: center; font-size: 14pt; }
    .qty { width: 50px; text-align: center; }
    .sku { font-size: 8pt; color: #666; }
    .note { font-size: 8pt; color: #666; }
    .sign { margin-top: 24px; }
    .sign-line { border-top: 1px solid #333; width: 45%; display: inline-block; margin-top: 32px; padding-top: 4px; font-size: 9pt; }
    .footer { margin-top: 20px; font-size: 8pt; color: #888; }
  </style>
</head>
<body>
  {% if logo_data_uri %}
  <img src="{{ logo_data_uri }}" style="max-height: 56px; margin-bottom: 8px;" />
  {% endif %}
  <h1>BOM Site Handover Checklist</h1>
  <div class="meta">
    <div><strong>Quote:</strong> {{ quote.quote_number }}</div>
    <div><strong>Customer:</strong> {{ customer.name }}</div>
    <div><strong>Project:</strong> {{ project.name }}</div>
    {% if option_title %}<div><strong>Option:</strong> {{ option_title }}</div>{% endif %}
    <div><strong>System:</strong> {{ project_system_type }} — {{ sizing_kw }} kW,
      {{ sizing_panels }} panels{% if sizing_strings %}, {{ sizing_strings }} DC strings{% endif %}</div>
    <div><strong>Date:</strong> {{ generated_date }}</div>
  </div>

  <h2>Core equipment</h2>
  <table>
    <tr><th class="chk">☐</th><th>Description</th><th class="qty">Qty</th><th>Notes</th></tr>
    {% for row in core_rows %}
    <tr>
      <td class="chk"></td>
      <td>{{ row.description }}</td>
      <td class="qty">{{ row.quantity }}</td>
      <td class="note">{{ row.note or '' }}</td>
    </tr>
    {% endfor %}
  </table>

  <h2>Balance of system (catalog BOM)</h2>
  <table>
    <tr><th class="chk">☐</th><th>Item</th><th class="qty">Qty</th><th>SKU / usage</th></tr>
    {% for row in bom_rows %}
    <tr>
      <td class="chk"></td>
      <td>{{ row.name }}</td>
      <td class="qty">{{ row.quantity }}</td>
      <td class="sku">{{ row.sku }}{% if row.usage %} — {{ row.usage }}{% endif %}</td>
    </tr>
    {% endfor %}
  </table>

  {% if manual_rows %}
  <h2>Site / manual items (confirm on site)</h2>
  <table>
    <tr><th class="chk">☐</th><th>Item</th><th>Notes</th></tr>
    {% for row in manual_rows %}
    <tr>
      <td class="chk"></td>
      <td>{{ row.item }}</td>
      <td class="note">{{ row.reason }}</td>
    </tr>
    {% endfor %}
  </table>
  {% endif %}

  <h2>Commissioning sign-off</h2>
  <div class="sign">
    <span class="sign-line">Installer / lead technician</span>
    &nbsp;&nbsp;&nbsp;
    <span class="sign-line">Client representative</span>
  </div>
  <div class="sign" style="margin-top: 16px;">
    <span class="sign-line">Date completed</span>
    &nbsp;&nbsp;&nbsp;
    <span class="sign-line">Energy Precisions QC</span>
  </div>

  <div class="footer">
    Generated from sizing-driven BOM. Tick each line when delivered to site and installed.
    Final string design (VD, Isc) remains the supervising engineer's responsibility.
  </div>
</body>
</html>
"""



def _core_equipment_rows(items: List[QuoteItem], db: Session) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for item in items:
        is_core = False
        desc = (item.description or "").upper()
        if any(k in desc for k in ("PANEL", "INVERTER", "BATTERY", "MOUNTING")):
            is_core = True
        if item.product_id:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product and product.product_type.value in (
                "panel",
                "inverter",
                "battery",
                "mounting",
            ):
                is_core = True
        if is_core:
            rows.append(
                {
                    "description": item.description,
                    "quantity": item.quantity,
                    "note": "",
                }
            )
    return rows


def generate_bom_checklist_pdf(
    db: Session,
    quote_id: int,
    quote_option_id: Optional[int] = None,
) -> BytesIO:
    quote = (
        db.query(Quote)
        .options(
            joinedload(Quote.items),
            joinedload(Quote.options).joinedload(QuoteOption.items),
            joinedload(Quote.project).joinedload(Project.customer),
        )
        .filter(Quote.id == quote_id)
        .first()
    )
    if not quote:
        raise ValueError(f"Quote {quote_id} not found")

    project = quote.project or db.query(Project).filter(Project.id == quote.project_id).first()
    customer = None
    if project:
        customer = project.customer or db.query(Customer).filter(
            Customer.id == project.customer_id
        ).first()
    if not project or not customer:
        raise ValueError("Project or customer not found")

    opt_id = quote_option_id or get_primary_quote_option_id(db, quote_id)
    option_title = None
    items: List[QuoteItem] = list(quote.items or [])
    if quote.options:
        for opt in quote.options:
            if opt.id == opt_id:
                option_title = opt.title
                items = list(opt.items or [])
                break

    audit = audit_quote(db, quote_id, opt_id)
    bom_rows: List[Dict[str, Any]] = []
    for row in audit.get("ready_skus") or []:
        sku = row.get("sku", "")
        meta = CATALOG_BOM_ITEMS.get(sku, {})
        bom_rows.append(
            {
                "sku": sku,
                "name": row.get("product_name") or meta.get("name", sku),
                "quantity": row.get("expected_qty"),
                "usage": (meta.get("usage") or "")[:120],
            }
        )
    for row in audit.get("missing_on_quote") or []:
        sku = row.get("sku", "")
        meta = CATALOG_BOM_ITEMS.get(sku, {})
        bom_rows.append(
            {
                "sku": sku,
                "name": (meta.get("name", sku) or sku) + " (add to quote)",
                "quantity": row.get("expected_qty"),
                "usage": meta.get("usage", ""),
            }
        )

    sizing = (
        db.query(SizingResultModel)
        .filter(SizingResultModel.project_id == project.id)
        .first()
    )

    env = Environment()
    template = env.from_string(CHECKLIST_TEMPLATE)
    html_content = template.render(
        logo_data_uri=_logo_data_uri(db),
        quote=quote,
        customer=customer,
        project=project,
        project_system_type=(
            project.system_type.value
            if hasattr(project.system_type, "value")
            else str(project.system_type)
        ),
        option_title=option_title,
        sizing_kw=f"{sizing.system_size_kw:.2f}" if sizing and sizing.system_size_kw else "—",
        sizing_panels=sizing.number_of_panels if sizing else "—",
        sizing_strings=getattr(sizing, "dc_string_count", None) if sizing else None,
        generated_date=datetime.now().strftime("%d %b %Y"),
        core_rows=_core_equipment_rows(items, db),
        bom_rows=bom_rows,
        manual_rows=RECOMMENDED_MANUAL_LINES,
    )

    pdf_buffer = BytesIO()
    HTML(string=html_content).write_pdf(pdf_buffer)
    pdf_buffer.seek(0)
    return pdf_buffer
