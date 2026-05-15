#!/usr/bin/env python3
"""
Generate Energy Precisions hybrid lithium package brochure (PDF).

Standalone marketing asset — not connected to PMS database.
Edit packages.json for pricing, specs, and office contacts.

The logo is embedded from frontend/public (base64 data URI) so it always prints.

Usage:
  python marketing/hybrid-lithium-packages/generate_brochure.py
  python marketing/hybrid-lithium-packages/generate_brochure.py --output ~/Downloads

Requires: pip install jinja2 weasyprint
Or run with Docker (WeasyPrint in backend image):

  docker run --rm -v "$PWD:/repo" -w /repo/marketing/hybrid-lithium-packages \\
    energyprecisionpms-backend python generate_brochure.py --repo-root /repo

Logo files are read from frontend/public (see generate_brochure.py).
If EP_REPO_ROOT is set, or --repo-root is passed, the logo embeds reliably when
only copying the marketing folder into a container.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
from datetime import datetime
from pathlib import Path

from jinja2 import Environment
from weasyprint import HTML

DIR = Path(__file__).resolve().parent
CONFIG_PATH = DIR / "packages.json"
TEMPLATE_PATH = DIR / "brochure_template.html"
DEFAULT_OUTPUT = DIR / "output" / "Energy_Precisions_Hybrid_Lithium_Packages.pdf"


def resolve_repo_root(cli_root: Path | None) -> Path:
    """
    marketing/hybrid-lithium-packages -> repo root (contains frontend/public).
    When the script is copied alone (e.g. /tmp/marketing/...), walk up or use EP_REPO_ROOT.
    """
    if cli_root is not None:
        return cli_root.resolve()
    env = os.environ.get("EP_REPO_ROOT", "").strip()
    if env:
        return Path(env).resolve()
    p = DIR.resolve()
    for _ in range(8):
        pub = p / "frontend" / "public"
        if pub.is_dir():
            return p
        if p.parent == p:
            break
        p = p.parent
    return DIR.parent.parent.resolve()


def _logo_candidates(repo_root: Path) -> list[Path]:
    pub = repo_root / "frontend" / "public"
    return [
        pub / "website_images" / "Logo1-1-scaled-e1752479241874.png",
        pub / "website_images" / "Logo1-scaled-e1752463900247.png",
        pub / "logo.jpg",
        pub / "website_images" / "Logo-scaled-e1753471959467.jpg",
    ]


def load_logo_data_uri(repo_root: Path) -> str | None:
    for path in _logo_candidates(repo_root):
        if path.is_file():
            raw = path.read_bytes()
            ext = path.suffix.lower().lstrip(".") or "png"
            if ext == "jpg":
                ext = "jpeg"
            mime = f"image/{ext}" if ext in ("jpeg", "png", "webp", "gif") else "image/png"
            b64 = base64.standard_b64encode(raw).decode("ascii")
            return f"data:{mime};base64,{b64}"
    return None


def load_config(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def render_html(config: dict, logo_data_uri: str | None) -> str:
    env = Environment(autoescape=True)
    template = env.from_string(TEMPLATE_PATH.read_text(encoding="utf-8"))
    # Public folder as base resolves any relative asset paths in template
    return template.render(
        logo_data_uri=logo_data_uri,
        **config,
        generated_date=datetime.now().strftime("%d %B %Y"),
    )


def generate_pdf(html: str, output_path: Path, repo_root: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pub = repo_root / "frontend" / "public"
    base = str(pub) if pub.is_dir() else str(DIR)
    HTML(string=html, base_url=base).write_pdf(str(output_path))
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate EP hybrid package brochure PDF")
    parser.add_argument(
        "--config",
        type=Path,
        default=CONFIG_PATH,
        help="Path to packages.json",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output PDF path or directory",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=None,
        help="Repo root containing frontend/public (default: auto-detect; or set EP_REPO_ROOT)",
    )

    args = parser.parse_args()

    repo_root = resolve_repo_root(args.repo_root)
    config = load_config(args.config)
    logo_uri = load_logo_data_uri(repo_root)
    html = render_html(config, logo_uri)

    if args.output is None:
        out = DEFAULT_OUTPUT
    elif args.output.suffix.lower() == ".pdf":
        out = args.output
    else:
        out = args.output / DEFAULT_OUTPUT.name

    path = generate_pdf(html, out, repo_root)
    print(f"Generated: {path}")
    print(f"Packages: {len(config.get('packages', []))} tiers")
    print(f"Logo embedded: {'yes' if logo_uri else 'no (add logo under frontend/public/website_images/)'}")
    print("Edit packages.json to update pricing and contact details.")


if __name__ == "__main__":
    main()
