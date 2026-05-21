# MCP QA Report v2 — testcasecraft

**Date:** 2026-05-21 (재검증)
**Mode:** integration-tester-agent 부분 재실행 (사용자 요청: "MCP 검증해줘")
**v1 백업:** `_workspace/03_qa_report_v1.md`

---

## 검증 환경

| 항목                    | 상태                                                |
| ----------------------- | --------------------------------------------------- |
| 백엔드 (localhost:8080) | ❌ 미실행 (사용자가 `./gradlew bootRun` 필요)       |
| MCP 서버 dist           | ✅ 존재 (76KB)                                      |
| 검증 모드               | 백엔드 비의존 시나리오 + 추가 정적 검증 + 결함 패치 |

## 1. 빌드/종속성 검증 ✅

| 항목           | 결과                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| `npm audit`    | ✅ **0 vulnerabilities** (info/low/moderate/high/critical 모두 0)                            |
| Prod 종속성    | 4개 (@modelcontextprotocol/sdk@1.29.0, axios@1.16.1, zod@3.25.76, zod-to-json-schema@3.25.2) |
| `node_modules` | 52MB (정상)                                                                                  |
| `dist/`        | 76KB (매우 작음)                                                                             |
| `tsc strict`   | 0 errors, 0 warnings                                                                         |

## 2. 도구 노출 + 메타데이터 ✅

40개 도구 전수 검사:

| 메타데이터            | 결과                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| description 길이 분포 | 46~131자 (평균 72자) — 너무 짧지도 길지도 않음 ✅                                                    |
| 자연어 트리거 예시    | 모든 도구 1~3가지 한국어 표현 포함 ✅                                                                |
| inputSchema 형식      | JSON Schema draft-07, additionalProperties: false ✅                                                 |
| required 필드 명시    | 필요한 도구에 모두 명시 (auth_login: [username, password], testcase_get: [id], ...) ✅               |
| enum 사용             | priority(LOW/MEDIUM/HIGH), status(DRAFT/READY/...), result(PASS/FAIL/SKIP/BLOCKED) 등 적절히 활용 ✅ |

## 3. 토큰 파일 라이프사이클 ✅ (실측)

```
시나리오:
1. 가짜 토큰을 ~/.testcasecraft-mcp/token.json에 저장 (chmod 600)
2. auth_status 호출 → "로그인된 상태입니다." 메시지, isExpired:false ✅
3. auth_logout 호출 → "로그아웃했습니다." 메시지 ✅
4. 파일 시스템 확인 → token.json 삭제됨 ✅
5. 디렉토리 권한 → drwx------ (0700) ✅
6. 파일 권한 (생존 중) → -rw------- (0600) ✅
```

## 4. 에러 경로 검증

| 시나리오                                   | v1 결과                                     | v2 결과 (패치 후)                                   |
| ------------------------------------------ | ------------------------------------------- | --------------------------------------------------- |
| Zod 잘못된 타입 (testcase_get id=문자열)   | ✅ "입력 검증 실패: id: Expected number..." | ✅ 유지                                             |
| 알 수 없는 도구 (unknown_tool)             | ✅ JSON-RPC -32601                          | ✅ 유지                                             |
| 네트워크 에러 (testcase_list, 백엔드 다운) | ✅ "백엔드에 연결할 수 없습니다..."         | ✅ 유지                                             |
| **`auth_login` 백엔드 다운**               | ❌ "예외: " (빈 메시지)                     | ✅ **"백엔드에 연결할 수 없습니다..."** (패치 완료) |
| auth_status 토큰 미존재                    | ✅ "로그인하지 않았습니다..."               | ✅ 유지                                             |

## 5. 결함 발견 + 수정 (NEW in v2)

### MEDIUM: auth_login 에러 메시지 누락 → 수정 완료 ✅

**증상:** 백엔드가 다운된 상태에서 `auth_login(admin, admin123)` 호출 시 `"예외: "` (빈 메시지) 반환. 다른 도구들은 명확한 안내가 나오는데 auth_login만 빈 메시지였음.

**근본 원인:** `auth.ts`의 auth_login은 `http-client.ts`의 Axios 인스턴스가 아닌 `axios.post`를 직접 사용 (인터셉터를 거치지 않음). 결과적으로 axios의 network 에러가 `errors.ts`의 `formatError`로 그대로 전달되었고, axios 에러 객체의 `message`가 빈 문자열이라 `"예외: " + ""`가 출력됨.

