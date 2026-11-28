#!/usr/bin/env python3
"""
SETU Python Quantitative & Diagnostic Engine
--------------------------------------------
Pure Python 3 stdlib engine used for:
1) Civil/Interior BOQ structural material estimation & wastage math
2) Static security, privacy, and code-hygiene auditing for SETU-HERO Admin AI
Supports JSON stdin or CLI `--mode boq_audit|code_audit` invocation.
"""

import json
import math
import os
import re
import sys
from pathlib import Path


def run_boq_audit(payload: dict) -> dict:
    project_type = str(payload.get("projectType") or "custom").lower()
    area_sqft = max(20.0, float(payload.get("areaSqFt") or 120.0))
    tier = str(payload.get("tier") or "standard").lower()

    quantities = {}
    notes = []

    if project_type in ("house", "mason", "boundary"):
        cement_bags = math.ceil(area_sqft * 0.42)
        sand_cft = math.ceil(area_sqft * 1.35)
        aggregate_cft = math.ceil(area_sqft * 1.15)
        steel_kg = math.ceil(area_sqft * 3.85)
        bricks = math.ceil(area_sqft * 18)
        quantities = {
            "cement_bags_50kg": cement_bags,
            "river_sand_cft": sand_cft,
            "aggregate_20mm_cft": aggregate_cft,
            "tmt_steel_fe550_kg": steel_kg,
            "red_bricks_pcs": bricks,
        }
        notes.append("IS-456 thumb rule: ~0.42 bag cement & ~3.85 kg TMT steel per sq.ft built-up area.")
    elif project_type in ("kitchen", "wardrobe", "bed", "tv_unit_living", "door_window"):
        sheet_area = 32.0
        wastage_factor = 1.10
        ply_sheets = max(2, math.ceil((area_sqft * wastage_factor) / sheet_area))
        laminate_sheets = ply_sheets
        fevicol_kg = max(2, math.ceil(ply_sheets * 0.8))
        quantities = {
            "plywood_8x4_sheets": ply_sheets,
            "laminate_1mm_sheets": laminate_sheets,
            "adhesive_marine_kg": fevicol_kg,
            "cutting_wastage_pct": 10,
        }
        notes.append("8x4 sheet nesting (32 sq.ft/sheet) computed with 10% carpenter cutting allowance.")
    elif project_type == "tiles_flooring":
        box_coverage = 16.0
        boxes = max(2, math.ceil((area_sqft * 1.08) / box_coverage))
        adhesive_bags = max(2, math.ceil(area_sqft / 32.0))
        quantities = {
            "tile_boxes_16sqft": boxes,
            "tile_adhesive_20kg_bags": adhesive_bags,
            "skirting_wastage_pct": 8,
        }
        notes.append("Tile box count includes 8% diagonal cutting & skirting allowance.")
    elif project_type == "painting":
        paintable_sqft = area_sqft * 2.6
        putty_kg = math.ceil(paintable_sqft / 14.0)
        primer_liters = math.ceil(paintable_sqft / 120.0)
        emulsion_liters = math.ceil((paintable_sqft * 2) / 110.0)
        quantities = {
            "wall_putty_kg": putty_kg,
            "primer_liters": primer_liters,
            "emulsion_2coats_liters": emulsion_liters,
        }
        notes.append("Includes 2 coats putty, 1 coat primer, and 2 finish emulsion coats.")
    else:
        quantities = {
            "estimated_units": max(1, math.ceil(area_sqft / 25.0)),
            "safety_buffer_pct": 8,
        }
        notes.append("General craft estimation with 8% site material buffer.")

    if tier == "luxury":
        notes.append("Luxury grade factors extended hardware & moisture-resistant spec.")

    return {
        "ok": True,
        "runtime": f"Python {sys.version.split()[0]}",
        "projectType": project_type,
        "areaSqFt": area_sqft,
        "quantities": quantities,
        "engineeringNotes": notes,
    }


def run_code_audit(root_dir: str) -> dict:
    root = Path(root_dir)
    issues = []
    stats = {
        "srcFiles": 0,
        "backendFiles": 0,
        "windowAlertsFound": 0,
        "nativeAlertCallsFound": 0,
        "unprotectedAdminRoutes": 0,
        "pythonRuntime": f"Python {sys.version.split()[0]}",
    }

    src_dir = root / "src"
    if src_dir.exists():
        for fp in src_dir.rglob("*.ts*"):
            stats["srcFiles"] += 1
            try:
                content = fp.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            rel = str(fp.relative_to(root)).replace("\\", "/")
            if "window.alert(" in content or "window.confirm(" in content:
                stats["windowAlertsFound"] += 1
                issues.append(f"Browser native popup call in {rel}")
            if rel != "src/utils/appAlert.ts" and "Alert.alert(" in content:
                stats["nativeAlertCallsFound"] += 1
                issues.append(f"Legacy Alert.alert() in {rel}")

    backend_dir = root / "backend"
    if backend_dir.exists():
        for fp in backend_dir.rglob("*.js"):
            stats["backendFiles"] += 1
        server_js = backend_dir / "server.js"
        if server_js.exists():
            txt = server_js.read_text(encoding="utf-8", errors="ignore")
            for idx, line in enumerate(txt.splitlines(), 1):
                if re.search(r"app\.(get|post|put|patch|delete)\(\s*['\"]/api/admin/", line):
                    if "/api/admin/login" not in line and "/api/admin/verify-passcode" not in line:
                        if "requireAuth" not in line or "requireRole" not in line:
                            stats["unprotectedAdminRoutes"] += 1
                            issues.append(f"Admin route missing RBAC guard at backend/server.js:{idx}")

    penalty = (
        stats["windowAlertsFound"] * 10
        + stats["nativeAlertCallsFound"] * 5
        + stats["unprotectedAdminRoutes"] * 25
    )
    score = max(40, 100 - penalty)

    return {
        "ok": True,
        "securityScore": score,
        "stats": stats,
        "issues": issues,
        "summary": (
            "All inspected routes & UI alerts passed static hygiene checks."
            if not issues
            else f"Detected {len(issues)} item(s) needing attention."
        ),
    }


def main():
    mode = "code_audit"
    use_stdin = False
    payload = {}
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == "--mode" and i + 1 < len(args):
            mode = args[i + 1]
        elif a == "--stdin":
            use_stdin = True

    if use_stdin:
        try:
            raw = sys.stdin.read().strip()
            if raw:
                payload = json.loads(raw)
        except Exception:
            payload = {}

    root_dir = payload.get("rootDir") or os.getcwd()
    if mode == "boq_audit":
        result = run_boq_audit(payload)
    else:
        result = run_code_audit(root_dir)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
