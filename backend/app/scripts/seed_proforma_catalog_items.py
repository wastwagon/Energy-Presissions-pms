"""
Idempotent catalog seed: proforma-style line items (Ghana hybrid BOM) for quote prep.

Skips any row whose SKU already exists. Safe to re-run.

Usage (from backend container or venv with DB URL):
  python -m app.scripts.seed_proforma_catalog_items

Does not replace panels/inverters/batteries you already added manually — only inserts
missing SKUs (e.g. Longi 570W, 6.5kW hybrid, 5kWh module if absent).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Product, ProductType


def _upsert_by_sku(db: Session, row: dict) -> str:
    sku = row["sku"]
    existing = db.query(Product).filter(Product.sku == sku).first()
    if existing:
        return "skip"
    p = Product(**row)
    db.add(p)
    return "insert"


def seed_proforma_catalog_items() -> None:
    """Default unit prices align with the sample proforma (Option 1); adjust in Products UI later."""
    rows: list[dict] = [
        # --- Core PV (only if you want these SKUs on a fresh DB; skipped if SKU exists) ---
        {
            "product_type": ProductType.PANEL,
            "brand": "Longi",
            "model": "570W",
            "wattage": 570,
            "name": "Longi 570W Solar Panel",
            "description": "570W monocrystalline module (proforma list price reference).",
            "short_description": "Longi 570W panel",
            "category": "Solar Panels",
            "base_price": 1500.0,
            "price_type": "fixed",
            "sku": "PAN-LONGI-570",
            "manage_stock": True,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.INVERTER,
            "brand": "Hybrid",
            "model": "6.5kW",
            "capacity_kw": 6.5,
            "name": "6.5 kW Hybrid Inverter",
            "description": "Hybrid inverter (catalog line for quotations).",
            "short_description": "6.5 kW hybrid inverter",
            "category": "Inverters",
            "base_price": 6500.0,
            "price_type": "fixed",
            "sku": "INV-HYBRID-6P5",
            "manage_stock": True,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.BATTERY,
            "brand": "LiFePO4",
            "model": "5kWh module",
            "capacity_kwh": 5.0,
            "name": "5 kWh LiFePO4 lithium battery module",
            "description": "5 kWh stackable/module pricing reference from proforma.",
            "short_description": "5 kWh LiFePO4 module",
            "category": "Batteries",
            "base_price": 13000.0,
            "price_type": "fixed",
            "sku": "BAT-LFP-5KWH",
            "manage_stock": True,
            "in_stock": True,
            "stock_quantity": 0,
        },
        # --- Mounting ---
        {
            "product_type": ProductType.MOUNTING,
            "brand": "Generic",
            "model": "Rail set",
            "name": "Mounting structure (rails)",
            "description": "Rail / mounting structure line item; price per set as on proforma.",
            "short_description": "Mounting rails",
            "category": "Mounting",
            "base_price": 350.0,
            "price_type": "fixed",
            "sku": "MNT-RAIL-SET-350",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "PV clamp",
            "name": "PV mid / end clamp (each)",
            "description": "Mid clamps, end clamps — priced each (use quantity for total pieces).",
            "short_description": "Rail clamp each",
            "category": "Balance of System",
            "base_price": 30.0,
            "price_type": "fixed",
            "sku": "BOS-PV-CLAMP-EA",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        # --- Cabling ---
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "RR 10MM 100m",
            "name": "RR 10MM Copper Cable (100m coil)",
            "description": "100m coil — RR 10MM copper cable for AC / heavy runs (use quantity for number of coils).",
            "short_description": "RR 10MM copper cable 100m",
            "category": "Balance of System",
            "base_price": 2500.0,
            "price_type": "fixed",
            "sku": "CAB-RR10MM-100M",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "PV 4mm 100m",
            "name": "Single core 4mm PV cable (100m coil)",
            "description": "DC PV string cable coil.",
            "short_description": "4mm PV 100m",
            "category": "Balance of System",
            "base_price": 2500.0,
            "price_type": "fixed",
            "sku": "CAB-PV-4MM-100M",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "PV 6mm 100m",
            "name": "Single core 6mm PV cable (100m coil)",
            "description": "Option 2 style PV cable.",
            "short_description": "6mm PV 100m",
            "category": "Balance of System",
            "base_price": 2500.0,
            "price_type": "fixed",
            "sku": "CAB-PV-6MM-100M",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Copper",
            "model": "35mm batt",
            "name": "Battery cable 35mm copper (per meter)",
            "description": "Per meter pricing; set quantity to meters.",
            "short_description": "35mm battery cable /m",
            "category": "Balance of System",
            "base_price": 80.0,
            "price_type": "fixed",
            "sku": "CAB-BATT-35MM-M",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Copper",
            "model": "50mm batt",
            "name": "Battery cable 50mm copper (per meter)",
            "description": "Option 2 style; per meter.",
            "short_description": "50mm battery cable /m",
            "category": "Balance of System",
            "base_price": 200.0,
            "price_type": "fixed",
            "sku": "CAB-BATT-50MM-M",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        # --- Protection / distribution ---
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "63A DC 2P",
            "name": "63A DC MCB 2P",
            "description": "DC side protection.",
            "short_description": "63A DC 2P MCB",
            "category": "Balance of System",
            "base_price": 200.0,
            "price_type": "fixed",
            "sku": "PRT-DC63-2P",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "100A AC",
            "name": "100A AC breaker",
            "description": "AC breaker as per BOM.",
            "short_description": "100A AC breaker",
            "category": "Balance of System",
            "base_price": 250.0,
            "price_type": "fixed",
            "sku": "PRT-AC100-1P",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "125A AC",
            "name": "125A AC breaker",
            "description": "Option 2 BOM line.",
            "short_description": "125A AC breaker",
            "category": "Balance of System",
            "base_price": 300.0,
            "price_type": "fixed",
            "sku": "PRT-AC125-1P",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "100A CO",
            "name": "100A changeover",
            "description": "Manual changeover switch.",
            "short_description": "100A changeover",
            "category": "Balance of System",
            "base_price": 1500.0,
            "price_type": "fixed",
            "sku": "PRT-CO-100A",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "6-way DB",
            "name": "6-way breaker box",
            "description": "Distribution board 6-way.",
            "short_description": "6-way DB",
            "category": "Balance of System",
            "base_price": 180.0,
            "price_type": "fixed",
            "sku": "BOX-DB-6WAY",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "13-way DB",
            "name": "13-way breaker box",
            "description": "Distribution board 13-way.",
            "short_description": "13-way DB",
            "category": "Balance of System",
            "base_price": 350.0,
            "price_type": "fixed",
            "sku": "BOX-DB-13WAY",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "SPD 500V",
            "name": "SPD / lightning arrester (500V class)",
            "description": "Option 1 SPD line.",
            "short_description": "SPD 500V",
            "category": "Balance of System",
            "base_price": 300.0,
            "price_type": "fixed",
            "sku": "PRT-SPD-500V",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "SPD 1000V",
            "name": "SPD / lightning arrester (1000V class)",
            "description": "Option 2 SPD line.",
            "short_description": "SPD 1000V",
            "category": "Balance of System",
            "base_price": 300.0,
            "price_type": "fixed",
            "sku": "PRT-SPD-1000V",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Generic",
            "model": "250A MCCB",
            "name": "250A MCCB battery breaker",
            "description": "Battery main protection.",
            "short_description": "250A MCCB",
            "category": "Balance of System",
            "base_price": 650.0,
            "price_type": "fixed",
            "sku": "PRT-MCCB-250A",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Kit",
            "model": "Misc BOS",
            "name": "Miscellaneous (MC4, trunking, PVC, glands, fixings, lugs, ties)",
            "description": "Lump consumables line; adjust quantity if you price per-lot.",
            "short_description": "Misc BOS consumables",
            "category": "Balance of System",
            "base_price": 1500.0,
            "price_type": "fixed",
            "sku": "KIT-MISC-BOS",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.OTHER,
            "brand": "Kit",
            "model": "Misc BOS L",
            "name": "Miscellaneous (larger kit — Option 2 reference)",
            "description": "Proforma Option 2 lump misc at 2000.",
            "short_description": "Misc BOS larger",
            "category": "Balance of System",
            "base_price": 2000.0,
            "price_type": "fixed",
            "sku": "KIT-MISC-BOS-L",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        # --- Services (auto-quote from sizing picks first match) ---
        {
            "product_type": ProductType.TRANSPORT,
            "brand": "Energy Precisions",
            "model": "Logistics",
            "name": "Transportation of logistics",
            "description": "Site delivery / logistics (proforma reference 3000).",
            "short_description": "Transport & logistics",
            "category": "Services",
            "base_price": 3000.0,
            "price_type": "fixed",
            "sku": "SRV-TRANSPORT-STD",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.INSTALLATION,
            "brand": "Energy Precisions",
            "model": "Install S",
            "name": "Installation & commissioning (standard)",
            "description": "Proforma Option 1 reference 6000 (fixed job line).",
            "short_description": "Installation standard",
            "category": "Services",
            "base_price": 6000.0,
            "price_type": "fixed",
            "sku": "SRV-INSTALL-6000",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
        {
            "product_type": ProductType.INSTALLATION,
            "brand": "Energy Precisions",
            "model": "Install L",
            "name": "Installation & commissioning (large)",
            "description": "Proforma Option 2 reference 8000.",
            "short_description": "Installation large",
            "category": "Services",
            "base_price": 8000.0,
            "price_type": "fixed",
            "sku": "SRV-INSTALL-8000",
            "manage_stock": False,
            "in_stock": True,
            "stock_quantity": 0,
        },
    ]

    db: Session = SessionLocal()
    inserted = 0
    skipped = 0
    try:
        for row in rows:
            if _upsert_by_sku(db, row) == "insert":
                inserted += 1
            else:
                skipped += 1
        db.commit()
        print(f"Proforma catalog seed: inserted {inserted}, skipped (existing SKU) {skipped}")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_proforma_catalog_items()
