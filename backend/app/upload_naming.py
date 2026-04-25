"""Sanitized, human-readable upload filenames with collision-safe uniqueness."""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path
from typing import Optional


def safe_filename_stem(original_name: Optional[str], fallback: str = "upload") -> str:
    stem = Path(original_name or "").stem or fallback
    stem = unicodedata.normalize("NFKD", stem)
    stem = stem.encode("ascii", "ignore").decode("ascii")
    stem = re.sub(r"[^\w\-.]+", "_", stem, flags=re.ASCII)
    stem = stem.strip("._-") or fallback
    return stem[:120]


def unique_filename_in_dir(directory: Path, stem: str, ext: str) -> str:
    """Return a filename `stem.ext` or `stem_N.ext` that does not exist in directory."""
    ext = ext.lower() if ext.startswith(".") else f".{ext.lower()}"
    candidate = f"{stem}{ext}"
    n = 1
    while (directory / candidate).exists():
        candidate = f"{stem}_{n}{ext}"
        n += 1
    return candidate
