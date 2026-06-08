"""Bundled FAQ content — single canonical JSON on the frontend."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

REPO_ROOT = Path(__file__).resolve().parents[2]
CANONICAL_JSON = REPO_ROOT / "frontend" / "src" / "data" / "extracted_content.json"


@lru_cache(maxsize=1)
def get_default_faqs() -> List[Dict[str, str]]:
    if not CANONICAL_JSON.is_file():
        return []
    data = json.loads(CANONICAL_JSON.read_text(encoding="utf-8"))
    rows: List[Any] = data.get("faqs") or []
    out: List[Dict[str, str]] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        question = str(row.get("question") or "").strip()
        answer = str(row.get("answer") or "").strip()
        if question and answer:
            out.append({"question": question, "answer": answer})
    return out
