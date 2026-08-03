# Translation contract — Korean screen spec → English

This file is the single reference for the English edition under `docs/screen_spec/en/`.
Every translated document follows it, so the 50 documents read as one set rather than
fifty separate translations.

Keep this file in sync when the Korean source adds a new term.

---

## 1. What gets translated, what stays

| Element | Rule |
|---|---|
| Prose, headings, table cells | Translate |
| Route paths (`/projects/{projectId}/testcases`) | Keep verbatim, including `{placeholders}` |
| Requirement IDs (`S0-01`, `S11-14`) | Keep verbatim |
| Area labels (`영역 C` → `Area C`, `영역 A-1` → `Area A-1`) | Translate the word, keep the letter/number |
| Screen IDs (`S0`–`S11`) | Keep verbatim |
| Capture filenames (`21_testcase_page.png`) | Keep verbatim |
| Diagram references (`images/S4_layout.svg`) | Keep verbatim — the same SVG files serve both editions |
| Repo paths in code spans (`../../manual/new/USER_MANUAL.md`) | Keep verbatim |
| Environment variables, feature flags (`SHOW_EXPLORATORY_SESSION_TAB`) | Keep verbatim |
| Role names (`PROJECT_MANAGER`, `ADMIN`) | Keep verbatim |
| Version strings (`v1.0.102`) | Keep verbatim |
| UI text quoted from the product | Keep the Korean, add the English in parentheses on first use per document |

**Never invent.** If the Korean says a screen shows four states, the English says four.
Do not add examples, caveats, or explanations the source does not have. Do not drop
rows from tables. Row counts must match the source exactly.

**No source-code evidence.** The Korean edition deliberately carries no file names,
line numbers, or internal identifiers. Do not add any.

---

## 2. Document titles and front matter

Mirror the source structure exactly. Four documents per screen.

| Source | English page | H1 |
|---|---|---|
| `01_<화면>_업무프로세스.md` | `EN-S{n}-Workflow` | `# <Screen>(S{n}) Workflow` |
| `02_<화면>_화면정의.md` | `EN-S{n}-Screen` | `# <Screen>(S{n}) Screen Definition` |
| `03_<화면>_컴포넌트.md` | `EN-S{n}-Components` | `# <Screen>(S{n}) Components` |
| `04_요건반영목록.md` | `EN-S{n}-Requirements` | `# <Screen>(S{n}) Requirement Coverage` |

Front-matter block keeps the same three-or-four line shape, translated:

```
> Screen ID **S4** · Parent: [`01`](01_...)      → 상위 문서
> Routes: `/projects/{projectId}/testcases`       → 라우트
> Captures (manual `images/`): `21_...png` · ...  → 캡처
> Baseline **v1.0.102**                           → 기준 버전
```

Leave link targets as they are in the source. The wiki publisher rewrites them.

---

## 3. Screen names

| ID | Korean | English |
|---|---|---|
| S0 | 로그인·계정 | Login & Account |
| S1 | 프로젝트 | Projects |
| S2 | 공통 레이아웃 | Shared Layout |
| S3 | 대시보드 | Dashboards |
| S4 | 테스트케이스 | Test Cases |
| S5 | 테스트 플랜 | Test Plans |
| S6 | 테스트 실행 | Test Execution |
| S7 | 테스트 결과 | Test Results |
| S8 | 자동화 테스트 | Automated Tests |
| S9 | RAG 문서 | RAG Documents |
| S10 | 탐색 세션 | Exploratory Sessions |
| S11 | 관리자 설정 | Administrator Settings |

---

## 4. Status vocabulary (04 documents)

These are the only allowed values. Do not paraphrase.

| Korean | English |
|---|---|
| 정상 | Working |
| 정상(조건부) | Working (conditional) |
| **부분** | **Partial** |
| **숨김** | **Hidden** |
| **환경 의존** | **Environment-dependent** |
| 미구현 | Not implemented |
| 정정 대상 | Correction needed |
| `⚠ 확인 필요` | `⚠ Needs verification` |

When the Korean appends a reason after an em dash, keep that shape:
`환경 의존 — S11 메일 설정 필요` → `Environment-dependent — requires S11 mail settings`.

---

## 5. Permission notation

Keep the compact symbols exactly as the source uses them.

| Notation | Meaning |
|---|---|
| `RW` | read + edit |
| `R` | read only |
| `W(결과)` → `W(results)` | record results only |
| `—` | no access |

Project role names stay in English uppercase as in the source: `PROJECT_MANAGER`,
`LEAD_DEVELOPER`, `DEVELOPER`, `CONTRIBUTOR`, `TESTER`, `VIEWER`. System roles:
`ADMIN`, `MANAGER`. Organization roles: `OWNER`, `ADMIN`, `MEMBER`.

---

## 6. Recurring terms

| Korean | English |
|---|---|
| 화면 기획 문서 | screen specification |
| 업무프로세스 | workflow |
| 화면정의 | screen definition |
| 컴포넌트 | components |
| 요건반영목록 | requirement coverage |
| 요건 | requirement |
| 반영 위치 | where implemented |
| 영역 | area |
| 배치도 | layout diagram |
| 구성요소 | element |
| 표시 규칙 | display rule |
| 상태 전이 | state transition |
| 권한 | permission |
| 라우트 | route |
| 캡처 | capture |
| 트리 | tree |
| 폴더 | folder |
| 케이스 | case |
| 플랜 | plan |
| 실행 | execution |
| 결과 입력 | result entry |
| 판정 | verdict |
| 통과 · 실패 · 차단됨 · 미실행 | Pass · Fail · Blocked · Not Run |
| 가로 탭 레이아웃 | tab layout |
| 좌측 메뉴 레이아웃 | sidebar layout |
| 작업공간 | workspace |
| 브레드크럼 | breadcrumb |
| 북마크 | bookmark |
| 프로젝트 전환 | project switch |
| 조직 | organization |
| 스케줄러 | scheduler |
| 번역 관리 | translation management |
| 임베딩 | embedding |
| 차터 | charter |
| 세션 | session |
| 사전 조건 | pre-condition |
| 기대 결과 | expected result |
| 실제 결과 | actual result |
| 빈 상태 | empty state |
| 정본 | canonical source |
| 매뉴얼 N절 | manual section N |
| 01 5.2절 | 01 section 5.2 |
| 갱신 규칙 | update rules |

Section cross-references use `section N`, never `§`. `S4 → S6` stays as is.

---

## 7. Register

Write plain declarative present tense, matching the Korean 한다체: "The screen shows
four states." Not "The screen will show" or "You should see". Describe what is, not
what a user should do — the manual covers procedure, this set covers structure.

Avoid filler that the source does not have: no "it is important to note", no "as
mentioned above", no "simply", no "please". Keep sentences the length of the source
sentences; do not merge or split paragraphs.
