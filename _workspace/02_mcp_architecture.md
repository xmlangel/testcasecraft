# MCP Architecture Decision — testcasecraft

**Date:** 2026-05-21
**Input:** `_workspace/01_api_inventory.json` (49 controllers, 433 endpoints)

---

## 1. 트랜스포트 결정

| Phase                   | 트랜스포트        | 사유                                                                 |
| ----------------------- | ----------------- | -------------------------------------------------------------------- |
| **Phase 1 (이번 작업)** | **Stdio**         | 단일 사용자 PoC. Claude Desktop/Cline/Cursor 직접 연결. 의존성 최소. |
| Phase 2 (추후)          | + Streamable HTTP | 팀 공유, 멀티 유저 인증 분리                                         |

**근거:** 433개 엔드포인트 중 92.6%가 인증 필요. Stdio 모드에서 단일 사용자가 자기 토큰을 로컬 파일에 캐싱하는 패턴이 가장 단순하고 안전.

---

## 2. 도구 그룹화 매트릭스

**원칙:** 433 엔드포인트 → 약 40개 MCP 도구로 압축. CRUD 통합 + 검색/단건 분리 + 위험 도구는 Phase 2로.

### Phase 1 MCP 도구 (40개)

#### `auth` (4개)

| 도구           | 백엔드 매핑              | 설명                         |
| -------------- | ------------------------ | ---------------------------- |
| `auth_login`   | POST `/api/auth/login`   | username/password → JWT 저장 |
| `auth_logout`  | (로컬만)                 | 토큰 파일 삭제               |
| `auth_status`  | (로컬만)                 | 로그인 상태/만료 조회        |
| `auth_refresh` | POST `/api/auth/refresh` | 수동 갱신 (자동도 작동)      |

#### `project` (4개)

| 도구                       | 백엔드 매핑                      |
| -------------------------- | -------------------------------- |
| `project_list`             | GET `/api/projects`              |
| `project_get`              | GET `/api/projects/{id}`         |
| `project_create_or_update` | POST/PUT `/api/projects`         |
| `project_members`          | GET `/api/projects/{id}/members` |

#### `organization` (3개)

| 도구                     | 백엔드 매핑              |
| ------------------------ | ------------------------ |
| `org_list_organizations` | GET `/api/organizations` |
| `org_list_groups`        | GET `/api/groups`        |
| `org_list_users`         | GET `/api/users`         |

#### `testcase` (6개)

| 도구                        | 백엔드 매핑                        |
| --------------------------- | ---------------------------------- |
| `testcase_list`             | GET `/api/projects/{id}/testcases` |
| `testcase_get`              | GET `/api/testcases/{id}`          |
| `testcase_search`           | GET `/api/testcases/search`        |
| `testcase_create_or_update` | POST/PUT `/api/testcases`          |
| `testcase_move`             | POST `/api/testcases/{id}/move`    |
| `testcase_versions`         | GET `/api/testcases/{id}/versions` |

#### `testplan` (3개)

| 도구                        | 백엔드 매핑               |
| --------------------------- | ------------------------- |
| `testplan_list`             | GET `/api/testplans`      |
| `testplan_get`              | GET `/api/testplans/{id}` |
| `testplan_create_or_update` | POST/PUT `/api/testplans` |

#### `testexecution` (3개)

| 도구                          | 백엔드 매핑                             |
| ----------------------------- | --------------------------------------- |
| `testexecution_list`          | GET `/api/testexecutions`               |
| `testexecution_get`           | GET `/api/testexecutions/{id}`          |
| `testexecution_record_result` | POST `/api/testexecutions/{id}/results` |

#### `testresult` (3개)

| 도구                    | 백엔드 매핑                         |
| ----------------------- | ----------------------------------- |
| `testresult_list`       | GET `/api/test-results`             |
| `testresult_get`        | GET `/api/test-results/{id}`        |
| `testresult_report_get` | GET `/api/test-result-reports/{id}` |

#### `testsession` (2개)

| 도구               | 백엔드 매핑                   |
| ------------------ | ----------------------------- |
| `testsession_list` | GET `/api/test-sessions`      |
| `testsession_get`  | GET `/api/test-sessions/{id}` |

#### `dashboard` (3개)

| 도구                     | 백엔드 매핑                        |
| ------------------------ | ---------------------------------- |
| `dashboard_overview`     | GET `/api/dashboard`               |
| `dashboard_by_project`   | GET `/api/dashboard/projects/{id}` |
| `dashboard_test_metrics` | GET `/api/dashboard/metrics`       |

#### `jira` (3개)

| 도구               | 백엔드 매핑                       |
| ------------------ | --------------------------------- |
| `jira_status`      | GET `/api/jira/status`            |
| `jira_sync`        | POST `/api/jira/integration/sync` |
| `jira_list_issues` | GET `/api/jira/issues`            |

