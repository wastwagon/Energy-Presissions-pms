"""Mounting rail length / stick-count estimates from panel count and module area.

Physical note: roof footprint (area) alone does not determine how many 18 ft rails you need,
because the same area can be one long row or several shorter rows. We use a documented
portrait grid heuristic for **planning** quantities.
"""
from __future__ import annotations

import math
from typing import Optional, Tuple


def estimate_mounting_rail_inventory_with_params(
    number_of_panels: int,
    module_area_m2: float,
    rail_length_m: float,
    panel_aspect_ratio: float,
    rails_per_panel_rank: float,
    waste_factor: float,
) -> Tuple[Optional[float], Optional[int]]:
    """
    Pure numeric rail estimate.

    - ``cols = ceil(sqrt(N))``, ``rows = ceil(N / cols)``.
    - Portrait: short edge horizontal → span per rank = ``cols * sqrt(module_area / aspect)``.
    - Linear metres ≈ ``rows * rails_per_rank * span * waste``.
    - Sticks = ``ceil(linear / rail_length_m)``.
    """
    if number_of_panels <= 0 or module_area_m2 <= 0:
        return None, None
    if rail_length_m <= 0:
        return None, None

    aspect = max(float(panel_aspect_ratio), 1.05)
    width_m = math.sqrt(float(module_area_m2) / aspect)
    rails_per_rank = max(float(rails_per_panel_rank), 0.5)
    waste = max(float(waste_factor), 1.0)

    cols = max(1, math.ceil(math.sqrt(number_of_panels)))
    rows = max(1, math.ceil(number_of_panels / cols))
    span_m = cols * width_m
    linear_m = rows * rails_per_rank * span_m * waste
    pieces = int(math.ceil(linear_m / rail_length_m))
    return round(linear_m, 2), pieces
