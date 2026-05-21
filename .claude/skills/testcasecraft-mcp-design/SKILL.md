---
name: testcasecraft-mcp-design
description: REST API 인벤토리를 받아 MCP 서버 아키텍처를 결정하는 가이드. 트랜스포트(Stdio vs Streamable HTTP) 선택, 도구 그룹화(100+ 엔드포인트 → 30~40개 도구), 인증 흐름(JWT 캐싱, 자동 재로그인), 에러 표준화, 페이지네이션, 멀티파트 정책, 사용자 경험 시나리오(Claude Desktop/Cline/팀 공유)를 설계할 때 반드시 사용한다. mcp-architect-agent가 사용하는 핵심 스킬.
---

# MCP Server Design

REST API를 MCP로 노출할 때의 핵심 의사결정 가이드. 코드 작성 전에 반드시 결정해야 할 항목들을 다룬다.

## 1. 트랜스포트 결정

| 옵션                | 적합한 경우                                            | 인증                     | 배포                      |
| ------------------- | ------------------------------------------------------ | ------------------------ | ------------------------- |
| **Stdio**           | 개인용, 로컬, 단일 사용자, Claude Desktop/Cursor/Cline | 토큰을 로컬 파일에 캐싱  | npm 패키지 또는 git clone |
| **Streamable HTTP** | 팀 공유, 멀티 유저, 원격 호출, CI 통합                 | 헤더 기반 (Bearer/OAuth) | 컨테이너 배포             |

**testcasecraft 권장:** Phase 1은 **Stdio**. 빠른 PoC와 1인 사용에 최적. Phase 2에서 HTTP 추가.

이유: Stdio는 의존성이 거의 없고(노드 런타임만), Claude Desktop이 자식 프로세스로 띄워 사용자 환경 변수와 격리된다. HTTP는 사용자 인증 분리, CORS, 인프라가 필요해 PoC 단계엔 과하다.

## 2. 도구 그룹화 전략

LLM은 도구가 50개를 넘으면 선택 정확도가 급격히 떨어진다. 100+ 엔드포인트라면 그룹화가 필수.

### 그룹화 패턴

**❌ 안티패턴: 엔드포인트 1:1**

```
GET /api/testcases → mcp_get_testcases
POST /api/testcases → mcp_post_testcase
PUT /api/testcases/{id} → mcp_put_testcase
...  (50+ 도구가 됨)
```

**✅ 권장 패턴: 액션 통합**

```
testcase_list(projectId, search?, limit?, cursor?)
  → GET /api/projects/{projectId}/testcases 또는 search/page
testcase_get(id)
  → GET /api/testcases/{id}
testcase_create_or_update(id?, data)
  → id 있으면 PUT, 없으면 POST
testcase_delete(id, force?)
  → DELETE /api/testcases/{id}
testcase_move(id, targetParentId)
  → POST /api/testcases/{id}/move
```

### 그룹화 기준

1. **자원 중심**: 같은 리소스(testcase, project, testplan)면 한 그룹
2. **CRUD 통합**: create/update를 한 도구로, id 유무로 분기
3. **검색 vs 단건 분리**: list와 get은 응답 형식이 다르므로 분리
4. **관리자 도구는 별도 그룹**: `admin_*` 접두사로 시각적 구분
5. **위험 작업은 명시적 옵션**: `delete(id, confirm=true)` 처럼 안전장치

### testcasecraft 그룹화 (예시)

| 그룹                | 도구 (대략 30~35개)                                                                   |
| ------------------- | ------------------------------------------------------------------------------------- |
| `auth`              | login, logout, status, refresh                                                        |
| `project`           | list, get, create_or_update, delete, members                                          |
| `testcase`          | list, get, search, create_or_update, delete, move, attachment_upload, attachment_list |
| `testplan`          | list, get, create_or_update, delete, add_cases, execute                               |
| `testexecution`     | list, get, record_result, list_by_plan                                                |
| `testresult_report` | get, list_by_project, export                                                          |
| `dashboard`         | overview, by_project, by_user                                                         |
| `org`               | list_groups, list_users, list_organizations                                           |
| `rag`               | chat, chat_history, list_documents                                                    |
| `jira`              | sync_status, list_issues, link_to_testcase                                            |
| `admin`             | mail_settings, llm_config, scheduler_config (high risk)                               |

## 3. 인증 흐름 설계

### Stdio 모드 (단일 사용자)

```
1. 사용자가 첫 호출 시 LLM이 자연어로 "로그인" 의도 → auth_login 호출
2. auth_login(username, password) → POST /api/auth/login
3. 응답의 accessToken/refreshToken을 ~/.testcasecraft-mcp/token.json에 저장
4. 이후 모든 도구는 token.json을 읽어 Authorization 헤더 자동 추가
5. 401 응답 시 refreshToken으로 재발급 시도, 실패 시 "다시 로그인하세요" 메시지
```