#### `rag` (3개)

| 도구                     | 백엔드 매핑                       |
| ------------------------ | --------------------------------- |
| `rag_chat`               | POST `/api/rag/chat`              |
| `rag_list_conversations` | GET `/api/rag/conversations`      |
| `rag_get_conversation`   | GET `/api/rag/conversations/{id}` |

#### `system` (3개)

| 도구             | 백엔드 매핑                  |
| ---------------- | ---------------------------- |
| `system_health`  | GET `/api/monitoring/health` |
| `system_version` | GET `/api/version`           |
| `system_config`  | GET `/api/config`            |

### Phase 2로 미루는 항목 (위험/관리자 전용)

- 모든 `DELETE` 도구 (안전장치 후 도입)
- `admin_*` 도구 (메일/LLM/스케줄러 설정)
- 권한 관리 (UserPermission 21 API)
- 일괄/배치 작업 (jira batch, junit batch)
- 멀티파트 업로드 (attachment 도구들 — 별도 보안 검토 필요)
- 번역 관리 (TranslationManagement 22 API)

**총 Phase 1 도구 수: 40개** (50개 한도 내)

---

## 3. 인증 흐름

### 로그인 응답 형식 (확인됨)

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "xyz123...",
  "tokenType": "Bearer",
  "accessTokenExpiration": 3600000,
  "refreshTokenExpiration": 604800000,
  "user": { ... }
}
```

### 토큰 갱신 응답

```json
요청: POST /api/auth/refresh, body: {"refreshToken": "..."}
응답: {"accessToken": "...", "tokenType": "Bearer", "accessTokenExpiration": ...}
```

### 흐름

```
[Stdio 모드 — 단일 사용자]

1. 사용자 자연어 → LLM이 auth_login 호출
2. auth_login(username, password)
   → POST /api/auth/login
   → 응답의 accessToken/refreshToken/expirations를 ~/.testcasecraft-mcp/token.json에 저장 (mode 0600)
3. 다른 도구 호출 시 Axios 인터셉터가 token.json에서 accessToken 읽어 Authorization: Bearer ... 자동 주입
4. 401 응답 시:
   a. refreshToken으로 POST /api/auth/refresh 자동 호출
   b. 새 accessToken을 token.json에 저장 (refreshToken은 만료 안 됐으면 보존)
   c. 원 요청 재시도 (X-Retried 헤더로 무한 루프 방지)
   d. refresh도 실패 시 token.json 삭제 + "auth_login을 다시 호출하세요" 메시지
5. auth_logout: token.json 삭제 (백엔드 호출 안 함, 단순 로컬 토큰 무효화)
```

### 토큰 저장 위치

- 기본: `~/.testcasecraft-mcp/token.json`
- 환경변수 `TESTCASECRAFT_TOKEN_PATH`로 변경 가능
- 디렉토리 권한 0700, 파일 권한 0600

---

## 4. 에러 응답 표준

| HTTP    | MCP 응답                                          | 사용자 메시지                                                              |
| ------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| 200/201 | `{ content: [json], isError: false }`             | (정상 결과)                                                                |
| 400     | `McpError(InvalidParams)`                         | "입력 검증 실패: {백엔드 메시지}"                                          |
| 401     | refresh 시도 → 실패 시 `McpError(InvalidRequest)` | "로그인이 필요합니다. auth_login을 호출하세요."                            |
| 403     | `McpError(InvalidRequest)`                        | "권한이 부족합니다. 관리자 권한이 필요할 수 있습니다."                     |
| 404     | `McpError(InvalidRequest)`                        | "요청한 리소스를 찾을 수 없습니다: {url}"                                  |
| 422     | `McpError(InvalidParams)`                         | "입력 검증 실패: {필드별 메시지}"                                          |
| 500     | `McpError(InternalError)`                         | "백엔드 오류: {detail}. 잠시 후 다시 시도하세요."                          |
| Network | `McpError(InternalError)`                         | "백엔드에 연결할 수 없습니다. ./gradlew bootRun이 실행 중인지 확인하세요." |

Zod 검증 실패는 백엔드 호출 전 차단 → `McpError(InvalidParams)` + 필드별 에러 목록.

---

## 5. 페이지네이션

리스트 도구 표준 입력:

```typescript
{
  limit: z.number().int().min(1).max(200).default(50),
  page: z.number().int().min(0).default(0),
  // 또는 cursor 기반
}
```

응답이 10MB 초과 시 limit를 자동 축소 + 안내 메시지.

---

## 6. 사용자 경험 시나리오

### 시나리오 A: 신규 사용자 설치

```
1. 사용자: git clone testcasecraft, cd mcp-server, npm install && npm run build
2. 사용자: Claude Desktop config.json에 추가:
   {
     "mcpServers": {
       "testcasecraft": {
         "command": "node",
         "args": ["/abs/path/to/mcp-server/dist/index.js"],
         "env": { "TESTCASECRAFT_BASE_URL": "http://localhost:8080" }
       }
     }
   }
