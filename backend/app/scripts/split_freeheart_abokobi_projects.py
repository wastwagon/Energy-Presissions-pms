#!/usr/bin/env python3
"""
Split Freeheart Abokobi into two projects (same customer):

  1. Apartment block only — update FREEHEART-ABOKOBI-001 (remove glass loads)
  2. Glass building only — FREEHEART-ABOKOBI-GLASS-001

Glass building loads (client brief):
  Down floor:  lights 8, sockets 4, fans 2
  1st floor:   lights 7, sockets 4, fans 2
  2nd floor:   lights 9, sockets 7, fans 2

Usage:
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
    Project,
    Quote,
    QuoteItem,
    QuoteOption,
    Setting,
    SizingResult as SizingResultModel,
    SystemType,
    User,
)
from app.schemas import SizingInput
from app.services.bom_fix import fix_quote_bom
from app.services.bom_from_catalog import append_standard_bom_from_catalog
from app.services.load_calculator import calculate_total_daily_kwh
from app.services.pdf_generator import generate_quotation_pdf
from app.services.pricing import generate_quote_items_from_sizing
from app.services.quote_totals import refresh_quote_header_totals
from app.services.sizing import calculate_sizing
from app.scripts.create_freeheart_abokobi_project import (
    CUSTOMER_NAME,
    CONTACT_NAME,
    EMAIL,
    LOCATION,
    PHONE,
    PROJECT_REF,
    _add_appliance,
    build_apartment_specs,
    build_glass_specs,
)

APT_REF = PROJECT_REF  # FREEHEART-ABOKOBI-001
GLASS_REF = "FREEHEART-ABOKOBI-GLASS-001"


def _admin(db: Session) -> User:
    admin = db.query(User).filter(User.email == "admin@energyprecisions.com").first()
    if not admin:
        admin = db.query(User).filter(User.role == "admin").first()
    if not admin:
        raise RuntimeError("No admin user found")
    return admin


def _default_tax(db: Session) -> float:
    tax_setting = db.query(Setting).filter(Setting.key == "default_tax_percent").first()
    if tax_setting:
        try:
            return float(tax_setting.value)
        except (ValueError, TypeError):
            pass
    return 20.0


def _run_sizing(db: Session, project: Project) -> SizingResultModel:
    db.query(SizingResultModel).filter(SizingResultModel.project_id == project.id).delete()
    db.flush()

    total_div = calculate_total_daily_kwh(db, project.id, apply_diversity_factor=True)
    sizing_input = SizingInput(
        project_id=project.id,
        total_daily_kwh=total_div,
        location=LOCATION,
        panel_brand="Longi",
        backup_hours=8,
        essential_load_percent=0.6,
    )
    sizing_input.system_type = project.system_type
    sizing_result = calculate_sizing(db, sizing_input)
    row = SizingResultModel(**sizing_result.model_dump(exclude={"id", "created_at"}))
    db.add(row)
    db.flush()
    return row, total_div


def _clear_quote_items(db: Session, quote: Quote) -> QuoteOption:
    for opt in db.query(QuoteOption).filter(QuoteOption.quote_id == quote.id).all():
        db.query(QuoteItem).filter(QuoteItem.quote_option_id == opt.id).delete()
    db.query(QuoteItem).filter(QuoteItem.quote_id == quote.id).delete()
    db.flush()
    opt = (
        db.query(QuoteOption)
        .filter(QuoteOption.quote_id == quote.id)
        .order_by(QuoteOption.sort_order, QuoteOption.id)
        .first()
    )
    if not opt:
        raise RuntimeError(f"Quote {quote.quote_number} has no options")
    return opt


def _rebuild_quote_lines(
    db: Session,
    project: Project,
    quote: Quote,
    opt: QuoteOption,
    sizing_row: SizingResultModel,
    total_div: float,
) -> None:
    items = generate_quote_items_from_sizing(db, sizing_row, quote.id, opt.id)
    for item in items:
        db.add(item)
    db.flush()

    bom_setting = db.query(Setting).filter(Setting.key == "append_catalog_bom_on_quote").first()
    bom_on = not bom_setting or str(bom_setting.value).strip().lower() not in ("0", "false", "no")
    if bom_on and items:
        next_so = max((i.sort_order for i in items), default=-1) + 1
        append_standard_bom_from_catalog(
            db, quote.id, opt.id, project.system_type, sizing_row, start_sort_order=next_so
        )

    opt.narrative = (
        f"Hybrid solar for ~{total_div:.0f} kWh/day at Abokobi (Accra sun data). "
        f"{sizing_row.number_of_panels}× {sizing_row.panel_wattage}W panels, "
        f"{sizing_row.inverter_size_kw} kW hybrid inverter, "
        f"{sizing_row.battery_capacity_kwh} kWh storage (8h essential backup)."
    )
    refresh_quote_header_totals(db, quote.id)
    db.flush()
    fix_quote_bom(db, quote.id, opt.id)


def _export_pdfs(db: Session, quote_id: int, base_name: str) -> dict[str, str]:
    out_dir = Path("/app/exports")
    if not out_dir.exists():
        out_dir = Path(__file__).resolve().parents[3] / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)
    q_path = out_dir / f"{base_name}_quotation.pdf"
    p_path = out_dir / f"{base_name}_proforma.pdf"
    q_path.write_bytes(generate_quotation_pdf(db, quote_id, document_type="quotation").read())
    p_path.write_bytes(generate_quotation_pdf(db, quote_id, document_type="proforma_invoice").read())
    return {"quotation_pdf": str(q_path), "proforma_pdf": str(p_path)}


def split_freeheart_projects() -> dict:
    db: Session = SessionLocal()
    try:
        admin = _admin(db)
        from app.models import Customer, CustomerType, ProjectStatus

        customer = db.query(Customer).filter(Customer.name == CUSTOMER_NAME).first()
        if not customer:
            raise RuntimeError(f"Customer {CUSTOMER_NAME} not found — run create_freeheart_abokobi_project first")

        customer.notes = (
            "Two Abokobi sites under same client: (1) 3-storey apartment block, "
            "(2) 3-storey glass building. Load survey per Energy Precisions (May 2026)."
        )

        # —— Apartment project (existing) ——
        apt_project = db.query(Project).filter(Project.reference_code == APT_REF).first()
        if not apt_project:
            raise RuntimeError(f"Apartment project {APT_REF} not found")

        removed = (
            db.query(Appliance)
            .filter(
                Appliance.project_id == apt_project.id,
                Appliance.description.ilike("%glass building%"),
            )
            .delete(synchronize_session=False)
        )
        print(f"Removed {removed} glass-building appliance line(s) from project id={apt_project.id}")

        apt_project.name = "Freeheart — Abokobi Apartment Block"

        apt_sizing, apt_kwh = _run_sizing(db, apt_project)
        print(
            f"\nApartment sizing: {apt_sizing.system_size_kw} kW, "
            f"{apt_sizing.number_of_panels} panels, {apt_sizing.battery_capacity_kwh} kWh battery, "
            f"{apt_kwh:.1f} kWh/day (diversity)"
        )

        apt_quote = db.query(Quote).filter(Quote.project_id == apt_project.id).first()
        tax_pct = float(apt_quote.tax_percent) if apt_quote else _default_tax(db)
        if apt_quote:
            apt_opt = _clear_quote_items(db, apt_quote)
            apt_quote.notes = (
                f"Site: Freeheart, Abokobi — apartment block only (3 floors, L+R wings).\n"
                f"Load: client point count per floor — 18 lights, 20 sockets, 8 fans per floor.\n"
                f"Assumptions: 12W LED, 150W diversified outlets, 70W ceiling fans.\n"
                f"Contact: {CONTACT_NAME} {PHONE}"
            )
            _rebuild_quote_lines(db, apt_project, apt_quote, apt_opt, apt_sizing, apt_kwh)
            db.refresh(apt_quote)
            print(f"Apartment quote {apt_quote.quote_number}: GHS {apt_quote.grand_total:,.2f}")
        else:
            apt_quote = None

        # —— Glass building project ——
        glass_project = db.query(Project).filter(Project.reference_code == GLASS_REF).first()
        if glass_project:
            db.query(Appliance).filter(Appliance.project_id == glass_project.id).delete()
            db.query(SizingResultModel).filter(SizingResultModel.project_id == glass_project.id).delete()
            for q in db.query(Quote).filter(Quote.project_id == glass_project.id).all():
                _clear_quote_items(db, q)
                db.query(QuoteOption).filter(QuoteOption.quote_id == q.id).delete()
                db.query(Quote).filter(Quote.id == q.id).delete()
            db.flush()
            print(f"Reset glass project id={glass_project.id}")
        else:
            glass_project = Project(
                customer_id=customer.id,
                name="Freeheart — Abokobi Glass Building",
                reference_code=GLASS_REF,
                system_type=SystemType.HYBRID,
                status=ProjectStatus.NEW,
                created_by=admin.id,
            )
            db.add(glass_project)
            db.flush()
            print(f"Created glass project id={glass_project.id}")

        glass_project.name = "Freeheart — Abokobi Glass Building"
        print("\nGlass building loads:")
        for spec in build_glass_specs():
            kwh = _add_appliance(db, glass_project.id, spec)
            print(f"  {spec['quantity']}× {spec['description']}: {kwh:.2f} kWh/day")

        glass_sizing, glass_kwh = _run_sizing(db, glass_project)
        print(
            f"\nGlass sizing: {glass_sizing.system_size_kw} kW, "
            f"{glass_sizing.number_of_panels} panels, {glass_sizing.battery_capacity_kwh} kWh battery, "
            f"{glass_kwh:.1f} kWh/day (diversity)"
        )

        glass_quote = db.query(Quote).filter(Quote.project_id == glass_project.id).first()
        if not glass_quote:
            glass_quote = Quote(
                project_id=glass_project.id,
                quote_number=f"QT-FREEHEART-GLASS-{uuid.uuid4().hex[:6].upper()}",
                validity_days=30,
                tax_percent=tax_pct,
                discount_percent=0,
                payment_terms="30% deposit · 40% on delivery · 30% on commissioning",
                notes=(
                    f"Site: Freeheart, Abokobi — glass building only (3 floors).\n"
                    f"Down floor: 8 lights, 4 sockets, 2 fans.\n"
                    f"1st floor: 7 lights, 4 sockets, 2 fans.\n"
                    f"2nd floor: 9 lights, 7 sockets, 2 fans.\n"
                    f"Assumptions: 12W LED, 150W diversified outlets, 70W fans.\n"
                    f"Contact: {CONTACT_NAME} {PHONE}"
                ),
                created_by=admin.id,
            )
            db.add(glass_quote)
            db.flush()
            glass_opt = QuoteOption(
                quote_id=glass_quote.id,
                title="Hybrid Solar Package",
                sort_order=0,
            )
            db.add(glass_opt)
            db.flush()
        else:
            glass_opt = _clear_quote_items(db, glass_quote)
            glass_quote.notes = (
                f"Site: Freeheart, Abokobi — glass building only (3 floors).\n"
                f"Down floor: 8 lights, 4 sockets, 2 fans.\n"
                f"1st floor: 7 lights, 4 sockets, 2 fans.\n"
                f"2nd floor: 9 lights, 7 sockets, 2 fans.\n"
                f"Assumptions: 12W LED, 150W diversified outlets, 70W fans.\n"
                f"Contact: {CONTACT_NAME} {PHONE}"
            )

        _rebuild_quote_lines(db, glass_project, glass_quote, glass_opt, glass_sizing, glass_kwh)
        db.commit()

        db.refresh(apt_quote)
        db.refresh(glass_quote)
        apt_pdfs = _export_pdfs(db, apt_quote.id, "freeheart_apartment") if apt_quote else {}
        glass_pdfs = _export_pdfs(db, glass_quote.id, "freeheart_glass_building")

        return {
            "customer": CUSTOMER_NAME,
            "apartment_project_id": apt_project.id,
            "apartment_quote": apt_quote.quote_number if apt_quote else None,
            "apartment_grand_ghs": apt_quote.grand_total if apt_quote else None,
            "apartment_daily_kwh": round(apt_kwh, 2),
            "apartment_system_kw": apt_sizing.system_size_kw,
            "glass_project_id": glass_project.id,
            "glass_quote": glass_quote.quote_number,
            "glass_grand_ghs": glass_quote.grand_total,
            "glass_daily_kwh": round(glass_kwh, 2),
            "glass_system_kw": glass_sizing.system_size_kw,
            **apt_pdfs,
            **glass_pdfs,
            "ui_apartment": f"http://localhost:5000/pms/projects/{apt_project.id}",
            "ui_glass": f"http://localhost:5000/pms/projects/{glass_project.id}",
            "ui_apt_quote": f"http://localhost:5000/pms/quotes/{apt_quote.id}" if apt_quote else None,
            "ui_glass_quote": f"http://localhost:5000/pms/quotes/{glass_quote.id}",
        }
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    info = split_freeheart_projects()
    print("\n" + "=" * 60)
    for k, v in info.items():
        print(f"  {k}: {v}")
