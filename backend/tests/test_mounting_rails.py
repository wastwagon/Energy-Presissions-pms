"""Mounting rail inventory heuristic (geometry only)."""
from app.services.mounting_rail_estimate import estimate_mounting_rail_inventory_with_params


def test_twenty_panels_returns_positive_sticks():
    rail_m = 5.4864  # 18 ft
    linear, sticks = estimate_mounting_rail_inventory_with_params(
        number_of_panels=20,
        module_area_m2=2.6,
        rail_length_m=rail_m,
        panel_aspect_ratio=1.93,
        rails_per_panel_rank=2.0,
        waste_factor=1.08,
    )
    assert linear is not None and sticks is not None
    assert linear > 0 and sticks > 0
    assert abs(linear - 50.14) < 0.05
    assert sticks == 10


def test_zero_panels_returns_none():
    assert estimate_mounting_rail_inventory_with_params(0, 2.6, 5.5, 1.93, 2.0, 1.0) == (None, None)
