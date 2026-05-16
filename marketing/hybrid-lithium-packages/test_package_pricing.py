from package_pricing import apply_pricing, compute_list_price_ghs
from package_sizing import enrich_package


def test_prices_increase_with_tier():
    tiers = ["ep-6.5kva", "ep-8kva", "ep-10kva", "ep-12kva", "ep-15kva", "ep-20kva"]
    prices = []
    for tid in tiers:
        p = apply_pricing({"id": tid})
        prices.append(p["price_ghs"])
    assert prices == sorted(prices)
    assert all(p > 100_000 for p in prices)


def test_essential_uses_16kwh_in_price():
    pkg = enrich_package({"id": "ep-6.5kva"})
    price = compute_list_price_ghs(pkg)
    assert price >= 120_000
