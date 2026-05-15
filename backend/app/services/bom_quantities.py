"""
Derive itemized BOS catalog quantities from sizing results.

See ``bom_catalog_usage.CATALOG_BOM_ITEMS`` for per-SKU purpose and overlap notes.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models import Setting, SizingResult as SizingResultModel, SystemType


def _setting_float(db: Session, key: str, default: float) -> float:
    row = db.query(Setting).filter(Setting.key == key).first()
    if row:
        try:
            return float(row.value)
        except (ValueError, TypeError):
            pass
    return default


def _setting_bool(db: Session, key: str, default: bool) -> bool:
    row = db.query(Setting).filter(Setting.key == key).first()
    if not row:
        return default
    return str(row.value).strip().lower() not in ("0", "false", "no", "off")


def _setting_str(db: Session, key: str, default: str) -> str:
    row = db.query(Setting).filter(Setting.key == key).first()
    if row and row.value is not None:
        return str(row.value).strip().lower()
    return default


@dataclass
class BomQuantities:
    """SKU → quantity (0 or missing = skip line)."""

    lines: Dict[str, float] = field(default_factory=dict)
    notes: Dict[str, str] = field(default_factory=dict)

    def set(self, sku: str, qty: float, note: str = "") -> None:
        if qty and qty > 0:
            self.lines[sku] = float(qty)
            if note:
                self.notes[sku] = note

    def get(self, sku: str, default: float = 0.0) -> float:
        return self.lines.get(sku, default)


def _dc_string_count(db: Session, sizing: SizingResultModel) -> int:
    stored = getattr(sizing, "dc_string_count", None)
    if stored is not None and int(stored) > 0:
        return int(stored)
    panels = int(sizing.number_of_panels or 0)
    if panels <= 0:
        return 1
    panels_per_string = int(_setting_float(db, "panels_per_string", 12))
    return max(1, math.ceil(panels / panels_per_string))


def compute_bom_quantities(
    db: Session,
    sizing: SizingResultModel,
    system_type: Optional[SystemType] = None,
) -> BomQuantities:
    """
    Map sizing → catalog SKU quantities.

    Primary drivers:
    - number_of_panels → clamps, PV cable, DC protection, rails, hooks
    - inverter_size_kw / inverter_count → AC cable, AC breakers, changeovers, DBs
    - battery_capacity_kwh → battery cable (mm²), MCCB count
    - dc_string_count → DC breakers, isolators, PV coils
    """
    out = BomQuantities()

    panels = int(sizing.number_of_panels or 0)
    inv_kw = float(sizing.inverter_size_kw or 0.0)
    inv_count = int(getattr(sizing, "inverter_count", None) or 1) or 1
    inv_unit_kw = float(
        getattr(sizing, "inverter_unit_size_kw", None) or sizing.inverter_size_kw or inv_kw
    )
    battery_kwh = float(sizing.battery_capacity_kwh or 0.0)
    if system_type == SystemType.GRID_TIED and battery_kwh <= 0:
        battery_kwh = 0.0
    system_kw = float(sizing.system_size_kw or 0.0)
    rail_sticks = int(sizing.mounting_rails_estimate or 0)
    dc_strings = _dc_string_count(db, sizing)

    rail_mode = _setting_str(db, "bom_rail_pricing_mode", "sets")
    explicit_consumables = _setting_bool(db, "bom_explicit_consumables", True)
    include_roof_hooks = _setting_bool(db, "bom_include_roof_hooks", False)
    skip_co_grid = _setting_bool(db, "bom_skip_changeover_grid_tied", True)

    # --- Mounting (sets OR sticks — not both) ---
    clamp_factor = _setting_float(db, "bom_clamps_per_panel", 3.5)
    out.set(
        "BOS-PV-CLAMP-EA",
        max(1.0, round(panels * clamp_factor)),
        f"{clamp_factor:.1f}× panels",
    )

    if rail_mode == "sticks" and rail_sticks > 0:
        out.set("MNT-RAIL-18FT", float(rail_sticks), "stick pricing from sizing")
    elif panels > 0:
        rail_sets = max(2.0, math.ceil(panels * 5.0 / 8.0))
        out.set("MNT-RAIL-SET-350", rail_sets, "proforma rail sets")

    if include_roof_hooks and panels > 0:
        hooks_per = _setting_float(db, "bom_roof_hooks_per_panel", 2.0)
        out.set(
            "BOS-ROOF-HOOK-EA",
            max(1.0, math.ceil(panels * hooks_per)),
            f"{hooks_per:.0f}× panels",
        )

    # --- DC / AC cabling ---
    pv_coil_sku = "CAB-PV-6MM-100M" if panels > 30 or system_kw > 20 else "CAB-PV-4MM-100M"
    pv_coils = max(2.0, math.ceil(dc_strings / 2.0)) if dc_strings else max(2.0, math.ceil(panels / 4.0))
    out.set(pv_coil_sku, pv_coils, f"PV homerun ({dc_strings} DC strings)")

    total_inv = inv_unit_kw * inv_count if inv_count > 1 else inv_kw
    out.set(
        "CAB-RR10MM-100M",
        max(2.0, math.ceil(max(inv_kw, total_inv) / 5.0)),
        "AC feeder coils vs inverter kW",
    )
    if total_inv <= 10:
        out.set("CAB-AC-6MM-100M", 1.0, "AC branch / DB wiring")
    elif total_inv > 10:
        out.set(
            "CAB-AC-6MM-100M",
            max(1.0, math.ceil(total_inv / 10.0)),
            "AC branch runs",
        )

    if battery_kwh > 0:
        if battery_kwh >= 15:
            out.set(
                "CAB-BATT-50MM-M",
                max(10.0, round(battery_kwh * 0.9)),
                "~0.9 m per kWh (large bank)",
            )
            out.set(
                "CAB-BATT-35MM-M",
                max(10.0, round(battery_kwh * 0.5)),
                "supplementary 35 mm runs",
            )
        else:
            out.set(
                "CAB-BATT-35MM-M",
                max(10.0, round(battery_kwh * 2.0)),
                "~2 m per kWh",
            )

    # --- Protection / distribution ---
    min_dc_breakers = 1.0 if system_type == SystemType.GRID_TIED else 2.0
    out.set(
        "PRT-DC63-2P",
        max(min_dc_breakers, float(dc_strings)),
        f"DC string groups ({dc_strings} strings)",
    )

    if total_inv > 8:
        out.set("PRT-AC125-1P", 1.0, f"inverter {total_inv:.1f} kW > 8 kW")
        out.set("PRT-AC100-1P", 1.0, "main AC feed")
    else:
        out.set("PRT-AC100-1P", max(1.0, float(min(2, inv_count))), "AC branch protection")

    if not (system_type == SystemType.GRID_TIED and skip_co_grid):
        out.set("PRT-CO-100A", float(max(1, inv_count)), "1 per inverter / genset path")

    out.set("BOX-DB-6WAY", 1.0)
    db_13 = max(2.0, math.ceil(inv_count + dc_strings / 2.0))
    if system_kw > 50:
        db_13 = max(db_13, math.ceil(system_kw / 25.0))
    out.set("BOX-DB-13WAY", db_13)

    if system_kw >= 30 or panels > 40:
        out.set("PRT-SPD-1000V", 1.0, "large array")
    else:
        out.set("PRT-SPD-500V", 1.0, "standard hybrid")

    if battery_kwh > 0:
        mccbs = max(2.0, 2.0 * math.ceil(battery_kwh / 20.0))
        out.set("PRT-MCCB-250A", mccbs, "battery bank protection")

    # --- Explicit consumables (split from misc kit) ---
    if explicit_consumables:
        if panels > 0:
            out.set(
                "BOS-MC4-PAIR",
                max(2.0, math.ceil(panels * 1.2)),
                "~1.2 pairs per panel",
            )
        out.set(
            "BOS-DC-ISO-32A",
            max(1.0, float(dc_strings)),
            "DC isolator per string group",
        )
        out.set(
            "BOS-AC-ISO-40A",
            float(max(1, inv_count)),
            "AC isolator per inverter",
        )
        earth_lots = 1.0 + (math.ceil(panels / 16.0) if panels > 0 else 0)
        out.set("BOS-EARTH-KIT", earth_lots, "earthing per array section")
        if panels > 0:
            out.set(
                "BOS-TRUNK-25MM-M",
                max(5.0, math.ceil(panels * 1.5)),
                "trunking metres",
            )
        out.set("BOS-LABEL-KIT", 1.0, "labels & warnings")

    misc_sku = "KIT-MISC-BOS-L" if panels > 30 or system_kw > 20 else "KIT-MISC-BOS"
    misc_note = "glands, lugs, ties, fixings"
    if explicit_consumables:
        misc_note = "remaining consumables (glands, lugs, ties)"
    out.set(misc_sku, 1.0, misc_note)

    out.set("SRV-TRANSPORT-STD", 1.0)

    if system_kw > 25:
        install_sku = "SRV-INSTALL-8000"
    else:
        install_sku = "SRV-INSTALL-6000"
    out.set(install_sku, 1.0, f"tier for {system_kw:.1f} kW")

    return out


def catalog_bom_append_enabled(db: Session) -> bool:
    row = db.query(Setting).filter(Setting.key == "append_catalog_bom_on_quote").first()
    return not row or str(row.value).strip().lower() not in ("0", "false", "no")
