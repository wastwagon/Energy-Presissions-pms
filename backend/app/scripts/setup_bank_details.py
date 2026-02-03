"""
Add bank detail settings for Proforma Invoice (if missing).
Run after init_db for existing DBs: python -m app.scripts.setup_bank_details
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Setting

BANK_SETTINGS = [
    {"key": "company_bank_name", "value": "", "description": "Bank name for Proforma Invoice payments", "category": "other"},
    {"key": "company_account_name", "value": "", "description": "Bank account name (beneficiary name)", "category": "other"},
    {"key": "company_account_number", "value": "", "description": "Bank account number for Proforma Invoice", "category": "other"},
    {"key": "company_bank_branch", "value": "", "description": "Bank branch (e.g. branch name or address)", "category": "other"},
    {"key": "company_swift_code", "value": "", "description": "SWIFT/BIC code (optional, for international transfers)", "category": "other"},
]


def main():
    db: Session = SessionLocal()
    try:
        for s in BANK_SETTINGS:
            existing = db.query(Setting).filter(Setting.key == s["key"]).first()
            if not existing:
                db.add(Setting(**s))
                print(f"  Added setting: {s['key']}")
        db.commit()
        print("Bank detail settings ready. Configure them under PMS → Settings (Other).")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
