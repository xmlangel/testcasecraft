---
name: testcasecraft-mcp-orchestrator
description: testcasecraft(Spring Boot REST API)를 MCP 서버로 노출하는 전체 워크플로우 오케스트레이터. "API를 MCP로 만들어줘", "MCP 서버 만들어줘", "MCP로 노출해줘", "MCP 브릿지", "현재 프로젝트의 API를 MCP로", "MCP 다시 만들어줘", "MCP 수정해줘", "MCP 도구 추가", "MCP 검증해줘", "MCP 재실행", "MCP 업데이트" 같은 요청 시 반드시 이 스킬을 사용한다. 4명의 전문 에이전트(api-inventory, mcp-architect, mcp-implementer, integration-tester)를 TeamCreate로 묶어 인벤토리→설계→구현→검증 파이프라인을 실행한다.
---

# MCP API Bridge Orchestrator

testcasecraft의 Spring Boot REST API를 실제 동작하는 MCP 서버로 변환하는 전체 워크플로우.

## 실행 모드

**에이전트 팀** (기본). 4명의 전문가가 파이프라인 + 생성-검증 패턴으로 협업. 리더(`mcp-orchestrator-agent`)가 팀을 조율한다.

## Phase 0: 컨텍스트 확인 (항상 첫 단계)

매 실행 첫 단계로 `_workspace/` 디렉토리 존재 여부와 사용자 의도를 분석하여 실행 모드 결정.

```
_workspace/ 미존재 → 초기 실행
_workspace/ 존재 + 신규 명령 (예: "다른 도메인용 MCP 만들어줘") → _workspace_prev/로 이동 후 새 실행
_workspace/ 존재 + 부분 수정 ("testcase 도구만 다시", "auth 흐름 수정") → 해당 에이전트만 재호출
_workspace/ 존재 + 검증 재요청 → integration-tester만 재호출
_workspace/ 존재 + 결함 보고 → 책임 에이전트만 재호출
```

오케스트레이터는 첫 사용자 메시지의 키워드로 분기를 결정한다:

- "다시", "재실행", "수정", "보완" → 부분 재실행 모드 (구체 대상 식별)
- "검증해줘", "테스트해줘" → integration-tester만
- 그 외 → 신규 실행

## Phase 1: API 인벤토리 (api-inventory-agent)

**목적:** Spring Boot 컨트롤러를 결정적으로 스캔하여 표준 인벤토리 JSON 산출

**작업 지시:**

```
api-inventory-agent에게 다음을 요청:
- 입력: /Users/dicky/kmdata/git/testcase/testcasecraft
- 산출물:
  - _workspace/01_api_inventory.json (모든 컨트롤러/엔드포인트)
  - _workspace/01_api_inventory_summary.md (사람 가독 요약)
- 사용 스킬: testcasecraft-api-inventory
```

**완료 기준:**

- 49개 컨트롤러 모두 스캔됨
- summary.md에 그룹화 추천 포함
- `$unknown` 비율 5% 이하

## Phase 2: MCP 아키텍처 설계 (mcp-architect-agent)

**목적:** 인벤토리를 받아 도구 그룹화/인증/에러 표준/사용자 경험을 결정

**작업 지시:**

```
mcp-architect-agent에게 다음을 요청:
- 입력: _workspace/01_api_inventory.json
- 산출물: _workspace/02_mcp_architecture.md
- 결정해야 할 항목:
  1. Phase 1 트랜스포트 (Stdio 권장)
  2. 도구 그룹화 매트릭스 (목표 30~40개)
  3. 인증 흐름 (JWT + 자동 refresh)
  4. 에러 응답 표준
  5. 페이지네이션 정책
  6. 사용자 시나리오 3가지
  7. 위험 도구 명단
- 사용 스킬: testcasecraft-mcp-design, testcasecraft-mcp-auth
```

**완료 기준:**

- 도구 수 50개 이하
- 모든 인벤토리 엔드포인트가 어느 도구로 매핑되는지 명시
- 사용자 시나리오(Claude Desktop config 포함) 작성

## Phase 3: 구현 (mcp-implementer-agent)

**목적:** TypeScript MCP SDK 기반으로 실제 빌드되는 서버 코드 생성

**작업 지시:**

```
mcp-implementer-agent에게 다음을 요청:
- 입력: _workspace/02_mcp_architecture.md, _workspace/01_api_inventory.json
- 산출물: 프로젝트 루트의 mcp-server/ 디렉토리
- 필수 산출물:
  - package.json, tsconfig.json, README.md, .env.example
  - src/index.ts, src/auth.ts, src/http-client.ts, src/token-store.ts, src/errors.ts
  - src/tools/*.ts (도구 그룹별)
- 검증:
  - npm install 성공
  - npm run build 성공 (0 에러)
  - node dist/index.js 시작 OK
- incremental QA: 각 도구 그룹 완성 시마다 integration-tester에게 부분 검증 요청
- 사용 스킬: testcasecraft-mcp-tools, testcasecraft-mcp-auth
```

**완료 기준:**

