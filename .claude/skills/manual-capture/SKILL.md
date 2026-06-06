---
name: manual-capture
description: testcasecraft 사용자 매뉴얼이 참조하는 화면 스크린샷을 Playwright Python(`scripts/manual_capture.py`)로 재캡처하고, 매뉴얼이 언급한 경로 vs 앱의 실제 라우트 커버리지를 감사한다. STEPS 리스트(현재 N장 정의됨)를 확장하면 신규 페이지/기능도 자동 캡처 대상이 된다 — 매뉴얼 성장에 따라 함께 진화. JWT(localStorage) 인증·storage_state 재사용·SPA 폴링 회피 패턴이 이미 검증됨. 트리거 — "매뉴얼 이미지 재캡처", "매뉴얼 스크린샷 갱신", "manual capture 다시", "USER_MANUAL 이미지 다시", "매뉴얼 커버리지 감사", "누락된 페이지 찾아줘(매뉴얼 기준)", "스크린샷만 다시 찍어줘", "매뉴얼 감사만", "새 페이지 캡처 추가", "STEPS 추가", "영문 매뉴얼 이미지", "영어 캡처", "images_en 갱신", "ShopFlow EN 으로 캡처". 매뉴얼 본문 동기화는 `manual-sync` 사용. 단순 페이지 캡처(매뉴얼 무관)는 직접 Playwright 호출.
---

# manual-capture

## 무엇을 하는가

`scripts/manual_capture.py` 를 운영해 다음 2종 작업을 수행한다.

1. **캡처**: USER_MANUAL.md 가 참조하는 73장의 PNG 를 `docs/manual/new/images/` 에 재생성
2. **감사**: 앱의 실제 라우트(크롤 결과) vs USER_MANUAL.md 가 백틱 안에 언급한 경로 diff 리포트

스크립트는 이미 검증되어 있어 (캡처 8장 OK + 감사 17 경로 추출 OK), 본 스킬은 사용·해석 가이드만 담는다.

## 언제 사용하는가

- UI 큰 변경 후 (디자인 토큰·레이아웃 수정, 한글 30자 워드랩 같은 시각 변화) → 캡처 갱신
- 새 라우트·페이지 추가 후 → 감사로 매뉴얼 누락 검출
- 정기 매뉴얼 점검 (분기·릴리즈 전)

직접 트리거되지 않고 `manual-capture-orchestrator` 의 Phase 2 에서 호출되는 게 정상 흐름이지만, 독립적으로 캡처만 또는 감사만 수행할 수도 있다.

## 사전 점검 (반드시 먼저)

이 스킬을 호출하기 전에 다음을 확인:

```bash
# 1) 백엔드+프론트 가동 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/login
# → 200 이어야 함. 000 이면 ./gradlew bootRun 필요 (사용자에게 요청, 자동 실행 금지)

# 2) Docker DB·RAG 가동 확인
docker ps --format "{{.Names}}" | grep -E "testcasecraft-(postgres|rag|minio)"
# → 4개 헬시 컨테이너 떠 있어야 함

# 3) Playwright 설치 확인
python3 -c "from playwright.sync_api import sync_playwright; print('OK')" 2>&1
# → OK 가 안 나오면 아래 설치
pip3 install --user playwright
~/Library/Python/3.*/bin/playwright install chromium
```

## 실행 패턴

### 패턴 1: 전체 캡처 + 감사 (기본)

```bash
python3 scripts/manual_capture.py --audit
```

- 첫 실행은 로그인 → `.manual_capture_state.json` 생성 → 73 STEPS 순회
- 매뉴얼이 언급한 경로 추출 → 크롤된 경로와 diff → 누락/잉여 리포트
- 산출물: `docs/manual/new/images/*.png` (73장 갱신) + 콘솔 감사 리포트

### 패턴 2: 감사만 (빠름, 캡처 스킵)

```bash
python3 scripts/manual_capture.py --audit-only --skip-login
```

- storage_state 재사용 → 캡처 없이 크롤만 → 감사 리포트
- 매뉴얼 동기화가 주 목적인 호출에서 사용 (manual-sync 위임 직전)

### 패턴 3: 부분 캡처 (특정 슬러그만)

```bash
python3 scripts/manual_capture.py --skip-login --only 80,81,82,83
```

- 관리자 페이지 일부만 갱신할 때
- 정규식 prefix 매칭 — `--only 8` 이면 80~89 모두

### 패턴 4: TODO 단계 강제 시도 (인터랙티브 캡처)

```bash
python3 scripts/manual_capture.py --include-todo --headed --slow-mo 300
```

- 28개 TODO 단계(다이얼로그·메뉴 오픈 등)를 자동 시도
- `--headed` 로 브라우저 띄워 어떤 셀렉터가 실패하는지 확인
- 성공한 단계는 그대로 사용, 실패한 단계는 수동 캡처로 보완

### 결과 해석

캡처 결과 출력 예:
```
✅ 06_main_after_login                      → docs/manual/new/images/06_main_after_login.png
❌ 22_tree_add_menu                         TimeoutError: ...
캡처 결과: ok=42  fail=3
```

감사 리포트 출력 예:
```
앱에서 크롤된 경로: 17
매뉴얼이 언급한 경로: 9
양쪽 모두 존재: 7

⚠️  매뉴얼에 누락된 경로 (10개):
    - /dashboard
    - /projects/:id/testcases
    ...
ℹ️  매뉴얼에는 있지만 크롤되지 않은 경로 (2개):
    - /login (로그인 상태로 크롤하므로 미접근)
    - /organizations/:id (조직 데이터 없음)
```

