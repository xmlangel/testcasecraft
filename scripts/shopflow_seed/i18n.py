"""ShopFlow seed - i18n 메타데이터 (ko/en).

각 로케일의 폴더·플랜·실행 이름과 결과 노트 템플릿을 모아둔다.
폴더 키 (예: "F01")는 두 로케일 공통이며, 케이스 part JSON 의 폴더 키도 동일 코드 prefix 를 쓴다.
"""

from __future__ import annotations

# ── 프로젝트 ─────────────────────────────────────────────────────────────────
PROJECT = {
    "ko": {
        "name": "ShopFlow",
        "code": "SHOP",
        "description": (
            "전자상거래 SaaS 샘플 프로젝트 — 회원 인증부터 카탈로그·장바구니·결제·주문·배송·리뷰·알림·관리자 콘솔까지 "
            "전체 사용자 여정을 ISO/IEC 25010 품질특성(기능적합성·신뢰성·사용성·보안·성능효율성)과 "
            "ISTQB 테스트 레벨(단위/통합/시스템/인수)·테스트 유형(기능·회귀·스모크·E2E·성능·보안·접근성)으로 "
            "커버하는 표준 샘플셋. 폴더 12 / TC 108 / Plan 12 / Execution 12 / Result 130+."
        ),
    },
    "en": {
        "name": "ShopFlow EN",
        "code": "SHOPEN",
        "description": (
            "E-commerce SaaS sample project — covers the full user journey from authentication through "
            "catalog, cart, checkout, order, shipping, reviews, notifications, and admin console. "
            "Mapped to ISO/IEC 25010 quality attributes (functional suitability, reliability, usability, "
            "security, performance efficiency) and ISTQB test levels (unit/integration/system/acceptance) "
            "and types (functional, regression, smoke, E2E, performance, security, accessibility). "
            "Folders 12 / TC 108 / Plan 12 / Execution 12 / Result 130+."
        ),
    },
}

# ── 폴더 (12개) ─────────────────────────────────────────────────────────────
FOLDERS = {
    "ko": [
        ("F01 회원 인증", "회원가입·로그인·SSO·OAuth·세션 관리·2FA·비밀번호 재설정"),
        ("F02 사용자 프로필", "프로필 정보·배송지·결제수단·관심상품·회원 등급/포인트"),
        (
            "F03 상품 카탈로그",
            "카테고리·상품 상세·옵션/SKU·재고·이미지 갤러리·관련상품",
        ),
        (
            "F04 검색·필터",
            "키워드·자동완성·태그·가격대·필터·정렬·페이지네이션·검색 SEO",
        ),
        (
            "F05 장바구니",
            "담기·수량 변경·삭제·재고 검증·게스트→로그인 머지·가격 재계산",
        ),
        (
            "F06 결제·페이먼트",
            "신용카드·간편결제·계좌이체·할부·PG 콜백·결제 실패·환불·영수증",
        ),
        (
            "F07 주문 관리",
            "주문 생성·주문 조회·상태 전이·주문 취소·부분 취소·교환/반품",
        ),
        (
            "F08 배송·물류",
            "배송지 검증·배송 추적·송장 번호·예상 도착일·배송 실패·해외배송",
        ),
        (
            "F09 리뷰·평점",
            "리뷰 작성·이미지 첨부·별점·도움돼요·신고·관리자 검수·평균 점수",
        ),
        (
            "F10 쿠폰·프로모션",
            "쿠폰 발급/사용·중복 적용 룰·기간 만료·금액/퍼센트 할인·타임세일",
        ),
        ("F11 알림", "이메일·SMS·푸시·인앱 알림·알림 환경설정·발송 실패 재시도"),
        ("F12 관리자 콘솔", "주문 관리·상품 등록·재고 관리·매출 리포트·권한·감사 로그"),
    ],
    "en": [
        (
            "F01 Authentication & Account",
            "Signup, login, SSO, OAuth, session management, 2FA, password reset.",
        ),
        (
            "F02 User Profile",
            "Profile info, addresses, payment methods, wishlist, member tier/points.",
        ),
        (
            "F03 Product Catalog",
            "Categories, product detail, options/SKU, stock, image gallery, related items.",
        ),
        (
            "F04 Search & Filter",
            "Keyword, autocomplete, tags, price range, filters, sorting, pagination, search SEO.",
        ),
        (
            "F05 Shopping Cart",
            "Add, change quantity, remove, stock check, guest→login merge, price re-calc.",
        ),
        (
            "F06 Checkout & Payment",
            "Credit card, easy pay, bank transfer, installment, PG callback, failures, refunds, receipts.",
        ),
        (
            "F07 Order Management",
            "Order creation, lookup, state transitions, cancellation, partial cancel, exchange/return.",
        ),
        (
            "F08 Shipping & Logistics",
            "Address validation, tracking, waybill, ETA, delivery failure, international shipping.",
        ),
        (
            "F09 Reviews & Ratings",
            "Review writing, images, star rating, helpful votes, reports, admin moderation, average score.",
        ),
        (
            "F10 Coupons & Promotions",
            "Coupon issue/use, stacking rules, expiry, amount/percent discount, flash sale.",
        ),
        (
            "F11 Notifications",
            "Email, SMS, push, in-app, notification preferences, send failure retry.",
        ),
        (
            "F12 Admin Console",
            "Order management, product registration, inventory, sales report, permissions, audit log.",
        ),
    ],
}

