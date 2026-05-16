"""
Turnkey package list prices from catalog-style unit costs + BOS, install, transport.

Aligned with proforma / shop references (570 W panel, 16 kWh module, hybrid inverters).
Adjust UNIT_* constants when catalog prices change, then re-run:

  python package_pricing.py --write
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

from package_sizing import TIER_INVERTER_KW, enrich_config, enrich_package

# Catalog / proforma reference unit prices (GHS)
PANEL_UNIT_GHS = 1500.0
BATTERY_16KWH_GHS = 26000.0
TRANSPORT_GHS = 3000.0
BOS_PERCENT = 0.10
INSTALL_PERCENT = 0.18
MOUNTING_PER_PANEL_GHS = 280.0
PROTECTION_KIT_BASE_GHS = 3500.0
PROTECTION_PER_PANEL_GHS = 120.0
PROTECTION_PER_BATTERY_GHS = 800.0
PACKAGE_MARGIN = 1.03  # small buffer on computed turnkey

INVERTER_UNIT_GHS: dict[float, float] = {
    6.5: 6500.0,
    8.0: 9000.0,
    10.0: 11000.0,
    12.0: 13000.0,
    15.0: 16000.0,
    20.0: 22000.0,  # 2 × 10 kVA synchronized
}

# Previous brochure BOM (for scaling when list price should track equipment delta)
LEGACY_BOM: dict[str, tuple[int, int, int, float]] = {
    # id → (panels, battery_modules, module_kwh, inverter_kw)
    "ep-6.5kva": (5, 1, 5, 3.0),
    "ep-8kva": (8, 2, 5, 5.0),
    "ep-10kva": (16, 4, 5, 8.0),
    "ep-12kva": (20, 6, 5, 10.0),
    "ep-15kva": (28, 8, 5, 15.0),
    "ep-20kva": (36, 10, 5, 20.0),
}

LEGACY_LIST_PRICE_GHS: dict[str, int] = {
    "ep-6.5kva": 64900,
    "ep-8kva": 94900,
    "ep-10kva": 159000,
    "ep-12kva": 209000,
    "ep-15kva": 279000,
    "ep-20kva": 369000,
}


def _battery_unit_price(module_kwh: float) -> float:
    if module_kwh >= 16:
        return BATTERY_16KWH_GHS
    return 13000.0  # legacy 5 kWh module reference


def inverter_cost_ghs(pkg: dict[str, Any]) -> float:
    if pkg.get("inverter_cost_ghs") is not None:
        return float(pkg["inverter_cost_ghs"])
    inverter_kw = float(pkg.get("inverter_kw") or 0)
    return INVERTER_UNIT_GHS.get(inverter_kw, inverter_kw * 1000.0)


def equipment_subtotal(
    *,
    panel_count: int,
    battery_count: int,
    inverter_kw: float,
    battery_module_kwh: float = 16.0,
    inverter_cost: float | None = None,
) -> float:
    inv = inverter_cost if inverter_cost is not None else INVERTER_UNIT_GHS.get(
        inverter_kw, inverter_kw * 1000.0
    )
    bat_unit = _battery_unit_price(battery_module_kwh)
    return (
        panel_count * PANEL_UNIT_GHS
        + battery_count * bat_unit
        + inv
        + panel_count * MOUNTING_PER_PANEL_GHS
        + PROTECTION_KIT_BASE_GHS
        + panel_count * PROTECTION_PER_PANEL_GHS
        + battery_count * PROTECTION_PER_BATTERY_GHS
    )


def turnkey_subtotal(equipment: float) -> float:
    bos = equipment * BOS_PERCENT
    install = (equipment + bos) * INSTALL_PERCENT
    return equipment + bos + install + TRANSPORT_GHS


def round_list_price(amount: float) -> int:
    """Marketing 'From' price: round up to nearest GHS 1,000, minus 100 (e.g. 91,900)."""
    if amount <= 0:
        return 0
    thousands = math.ceil(amount / 1000.0)
    return int(thousands * 1000 - 100)


def compute_list_price_ghs(pkg: dict[str, Any]) -> int:
    pkg_id = pkg.get("id", "")
    inverter_kw = float(pkg.get("inverter_kw") or TIER_INVERTER_KW.get(pkg_id, 0))
    panel_count = int(pkg.get("panel_count") or 0)
    battery_count = int(pkg.get("battery_count") or 0)

    new_eq = equipment_subtotal(
        panel_count=panel_count,
        battery_count=battery_count,
        inverter_kw=inverter_kw,
        inverter_cost=inverter_cost_ghs(pkg),
    )
    new_turnkey = turnkey_subtotal(new_eq) * PACKAGE_MARGIN

    legacy = LEGACY_BOM.get(pkg_id)
    old_list = LEGACY_LIST_PRICE_GHS.get(pkg_id)
    if legacy and old_list:
        op, ob, obk, oinv = legacy
        old_eq = equipment_subtotal(
            panel_count=op,
            battery_count=ob,
            inverter_kw=oinv,
            battery_module_kwh=obk,
        )
        old_turnkey = turnkey_subtotal(old_eq)
        if old_turnkey > 0:
            scaled = old_list * (new_turnkey / old_turnkey)
            return round_list_price(max(new_turnkey, scaled))

    return round_list_price(new_turnkey)


def apply_pricing(pkg: dict[str, Any], *, auto_price: bool = True) -> dict[str, Any]:
    pkg = enrich_package(pkg)
    if auto_price:
        pkg["price_ghs"] = compute_list_price_ghs(pkg)
    return pkg


def apply_pricing_config(config: dict[str, Any]) -> dict[str, Any]:
    out = dict(config)
    out["packages"] = [apply_pricing(p) for p in config.get("packages", [])]
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute / write hybrid package list prices")
    parser.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).resolve().parent / "packages.json",
    )
    parser.add_argument("--write", action="store_true", help="Update price_ghs in packages.json")
    args = parser.parse_args()

    config = json.loads(args.config.read_text(encoding="utf-8"))
    priced = apply_pricing_config(config)

    print(f"{'ID':<14} {'Panels':>6} {'16kWh':>6} {'Price GHS':>10}")
    print("-" * 42)
    for p in priced["packages"]:
        print(
            f"{p['id']:<14} {p['panel_count']:>6} {p['battery_count']:>6} "
            f"{p['price_ghs']:>10,}"
        )

    if args.write:
        enriched = enrich_config(priced)
        args.config.write_text(json.dumps(enriched, indent=2, ensure_ascii=False) + "\n")
        print(f"\nWrote {args.config}")


if __name__ == "__main__":
    main()