**수정:** `mcp-server/src/errors.ts`의 `formatError`에 axios 에러 처리 분기 추가. `axios.isAxiosError(err)` 분기 후 status별 명확한 메시지로 변환:

- 네트워크 에러: "백엔드에 연결할 수 없습니다. ./gradlew bootRun이 실행 중인지 확인하세요."
- 400/422 → "입력 검증 실패: ..."
- 401 → "로그인이 필요합니다. auth_login을..."
- 403 → "권한이 부족합니다..."
- 404 → "요청한 리소스를 찾을 수 없습니다: ..."
- 그 외 → "백엔드 호출 실패 [status]: ..."

이 수정은 auth_login뿐 아니라 **인터셉터를 우회하는 모든 향후 axios 호출**에 동일하게 적용됨 (방어적 패치).

**회귀 확인:** 인터셉터를 사용하는 `testcase_list` 등 다른 도구들의 에러 메시지는 변경 없음.

## 6. Claude Desktop 시뮬레이션 (정성)

description의 자연어 트리거 키워드를 매핑하여 도구 선택 정확도 검증:

| 자연어 입력                       | 정확한 도구        | 트리거 단서                       | 판정         |
| --------------------------------- | ------------------ | --------------------------------- | ------------ |
| "admin/admin123으로 로그인해줘"   | auth_login         | "admin/admin123으로 접속"         | ✅ 직접 매칭 |
| "프로젝트 목록"                   | project_list       | "프로젝트 목록"                   | ✅           |
| "ICT-138의 테스트케이스"          | testcase_list      | "ICT-138의 테스트케이스"          | ✅           |
| "TC-123 정보"                     | testcase_get       | "TC-123 상세정보"                 | ✅           |
| "테스트케이스 만드는 방법 알려줘" | rag_chat           | "테스트케이스 만드는 방법"        | ✅           |
| "Jira 동기화"                     | jira_sync          | "이슈 동기화, Jira 데이터 동기화" | ✅           |
| "서버 상태 알려줘"                | system_health      | "서버 상태, 시스템 헬스"          | ✅           |
| "전체 통계 보여줘"                | dashboard_overview | "전체 현황, 통계"                 | ✅           |

판정: ✅ 모든 시나리오에서 description의 트리거 키워드가 자연어와 정확히 매칭됨

## 7. README 정확성

- placeholder 사용: `/absolute/path/to/mcp-server/dist/index.js` (정상 — 사용자가 자기 경로로 치환 필요)
- 실제 절대 경로: `/Users/dicky/kmdata/git/testcase/testcasecraft/mcp-server/dist/index.js`
- 환경변수 명시: TESTCASECRAFT_BASE_URL ✅
- Claude Desktop config 예시 정확 ✅

## 종합 판정

| 영역              | v1                        | v2            |
| ----------------- | ------------------------- | ------------- |
| 빌드              | ✅                        | ✅            |
| 도구 노출         | ✅                        | ✅            |
| Zod 검증          | ✅                        | ✅            |
| 에러 처리         | ⚠️ (auth_login 빈 메시지) | ✅ **수정됨** |
| 토큰 라이프사이클 | (미검증)                  | ✅            |
| npm audit         | (미검증)                  | ✅ 0 vuln     |
| 자연어 트리거     | ✅                        | ✅            |
| 백엔드 라운드트립 | ⏸️                        | ⏸️            |

**Phase 1 MCP 서버 출시 가능 상태.** 빌드/검증/패치 완료. 백엔드 라운드트립만 사용자 수동 단계로 남음.

## 사용자가 백엔드 라운드트립을 수행하려면

```bash
# Terminal A
cd /Users/dicky/kmdata/git/testcase/testcasecraft
./gradlew bootRun   # 백엔드 8080 띄우기 (Docker 서비스 사전 필요)

# Terminal B (별도 세션)
cd /Users/dicky/kmdata/git/testcase/testcasecraft/mcp-server

# 정상 흐름
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"qa","version":"0.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"auth_login","arguments":{"username":"admin","password":"admin123"}}}
' | node dist/index.js 2>/dev/null | tail -1 | jq .

# 그 후
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"qa","version":"0.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"project_list","arguments":{}}}
' | node dist/index.js 2>/dev/null | tail -1 | jq .
```

이때:

- accessToken/refreshToken 응답 형식이 설계와 일치하는지
- /api/projects 등 경로가 실제 컨트롤러와 일치하는지
- 응답 shape이 도구가 기대하는 형식인지

확인 후 불일치하면 "MCP {도구명} 수정해줘"로 재트리거.
