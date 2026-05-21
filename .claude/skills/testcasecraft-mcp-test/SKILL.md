---
name: testcasecraft-mcp-test
description: 생성된 MCP 서버를 실제로 동작 검증하는 절차. MCP Inspector(@modelcontextprotocol/inspector)로 도구 목록/호출 검증, 백엔드(testcasecraft)와의 라운드트립 비교, 401/404/422 에러 시나리오, 토큰 만료 자동 복구, Claude Desktop 사용 시뮬레이션을 수행한다. integration-tester-agent가 모듈별 incremental QA와 전체 검증 시 반드시 사용.
---

# MCP Integration Test

MCP 서버가 "코드 컴파일된다"가 아니라 "Claude Desktop에서 자연어로 호출 가능하다"의 수준에서 동작하는지 검증하는 절차.

## 전제 조건

- testcasecraft 백엔드가 8080 포트에서 실행 중 (`./gradlew bootRun`)
- mcp-server의 `npm install && npm run build` 통과
- 테스트 계정 (admin/admin123)

## Step 1: 빌드 검증

```bash
cd mcp-server
npm install 2>&1 | tee /tmp/install.log
npm run build 2>&1 | tee /tmp/build.log
```

확인:

- 종속성 설치 에러 없음
- tsc 에러/경고 0건
- `dist/index.js`가 실행 가능 (`node dist/index.js`로 시작 시 stderr에 시작 로그)

## Step 2: 서버 시작 검증

```bash
# 5초 동안 띄우고 stderr 확인
timeout 5 node dist/index.js < /dev/null 2>&1 || true
```

기대: `[testcasecraft-mcp] started` 같은 메시지가 stderr에 출력되고, stdin이 닫히면 정상 종료.

## Step 3: 도구 목록 검증 (수동 JSON-RPC)

MCP Inspector가 없는 환경에서는 직접 JSON-RPC 호출:

```bash
cd mcp-server
# 입력: initialize + tools/list
node dist/index.js <<'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
EOF
```

응답에서 확인:

- `tools` 배열 길이 (설계 문서의 도구 수와 일치)
- 각 도구의 `name`, `description`, `inputSchema` 존재
- description이 30자 이상 (트리거 정확도 확보)

## Step 4: MCP Inspector 사용 (권장)

```bash
npx -y @modelcontextprotocol/inspector node /abs/path/to/mcp-server/dist/index.js
```

브라우저에서 열리는 UI:

- Tools 탭에서 도구 목록 확인
- 각 도구를 직접 호출하며 응답 확인
- 입력 스키마가 form으로 잘 렌더링되는지 확인

## Step 5: 인증 라운드트립

### 5-1. auth_login 호출

```
입력: { "username": "admin", "password": "admin123" }
기대: { "ok": true, "username": "admin" }
검증: ~/.testcasecraft-mcp/token.json 파일 생성 확인
```

### 5-2. auth_status 호출

```
기대: { "loggedIn": true, "username": "admin", "expiresAt": "...", "isExpired": false }
```

### 5-3. 토큰 없이 보호된 도구 호출

```
$ rm ~/.testcasecraft-mcp/token.json
$ # testcase_list 호출
기대: isError: true, "로그인이 필요합니다. auth_login..." 메시지
```

## Step 5.5: 경계면 정합성 검증 (스키마 mismatch 차단)

CRUD 라운드트립 전에 MCP zod 스키마와 백엔드 DTO/컨트롤러의 정합성을 정적 비교한다. 이 단계는 "도구는 노출되어 있지만 첫 호출이 입력 검증/400으로 거부되는" 패턴을 잡는다.

### 5.5-1. ID 타입 검증

```bash
# UUID 프로젝트에서 zod number ID 잔재 색출
grep -rnE "z\.number\(\)\.int\(\)\.positive" mcp-server/src/tools/
# 결과가 비어야 정상

# 백엔드 PathVariable 타입 확인 — String이면 zod도 string이어야 함
grep -rn "@PathVariable" src/main/java/.../controller/ | head
```

### 5.5-2. RequestBody DTO 필드 일치 검증

도구별로 다음 표를 채운다. 누락 칸이 있으면 implementer에게 정정 요청:

| 도구                      | 백엔드 DTO 필수 필드(`@NotBlank`/`@NotNull`) | zod 필수 필드 | 누락 |
| ------------------------- | -------------------------------------------- | ------------- | ---- |
| testcase_create_or_update | `name`, `projectId`, `steps[].description`   | ...           | ...  |
| project_create_or_update  | ...                                          | ...           | ...  |

