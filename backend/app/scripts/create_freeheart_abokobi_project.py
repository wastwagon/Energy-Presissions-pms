#!/usr/bin/env python3
"""
Freeheart — Abokobi apartment block (standalone). Glass building is a separate project.

Use split_freeheart_abokobi_projects to separate an existing combined project.

Usage:
  python -m app.scripts.create_freeheart_abokobi_project
  python -m app.scripts.split_freeheart_abokobi_projects
"""
from __future__ import annotations

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session, joinedload

from app.database import SessionLocal
from app.models import (
    Appliance,
    ApplianceCategory,
    ApplianceType,
    Customer,
    CustomerType,
    PowerUnit,
    Project,
    ProjectStatus,
    Quote,
    QuoteOption,
    Setting,
    SizingResult as SizingResultModel,
    SystemType,
    User,
)
from app.schemas import SizingInput
from app.services.bom_fix import fix_quote_bom
from app.services.bom_from_catalog import append_standard_bom_from_catalog
from app.services.load_calculator import calculate_appliance_daily_kwh, calculate_total_daily_kwh
from app.services.pdf_generator import generate_quotation_pdf
from app.services.pricing import generate_quote_items_from_sizing
from app.services.quote_totals import refresh_quote_header_totals
from app.services.sizing import calculate_sizing

# Dummy client where site contact not provided
CUSTOMER_NAME = "Freeheart Properties"
CONTACT_NAME = "Site Contact — Abokobi"
PHONE = "+233200000000"
EMAIL = "freeheart.abokobi@example.com"
PROJECT_REF = "FREEHEART-ABOKOBI-001"
LOCATION = "Accra"  # Abokobi, Greater Accra — use Accra peak sun hours


def _add_appliance(db: Session, project_id: int, spec: dict) -> float:
    pu = spec["power_unit"]
    at = spec["appliance_type"]
    pu_str = pu.value if hasattr(pu, "value") else str(pu)
    at_str = at.value if hasattr(at, "value") else str(at)
    daily = calculate_appliance_daily_kwh(
        spec["power_value"], pu_str, spec["quantity"], spec["hours_per_day"], at_str, db
    )
    db.add(Appliance(project_id=project_id, daily_kwh=daily, **spec))
    return daily


def _apt_floor_specs(floor_label: str, lights_per_side: int, sockets_per_side: int, fans_per_side: int) -> list:
    """One apartment floor: left + right wing counts."""
    lights = lights_per_side * 2
    sockets = sockets_per_side * 2
    fans = fans_per_side * 2
    return [
        {
            "category": ApplianceCategory.LIGHTING,
            "appliance_type": ApplianceType.LED_BULB,
            "description": f"Apartment {floor_label} — LED lights (L+R wings)",
            "power_value": 12,
            "power_unit": PowerUnit.W,
            "quantity": lights,
            "hours_per_day": 8,
            "is_essential": True,
        },
        {
            "category": ApplianceCategory.OTHER,
            "appliance_type": ApplianceType.OTHER,
            "description": f"Apartment {floor_label} — general power outlets (L+R)",
            "power_value": 150,
            "power_unit": PowerUnit.W,
            "quantity": sockets,
            "hours_per_day": 6,
            "is_essential": False,
        },
        {
            "category": ApplianceCategory.VENTILATION,
            "appliance_type": ApplianceType.CEILING_FAN,
            "description": f"Apartment {floor_label} — ceiling fans (L+R)",
            "power_value": 70,
            "power_unit": PowerUnit.W,
            "quantity": fans,
            "hours_per_day": 12,
            "is_essential": False,
        },
    ]


def _glass_floor_specs(floor_label: str, lights: int, sockets: int, fans: int) -> list:
    return [
        {
            "category": ApplianceCategory.LIGHTING,
            "appliance_type": ApplianceType.LED_BULB,
            "description": f"Glass building {floor_label} — LED lights",
            "power_value": 12,
            "power_unit": PowerUnit.W,
            "quantity": lights,
            "hours_per_day": 8,
            "is_essential": True,
        },
        {
            "category": ApplianceCategory.OTHER,
            "appliance_type": ApplianceType.OTHER,
            "description": f"Glass building {floor_label} — power outlets",
            "power_value": 150,
            "power_unit": PowerUnit.W,
            "quantity": sockets,
            "hours_per_day": 6,
            "is_essential": False,
        },
        {
            "category": ApplianceCategory.VENTILATION,
            "appliance_type": ApplianceType.CEILING_FAN,
            "description": f"Glass building {floor_label} — fans",
            "power_value": 70,
            "power_unit": PowerUnit.W,
            "quantity": fans,
            "hours_per_day": 12,
            "is_essential": False,
        },
    ]


