"""Human-readable BOM rule reference for API / admin UI."""

from app.services.bom_catalog_usage import catalog_bom_usage_for_api

BOM_RULES_REFERENCE = {
    "methodology": [
        "Quantities are planning estimates for quotations, rebuilt when panels/inverter/battery change.",
        "Baseline ratios come from your Ghana proforma templates; drivers come from project sizing.",
        "Final design should follow IEC 60364-7-712 / IEC 62548 (cable ampacity, OCPD, voltage drop).",
    ],
    "drivers": {
        "number_of_panels": [
            "PV clamps (discrete_spans: same count basis as rail sets; or linear_panel / legacy)",
            "PV cable coils (ceil(panels/4); 6 mm if >30 panels or >20 kW)",
            "63A DC MCBs (1 per dc_string_count from sizing; min 2 hybrid/off-grid)",
            "dc_string_count (ceil(panels / panels_per_string), stored on sizing)",
            "Mounting rail sets OR 18 ft sticks from same rail-span panel math (bom_rail_pricing_mode — not both)",
            "Roof hooks (optional, bom_include_roof_hooks)",
            "MC4 pairs, DC/AC isolators, earth kit (bom_explicit_consumables)",
            "SPD class (500V vs 1000V by system size)",
        ],
        "inverter_size_kw_inverter_count": [
            "RR 10 mm AC cable coils (ceil(kW/5), min 2)",
            "100A vs 125A AC breaker (>8 kW total → 125A)",
            "100A changeover (1 per inverter)",
            "13-way DB count scales with inverter + DC groups",
        ],
        "battery_capacity_kwh": [
            "35 mm / 50 mm battery cable (metres by kWh)",
            "250A MCCB (max(2, 2×ceil(kWh/20)))",
        ],
        "system_size_kw": [
            "Misc kit (standard vs large)",
            "Installation SKU tier (6k vs 8k GHS)",
        ],
    },
    "not_auto_sized": [
        "Exact string layout, fuse rating per Isc, voltage drop per run",
        "AC cable size from full load current calculation",
        "Site-specific conduit/trunking take-off",
    ],
    "settings_keys": [
        "append_catalog_bom_on_quote",
        "use_bos_percentage",
        "bom_clamps_per_panel",
        "bom_mounting_qty_model",
        "bom_panels_per_rail_span",
        "bom_mid_clamps_per_rail_span",
        "bom_end_clamps_per_rail_span",
        "bom_clamp_count_model",
        "module_isc_factor",
        "mounting_rail_length_m",
        "mounting_rails_per_panel_rank",
        "mounting_rail_waste_factor",
        "bom_rail_pricing_mode",
        "bom_explicit_consumables",
        "bom_include_roof_hooks",
        "bom_roof_hooks_per_panel",
        "bom_skip_changeover_grid_tied",
    ],
}


def full_bom_rules_reference() -> dict:
    """Methodology + per-SKU usage catalog for API."""
    base = dict(BOM_RULES_REFERENCE)
    catalog = catalog_bom_usage_for_api()
    base["catalog"] = catalog
    base["overlap_notes"] = catalog.get("overlap_notes", [])
    base["recommended_manual_lines"] = catalog.get("recommended_manual_lines", [])
    return base
