from pathlib import Path
import os


def get_static_root() -> Path:
    """Filesystem root for static uploads/serving.

    Priority:
    1) STATIC_ROOT (explicit override)
    2) Render persistent disk mount (/path/static)
    3) local relative "static"
    """
    explicit = os.getenv("STATIC_ROOT", "").strip()
    if explicit:
        return Path(explicit)

    render_disk = os.getenv("RENDER_DISK_MOUNT_PATH", "").strip()
    if render_disk:
        return Path(render_disk) / "static"

    return Path("static")

