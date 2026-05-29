## 0. 세션 로그 (최우선)

**매 세션 시작 시 `.claude/SESSION_LOG.md` 를 읽는다.**

- 의미 있는 작업 단계가 끝날 때마다 SESSION_LOG를 업데이트한다.
- 세션 종료 전 반드시 현재 상태·다음 할 일·이력을 최신화한다.
- 상세 작업 기록은 `.claude/sessions/YYYY-MM-DD.md` 참조.

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

### 📖 Agent Instructions

All detailed project overview, architecture, development workflow, and testing guidelines are maintained in the unified agent guide:

**👉 [AGENTS.md](@AGENTS.md)**

### 🚀 Quick Start for Claude

- **Project Root**: Always run commands from the project root.
- **Language**: Always respond in **Korean (한국어)**.
- **MCP Servers**: This project uses several MCP servers (e.g., Playwright). See [AGENTS.md](@AGENTS.md) for details.
- **Testing**: Use `npm test` for frontend and `./gradlew test` for backend.
- **Starting App**: Use `./gradlew bootRun` (requires Docker services).

---

## 하네스: testcasecraft API → MCP Server

**목표:** Spring Boot REST API(49개 컨트롤러)를 LLM 클라이언트(Claude Desktop/Cline/Cursor)가 자연어로 호출할 수 있는 MCP 서버로 변환한다. 인벤토리→설계→구현→검증의 4단계 파이프라인을 4명의 전문 에이전트가 협업하여 실행한다.

**트리거:** 다음 요청 시 `testcasecraft-mcp-orchestrator` 스킬을 사용하라.

- "API를 MCP로 만들어줘", "MCP 서버 만들어줘", "MCP로 노출해줘"
- "MCP 다시 만들어줘", "MCP 수정해줘", "MCP 도구 추가"
- "MCP 검증해줘", "MCP 재실행", "MCP 업데이트"

단순 질문("MCP가 뭐야?", "어떻게 동작해?")은 직접 응답 가능.

**변경 이력:**