# ── 테스트플랜 12개 — (name, description, folder-code prefix filter or None, case_count) ─
PLANS = {
    "ko": [
        (
            "TP01 Sprint 23 - 인증 & 카탈로그",
            "스프린트 23 신규 기능 검증 (F01 회원인증, F03 상품 카탈로그 중심).",
            ["F01", "F03"],
            12,
        ),
        (
            "TP02 Sprint 24 - 장바구니 & 결제",
            "스프린트 24 신규 기능 검증 (F05 장바구니, F06 결제·페이먼트 중심).",
            ["F05", "F06"],
            14,
        ),
        (
            "TP03 Sprint 25 - 주문 & 배송",
            "스프린트 25 신규 기능 검증 (F07 주문 관리, F08 배송·물류 중심).",
            ["F07", "F08"],
            14,
        ),
        (
            "TP04 R2.0 회귀 테스트",
            "R2.0 릴리즈 전 전체 모듈 회귀 — HIGH 우선순위 위주.",
            None,
            30,
        ),
        (
            "TP05 스모크 - 핵심 경로 (Daily)",
            "매일 자동 실행되는 스모크 테스트 — 핵심 사용자 여정만.",
            None,
            10,
        ),
        (
            "TP06 E2E - 사용자 여정",
            "회원가입 → 상품 검색 → 장바구니 → 결제 → 주문 → 배송 → 리뷰 까지 풀 시나리오.",
            ["F01", "F04", "F05", "F06", "F07", "F08", "F09"],
            14,
        ),
        (
            "TP07 보안 - 인증/권한/입력 검증",
            "OWASP Top 10 기반 보안 테스트 (auth, security, admin 태그 케이스).",
            ["F01", "F12"],
            10,
        ),
        (
            "TP08 성능 - 부하/응답시간",
            "주요 API 응답시간·동시접속 부하 테스트.",
            ["F03", "F04", "F06"],
            10,
        ),
        (
            "TP09 UAT - 베타 사용자",
            "베타 사용자 30명 대상 인수 테스트 — 사용성 중심.",
            None,
            18,
        ),
        (
            "TP10 모바일 호환성 - iOS/Android",
            "iOS 15+/Android 11+ 디바이스에서의 호환성 검증.",
            ["F03", "F04", "F05", "F06"],
            12,
        ),
        (
            "TP11 Black Friday 부하 대비",
            "동시접속 10배·결제 5배 부하 시나리오 — 카탈로그·결제·재고 중심.",
            ["F03", "F05", "F06"],
            12,
        ),
        (
            "TP12 핫픽스 검증",
            "핫픽스 배포 후 영향 모듈 빠른 검증 — 최소 케이스.",
            None,
            8,
        ),
    ],
    "en": [
        (
            "TP01 Sprint 23 - Auth & Catalog",
            "Sprint 23 feature verification — F01 Auth & F03 Catalog focus.",
            ["F01", "F03"],
            12,
        ),
        (
            "TP02 Sprint 24 - Cart & Payment",
            "Sprint 24 feature verification — F05 Cart & F06 Payment focus.",
            ["F05", "F06"],
            14,
        ),
        (
            "TP03 Sprint 25 - Order & Shipping",
            "Sprint 25 feature verification — F07 Order & F08 Shipping focus.",
            ["F07", "F08"],
            14,
        ),
        (
            "TP04 R2.0 Regression",
            "Full-module regression before R2.0 release — HIGH priority cases.",
            None,
            30,
        ),
        (
            "TP05 Smoke - Critical Path (Daily)",
            "Daily automated smoke test — core user journeys only.",
            None,
            10,
        ),
        (
            "TP06 E2E - User Journey",
            "Full E2E: signup → search → cart → checkout → order → shipping → review.",
            ["F01", "F04", "F05", "F06", "F07", "F08", "F09"],
            14,
        ),
        (
            "TP07 Security - Auth/Authz/Input",
            "OWASP Top 10 security tests (auth, security, admin tagged cases).",
            ["F01", "F12"],
            10,
        ),
        (
            "TP08 Performance - Load/Latency",
            "Key API latency and concurrent-user load testing.",
            ["F03", "F04", "F06"],
            10,
        ),
        (
            "TP09 UAT - Beta Users",
            "Acceptance tests with 30 beta users — usability focus.",
            None,
            18,
        ),
        (
            "TP10 Mobile Compatibility - iOS/Android",
            "Compatibility verification on iOS 15+ / Android 11+ devices.",
            ["F03", "F04", "F05", "F06"],
            12,
        ),
        (
            "TP11 Black Friday Load Readiness",
            "10x traffic & 5x payment load scenarios — catalog/payment/inventory focus.",
            ["F03", "F05", "F06"],
            12,
        ),
        (
            "TP12 Hotfix Verification",
            "Quick verification of affected modules after hotfix — minimal cases.",
            None,
            8,
        ),
    ],
}

