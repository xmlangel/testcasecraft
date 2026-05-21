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
