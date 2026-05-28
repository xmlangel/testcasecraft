#!/usr/bin/env python3
"""ShopFlow seed - Step 6: 결과 입력 (i18n + 사용자별 토큰).

분포:
  - 전체:  PASS 70% / FAIL 15% / BLOCKED 5% / NOT_RUN 10%
  - 자동화(isAutomated=True): PASS ≥ 30 / FAIL ≥ 10 보장
  - executedBy: 각 결과를 해당 사용자 토큰으로 POST → 백엔드가 인증 사용자로 기록.

백엔드 동작: TestResultService.setExecutedBy(currentUser) — 사용자가 보낸 executedBy 값은
무시하고 JWT 의 인증 사용자로 강제 설정한다. 따라서 사용자별 토큰을 발급받아 사용한다.
"""

from __future__ import annotations
import datetime
import random
import sys
from _lib import login_as, post_as, load_state, save_state, LOCALE
from i18n import NOTES, USERS, USER_PASSWORDS, EXECUTED_BY_WEIGHTS

random.seed(2026)

AUTO_DIST = ["PASS"] * 60 + ["FAIL"] * 25 + ["BLOCKED"] * 8 + ["NOT_RUN"] * 7
MANUAL_DIST = ["PASS"] * 70 + ["FAIL"] * 12 + ["BLOCKED"] * 5 + ["NOT_RUN"] * 13


def _note(result: str, case_name: str) -> str:
    date = datetime.date.today().isoformat()
    return NOTES[LOCALE][result].format(date=date, name=case_name)


def _pick_user(result: str) -> str:
    weights = EXECUTED_BY_WEIGHTS[result]
    return random.choices(
        [u for u, _ in weights], weights=[w for _, w in weights], k=1
    )[0]


def main():
    cases = load_state("cases")
    executions = load_state("executions")
    if not cases or not executions:
        print(
            f"FAIL [{LOCALE}]: state/cases.json or executions.json 없음",
            file=sys.stderr,
        )
        sys.exit(1)

    # 사용자별 토큰 발급
    tokens = {}
    print(f"[{LOCALE}] 사용자별 토큰 발급:")
    for u in USERS:
        try:
            tokens[u] = login_as(u, USER_PASSWORDS[u])
            print(f"  ✓ {u}")
        except Exception as e:
            print(f"  ✗ {u}: {e}  — 결과에서 제외")
    if not tokens:
        print(f"FAIL: 사용자 토큰 발급 0건", file=sys.stderr)
        sys.exit(1)

    active_users = list(tokens.keys())

    case_by_id = {
        v["id"]: {"name": k.split(" :: ", 1)[1], "isAutomated": v["isAutomated"]}
        for k, v in cases.items()
    }

    existing = load_state("results") or []
    seen = {(r["executionId"], r["testCaseId"]) for r in existing}
    counts = {"PASS": 0, "FAIL": 0, "BLOCKED": 0, "NOT_RUN": 0}
    auto_counts = {"PASS": 0, "FAIL": 0, "BLOCKED": 0, "NOT_RUN": 0}
    user_counts: dict[str, int] = {u: 0 for u in active_users}
    target_auto_pass, target_auto_fail = 30, 10
    total = 0
    new_results = []

    for exec_name, info in executions.items():
        if info.get("status") == "NOTSTARTED":
            continue
        exec_id = info["id"]
        for cid in info["testCaseIds"]:
            if (exec_id, cid) in seen:
                continue
            meta = case_by_id.get(cid)
            if not meta:
                continue
            dist = AUTO_DIST if meta["isAutomated"] else MANUAL_DIST
            result = random.choice(dist)
            if meta["isAutomated"]:
                if (
                    auto_counts["PASS"] < target_auto_pass
                    and result != "PASS"
                    and random.random() < 0.5
                ):
                    result = "PASS"
                elif (
                    auto_counts["FAIL"] < target_auto_fail
                    and result != "FAIL"
                    and random.random() < 0.35
                ):
                    result = "FAIL"
            # 사용자 선택 — 토큰 없는 사용자는 fallback
            user = _pick_user(result)
            if user not in tokens:
                user = random.choice(active_users)
            body = {
                "result": result,
                "testCaseId": cid,
                "notes": _note(result, meta["name"]),
                "executedBy": user,  # 백엔드가 무시하지만 의도 표기용
                "tags": ["seed"],
            }
            status, resp = post_as(
                tokens[user], f"/api/test-executions/{exec_id}/results", body
            )
            if status in (200, 201):
                counts[result] += 1
                user_counts[user] += 1
                if meta["isAutomated"]:
                    auto_counts[result] += 1
                total += 1
                new_results.append(
                    {
                        "id": resp.get("id"),
                        "executionId": exec_id,
                        "testCaseId": cid,
                        "result": result,
                        "isAutomated": meta["isAutomated"],
                        "executedBy": user,
                    }
                )
            else:
                print(
                    f"  ✗ exec={exec_id[:8]} case={cid[:8]} user={user}: HTTP {status} {str(resp)[:150]}"
                )
        print(f"  [{LOCALE}] done exec {exec_name[:38]}  partial total={total}")

    save_state("results", existing + new_results)
    print(f"\n[{LOCALE}] results created={total}")
    print(
        f"  전체   : PASS={counts['PASS']} FAIL={counts['FAIL']} BLOCKED={counts['BLOCKED']} NOT_RUN={counts['NOT_RUN']}"
    )
    print(
        f"  자동화 : PASS={auto_counts['PASS']} FAIL={auto_counts['FAIL']} "
        f"BLOCKED={auto_counts['BLOCKED']} NOT_RUN={auto_counts['NOT_RUN']}"
    )
    print(f"  담당자 : {', '.join(f'{u}={user_counts[u]}' for u in active_users)}")
    distinct = sum(1 for c in user_counts.values() if c > 0)
    print(f"  distinct executedBy = {distinct}  (≥3 요구)")
    assert auto_counts["PASS"] >= 30, f"AUTO PASS={auto_counts['PASS']} < 30"
    assert auto_counts["FAIL"] >= 10, f"AUTO FAIL={auto_counts['FAIL']} < 10"
    assert distinct >= 3, f"distinct executedBy={distinct} < 3"
    print("  ✓ 자동화 PASS≥30, FAIL≥10, distinct executedBy≥3 충족")


if __name__ == "__main__":
    main()
