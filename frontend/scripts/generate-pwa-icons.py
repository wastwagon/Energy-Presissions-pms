#!/usr/bin/env python3
"""Generate square PWA icons with logo centered in Android maskable safe zone."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "website_images" / "Logo1-1-scaled-e1752479241874.png"
OUT_DIR = ROOT / "public" / "icons"
BG = (10, 14, 23, 255)  # #0a0e17 brand


def compose_icon(size: int, safe_ratio: float, out_name: str) -> None:
    safe = int(size * safe_ratio)
    logo = Image.open(SRC).convert("RGBA")
    lw, lh = logo.size
    scale = min(safe / lw, safe / lh)
    nw, nh = max(1, int(lw * scale)), max(1, int(lh * scale))
    logo = logo.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), BG)
    canvas.paste(logo, ((size - nw) // 2, (size - nh) // 2), logo)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUT_DIR / out_name, "PNG")
    print(f"wrote {OUT_DIR / out_name}")


if __name__ == "__main__":
    # Standard icons — logo uses ~80% width
    compose_icon(192, 0.8, "icon-192.png")
    compose_icon(512, 0.8, "icon-512.png")
    # Maskable — logo in central 66% safe circle per adaptive-icon guidelines
    compose_icon(192, 0.66, "icon-maskable-192.png")
    compose_icon(512, 0.66, "icon-maskable-512.png")
