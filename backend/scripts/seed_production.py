#!/usr/bin/env python3
"""
Production database seeding script.
Run with: DATABASE_URL=<url> python3 scripts/seed_production.py
Uses minimal deps: psycopg2, passlib (for password hashing).
"""
import os
import sys
from pathlib import Path


# Use bcrypt directly (avoids passlib version issues)
try:
    import bcrypt
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "bcrypt"])
    import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def get_engine():
    try:
        from sqlalchemy import create_engine
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "sqlalchemy", "psycopg2-binary"])
        from sqlalchemy import create_engine
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        raise SystemExit("DATABASE_URL environment variable required")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if "sslmode" not in url:
        url += "?sslmode=require" if "?" not in url else "&sslmode=require"
    return create_engine(url)


def create_admin(engine):
    from sqlalchemy import text
    email = "admin@energyprecisions.com"
    password = "admin123"
    hashed = hash_password(password)
    full_name = "System Administrator"

    with engine.connect() as conn:
        # Check if exists
        r = conn.execute(text("SELECT id FROM users WHERE email = :e"), {"e": email})
        row = r.fetchone()
        if row:
            conn.execute(
                text("UPDATE users SET hashed_password = :p WHERE email = :e"),
                {"p": hashed, "e": email}
            )
            conn.commit()
            print(f"Password updated for {email}")
        else:
            conn.execute(
                text("INSERT INTO users (email, hashed_password, full_name, role) VALUES (:e, :p, :n, 'admin')"),
                {"e": email, "p": hashed, "n": full_name}
            )
            conn.commit()
            print(f"Admin user {email} created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")


def setup_bank_details(engine):
    from sqlalchemy import text
    bank_keys = [
        "company_bank_name", "company_account_name", "company_account_number",
        "company_bank_branch", "company_swift_code"
    ]
    with engine.connect() as conn:
        for key in bank_keys:
            r = conn.execute(text("SELECT 1 FROM settings WHERE key = :k"), {"k": key})
            if r.fetchone() is None:
                conn.execute(
                    text("INSERT INTO settings (key, value, description, category) VALUES (:k, '', :d, 'other')"),
                    {"k": key, "d": f"Bank setting: {key}"}
                )
                print(f"  Added setting: {key}")
        conn.commit()
    print("Bank detail settings ready.")


def main():
    print("Seeding production database...")
    engine = get_engine()

    print("\n1. Creating admin user...")
    create_admin(engine)

    print("\n2. Setting up bank details...")
    setup_bank_details(engine)

    print("\nDone. Run init_db and seed_ecommerce_products from Render Shell for full seed.")


if __name__ == "__main__":
    main()
