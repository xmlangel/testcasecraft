#!/usr/bin/env python3
"""ShopFlow seed - Step 2b: 프로젝트에 멤버 추가 (멱등, i18n).

결과를 남기는 네 계정(admin/manager/tester/developer)과 역할 확인용 세 계정
(pm/lead/viewer)을 ShopFlow 프로젝트의 멤버로 등록한다. 뒤 셋은 프로젝트 역할이
VIEWER·LEAD_DEVELOPER·PROJECT_MANAGER 로 갈려 있어, 역할별로 무엇이 막히는지
로컬에서 바로 확인할 수 있다.
admin 은 프로젝트 생성자이므로 자동 PROJECT_MANAGER.
백엔드는 결과 입력 시 JWT 의 인증된 사용자로 executedBy 를 강제 설정하므로,
각 사용자가 프로젝트 멤버여야 결과 입력 권한이 있다.

엔드포인트: POST /api/projects/{projectId}/members?username=&role=
"""

from __future__ import annotations
import sys
import urllib.parse
from _lib import request, get, load_state, LOCALE
from i18n import ROLE_COVERAGE_USERS, USERS, USER_PROJECT_ROLES

MEMBERS = USERS + ROLE_COVERAGE_USERS


def main():
    pid = load_state("project")["projectId"]

    # 현재 멤버 조회
    status, members = get(f"/api/projects/{pid}/members?limit=200")
    existing = set()
    if status == 200:
        items = (
            members if isinstance(members, list) else members.get("content", []) or []
        )
        for m in items:
            u = m.get("user") or {}
            if u.get("username"):
                existing.add(u["username"])
    print(f"[{LOCALE}] 기존 멤버: {sorted(existing)}")

    added = reused = failed = 0
    for u in MEMBERS:
        if u in existing:
            print(f"  [{LOCALE}] = {u}  (이미 멤버)")
            reused += 1
            continue
        role = USER_PROJECT_ROLES[u]
        qs = urllib.parse.urlencode({"username": u, "role": role})
        st, resp = request("POST", f"/api/projects/{pid}/members?{qs}", None)
        if st in (200, 201):
            added += 1
            print(f"  [{LOCALE}] + {u}  role={role}")
        else:
            failed += 1
            print(f"  [{LOCALE}] ✗ {u}: HTTP {st} {str(resp)[:200]}")

    print(f"\n[{LOCALE}] DONE: added={added} reuse={reused} failed={failed}")


if __name__ == "__main__":
    main()