**보안:** 토큰 파일은 권한 0600으로 저장. 환경 변수 `TESTCASECRAFT_TOKEN_PATH`로 위치 변경 가능.

### HTTP 모드 (멀티 유저)

```
1. 클라이언트가 MCP 호출 시 Authorization 헤더로 사용자 토큰 전달
2. MCP 서버는 헤더의 토큰을 그대로 백엔드에 전달 (passthrough)
3. 사용자별 토큰 캐싱 없음 (stateless)
```

상세 코드 패턴은 `testcasecraft-mcp-auth` 스킬 참조.

## 4. 에러 응답 표준화

| 백엔드 응답       | MCP 응답                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| 200/201           | `{ content: [...], isError: false }`                                                                     |
| 400 (Bad Request) | `McpError(InvalidParams, "...")` (Zod에서 잡으면 더 좋음)                                                |
| 401               | `{ content: [{type:'text', text:'로그인이 필요합니다. auth_login을 먼저 호출하세요.'}], isError: true }` |
| 403               | `{ ... text:'권한이 부족합니다. 관리자 권한이 필요한 작업입니다.', isError: true }`                      |
| 404               | `{ ... text:'요청한 {리소스명}을 찾을 수 없습니다.', isError: true }`                                    |
| 422 (Validation)  | `{ ... text:'입력 검증 실패: {필드별 메시지}', isError: true }`                                          |
| 500/네트워크      | `{ ... text:'백엔드 오류: {detail}. 잠시 후 다시 시도하세요.', isError: true }`                          |

원칙: 사용자(혹은 LLM)가 다음 행동을 알 수 있도록 메시지에 다음 단계를 포함.

## 5. 페이지네이션

리스트 도구 입력:

```typescript
{
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),  // base64 인코딩된 next page token
  ...filters
}
```

응답:

```json
{
  "items": [...],
  "nextCursor": "abc..." | null,
  "total": 1234
}
```

10MB가 넘는 응답은 자동으로 절단하고 nextCursor 안내.

## 6. 멀티파트 업로드

`TestCaseAttachmentController` 같은 업로드 도구는 MCP에서 다음과 같이 노출:

```typescript
testcase_attachment_upload(testcaseId, filePath, description?)
```

`filePath`는 사용자 로컬 절대 경로. MCP 서버가 파일을 읽어 multipart로 백엔드에 전송. 보안상 파일 크기/확장자 제한.

## 7. 사용자 경험 시나리오

### 시나리오 A: 신규 사용자 첫 설치

```
1. user> git clone <mcp-server-repo> && cd mcp-server && npm install && npm run build
2. user> 자신의 Claude Desktop config에 추가:
   {
     "mcpServers": {
       "testcasecraft": {
         "command": "node",
         "args": ["/path/to/mcp-server/dist/index.js"],
         "env": { "TESTCASECRAFT_BASE_URL": "http://localhost:8080" }
       }
     }
   }
3. Claude Desktop 재시작
4. user> "testcasecraft에 admin/admin123으로 로그인해줘"
   → Claude가 auth_login 도구 호출
5. user> "ICT-138 프로젝트의 테스트케이스 트리 보여줘"
   → testcase_list 도구 호출
```

### 시나리오 B: 토큰 만료 자동 복구

```
1. user> "테스트케이스 생성해줘"
2. MCP → POST → 401
3. MCP → refresh 시도 → 성공
4. MCP → 원 요청 재시도 → 200
5. user에게 결과만 반환 (재인증은 투명하게)
```

### 시나리오 C: 팀 공유 (Phase 2 HTTP)

```
1. 운영자: docker run -p 9000:9000 testcasecraft-mcp:latest
2. 팀원: Claude Desktop config에 url: http://mcp.team.local:9000/mcp
3. 팀원별 본인의 JWT를 Authorization 헤더로 전달
4. MCP는 stateless로 동작, 사용자별 격리
```

## 8. 단계적 배포 권장

| Phase    | 트랜스포트        | 도구                                      | 사용자      |
| -------- | ----------------- | ----------------------------------------- | ----------- |
| 1 (PoC)  | Stdio             | 읽기 전용 (list/get/dashboard) + auth     | 개발자 본인 |
| 2 (Beta) | Stdio             | + 쓰기 도구 (create/update)               | 팀 내부     |
| 3 (Prod) | + Streamable HTTP | + 위험 도구 (delete, admin) with 안전장치 | 팀 전체     |

## 산출물

`_workspace/02_mcp_architecture.md`로 모든 결정사항을 문서화. 다음 섹션 필수:

1. 트랜스포트 결정 + 사유
2. 도구 그룹화 매트릭스 (전체 도구 명단)
3. 인증 흐름 다이어그램
4. 에러 응답 표준
5. 사용자 시나리오 3가지 이상
6. Phase별 범위
7. 위험 도구 명단과 안전장치

## 참고

- 인증 코드 패턴: `testcasecraft-mcp-auth` 스킬
- 도구 생성 패턴: `testcasecraft-mcp-tools` 스킬
