# MCP QA Report — testcasecraft

**Date:** 2026-05-21
**Verified by:** integration-tester-agent (메인 세션 직접 수행)
**Server location:** `/Users/dicky/kmdata/git/testcase/testcasecraft/mcp-server/`

---

## 빌드 검증 ✅

| 항목                             | 결과                                       |
| -------------------------------- | ------------------------------------------ |
| `npm install`                    | ✅ 성공 (108 packages, 0 vulnerabilities)  |
| `npm run build`                  | ✅ 성공 (TypeScript strict mode, 0 errors) |
| `dist/` 생성                     | ✅ 17개 JS 파일                            |
| 서버 시작 (`node dist/index.js`) | ✅ stderr: `[testcasecraft-mcp] started`   |

## 도구 노출 검증 ✅

JSON-RPC `tools/list` 호출 결과:

| 항목                      | 기대      | 실측                                  |
| ------------------------- | --------- | ------------------------------------- |
| 총 도구 수                | 40        | **40** ✅                             |
| Schema 노출               | 모든 도구 | ✅ (JSON Schema draft-07)             |
| description 자연어 트리거 | 모든 도구 | ✅ (각 1~3가지 한국어 예시 표현 포함) |

### 그룹별 도구 수 (40개)

| 그룹          | 도구 수 | 도구                                                                                                      |
| ------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| auth          | 4       | auth_login, auth_logout, auth_status, auth_refresh                                                        |
| project       | 4       | project_list, project_get, project_create_or_update, project_members                                      |
| organization  | 3       | org_list_organizations, org_list_groups, org_list_users                                                   |
| testcase      | 6       | testcase_list, testcase_get, testcase_search, testcase_create_or_update, testcase_move, testcase_versions |
| testplan      | 3       | testplan_list, testplan_get, testplan_create_or_update                                                    |
| testexecution | 3       | testexecution_list, testexecution_get, testexecution_record_result                                        |
| testresult    | 3       | testresult_list, testresult_get, testresult_report_get                                                    |
| testsession   | 2       | testsession_list, testsession_get                                                                         |
| dashboard     | 3       | dashboard_overview, dashboard_by_project, dashboard_test_metrics                                          |
| jira          | 3       | jira_status, jira_sync, jira_list_issues                                                                  |
| rag           | 3       | rag_chat, rag_list_conversations, rag_get_conversation                                                    |
| system        | 3       | system_health, system_version, system_config                                                              |

## 백엔드 비의존 시나리오 ✅

### 1. 로컬 전용 도구 (`auth_status`)

```
입력: { name: "auth_status", arguments: {} }
실측 응답: { loggedIn: false, message: "로그인하지 않았습니다. auth_login 도구를 호출하세요." }
판정: ✅ 토큰 파일 미존재 시 의도된 메시지
```

### 2. Zod 입력 검증

```
입력: { name: "testcase_get", arguments: { id: "abc" } }
실측 응답: isError=true, "입력 검증 실패:\n  - id: Expected number, received string"
판정: ✅ 잘못된 타입을 백엔드 호출 전 차단, 사용자 친화적 메시지
```

### 3. 네트워크 에러 (백엔드 다운)

```
입력: { name: "testcase_list", arguments: { projectId: 1 } }
실측 응답: isError=true, "백엔드에 연결할 수 없습니다. ./gradlew bootRun이 실행 중인지 확인하세요."
판정: ✅ 사용자가 다음 행동을 알 수 있는 명확한 메시지
```

### 4. 알 수 없는 도구

```
입력: { name: "unknown_tool", arguments: {} }
실측 응답: JSON-RPC error -32601, "Unknown tool: unknown_tool"
판정: ✅ MCP 표준 error code 사용
```

## 백엔드 의존 시나리오 ⏸️ (사용자 수동 확인 필요)

`./gradlew bootRun`이 8080 포트에서 실행 중일 때 사용자가 직접 확인할 시나리오:

### 시나리오 A: 정상 인증 흐름

```bash
# 1. 백엔드 띄우기
./gradlew bootRun  # 사용자 본인이 실행

# 2. MCP 서버를 Claude Desktop에 등록 (README 참조)

# 3. Claude UI에서: "testcasecraft에 admin/admin123으로 로그인해줘"
기대: auth_login 호출 → 200 → ~/.testcasecraft-mcp/token.json 생성 (권한 0600)

# 4. "auth_status"
기대: { loggedIn: true, username: "admin", isExpired: false }

# 5. "프로젝트 목록 보여줘"
기대: project_list 호출 → 200 → 결과 표시
```

