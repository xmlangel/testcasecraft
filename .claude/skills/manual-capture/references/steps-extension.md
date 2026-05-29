# STEPS 확장 가이드

`scripts/manual_capture.py` 의 `STEPS` 리스트는 73개 캡처를 정의한다. 각 항목은 `Step` 데이터클래스로 표현된다.

## Step 필드

| 필드 | 타입 | 기본값 | 의미 |
|------|------|--------|------|
| `slug` | str | (필수) | 파일명 prefix. `docs/manual/new/images/{slug}.png` 로 저장 |
| `url` | Optional[str] | None | base_url 기준 상대 경로. `{PROJECT_ID}` 토큰은 자동 치환 |
| `auth` | bool | True | False 면 로그인 안 한 컨텍스트로 캡처 (로그인 화면용) |
| `full_page` | bool | False | True 면 페이지 전체 (스크롤 영역 포함) 스크린샷 |
| `prepare` | Optional[Callable] | None | 캡처 직전 UI 조작 콜백. 메뉴 오픈·필드 입력 등 |
| `wait_ms` | int | 500 | 캡처 전 안정화 대기 (ms) |
| `todo` | bool | False | True 면 자동 캡처 스킵 + `--include-todo` 로만 강제 시도 |

## 단계별 추가 패턴

### 1) 단순 navigate (가장 흔함)

```python
Step("90_new_page", url="/some-route"),
Step("91_new_page_full", url="/some-route", full_page=True),
```

### 2) 프로젝트 스코프 navigate

`PROJECT_ID_PLACEHOLDER` (`{PROJECT_ID}`) 토큰을 사용. 환경변수 `MANUAL_PROJECT_ID` 또는 `--project-id` 로 결정된 ID 가 자동 치환된다.

```python
Step("92_proj_feature", url=_project_path("/feature")),  # = /projects/{PROJECT_ID}/feature
```

### 3) 메뉴/다이얼로그 오픈

```python
Step("93_some_menu", url="/projects",
     prepare=lambda p: p.locator('[data-testid="open-menu"]').click()),
```

복잡한 prepare 는 함수로 추출:

```python
def open_new_dialog(page):
    page.locator('[data-testid="open-dialog"]').click()
    page.wait_for_selector('[role="dialog"]', timeout=3_000)
    page.locator('[data-testid="some-field"]').fill("샘플 값")

Step("94_dialog_filled", url="/projects", prepare=open_new_dialog),
```

### 4) 로그아웃 상태 캡처

```python
Step("01_login_empty", url="/", auth=False),  # 비인증 컨텍스트 사용
```

`auth=False` 면 `ctx_anon` 컨텍스트(storage_state 미사용)로 캡처. 로그인/회원가입 화면 전용.

### 5) 데이터 셋업 필요 — todo 로 보류

```python
Step("95_with_data", url="/list", todo=True),
# → 자동 캡처 스킵, --include-todo 강제 시도 시 빈 화면 캡처될 가능성
# → 수동 캡처 또는 사전 데이터 시드 후 todo=False 로 전환
```

## 명명 규칙

| Prefix | 범위 | 예 |
|--------|------|-----|
| 01~05 | 인증 (로그인·회원가입) | `01_login_empty`, `03_signup_filled` |
| 06~13 | 로그인 직후·프로젝트 생성 | `06_main_after_login`, `11_project_create_dialog` |
| 15~18 | 헤더·사용자 메뉴 | `15_user_menu`, `18_user_menu_logout` |
| 20~32 | 프로젝트 대시보드·트리·테스트케이스 작성 | `21_testcase_page`, `28_two_folders` |
| 42~46 | 입력 모드·JIRA·대시보드 | `44_input_mode_open`, `45_jira_panel` |
| 50~56 | 탭별 (testplans/executions/results/automation/junit/rag/exploratory) | `52_executions`, `55_rag_full` |
| 60~72 | UI 변형·프로필 다이얼로그 | `60_dark_mode`, `70_profile_gsheets` |
| 78~86 | 관리자 (organizations/users/mail/llm/scheduler/translation) | `81_organizations`, `85_scheduler_full` |
| 90+ | **신규 확장 영역** | `90_new_feature` |

새 매뉴얼 섹션 추가 시 가능하면 90+ 영역에 배치. 기존 prefix 시프트는 USER_MANUAL.md 의 이미지 참조를 깨뜨리므로 금지.

## 슬러그 컨벤션

- 영문 snake_case (한글 금지 — 일부 파일시스템에서 깨짐)
- `_full` 접미사: full-page 변종
- `_v2`, `_v3` 같은 번호 접미사: 동일 화면의 다른 상태(`60_dark_mode` 처럼 토글 후 등)
- 짧고 식별 가능하게 — `21_testcase_page` ◯, `21_testcase_page_with_one_folder_and_three_cases` ✕

## prepare 콜백 작성 팁

1. **셀렉터 우선순위**: `data-testid` > `role` + `name` > MUI 클래스 > 텍스트
2. **wait_for_selector**: 클릭 전 요소 존재 보장
3. **wait_for_timeout(300ms)**: 애니메이션(드롭다운·다이얼로그) 안정화
4. **page.evaluate**: localStorage 조작, 가짜 데이터 주입 시
5. **page.context.request**: API 사전 호출로 데이터 시드

예 — 프로젝트 선택 드롭다운 캡처:

```python
def open_project_selector(page):
    page.locator('[data-testid="project-selection-nav"]').click()
    page.wait_for_selector('[role="menu"]', timeout=3_000)
    page.wait_for_timeout(300)  # 애니메이션
```

예 — 다크모드 토글:

```python
def toggle_dark_mode(page):
    page.evaluate("() => localStorage.setItem('themeMode', 'dark')")
    page.reload()
    page.wait_for_load_state("domcontentloaded")
```

## 검증

새 STEPS 추가 후:

```bash
# 1) syntax 검증
python3 -c "import ast; ast.parse(open('scripts/manual_capture.py').read()); print('OK')"

# 2) 새 슬러그만 캡처해 확인
python3 scripts/manual_capture.py --skip-login --only 90,91

# 3) 캡처 결과를 매뉴얼 본문에 참조하기 전에 시각 확인
open docs/manual/new/images/90_new_feature.png
```
