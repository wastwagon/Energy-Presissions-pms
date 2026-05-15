#!/usr/bin/env python3
"""
Mr Collins — 40-room hotel (Eastern Region), off-grid solar load + sizing + quotation PDF.

Usage:
  python -m app.scripts.create_collins_hotel_project
"""
from __future__ import annotations

import sys
import uuid
from datetime import datetime
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
    QuoteItem,
    QuoteOption,
    Setting,
    SizingResult as SizingResultModel,
    SystemType,
    User,
)
from app.schemas import SizingInput
from app.services.bom_from_catalog import append_standard_bom_from_catalog
from app.services.load_calculator import calculate_appliance_daily_kwh, calculate_total_daily_kwh
from app.services.pdf_generator import generate_quotation_pdf
from app.services.pricing import generate_quote_items_from_sizing
from app.services.quote_totals import refresh_quote_header_totals
from app.services.sizing import calculate_sizing

CUSTOMER_NAME = "Mr Collins"
PHONE = "+233544036297"
PROJECT_REF = "COLLINS-HOTEL-ER-001"
LOCATION = "Koforidua"  # Eastern Region (peak sun hours in DB)


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


def create_collins_hotel_project() -> dict:
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
        if not admin:
            admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            raise RuntimeError("No admin user found")

        customer = db.query(Customer).filter(Customer.name.ilike("%Mr. Collins%")).first()
        if not customer:
            customer = Customer(
                name=CUSTOMER_NAME,
                phone=PHONE,
                email="",
                address="Eastern Region, Ghana",
                city="Eastern Region",
                country="Ghana",
                customer_type=CustomerType.COMMERCIAL,
                notes=(
                    "40-room hotel with restaurant and kitchen. "
                    "Goal: produce enough solar to get off the national grid."
                ),
            )
            db.add(customer)
            db.flush()
            print(f"Created customer: {customer.name} (id={customer.id})")
        else:
            customer.phone = PHONE
            print(f"Using customer: {customer.name} (id={customer.id})")

        project = db.query(Project).filter(Project.reference_code == PROJECT_REF).first()
        if project:
            db.query(Appliance).filter(Appliance.project_id == project.id).delete()
            db.query(SizingResultModel).filter(SizingResultModel.project_id == project.id).delete()
            old_quotes = db.query(Quote).filter(Quote.project_id == project.id).all()
            for q in old_quotes:
                for opt in list(q.options or []):
                    for item in list(opt.items or []):
                        db.delete(item)
                    db.delete(opt)
                for item in list(q.items or []):
                    db.delete(item)
                db.delete(q)
            db.flush()
            print(f"Reset existing project id={project.id}")
        else:
            project = Project(
                customer_id=customer.id,
                name="Mr Collins — 40-Room Hotel (Off-Grid Solar)",
                reference_code=PROJECT_REF,
                system_type=SystemType.OFF_GRID,
                status=ProjectStatus.NEW,
                created_by=admin.id,
            )
            db.add(project)
            db.flush()
            print(f"Created project id={project.id}")

        # Ghana-typical hotel load (40 rooms + restaurant/kitchen)
        appliance_specs = [
            {
                "category": ApplianceCategory.COOLING,
                "appliance_type": ApplianceType.SPLIT_AC_1_5HP,
                "description": "Split AC (1.5 HP) — guest rooms & common areas",
                "power_value": 1.5,
                "power_unit": PowerUnit.HP,
                "quantity": 16,
                "hours_per_day": 10,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.WATER_PUMPING,
                "appliance_type": ApplianceType.SUBMERSIBLE_PUMP,
                "description": "Water pump (hotel supply)",
                "power_value": 1.5,
                "power_unit": PowerUnit.HP,
                "quantity": 1,
                "hours_per_day": 8,
                "is_essential": True,
            },
            {
                "category": ApplianceCategory.ENTERTAINMENT,
                "appliance_type": ApplianceType.TV_55INCH_LED,
                "description": "55-inch LED TV (guest rooms)",
                "power_value": 150,
                "power_unit": PowerUnit.W,
                "quantity": 38,
                "hours_per_day": 8,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.LIGHTING,
                "appliance_type": ApplianceType.LED_BULB,
                "description": "LED bulb (corridors, rooms, public areas)",
                "power_value": 15,
                "power_unit": PowerUnit.W,
                "quantity": 100,
                "hours_per_day": 10,
                "is_essential": True,
            },
            {
                "category": ApplianceCategory.REFRIGERATION,
                "appliance_type": ApplianceType.COMMERCIAL_REFRIGERATOR,
                "description": "Room / minibar refrigerator",
                "power_value": 200,
                "power_unit": PowerUnit.W,
                "quantity": 36,
                "hours_per_day": 24,
                "is_essential": True,
            },
            {
                "category": ApplianceCategory.REFRIGERATION,
                "appliance_type": ApplianceType.FREEZER,
                "description": "Deep freezer (kitchen / storage)",
                "power_value": 400,
                "power_unit": PowerUnit.W,
                "quantity": 2,
                "hours_per_day": 24,
                "is_essential": True,
            },
            {
                "category": ApplianceCategory.LAUNDRY,
                "appliance_type": ApplianceType.WASHING_MACHINE,
                "description": "Washing machine (linen)",
                "power_value": 400,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 3,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.RICE_COOKER,
                "description": "Rice cooker (kitchen)",
                "power_value": 800,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 2,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.BLENDER,
                "description": "Blender (kitchen)",
                "power_value": 500,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 0.5,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.MICROWAVE,
                "description": "Microwave (kitchen)",
                "power_value": 800,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 3,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.COOKING,
                "appliance_type": ApplianceType.OTHER,
                "description": "Electric fufu pounding machine (kitchen)",
                "power_value": 2500,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 2,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.COOLING,
                "appliance_type": ApplianceType.CEILING_FAN,
                "description": "Ceiling fan",
                "power_value": 70,
                "power_unit": PowerUnit.W,
                "quantity": 55,
                "hours_per_day": 14,
                "is_essential": False,
            },
            {
                "category": ApplianceCategory.COMMERCIAL,
                "appliance_type": ApplianceType.COMMERCIAL_OVEN,
                "description": "Restaurant / kitchen general load (cooking)",
                "power_value": 3000,
                "power_unit": PowerUnit.W,
                "quantity": 1,
                "hours_per_day": 4,
                "is_essential": False,
            },
        ]

        print("\nAdding appliances...")
        raw_kwh = 0.0
        for spec in appliance_specs:
            kwh = _add_appliance(db, project.id, spec)
            raw_kwh += kwh
            print(f"  {spec['quantity']}× {spec['description']}: {kwh:.2f} kWh/day")

        db.flush()
        total_raw = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=False)
        total_div = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=True)
        print(f"\nTotal load (raw): {total_raw:.2f} kWh/day")
        print(f"Total load (with diversity): {total_div:.2f} kWh/day")

        sizing_input = SizingInput(
            project_id=project.id,
            total_daily_kwh=total_div,
            location=LOCATION,
            panel_brand="Longi",
            backup_hours=24,
            essential_load_percent=0.75,
        )
        sizing_input.system_type = SystemType.OFF_GRID
        sizing_result = calculate_sizing(db, sizing_input)
        db.add(SizingResultModel(**sizing_result.model_dump(exclude={"id", "created_at"})))
        db.flush()

        print(
            f"\nSizing (off-grid, 24h backup):\n"
            f"  System: {sizing_result.system_size_kw} kW\n"
            f"  Panels: {sizing_result.number_of_panels} × {sizing_result.panel_wattage}W ({sizing_result.panel_brand})\n"
            f"  Inverter: {sizing_result.inverter_size_kw} kW\n"
            f"  Battery: {sizing_result.battery_capacity_kwh} kWh"
        )

        default_tax = 20.0
        tax_setting = db.query(Setting).filter(Setting.key == "default_tax_percent").first()
        if tax_setting:
            try:
                default_tax = float(tax_setting.value)
            except (ValueError, TypeError):
                pass

        quote_number = f"QT-COLLINS-{uuid.uuid4().hex[:6].upper()}"
        quote = Quote(
            project_id=project.id,
            quote_number=quote_number,
            validity_days=30,
            tax_percent=default_tax,
            discount_percent=0,
            payment_terms=(
                "Commercial off-grid hotel proposal — 30% deposit, 40% on equipment delivery, "
                "30% on commissioning."
            ),
            notes=(
                f"Client: {CUSTOMER_NAME} · {PHONE}\n"
                "Site: Eastern Region, Ghana — 40-room hotel, restaurant & kitchen.\n"
                "Objective: sufficient solar generation to operate off the national grid.\n"
                "Load per client brief: 16 ACs, 38 TVs, 100 bulbs, 36 fridges, 2 freezers, "
                "water pump, laundry & kitchen equipment, 55 fans."
            ),
            created_by=admin.id,
        )
        db.add(quote)
        db.flush()

        opt = QuoteOption(
            quote_id=quote.id,
            title="Off-Grid Hotel Package",
            narrative=(
                f"Engineered off-grid package for ~{total_div:.0f} kWh/day (after diversity) "
                f"at {LOCATION}, Eastern Region. "
                f"{sizing_result.number_of_panels}× {sizing_result.panel_wattage}W panels, "
                f"{sizing_result.inverter_size_kw} kW inverter, "
                f"{sizing_result.battery_capacity_kwh} kWh battery storage (24h essential backup basis)."
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
                db,
                quote.id,
                opt.id,
                project.system_type,
                sizing_row,
                start_sort_order=next_so,
            )
            if n_extra:
                print(f"Appended {n_extra} catalog BOM line(s)")

        refresh_quote_header_totals(db, quote.id)
        db.commit()

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
        pdf_path = out_dir / "collins_hotel_quotation.pdf"
        pdf_bytes = generate_quotation_pdf(db, quote.id, document_type="quotation")
        pdf_path.write_bytes(pdf_bytes.read())
        print(f"PDF: {pdf_path}")

        return {
            "customer_id": customer.id,
            "project_id": project.id,
            "quote_id": quote.id,
            "quote_number": quote.quote_number,
            "grand_total_ghs": quote.grand_total,
            "daily_kwh_diversity": round(total_div, 2),
            "system_kw": sizing_result.system_size_kw,
            "battery_kwh": sizing_result.battery_capacity_kwh,
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
    info = create_collins_hotel_project()
    print("\n" + "=" * 60)
    for k, v in info.items():
        print(f"  {k}: {v}")
