#!/usr/bin/env python3
"""ShopFlow seed - Step 0b: 시드 사용자 생성 (멱등).

i18n.USERS / USER_PASSWORDS 의 사용자(admin 제외)를 백엔드에 등록한다.
이미 존재(409) 시 skip. 로케일과 무관하므로 어느 쪽에서 한 번 돌리면 충분하지만,
seed.sh 의 매 로케일 흐름에서 멱등 호출해도 안전하다.

엔드포인트: POST /api/auth/register
"""

from __future__ import annotations
import json
import sys
import urllib.error
import urllib.request
from _lib import BASE_URL, login_as, LOCALE
from i18n import USERS, USER_PASSWORDS

ROLES = {
    "manager": "MANAGER",
    "tester": "TESTER",
    "developer": "USER",
}


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


def main():
    created = exists = failed = 0
    for u in USERS:
        if u == "admin":
            continue
        pw = USER_PASSWORDS[u]
        if can_login(u, pw):
            print(f"  [{LOCALE}] = {u}  (이미 존재, 로그인 OK)")
            exists += 1
            continue
        role = ROLES.get(u, "TESTER")
        st, resp = register(u, pw, role, u.capitalize() + " User", f"{u}@shopflow.test")
        if st == 200:
            print(f"  [{LOCALE}] + {u}  role={role}")
            created += 1
        elif st == 409:
            # 이미 존재하지만 비밀번호 불일치 - 어떻게 처리할지 사용자에게 알림
            print(
                f"  [{LOCALE}] ! {u}  존재하나 로그인 실패 (비밀번호 불일치) - 백엔드에서 직접 수정 필요"
            )
            failed += 1
        else:
            print(f"  [{LOCALE}] ✗ {u}: HTTP {st} {resp}")
            failed += 1

    print(f"\n[{LOCALE}] DONE: created={created} reuse={exists} failed={failed}")
    if failed:
        sys.exit(1 if failed == len(USERS) - 1 else 0)


if __name__ == "__main__":
    main()
