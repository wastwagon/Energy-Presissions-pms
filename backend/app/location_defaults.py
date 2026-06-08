"""Bundled location landing defaults — parsed from frontend locationPages.ts."""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

REPO_ROOT = Path(__file__).resolve().parents[2]
LOCATION_TS = REPO_ROOT / "frontend" / "src" / "data" / "locationPages.ts"


def _grab(block: str, key: str, default: str = "") -> str:
    m = re.search(rf"{key}:\s*'([^']*)'|{key}:\s*\"([^\"]*)\"", block)
    if not m:
        return default
    return m.group(1) or m.group(2) or default


def _grab_array(block: str, key: str) -> List[str]:
    m = re.search(rf"{key}:\s*\[([^\]]*)\]", block, re.DOTALL)
    if not m:
        return []
    return [a or b for a, b in re.findall(r"'([^']*)'|\"([^\"]*)\"", m.group(1)) if (a or b)]


def parse_location_items_from_ts(path: Path = LOCATION_TS) -> List[Dict[str, Any]]:
    if not path.is_file():
        return []
    text = path.read_text(encoding="utf-8")
    items: List[Dict[str, Any]] = []
    for block in re.split(r"\n  \{", text)[1:]:
        slug = _grab(block, "slug")
        if not slug.startswith("solar-"):
            continue
        items.append(
            {
                "slug": slug,
                "city": _grab(block, "city"),
                "region": _grab(block, "region"),
                "badge": _grab(block, "badge"),
                "headline": _grab(block, "headline"),
                "description": _grab(block, "description"),
                "highlights": _grab_array(block, "highlights"),
                "services": _grab_array(block, "services"),
                "seo_title": _grab(block, "seoTitle"),
                "seo_description": _grab(block, "seoDescription"),
            }
        )
    return items


@lru_cache(maxsize=1)
def get_default_location_items() -> List[Dict[str, Any]]:
    return parse_location_items_from_ts()