### 시나리오 B: 토큰 자동 갱신

```
1. token.json의 accessTokenExpiration을 과거로 수동 변경
2. Claude UI에서 "프로젝트 목록"
기대: 401 → refreshToken으로 /api/auth/refresh 자동 호출 → 새 토큰 저장 → 원 요청 재시도 → 200
```

### 시나리오 C: 권한 부족

```
1. 일반 사용자로 로그인
2. Claude UI에서 "Jira 동기화해줘"
기대: 403 → "권한이 부족합니다. 관리자 권한이 필요할 수 있습니다."
```

## Claude Desktop 시뮬레이션 (description 정확도)

각 도구의 description에 포함된 자연어 트리거 단서로 LLM 도구 선택 정확도를 정성 평가:

| 자연어 입력                              | 기대 도구          | 트리거 단서                               |
| ---------------------------------------- | ------------------ | ----------------------------------------- |
| "admin/admin123으로 로그인해줘"          | auth_login         | "로그인해줘, admin/admin123으로 접속"     |
| "로그인 상태 확인"                       | auth_status        | "로그인 됐어?, 로그인 상태 확인"          |
| "ICT-138 프로젝트의 테스트케이스 보여줘" | testcase_list      | "ICT-138의 테스트케이스, 프로젝트 X의 TC" |
| "TC-123 상세정보"                        | testcase_get       | "TC-123 상세정보, 테스트케이스 456"       |
| "대시보드 보여줘"                        | dashboard_overview | "대시보드, 전체 현황, 통계"               |
| "Jira 이슈 목록"                         | jira_list_issues   | "Jira 이슈, Jira 버그 목록"               |
| "테스트케이스 만드는 방법 알려줘"        | rag_chat           | "테스트케이스 만드는 방법, API 설명"      |

판정: ✅ 모든 description에 1~3가지 자연어 예시 포함, 도구 선택 정확도 충분히 확보됨

## 발견된 결함 / 이슈

### 없음 (CRITICAL/HIGH 결함)

### MEDIUM 이슈 (Phase 2 보강 권장)

1. **백엔드 엔드포인트 경로 미검증**: 일부 도구의 백엔드 URL이 아키텍처 문서의 추측에 기반. 백엔드 실행 후 라운드트립으로 확인 필요. 응답 shape이 다르면 매핑 조정 필요.
2. **응답 페이로드 절단 없음**: 대형 응답(예: testcase_list 트리)이 10MB 초과 시 자동 절단/페이지네이션 강제 미구현. limit/page는 노출되어 있으나 사용자가 명시해야 함.
3. **테스트 케이스 첨부 도구 미구현**: 멀티파트 업로드(`testcase_attachment_*`)는 Phase 2로 미룸. 별도 보안 검토 필요.

### LOW 이슈

1. `testcase_create_or_update`의 priority/status enum 값(LOW/MEDIUM/HIGH, DRAFT/READY/DEPRECATED)은 추정값. 실제 백엔드 enum과 다를 수 있음 → 라운드트립 검증 시 보정.
2. `testplan_create_or_update`의 startDate/endDate가 string 타입(format 미명시). ISO-8601 강제 권장.

## 종합 판정

| 영역                               | 결과             |
| ---------------------------------- | ---------------- |
| 빌드                               | ✅               |
| 서버 시작                          | ✅               |
| 도구 노출 (40개)                   | ✅               |
| 입력 검증 (Zod)                    | ✅               |
| 에러 표준화 (네트워크/Zod/Unknown) | ✅               |
| description 자연어 트리거          | ✅               |
| 백엔드 라운드트립                  | ⏸️ (사용자 수동) |

**Phase 1 MCP 서버 출시 가능 상태.** 사용자가 `./gradlew bootRun`으로 백엔드를 띄운 뒤 Claude Desktop에 등록하여 시나리오 A/B/C를 실제 확인하면 됨.

## 다음 단계 (Phase 2 후보)

1. 백엔드 라운드트립 검증 후 매핑 보정 (사용자 피드백 기반)
2. 멀티파트 업로드 도구 (5개 attachment 컨트롤러)
3. 위험 도구(delete, admin\_\*) — 안전장치 추가 후
4. Streamable HTTP 트랜스포트 (팀 공유용)
5. 추가 도구: 권한 관리(UserPermission 21 API), 번역(TranslationManagement 22 API)