## 산출물 처리 규칙

오케스트레이터에서 호출될 때는 콘솔 출력을 다음 경로에 저장:

```
_workspace/manual-capture/run-{YYYY-MM-DD}/
├── capture_log.txt    ← 73 STEPS 캡처 성공/실패
├── audit_report.txt   ← 감사 결과
└── timing.txt         ← 실행 시간 (선택)
```

`_workspace/manual-capture/` 가 이미 존재하면 직전 run 을 `run_prev/` 로 이동.

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 로그인 30초 타임아웃 | SPA 폴링/웹소켓 때문에 `networkidle` 도달 안 함 | (이미 패치됨) `domcontentloaded` + 짧은 timer 로 교체 |
| `/api/projects` 401 | localStorage 의 JWT 가 context.request 에 자동 첨부 안 됨 | (이미 패치됨) `page.evaluate("localStorage.getItem('accessToken')")` 로 읽어 Bearer 첨부 |
| `relative_to` ValueError | `--out-dir` 상대 경로 사용 시 REPO_ROOT 와 비교 실패 | (이미 패치됨) try/except 로 fallback |
| 프로젝트 ID 없음 | DB 에 프로젝트 0건 | 사용자에게 1개 이상 프로젝트 생성 요청 또는 `--project-id <UUID>` 명시 |
| 캡처 단계 28개가 자동으로 실패 | TODO=True 단계는 UI 인터랙션 미구현 | `--include-todo --headed` 로 어디서 실패하는지 확인, prepare 콜백 작성 |
| 다크모드/모바일 캡처 차이 | `--viewport 412x917` 등으로 지정 가능 | mobile 매뉴얼 별도 필요 시 viewport 변경 + out-dir 분리 |

## 보안·git 주의

- `.manual_capture_state.json` 은 JWT 토큰을 포함하므로 **반드시 .gitignore** (이미 등록 권장 상태)
- `.manual_capture_state.json` 의 토큰 만료 시 `--skip-login` 빼고 재실행 → 새 토큰 발급
- `tmp/manual_capture_smoke/` 등 검증용 디렉토리는 tmp/ 가 이미 gitignore 되어 있어 자동 제외

## 확장 — 새 STEPS 추가

새 페이지·기능이 매뉴얼에 추가될 때 `scripts/manual_capture.py` 의 `STEPS` 리스트에 항목 추가:

```python
Step("90_new_feature", url=_project_path("/new-feature")),  # 단순 navigate
Step("91_new_dialog", url="/projects",                       # prepare 콜백 필요
     prepare=lambda p: p.locator('[data-testid="open-new-dialog"]').click()),
Step("92_complex_state", url="/projects", todo=True),        # 데이터 셋업 필요 → 수동
```

명명 규칙:
- prefix 숫자는 매뉴얼 섹션 번호와 느슨하게 매칭 (1~9 인증·프로젝트, 20~32 트리, 50~ 탭, 65~72 프로필, 78~ 관리자)
- 슬러그는 영문 snake_case, 한글 금지
- `_full` 접미사는 full-page 스크린샷 변종

상세 STEPS 가이드: `references/steps-extension.md`

## 영문판(EN) 캡처 트랙

영문 매뉴얼(`docs/manual/new/USER_MANUAL_EN.md`)의 이미지는 `docs/manual/new/images_en/` 에 별도 보관한다. 한국어판 캡처와 절차가 같되 세 가지가 다르다 — 이를 빠뜨리면 한국어 UI/데이터가 영문 매뉴얼에 들어간다.

1. **UI 언어**: 캡처 전 admin 의 서버 언어를 영어로 전환하고, 끝나면 반드시 원복한다.
   ```bash
   # 전환 (캡처 전)        PUT /api/auth/preferred-language {"languageCode":"en"}
   # 원복 (캡처 후)        PUT /api/auth/preferred-language {"languageCode":"ko"}
   ```
2. **데이터 프로젝트**: 케이스·플랜·실행 데이터가 보이는 화면은 **ShopFlow EN** (code `SHOPEN`, 영문 시드)으로 캡처한다. 한국어판은 ShopFlow(`SHOP`). PID 는 `/api/projects` 에서 code 로 찾는다.
3. **출력·상태 분리**: `--out-dir docs/manual/new/images_en --state .manual_capture_state_en.json`

```bash
# URL 기반 스텝 일괄 (49장)
python3 scripts/manual_capture.py --skip-todo \
  --out-dir docs/manual/new/images_en \
  --state .manual_capture_state_en.json \
  --project-id <ShopFlow EN PID>

# 인터랙션 필요 스텝 (다이얼로그·드롭다운·프로필 탭 등 20장)
python3 .claude/skills/manual-capture/scripts/capture_interactions.py \
  --out-dir docs/manual/new/images_en \
  --project-id <ShopFlow EN PID> --case-id <SHOPEN 케이스 UUID> --signup
```

캡처 후 표본 검수(Read 로 3~4장 열람)에서 ①UI 라벨이 영어인지 ②브레드크럼 프로젝트가 ShopFlow EN 인지 확인한다. 한국어판 갱신 시에도 같은 화면을 영문판에서 쓰고 있으면 **양쪽 모두** 재캡처해야 drift 가 없다.

> 주의: Playwright 로그인 직후 곧바로 navigate 하면 토큰 저장 전에 이동해 비인증 화면을 찍는 레이스가 있다. `wait_for_function("() => !!localStorage.getItem('accessToken')")` 으로 반드시 대기 (capture_interactions.py 에 반영됨).
