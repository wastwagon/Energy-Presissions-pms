"""
Set default bank details for Proforma Invoice.
- With Docker (from project root): docker compose exec backend python -m app.scripts.set_default_bank_details
- Local (from backend dir, with venv): python -m app.scripts.set_default_bank_details
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Setting

DEFAULTS = [
    ("company_bank_name", "Zenith Bank Ghana Limited", "Bank name for Proforma Invoice payments"),
    ("company_account_name", "Energy Precisions Limited", "Bank account name (beneficiary name)"),
    ("company_account_number", "6110112631", "Bank account number for Proforma Invoice"),
    ("company_bank_branch", "Head Office", "Bank branch (e.g. branch name or address)"),
    ("company_swift_code", "", "SWIFT/BIC code (optional, for international transfers)"),
]


def main():
    db: Session = SessionLocal()
    try:
        for key, value, description in DEFAULTS:
            setting = db.query(Setting).filter(Setting.key == key).first()
            if setting:
                setting.value = value
                print(f"  Updated: {key} = {value}")
            else:
                db.add(Setting(key=key, value=value, description=description, category="other"))
                print(f"  Created: {key} = {value}")
        db.commit()
        print("Default bank details set successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
