#!/usr/bin/env python3
"""
Generate Energy Precisions hybrid lithium package brochure (PDF).

Standalone marketing asset — not connected to PMS database.
Edit packages.json for pricing, specs, and office contacts.

Usage:
  python marketing/hybrid-lithium-packages/generate_brochure.py
  python marketing/hybrid-lithium-packages/generate_brochure.py --output ~/Downloads

Requires: pip install jinja2 weasyprint
Or run inside Docker backend container (weasyprint already installed).
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

from jinja2 import Environment
from weasyprint import HTML

DIR = Path(__file__).resolve().parent
CONFIG_PATH = DIR / "packages.json"
TEMPLATE_PATH = DIR / "brochure_template.html"
DEFAULT_OUTPUT = DIR / "output" / "Energy_Precisions_Hybrid_Lithium_Packages.pdf"


def load_config(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def render_html(config: dict) -> str:
    env = Environment(autoescape=True)
    template = env.from_string(TEMPLATE_PATH.read_text(encoding="utf-8"))
    return template.render(
        **config,
        generated_date=datetime.now().strftime("%d %B %Y"),
    )


def generate_pdf(html: str, output_path: Path) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    HTML(string=html, base_url=str(DIR)).write_pdf(str(output_path))
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
    args = parser.parse_args()

    config = load_config(args.config)
    html = render_html(config)

    if args.output is None:
        out = DEFAULT_OUTPUT
    elif args.output.suffix.lower() == ".pdf":
        out = args.output
    else:
        out = args.output / DEFAULT_OUTPUT.name

    path = generate_pdf(html, out)
    print(f"Generated: {path}")
    print(f"Packages: {len(config.get('packages', []))} tiers")
    print("Edit packages.json to update pricing and contact details.")


if __name__ == "__main__":
    main()
