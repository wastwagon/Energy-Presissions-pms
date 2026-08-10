"""
Marketing package sizing.

Panels / PV size: on-site package BOM (not inverter nameplate) — avoids oversizing PV
when the stocked inverter is larger than the tier (e.g. 10 kW inv on 8 KVA Home).

Inverter lines come from TIER_INVERTER_COMPONENT (stocked SKUs). Battery: 16 kWh modules.
"""
from __future__ import annotations

import math
from typing import Any

PANEL_WATTAGE = 570
PANEL_BRAND_LABEL = "570W tier-1"
MAX_DC_AC_RATIO = 1.3
BATTERY_MODULE_KWH = 16.0

# On-site solar package corrections (panel count + published PV kWp).
TIER_PANEL_COUNT: dict[str, int] = {
    "ep-6.5kva": 8,
    "ep-8kva": 10,
    "ep-10kva": 15,
    "ep-12kva": 18,
    "ep-15kva": 24,
    "ep-20kva": 36,
}

TIER_PANEL_DC_KW: dict[str, float] = {
    "ep-6.5kva": 4.6,
    "ep-8kva": 5.7,
    "ep-10kva": 8.6,
    "ep-12kva": 10.3,
    "ep-15kva": 13.7,
    "ep-20kva": 19.3,
}

LOAD_KVA_TO_TIER_ID: dict[float, str] = {
    6.5: "ep-6.5kva",
    8.0: "ep-8kva",
    10.0: "ep-10kva",
    12.0: "ep-12kva",
    15.0: "ep-15kva",
    20.0: "ep-20kva",
}

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
    "ep-8kva": 10.0,
    "ep-10kva": 10.0,
    "ep-12kva": 13.0,
    "ep-15kva": 20.0,
    "ep-20kva": 20.0,
}

# Stocked hybrid inverter lines (must match catalog — not always equal to load_kva label).
TIER_INVERTER_COMPONENT: dict[str, str] = {
    "ep-6.5kva": "6.5 kW hybrid inverter (1)",
    "ep-8kva": "10 kW hybrid inverter (1)",
    "ep-10kva": "10 kW hybrid inverter (1)",
    "ep-12kva": "6.5 kW hybrid inverters (2, synchronized)",
    "ep-15kva": "10 kW hybrid inverters (2, synchronized)",
    "ep-20kva": "10 kW hybrid inverters (2, synchronized)",
}


def panel_count_for_load_tier(
    load_kva: float,
    *,
    panel_wattage: int = PANEL_WATTAGE,
    max_dc_ac_ratio: float = MAX_DC_AC_RATIO,
) -> int:
    """PV count for package load tier (on-site BOM when known)."""
    del panel_wattage, max_dc_ac_ratio  # kept for call-site compatibility
    if load_kva <= 0:
        return 0
    tier_id = LOAD_KVA_TO_TIER_ID.get(float(load_kva))
    if tier_id and tier_id in TIER_PANEL_COUNT:
        return TIER_PANEL_COUNT[tier_id]
    return 0


def panel_count_for_tier_id(pkg_id: str) -> int:
    return TIER_PANEL_COUNT.get(pkg_id, 0)


def panel_count_for_inverter(
    inverter_kw: float,
    *,
    panel_wattage: int = PANEL_WATTAGE,
    max_dc_ac_ratio: float = MAX_DC_AC_RATIO,
) -> int:
    """Legacy helper — prefer panel_count_for_load_tier for marketing packages."""
    return panel_count_for_load_tier(
        inverter_kw, panel_wattage=panel_wattage, max_dc_ac_ratio=max_dc_ac_ratio
    )


def battery_module_count(
    target_kwh: float,
    *,
    module_kwh: float = BATTERY_MODULE_KWH,
) -> int:
    if target_kwh <= 0:
        return 1
    return max(1, math.ceil(target_kwh / module_kwh))


def panel_dc_kw(panel_count: int, panel_wattage: int = PANEL_WATTAGE) -> float:
    """Fallback DC kWp from count × wattage (prefer TIER_PANEL_DC_KW in enrich)."""
    return round(panel_count * panel_wattage / 1000, 2)


def panel_dc_kw_for_tier(pkg_id: str, panel_count: int) -> float:
    if pkg_id in TIER_PANEL_DC_KW:
        return TIER_PANEL_DC_KW[pkg_id]
    return panel_dc_kw(panel_count)


def _inverter_line(pkg: dict[str, Any]) -> str:
    pkg_id = pkg.get("id", "")
    if pkg_id in TIER_INVERTER_COMPONENT:
        return TIER_INVERTER_COMPONENT[pkg_id]
    kw = pkg.get("inverter_kw") or TIER_INVERTER_KW.get(pkg_id, 0)
    return f"{kw} kW hybrid inverter (1)"


def _battery_line(count: int) -> str:
    noun = "battery" if count == 1 else "batteries"
    return f"16 kWh LiFePO₄ lithium {noun} ({count})"


def _panel_line(count: int, *, premium: bool = False) -> str:
    brand = "570W Jinko / Longi solar panels" if premium else f"{PANEL_BRAND_LABEL} solar panels"
    return f"{brand} ({count})"


def enrich_package(pkg: dict[str, Any], *, auto_price: bool = False) -> dict[str, Any]:
    """Fill sizing, components, and tier copy from engineering + package_content rules."""
    from package_content import apply_tier_content
    from package_copy import (
        LOAD_CEILING_HELP,
        tier_brochure_note,
        tier_customer_note,
        tier_inverter_headroom,
    )

    pkg = apply_tier_content(pkg)
    pkg_id = pkg.get("id", "")
    inverter_kw = float(pkg.get("inverter_kw") or TIER_INVERTER_KW.get(pkg_id, 0))
    load_kva = float(pkg.get("load_kva") or inverter_kw)
    target_kwh = float(
        pkg.get("target_storage_kwh") or TIER_TARGET_STORAGE_KWH.get(pkg_id, BATTERY_MODULE_KWH)
    )

    panel_count = panel_count_for_tier_id(pkg_id) or panel_count_for_load_tier(load_kva)
    battery_count = battery_module_count(target_kwh)

    pkg = dict(pkg)
    pkg["inverter_kw"] = inverter_kw
    pkg["load_kva"] = load_kva
    pkg["target_storage_kwh"] = target_kwh
    pkg["panel_count"] = panel_count
    pkg["panel_dc_kw"] = panel_dc_kw_for_tier(pkg_id, panel_count)
    pkg["battery_count"] = battery_count
    pkg["battery_kwh"] = battery_count * BATTERY_MODULE_KWH
    pkg["load_ceiling_help"] = LOAD_CEILING_HELP
    pkg["customer_note"] = tier_customer_note(pkg_id)
    pkg["brochure_note"] = tier_brochure_note(pkg_id)
    headroom = tier_inverter_headroom(pkg_id)
    if headroom:
        pkg["inverter_headroom"] = headroom

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
    from package_copy import FOOTER_BULLETS, READING_GUIDE

    out = dict(config)
    out["packages"] = [enrich_package(p, auto_price=auto_price) for p in config.get("packages", [])]
    out["reading_guide"] = config.get("reading_guide") or READING_GUIDE
    out["footer_bullets"] = FOOTER_BULLETS
    return out
