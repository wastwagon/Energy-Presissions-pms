#!/usr/bin/env python3
"""
Create Madam Pearl residential hybrid project + 2-option proforma (EP template).

Usage (inside backend container or local venv with DB):
  python -m app.scripts.create_madam_pearl_proforma

Writes PDF to: exports/madam_pearl_proforma.pdf (repo root)
"""
from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import (
    Appliance,
    ApplianceCategory,
    ApplianceType,
    Customer,
    CustomerType,
    PowerUnit,
    Product,
    ProductType,
    Project,
    ProjectStatus,
    Quote,
    QuoteItem,
    QuoteOption,
    Setting,
    SizingResult as SizingResultModel,
    SystemType,
    User,
)
from app.schemas import SizingInput
from app.services.load_calculator import calculate_appliance_daily_kwh, calculate_total_daily_kwh
from app.services.pdf_generator import generate_quotation_pdf
from app.services.quote_totals import refresh_quote_header_totals
from app.services.sizing import calculate_sizing

# --- Template metadata ---
CUSTOMER_NAME = "Madam Pearl"
INVOICE_NO = "EP-2025-00028"
TIN = "C0008609403"
PROJECT_REF = "PEARL-EP-2025-00028"
TAX_PERCENT = 20.0  # VAT 15% + NHIL 2.5% + GetFund 2.5%

OPTION_1_NARRATIVE = """HYBRID SYSTEM — PRICE: GHS 94,884

Panels: 8 Longi Solar panels of 570W.
Inverter: 6.5 kW Hybrid inverter.
Batteries: 10 kWh LiFePO4 Lithium Battery.
MAXIMUM OF 3500 WATTS.

The system will power: 1 standard fridge, 1 blender, 1 sound system, 1 iron, 1 rice cooker,
1 AC (1 or 1.5 HP max), 25 bulbs, 5 fans, 2 TVs, 3 computers/laptops, printer.

Best for clients focused on reducing bills and short-term backup for lights and lighter loads."""

OPTION_2_NARRATIVE = """HYBRID SYSTEM — PRICE: GHS 154,644

Option 2 upgrades backup storage to accommodate more appliances.

Panels: 16 Longi Solar panels of 570W.
Inverter: 10 kW Hybrid inverter.
Batteries: 20 kWh LiFePO4 Lithium Battery.

The system will power: 2 standard fridges/freezers, 1 blender, 1 sound system, 1 iron,
1 rice cooker/microwave, 2 ACs (1 / 1.5 / 2.5 HP), 30 bulbs, 4 fans, 2 TVs,
3 computers/laptops/printer."""

# (sku or None, qty, description, unit_price) — None sku = custom line
LineSpec = Tuple[Optional[str], float, str, float]

OPTION_1_LINES: List[LineSpec] = [
    ("PAN-LONGI-570", 8, "570W Longi Solar Panel", 1500),
    ("INV-HYBRID-6P5", 1, "6.5 kW Hybrid Inverter", 6500),
    ("BAT-LFP-5KWH", 2, "5 kWh Lithium Ion Battery", 13000),
    ("MNT-RAIL-SET-350", 5, "Mounting Structure (Rails)", 350),
    ("BOS-PV-CLAMP-EA", 28, "Mid clamps (18), End clamps (10)", 30),
    ("CAB-RR10MM-100M", 2, "RR 10MM Auto flex Cable (100m/coil)", 2500),
    ("CAB-PV-4MM-100M", 4, "Single Core 4mm PV Cable (100m/coil)", 2500),
    ("CAB-BATT-35MM-M", 20, "Battery Cable 35mm Copper Cable", 80),
    ("PRT-DC63-2P", 2, "63A DC MCB 2P breakers", 200),
    ("PRT-AC100-1P", 2, "100A AC Breaker", 250),
    ("PRT-CO-100A", 1, "100A Change Over", 1500),
    ("BOX-DB-6WAY", 1, "6-way Breaker Box", 180),
    ("BOX-DB-13WAY", 2, "13-way Breaker Boxes", 350),
    ("PRT-SPD-500V", 1, "SPD lightning arrester, 500V", 300),
    ("PRT-MCCB-250A", 2, "250A MCC Battery Breaker", 650),
    ("KIT-MISC-BOS", 1, "Miscellaneous (MC4, trunking, PVC, glands, fixings, etc.)", 1500),
    ("SRV-TRANSPORT-STD", 1, "Transportation of Logistics", 3000),
    ("SRV-INSTALL-6000", 1, "Installation & Commissioning", 6000),
]

