#!/usr/bin/env python3
"""사용자 매뉴얼 캡처 자동화 — Playwright Python.

docs/manual/new/USER_MANUAL.md 가 참조하는 73장의 PNG를 재현/갱신한다.
한 번 로그인한 세션을 storage_state.json 에 저장해 모든 캡처 단계가
재사용한다.

사전 준비
---------
    pip install playwright
    playwright install chromium

    # 백엔드/프론트는 localhost:8080 로 떠 있어야 한다 (docker compose 등)

실행
-----
    python scripts/manual_capture.py                  # 전체 73장
    python scripts/manual_capture.py --only 01,02,03  # 특정 슬러그만
    python scripts/manual_capture.py --skip-login     # 기존 storage_state 재사용
    python scripts/manual_capture.py --headed         # 브라우저 띄워서 디버깅
    python scripts/manual_capture.py --audit          # 캡처 + 매뉴얼 커버리지 감사
    python scripts/manual_capture.py --audit-only     # 감사만 (캡처 스킵)

옵션
----
    --base-url    기본 http://localhost:8080
    --user        기본 admin
    --password    기본 admin123 (src/test/e2e/config/credentials.js 와 동일)
    --out-dir     기본 docs/manual/new/images
    --state       기본 .manual_capture_state.json
    --manual      기본 docs/manual/new/USER_MANUAL.md (감사 대상)
    --audit-depth 크롤 깊이 (기본 2)
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional
from urllib.parse import urlparse

from playwright.sync_api import (
    BrowserContext,
    Page,
    Playwright,
    TimeoutError as PWTimeout,
    sync_playwright,
)

REPO_ROOT = Path(__file__).resolve().parents[1]


# ---------------------------------------------------------------------------
# Login & storage_state
# ---------------------------------------------------------------------------


def do_login(page: Page, base_url: str, user: str, password: str) -> None:
    """admin/admin123 로 로그인하고 메인 페이지가 뜨는 것까지 대기."""
    page.goto(f"{base_url}/")
    # Login.jsx 의 data-testid 사용
    page.wait_for_selector('[data-testid="login-username-input"]', timeout=10_000)
    page.fill('[data-testid="login-username-input"]', user)
    page.fill('[data-testid="login-password-input"]', password)
    page.click('[data-testid="login-submit-button"]')
    # 로그인 후 /projects 또는 / 로 리다이렉트 — networkidle 은 SPA 폴링 때문에
    # 도달하지 않으므로 URL 변화만 확인
    page.wait_for_url(lambda url: "/login" not in url, timeout=15_000)
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(800)


# ---------------------------------------------------------------------------
# Step definitions
# ---------------------------------------------------------------------------


@dataclass
class Step:
    slug: str  # 파일명 prefix (확장자 제외)
    url: Optional[str] = None  # base_url 기준 상대 경로
    auth: bool = True  # False 면 로그아웃 상태에서 캡처
    full_page: bool = False  # _full 변종은 True
    prepare: Optional[Callable[[Page], None]] = None  # 캡처 직전 UI 조작
    wait_ms: int = 500  # 캡처 전 안정화 대기
    todo: bool = False  # True 면 자동 캡처 스킵 + 콘솔에 안내


def _wait_settled(page: Page, wait_ms: int) -> None:
    # networkidle 은 SPA(폴링·websocket)에서 도달하지 않는 경우가 많아 짧게 시도하고 포기
    try:
        page.wait_for_load_state("domcontentloaded", timeout=5_000)
    except PWTimeout:
        pass
    page.wait_for_timeout(wait_ms)


def _take(page: Page, out_path: Path, full_page: bool) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(out_path), full_page=full_page)


# 인터랙션 헬퍼 ---------------------------------------------------------------


def open_user_menu(page: Page) -> None:
    """헤더 우측 아바타 클릭 → 사용자 메뉴 열기."""
    # 헤더에 aria-label="user manual" 버튼이 추가되어 부분 매칭(*='user')은
    # 매뉴얼 버튼을 먼저 잡는다 — 정확 매칭만 사용
    page.locator("header [aria-label='user menu']").first.click()
    page.wait_for_selector('[data-testid="profile-menu-item"]', timeout=5_000)


def open_admin_menu(page: Page) -> None:
    """헤더 '관리 메뉴' 드롭다운 열기."""
    page.get_by_text("관리 메뉴", exact=False).first.click()
    page.wait_for_timeout(300)


def open_qa_summary_panel(page: Page) -> None:
    """테스트 결과 → 첫 실행 필터 적용 → 상세 테이블 탭 → QA 총평 패널."""
    m = re.search(r"/projects/([^/]+)/results", page.url)
    project_id = m.group(1)
    exec_id = page.evaluate(
        """async (pid) => {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`/api/test-executions?projectId=${pid}`,
                {headers: {Authorization: `Bearer ${token}`}});
            const list = await res.json();
            if (!list.length) return null;
            // QA 총평이 작성된 실행 우선 (매뉴얼 캡처에 내용이 보이도록)
            const withSummary = list.find((e) => e.qaSummary);
            return (withSummary || list[0]).id;
        }""",
        project_id,
    )
    page.goto(f"{page.url.split('?')[0]}?testExecutionId={exec_id}")
    page.wait_for_timeout(1_500)
    # 상세 테이블 보기 탭 — 프로젝트 헤더 탭들 뒤, 페이지의 마지막 tab.
    # 라벨은 언어에 따라 다르므로 role + 위치로 선택
    page.locator("button[role='tab']").last.click()
    page.wait_for_selector('[data-testid="qa-summary-edit-button"]', timeout=10_000)
    # 패널 본문이 뷰포트에 들어오도록 스크롤
    page.locator('[data-testid="qa-summary-edit-button"]').scroll_into_view_if_needed()
    page.mouse.wheel(0, 200)
    page.wait_for_timeout(800)


def open_prev_results_dialog(page: Page) -> None:
    """실행 목록 → 첫 실행 상세 → 첫 케이스의 '이전 결과' 다이얼로그 오픈."""
    page.locator('[data-testid^="execution-item-"]').first.click()
    page.wait_for_selector(
        '[data-testid^="execution-table-prev-results-button-"]', timeout=10_000
    )
    page.locator(
        '[data-testid^="execution-table-prev-results-button-"]'
    ).first.click()
    # 다이얼로그 + 이전 결과 테이블 로딩 대기
    page.wait_for_selector('[data-testid="prev-result-close-button"]', timeout=10_000)
    page.wait_for_timeout(800)


def tree_right_click(page: Page) -> None:
    """트리의 첫 폴더 노드에서 우클릭 → 컨텍스트 메뉴 노출.

    트리 패널 안의 첫 번째 폴더 행을 찾아 우클릭한다. ShopFlow 시드
    환경에서는 'F01 회원 인증' 같은 폴더가 존재한다.
    """
    node = page.get_by_text(re.compile(r"^F\d{2} ")).first
    node.wait_for(timeout=10_000)
    node.click(button="right")
    page.wait_for_timeout(600)


def open_execution_filter_panel(page: Page) -> None:
    """실행 목록의 첫 실행을 열고 '필터' 패널을 펼친다 (§8 필터 패널 캡처용).

    ShopFlow 시드 환경에는 실행 12건이 있으므로 첫 행을 클릭해 실행 상세로
    진입한 뒤, 상단의 '필터' 아코디언을 펼쳐 결과·우선순위·실행자 등
    필터 옵션이 보이게 한다.
    """
    row = page.locator('[data-testid^="execution-item-"]').first
    row.wait_for(timeout=10_000)
    row.click()
    page.wait_for_timeout(1500)
    # 1) 바깥 '필터' 아코디언은 기본 펼침(filters:true)이지만, localStorage 에
    #    접힘 상태가 저장돼 있을 수 있어 펼침을 보장한다 (이미 열려 있으면 건드리지 않음).
    summary = page.get_by_role(
        "button", name=re.compile(r"^\s*(필터|Filters?)\s*$", re.I)
    ).first
    summary.wait_for(timeout=10_000)
    if summary.get_attribute("aria-expanded") == "false":
        summary.click(timeout=5_000)
        page.wait_for_timeout(500)
    # 2) 안쪽 필터 패널의 토글(FilterListIcon 옆 chevron) 을 DOM 기준으로 클릭해 펼친다 — 2단 구조.
    page.evaluate(
        """() => {
          const icon = document.querySelector("svg[data-testid='FilterListIcon']");
          if (!icon) return false;
          const header = icon.closest('div')?.parentElement;
          const btn = header && header.querySelector('button');
          if (btn) { btn.click(); return true; }
          return false;
        }"""
    )
    # 결과·우선순위 등 필터 컨트롤이 보일 때까지 대기
    try:
        page.get_by_role(
            "button", name=re.compile(r"초기화|적용|Clear|Apply", re.I)
        ).first.wait_for(timeout=4_000)
    except PWTimeout:
        pass
    page.wait_for_timeout(700)


def _first_case_id(page: Page) -> tuple[str, str]:
    """현재 URL 의 프로젝트에서 첫 테스트 케이스 (projectId, caseId) 반환."""
    m = re.search(r"/projects/([0-9a-f-]{36})", page.url)
    if not m:
        raise RuntimeError(f"프로젝트 URL 이 아닙니다: {page.url}")
    pid = m.group(1)
    origin = re.match(r"https?://[^/]+", page.url).group(0)
    token = page.evaluate("() => localStorage.getItem('accessToken')")
    resp = page.context.request.get(
        f"{origin}/api/testcases/project/{pid}",
        headers={"Authorization": f"Bearer {token}"},
    )
    items = resp.json()
    if isinstance(items, dict):
        items = items.get("content") or items.get("data") or []
    case = next(x for x in items if (x.get("type") or "").upper() != "FOLDER")
    return pid, case["id"]


def open_case_in_form_mode(page: Page) -> None:
    """첫 케이스를 선택해 개별 폼 모드로 연다 (§4-5/§4-6 캡처용)."""
    pid, cid = _first_case_id(page)
    origin = re.match(r"https?://[^/]+", page.url).group(0)
    page.goto(f"{origin}/projects/{pid}/testcases/{cid}")
    _wait_settled(page, 1500)
    # 입력 모드가 스프레드시트로 저장되어 있으면 개별 폼으로 전환
    try:
        page.get_by_text("입력 모드", exact=False).first.click(timeout=3_000)
        page.wait_for_timeout(400)
        page.locator('[data-testid="mode-individual-button"]').first.click(
            timeout=3_000
        )
        page.wait_for_timeout(1_200)
    except PWTimeout:
        pass  # 이미 폼 모드


def open_field_visibility(page: Page) -> None:
    """폼 모드에서 '필드 표시' 팝오버 열기 (§4-5 캡처용)."""
    open_case_in_form_mode(page)
    page.locator('button:has([data-testid="ViewColumnIcon"])').first.click(
        timeout=5_000
    )
    page.wait_for_timeout(600)


def tree_select_first_folder(page: Page) -> None:
    """폴더 전용 트리의 첫 폴더 클릭 → 우측 폴더 케이스 목록 + 브레드크럼 (§4-1 캡처용).

    ShopFlow 시드 환경에서는 'F01 회원 인증' 같은 폴더가 존재한다.
    """
    node = page.get_by_text(re.compile(r"^F\d{2} ")).first
    node.wait_for(timeout=10_000)
    node.click()
    page.wait_for_timeout(1_200)


def tree_select_all_cases(page: Page) -> None:
    """트리 상단 '모든 테스트케이스' 가상 노드 클릭 → 폴더 컬럼 포함 전체 목록 (§4-4 캡처용)."""
    page.locator('[data-testid="virtual-node-all-cases"]').click(timeout=10_000)
    page.wait_for_timeout(1_200)


def open_folder_edit_form(page: Page) -> None:
    """폴더 케이스 목록 헤더의 연필 아이콘 클릭 → 폴더 정보 편집 폼 (§4-1 캡처용)."""
    tree_select_first_folder(page)
    page.locator('[data-testid="folder-edit-button"]').click(timeout=10_000)
    page.wait_for_timeout(1_200)


# ---------------------------------------------------------------------------
# 73개 캡처 스텝 — USER_MANUAL.md 참조 순서
# ---------------------------------------------------------------------------
#
# 구현 상태 표기:
#   ●  url 만 지정해도 동작 (즉시 사용 가능)
#   △  prepare 콜백 구현 — 셀렉터 변경 시 수정 필요
#   ✕  todo=True — 데이터 셋업 또는 복잡한 인터랙션 필요. 수동/반자동 캡처 권장
#
# project_id 가 필요한 페이지는 환경 변수 MANUAL_PROJECT_ID 로 주입한다.
#   PROJECT_ID = "9c1ae80f-..."  (env)
# 미지정 시 첫 번째 프로젝트의 ID 를 자동 사용한다 (resolve_project_id 참고).

PROJECT_ID_PLACEHOLDER = "{PROJECT_ID}"


def _project_path(suffix: str) -> str:
    return f"/projects/{PROJECT_ID_PLACEHOLDER}{suffix}"


STEPS: list[Step] = [
    # ── 1. 회원가입/로그인 ─────────────────────────────────────────────
    Step("01_login_empty", url="/", auth=False),  # ●
    Step(
        "02_signup_empty",
        url="/",
        auth=False,  # △
        prepare=lambda p: p.locator(
            '[data-testid="login-switch-to-register-button"]'
        ).click(),
    ),
    Step("03_signup_filled", url="/", auth=False, todo=True),  # ✕ (가입 폼 입력값 필요)
    Step("04_signup_complete", url="/", auth=False, todo=True),  # ✕ (가입 직후 화면)
    Step(
        "05_login_filled",
        url="/",
        auth=False,  # △
        prepare=lambda p: (
            p.fill('[data-testid="login-username-input"]', "admin"),
            p.fill('[data-testid="login-password-input"]', "admin123"),
        ),
    ),
    # ── 2. 로그인 직후 ─────────────────────────────────────────────
    Step("06_main_after_login", url="/projects"),  # ●
    Step("06_main_after_login_full", url="/projects", full_page=True),
    # ── 3. 프로젝트 만들기 ─────────────────────────────────────────────
    Step("10_projects_empty", url="/projects"),  # ●
    Step(
        "11_project_create_dialog", url="/projects", todo=True
    ),  # ✕ '새 프로젝트' 다이얼로그 오픈
    Step("12_project_create_filled", url="/projects", todo=True),  # ✕ 입력 후
    Step("13_project_created", url="/projects", todo=True),  # ✕ 생성 완료
    # ── 4. 헤더 / 메뉴 ─────────────────────────────────────────────
    Step("15_user_menu", url="/projects", prepare=open_user_menu),  # △
    Step("17_header_jira", url=_project_path(""), todo=True),  # ✕ JIRA 배지 클릭
    Step(
        "18_user_menu_logout", url="/projects", prepare=open_user_menu
    ),  # △ (동일 메뉴, 로그아웃 강조)
    # ── 5. 프로젝트 대시보드 ─────────────────────────────────────────────
    Step("20_project_overview", url=_project_path("")),  # ●
    Step("20_project_overview_full", url=_project_path(""), full_page=True),
    # ── 6. 테스트케이스 ─────────────────────────────────────────────
    Step("21_testcase_page", url=_project_path("/testcases")),  # ●
    Step("21_testcase_page_full", url=_project_path("/testcases"), full_page=True),
    Step("22_tree_add_menu", url=_project_path("/testcases"), todo=True),  # ✕ '+' 메뉴
    Step(
        "23_tree_right_click_menu",
        url=_project_path("/testcases"),  # △ 폴더 우클릭
        prepare=tree_right_click,
        wait_ms=800,
    ),
    Step(
        "24_tree_populated", url=_project_path("/testcases"), wait_ms=1500
    ),  # ● 폴더·케이스 트리
    Step("25_folder_created", url=_project_path("/testcases"), todo=True),
    Step("27_testcase_created", url=_project_path("/testcases"), todo=True),
    Step("28_two_folders", url=_project_path("/testcases"), todo=True),
    Step("32_tree_final", url=_project_path("/testcases"), todo=True),
    Step(
        "32_tree_final_full", url=_project_path("/testcases"), full_page=True, todo=True
    ),
    # ── 6b. 폴더 전용 트리 + 케이스 목록 (2026-06-06 feat/style-folder-tree) ──
    Step(
        "87_tree_folder_only", url=_project_path("/testcases"), wait_ms=1500
    ),  # ● 폴더 전용 트리 + 가상 노드 + 폴더 필터 + 탭 배지
    Step(
        "88_folder_case_list",
        url=_project_path("/testcases"),  # △ 폴더 클릭 → 우측 케이스 목록 + 브레드크럼
        prepare=tree_select_first_folder,
        wait_ms=800,
    ),
    Step(
        "89_all_cases_list",
        url=_project_path("/testcases"),  # △ '모든 테스트케이스' 가상 노드 (폴더 컬럼)
        prepare=tree_select_all_cases,
        wait_ms=800,
    ),
    Step(
        "90_folder_edit_form",
        url=_project_path("/testcases"),  # △ 연필 아이콘 → 폴더 정보 편집 폼
        prepare=open_folder_edit_form,
        wait_ms=800,
    ),
    # ── 7. 입력 모드 ─────────────────────────────────────────────
    Step("42_testcase_page_landing", url=_project_path("/testcases")),  # ●
    Step("43_full_layout", url=_project_path("/testcases"), full_page=True),
    Step(
        "44_input_mode_open", url=_project_path("/testcases"), todo=True
    ),  # ✕ '입력 모드' 펼치기
    Step(
        "44b_field_visibility",
        url=_project_path("/testcases"),  # △ 필드 표시 팝오버
        prepare=open_field_visibility,
        wait_ms=800,
    ),
    Step(
        "44c_form_metadata",
        url=_project_path("/testcases"),  # △ 폼 모드 메타데이터
        prepare=open_case_in_form_mode,
        wait_ms=1000,
    ),
    Step("45_jira_panel", url=_project_path("/testcases"), todo=True),
    # ── 8. 탭별 캡처 ─────────────────────────────────────────────
    Step("46_dashboard", url=_project_path("")),
    Step("50_dashboard_v2", url="/dashboard"),
    Step("50_dashboard_v2_full", url="/dashboard", full_page=True),
    Step("51_testplans", url=_project_path("/testplans")),
    Step("51_testplans_full", url=_project_path("/testplans"), full_page=True),
    Step("52_executions", url=_project_path("/executions")),
    Step("52_executions_full", url=_project_path("/executions"), full_page=True),
    Step(
        "52b_execution_filter_panel",
        url=_project_path("/executions"),
        prepare=open_execution_filter_panel,
        wait_ms=800,
    ),
    Step("53_results", url=_project_path("/results")),
    Step("53_results_full", url=_project_path("/results"), full_page=True),
    Step("54_junit", url=_project_path("/junit"), todo=True),  # 라우트 확인 필요
    Step("54_junit_full", url=_project_path("/junit"), full_page=True, todo=True),
    Step("54b_automation", url=_project_path("/automation")),
    Step("54b_automation_full", url=_project_path("/automation"), full_page=True),
    Step("55_rag", url=_project_path("/rag")),
    Step("55_rag_full", url=_project_path("/rag"), full_page=True),
    Step("56_exploratory", url=_project_path("/exploratory")),
    Step("56_exploratory_full", url=_project_path("/exploratory"), full_page=True),
    # ── 9. UI 변형 ─────────────────────────────────────────────
    Step("60_dark_mode", url="/dashboard", todo=True),  # ✕ 다크모드 토글 후
    Step(
        "63_project_selector", url="/projects", todo=True
    ),  # ✕ 프로젝트 선택 드롭다운 오픈
    Step("64_user_menu_v2", url="/projects", prepare=open_user_menu),
    Step(
        "66_tree_panel_crop", url=_project_path("/testcases"), todo=True
    ),  # ✕ 트리 패널만 crop
    # ── 10. 프로필 다이얼로그 (탭별) ─────────────────────────────────────────────
    Step("65_profile_page", url="/projects", todo=True),  # ✕ 프로필 다이얼로그 오픈
    Step("67_profile_password", url="/projects", todo=True),
    Step("68_profile_language", url="/projects", todo=True),
    Step("69_profile_jira", url="/projects", todo=True),
    Step("70_profile_gsheets", url="/projects", todo=True),
    Step("71_profile_apitoken", url="/projects", todo=True),
    Step("72_profile_theme", url="/projects", todo=True),
    # ── 11. 시스템 관리자 (ADMIN 전용) ─────────────────────────────────────────────
    Step("78_admin_menu_dropdown", url="/dashboard", prepare=open_admin_menu),  # △
    Step("79_admin_landing", url="/dashboard"),
    Step("80_global_dashboard", url="/dashboard"),
    Step("80_global_dashboard_full", url="/dashboard", full_page=True),
    Step("81_organizations", url="/organizations"),
    Step("81_organizations_full", url="/organizations", full_page=True),
    Step("82_users", url="/users"),
    Step("82_users_full", url="/users", full_page=True),
    Step("83_mail_settings", url="/mail-settings"),
    Step("83_mail_settings_full", url="/mail-settings", full_page=True),
    Step("84_llm_config", url="/llm-config"),
    Step("84_llm_config_full", url="/llm-config", full_page=True),
    Step("85_scheduler", url="/scheduler"),
    Step("85_scheduler_full", url="/scheduler", full_page=True),
    Step("86_translation", url="/translation-management"),
    Step("86_translation_full", url="/translation-management", full_page=True),
    # ── 19. 신규 화면 (2026-06-10) ─────────────────────────────────────
    Step("90_bookmarks", url=_project_path("/bookmarks")),
    Step("90_bookmarks_full", url=_project_path("/bookmarks"), full_page=True),
    Step(
        "91_prev_results_dialog",
        url=_project_path("/executions"),
        prepare=open_prev_results_dialog,
        wait_ms=800,
    ),
    Step(
        "92_qa_summary_panel",
        url=_project_path("/results"),
        prepare=open_qa_summary_panel,
        wait_ms=800,
    ),
]


# ---------------------------------------------------------------------------
# Project ID resolution
# ---------------------------------------------------------------------------


def resolve_project_id(page: Page, base_url: str, override: Optional[str]) -> str:
    """캡처에 사용할 프로젝트 ID 결정. CLI/env override → 자동탐지."""
    if override:
        return override
    # 백엔드는 JWT(localStorage.accessToken) 인증을 요구한다 — Bearer 헤더 첨부
    page.goto(f"{base_url}/projects")
    page.wait_for_load_state("domcontentloaded")
    token = page.evaluate("() => localStorage.getItem('accessToken')")
    if not token:
        raise RuntimeError(
            "accessToken 을 localStorage 에서 찾지 못했습니다. 로그인 실패 가능."
        )
    resp = page.context.request.get(
        f"{base_url}/api/projects",
        headers={"Authorization": f"Bearer {token}"},
    )
    if resp.ok:
        items = resp.json()
        if isinstance(items, dict):  # Page<T> 또는 wrapper 응답
            items = (
                items.get("content") or items.get("data") or items.get("projects") or []
            )
        if items:
            pid = items[0].get("id") or items[0].get("projectId")
            if pid:
                return pid
    raise RuntimeError(
        f"프로젝트 ID 를 결정할 수 없습니다 (status={resp.status}). "
        "--project-id <UUID> 옵션으로 지정하세요."
    )


# ---------------------------------------------------------------------------
# Manual coverage audit
# ---------------------------------------------------------------------------

# UUID 또는 숫자 ID 를 ":id" 로 일반화 — 매뉴얼/크롤 결과 정규화에 공통 사용
_UUID_RE = re.compile(
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I
)
_NUMID_RE = re.compile(r"/\d{2,}(?=/|$)")
# 매뉴얼 본문의 `/path/like-this` 또는 `{id}` 토큰 추출용
_MANUAL_PATH_RE = re.compile(r"`(/[A-Za-z0-9_\-/:{}]+?)`")


def normalize_path(path: str) -> str:
    """UUID·숫자 ID·{token} 을 ':id' 로 일반화."""
    if not path or not path.startswith("/"):
        return path
    p = path.split("?")[0].split("#")[0].rstrip("/") or "/"
    p = _UUID_RE.sub(":id", p)
    p = _NUMID_RE.sub("/:id", p)
    p = re.sub(r"/\{[^/}]+\}", "/:id", p)  # /{projectId} → /:id
    return p


def extract_manual_routes(manual_path: Path) -> set[str]:
    """USER_MANUAL.md 의 백틱 안 경로를 모두 추출해 normalize."""
    if not manual_path.exists():
        return set()
    text = manual_path.read_text(encoding="utf-8")
    routes: set[str] = set()
    for m in _MANUAL_PATH_RE.finditer(text):
        token = m.group(1)
        if not token.startswith("/"):
            continue
        routes.add(normalize_path(token))
    return routes


def crawl_routes(
    page: Page,
    base_url: str,
    seeds: list[str],
    project_id: str,
    max_per_seed: int = 30,
) -> set[str]:
    """seed 경로들을 방문하고 각 페이지의 <a href> + data-testid='tab-*' 를 수집해
    정규화된 pathname 집합을 반환."""
    found: set[str] = set()
    visited_seeds: set[str] = set()

    for raw in seeds:
        seed = raw.replace(PROJECT_ID_PLACEHOLDER, project_id)
        if seed in visited_seeds:
            continue
        visited_seeds.add(seed)
        try:
            page.goto(base_url + seed)
            _wait_settled(page, 400)
        except Exception:  # pylint: disable=broad-except
            continue
        found.add(normalize_path(seed))

        # 1) <a href> 수집
        try:
            hrefs = page.evaluate(
                "() => Array.from(document.querySelectorAll('a[href]'))"
                ".map(a => a.getAttribute('href')).filter(Boolean)"
            )
        except Exception:  # pylint: disable=broad-except
            hrefs = []
        # 2) tab-* / nav data-testid → 경로 힌트 (testid 만으로는 라우트 추정 불가하므로
        #    이미 seeds 에 포함된 것 기준으로만 카운트)
        for href in hrefs[:max_per_seed]:
            try:
                if href.startswith("http"):
                    parsed = urlparse(href)
                    if parsed.netloc and base_url not in href:
                        continue
                    href = parsed.path
                if not href.startswith("/"):
                    continue
                found.add(normalize_path(href))
            except Exception:  # pylint: disable=broad-except
                continue
    return found


def audit_coverage(crawled: set[str], manual: set[str]) -> None:
    """크롤된 경로 vs 매뉴얼이 언급한 경로 diff 리포트."""
    missing_in_manual = sorted(crawled - manual)
    only_in_manual = sorted(manual - crawled)
    both = sorted(crawled & manual)

    print("\n" + "=" * 70)
    print("📋 매뉴얼 커버리지 감사")
    print("=" * 70)
    print(f"앱에서 크롤된 경로: {len(crawled)}")
    print(f"매뉴얼이 언급한 경로: {len(manual)}")
    print(f"양쪽 모두 존재: {len(both)}")
    print()

    if missing_in_manual:
        print(f"⚠️  매뉴얼에 누락된 경로 ({len(missing_in_manual)}개):")
        for p in missing_in_manual:
            print(f"    - {p}")
        print()
    else:
        print("✅ 누락된 경로 없음 — 크롤된 모든 경로가 매뉴얼에 등장합니다.")

    if only_in_manual:
        print(f"ℹ️  매뉴얼에는 있지만 크롤되지 않은 경로 ({len(only_in_manual)}개):")
        print("    (페이지가 제거됐거나, 크롤 seed 에 빠졌거나, 권한·데이터 부족)")
        for p in only_in_manual:
            print(f"    - {p}")
        print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawTextHelpFormatter
    )
    p.add_argument("--base-url", default="http://localhost:8080")
    p.add_argument("--user", default="admin")
    p.add_argument("--password", default="admin123")
    p.add_argument("--out-dir", default=str(REPO_ROOT / "docs/manual/new/images"))
    p.add_argument(
        "--state",
        default=str(REPO_ROOT / ".manual_capture_state.json"),
        help="storage_state JSON 경로",
    )
    p.add_argument(
        "--project-id",
        default=os.environ.get("MANUAL_PROJECT_ID"),
        help="프로젝트 ID (미지정 시 첫 프로젝트 자동 사용)",
    )
    p.add_argument(
        "--only",
        default="",
        help="콤마로 구분된 슬러그 prefix 만 캡처 (예: '01,02,80')",
    )
    p.add_argument(
        "--skip-todo", action="store_true", help="todo=True 인 단계는 건너뜀"
    )
    p.add_argument(
        "--include-todo",
        action="store_true",
        help="todo=True 단계도 자동 시도 (검토용)",
    )
    p.add_argument(
        "--skip-login", action="store_true", help="기존 storage_state 재사용"
    )
    p.add_argument("--headed", action="store_true", help="브라우저 띄우기")
    p.add_argument("--slow-mo", type=int, default=0, help="동작 사이 지연 ms")
    p.add_argument("--viewport", default="1280x800", help="WxH")
    p.add_argument(
        "--audit", action="store_true", help="캡처 후 매뉴얼 커버리지 감사 실행"
    )
    p.add_argument(
        "--audit-only", action="store_true", help="캡처를 건너뛰고 감사만 실행"
    )
    p.add_argument(
        "--manual",
        default=str(REPO_ROOT / "docs/manual/new/USER_MANUAL.md"),
        help="감사 대상 매뉴얼 경로",
    )
    return p.parse_args()


def filter_steps(
    steps: list[Step], only: str, skip_todo: bool, include_todo: bool
) -> list[Step]:
    if only:
        prefixes = [s.strip() for s in only.split(",") if s.strip()]
        steps = [s for s in steps if any(s.slug.startswith(pre) for pre in prefixes)]
    if skip_todo:
        steps = [s for s in steps if not s.todo]
    elif not include_todo:
        # 기본: todo 는 건너뜀 (인쇄로 안내)
        steps_kept = [s for s in steps if not s.todo]
        todo_count = len(steps) - len(steps_kept)
        if todo_count:
            print(
                f"ℹ️  todo=True 단계 {todo_count}개 건너뜀 (--include-todo 로 강제 시도)"
            )
        steps = steps_kept
    return steps


def run(args: argparse.Namespace, pw: Playwright) -> int:
    viewport_w, viewport_h = (int(x) for x in args.viewport.lower().split("x"))
    out_dir = Path(args.out_dir)
    state_path = Path(args.state)

    browser = pw.chromium.launch(headless=not args.headed, slow_mo=args.slow_mo)

    # 1) 로그인 → storage_state 저장
    if not args.skip_login or not state_path.exists():
        ctx = browser.new_context(viewport={"width": viewport_w, "height": viewport_h})
        page = ctx.new_page()
        print(f"🔐 로그인 → {args.base_url}")
        do_login(page, args.base_url, args.user, args.password)
        ctx.storage_state(path=str(state_path))
        print(f"   storage_state → {state_path}")
        ctx.close()

    # 2) 인증 컨텍스트 + 비인증 컨텍스트 두 개 준비
    ctx_auth = browser.new_context(
        viewport={"width": viewport_w, "height": viewport_h},
        storage_state=str(state_path),
    )
    ctx_anon = browser.new_context(
        viewport={"width": viewport_w, "height": viewport_h},
    )
    page_auth = ctx_auth.new_page()
    page_anon = ctx_anon.new_page()

    # 3) project_id 결정 + STEPS URL 치환
    project_id = resolve_project_id(page_auth, args.base_url, args.project_id)
    print(f"📁 PROJECT_ID = {project_id}")

    ok = fail = 0
    if not args.audit_only:
        steps = filter_steps(STEPS, args.only, args.skip_todo, args.include_todo)
        print(f"📸 캡처 단계 {len(steps)}개\n")

        for step in steps:
            page = page_auth if step.auth else page_anon
            url = (step.url or "").replace(PROJECT_ID_PLACEHOLDER, project_id)
            out_file = out_dir / f"{step.slug}.png"

            try:
                if url:
                    page.goto(args.base_url + url)
                _wait_settled(page, step.wait_ms)
                if step.prepare:
                    step.prepare(page)
                    _wait_settled(page, step.wait_ms)
                _take(page, out_file, step.full_page)
                try:
                    display = out_file.resolve().relative_to(REPO_ROOT)
                except ValueError:
                    display = out_file
                print(f"  ✅ {step.slug:40s} → {display}")
                ok += 1
            except Exception as e:  # pylint: disable=broad-except
                print(f"  ❌ {step.slug:40s}  {type(e).__name__}: {e}")
                fail += 1

        print(f"\n캡처 결과: ok={ok}  fail={fail}")

    # ── 매뉴얼 커버리지 감사 ──────────────────────────────────────────────
    if args.audit or args.audit_only:
        # STEPS 에 정의된 모든 URL 을 seed 로 사용 (auth=True 단계만)
        seeds = sorted(
            {
                (s.url or "")
                for s in STEPS
                if s.auth and s.url and not s.url.startswith(("javascript", "#"))
            }
        )
        crawled = crawl_routes(page_auth, args.base_url, seeds, project_id)
        manual_routes = extract_manual_routes(Path(args.manual))
        audit_coverage(crawled, manual_routes)

    ctx_auth.close()
    ctx_anon.close()
    browser.close()

    return 0 if fail == 0 else 1


def main() -> int:
    args = parse_args()
    with sync_playwright() as pw:
        return run(args, pw)


if __name__ == "__main__":
    sys.exit(main())