def build_apartment_specs() -> list[dict]:
    specs: list[dict] = []
    for _floor, label in [
        ("ground", "Ground floor"),
        ("1st", "1st floor"),
        ("2nd", "2nd floor"),
    ]:
        specs.extend(_apt_floor_specs(label, lights_per_side=9, sockets_per_side=10, fans_per_side=4))
    return specs


def build_glass_specs() -> list[dict]:
    """Glass building — client counts per floor (Down / 1st / 2nd)."""
    return [
        *_glass_floor_specs("Down floor", lights=8, sockets=4, fans=2),
        *_glass_floor_specs("1st floor", lights=7, sockets=4, fans=2),
        *_glass_floor_specs("2nd floor", lights=9, sockets=7, fans=2),
    ]


def build_appliance_specs() -> list[dict]:
    """Apartment only (legacy name)."""
    return build_apartment_specs()


def create_freeheart_abokobi_project() -> dict:
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
        if not admin:
            admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            raise RuntimeError("No admin user found")

        customer = db.query(Customer).filter(Customer.name == CUSTOMER_NAME).first()
        if not customer:
            customer = Customer(
                name=CUSTOMER_NAME,
                phone=PHONE,
                email=EMAIL,
                address="Freeheart, Abokobi, Greater Accra",
                city="Abokobi",
                country="Ghana",
                customer_type=CustomerType.COMMERCIAL,
                notes=(
                    "Abokobi sites: apartment block and glass building (separate projects). "
                    "Load survey per Energy Precisions walk-through (May 2026)."
                ),
            )
            db.add(customer)
            db.flush()
            print(f"Created customer: {customer.name} (id={customer.id})")
        else:
            print(f"Using customer: {customer.name} (id={customer.id})")

        project = db.query(Project).filter(Project.reference_code == PROJECT_REF).first()
        if project:
            db.query(Appliance).filter(Appliance.project_id == project.id).delete()
            db.query(SizingResultModel).filter(SizingResultModel.project_id == project.id).delete()
            for q in db.query(Quote).filter(Quote.project_id == project.id).all():
                for opt in list(q.options or []):
                    for item in list(opt.items or []):
                        db.delete(item)
                    db.delete(opt)
                for item in list(q.items or []):
                    db.delete(item)
                db.delete(q)
            db.flush()
            print(f"Reset project id={project.id}")
        else:
            project = Project(
                customer_id=customer.id,
                name="Freeheart — Abokobi Apartment Block",
                reference_code=PROJECT_REF,
                system_type=SystemType.HYBRID,
                status=ProjectStatus.NEW,
                created_by=admin.id,
            )
            db.add(project)
            db.flush()
            print(f"Created project id={project.id}")

        project.name = "Freeheart — Abokobi Apartment Block"

        print("\nLoad summary — apartment block only (×3 floors):")
        print("  Per floor (L+R wings): 18 lights, 20 sockets, 8 fans\n")

        appliance_specs = build_apartment_specs()
        print("Adding appliances...")
        for spec in appliance_specs:
            kwh = _add_appliance(db, project.id, spec)
            print(f"  {spec['quantity']}× {spec['description']}: {kwh:.2f} kWh/day")

        db.flush()
        total_raw = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=False)
        total_div = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=True)
        print(f"\nTotal load (raw): {total_raw:.2f} kWh/day")
        print(f"Total load (diversity): {total_div:.2f} kWh/day")

        sizing_input = SizingInput(
            project_id=project.id,
            total_daily_kwh=total_div,
            location=LOCATION,
            panel_brand="Longi",
            backup_hours=8,
            essential_load_percent=0.6,
        )
        sizing_input.system_type = SystemType.HYBRID
        sizing_result = calculate_sizing(db, sizing_input)
        db.add(SizingResultModel(**sizing_result.model_dump(exclude={"id", "created_at"})))
        db.flush()

        print(
            f"\nSizing (hybrid, 8h backup):\n"
            f"  System: {sizing_result.system_size_kw} kW\n"
            f"  Panels: {sizing_result.number_of_panels} × {sizing_result.panel_wattage}W\n"
            f"  Inverter: {sizing_result.inverter_size_kw} kW\n"
            f"  Battery: {sizing_result.battery_capacity_kwh} kWh\n"
            f"  DC strings: {getattr(sizing_result, 'dc_string_count', '—')}"
        )

        default_tax = 20.0
        tax_setting = db.query(Setting).filter(Setting.key == "default_tax_percent").first()
        if tax_setting:
            try:
                default_tax = float(tax_setting.value)
            except (ValueError, TypeError):
                pass

        quote_number = f"QT-FREEHEART-{uuid.uuid4().hex[:6].upper()}"
        quote = Quote(
            project_id=project.id,
            quote_number=quote_number,
            validity_days=30,
            tax_percent=default_tax,
            discount_percent=0,
            payment_terms="30% deposit · 40% on delivery · 30% on commissioning",
            notes=(
                f"Site: Freeheart, Abokobi — apartment block only (3 floors, L+R wings).\n"
                f"Load basis: client point count per floor — 18 lights, 20 outlets, 8 fans.\n"
                f"Assumptions: 12W LED, 150W diversified outlet load, 70W fans.\n"
                f"Contact: {CONTACT_NAME} {PHONE}"
            ),
            created_by=admin.id,
        )
        db.add(quote)
        db.flush()

        opt = QuoteOption(
            quote_id=quote.id,
            title="Hybrid Solar Package",
            narrative=(
                f"Hybrid solar for ~{total_div:.0f} kWh/day at Abokobi (Accra sun data). "
                f"{sizing_result.number_of_panels}× {sizing_result.panel_wattage}W panels, "
                f"{sizing_result.inverter_size_kw} kW hybrid inverter, "
                f"{sizing_result.battery_capacity_kwh} kWh storage (8h essential backup)."
            ),
            sort_order=0,
        )
        db.add(opt)
        db.flush()

        sizing_row = (
            db.query(SizingResultModel).filter(SizingResultModel.project_id == project.id).first()
        )
        items = generate_quote_items_from_sizing(db, sizing_row, quote.id, opt.id)
        for item in items:
            db.add(item)
        db.flush()

        bom_setting = db.query(Setting).filter(Setting.key == "append_catalog_bom_on_quote").first()
        bom_on = not bom_setting or str(bom_setting.value).strip().lower() not in ("0", "false", "no")
        if bom_on and items:
            next_so = max((i.sort_order for i in items), default=-1) + 1
            n_extra = append_standard_bom_from_catalog(
                db, quote.id, opt.id, project.system_type, sizing_row, start_sort_order=next_so
            )
            if n_extra:
                print(f"Appended {n_extra} catalog BOM line(s)")

        refresh_quote_header_totals(db, quote.id)
        db.commit()

        fix_quote_bom(db, quote.id, opt.id)

        db.refresh(quote)
        quote = (
            db.query(Quote)
            .options(joinedload(Quote.options).joinedload(QuoteOption.items))
            .filter(Quote.id == quote.id)
            .first()
        )
        print(f"\nQuote {quote.quote_number}: GHS {quote.grand_total:,.2f} (incl. tax)")

        out_dir = Path("/app/exports")
        if not out_dir.exists():
            out_dir = Path(__file__).resolve().parents[3] / "exports"
        out_dir.mkdir(parents=True, exist_ok=True)

        quotation_path = out_dir / "freeheart_abokobi_quotation.pdf"
        quotation_path.write_bytes(
            generate_quotation_pdf(db, quote.id, document_type="quotation").read()
        )
        proforma_path = out_dir / "freeheart_abokobi_proforma.pdf"
        proforma_path.write_bytes(
            generate_quotation_pdf(db, quote.id, document_type="proforma_invoice").read()
        )
        print(f"PDF: {quotation_path}")
        print(f"PDF: {proforma_path}")

        return {
            "customer_id": customer.id,
            "project_id": project.id,
            "quote_id": quote.id,
            "quote_number": quote.quote_number,
            "grand_total_ghs": quote.grand_total,
            "daily_kwh_diversity": round(total_div, 2),
            "system_kw": sizing_result.system_size_kw,
            "battery_kwh": sizing_result.battery_capacity_kwh,
            "panels": sizing_result.number_of_panels,
            "quotation_pdf": str(quotation_path),
            "proforma_pdf": str(proforma_path),
            "ui_project": f"http://localhost:5000/pms/projects/{project.id}",
            "ui_quote": f"http://localhost:5000/pms/quotes/{quote.id}",
        }
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    info = create_freeheart_abokobi_project()
    print("\n" + "=" * 60)
    for k, v in info.items():
        print(f"  {k}: {v}")