OPTION_2_LINES: List[LineSpec] = [
    ("PAN-LONGI-570", 16, "570W Longi Solar Panel", 1500),
    ("INV-HYBRID-10K", 1, "10 kW Hybrid Inverter", 11000),
    ("BAT-LFP-5KWH", 4, "5 kWh Lithium Ion Battery", 13000),
    ("MNT-RAIL-SET-350", 8, "Mounting Structure (Rails)", 350),
    ("BOS-PV-CLAMP-EA", 48, "Mid clamps (32), End clamps (16)", 30),
    ("CAB-RR10MM-100M", 2, "RR 10MM AC Cable (100m/coil)", 2500),
    ("CAB-PV-6MM-100M", 4, "Single Core 6mm PV Cable (100m/coil)", 2500),
    ("CAB-BATT-50MM-M", 18, "Battery Cable 50mm Copper Cable", 200),
    ("CAB-BATT-35MM-M", 10, "Battery Cable 35mm Copper Cable", 90),
    ("PRT-DC63-2P", 3, "63A DC MCB 2P breakers", 200),
    ("PRT-AC100-1P", 1, "100A AC Breaker", 250),
    ("PRT-AC125-1P", 1, "125A AC Breaker", 300),
    ("PRT-CO-100A", 1, "100A Change Over", 1500),
    ("BOX-DB-6WAY", 1, "6-way Breaker Box", 180),
    ("BOX-DB-13WAY", 2, "13-way Breaker Boxes", 350),
    ("PRT-SPD-1000V", 1, "SPD lightning arrester, 1000V", 300),
    ("PRT-MCCB-250A", 2, "250A MCC Battery Breaker", 650),
    ("KIT-MISC-BOS-L", 1, "Miscellaneous (MC4, trunking, PVC, glands, fixings, etc.)", 2000),
    ("SRV-TRANSPORT-STD", 1, "Transportation of Logistics", 3000),
    ("SRV-INSTALL-8000", 1, "Installation & Commissioning", 8000),
]

EXTRA_PRODUCTS = [
    {
        "product_type": ProductType.INVERTER,
        "brand": "Hybrid",
        "model": "10kW",
        "capacity_kw": 10.0,
        "name": "10 kW Hybrid Inverter",
        "description": "10 kW hybrid inverter (Madam Pearl Option 2).",
        "short_description": "10 kW hybrid inverter",
        "category": "Inverters",
        "base_price": 11000.0,
        "price_type": "fixed",
        "sku": "INV-HYBRID-10K",
        "manage_stock": True,
        "in_stock": True,
        "stock_quantity": 0,
    },
]

ZENITH_BANK = {
    "company_bank_name": "Zenith Bank Ghana Limited",
    "company_account_name": "Energy Precisions Limited",
    "company_account_number": "6110112631",
    "company_bank_branch": "Head Office",
}


def _upsert_setting(db: Session, key: str, value: str) -> None:
    row = db.query(Setting).filter(Setting.key == key).first()
    if row:
        row.value = value
    else:
        db.add(
            Setting(
                key=key,
                value=value,
                description=f"Proforma bank detail ({key})",
                category="other",
            )
        )


def _ensure_products(db: Session) -> None:
    from app.scripts.seed_proforma_catalog_items import seed_proforma_catalog_items

    seed_proforma_catalog_items()
    for row in EXTRA_PRODUCTS:
        if not db.query(Product).filter(Product.sku == row["sku"]).first():
            db.add(Product(**row))
    db.commit()


def _get_product(db: Session, sku: str) -> Optional[Product]:
    return db.query(Product).filter(Product.sku == sku, Product.is_active == True).first()


