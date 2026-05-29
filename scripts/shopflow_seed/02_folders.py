#!/usr/bin/env python3
"""ShopFlow seed - Step 2: 12개 모듈 폴더 생성 (멱등, i18n)."""

import sys
from _lib import post, get, load_state, save_state, LOCALE
from i18n import FOLDERS


def verify(fid: str) -> bool:
    c, _ = get(f"/api/testcases/{fid}")
    return c == 200


pid = load_state("project")["projectId"]
folders = FOLDERS[LOCALE]
existing = load_state("folders") or {}
verified = {n: i for n, i in existing.items() if verify(i)}
created = 0
for i, (name, desc) in enumerate(folders, 1):
    if name in verified:
        print(f"  [{LOCALE}] {i:02d}/12 = {name}  (reuse)")
        continue
    body = {
        "projectId": pid,
        "name": name,
        "description": desc,
        "type": "folder",
        "priority": "MEDIUM",
    }
    status, resp = post("/api/testcases", body)
    if status in (200, 201):
        verified[name] = resp["id"]
        created += 1
        print(f"  [{LOCALE}] {i:02d}/12 + {name} -> {resp['id'][:8]}")
    else:
        print(f"  [{LOCALE}] {i:02d}/12 ✗ {name}: HTTP {status} {resp}")
        sys.exit(1)

save_state("folders", verified)
print(f"\n[{LOCALE}] DONE: total={len(verified)} created={created}")
