#!/usr/bin/env python3
"""ShopFlow seed - Step 0b: 시드 사용자 생성 (멱등).

i18n.USERS + ROLE_COVERAGE_USERS 의 사용자(admin 제외)를 백엔드에 등록한다.
이미 존재(409) 시 skip. 로케일과 무관하므로 어느 쪽에서 한 번 돌리면 충분하지만,
seed.sh 의 매 로케일 흐름에서 멱등 호출해도 안전하다.

계정이 이미 있는데 비밀번호가 다르면 관리자 권한으로 비밀번호를 문서값으로 되맞춘다.
예전에는 "백엔드에서 직접 수정 필요" 로 끝나 그 계정으로는 아무것도 못 했다. 로컬
샘플셋은 문서에 적힌 비밀번호로 항상 들어갈 수 있어야 쓸모가 있다.

엔드포인트: POST /api/auth/register · PUT /api/admin/users/{id}/password
"""

from __future__ import annotations
import json
import sys
import urllib.parse
import urllib.error
import urllib.request
from _lib import BASE_URL, get, login_as, put, LOCALE
from i18n import (
    ROLE_COVERAGE_SYSTEM_ROLE,
    ROLE_COVERAGE_USERS,
    USER_PASSWORDS,
    USER_PROJECT_ROLES,
    USERS,
)

ROLES = {
    "manager": "MANAGER",
    "tester": "TESTER",
    "developer": "USER",
}

# 등록·비밀번호 교정 대상. admin 은 이미 있는 계정이라 건너뛴다.
SEED_USERS = [u for u in USERS + ROLE_COVERAGE_USERS if u != "admin"]


def register(username: str, password: str, role: str, name: str, email: str):
    body = json.dumps(
        {
            "username": username,
            "password": password,
            "role": role,
            "name": name,
            "email": email,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        BASE_URL + "/api/auth/register",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {"raw": e.read().decode("utf-8", "replace")}


def can_login(u, p) -> bool:
    try:
        login_as(u, p)
        return True
    except Exception:
        return False


def find_user_id(username: str):
    """관리자 사용자 목록에서 username 의 ID 를 찾는다. 못 찾으면 None."""
    st, body = get(f"/api/admin/users?keyword={urllib.parse.quote(username)}&size=50")
    if st != 200:
        return None
    items = body if isinstance(body, list) else (body.get("content") or [])
    for item in items:
        if item.get("username") == username:
            return item.get("id")
    return None


def reset_password(username: str, password: str) -> bool:
    """관리자 권한으로 비밀번호를 문서값으로 맞춘다.

    현재 비밀번호를 모르는 상태에서 고치는 것이라 currentPassword 를 보내지 않는다.
    관리자 경로는 그 값을 선택 항목으로 받는다.
    """
    uid = find_user_id(username)
    if not uid:
        return False
    st, _ = put(f"/api/admin/users/{uid}/password", {"newPassword": password})
    return st == 200


def main():
    created = exists = repaired = failed = 0
    for u in SEED_USERS:
        pw = USER_PASSWORDS[u]
        if can_login(u, pw):
            print(f"  [{LOCALE}] = {u}  (이미 존재, 로그인 OK)")
            exists += 1
            continue
        role = ROLES.get(u, ROLE_COVERAGE_SYSTEM_ROLE)
        st, resp = register(u, pw, role, u.capitalize() + " User", f"{u}@shopflow.test")
        if st == 200:
            print(f"  [{LOCALE}] + {u}  system={role} project={USER_PROJECT_ROLES[u]}")
            created += 1
        elif st == 409:
            # 계정은 있는데 비밀번호가 다르다. 관리자 권한으로 문서값으로 되맞춘다.
            if reset_password(u, pw) and can_login(u, pw):
                print(f"  [{LOCALE}] ~ {u}  비밀번호를 문서값으로 되맞춤")
                repaired += 1
            else:
                print(f"  [{LOCALE}] ✗ {u}  존재하나 비밀번호 교정 실패")
                failed += 1
        else:
            print(f"  [{LOCALE}] ✗ {u}: HTTP {st} {resp}")
            failed += 1

    print(
        f"\n[{LOCALE}] DONE: created={created} reuse={exists} "
        f"repaired={repaired} failed={failed}"
    )
    if failed:
        sys.exit(1 if failed == len(SEED_USERS) else 0)


if __name__ == "__main__":
    main()