| 날짜       | 변경 내용                                                                           | 대상                                                                                                                     | 사유                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-21 | 초기 구성 (에이전트 5명 + 스킬 6개)                                                 | 전체                                                                                                                     | 사용자 요청: API들을 MCP로 변환                                                                                                                                                                                                                                                                                                                            |
| 2026-05-21 | Phase 1 MCP 서버 빌드 완료                                                          | mcp-server/ (40개 도구)                                                                                                  | 433개 엔드포인트 인벤토리 → 40개 도구로 압축, Stdio transport, JWT 자동 갱신                                                                                                                                                                                                                                                                               |
| 2026-05-21 | QA v2 + errors.ts axios 에러 처리 패치                                              | mcp-server/src/errors.ts                                                                                                 | auth_login이 인터셉터 우회하여 백엔드 다운 시 빈 메시지 반환 → formatError에 isAxiosError 분기 추가, 모든 axios 호출에서 일관된 사용자 안내                                                                                                                                                                                                                |
| 2026-05-21 | ID 스키마 일괄 UUID 정렬 (9개 도구)                                                 | mcp-server/src/tools/{dashboard,jira,organization,project,rag,testcase,testexecution,testplan,testresult,testsession}.ts | 백엔드는 UUID(string) 사용하나 zod 스키마가 `z.number().int().positive()`로 정의되어 모든 ID 기반 호출 거부 → `z.string().min(1)`로 일괄 변환                                                                                                                                                                                                              |
| 2026-05-21 | testcase 도구에 누락 DTO 필드 추가                                                  | mcp-server/src/tools/testcase.ts                                                                                         | TestCaseDto의 steps, expectedResults, preCondition, postCondition, isAutomated, executionType, testTechnique, tags, type, parentName이 zod 스키마에서 누락 → 백엔드 DTO 풀필드 정렬                                                                                                                                                                        |
| 2026-05-21 | TestStepInput 필드명 정렬                                                           | mcp-server/src/tools/testcase.ts                                                                                         | 임시 정의(`sequence`, `action`)가 백엔드 `TestStepDto`(stepNumber, description=NotBlank)와 불일치 → 실제 DTO 필드명으로 교체                                                                                                                                                                                                                               |
| 2026-05-21 | testcase_list URL 경로 수정                                                         | mcp-server/src/tools/testcase.ts                                                                                         | `/api/projects/{id}/testcases`(존재하지 않음) → `/api/testcases/project/{projectId}`(실제 백엔드 엔드포인트)                                                                                                                                                                                                                                               |
| 2026-05-21 | testcasecraft-mcp-tools 스킬에 DTO 정합성 검증 섹션 추가                            | .claude/skills/testcasecraft-mcp-tools/SKILL.md                                                                          | 스키마 mismatch 2회 반복(integer/UUID, NotBlank 누락) → zod 생성 전 백엔드 DTO 풀필드 정렬 절차 추가 (Phase 7-4 진화)                                                                                                                                                                                                                                      |
| 2026-05-21 | testcasecraft-mcp-test 스킬에 경계면 정합성 검증 Step 5.5 추가                      | .claude/skills/testcasecraft-mcp-test/SKILL.md                                                                           | QA가 ID 타입·DTO 필드·URL 경로의 정적 mismatch를 못 잡고 사용자 첫 호출에서 실패 → CRUD 라운드트립 전 정적 비교 단계 신설 (Phase 7-4 진화)                                                                                                                                                                                                                 |
| 2026-05-22 | testcase 첨부파일 도구 4개 신규 추가                                                | mcp-server/src/tools/testcase_attachment.ts                                                                              | 긴 출력·로그·증빙을 본문 대신 첨부로 분리해야 한다는 사용자 요청 → `testcase_attachment_upload/list/get/delete` (`/api/testcase-attachments` 매핑) 노출                                                                                                                                                                                                    |
| 2026-05-22 | form-data 의존성 명시화 + tools/index.ts 등록                                       | mcp-server/package.json, mcp-server/src/tools/index.ts, mcp-server/src/index.ts                                          | multipart 업로드를 위해 transitive `form-data`를 `dependencies`에 직접 선언, attachment 도구 export 및 ListTools/CallTool 핸들러에 등록                                                                                                                                                                                                                    |
| 2026-05-22 | testcasecraft-mcp-tools 스킬에 멀티파트 업로드 패턴 + 확장자 화이트리스트 정책 추가 | .claude/skills/testcasecraft-mcp-tools/SKILL.md                                                                          | 파일 업로드 도구 작성 시 form-data 사용·`maxContentLength: Infinity`·사전 확장자 검증 패턴이 본문에 없어 동일 함정 반복 가능 → 운영 중 발견된 백엔드 화이트리스트(txt/csv/json/md/pdf/log/png/jpg/jpeg/gif/xls/xlsx/doc/docx) 명시 (Phase 7-4 진화)                                                                                                        |
| 2026-05-22 | testcasecraft-mcp-test 스킬에 Step 7.5 첨부 멀티파트 라운드트립 추가                | .claude/skills/testcasecraft-mcp-test/SKILL.md                                                                           | 새로 추가된 attachment 도구의 QA 절차 부재 → 허용 확장자 검증·정상/거부/대용량/권한 시나리오를 별도 Step으로 분리                                                                                                                                                                                                                                          |
| 2026-05-22 | 프로젝트 스킬 7개 `testcasecraft-` prefix로 일괄 rename                             | .claude/skills/, .claude/agents/, CLAUDE.md, \_workspace/                                                                | 글로벌·다른 프로젝트 스킬과 네임스페이스 충돌 방지 + testcasecraft 도메인 식별성 향상. 일반 이름(`mcp-tool-generator` 등)에서 `testcasecraft-mcp-tools` 형식으로 통일. markdown-table-parsing은 글로벌에서 프로젝트로 이동하여 `testcasecraft-markdown-table-parsing`으로 편입 (이 시트 파싱 로직은 testcasecraft 시트 import 사례에서 학습된 도메인 자산) |
| 2026-05-22 | testcasecraft-mcp-tools 보일러플레이트를 references/server-boilerplate.md로 분리    | .claude/skills/testcasecraft-mcp-tools/{SKILL.md, references/server-boilerplate.md}                                      | SKILL.md가 516줄로 500줄 한도 초과 → package.json·tsconfig.json·src/index.ts·src/http-client.ts·src/errors.ts 등 코드 템플릿 5개를 references로 이동, SKILL.md는 워크플로우/결정 가이드만 유지 (319줄로 축소). 본문 상단에 references 포인터 추가                                                                                                          |
| 2026-05-22 | testcasecraft-mcp-tools에 stdio 클라이언트 보일러플레이트 추가 | .claude/skills/testcasecraft-mcp-tools/references/stdio-client-boilerplate.md | 199-case 임포트에서 만든 mcp-cli.mjs(단발 호출)·withMcpServer(일괄 호출)·두 인스턴스 동시 운영(TESTCASECRAFT_TOKEN_PATH) 패턴을 영구 자산화. CLI/스크립트에서 MCP를 직접 호출하는 새 사용 경로 명시. |

