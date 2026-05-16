"""Catalog BOM quantity rules (mounting rail-span vs legacy)."""
from unittest.mock import MagicMock

import pytest

from app.models import SystemType
from app.services import bom_quantities as bq


def _mock_db() -> MagicMock:
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    return db


def _sizing(panels: int, **kwargs) -> MagicMock:
    m = MagicMock()
    m.number_of_panels = panels
    m.inverter_size_kw = kwargs.get("inverter_size_kw", 5.0)
    m.inverter_count = kwargs.get("inverter_count", 1)
    m.inverter_unit_size_kw = kwargs.get("inverter_unit_size_kw", 5.0)
    m.battery_capacity_kwh = kwargs.get("battery_capacity_kwh", 0.0)
    m.system_size_kw = kwargs.get("system_size_kw", float(panels) * 0.5)
    m.mounting_rails_estimate = kwargs.get("mounting_rails_estimate", 0)
    m.dc_string_count = kwargs.get("dc_string_count", None)
    return m


def test_rail_span_31_panels_sets_mode() -> None:
    db = _mock_db()
    qty = bq.compute_bom_quantities(
        db, _sizing(31), system_type=SystemType.GRID_TIED
    )
    # discrete_spans: 7 spans × (8+4) = 84 (matches 7 rail sets)
    assert qty.get("BOS-PV-CLAMP-EA") == 84.0
    assert qty.get("MNT-RAIL-SET-350") == 7.0
    assert "MNT-RAIL-18FT" not in qty.lines


def test_rail_span_32_panels_discrete_aligns_rails_and_clamps() -> None:
    """Same rule as quote BOM: 32 panels → ceil(32/5)=7 spans."""
    db = _mock_db()
    qty = bq.compute_bom_quantities(
        db, _sizing(32), system_type=SystemType.GRID_TIED
    )
    assert qty.get("MNT-RAIL-SET-350") == 7.0
    assert qty.get("BOS-PV-CLAMP-EA") == 84.0  # 7 × (8 + 4)


def test_linear_clamp_model(monkeypatch: pytest.MonkeyPatch) -> None:
    db = _mock_db()
    real_str = bq._setting_str

    def fake_str(d, k, default):  # type: ignore[no-untyped-def]
        if k == "bom_clamp_count_model":
            return "linear_panel"
        return real_str(d, k, default)

    monkeypatch.setattr(bq, "_setting_str", fake_str)
    qty = bq.compute_bom_quantities(
        db, _sizing(31), system_type=SystemType.GRID_TIED
    )
    assert qty.get("BOS-PV-CLAMP-EA") == 75.0  # round(49.6)+round(24.8)


def test_rail_span_31_panels_sticks_mode(monkeypatch: pytest.MonkeyPatch) -> None:
    db = _mock_db()
    real_str = bq._setting_str

    def fake_str(d, k, default):  # type: ignore[no-untyped-def]
        if k == "bom_rail_pricing_mode":
            return "sticks"
        return real_str(d, k, default)

    monkeypatch.setattr(bq, "_setting_str", fake_str)
    qty = bq.compute_bom_quantities(
        db, _sizing(31), system_type=SystemType.GRID_TIED
    )
    assert qty.get("MNT-RAIL-18FT") == 14.0  # ceil(31/5)=7 spans × 2 sticks
    assert "MNT-RAIL-SET-350" not in qty.lines


def test_legacy_uses_clamps_per_panel(monkeypatch: pytest.MonkeyPatch) -> None:
    db = _mock_db()
    real_str = bq._setting_str

    def fake_str(d, k, default):  # type: ignore[no-untyped-def]
        if k == "bom_mounting_qty_model":
            return "legacy_per_panel"
        return real_str(d, k, default)

    monkeypatch.setattr(bq, "_setting_str", fake_str)
    qty = bq.compute_bom_quantities(
        db, _sizing(10), system_type=SystemType.GRID_TIED
    )
    assert qty.get("BOS-PV-CLAMP-EA") == 35.0  # round(10 * 3.5)
    assert qty.get("MNT-RAIL-SET-350") == 7.0  # max(2, ceil(10*5/8))


def test_rail_span_zero_panels_no_mounting_lines() -> None:
    db = _mock_db()
    qty = bq.compute_bom_quantities(
        db, _sizing(0), system_type=SystemType.GRID_TIED
    )
    assert "BOS-PV-CLAMP-EA" not in qty.lines
    assert "MNT-RAIL-SET-350" not in qty.lines
    assert "MNT-RAIL-18FT" not in qty.lines
