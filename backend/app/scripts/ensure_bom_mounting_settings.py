"""
Upsert mounting/BOM ratio settings (rail span, clamp model). Safe for existing DBs.

Run from backend folder:
  cd backend && python3 -m app.scripts.ensure_bom_mounting_settings

Uses the same defaults as init_db.idempotent settings for catalog BOM alignment.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Setting

# Keys that fix panel ↔ rail ↔ clamp consistency when missing in settings table
BOM_MOUNTING_SETTINGS = [
    {
        "key": "bom_mounting_qty_model",
        "value": "rail_span",
        "description": "Mounting BOM math: 'rail_span' (2 rails per N panels, mid/end clamps per span) or 'legacy_per_panel' (bom_clamps_per_panel + old rail set / sizing sticks).",
        "category": "pricing",
    },
    {
        "key": "bom_panels_per_rail_span",
        "value": "5",
        "description": "Panels covered by one twin-rail span (rail pairs and clamp blocks scale with ceil(panels / this)).",
        "category": "pricing",
    },
    {
        "key": "bom_mid_clamps_per_rail_span",
        "value": "8",
        "description": "Mid clamps per rail-span block (discrete_spans: × number of spans).",
        "category": "pricing",
    },
    {
        "key": "bom_end_clamps_per_rail_span",
        "value": "4",
        "description": "End clamps per rail-span block (discrete_spans: × number of spans).",
        "category": "pricing",
    },
    {
        "key": "bom_rail_sticks_per_rail_span",
        "value": "2",
        "description": "Rail sticks per span when bom_rail_pricing_mode=sticks.",
        "category": "pricing",
    },
    {
        "key": "bom_clamp_count_model",
        "value": "discrete_spans",
        "description": "Clamp BOM: 'discrete_spans' (mid+end match rail span count) or 'linear_panel' (rounded per-panel scaling).",
        "category": "pricing",
    },
    {
        "key": "bom_rail_pricing_mode",
        "value": "sets",
        "description": "Rail BOM: 'sets' (MNT-RAIL-SET-350) or 'sticks' (MNT-RAIL-18FT). Never both.",
        "category": "pricing",
    },
]


def main() -> None:
    db: Session = SessionLocal()
    try:
        for s in BOM_MOUNTING_SETTINGS:
            existing = db.query(Setting).filter(Setting.key == s["key"]).first()
            if existing:
                existing.value = s["value"]
                existing.description = s["description"]
                existing.category = s["category"]
                print(f"  Updated: {s['key']} = {s['value']}")
            else:
                db.add(
                    Setting(
                        key=s["key"],
                        value=s["value"],
                        description=s["description"],
                        category=s["category"],
                    )
                )
                print(f"  Added: {s['key']} = {s['value']}")
        db.commit()
        print("BOM mounting settings applied. Rebuild quotes (Rebuild BOM from sizing) to refresh lines.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
