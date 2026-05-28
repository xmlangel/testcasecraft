#!/usr/bin/env python3
"""ShopFlow seed - Step 8: 자동화 테스트 결과(JUnit XML) 3종 업로드 (멱등, i18n)."""

from __future__ import annotations
import sys
from pathlib import Path
from _lib import upload_multipart, get, load_state, save_state, DATA, LOCALE
from i18n import JUNIT_UPLOADS


def main():
    pid = load_state("project")["projectId"]
    state = load_state("junit_uploads") or {}
    junit_dir = DATA / "junit"

    new = skipped = failed = 0
    for i, (fname, exec_name, desc) in enumerate(JUNIT_UPLOADS[LOCALE], 1):
        if fname in state:
            print(
                f"  [{LOCALE}] {i}/3 = {fname} (reuse testResultId={state[fname][:8]})"
            )
            skipped += 1
            continue
        fpath = junit_dir / fname
        if not fpath.exists():
            print(f"  [{LOCALE}] {i}/3 ✗ {fname}: 파일 없음 ({fpath})")
            failed += 1
            continue

        status, resp = upload_multipart(
            "/api/junit-results/upload",
            str(fpath),
            file_field="file",
            form_fields={
                "projectId": pid,
                "executionName": exec_name,
                "description": desc,
            },
        )
        if status == 200 and isinstance(resp, dict) and resp.get("success"):
            trid = resp.get("testResultId")
            state[fname] = trid
            new += 1
            print(f"  [{LOCALE}] {i}/3 + {exec_name}")
            print(
                f"        testResultId={trid[:8]}  total={resp.get('totalTests')} "
                f"fail={resp.get('failures')} skip={resp.get('skipped')} "
                f"success={resp.get('successRate')}%"
            )
        else:
            failed += 1
            print(f"  [{LOCALE}] {i}/3 ✗ {fname}: HTTP {status} {str(resp)[:300]}")

    save_state("junit_uploads", state)
    status, list_resp = get(f"/api/junit-results/projects/{pid}")
    if status == 200:
        items = (
            list_resp
            if isinstance(list_resp, list)
            else list_resp.get("content", []) or []
        )
        print(
            f"\n[{LOCALE}] 백엔드 확인: projects/{pid[:8]} 자동화 결과 {len(items)}개"
        )
    print(f"[{LOCALE}] DONE: new={new} reuse={skipped} failed={failed}")


if __name__ == "__main__":
    main()
