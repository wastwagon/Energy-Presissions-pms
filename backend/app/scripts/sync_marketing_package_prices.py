#!/usr/bin/env python3
"""
Sync brochure tier prices from CMS defaults into marketing/hybrid-lithium-packages/packages.json.

Run after price changes in cms_defaults.py or hybridPackages.ts:
  python -m app.scripts.sync_marketing_package_prices
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.cms_defaults import get_page_defaults

REPO_ROOT = Path(__file__).resolve().parents[3]
PACKAGES_JSON = REPO_ROOT / "marketing" / "hybrid-lithium-packages" / "packages.json"


def sync_marketing_package_prices() -> int:
    if not PACKAGES_JSON.is_file():
        print(f"Skip — not found: {PACKAGES_JSON}", file=sys.stderr)
        return 0

    tier_prices = get_page_defaults("packages").get("tier_prices") or {}
    if not tier_prices:
        print("No tier_prices in packages CMS defaults", file=sys.stderr)
        return 0

    data = json.loads(PACKAGES_JSON.read_text(encoding="utf-8"))
    updated = 0
    for pkg in data.get("packages", []):
        pkg_id = pkg.get("id")
        if pkg_id in tier_prices:
            new_price = int(tier_prices[pkg_id])
            if pkg.get("price_ghs") != new_price:
                pkg["price_ghs"] = new_price
                updated += 1

    if updated:
        PACKAGES_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Updated {updated} price(s) in {PACKAGES_JSON}")
    else:
        print("Marketing packages.json prices already in sync")
    return updated


def main() -> None:
    count = sync_marketing_package_prices()
    if count:
        print(f"✅ Synced {count} marketing package price(s)")


if __name__ == "__main__":
    main()
