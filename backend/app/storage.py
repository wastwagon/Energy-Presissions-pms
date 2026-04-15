from pathlib import Path
import os


def get_static_root() -> Path:
    """Filesystem root for static uploads/serving."""
    raw = os.getenv("STATIC_ROOT", "static").strip() or "static"
    return Path(raw)