def _add_appliances(db: Session, project_id: int) -> None:
    """Load list aligned with Option 1 narrative (Ghana-typical wattages)."""
    specs = [
        (ApplianceCategory.REFRIGERATION, ApplianceType.SINGLE_DOOR_FRIDGE, "Standard fridge", 150, 1, 24, True),
        (ApplianceCategory.COOKING, ApplianceType.BLENDER, "Blender", 500, 1, 0.2, False),
        (ApplianceCategory.ENTERTAINMENT, ApplianceType.SOUND_SYSTEM, "Sound system", 200, 1, 4, False),
        (ApplianceCategory.LAUNDRY, ApplianceType.IRON, "Pressing iron", 1200, 1, 0.5, False),
        (ApplianceCategory.COOKING, ApplianceType.RICE_COOKER, "Rice cooker", 800, 1, 1, False),
        (ApplianceCategory.COOLING, ApplianceType.SPLIT_AC_1_5HP, "Split AC (1.5 HP max)", 1.5, 1, 8, False),
        (ApplianceCategory.LIGHTING, ApplianceType.LED_BULB, "LED bulb (15W)", 15, 25, 6, False),
        (ApplianceCategory.COOLING, ApplianceType.CEILING_FAN, "Ceiling fan", 70, 5, 10, False),
        (ApplianceCategory.ENTERTAINMENT, ApplianceType.TV_55INCH_LED, "55-inch LED TV", 150, 2, 5, False),
        (ApplianceCategory.COMPUTING, ApplianceType.LAPTOP, "Laptop / computer", 65, 3, 6, False),
        (ApplianceCategory.COMPUTING, ApplianceType.PRINTER, "Printer", 100, 1, 2, False),
    ]
    for cat, atype, desc, power, qty, hours, essential in specs:
        pu = PowerUnit.HP if atype == ApplianceType.SPLIT_AC_1_5HP else PowerUnit.W
        atype_str = atype.value if hasattr(atype, "value") else str(atype)
        pu_str = pu.value if hasattr(pu, "value") else str(pu)
        daily = calculate_appliance_daily_kwh(power, pu_str, qty, hours, atype_str, db)
        db.add(
            Appliance(
                project_id=project_id,
                category=cat,
                appliance_type=atype,
                description=desc,
                power_value=power,
                power_unit=pu,
                quantity=qty,
                hours_per_day=hours,
                is_essential=essential,
                daily_kwh=daily,
            )
        )


def _add_option_lines(
    db: Session,
    quote_id: int,
    option_id: int,
    lines: List[LineSpec],
    start_sort: int = 0,
) -> float:
    total = 0.0
    for i, (sku, qty, desc, unit) in enumerate(lines):
        product = _get_product(db, sku) if sku else None
        line_total = qty * unit
        total += line_total
        db.add(
            QuoteItem(
                quote_id=quote_id,
                quote_option_id=option_id,
                product_id=product.id if product else None,
                description=desc,
                quantity=qty,
                unit_price=unit,
                total_price=line_total,
                sort_order=start_sort + i,
            )
        )
    return total


