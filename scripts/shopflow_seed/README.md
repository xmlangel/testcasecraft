# ShopFlow Seed — 한국어/영어 표준 샘플셋 생성기

`testcasecraft`에 **실제 운영 같은 전자상거래 SaaS** 샘플 데이터를 한 번의 명령으로 만드는 영구 자산. 시연·테스트·기능 회귀에 그대로 재사용 가능 (멱등). **한국어(ShopFlow / SHOP)** 와 **영어(ShopFlow EN / SHOPEN)** 두 로케일을 독립적으로 또는 동시에 생성한다.

## 산출물 (각 로케일별)

| 항목              | 수량                                               | 목표 |
| ----------------- | -------------------------------------------------- | ---- |
| 프로젝트          | 1                                                  | —    |
| 폴더 (기능 모듈)  | **12**                                             | ≥10  |
| 테스트케이스      | **108** (자동화 56)                                | ≥100 |
| 테스트플랜        | **12**                                             | ≥10  |
| 테스트실행        | **12** (COMPLETED 6 / INPROGRESS 4 / NOTSTARTED 2) | ≥10  |
| 테스트결과        | **134**                                            | ≥100 |
| 자동화 PASS       | **35**                                             | ≥30  |
| 자동화 FAIL       | **20**                                             | ≥10  |
| 담당자 distinct   | **5명**                                            | ≥3   |
| JUnit 자동화 결과 | **3** (Cypress/Playwright/Jest)                    | ≥3   |

## 사용법

### 한 줄 실행 (권장)

```bash
cd scripts/shopflow_seed
./seed.sh ko       # 한국어 셋만
./seed.sh en       # 영어 셋만
./seed.sh both     # 한국어 + 영어 둘 다
```

### 단계별 수동 실행

```bash
export SHOPFLOW_LOCALE=ko    # 또는 en

python3 00_login.py
python3 01_project.py
python3 02_folders.py
python3 03_cases.py
python3 04_plans.py
python3 05_executions.py
python3 06_results.py
python3 05b_execution_status.py
python3 05c_reset_notstarted.py
python3 08_junit_imports.py
python3 07_verify.py
```

> **중요 순서**: `06_results.py` → `05b_execution_status.py` → `05c_reset_notstarted.py`.
> 백엔드는 COMPLETED 상태 실행에 결과 입력을 거부한다.

### 멱등 재실행

각 스크립트는 `state/{locale}/*.json` 캐시를 본다. 부분 재실행은 해당 JSON 만 지우면 된다.

```bash
# 영어 셋만 처음부터
rm -rf state/en
# (백엔드의 ShopFlow EN 프로젝트가 있으면 그것도 삭제 권장)
./seed.sh en
```

## 환경 변수

| 변수                | 기본값                  |
| ------------------- | ----------------------- |
| `SHOPFLOW_LOCALE`   | `ko` (`ko` 또는 `en`)   |
| `SHOPFLOW_BASE_URL` | `http://localhost:8080` |
| `SHOPFLOW_USER`     | `admin`                 |
| `SHOPFLOW_PASS`     | `admin123`              |

## 도메인 설계

```
F01 회원 인증 / Authentication & Account
F02 사용자 프로필 / User Profile
F03 상품 카탈로그 / Product Catalog
F04 검색·필터 / Search & Filter
F05 장바구니 / Shopping Cart
F06 결제·페이먼트 / Checkout & Payment
F07 주문 관리 / Order Management
F08 배송·물류 / Shipping & Logistics
F09 리뷰·평점 / Reviews & Ratings
F10 쿠폰·프로모션 / Coupons & Promotions
F11 알림 / Notifications
F12 관리자 콘솔 / Admin Console
```

테스트플랜은 실제 운영 패턴:

- Sprint 23/24/25 / R2.0 Regression / Smoke(Daily) / E2E / Security / Performance / UAT / Mobile / Black Friday / Hotfix

담당자 분포(executedBy)는 결과 유형별 가중치로 자동 분배:

- **PASS**: tester 40% · developer 25% · admin 20% · github 10% · manager 5%
- **FAIL**: tester 40% · developer 35% · manager 15% · admin 5% · github 5%
- **BLOCKED**: manager 35% · admin 30% · tester 20% · developer 10% · github 5%
- **NOT_RUN**: admin 50% · manager 30% · tester 15% · developer 5%

## 파일 구조

```
scripts/shopflow_seed/
├── _lib.py              # HTTP/토큰/멀티파트 + LOCALE 분기
├── i18n.py              # 폴더·플랜·실행·노트·사용자 가중치 (ko/en)
├── 00_login.py          # 토큰 발급/저장
├── 01_project.py        # 프로젝트
├── 02_folders.py        # 12 폴더
├── 03_cases.py          # 108 TC (data/{loc}/cases_part*.json → DTO)
├── 04_plans.py          # 12 플랜
├── 05_executions.py     # 12 실행 (NOTSTARTED)
├── 05b_execution_status.py  # 상태 전이 (COMPLETED 6 / INPROGRESS 4 / NOTSTARTED 2)
├── 05c_reset_notstarted.py  # NOTSTARTED 결과 0건 보장
├── 06_results.py        # 결과 + 담당자 5명 분포
├── 07_verify.py         # 최종 검증 보고서
├── 08_junit_imports.py  # 자동화 결과 3종 (multipart 업로드)
├── 99_fix_case_type.py  # 백업 패치 (type → "testcase" 보정)
├── seed.sh              # 통합 러너 ko|en|both
├── data/
│   ├── ko/
│   │   ├── cases_part1~4.json
│   │   └── junit/{cypress,playwright,jest}*.xml
│   └── en/
│       ├── cases_part1~4.json
│       └── junit/{cypress,playwright,jest}*.xml
└── state/                 # gitignored
    ├── ko/{token,project,folders,cases,plans,executions,results,junit_uploads}.json
    └── en/{...}
```

## 케이스 데이터 확장

`data/{locale}/cases_part{1..4}.json` 의 폴더 키 아래에 4튜플 한 줄 추가:

```json
["케이스 이름", "HIGH|MEDIUM|LOW", true|false, "한 줄 시나리오"]
```

`03_cases.py` 의 `build_dto()` 가 풀필드 DTO(steps 4단계, preCondition/postCondition, tags, executionType, testTechnique)로 자동 변환한다. 재실행 시 신규 항목만 생성된다.

## 트러블슈팅

| 증상                            | 원인 / 해결                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| 트리에 폴더 0 / 케이스 0        | 케이스 type이 `"test"`. `99_fix_case_type.py` 실행 (현재 03은 `"testcase"` 사용).            |
| `이미 완료된 테스트 실행입니다` | `05b`가 `06` 보다 먼저 실행됨. 정상 순서는 `06 → 05b → 05c`.                                 |
| 401 Unauthorized                | 토큰 만료. `00_login.py` 재실행. `_lib.py` 자동 재로그인 포함.                               |
| 통계 차트가 비어 있음           | 정상. UI는 plan + execution 필터 선택 시에만 통계 표시. COMPLETED 실행(예: E04 R2.0)을 선택. |

## 관련 하네스

- `testcasecraft-sheet-import-orchestrator` — 외부 Google Sheets/Excel 에서 케이스 임포트
- `testcasecraft-mcp-orchestrator` — 같은 백엔드를 MCP로 노출
- `manual-capture-orchestrator` — 매뉴얼 캡처 + 동기화
