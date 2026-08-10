"""Panel/battery sizing for marketing packages (no DB)."""
from package_sizing import (
    BATTERY_MODULE_KWH,
    TIER_PANEL_COUNT,
    TIER_PANEL_DC_KW,
    battery_module_count,
    enrich_package,
    panel_count_for_load_tier,
    panel_dc_kw_for_tier,
)


def test_panel_count_matches_onsite_bom():
    assert panel_count_for_load_tier(6.5) == 8
    assert panel_count_for_load_tier(8.0) == 10
    assert panel_count_for_load_tier(10.0) == 15
    assert panel_count_for_load_tier(12.0) == 18
    assert panel_count_for_load_tier(15.0) == 24
    assert panel_count_for_load_tier(20.0) == 36
    assert TIER_PANEL_COUNT == {
        "ep-6.5kva": 8,
        "ep-8kva": 10,
        "ep-10kva": 15,
        "ep-12kva": 18,
        "ep-15kva": 24,
        "ep-20kva": 36,
    }
    assert TIER_PANEL_DC_KW == {
        "ep-6.5kva": 4.6,
        "ep-8kva": 5.7,
        "ep-10kva": 8.6,
        "ep-12kva": 10.3,
        "ep-15kva": 13.7,
        "ep-20kva": 19.3,
    }


def test_home_panels_follow_load_not_10kw_inverter():
    home = enrich_package({"id": "ep-8kva"})
    assert home["load_kva"] == 8.0
    assert home["inverter_kw"] == 10.0
    assert home["panel_count"] == 10
    assert home["panel_dc_kw"] == 5.7


def test_panel_dc_kw_uses_onsite_labels():
    for pkg_id, expected_kw in TIER_PANEL_DC_KW.items():
        assert panel_dc_kw_for_tier(pkg_id, TIER_PANEL_COUNT[pkg_id]) == expected_kw
        pkg = enrich_package({"id": pkg_id})
        assert pkg["panel_dc_kw"] == expected_kw
        assert pkg["panel_count"] == TIER_PANEL_COUNT[pkg_id]


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
    assert pkg["panel_count"] == 8
    assert pkg["panel_dc_kw"] == 4.6