# ── 실행 상태 분포 (key 는 실행 이름 prefix "E01..." 으로 매칭) ──────────────
STATUS_PLAN_BY_PLAN_INDEX = [
    "COMPLETED",  # E01
    "COMPLETED",  # E02
    "INPROGRESS",  # E03
    "COMPLETED",  # E04
    "COMPLETED",  # E05
    "COMPLETED",  # E06
    "INPROGRESS",  # E07
    "INPROGRESS",  # E08
    "NOTSTARTED",  # E09
    "INPROGRESS",  # E10
    "NOTSTARTED",  # E11
    "COMPLETED",  # E12
]


def execution_name(index: int, plan_name: str) -> str:
    """E{NN} {plan_short_name} - Run 1  (plan 의 'TPxx ' 제거)."""
    short = plan_name.split(" ", 1)[1] if " " in plan_name else plan_name
    return f"E{index:02d} {short} - Run 1"


# ── 결과 노트 (PASS/FAIL/BLOCKED/NOT_RUN) ───────────────────────────────────
NOTES = {
    "ko": {
        "PASS": "[{date}] 정상 동작 확인. 모든 단계 기대 결과와 일치.",
        "FAIL": "[{date}] 실패: {name}에서 기대 결과와 불일치. 재현 100%. 버그 티켓 등록 예정.",
        "BLOCKED": "[{date}] 환경 이슈로 실행 불가 (의존 서비스 다운/데이터 부족). 차단 사유 기록.",
        "NOT_RUN": "[{date}] 이번 회차에서 미실행 — 다음 사이클로 이월.",
    },
    "en": {
        "PASS": "[{date}] Verified as expected. All steps matched the expected result.",
        "FAIL": "[{date}] FAILED in '{name}'. Mismatch vs. expected. Reproduces 100%. Bug ticket to be filed.",
        "BLOCKED": "[{date}] Cannot execute due to environment issue (dependent service down / missing data). Blocking reason recorded.",
        "NOT_RUN": "[{date}] Not executed in this cycle — deferred to next iteration.",
    },
}

# ── 케이스 빌더에서 쓰는 공통 문자열 ────────────────────────────────────────
CASE_STRINGS = {
    "ko": {
        "preCondition": "테스트 계정 로그인 상태이며 시드 데이터(카탈로그·재고·쿠폰)가 적재되어 있다.",
        "postCondition": "테스트 데이터/상태가 의도된 최종 상태로 남고 부수효과(알림·로그 등)가 기대대로 발생한다.",
        "testTechnique": "Equivalence Partitioning / Boundary Value Analysis",
        "step1_desc": "전제조건이 충족된 상태에서 해당 기능 진입 페이지에 접근한다.",
        "step1_exp": "페이지가 정상 로딩되고 필요한 UI 요소가 모두 노출된다.",
        "step2_desc": "시나리오에 따라 입력값/액션을 수행한다: {name}.",
        "step2_exp": "입력 단계 동안 유효성 검사가 동작하고 즉각적 피드백이 표시된다.",
        "step3_desc": "최종 ‘확인/제출/저장’ 버튼을 클릭한다.",
        "step3_exp": "백엔드 호출이 발생하고 2xx 응답이 반환된다 (또는 정의된 에러 응답).",
        "step4_desc": "후속 상태(목록 갱신·알림·로그·감사 이벤트 등)를 확인한다.",
        "desc_template": "[{code}] {name}\n\n시나리오: {scenario}\n\n품질 특성: ISO/IEC 25010 — 기능적합성 + (해당 시 신뢰성·보안·성능효율성).",
    },
    "en": {
        "preCondition": "Test account is logged in and seed data (catalog, stock, coupons) is loaded.",
        "postCondition": "Test data ends in the intended final state and side effects (notifications, logs) occur as expected.",
        "testTechnique": "Equivalence Partitioning / Boundary Value Analysis",
        "step1_desc": "With preconditions met, navigate to the feature entry page.",
        "step1_exp": "Page loads correctly and all required UI elements are visible.",
        "step2_desc": "Perform the scenario inputs/actions: {name}.",
        "step2_exp": "Input-time validations run and immediate feedback is shown.",
        "step3_desc": "Click the final 'Confirm / Submit / Save' button.",
        "step3_exp": "A backend call is made and a 2xx response is returned (or the defined error response).",
        "step4_desc": "Verify subsequent state (list refresh, notifications, logs, audit events).",
        "desc_template": "[{code}] {name}\n\nScenario: {scenario}\n\nQuality attribute: ISO/IEC 25010 — Functional Suitability + (Reliability/Security/Performance Efficiency where applicable).",
    },
}

