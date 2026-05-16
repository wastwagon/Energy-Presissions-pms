"""
Marketing copy and load ceilings per package tier — kept consistent with inverter kVA and storage.

max_watts ≈ kVA × 0.85 (realistic continuous power factor for hybrid marketing).
Appliance lists assume staggered use of heavy loads (AC, iron, heater) unless noted.
"""
from __future__ import annotations

from typing import Any

POWER_FACTOR = 0.85

TIER_META: dict[str, dict[str, Any]] = {
    "ep-6.5kva": {
        "badge": "Essential",
        "kva_label": "6.5 KVA SYSTEM",
        "load_kva": 6.5,
        "inverter_kw": 6.5,
        "target_storage_kwh": 16.0,
        "highlights": ["Entry tier · flats & small homes"],
        "appliances": (
            "Fridge, TV, standing fans, router, 15–20 LED lights, phone and laptop charging, "
            "blender or kettle (one at a time). No air conditioning — add a higher tier for AC."
        ),
    },
    "ep-8kva": {
        "badge": "Home",
        "kva_label": "8 KVA SYSTEM",
        "load_kva": 8.0,
        "inverter_kw": 10.0,
        "inverter_cost_ghs": 11000.0,
        "target_storage_kwh": 32.0,
        "highlights": ["Popular family home"],
        "appliances": (
            "Fridge, rice cooker, blender, iron (staggered), 1 split AC (1–1.5 hp), "
            "25 LED bulbs, 4–5 fans, 2 TVs, home Wi‑Fi, 2–3 laptops or computers, printer."
        ),
    },
    "ep-10kva": {
        "badge": "Plus",
        "kva_label": "10 KVA SYSTEM",
        "load_kva": 10.0,
        "inverter_kw": 10.0,
        "target_storage_kwh": 48.0,
        "highlights": ["Large home or small office"],
        "appliances": (
            "2 fridges or fridge + freezer, rice cooker or microwave, blender, iron (staggered), "
            "up to 2 split AC (1–1.5 hp, not together on full cool), 30 LED bulbs, 4–5 fans, "
            "2 TVs, small office (PCs, printer, router)."
        ),
    },
    "ep-12kva": {
        "badge": "Pro",
        "kva_label": "12 KVA SYSTEM",
        "load_kva": 12.0,
        "inverter_kw": 13.0,
        "inverter_cost_ghs": 13000.0,
        "target_storage_kwh": 64.0,
        "highlights": ["Executive home · boutique office"],
        "appliances": (
            "2 fridges/freezers, kitchen blender, rice cooker, iron and heater (staggered), "
            "2–3 split AC (1–1.5 hp — alternate with kitchen peaks, not all on full cool), "
            "30+ LED bulbs, 4–5 fans, 2–3 TVs, home office or shop POS and computers."
        ),
    },
    "ep-15kva": {
        "badge": "Commercial",
        "kva_label": "15 KVA SYSTEM",
        "load_kva": 15.0,
        "inverter_kw": 20.0,
        "inverter_cost_ghs": 22000.0,
        "target_storage_kwh": 80.0,
        "highlights": ["Guest house · shop · church hall"],
        "appliances": (
            "Several guest rooms, commercial fridge, kitchen appliances (staggered), "
            "up to 4 split AC (1–1.5 hp) with load management, sound system, reception PCs, "
            "security and corridor lighting, small water pump or booster (if within survey load)."
        ),
    },
    "ep-20kva": {
        "badge": "Power",
        "kva_label": "20 KVA SYSTEM",
        "load_kva": 20.0,
        "inverter_kw": 20.0,
        "target_storage_kwh": 96.0,
        "highlights": ["Hotel wing · office block · multi-tenant"],
        "appliances": (
            "Multiple guest-room AC (1–1.5 hp, staggered across rooms), commercial kitchen peaks, "
            "laundry alternated with AC, fridges, IT/server room on dedicated circuit, "
            "event or hall lighting — engineered load schedule on survey."
        ),
    },
}


def max_watts_label(kva: float, *, power_factor: float = POWER_FACTOR) -> str:
    """Continuous load ceiling (W) for brochure — matches kVA label."""
    watts = int(round(kva * power_factor * 1000 / 100) * 100)
    return f"{watts:,}"


def apply_tier_content(pkg: dict[str, Any]) -> dict[str, Any]:
    pkg_id = pkg.get("id", "")
    meta = TIER_META.get(pkg_id)
    if not meta:
        return pkg
    pkg = dict(pkg)
    pkg.update(
        {
            k: v
            for k, v in meta.items()
            if k not in ("inverter_kw", "load_kva", "inverter_cost_ghs")
        }
    )
    load_kva = float(meta.get("load_kva", meta["inverter_kw"]))
    pkg["load_kva"] = load_kva
    pkg["inverter_kw"] = float(meta["inverter_kw"])
    pkg["target_storage_kwh"] = meta["target_storage_kwh"]
    pkg["max_watts"] = max_watts_label(load_kva)
    if "inverter_cost_ghs" in meta:
        pkg["inverter_cost_ghs"] = float(meta["inverter_cost_ghs"])
    return pkg