```bash
# 백엔드 NotBlank 필드 추출
grep -B0 -A1 "@NotBlank" src/main/java/.../dto/XxxDto.java | grep "private"
# zod 필수 필드 추출 (옵셔널이 아닌 것)
grep -E "z\.string\(\)\.min\(1" mcp-server/src/tools/xxx.ts
```

### 5.5-3. URL 경로 검증

zod 호출이 가는 URL과 실제 `@RequestMapping` 경로가 일치하는지 점검:

```bash
# MCP 코드에서 백엔드 호출 경로 추출
grep -E "httpClient\.(get|post|put|delete)\(" mcp-server/src/tools/*.ts | sed -E "s|.*\(\`?([^\`)]+).*|\1|"
# 백엔드 컨트롤러 매핑과 대조
grep -rnE "@(Get|Post|Put|Delete)Mapping" src/main/java/.../controller/
```

상응하지 않는 경로(예: `/api/projects/{id}/testcases` vs 실제 `/api/testcases/project/{projectId}`)는 critical 결함으로 보고.

## Step 6: CRUD 라운드트립 (도구별)

각 도구에 대해 표 작성:

| 도구            | 입력                                                                                | MCP 응답 | 백엔드 직접 호출 응답 | shape 일치 |
| --------------- | ----------------------------------------------------------------------------------- | -------- | --------------------- | ---------- |
| testcase_list   | `{ projectId: "267f368a-..." }` (UUID)                                              | ...      | ...                   | ✓          |
| testcase_get    | `{ id: "<uuid>" }`                                                                  | ...      | ...                   | ✓          |
| testcase_create | `{ projectId:"<uuid>", name:"QA-test", steps:[{stepNumber:1, description:"..."}] }` | ...      | ...                   | ✓          |

비교 명령 (백엔드 직접 호출):

```bash
TOKEN=$(jq -r .accessToken ~/.testcasecraft-mcp/token.json)
PROJECT_ID="<uuid>"
# 실제 백엔드 엔드포인트: /api/testcases/project/{projectId}
curl -s -H "Authorization: Bearer $TOKEN" \
  https://testcasecraft.xmlangel.uk/api/testcases/project/$PROJECT_ID | jq .
```

shape 일치 = 같은 키, 같은 타입.

## Step 7: 에러 시나리오

### 7-1. 존재하지 않는 ID

```
입력: testcase_get({ id: 99999999 })
기대: isError: true, "리소스를 찾을 수 없습니다..." 메시지
```

### 7-2. 필수 필드 누락

```
입력: testcase_create_or_update({ projectId: 1 })  // name 누락
기대: isError: true, Zod 검증 실패 메시지
```

### 7-3. 잘못된 타입

```
입력: testcase_get({ id: "abc" })  // 숫자가 아님
기대: isError: true, "id: Expected number, received string"
```

### 7-4. 백엔드 다운

```
$ # bootRun 중단
$ # MCP에서 testcase_list 호출
기대: isError: true, "백엔드 호출 실패 [network]: ..." 메시지
```

### 7-5. 토큰 만료 자동 복구

```
$ # token.json의 accessToken을 가짜 값으로 변경 (refreshToken은 유효 유지)
$ # testcase_list 호출
기대: 자동 refresh 후 정상 응답
```

## Step 7.5: 첨부파일 멀티파트 라운드트립 (해당 도구가 있을 때만)

`*_attachment_upload` 같은 multipart 도구는 JSON 도구와 실패 모드가 다르므로 별도 검증한다.

### 7.5-1. 허용 확장자 정책 사전 확인

백엔드가 확장자 화이트리스트를 적용하는지 먼저 확인한다:

```bash
# 백엔드의 화이트리스트 정의 위치를 grep으로 발굴
grep -rnE "ALLOWED.*EXTENSIONS?|allowedFileTypes|fileExtension.*validation" src/main/java/ | head
```

확인된 화이트리스트는 도구 description과 운영 노트에 명시한다. 본 프로젝트(testcasecraft) 기준:

```
허용: txt, csv, json, md, pdf, log, png, jpg, jpeg, gif, xls, xlsx, doc, docx
```

### 7.5-2. 정상 업로드

```
입력: { testCaseId: "<uuid>", filePath: "/tmp/sample.txt", description: "test" }
기대: { id, originalFileName: "sample.txt", fileSize, downloadUrl, ... }
검증: 백엔드 직접 호출로 GET /api/...-attachments/testcase/{id} → 목록에 항목 존재
```

### 7.5-3. 거부 확장자 처리

