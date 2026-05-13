"""Regression tests for core PV sizing arithmetic (no DB)."""
import math


def panel_count_from_daily_kwh(
    daily_kwh: float,
    system_efficiency: float,
    peak_sun_hours: float,
    design_factor: float,
    panel_wattage: int,
) -> int:
    """Match the stepped model used in docs/test_sizing_calc.py (unrounded system kW for panel ceil)."""
    effective_daily_kwh = daily_kwh / system_efficiency
    system_size_kw_before = effective_daily_kwh / peak_sun_hours
    system_size_kw_after = system_size_kw_before * design_factor
    panels_exact = system_size_kw_after * 1000 / panel_wattage
    return math.ceil(panels_exact)


def test_reference_scenario_matches_manual_worksheet():
    """Known scenario from test_sizing_calc.py (33.27 kWh/d, 72% eff, 5 PSH, 1.2 DF, 580 W)."""
    assert panel_count_from_daily_kwh(33.27, 0.72, 5.0, 1.20, 580) == 20


def test_positive_load_yields_at_least_one_panel():
    assert panel_count_from_daily_kwh(10.0, 0.72, 5.0, 1.20, 580) >= 1
