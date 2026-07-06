"""Bundled hybrid package tiers — shared JSON with frontend cmsPackageTiers.json."""
from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

REPO_ROOT = Path(__file__).resolve().parents[2]
TIERS_JSON = REPO_ROOT / "frontend" / "src" / "data" / "cmsPackageTiers.json"


@lru_cache(maxsize=1)
def get_default_package_tiers() -> List[Dict[str, Any]]:
    if not TIERS_JSON.is_file():
        return []
    data = json.loads(TIERS_JSON.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        return []
    return copy.deepcopy(data)
