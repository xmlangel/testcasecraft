#!/usr/bin/env python3
"""ShopFlow seed - 패치: 기존 TC들의 type='test' → 'testcase' 일괄 갱신 (i18n).

프론트엔드(useTestCaseTree.jsx)가 케이스 type=='testcase'만 카운트하기 때문에
초기 시드가 type='test'로 들어가면 트리 카운트가 0으로 보임. 한 번 실행하면 해소된다.
"""

from __future__ import annotations
import sys
from _lib import get, put, load_state, LOCALE


def main():
    cases = load_state("cases")
    if not cases:
        print(f"FAIL [{LOCALE}]: state/cases.json 없음", file=sys.stderr)
        sys.exit(1)

    fixed = skipped = failed = 0
    for i, (key, info) in enumerate(cases.items(), 1):
        cid = info["id"]
        status, current = get(f"/api/testcases/{cid}")
        if status != 200:
            print(f"  ✗ {key}: GET {status}")
            failed += 1
            continue
        if current.get("type") == "testcase":
            skipped += 1
            continue
        body = dict(current)
        body["type"] = "testcase"
        for k in (
            "createdAt",
            "updatedAt",
            "createdBy",
            "updatedBy",
            "sequentialId",
            "displayId",
            "displayNumber",
            "children",
            "project",
        ):
            body.pop(k, None)
        st2, resp = put(f"/api/testcases/{cid}", body)
        if st2 in (200, 201):
            fixed += 1
            if i % 20 == 0 or i == len(cases):
                print(
                    f"  [{LOCALE}] ... {i}/{len(cases)} fixed={fixed} skipped={skipped} failed={failed}"
                )
        else:
            failed += 1
            print(f"  ✗ {key}: PUT {st2} {str(resp)[:200]}")
    print(f"\n[{LOCALE}] DONE: fixed={fixed} skipped={skipped} failed={failed}")


if __name__ == "__main__":
    main()