def create_madam_pearl_proforma() -> dict:
    db: Session = SessionLocal()
    try:
        _ensure_products(db)
        for key, val in ZENITH_BANK.items():
            _upsert_setting(db, key, val)
        db.commit()

        admin = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
        if not admin:
            admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            raise RuntimeError("No admin user found")

        customer = db.query(Customer).filter(Customer.name.ilike("%Madam Pearl%")).first()
        if not customer:
            customer = Customer(
                name=CUSTOMER_NAME,
                phone="",
                email="",
                address="Ghana",
                city="Accra",
                country="Ghana",
                customer_type=CustomerType.RESIDENTIAL,
                notes=f"Invoice no: {INVOICE_NO}\nTIN: {TIN}\nDate: 20/01/2026",
            )
            db.add(customer)
            db.flush()
            print(f"Created customer: {customer.name} (id={customer.id})")
        else:
            customer.notes = f"Invoice no: {INVOICE_NO}\nTIN: {TIN}\nDate: 20/01/2026"
            print(f"Using customer: {customer.name} (id={customer.id})")

        project = (
            db.query(Project)
            .filter(Project.reference_code == PROJECT_REF)
            .first()
        )
        if not project:
            project = Project(
                customer_id=customer.id,
                name="Madam Pearl — Residential Hybrid (2 options)",
                reference_code=PROJECT_REF,
                system_type=SystemType.HYBRID,
                status=ProjectStatus.NEW,
                created_by=admin.id,
            )
            db.add(project)
            db.flush()
            _add_appliances(db, project.id)
            print(f"Created project id={project.id}")
        else:
            print(f"Using project id={project.id}")

        total_kwh = calculate_total_daily_kwh(db, project.id)
        sizing_input = SizingInput(
            project_id=project.id,
            total_daily_kwh=total_kwh,
            location="Accra",
            panel_brand="Longi",
            backup_hours=10,
            essential_load_percent=0.5,
        )
        sizing_input.system_type = SystemType.HYBRID
        sizing_result = calculate_sizing(db, sizing_input)
        sizing_dict = sizing_result.model_dump(exclude={"id", "created_at"})
        existing_sizing = (
            db.query(SizingResultModel)
            .filter(SizingResultModel.project_id == project.id)
            .first()
        )
        if existing_sizing:
            for field, value in sizing_dict.items():
                setattr(existing_sizing, field, value)
        else:
            db.add(SizingResultModel(**sizing_dict))
        db.flush()
        print(f"Sizing: {sizing_result.system_size_kw} kW, {sizing_result.number_of_panels} panels")

        quote = (
            db.query(Quote)
            .filter(Quote.project_id == project.id, Quote.quote_number == INVOICE_NO)
            .first()
        )
        if quote:
            for opt in list(quote.options or []):
                for item in list(opt.items or []):
                    db.delete(item)
                db.delete(opt)
            for item in list(quote.items or []):
                db.delete(item)
            db.flush()
        else:
            quote = Quote(
                project_id=project.id,
                quote_number=INVOICE_NO,
                validity_days=30,
                tax_percent=TAX_PERCENT,
                discount_percent=0,
                payment_terms="30% deposit · 40% on delivery · 30% on completion",
                notes=(
                    f"RESIDENTIAL PROFORMA — {CUSTOMER_NAME}\n"
                    f"Invoice no: {INVOICE_NO} · TIN: {TIN}\n"
                    f"Document date: 20 January 2026 · Valid 30 days"
                ),
                created_by=admin.id,
                created_at=datetime(2026, 1, 20),
            )
            db.add(quote)
            db.flush()

        opt1 = QuoteOption(
            quote_id=quote.id,
            title="OPTION 1",
            narrative=OPTION_1_NARRATIVE,
            sort_order=0,
        )
        opt2 = QuoteOption(
            quote_id=quote.id,
            title="OPTION 2",
            narrative=OPTION_2_NARRATIVE,
            sort_order=1,
        )
        db.add(opt1)
        db.add(opt2)
        db.flush()

        t1 = _add_option_lines(db, quote.id, opt1.id, OPTION_1_LINES)
        t2 = _add_option_lines(db, quote.id, opt2.id, OPTION_2_LINES)
        db.flush()

        refresh_quote_header_totals(db, quote.id)
        db.commit()

        tax1 = t1 * (TAX_PERCENT / 100)
        tax2 = t2 * (TAX_PERCENT / 100)
        print(f"Option 1 subtotal GHS {t1:,.2f} + tax → GHS {t1 + tax1:,.2f} (target 94,884)")
        print(f"Option 2 subtotal GHS {t2:,.2f} + tax → GHS {t2 + tax2:,.2f} (target 154,644)")

        repo_root = Path(__file__).resolve().parents[3]
        out_dir = repo_root / "exports"
        out_dir.mkdir(parents=True, exist_ok=True)
        pdf_path = out_dir / "madam_pearl_proforma.pdf"
        pdf_bytes = generate_quotation_pdf(db, quote.id, document_type="proforma_invoice")
        pdf_path.write_bytes(pdf_bytes.read())
        print(f"PDF saved: {pdf_path}")

        return {
            "customer_id": customer.id,
            "project_id": project.id,
            "quote_id": quote.id,
            "quote_number": quote.quote_number,
            "pdf_path": str(pdf_path),
            "ui_project": f"http://localhost:5000/pms/projects/{project.id}",
            "ui_quote": f"http://localhost:5000/pms/quotes/{quote.id}",
        }
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    result = create_madam_pearl_proforma()
    print("\nDone.")
    for k, v in result.items():
        print(f"  {k}: {v}")
