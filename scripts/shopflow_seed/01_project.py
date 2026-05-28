#!/usr/bin/env python3
"""ShopFlow seed - Step 1: 프로젝트 생성 (멱등, i18n)."""

import sys
from _lib import get, post, save_state, load_state, LOCALE
from i18n import PROJECT

meta = PROJECT[LOCALE]

cached = load_state("project")
if cached and cached.get("projectId"):
    print(f"[{LOCALE}] reuse projectId={cached['projectId']}")
    sys.exit(0)

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