---

## 하네스: testcasecraft Sheet → 케이스 임포트

**목표:** Google Sheets/Excel 한 탭에서 테스트 케이스를 추출해 testcasecraft 프로젝트에 폴더 트리 + 케이스를 한 줄 명령으로 일괄 생성하고, xmlangel 스타일(```sql/```plsql fence, Expected/Actual 두 섹션, markdown list 메타, priority/isAutomated/tags, 멱등 태그)로 표준화한다. 199-case AgensSQL Extensions 임포트(2026-05-22)의 학습된 절차를 재사용 가능한 영구 자산으로 코드화.

**트리거:** 다음 요청 시 `testcasecraft-sheet-import-orchestrator` 스킬을 사용하라.

- "Google Sheets로 케이스 임포트해줘", "시트 ID와 프로젝트로 임포트", "엑셀 탭 통째로 임포트"
- "시트 임포트 다시 실행", "임포트 업데이트", "재실행 시트 임포트"
- "199개 케이스 임포트", "AgensSQL Extensions 탭 임포트"
- "시트에서 폴더 트리 만들고 케이스 채워줘"

단순 시트 파싱만 필요하면 `testcasecraft-sheet-import` 직접. 시트 없이 plan.json만 가지고 일괄 작업하면 `testcasecraft-bulk-operations` 직접.

**구성 (스킬 3개 + 기존 1개 보강):**

| 스킬 | 역할 |
|------|------|
| `testcasecraft-sheet-import-orchestrator` | 얇은 6-Phase 오케스트레이터 (Phase 0 컨텍스트 확인 포함) |
| `testcasecraft-sheet-import` | xlsx fetch + 컬럼 매핑(forward-fill) + DTO 빌드(fence/Expected/list) |
| `testcasecraft-bulk-operations` | 폴더+케이스 일괄 생성/업데이트, 멱등 태그(`bulk-vN`) 기반 재실행 |
| `testcasecraft-mcp-tools` (보강) | stdio JSON-RPC 클라이언트 보일러플레이트 (단발/일괄/두 인스턴스) |

**실행 모드:** 서브 에이전트 없음, 메인 LLM이 6단계를 순서대로 직접 실행. 단일 작업·병렬 이득 없음·팀 통신 오버헤드가 의미 없는 작업 특성.

**산출물 컨벤션:** `tmp/{YYYY-MM-DD}-{slug}/` 안에 `import-config.json` → `source.xlsx` → `extracted_cases.json` → `plan.json` → `import_result.json` → `README.md` 순으로 파일 기반 데이터 전달. 모든 단계 디버그·재실행 가능.

**변경 이력:**

