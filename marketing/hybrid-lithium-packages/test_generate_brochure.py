import math

import pytest

from brochure_discount import apply_package_discount, default_output_path


def test_apply_package_discount_20_percent():
    cfg = {
        "brand": {"validity_note": "Prices valid until December 2026."},
        "packages": [{"id": "ep-8kva", "price_ghs": 194900, "price_label": "From"}],
    }
    out = apply_package_discount(cfg, 20.0)
    pkg = out["packages"][0]
    assert pkg["list_price_ghs"] == 194900
    assert pkg["price_ghs"] == math.floor(194900 * 0.8)
    assert pkg["price_label"] == "Promo"
    assert pkg["discount_badge"] == "20% OFF"
    assert pkg["savings_ghs"] == 194900 - pkg["price_ghs"]
    assert "20%" in out["brand"]["promo_banner"]


def test_default_output_path_discount_filename():
    assert default_output_path(20).name.endswith("_20pct_Discount.pdf")
    assert default_output_path(None).name == "Energy_Precisions_Hybrid_Lithium_Packages.pdf"