# ── 결과 담당자 풀 (executedBy 분포) ────────────────────────────────────────
# 백엔드가 executedBy 를 JWT 의 인증된 사용자로 강제 설정하므로, 각 사용자로 실제 로그인 후
# 해당 토큰으로 결과를 POST 해야 분포가 형성됨. 다음 4명은 시드된 비밀번호가 있어 로그인 가능.
USERS = ["admin", "manager", "tester", "developer"]
USER_PASSWORDS = {
    "admin": "admin123",
    "manager": "manager123",
    "tester": "tester",
    "developer": "developer123",
}

# 프로젝트 멤버 추가 시 부여할 역할
USER_PROJECT_ROLES = {
    "admin": "PROJECT_MANAGER",
    "manager": "PROJECT_MANAGER",
    "tester": "TESTER",
    "developer": "DEVELOPER",
}

# 결과 enum별 담당자 가중치 (실제 운영 패턴 모사)
#   PASS  : QA 테스터·개발자가 주로 통과시킴
#   FAIL  : 테스터·개발자가 주로 실패 보고
#   BLOCKED: 매니저/관리자가 환경 차단 사유 기록 비중 높음
#   NOT_RUN: 관리자가 미실행 표시
EXECUTED_BY_WEIGHTS = {
    "PASS": [("tester", 45), ("developer", 30), ("admin", 15), ("manager", 10)],
    "FAIL": [("tester", 40), ("developer", 40), ("manager", 15), ("admin", 5)],
    "BLOCKED": [("manager", 40), ("admin", 30), ("tester", 20), ("developer", 10)],
    "NOT_RUN": [("admin", 55), ("manager", 30), ("tester", 10), ("developer", 5)],
}


# ── JUnit 자동화 결과 메타데이터 ────────────────────────────────────────────
JUNIT_UPLOADS = {
    "ko": [
        (
            "cypress-checkout-e2e.xml",
            "Cypress E2E - 결제·주문 흐름 (Daily)",
            "Cypress 13.6 으로 매일 자정 실행되는 결제·주문 풀 시나리오. Chrome 124 / staging 환경.",
        ),
        (
            "playwright-search-catalog.xml",
            "Playwright E2E - 카탈로그·검색",
            "Playwright 1.42 (WebKit) 으로 카탈로그·검색 모듈 회귀 검증. 모바일 핀치 줌 포함.",
        ),
        (
            "jest-payment-unit.xml",
            "Jest Unit - 결제·쿠폰·재고 도메인",
            "Jest 29 + Node 20 환경에서 도메인 서비스 단위 테스트. PR 마다 CI 에서 실행.",
        ),
    ],
    "en": [
        (
            "cypress-checkout-e2e.xml",
            "Cypress E2E - Checkout & Order Flow (Daily)",
            "Daily-midnight Cypress 13.6 run covering the full checkout/order scenario. Chrome 124 / staging.",
        ),
        (
            "playwright-search-catalog.xml",
            "Playwright E2E - Catalog & Search",
            "Playwright 1.42 (WebKit) regression for catalog and search modules. Includes mobile pinch-zoom.",
        ),
        (
            "jest-payment-unit.xml",
            "Jest Unit - Payment, Coupon & Inventory",
            "Domain-service unit tests under Jest 29 + Node 20. Runs in CI on every PR.",
        ),
    ],
}