| 날짜       | 변경 내용                                                                  | 대상                                                                                                                                                | 사유                                                                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-22 | 초기 구성 (스킬 3개 신설 + 기존 1개 보강)                                  | `.claude/skills/testcasecraft-{sheet-import-orchestrator,sheet-import,bulk-operations}/`, `.claude/skills/testcasecraft-mcp-tools/references/`      | 199-case AgensSQL Extensions 임포트 작업에서 만든 임시 스크립트(mcp-cli.mjs, bulk_create.mjs, xmlangel_reformat_v5.mjs, extract_tcs.py)와 시행착오(v1→v5)에서 학습된 포맷 규칙을 영구 자산화. 시트 파싱·DTO 빌드·일괄 작업·멱등 태그 정책을 책임 단위로 분리한 스킬 3개로 추출. |
| 2026-05-22 | testcase DTO 빌드 패턴 정형화 (fence 자동 감지, Expected/Actual 두 섹션)   | `.claude/skills/testcasecraft-sheet-import/references/dto-builder-patterns.md`                                                                      | PL/SQL(BEGIN/DECLARE)는 ```plsql, 일반 SQL은 ```sql 자동 fence. expected==actual이면 한 섹션 통합. description은 markdown list로 단일 \n GFM 줄바꿈 한계 회피. expectedResults(top)는 평문 ``` 코드블록으로 줄바꿈 보존.                                                       |
| 2026-05-22 | 멱등 태그 정책 표준화 (`{op}-vN`)                                          | `.claude/skills/testcasecraft-bulk-operations/references/idempotent-tag-policy.md`                                                                  | 199-case 작업의 v1→v5 진화 경험에서 도출. transform 적용 후 새 태그 추가하고 이전 버전 태그를 제거하는 cleanup 룰. 부분 실패 후 재실행이 "중간부터" 자동 재개되도록 skip 검사 자동화.                                                                                          |
| 2026-05-22 | tmp/2026-05-22-extensions-mcp-import/ 보존 결정                            | tmp/                                                                                                                                                | 새 스킬들의 live 예제로 보존. xlsx/extracted_cases.json/plan-equivalent/import_result.json/스크립트 v1~v5 모두 git-ignore된 디렉터리에 남겨 다음 임포트 시 빠른 참조 가능.                                                                                                      |

---

## 하네스: 매뉴얼 캡처 & 동기화

**목표:** testcasecraft 사용자 매뉴얼(`docs/manual/new/USER_MANUAL.md` + `docs/manual/*.md`)을 코드·UI 변경에 맞춰 지속 동기화한다. Playwright Python으로 스크린샷을 재캡처하고, 앱의 실제 라우트 vs 매뉴얼이 언급한 경로 커버리지를 감사하며, manual-writer-agent가 본문을 부분 패치한다. **매뉴얼은 73장 고정이 아니라 점진적으로 성장하는 자산** — 새 페이지/기능 추가 시 STEPS 와 §X-N 섹션을 함께 신설하여 시스템이 매뉴얼과 같이 진화한다.

**트리거:** "매뉴얼 갱신", "사용자 매뉴얼 업데이트", "매뉴얼 캡처 + 동기화", "스크린샷 + 본문 같이", "릴리즈 전 매뉴얼 점검", "이미지 다시 찍고 본문도", "새 페이지 매뉴얼에 추가", "manual 워크플로우 다시" 등 캡처+동기화 통합 의도 시 `manual-capture-orchestrator` 스킬을 사용하라. 캡처만 단독은 `manual-capture`, 본문만 단독은 `manual-sync`, 단순 페이지 캡처(매뉴얼 무관)는 직접 Playwright.

**구성:**
- 오케스트레이터: `.claude/skills/manual-capture-orchestrator/SKILL.md` — 5-Phase 흐름(컨텍스트→환경→캡처+감사→STEPS확장→본문동기화→검증)
- 캡처 스킬: `.claude/skills/manual-capture/SKILL.md` (+ `references/steps-extension.md`)
- 동기화 스킬: `.claude/skills/manual-sync/SKILL.md`
- 본문 패치 에이전트: `.claude/agents/manual-writer-agent.md` (general-purpose, opus)
- 실제 캡처 엔진: `scripts/manual_capture.py` (Playwright Python, 검증된 530줄)
- 산출물 컨벤션: `_workspace/manual-capture/run-{YYYY-MM-DD}/{capture_and_audit.log, audit_report.txt, steps_added.md, manual_diff.md, verification.md}`

**실행 모드:** 메인 LLM 단독(Phase 0~2, 4~5) + manual-writer-agent 서브 에이전트(Phase 3, 선택). 결정론적 스크립트가 중심이라 팀 통신 오버헤드 없는 가벼운 구조.

**감사 매처 규약:** 매뉴얼이 백틱 안에 명시한 경로(`/projects`, `/dashboard`)만 추출 → 앱 크롤 결과와 diff. 본문이 다루더라도 백틱 없으면 누락으로 보고됨 — manual-sync 가 URL 한 줄 보강으로 해소.

**변경 이력:**

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-28 | 초기 구성 (스킬 3개 + 에이전트 1명 + scripts/manual_capture.py 자산화) | `.claude/skills/manual-{capture-orchestrator,capture,sync}/`, `.claude/agents/manual-writer-agent.md`, `scripts/manual_capture.py` | 2026-05-27 매뉴얼 v1 캡처 시 사용한 일회성 Playwright Python 스크립트를 영구 자산화. 73 STEPS 정의 + JWT(localStorage) Bearer 첨부 + storage_state 재사용 + SPA networkidle 회피 + 감사 모드(매뉴얼 백틱 경로 vs 앱 크롤 diff)를 검증 완료. 매뉴얼이 점진적으로 성장하도록 Phase 3 에서 신규 페이지 발견 시 STEPS 확장 + §X-N 섹션 신설을 함께 제안하는 흐름 포함. 실행 검증: 캡처 8장 OK + 감사 17 경로 추출 OK. |
