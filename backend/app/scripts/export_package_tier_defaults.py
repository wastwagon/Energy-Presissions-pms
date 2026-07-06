#!/usr/bin/env python3
"""Regenerate frontend/src/data/cmsPackageTiers.json from hybridPackages.ts via npx tsx."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
FRONTEND = REPO_ROOT / "frontend"
OUT = FRONTEND / "src" / "data" / "cmsPackageTiers.json"

SCRIPT = """
import { writeFileSync } from 'fs';
import { DEFAULT_CMS_PACKAGE_TIERS } from './src/utils/packageTiers.ts';
writeFileSync('./src/data/cmsPackageTiers.json', JSON.stringify(DEFAULT_CMS_PACKAGE_TIERS, null, 2) + '\\n');
"""


def main() -> None:
    result = subprocess.run(
        ["npx", "--yes", "tsx", "-e", SCRIPT],
        cwd=str(FRONTEND),
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr or result.stdout, file=sys.stderr)
        raise SystemExit(result.returncode)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
