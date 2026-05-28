#!/usr/bin/env python3
"""ShopFlow seed - 05c: NOTSTARTED 실행의 결과를 0건으로 리셋 (i18n).

DELETE 후 동일 이름으로 재생성 → start 호출 없어 NOTSTARTED 유지.
"""

from __future__ import annotations
import datetime
import sys
from _lib import post, request, load_state, save_state, LOCALE


def _today_iso(offset_days: int = 0) -> str:
    return (
        datetime.date.today() + datetime.timedelta(days=offset_days)
    ).isoformat() + "T00:00:00"


def main():
    pid = load_state("project")["projectId"]
    executions = load_state("executions")
    results = load_state("results") or []
    if not executions:
        print(f"FAIL [{LOCALE}]: state/executions.json 없음", file=sys.stderr)
        sys.exit(1)

    targets = [
        (n, info)
        for n, info in executions.items()
        if info.get("status") == "NOTSTARTED"
    ]
    if not targets:
        print(f"[{LOCALE}] NOTSTARTED 실행 없음 - 종료")
        return

    print(f"[{LOCALE}] 대상 NOTSTARTED 실행: {len(targets)}개")
    for name, _ in targets:
        print(f"  - {name}")

    removed_ids = set()
    for name, info in targets:
        exec_id = info["id"]
        st, _ = request("DELETE", f"/api/test-executions/{exec_id}")
        if st in (200, 204):
            print(f"  ✓ DELETE {name} (cascade results)")
        else:
            print(f"  ✗ DELETE {name}: HTTP {st}")
            continue
        removed_ids.add(exec_id)

        body = {
            "name": name,
            "testPlanId": info["planId"],
            "projectId": pid,
            "description": f"{info['planName']}: scheduled / not started.",
            "startDate": _today_iso(2),
            "endDate": _today_iso(9),
            "tags": ["seed", "sample", "scheduled"],
        }
        st, resp = post("/api/test-executions", body)
        if st in (200, 201):
            executions[name] = {
                "id": resp["id"],
                "planName": info["planName"],
                "planId": info["planId"],
                "caseCount": info["caseCount"],
                "testCaseIds": info["testCaseIds"],
                "status": "NOTSTARTED",
            }
            print(f"  ✓ CREATE {name} -> {resp['id'][:8]} (NOTSTARTED, 0 result)")
        else:
            print(f"  ✗ CREATE {name}: HTTP {st} {resp}")
            sys.exit(1)

    before = len(results)
    results = [r for r in results if r.get("executionId") not in removed_ids]
    print(
        f"\n[{LOCALE}] results state: {before} → {len(results)} (cleaned {before - len(results)})"
    )

    save_state("executions", executions)
    save_state("results", results)
    print(f"[{LOCALE}] DONE")


if __name__ == "__main__":
    main()
