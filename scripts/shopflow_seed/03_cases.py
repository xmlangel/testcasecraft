#!/usr/bin/env python3
"""ShopFlow seed - Step 3: 108개 테스트케이스 생성 (멱등, i18n).

각 폴더당 9개씩. 메타데이터(name/priority/isAutomated/시나리오 1줄)는
data/{locale}/cases_part{1..4}.json 에 정의되어 있고, 본 스크립트는 그것을 받아
실제 같은 풀필드 DTO(steps·preCondition·expectedResults·tags)로 변환한다.
"""

from __future__ import annotations
import sys
from typing import Any
from _lib import post, load_state, save_state, load_data, LOCALE
from i18n import CASE_STRINGS

PARTS = ["cases_part1", "cases_part2", "cases_part3", "cases_part4"]

FOLDER_TAGS = {
    "F01": ["auth", "security"],
    "F02": ["profile", "pii"],
    "F03": ["catalog"],
    "F04": ["search"],
    "F05": ["cart"],
    "F06": ["payment", "pg"],
    "F07": ["order"],
    "F08": ["shipping"],
    "F09": ["review", "ugc"],
    "F10": ["coupon", "promotion"],
    "F11": ["notification"],
    "F12": ["admin", "backoffice"],
}


def _folder_code(folder_name: str) -> str:
    return folder_name.split()[0]  # 'F01'


def _build_steps(name: str, scenario: str, s: dict) -> list[dict[str, Any]]:
    return [
        {
            "stepNumber": 1,
            "description": s["step1_desc"],
            "expectedResult": s["step1_exp"],
        },
        {
            "stepNumber": 2,
            "description": s["step2_desc"].format(name=name),
            "expectedResult": s["step2_exp"],
        },
        {
            "stepNumber": 3,
            "description": s["step3_desc"],
            "expectedResult": s["step3_exp"],
        },
        {"stepNumber": 4, "description": s["step4_desc"], "expectedResult": scenario},
    ]


def build_dto(folder_id: str, folder_name: str, raw: list, pid: str) -> dict:
    name, priority, is_auto, scenario = raw
    code = _folder_code(folder_name)
    s = CASE_STRINGS[LOCALE]
    tags = [code, *FOLDER_TAGS.get(code, [])]
    tags.append("automated" if is_auto else "manual")
    return {
        "projectId": pid,
        "parentId": folder_id,
        "name": name,
        "type": "testcase",  # 프론트엔드(useTestCaseTree)가 "testcase"만 카운트
        "priority": priority,
        "isAutomated": bool(is_auto),
        "executionType": "Automated" if is_auto else "Manual",
        "testTechnique": s["testTechnique"],
        "preCondition": s["preCondition"],
        "description": s["desc_template"].format(
            code=code, name=name, scenario=scenario
        ),
        "expectedResults": scenario,
        "postCondition": s["postCondition"],
        "tags": tags,
        "steps": _build_steps(name, scenario, s),
    }


def main():
    pid = load_state("project")["projectId"]
    folders = load_state("folders")
    if not folders:
        print(
            f"FAIL [{LOCALE}]: state/folders.json 없음 - 02_folders.py 먼저 실행",
            file=sys.stderr,
        )
        sys.exit(1)

    existing = load_state("cases") or {}
    created = reused = failed = 0

    for part in PARTS:
        cases_by_folder = load_data(part)
        for folder_name, items in cases_by_folder.items():
            folder_id = folders.get(folder_name)
            if not folder_id:
                print(f"SKIP folder not found: {folder_name}")
                continue
            for raw in items:
                name = raw[0]
                key = f"{folder_name} :: {name}"
                if key in existing:
                    reused += 1
                    continue
                dto = build_dto(folder_id, folder_name, raw, pid)
                status, resp = post("/api/testcases", dto)
                if status in (200, 201):
                    existing[key] = {
                        "id": resp["id"],
                        "folder": folder_name,
                        "priority": dto["priority"],
                        "isAutomated": dto["isAutomated"],
                    }
                    created += 1
                else:
                    failed += 1
                    print(f"  ✗ {key}: HTTP {status} {str(resp)[:200]}")
            save_state("cases", existing)
            done = created + reused
            print(
                f"  [{LOCALE}] ... {folder_name}: created={created} reuse={reused} done={done}/108"
            )

    save_state("cases", existing)
    auto = sum(1 for v in existing.values() if v["isAutomated"])
    print(
        f"\n[{LOCALE}] DONE: total={len(existing)} created={created} reuse={reused} failed={failed} automated={auto}"
    )


if __name__ == "__main__":
    main()
