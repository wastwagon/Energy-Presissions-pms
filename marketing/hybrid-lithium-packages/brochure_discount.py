"""Promotional pricing for brochure PDF generation (does not modify packages.json)."""
from __future__ import annotations

import copy
import math
from pathlib import Path

DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT = DIR / "output" / "Energy_Precisions_Hybrid_Lithium_Packages.pdf"
DISCOUNT_OUTPUT = DIR / "output" / "Energy_Precisions_Hybrid_Lithium_Packages_20pct_Discount.pdf"


def apply_package_discount(config: dict, discount_percent: float) -> dict:
    if discount_percent <= 0 or discount_percent >= 100:
        raise ValueError("discount_percent must be between 0 and 100 (exclusive)")
    out = copy.deepcopy(config)
    factor = 1.0 - discount_percent / 100.0
    pct_label = (
        str(int(discount_percent))
        if discount_percent == int(discount_percent)
        else f"{discount_percent:g}"
    )
    brand = out.setdefault("brand", {})
    brand["promo_banner"] = f"{pct_label}% PROMOTIONAL DISCOUNT — ALL SIX PACKAGES"
    brand["promo_note"] = (
        f"Prices below include {pct_label}% off standard turnkey list. "
        "Final quotation confirmed after site survey."
    )
    validity = brand.get("validity_note", "")
    if validity:
        brand["validity_note"] = f"{validity} Promotional pricing shown where applicable."
    for pkg in out.get("packages", []):
        list_price = int(pkg.get("price_ghs") or 0)
        if list_price <= 0:
            continue
        promo_price = int(math.floor(list_price * factor))
        pkg["list_price_ghs"] = list_price
        pkg["price_ghs"] = promo_price
        pkg["price_label"] = "Promo"
        pkg["discount_percent"] = float(discount_percent)
        pkg["discount_badge"] = f"{pct_label}% OFF"
        pkg["savings_ghs"] = list_price - promo_price
    return out


def default_output_path(discount_percent: float | None) -> Path:
    if discount_percent is None:
        return DEFAULT_OUTPUT
    pct = int(discount_percent) if discount_percent == int(discount_percent) else discount_percent
    if pct == 20:
        return DISCOUNT_OUTPUT
    return DIR / "output" / f"Energy_Precisions_Hybrid_Lithium_Packages_{pct}pct_Discount.pdf"
