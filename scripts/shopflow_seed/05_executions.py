#!/usr/bin/env python3
"""ShopFlow seed - Step 5: 12개 TestExecution 생성 (멱등, i18n)."""

from __future__ import annotations
import datetime
import sys
from _lib import post, load_state, save_state, LOCALE
from i18n import execution_name


def _today_iso(offset_days: int = 0) -> str:
    d = datetime.date.today() + datetime.timedelta(days=offset_days)
    return d.isoformat() + "T00:00:00"


def main():
    pid = load_state("project")["projectId"]
    plans = load_state("plans")
    if not plans:
        print(f"FAIL [{LOCALE}]: state/plans.json 없음", file=sys.stderr)
        sys.exit(1)

    existing = load_state("executions") or {}
    created = 0
    for i, (plan_name, plan_info) in enumerate(plans.items(), 1):
        exec_name = execution_name(i, plan_name)
        if exec_name in existing:
            print(f"  [{LOCALE}] {i:02d}/12 = {exec_name} (reuse)")
            continue
        body = {
            "name": exec_name,
            "testPlanId": plan_info["id"],
            "projectId": pid,
            "description": f"{plan_name}: first run.",
            "startDate": _today_iso(-3),
            "endDate": _today_iso(7),
            "tags": ["seed", "sample"],
        }
        status, resp = post("/api/test-executions", body)
        if status in (200, 201):
            existing[exec_name] = {
                "id": resp["id"],
                "planName": plan_name,
                "planId": plan_info["id"],
                "caseCount": plan_info["caseCount"],
                "testCaseIds": plan_info["testCaseIds"],
            }
            created += 1
            print(f"  [{LOCALE}] {i:02d}/12 + {exec_name} -> {resp['id'][:8]}")
        else:
            print(
                f"  [{LOCALE}] {i:02d}/12 ✗ {exec_name}: HTTP {status} {str(resp)[:200]}"
            )
            sys.exit(1)

    save_state("executions", existing)
    print(f"\n[{LOCALE}] DONE: total={len(existing)} created={created}")


if __name__ == "__main__":
    main()
