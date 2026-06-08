"""Bundled portfolio gallery defaults — shared by CMS defaults and seed scripts."""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

REPO_ROOT = Path(__file__).resolve().parents[2]
PORTFOLIO_TS = REPO_ROOT / "frontend" / "src" / "data" / "portfolioPageItems.ts"


def _grab(block: str, key: str, default: str = "") -> str:
    m = re.search(rf"{key}:\s*'([^']*)'|{key}:\s*\"([^\"]*)\"", block)
    if not m:
        m = re.search(rf"{key}:\s*(\d+)", block)
        return m.group(1) if m else default
    return m.group(1) or m.group(2) or default


def parse_portfolio_items_from_ts(path: Path = PORTFOLIO_TS) -> List[Dict[str, Any]]:
    if not path.is_file():
        return []
    text = path.read_text(encoding="utf-8")
    items: List[Dict[str, Any]] = []
    for block in re.split(r"\n  \{", text)[1:]:
        item_id = _grab(block, "id")
        if not item_id.isdigit():
            continue
        media = _grab(block, "mediaType") or "image"
        entry: Dict[str, Any] = {
            "id": int(item_id),
            "title": _grab(block, "title"),
            "category": _grab(block, "category"),
            "description": _grab(block, "description"),
            "image": _grab(block, "image"),
            "location": _grab(block, "location") or "Ghana",
            "media_type": "video" if media == "video" else "image",
            "published": True,
        }
        for opt_key, ts_key in (
            ("system_size", "systemSize"),
            ("project_type", "projectType"),
            ("savings_note", "savingsNote"),
        ):
            val = _grab(block, ts_key)
            if val:
                entry[opt_key] = val
        items.append(entry)
    return items


@lru_cache(maxsize=1)
def get_default_portfolio_items() -> List[Dict[str, Any]]:
    return parse_portfolio_items_from_ts()
