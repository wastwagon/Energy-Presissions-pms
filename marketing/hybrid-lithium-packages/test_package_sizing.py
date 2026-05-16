"""Panel/battery sizing for marketing packages (no DB)."""
import math

from package_sizing import (
    BATTERY_MODULE_KWH,
    MAX_DC_AC_RATIO,
    PANEL_WATTAGE,
    battery_module_count,
    enrich_package,
    panel_count_for_inverter,
)


def test_panel_count_matches_dc_ac_formula():
    assert panel_count_for_inverter(6.5) == math.ceil(6.5 * MAX_DC_AC_RATIO * 1000 / PANEL_WATTAGE)
    assert panel_count_for_inverter(6.5) == 15
    assert panel_count_for_inverter(8.0) == 19
    assert panel_count_for_inverter(10.0) == 23
    assert panel_count_for_inverter(12.0) == 28
    assert panel_count_for_inverter(15.0) == 35
    assert panel_count_for_inverter(20.0) == 46


def test_battery_modules_use_16kwh_blocks():
    assert battery_module_count(16) == 1
    assert battery_module_count(32) == 2
    assert battery_module_count(40) == 3
    assert battery_module_count(80) == 5


def test_enrich_uses_16kwh_not_5kwh():
    pkg = enrich_package({"id": "ep-6.5kva", "kva_label": "6.5 KVA SYSTEM"})
    assert "16 kWh" in pkg["components"][1]
    assert "5 kWh" not in " ".join(pkg["components"])
    assert pkg["battery_count"] == 1
    assert pkg["battery_kwh"] == BATTERY_MODULE_KWH
