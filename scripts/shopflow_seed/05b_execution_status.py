#!/usr/bin/env python3
"""ShopFlow seed - 05b: 실행 상태 분포 (i18n).

분포는 i18n.STATUS_PLAN_BY_PLAN_INDEX 로 정의되며, 실행 이름의 'E{NN}' 인덱스로 매칭된다.
"""

from __future__ import annotations
import re
import sys
from _lib import post, get, load_state, save_state, LOCALE
from i18n import STATUS_PLAN_BY_PLAN_INDEX


def current_status(exec_id: str) -> str:
    status, resp = get(f"/api/test-executions/{exec_id}")
    return resp.get("status") if status == 200 else None


def transition(exec_id: str, target: str) -> str:
    cur = current_status(exec_id)
    if cur == target:
        return cur
    if target in ("INPROGRESS", "COMPLETED") and cur == "NOTSTARTED":
        st, _ = post(f"/api/test-executions/{exec_id}/start", None)
        if st not in (200, 201):
            return f"FAIL-start({st})"
        cur = "INPROGRESS"
    if target == "COMPLETED" and cur == "INPROGRESS":
        st, _ = post(f"/api/test-executions/{exec_id}/complete", None)
        if st not in (200, 201):
            return f"FAIL-complete({st})"
        cur = "COMPLETED"
    return cur


def main():
    executions = load_state("executions")
    if not executions:
        print(f"FAIL [{LOCALE}]: state/executions.json 없음", file=sys.stderr)
        sys.exit(1)

    summary = {"COMPLETED": 0, "INPROGRESS": 0, "NOTSTARTED": 0, "OTHER": 0}
    pat = re.compile(r"^E(\d+)\b")
    for i, (name, info) in enumerate(executions.items(), 1):
        m = pat.match(name)
        idx = int(m.group(1)) - 1 if m else (i - 1)
        target = (
            STATUS_PLAN_BY_PLAN_INDEX[idx]
            if 0 <= idx < len(STATUS_PLAN_BY_PLAN_INDEX)
            else "NOTSTARTED"
        )
        before = current_status(info["id"])
        after = transition(info["id"], target)
        bucket = after if after in summary else "OTHER"
        summary[bucket] += 1
        info["status"] = after
        ok = "✓" if after == target else "✗"
        print(
            f"  [{LOCALE}] {i:02d}/12 {ok} {name[:42]:42}  {before} → {after}  (target {target})"
        )

    save_state("executions", executions)
    print(
        f"\n[{LOCALE}] 분포: COMPLETED={summary['COMPLETED']}  INPROGRESS={summary['INPROGRESS']}  "
        f"NOTSTARTED={summary['NOTSTARTED']}  OTHER={summary['OTHER']}"
    )


if __name__ == "__main__":
    main()
