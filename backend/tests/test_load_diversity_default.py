"""Verify load diversity defaults to 1.0 when setting is missing (full load / no reduction)."""
from unittest.mock import MagicMock

from app.services.load_calculator import get_setting_value, calculate_total_daily_kwh


def test_missing_load_diversity_setting_uses_default_one():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    assert get_setting_value(db, "load_diversity_factor", 1.0) == 1.0


def test_total_daily_kwh_with_diversity_matches_raw_when_factor_one():
    """When diversity row is absent, fallback 1.0 → diversified total equals sum of appliance daily kWh."""
    from app.models import Appliance
    from app.models import PowerUnit

    db = MagicMock()

    def query_side(model):
        m = MagicMock()
        if model.__name__ == "Setting":
            m.filter.return_value.first.return_value = None
        elif model.__name__ == "Appliance":
            a = MagicMock(spec=Appliance)
            a.daily_kwh = 10.0
            a.power_value = 1000.0
            a.power_unit = PowerUnit.W
            a.quantity = 1
            a.hours_per_day = 10.0
            a.appliance_type = MagicMock()
            a.appliance_type.value = "other"
            m.filter.return_value.all.return_value = [a]
        return m

    db.query.side_effect = query_side

    raw = calculate_total_daily_kwh(db, 1, apply_diversity_factor=False)
    div = calculate_total_daily_kwh(db, 1, apply_diversity_factor=True)
    assert raw == div == 10.0
