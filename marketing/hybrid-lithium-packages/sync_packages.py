#!/usr/bin/env python3
"""Apply tier copy + sizing to packages.json (preserves price_ghs)."""
from __future__ import annotations

import json
from pathlib import Path

from package_sizing import enrich_config

CONFIG = Path(__file__).resolve().parent / "packages.json"


def main() -> None:
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    prices = {p["id"]: p["price_ghs"] for p in cfg["packages"]}
    out = enrich_config(cfg)
    for p in out["packages"]:
        p["price_ghs"] = prices[p["id"]]
    CONFIG.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"Updated {CONFIG} ({len(out['packages'])} tiers)")


if __name__ == "__main__":
    main()
