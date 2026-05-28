#!/usr/bin/env python3
"""ShopFlow seed - Step 4: 12개 테스트플랜 생성 (멱등, i18n)."""

from __future__ import annotations
import random
import sys
from _lib import post, load_state, save_state, LOCALE
from i18n import PLANS

random.seed(42)  # 결정성


def pick_cases(cases: dict, prefixes: list[str] | None, count: int) -> list[str]:
    pool = list(cases.items())
    if prefixes:
        pool = [(k, v) for k, v in pool if any(k.startswith(p) for p in prefixes)]
    if not pool:
        pool = list(cases.items())
    if len(pool) <= count:
        return [v["id"] for _, v in pool]
    return [v["id"] for _, v in random.sample(pool, count)]


def main():
    pid = load_state("project")["projectId"]
    cases = load_state("cases")
    if not cases:
        print(f"FAIL [{LOCALE}]: state/cases.json 없음", file=sys.stderr)
        sys.exit(1)

    existing = load_state("plans") or {}
    created = 0
    for i, (name, desc, prefixes, count) in enumerate(PLANS[LOCALE], 1):
        if name in existing:
            print(f"  [{LOCALE}] {i:02d}/12 = {name} (reuse)")
            continue
        ids = pick_cases(cases, prefixes, count)
        body = {"name": name, "description": desc, "projectId": pid, "testCaseIds": ids}
        status, resp = post("/api/test-plans", body)
        if status in (200, 201):
            existing[name] = {
                "id": resp["id"],
                "testCaseIds": ids,
                "caseCount": len(ids),
            }
            created += 1
            print(
                f"  [{LOCALE}] {i:02d}/12 + {name} -> {resp['id'][:8]} (cases={len(ids)})"
            )
        else:
            print(f"  [{LOCALE}] {i:02d}/12 ✗ {name}: HTTP {status} {str(resp)[:200]}")
            sys.exit(1)

    save_state("plans", existing)
    print(f"\n[{LOCALE}] DONE: total={len(existing)} created={created}")


if __name__ == "__main__":
    main()
