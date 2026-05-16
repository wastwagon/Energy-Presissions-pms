"""
Marketing package sizing — matches PMS PV logic for panels (no load diversity).

Panel count: ceil(inverter_kw × max_dc_ac_ratio × 1000 / panel_wattage)
  Same DC/AC cap used in backend/app/services/sizing.py (default max_dc_ac_ratio 1.3).

Battery count: ceil(target_storage_kwh / 16) using stocked 16 kWh LiFePO₄ modules.
"""
from __future__ import annotations

import math
from typing import Any

PANEL_WATTAGE = 570
PANEL_BRAND_LABEL = "570W tier-1"
MAX_DC_AC_RATIO = 1.3
BATTERY_MODULE_KWH = 16.0

# Defaults mirror package_content.TIER_META (imported in enrich_package).
TIER_TARGET_STORAGE_KWH: dict[str, float] = {
    "ep-6.5kva": 16.0,
    "ep-8kva": 32.0,
    "ep-10kva": 48.0,
    "ep-12kva": 64.0,
    "ep-15kva": 80.0,
    "ep-20kva": 96.0,
}

TIER_INVERTER_KW: dict[str, float] = {
    "ep-6.5kva": 6.5,
    "ep-8kva": 8.0,
    "ep-10kva": 10.0,
    "ep-12kva": 12.0,
    "ep-15kva": 15.0,
    "ep-20kva": 20.0,
}


def panel_count_for_inverter(
    inverter_kw: float,
    *,
    panel_wattage: int = PANEL_WATTAGE,
    max_dc_ac_ratio: float = MAX_DC_AC_RATIO,
) -> int:
    """Panels needed so DC nameplate meets inverter at max DC/AC (no diversity factor)."""
    if inverter_kw <= 0 or panel_wattage <= 0:
        return 0
    dc_kw = inverter_kw * max_dc_ac_ratio
    return math.ceil(dc_kw * 1000 / panel_wattage)


def battery_module_count(
    target_kwh: float,
    *,
    module_kwh: float = BATTERY_MODULE_KWH,
) -> int:
    if target_kwh <= 0:
        return 1
    return max(1, math.ceil(target_kwh / module_kwh))


def panel_dc_kw(panel_count: int, panel_wattage: int = PANEL_WATTAGE) -> float:
    return round(panel_count * panel_wattage / 1000, 2)


def _inverter_line(pkg: dict[str, Any]) -> str:
    pkg_id = pkg.get("id", "")
    if pkg_id == "ep-20kva":
        return "10 kVA hybrid inverters (2, synchronized)"
    kw = pkg.get("inverter_kw") or TIER_INVERTER_KW.get(pkg_id, 0)
    label = pkg.get("kva_label", f"{kw} KVA SYSTEM").replace(" SYSTEM", "")
    return f"{label.replace('KVA', 'kVA')} hybrid inverter (1)"


def _battery_line(count: int) -> str:
    noun = "battery" if count == 1 else "batteries"
    return f"16 kWh LiFePO₄ lithium {noun} ({count})"


def _panel_line(count: int, *, premium: bool = False) -> str:
    brand = "570W Jinko / Longi solar panels" if premium else f"{PANEL_BRAND_LABEL} solar panels"
    return f"{brand} ({count})"


def enrich_package(pkg: dict[str, Any], *, auto_price: bool = False) -> dict[str, Any]:
    """Fill sizing, components, and tier copy from engineering + package_content rules."""
    from package_content import apply_tier_content

    pkg = apply_tier_content(pkg)
    pkg_id = pkg.get("id", "")
    inverter_kw = float(pkg.get("inverter_kw") or TIER_INVERTER_KW.get(pkg_id, 0))
    target_kwh = float(
        pkg.get("target_storage_kwh") or TIER_TARGET_STORAGE_KWH.get(pkg_id, BATTERY_MODULE_KWH)
    )

    panel_count = panel_count_for_inverter(inverter_kw)
    battery_count = battery_module_count(target_kwh)

    pkg = dict(pkg)
    pkg["inverter_kw"] = inverter_kw
    pkg["target_storage_kwh"] = target_kwh
    pkg["panel_count"] = panel_count
    pkg["panel_dc_kw"] = panel_dc_kw(panel_count)
    pkg["battery_count"] = battery_count
    pkg["battery_kwh"] = battery_count * BATTERY_MODULE_KWH

    premium_panels = pkg_id == "ep-12kva"
    tail = [
        "Battery management / monitoring (1)",
        _panel_line(panel_count, premium=premium_panels),
    ]
    if pkg_id in ("ep-12kva",):
        tail.append("DC protection, dual MPPT where required, changeover")
    elif pkg_id in ("ep-15kva", "ep-20kva"):
        tail.append("AC/DC distribution boards & changeover")
    else:
        tail.append("DC protection, changeover & AC distribution")

    tail.extend(
        [
            "Mounting structure (roof)",
            "Cables, MC4, earthing & commissioning",
        ]
    )

    pkg["components"] = [_inverter_line(pkg), _battery_line(battery_count), *tail]

    if auto_price:
        from package_pricing import compute_list_price_ghs

        pkg["price_ghs"] = compute_list_price_ghs(pkg)

    return pkg


def enrich_config(config: dict[str, Any], *, auto_price: bool = False) -> dict[str, Any]:
    out = dict(config)
    out["packages"] = [enrich_package(p, auto_price=auto_price) for p in config.get("packages", [])]
    return out
