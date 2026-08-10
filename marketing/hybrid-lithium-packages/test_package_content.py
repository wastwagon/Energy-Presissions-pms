from package_content import TIER_META, max_watts_label, apply_tier_content
from package_sizing import enrich_package


def test_max_watts_tracks_kva():
    assert max_watts_label(6.5) == "5,500"
    assert max_watts_label(8.0) == "6,800"
    assert max_watts_label(12.0) == "10,200"
    assert max_watts_label(20.0) == "17,000"


def test_storage_steps_up_by_tier():
    kwh = [TIER_META[t]["target_storage_kwh"] for t in TIER_META]
    assert kwh == sorted(kwh)
    assert TIER_META["ep-12kva"]["target_storage_kwh"] == 64.0
    assert TIER_META["ep-10kva"]["target_storage_kwh"] == 48.0


def test_essential_appliances_exclude_ac():
    text = TIER_META["ep-6.5kva"]["appliances"].lower()
    assert "air conditioning" in text or "no air" in text
    assert "split ac" not in text


def test_every_tier_has_customer_note():
    for tier_id in TIER_META:
        pkg = enrich_package({"id": tier_id})
        assert pkg.get("customer_note"), tier_id
        assert pkg.get("load_ceiling_help")


def test_inverter_headroom_only_when_stocked_above_load_tier():
    with_headroom = {"ep-8kva", "ep-12kva", "ep-15kva"}
    for tier_id in TIER_META:
        pkg = enrich_package({"id": tier_id})
        if tier_id in with_headroom:
            assert pkg.get("inverter_headroom"), tier_id
        else:
            assert not pkg.get("inverter_headroom"), tier_id


def test_home_and_pro_use_stocked_inverters():
    home = enrich_package({"id": "ep-8kva"})
    pro = enrich_package({"id": "ep-12kva"})
    commercial = enrich_package({"id": "ep-15kva"})
    assert "10 kW hybrid inverter" in home["components"][0]
    assert home["max_watts"] == "6,800"
    assert home["panel_count"] == 10
    assert home["panel_dc_kw"] == 5.7
    assert "6.5 kW hybrid inverters (2, synchronized)" in pro["components"][0]
    assert pro["max_watts"] == "10,200"
    assert pro["panel_count"] == 18
    assert pro["panel_dc_kw"] == 10.3
    assert "10 kW hybrid inverters (2, synchronized)" in commercial["components"][0]
    assert commercial["panel_count"] == 24
    assert commercial["panel_dc_kw"] == 13.7


def test_enrich_12kva_gets_four_batteries():
    pkg = enrich_package({"id": "ep-12kva", "price_ghs": 1})
    assert pkg["battery_count"] == 4
    assert pkg["battery_kwh"] == 64.0


def test_storage_ladder_16_to_96():
    ids = ["ep-6.5kva", "ep-8kva", "ep-10kva", "ep-12kva", "ep-15kva", "ep-20kva"]
    kwh = [enrich_package({"id": i})["battery_kwh"] for i in ids]
    assert kwh == [16.0, 32.0, 48.0, 64.0, 80.0, 96.0]
