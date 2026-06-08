#!/usr/bin/env python3
"""
Verify CMS defaults parity between backend (Python) and frontend (TypeScript).

Usage:
  python -m app.scripts.check_cms_parity
  python -m app.scripts.check_cms_parity --strict
  python -m app.scripts.check_cms_parity --sections --strict
  python -m app.scripts.export_cms_defaults  # dump Python defaults JSON
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.cms_defaults import CMS_PAGES, get_page_defaults

REPO_ROOT = Path(__file__).resolve().parents[3]
CMS_TS = REPO_ROOT / "frontend" / "src" / "types" / "cms.ts"
CMS_DEFAULTS_TS = REPO_ROOT / "frontend" / "src" / "data" / "cmsDefaults.ts"


def _parse_ts_slugs() -> set[str]:
    text = CMS_TS.read_text(encoding="utf-8")
    block = re.search(r"export type CmsPageSlug\s*=\s*(.+?);", text, re.DOTALL)
    if not block:
        raise RuntimeError("Could not parse CmsPageSlug from cms.ts")
    return set(re.findall(r"'([^']+)'", block.group(1)))


def _parse_ts_top_level_blocks() -> dict[str, str]:
    text = CMS_DEFAULTS_TS.read_text(encoding="utf-8")
    anchor = text.find("const DEFAULTS: PageDefaultsMap = {")
    if anchor < 0:
        return {}
    i = text.find("{", anchor) + 1
    blocks: dict[str, str] = {}
    slug_re = re.compile(r"\s*,?\s*(\w+):\s*\{")
    while i < len(text):
        tail = text[i:]
        if tail.lstrip().startswith("};"):
            break
        match = slug_re.match(tail)
        if not match:
            break
        slug = match.group(1)
        brace_at = i + tail.index("{")
        depth = 0
        j = brace_at
        while j < len(text):
            ch = text[j]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    blocks[slug] = text[brace_at + 1 : j]
                    i = j + 1
                    break
            j += 1
        else:
            break
    return blocks


def _parse_ts_section_keys(slug: str) -> set[str]:
    block = _parse_ts_top_level_blocks().get(slug, "")
    if not block:
        return set()
    return set(re.findall(r"^    (\w+):", block, re.MULTILINE))


def check_slugs(strict: bool) -> int:
    py_slugs = set(CMS_PAGES)
    ts_slugs = _parse_ts_slugs()
    only_py = sorted(py_slugs - ts_slugs)
    only_ts = sorted(ts_slugs - py_slugs)
    if not only_py and not only_ts:
        print(f"✅ CMS slugs in sync ({len(py_slugs)} pages)")
        return 0
    print("CMS slug mismatch:")
    if only_py:
        print(f"  Python only: {only_py}")
    if only_ts:
        print(f"  TypeScript only: {only_ts}")
    return 1 if strict else 0


def check_sections(strict: bool) -> int:
    mismatches: list[str] = []
    for slug in CMS_PAGES:
        py_keys = set(get_page_defaults(slug).keys())
        ts_keys = _parse_ts_section_keys(slug)
        if not ts_keys:
            mismatches.append(f"  {slug}: missing TS defaults block")
            continue
        only_py = sorted(py_keys - ts_keys)
        only_ts = sorted(ts_keys - py_keys)
        if only_py or only_ts:
            mismatches.append(
                f"  {slug}: py-only={only_py or '-'} ts-only={only_ts or '-'}"
            )
    if not mismatches:
        print(f"✅ CMS section keys in sync ({len(CMS_PAGES)} pages)")
        return 0
    print("CMS section key mismatches:")
    print("\n".join(mismatches))
    return 1 if strict else 0


def export_defaults(path: Path) -> None:
    payload = {slug: get_page_defaults(slug) for slug in CMS_PAGES}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"✅ Exported Python CMS defaults to {path}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Check CMS defaults parity (Python vs TypeScript)")
    parser.add_argument("--strict", action="store_true", help="Exit 1 when checks fail")
    parser.add_argument("--sections", action="store_true", help="Also compare top-level section keys per page")
    parser.add_argument(
        "--export",
        metavar="PATH",
        help="Write Python CMS defaults JSON snapshot to PATH and exit",
    )
    args = parser.parse_args()

    if args.export:
        export_defaults(Path(args.export))
        return 0

    code = check_slugs(args.strict)
    if args.sections:
        code = max(code, check_sections(args.strict))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
