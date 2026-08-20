#!/usr/bin/env python3
"""ShopFlow seed - Step 1: 프로젝트 생성 (멱등, i18n)."""

import sys
from _lib import get, post, save_state, load_state, LOCALE
from i18n import PROJECT

meta = PROJECT[LOCALE]

cached = load_state("project")
if cached and cached.get("projectId"):
    # 캐시한 ID 가 아직 있는지 확인한다. state 파일은 DB 를 비워도 남으므로,
    # 확인 없이 재사용하면 뒤 단계가 전부 "Invalid project ID" 로 죽는다.
    pid = cached["projectId"]
    status, _ = get(f"/api/projects/{pid}")
    if status == 200:
        print(f"[{LOCALE}] reuse projectId={pid}")
        sys.exit(0)
    print(f"[{LOCALE}] 캐시한 projectId={pid} 가 없다(HTTP {status}). 다시 찾는다.")

# code 중복 회피: 기존 목록 검색
status, resp = get("/api/projects?limit=200")
if status == 200:
    items = resp if isinstance(resp, list) else resp.get("content", [])
    found = next((p for p in items if p.get("code") == meta["code"]), None)
    if found:
        save_state("project", {"projectId": found["id"]})
        print(f"[{LOCALE}] found existing projectId={found['id']}")
        sys.exit(0)

status, resp = post(
    "/api/projects",
    {
        "name": meta["name"],
        "code": meta["code"],
        "description": meta["description"],
    },
)
if status in (200, 201):
    save_state("project", {"projectId": resp["id"]})
    print(
        f"[{LOCALE}] created projectId={resp['id']}  ({meta['name']} / {meta['code']})"
    )
else:
    print(f"FAIL {status}: {resp}")
    sys.exit(1)