3. Claude Desktop 재시작
4. 사용자(Claude UI): "testcasecraft에 admin/admin123으로 로그인해줘"
   → LLM이 auth_login 도구 선택, 호출 → 토큰 저장 → "로그인 성공"
5. 사용자: "프로젝트 목록 보여줘"
   → project_list 호출 → 결과 표시
6. 사용자: "ICT-138 프로젝트의 테스트케이스 트리"
   → testcase_list(projectId=...) 호출
```

### 시나리오 B: 토큰 만료 자동 복구

```
1. 사용자: "테스트케이스 100번 보여줘"
2. testcase_get(id=100) → 401 (accessToken 만료)
3. MCP가 refreshToken으로 자동 갱신 → 새 accessToken 저장
4. testcase_get 자동 재시도 → 200
5. 사용자에게는 결과만 보임 (재인증 투명)
```

### 시나리오 C: 권한 부족 안내

```
1. 사용자: "admin 사용자 권한 변경해줘"
2. LLM이 적절한 도구 없음을 발견 (Phase 1에는 권한 관리 도구 없음)
3. LLM이 사용자에게 "이 기능은 Phase 1에 포함되지 않았습니다. 백엔드 UI에서 처리하세요" 안내
```

---

## 7. 위험 도구 명단 (Phase 2 격리)

| 도구                  | 위험                    | 안전장치 (Phase 2)            |
| --------------------- | ----------------------- | ----------------------------- |
| `*_delete` 모든 삭제  | 데이터 영구 손실        | `confirm: true` 파라미터 강제 |
| `admin_mail_settings` | 시스템 전체 영향        | ROLE_ADMIN 사용자만           |
| `admin_llm_config`    | LLM 응답 품질/비용 영향 | ROLE_ADMIN + 환경변수 플래그  |
| `jira_batch_sync`     | 대량 외부 호출          | 사용자 확인 단계              |
| `junit_bulk_import`   | 대량 데이터 변경        | 사전 dry-run 모드             |

Phase 1은 **읽기 위주 + 안전한 생성/수정만** 노출.

---

## 8. 구현 가이드 (mcp-implementer-agent를 위한 사양)

### 디렉토리

```
mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
└── src/
    ├── index.ts                 # MCP 서버 entry (Stdio transport)
    ├── http-client.ts           # Axios + 인터셉터 (토큰 자동 주입, 401 자동 refresh)
    ├── token-store.ts           # ~/.testcasecraft-mcp/token.json I/O
    ├── errors.ts                # formatError 헬퍼
    ├── schemas.ts               # 공용 Zod 스키마 (pagination 등)
    └── tools/
        ├── index.ts             # 모든 도구 export
        ├── auth.ts              # 4개
        ├── project.ts           # 4개
        ├── organization.ts      # 3개
        ├── testcase.ts          # 6개
        ├── testplan.ts          # 3개
        ├── testexecution.ts     # 3개
        ├── testresult.ts        # 3개
        ├── testsession.ts       # 2개
        ├── dashboard.ts         # 3개
        ├── jira.ts              # 3개
        ├── rag.ts               # 3개
        └── system.ts            # 3개
```

### 의존성

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "axios": "^1.7.0",
    "zod": "^3.23.0",
    "zod-to-json-schema": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0"
  }
}
```

### 환경변수

- `TESTCASECRAFT_BASE_URL` (기본: http://localhost:8080)
- `TESTCASECRAFT_TOKEN_PATH` (기본: ~/.testcasecraft-mcp/token.json)
- `TESTCASECRAFT_TIMEOUT_MS` (기본: 30000)

### 도구 description 작성 원칙 (LLM 트리거 정확도용)

모든 도구 description은 1) 무엇을 하는지 2) 언제 사용하는지 (자연어 트리거 단서) 3) 주요 입력 의미 4) 결과 형식을 포함.

예시:

```
testcase_list:
"프로젝트의 테스트 케이스 트리/목록을 조회한다. '테스트 케이스 목록 보여줘', 'ICT-138의 테스트케이스', '프로젝트 X의 TC 트리' 같은 요청 시 사용. projectId 필수. 응답은 트리 구조 JSON."
```

---

## 9. 다음 단계

mcp-implementer-agent가 이 문서를 입력으로:

1. `mcp-server/` 디렉토리 스캐폴딩
2. 40개 도구 구현 (그룹별 파일)
3. `npm install && npm run build` 통과
4. integration-tester-agent에 incremental QA 요청
