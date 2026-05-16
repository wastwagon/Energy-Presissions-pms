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


def test_enrich_12kva_gets_four_batteries():
    pkg = enrich_package({"id": "ep-12kva", "price_ghs": 1})
    assert pkg["battery_count"] == 4
    assert pkg["battery_kwh"] == 64.0


def test_storage_ladder_16_to_96():
    ids = ["ep-6.5kva", "ep-8kva", "ep-10kva", "ep-12kva", "ep-15kva", "ep-20kva"]
    kwh = [enrich_package({"id": i})["battery_kwh"] for i in ids]
    assert kwh == [16.0, 32.0, 48.0, 64.0, 80.0, 96.0]