```
입력: { testCaseId: "<uuid>", filePath: "/tmp/sample.sql" }
기대: isError: true, "허용되지 않은 확장자" 메시지 (사전 검증) 또는 백엔드 400
```

도구가 사전 검증 없이 백엔드 400을 그대로 노출하면 critical 결함. handler 내에서 친절한 메시지로 변환해야 한다.

### 7.5-4. 큰 파일 (수 MB+)

```
입력: 5MB 텍스트 파일
기대: 타임아웃·메모리 에러 없이 업로드 성공
```

axios의 기본 `maxContentLength`/`maxBodyLength`가 작아서(`2000` bytes 수준) 큰 파일이 막힐 수 있다. handler에서 `Infinity` 설정 확인.

### 7.5-5. 권한 분리 검증

다른 사용자 토큰으로 같은 attachmentId 조회 시 403/404가 정상이다. PathVariable로 노출되는 ID가 enumeration 공격에 취약하지 않은지 확인.

## Step 8: Claude Desktop 시뮬레이션

Claude Desktop config.json에 등록 후 자연어 시나리오 테스트:

| 자연어                                        | 기대 도구 호출               |
| --------------------------------------------- | ---------------------------- |
| "admin/admin123으로 로그인해줘"               | auth_login                   |
| "로그인 상태 알려줘"                          | auth_status                  |
| "ICT-138 프로젝트의 테스트케이스 트리 보여줘" | testcase_list(projectId=...) |
| "100번 테스트케이스 정보 보여줘"              | testcase_get(id=100)         |
| "대시보드 요약"                               | dashboard_overview           |

도구 선택이 부정확하면 description을 더 구체적으로 작성 (`testcasecraft-mcp-design`의 description 작성 원칙 참조).

## Step 9: 결과 보고

`_workspace/03_qa_report.md` 작성:

```markdown
# MCP QA Report

## 빌드

- npm install: ✓
- npm run build: ✓ (0 errors, 0 warnings)
- 서버 시작: ✓

## 도구 노출

- 총 도구: 32개 (설계 33개와 1개 차이 — admin_mail_settings 미구현)

## 인증

- auth_login: ✓
- auth_status: ✓
- 토큰 자동 주입: ✓
- 401 자동 refresh: ✓
- 토큰 만료 메시지: ✓

## CRUD 라운드트립

| 도구          | shape 일치 | 비고                                                       |
| ------------- | ---------- | ---------------------------------------------------------- |
| testcase_list | ✓          |                                                            |
| testcase_get  | ✗          | description 필드명이 'desc'로 다름 → implementer 수정 필요 |
| ...           |            |                                                            |

## 에러 시나리오

| 시나리오       | 결과 |
| -------------- | ---- |
| 없는 ID        | ✓    |
| 필수 필드 누락 | ✓    |
| 잘못된 타입    | ✓    |
| 백엔드 다운    | ✓    |
| 토큰 만료      | ✓    |

## 결함

- [HIGH] testcase_get: description 필드 매핑 누락 (implementer 재작업)
- [MEDIUM] testplan_execute: 응답이 비동기 → polling 도구 필요 (architect 추가 설계)
- [LOW] dashboard description이 너무 짧음 → 자연어 매칭 약함

## Claude Desktop 시뮬레이션

- 5/5 시나리오에서 정확한 도구 선택
```

## incremental QA (모듈별)

전체 완성 후 1회 검증이 아니라, implementer가 모듈을 완성할 때마다:

1. implementer가 `tools/testcase.ts` 완성 통지 → tester는 testcase 그룹만 Step 5-7 실행
2. 결함 발견 시 즉시 implementer에게 보고 (재작업)
3. 통과 시 다음 모듈 검증 대기

이렇게 하면 결함을 일찍 발견하고, 후속 모듈 작업 시 같은 패턴의 실수를 반복하지 않는다.

## 자동화 스크립트

반복 검증을 위해 `_workspace/qa-scripts/`에 셸 스크립트 작성:

```bash
# qa-scripts/round-trip-testcase-list.sh
#!/usr/bin/env bash
set -euo pipefail
TOKEN=$(jq -r .accessToken ~/.testcasecraft-mcp/token.json)
BACKEND=$(curl -sf -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects/1/testcases)
# MCP 호출
MCP_OUT=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"testcase_list","arguments":{"projectId":1}}}' \
  | node dist/index.js | jq -r '.result.content[0].text')
# shape 비교
diff <(echo "$BACKEND" | jq 'keys') <(echo "$MCP_OUT" | jq 'keys')
```