- 빌드 통과
- 설계 문서의 모든 도구가 구현됨
- README.md에 Claude Desktop 등록 예시 포함

## Phase 4: 통합 검증 (integration-tester-agent)

**목적:** 실제 동작 검증, Claude Desktop 시뮬레이션

**작업 지시:**

```
integration-tester-agent에게 다음을 요청:
- 입력: mcp-server/, _workspace/02_mcp_architecture.md
- 산출물: _workspace/03_qa_report.md
- 검증 절차:
  1. 빌드 검증
  2. 도구 노출 (tools/list)
  3. 인증 라운드트립
  4. CRUD shape 비교
  5. 에러 시나리오 (5가지)
  6. Claude Desktop 시뮬레이션 (5가지 자연어)
- 사용 스킬: testcasecraft-mcp-test
- 결함 발견 시: 책임 에이전트(implementer/architect/inventory)에게 직접 메시지
```

**완료 기준:**

- QA Report의 모든 critical/high 결함 해결
- Claude Desktop 시나리오 5/5 통과

## Phase 5: 사용자 보고

오케스트레이터가 사용자에게 최종 보고:

````markdown
## ✅ MCP 서버 구축 완료

**위치:** `/path/to/testcasecraft/mcp-server/`
**도구 수:** N개 (설계 대비 100%)
**검증:** Build ✓ / Tools ✓ / Auth ✓ / CRUD ✓ / Errors ✓

### 설치 방법

1. `cd mcp-server && npm install && npm run build`
2. Claude Desktop 설정에 추가:
   ```json
   {
     "mcpServers": {
       "testcasecraft": {
         "command": "node",
         "args": ["/abs/path/to/mcp-server/dist/index.js"],
         "env": { "TESTCASECRAFT_BASE_URL": "http://localhost:8080" }
       }
     }
   }
   ```
````

3. Claude Desktop 재시작 → "testcasecraft에 admin/admin123으로 로그인해줘"

### 산출물

- 아키텍처: \_workspace/02_mcp_architecture.md
- QA 보고서: \_workspace/03_qa_report.md

### 알려진 제약

- ...

```

## 에러 핸들링

| 상황 | 대응 |
|------|------|
| 에이전트 작업 실패 | 1회 재시도. 재실패 시 사용자에게 보고하고 중단 |
| QA에서 critical 결함 발견 | 책임 에이전트에게 재작업 요청 (최대 2회 루프) |
| 결함 루프 3회 | 멈추고 사용자 의사결정 요청 |
| 백엔드 다운 (Phase 4) | 사용자에게 `./gradlew bootRun` 안내 후 일시 정지 |
| 빌드 실패 (Phase 3) | implementer에게 에러 로그 전달, 수정 요청 |

## 데이터 전달

- **메시지 기반:** 팀원 간 실시간 통신 (`SendMessage`)
- **태스크 기반:** 작업 상태 공유 (`TaskCreate`/`TaskUpdate`)
- **파일 기반:** `_workspace/` 아래에 단계별 산출물 저장
  - `01_*` → Phase 1
  - `02_*` → Phase 2
  - `03_*` → Phase 4
  - `mcp-server/` → Phase 3 최종 산출물

중간 파일(`_workspace/`)은 보존하여 사후 검증 가능. `_workspace_prev/`는 직전 실행의 백업.

## 테스트 시나리오

### 정상 흐름
1. 사용자: "현재 프로젝트의 API들을 MCP로 만들어줘"
2. Phase 0: _workspace 없음 → 신규 실행
3. Phase 1: 49개 컨트롤러 인벤토리 → 01_*.json
4. Phase 2: 32개 도구로 그룹화 → 02_*.md
5. Phase 3: TypeScript 코드 + 빌드 통과 → mcp-server/
6. Phase 4: QA 통과 → 03_qa_report.md
7. Phase 5: 사용자 보고 + 설치 안내

### 부분 재실행 흐름
1. 사용자: "testcase 도구만 다시 만들어줘. 검색 파라미터가 누락됐어."
2. Phase 0: _workspace 존재 + 부분 수정 의도 감지
3. Phase 1, 2 건너뜀
4. mcp-implementer-agent에게 `src/tools/testcase.ts`만 재작업 요청
5. integration-tester에게 testcase 그룹만 재검증
6. 사용자 보고: "testcase_search 도구 추가됨, 라운드트립 통과"

### 에러 흐름
1. Phase 3에서 빌드 실패 (예: zod 버전 충돌)
2. mcp-implementer가 에러 로그 분석 → 1회 재시도
3. 재실패 시 사용자에게 보고: "빌드 실패. 종속성 버전 충돌. 해결 방법 A/B 중 선택하세요"
4. 사용자 결정 후 진행

## 후속 작업 지원

이 스킬의 description은 다음 키워드를 포함해야 한다 (이미 포함됨):
- "다시 만들어줘", "수정해줘", "도구 추가", "검증해줘", "재실행", "업데이트"

후속 요청 시 Phase 0이 반드시 컨텍스트 확인을 수행하여 전체 재실행을 피한다.
```
