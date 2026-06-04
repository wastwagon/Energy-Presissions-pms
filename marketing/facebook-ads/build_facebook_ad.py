#!/usr/bin/env python3
"""
Facebook ad creatives — Energy Precisions.

Full-bleed portfolio photo + Essential package highlights (not full brochure).
Put extended specs and terms in the Facebook post caption below the image.

Default hero: portfolio/WhatsApp Image 2026-04-4 at 5.04.52 (4).jpeg
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

DIR = Path(__file__).resolve().parent
REPO = DIR.parent.parent
PACKAGES_JSON = DIR.parent / "hybrid-lithium-packages" / "packages.json"
LOGO = REPO / "frontend/public/website_images/Logo1-1-scaled-e1752479241874.png"

PORTFOLIO_ROOTS = (
    REPO / "portfolio",
    REPO / "frontend/public/portfolio",
)
HERO_WHATSAPP = "WhatsApp Image 2026-04-4 at 5.04.52 (4).jpeg"
FEATURED_TIER_ID = "ep-6.5kva"

GREEN = (0, 230, 118)
GREEN_DIM = (0, 180, 90)
NAVY = (10, 14, 23)
CARD_BG = (14, 22, 36, 210)
WHITE = (255, 255, 255)
RED = (229, 57, 53)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = (
        ["/System/Library/Fonts/SFNSText-Bold.otf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"]
        if bold
        else ["/System/Library/Fonts/SFNSText.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"]
    )
    for p in names:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def fmt_ghs(amount: int) -> str:
    return f"GHS {amount:,}"


def load_featured() -> dict[str, Any]:
    packages = json.loads(PACKAGES_JSON.read_text(encoding="utf-8"))["packages"]
    return next(p for p in packages if p["id"] == FEATURED_TIER_ID)


def tier_price(pkg: dict[str, Any], promo_percent: float | None) -> tuple[int, int | None]:
    list_p = int(pkg["price_ghs"])
    if promo_percent is None:
        return list_p, None
    promo = int(math.floor(list_p * (1 - promo_percent / 100.0)))
    return promo, list_p


def essential_bullets(pkg: dict[str, Any], max_items: int) -> list[str]:
    """Short lines for the ad — not the full BOM."""
    return [
        f"{pkg['inverter_kw']:.1f} kW hybrid inverter · {int(pkg['battery_kwh'])} kWh lithium",
        f"{pkg['panel_count']} × 570W solar panels · roof mounting",
        "Protection, changeover, cables & commissioning",
        "Planned load ~{} W · turnkey install".format(pkg.get("max_watts", "")),
    ][:max_items]


def resolve_hero() -> Path:
    for root in PORTFOLIO_ROOTS:
        p = root / HERO_WHATSAPP
        if p.is_file():
            return p
    for root in PORTFOLIO_ROOTS:
        for p in sorted(root.glob("*.jpeg")) + sorted(root.glob("*.jpg")):
            if p.is_file():
                return p
    raise FileNotFoundError(f"Hero not found: {HERO_WHATSAPP} in {PORTFOLIO_ROOTS}")


def cover_crop(path: Path, tw: int, th: int) -> Image.Image:
    img = Image.open(path).convert("RGB")
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.08)
    img = ImageEnhance.Sharpness(img).enhance(1.1)
    scale = max(tw / img.width, th / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = max(0, (nh - th) // 2)
    return img.crop((left, top, left + tw, top + th))


def paste_logo(canvas: Image.Image, x: int, y: int, width: int = 150) -> None:
    if not LOGO.exists():
        return
    logo = Image.open(LOGO).convert("RGBA")
    lh = int(logo.height * (width / logo.width))
    logo = logo.resize((width, lh), Image.Resampling.LANCZOS)
    pad = 10
    pill = Image.new("RGBA", (width + 2 * pad, lh + 2 * pad), (255, 255, 255, 252))
    pill_draw = ImageDraw.Draw(pill)
    pill_draw.rounded_rectangle([0, 0, width + 2 * pad - 1, lh + 2 * pad - 1], radius=12, fill=(255, 255, 255, 252))
    canvas.paste(pill, (x - pad, y - pad), pill)
    canvas.paste(logo, (x, y), logo)


def draw_bottom_scrim(canvas: Image.Image, *, height_ratio: float) -> None:
    w, h = canvas.size
    scrim_h = int(h * height_ratio)
    top = h - scrim_h
    grad = Image.new("RGBA", (w, scrim_h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for y in range(scrim_h):
        t = y / scrim_h
        a = int(255 * (t**1.25))
        gd.line([(0, y), (w, y)], fill=(10, 14, 23, a))
    region = canvas.crop((0, top, w, h)).convert("RGBA")
    canvas.paste(Image.alpha_composite(region, grad).convert("RGB"), (0, top))


def draw_right_scrim(canvas: Image.Image, *, width_ratio: float = 0.48) -> None:
    w, h = canvas.size
    panel_w = int(w * width_ratio)
    left = w - panel_w
    grad = Image.new("RGBA", (panel_w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for x in range(panel_w):
        t = x / panel_w
        a = int(255 * (t**1.1))
        gd.line([(x, 0), (x, h)], fill=(10, 14, 23, a))
    region = canvas.crop((left, 0, w, h)).convert("RGBA")
    canvas.paste(Image.alpha_composite(region, grad).convert("RGB"), (left, 0))


def draw_top_scrim(canvas: Image.Image, *, height: int = 100) -> None:
    w, _ = canvas.size
    grad = Image.new("RGBA", (w, height), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for y in range(height):
        t = 1 - y / height
        a = int(200 * (t**1.2))
        gd.line([(0, y), (w, y)], fill=(10, 14, 23, a))
    region = canvas.crop((0, 0, w, height)).convert("RGBA")
    canvas.paste(Image.alpha_composite(region, grad).convert("RGB"), (0, 0))


def draw_green_accent(canvas: Image.Image) -> None:
    w, h = canvas.size
    ImageDraw.Draw(canvas).rectangle([0, h - 5, w, h], fill=GREEN)


def _content_top(h: int, layout: str) -> int:
    """Anchor copy block toward the bottom of the frame (smaller ratio = lower on image)."""
    ratios = {"portrait": 0.44, "square": 0.46, "landscape": 0.72}
    return h - int(h * ratios[layout])


def _draw_promo_badge(draw: ImageDraw.ImageDraw, w: int, y: int, *, small: bool) -> None:
    bw = 160 if small else 188
    bh = 46 if small else 52
    fs = 24 if small else 28
    draw.rounded_rectangle([w - bw - 28, y, w - 28, y + bh], radius=8, fill=RED)
    draw.text((w - bw + 4, y + (9 if small else 10)), "20% OFF", font=font(fs, True), fill=WHITE)


def _draw_info_card(
    canvas: Image.Image,
    draw: ImageDraw.ImageDraw,
    *,
    x: int,
    y: int,
    w: int,
    pkg: dict[str, Any],
    promo_percent: float | None,
    bullets: list[str],
    price_size: int,
    bullet_size: int,
    cta_size: int,
    show_cta: bool,
) -> int:
    """Frosted card with bullets, price, CTA. Returns bottom y."""
    price, list_p = tier_price(pkg, promo_percent)
    line_h = bullet_size + 12
    was_row = int(bullet_size * 1.5) if list_p else 0
    save_row = int(bullet_size * 1.5) if list_p else 0
    cta_h = cta_size + 36
    card_h = 20 + len(bullets) * line_h + 14 + was_row + price_size + 10 + save_row
    if show_cta:
        card_h += cta_h
    card_h += 16

    card = Image.new("RGBA", (w, card_h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle([0, 0, w - 1, card_h - 1], radius=12, fill=CARD_BG, outline=GREEN_DIM, width=1)
    cd.rectangle([0, 0, 4, card_h], fill=GREEN)
    canvas.paste(card, (x, y), card)

    cx = x + 18
    cy = y + 18
    for line in bullets:
        draw.text((cx, cy), f"✓  {line}", font=font(bullet_size), fill=WHITE)
        cy += line_h

    cy += 6
    if list_p is not None:
        draw.text((cx, cy), f"Was {fmt_ghs(list_p)}", font=font(bullet_size, True), fill=WHITE)
        cy += was_row
    draw.text((cx, cy), fmt_ghs(price), font=font(price_size, True), fill=GREEN)
    cy += price_size + 8
    if list_p is not None:
        draw.text((cx, cy), f"Save {fmt_ghs(list_p - price)}", font=font(bullet_size, True), fill=WHITE)
        cy += save_row

    if show_cta:
        cta = "Claim 20% off — free survey" if promo_percent else "Book your free site survey"
        draw.rounded_rectangle([x + 12, cy, x + w - 12, cy + cta_h], radius=8, fill=GREEN)
        tw = draw.textlength(cta, font=font(cta_size, True))
        draw.text((x + (w - tw) / 2, cy + (cta_h - cta_size) // 2 - 2), cta, font=font(cta_size, True), fill=NAVY)

    return y + card_h


def draw_overlay(
    canvas: Image.Image,
    *,
    promo_percent: float | None,
    layout: str,
) -> None:
    w, h = canvas.size
    draw = ImageDraw.Draw(canvas)
    pkg = load_featured()
    is_promo = promo_percent is not None
    badge = str(pkg.get("badge", "Essential"))
    kva = str(pkg.get("kva_label", ""))

    if layout == "portrait":
        paste_logo(canvas, 32, 24, 168)
        if is_promo:
            _draw_promo_badge(draw, w, 28, small=False)

        margin = 36
        card_w = w - 2 * margin
        y = _content_top(h, "portrait")

        draw.rounded_rectangle([margin, y, margin + 360, y + 46], radius=6, fill=GREEN)
        draw.text((margin + 14, y + 9), "BLACKOUTS & DUMSOR?", font=font(24, True), fill=NAVY)
        y += 56
        draw.text((margin, y), "Keep your power on.", font=font(64, True), fill=WHITE)
        y += 70
        draw.text((margin, y), f"{badge} · {kva} · {int(pkg['battery_kwh'])} kWh lithium", font=font(30, True), fill=WHITE)
        y += 42

        y = _draw_info_card(
            canvas,
            draw,
            x=margin,
            y=y,
            w=card_w,
            pkg=pkg,
            promo_percent=promo_percent,
            bullets=essential_bullets(pkg, 4),
            price_size=54,
            bullet_size=22,
            cta_size=26,
            show_cta=True,
        ) + 12
        draw.text((margin, h - 38), "(+233) 533 611 611  ·  energyprecisions.com", font=font(22, True), fill=WHITE)

    elif layout == "square":
        paste_logo(canvas, 26, 20, 148)
        if is_promo:
            _draw_promo_badge(draw, w, 24, small=True)

        margin = 32
        card_w = w - 2 * margin
        y = _content_top(h, "square")

        draw.rounded_rectangle([margin, y, margin + 320, y + 42], radius=6, fill=GREEN)
        draw.text((margin + 12, y + 8), "BLACKOUTS & DUMSOR?", font=font(22, True), fill=NAVY)
        y += 50
        draw.text((margin, y), "Keep your power on.", font=font(54, True), fill=WHITE)
        y += 62
        draw.text((margin, y), f"{badge} · {kva}", font=font(26, True), fill=WHITE)
        y += 36

        y = _draw_info_card(
            canvas,
            draw,
            x=margin,
            y=y,
            w=card_w,
            pkg=pkg,
            promo_percent=promo_percent,
            bullets=essential_bullets(pkg, 3),
            price_size=48,
            bullet_size=20,
            cta_size=24,
            show_cta=True,
        ) + 8
        draw.text((margin, h - 34), "533 611 611 · energyprecisions.com", font=font(20, True), fill=WHITE)

    else:  # landscape
        paste_logo(canvas, 22, 16, 136)
        if is_promo:
            _draw_promo_badge(draw, w, 20, small=True)

        panel_x = int(w * 0.46)
        margin = panel_x + 18
        content_w = w - margin - 18
        y = _content_top(h, "landscape")

        draw.rounded_rectangle([margin, y, margin + 290, y + 38], radius=5, fill=GREEN)
        draw.text((margin + 10, y + 7), "BLACKOUTS & DUMSOR?", font=font(20, True), fill=NAVY)
        y += 46
        draw.text((margin, y), "Keep your power on.", font=font(44, True), fill=WHITE)
        y += 50
        draw.text((margin, y), f"{badge} · {kva}", font=font(24, True), fill=WHITE)
        y += 34

        _draw_info_card(
            canvas,
            draw,
            x=margin,
            y=y,
            w=content_w,
            pkg=pkg,
            promo_percent=promo_percent,
            bullets=essential_bullets(pkg, 3),
            price_size=42,
            bullet_size=18,
            cta_size=22,
            show_cta=True,
        )
        draw.text((margin, h - 34), "533 611 611 · energyprecisions.com", font=font(20, True), fill=WHITE)


def output_name(*, promo_percent: float | None, width: int, height: int) -> Path:
    suffix = "_20pct_Promo" if promo_percent is not None else "_Power_Outage"
    return DIR / f"Energy_Precisions_Facebook_Ad_Minimal{suffix}_{width}x{height}.png"


def build_canvas(
    *,
    width: int,
    height: int,
    promo_percent: float | None,
    layout: str,
) -> Path:
    out = output_name(promo_percent=promo_percent, width=width, height=height)
    canvas = cover_crop(resolve_hero(), width, height)
    draw_top_scrim(canvas)
    if layout == "landscape":
        draw_right_scrim(canvas, width_ratio=0.52)
        draw_bottom_scrim(canvas, height_ratio=0.55)
    else:
        draw_bottom_scrim(canvas, height_ratio=0.72 if layout == "portrait" else 0.70)
    draw_overlay(canvas, promo_percent=promo_percent, layout=layout)
    draw_green_accent(canvas)
    canvas.save(out, "PNG", optimize=True)
    return out


def build_feed(*, promo_percent: float | None, width: int = 1080, height: int = 1350) -> Path:
    layout = "square" if width == height else "portrait"
    return build_canvas(width=width, height=height, promo_percent=promo_percent, layout=layout)


def build_landscape(*, promo_percent: float | None) -> Path:
    return build_canvas(width=1200, height=628, promo_percent=promo_percent, layout="landscape")


def main() -> None:
    parser = argparse.ArgumentParser(description="Facebook ad images — Essential tier, balanced content.")
    parser.add_argument("--promo", type=float, default=None, help="Promo discount %% (e.g. 20)")
    parser.add_argument("--all", action="store_true", help="Build list + 20%% promo variants")
    args = parser.parse_args()

    hero = resolve_hero()
    promos = [None, 20.0] if args.all else [args.promo]
    for p in promos:
        print(build_feed(promo_percent=p, width=1080, height=1350))
        print(build_feed(promo_percent=p, width=1080, height=1080))
        print(build_landscape(promo_percent=p))
    print(f"Hero: {hero.name}")


if __name__ == "__main__":
    main()
