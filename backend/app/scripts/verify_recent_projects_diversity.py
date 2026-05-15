"""
Verify load_diversity_factor and that recent projects' diversified totals match expectations.

When factor is 1.0, diversified daily kWh should equal raw sum (full load).

Usage (from backend/):
  python3 -m app.scripts.verify_recent_projects_diversity
  python3 -m app.scripts.verify_recent_projects_diversity --limit 50

Requires a reachable Postgres. In Docker, run inside the API container or set POSTGRES_HOST=localhost.

No DB (unit test default = 1.0):
  cd backend && python3 -m pytest tests/test_load_diversity_default.py -v
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy import desc
from sqlalchemy.exc import OperationalError

from app.database import SessionLocal
from app.models import Project, Setting
from app.services.load_calculator import calculate_total_daily_kwh, get_setting_value


def main() -> int:
    p = argparse.ArgumentParser(description="Check load diversity vs recent projects")
    p.add_argument("--limit", type=int, default=25, help="How many recent projects to scan")
    args = p.parse_args()

    db = SessionLocal()
    try:
        try:
            factor = get_setting_value(db, "load_diversity_factor", 1.0)
            raw_setting = db.query(Setting).filter(Setting.key == "load_diversity_factor").first()
            src = "database" if raw_setting else "default (no row — code uses 1.0)"

            print("=== Load diversity factor ===")
            print(f"  Effective value: {factor}")
            print(f"  Source: {src}")
            if raw_setting:
                print(f"  Raw stored value: {raw_setting.value!r}")
            print()

            recent = (
                db.query(Project)
                .order_by(desc(Project.id))
                .limit(args.limit)
                .all()
            )

            if not recent:
                print("No projects in database.")
                return 0

            print(f"=== Recent projects (up to {args.limit}, by id desc) ===")
            mismatches = 0
            for proj in recent:
                raw_kwh = calculate_total_daily_kwh(db, proj.id, apply_diversity_factor=False)
                div_kwh = calculate_total_daily_kwh(db, proj.id, apply_diversity_factor=True)
                if raw_kwh <= 0:
                    ratio = None
                    ok = True
                else:
                    ratio = div_kwh / raw_kwh
                    ok = abs(ratio - factor) < 0.002
                status = "OK" if ok else "CHECK"
                ratio_s = f"{ratio:.4f}" if ratio is not None else "n/a"
                label = (proj.name or "")[:40]
                print(
                    f"  project {proj.id:5d}  {label:<42}  raw={raw_kwh:8.3f}  div={div_kwh:8.3f}  ratio={ratio_s:7s}  [{status}]"
                )
                if not ok:
                    mismatches += 1

            print()
            if abs(factor - 1.0) < 0.0001:
                print("Factor is 1.0 — diversified totals should equal raw totals (full load).")
            else:
                print(
                    f"Factor is {factor} — expect diversified ≈ raw × {factor} "
                    "(not full load unless you set factor to 1 in Settings)."
                )

            if mismatches:
                print(f"\nWarning: {mismatches} row(s) where div/raw did not match stored factor (unexpected).")
                return 1
            return 0
        except OperationalError as e:
            print("Database connection failed:", e)
            print(
                "Set DATABASE_URL or POSTGRES_* (e.g. host localhost instead of Docker name 'db'), "
                "or run this inside your API container."
            )
            return 2
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
