# LLM 브라우저 에이전트 자동화 계획 — 자연어 테스트케이스를 그대로 실행한다

작성: 2026-09-03 09:00 KST
브랜치: `feat/llm-browser-agent-automation`
대상: testcasecraft v1.0.125
화면: **S8 자동화 테스트** (`/projects/{projectId}/automation`) 안에 넣는다
참고: 잡코리아(Worxphere) QA팀 「LLM 기반 TestRail 테스트 자동화 에이전트 구축」 (techblog.jobkorea.co.kr, 2026-07-21, Taeshkim)

> **한 줄 요약** — testcasecraft 에 이미 쌓여 있는 **자연어 테스트케이스**(`TestCase` + `TestStep`)를 LLM 에이전트가 읽고 **실제 브라우저를 직접 조작**해 실행한 뒤, 결과를 **기존 자동화 테스트 대시보드(JUnit 구조)** 에 그대로 꽂는다. 스크립트를 새로 쓰지 않는다.

---

## 0. 왜 지금 이걸 보는가 — 참고 글의 요지

Worxphere QA팀이 PoC로 만든 구조는 다음과 같다.

| 레이어 | 그들이 쓴 것 | testcasecraft 에서의 대응 |
|---|---|---|
| 케이스 저장소 | TestRail REST API 로 프로젝트·스위트·케이스 조회 | **DB 직접 조회** — 우리가 케이스 저장소 본체다 (API 왕복 불필요) |
| 프롬프트 빌더 | 케이스 → 프롬프트 변환. 정책 JSON + 컨텍스트 JSON 2종 | `LlmTemplate` 테이블 + 신설 `AgentProfile` (정책·컨텍스트) |
| 실행 엔진 | browser-use + Playwright, `use_vision=True` | 신설 **agent-runner** (Python 사이드카) |
| 실시간 모니터링 | Django Channels WebSocket 으로 스텝 로그·스크린샷 push | **SSE** — `RagChatController` 의 `SseEmitter` 패턴 재사용 |
| 결과 정규화 | 후처리 LLM 이 `{status, summary, evidence, errors}` JSON 으로 표준화 | 동일 채택 |
| 프로세스 격리 | `multiprocessing.Process` + Queue — 브라우저 크래시 격리 | 별도 컨테이너/프로세스로 격리 (Java 프로세스에 브라우저를 넣지 않는다) |

그들이 **직접 밝힌 한계**도 그대로 우리 제약이다 — 케이스당 30초~1분, $0.03~$0.10, 비결정적(같은 케이스 재실행 시 행동이 달라짐), 복잡한 시나리오·파일 업로드·캡차 불안정. 그래서 이 계획은 **기존 JUnit 업로드 자동화를 대체하지 않는다.** 스모크·회귀 초안·탐색적 테스트 보완재로 자리를 잡는다.

**우리가 그들보다 유리한 지점 3가지** — 이게 이 기능을 만드는 이유다.

1. 그들은 TestRail 을 API 로 긁어야 하지만 **우리는 케이스 저장소 그 자체**다. 케이스·스텝·기대결과·전제조건이 `TestCase`/`TestStep` 으로 이미 구조화돼 있다.
2. **멀티 LLM 이 이미 있다.** `service/llm/` 에 OpenAI·OpenRouter·Ollama·OpenWebUI·Perplexity·NVIDIA·OpenAI-호환 클라이언트 7종과 `LlmConfigService`·`LlmClientFactory` 가 붙어 있다. 새로 만들 게 없다.
3. **결과를 담을 그릇이 이미 있다.** `JunitTestResult` → `JunitTestSuite` → `JunitTestCase` 3계층과 대시보드(`JunitResultDashboard.jsx`)·상세(`JunitResultDetail.jsx`)가 돌아간다. 에이전트 실행 결과를 이 구조로 정규화하면 **UI 를 거의 새로 안 만들어도 된다.**

---

## 1. 목표

1. 프로젝트의 테스트케이스를 골라 **"에이전트로 실행"** 버튼 하나로 브라우저 자동 실행.
2. 실행 중 **스텝별 로그와 스크린샷을 실시간으로** 화면에 흘린다.
3. 실행이 끝나면 결과가 **기존 자동화 테스트 목록에 한 건의 결과로** 남는다 (JUnit 결과와 같은 자리, 같은 상세 화면).
4. 케이스 본문에 **계정·URL·테스트 데이터를 적지 않는다.** 프로젝트별 컨텍스트에서 주입한다 (참고 글의 핵심 아이디어).
5. **가드레일** — 허용 도메인 밖 이동 금지, 결제/삭제류 행동 금지를 프로필로 강제.
6. 케이스별·실행별 **LLM 비용을 추적**한다.

## 2. 비목표 (이번 범위 밖)

- 기존 JUnit XML 업로드 자동화의 대체 — 병존한다.
- 다중 브라우저 병렬 실행 — Phase 4 이후. MVP 는 실행당 브라우저 1개, 케이스 순차.
- 자가치유(self-healing) selector 리페어를 정식 기능으로 파는 것 — LLM 이 알아서 찾는 건 부수효과로 얻고, 별도 기능화는 안 한다.
- 모바일 앱·네이티브 UI 자동화.
- CI 파이프라인 연동(Jenkins/GitHub Actions 훅) — Phase 5.
- 파일 업로드/다운로드·캡차 시나리오 — 참고 글이 불안정하다고 명시. 명시적 미지원으로 문서화.

## 3. 호환성 원칙

- **기존 화면·라우트를 깨지 않는다.** S8 자동화 테스트 화면에 **탭 하나를 추가**하는 방식(참고 글 대응 Option A). 기본 진입 시 보이는 건 지금과 같은 JUnit 대시보드다.
- **결과 저장은 기존 3계층 엔티티를 재사용**한다. `JunitTestResult` 에 `source` 컬럼(`XML_UPLOAD` | `LLM_AGENT`)을 더해 구분한다. 기존 행은 `XML_UPLOAD` 로 백필.
- 에이전트 전용 데이터(스텝 로그·스크린샷·프롬프트·비용)만 **신규 테이블 2개**에 담는다.
- 화면 ID 는 **S8 을 그대로 쓴다.** 새 화면 ID 를 만들면 CLAUDE.md 가 경고한 "화면 ID 정의가 흩어진 7곳"을 전부 고쳐야 한다. 서브탭으로 처리해 회피한다.
- agent-runner 사이드카가 **없어도 앱은 정상 기동**한다. 미기동 시 에이전트 탭은 "런너 미연결" 안내만 띄운다.

---

## 4. 아키텍처

```
[React S8 자동화 화면]
   │  ① POST /api/automation-tests/agent-runs        (실행 요청)
   │  ② GET  /api/automation-tests/agent-runs/{id}/stream   (SSE 구독)
   ▼
[Spring Boot  AgentRunController / AgentRunService]
   │  · 케이스·스텝 DB 조회
   │  · AgentProfile(정책 JSON + 컨텍스트 JSON) 병합 → 프롬프트 빌드
   │  · LlmConfig 조회 (기존 LlmConfigService)
   │  · AgentRun 생성 → QUEUED
   │  · @Async 워커가 런너 호출 + 콜백 수신
   ▼  HTTP (내부망)
[agent-runner  (Python 사이드카, FastAPI)]
   │  · browser-use Agent + Playwright, use_vision
   │  · 케이스 1건 = 자식 프로세스 1개 (크래시 격리)
   │  · 스텝마다 콜백 POST → Spring
   │  · 스크린샷은 MinIO 에 직접 put (기존 MinIOService 버킷 규약)
   ▼
[결과 정규화]  후처리 LLM → {status, summary, evidence, errors}
   ▼
[JunitTestResult(source=LLM_AGENT) / JunitTestSuite / JunitTestCase]
   ▼
[기존 JunitResultDashboard · JunitResultDetail 이 그대로 렌더]
```

### 4-1. 왜 Python 사이드카인가

browser-use 는 Python 라이브러리다. Java 에서 Playwright-Java 로 다시 짜면 browser-use 가 해결해 둔 DOM 요약·비전 결합·액션 스키마를 처음부터 만들어야 한다. 그리고 참고 글이 지적한 **브라우저 크래시 격리**도 JVM 안에서는 위험하다. `rag-service/` 라는 Python 사이드카 선례가 이미 있으므로 같은 패턴을 쓴다.

- 배치 위치: `agent-runner/` (레포 루트, `rag-service/` 와 형제)
- `docker-compose-build/` 에 서비스 추가, 프로파일로 on/off
- Spring ↔ 런너 인증: 기존 `ServiceApiKey` / `ApiKeyAuthenticationFilter` 재사용

### 4-2. 실시간 전송은 SSE 로 간다

참고 글은 Django Channels WebSocket 을 썼지만, 우리는 **이미 SSE 가 붙어 있다** — `RagChatController.chatStream()` 이 `@PostMapping(value="/stream", produces=MediaType.TEXT_EVENT_STREAM_VALUE)` 로 `SseEmitter` 를 반환한다(`controller/RagChatController.java:83,113`). 단방향 push 만 필요하므로 WebSocket 인프라를 새로 들일 이유가 없다. 프런트에는 아직 `EventSource` 사용처가 없어 훅 하나(`useAgentRunStream`)를 신설한다.

---

## 5. 데이터 모델

DB 마이그레이션은 이 레포 규약대로 **JPA `ddl-auto`** 에 맡긴다 (dev=`update`, prod=`validate`). 별도 SQL 스크립트를 두지 않되, prod 반영 전 스키마 검토는 릴리즈 절차에 포함한다.

### 5-1. 기존 엔티티 변경 — 1건뿐

`model/JunitTestResult.java` 에 컬럼 2개 추가.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `source` | `VARCHAR(20)`, default `XML_UPLOAD` | `XML_UPLOAD` \| `LLM_AGENT` |
| `agent_run_id` | `VARCHAR(36)` nullable | `LLM_AGENT` 일 때 `AgentRun` 역참조 |

기존 행은 default 로 자동 백필된다. `fileName`·`fileSize`·`fileChecksum` 은 에이전트 결과일 때 null 을 허용해야 하므로 `nullable` 확인이 필요하다 (현재 nullable 이면 무변경).

### 5-2. 신규 엔티티

```java
@Entity @Table(name = "agent_runs", indexes = {
  @Index(name="idx_agent_run_project", columnList="project_id"),
  @Index(name="idx_agent_run_status",  columnList="status"),
  @Index(name="idx_agent_run_started", columnList="started_at")
})
public class AgentRun {
  @Id @Column(columnDefinition="VARCHAR(36)") private String id;
  @Column(name="project_id", length=36, nullable=false) private String projectId;
  @Column(name="run_name", columnDefinition="TEXT")      private String runName;
  @Column(name="profile_id", length=36)                  private String profileId;   // AgentProfile
  @Column(name="llm_config_id", length=36)               private String llmConfigId; // 기존 LlmConfig
  @Column(name="test_plan_id", length=36)                private String testPlanId;  // 선택

  @ElementCollection @CollectionTable(name="agent_run_case_ids")
  @Column(name="test_case_id", length=36)                private List<String> testCaseIds;

  @Enumerated(EnumType.STRING) @Column(length=20)        private AgentRunStatus status;
  @Column(name="total_cases")    private Integer totalCases;
  @Column(name="finished_cases") private Integer finishedCases;

  @Column(name="junit_result_id", length=36) private String junitResultId; // 완료 후 채워짐
  @Column(name="total_cost_usd", precision=10, scale=4) private BigDecimal totalCostUsd;
  @Column(name="total_input_tokens")  private Long totalInputTokens;
  @Column(name="total_output_tokens") private Long totalOutputTokens;

  @Column(name="started_at") private LocalDateTime startedAt;
  @Column(name="ended_at")   private LocalDateTime endedAt;
  @Column(name="triggered_by", length=100) private String triggeredBy;
  @Column(name="error_message", columnDefinition="TEXT") private String errorMessage;
}

public enum AgentRunStatus { QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED }
```

```java
@Entity @Table(name = "agent_step_logs", indexes = {
  @Index(name="idx_agent_step_run", columnList="agent_run_id,step_index")
})
public class AgentStepLog {
  @Id @Column(columnDefinition="VARCHAR(36)") private String id;
  @Column(name="agent_run_id", length=36, nullable=false) private String agentRunId;
  @Column(name="test_case_id", length=36) private String testCaseId;
  @Column(name="step_index")  private Integer stepIndex;     // 실행 내 전역 순번
  @Column(name="case_step_no") private Integer caseStepNo;   // TestStep.stepNumber 대응 (null 가능)

  @Column(name="action_type", length=40) private String actionType; // navigate/click/type/assert/screenshot...
  @Column(columnDefinition="TEXT") private String thought;    // LLM 판단 근거
  @Column(columnDefinition="TEXT") private String action;     // 실행한 액션 원문
  @Column(columnDefinition="TEXT") private String observation;// 결과·오류

  @Column(name="screenshot_key", columnDefinition="TEXT") private String screenshotKey; // MinIO object key
  @Column(name="page_url", columnDefinition="TEXT")       private String pageUrl;

  @Enumerated(EnumType.STRING) @Column(length=20) private AgentStepStatus status;
  @Column(name="input_tokens") private Integer inputTokens;
  @Column(name="output_tokens") private Integer outputTokens;
  @Column(name="cost_usd", precision=10, scale=6) private BigDecimal costUsd;
  @Column(name="latency_ms") private Integer latencyMs;
  @Column(name="occurred_at") private LocalDateTime occurredAt;
}

public enum AgentStepStatus { RUNNING, OK, WARN, FAILED }
```

```java
@Entity @Table(name = "agent_profiles")
public class AgentProfile {
  @Id @Column(columnDefinition="VARCHAR(36)") private String id;
  @Column(name="project_id", length=36, nullable=false) private String projectId;
  @Column(columnDefinition="TEXT", nullable=false) private String name;
  @Column(name="prompt_template", columnDefinition="TEXT") private String promptTemplate;
  @Column(name="guardrails_json", columnDefinition="TEXT") private String guardrailsJson;
  @Column(name="context_json_encrypted", columnDefinition="TEXT") private String contextJsonEncrypted;
  @Column(name="is_default") private Boolean isDefault = false;
  @Column(name="created_at") private LocalDateTime createdAt;
  @Column(name="updated_at") private LocalDateTime updatedAt;
}
```

**중요 — 컨텍스트 JSON 은 암호화 저장한다.** 참고 글의 컨텍스트 JSON 에는 테스트 계정 ID/PW 가 들어간다. 평문 컬럼으로 두면 안 된다. `LlmConfig` 의 API 키 저장 방식과 동일한 암호화 경로를 따르고, 조회 API 응답에서는 **값을 마스킹**해 키 이름만 노출한다.

### 5-3. 정책 JSON / 컨텍스트 JSON 형태

```jsonc
// guardrails_json
{
  "allowed_domains": ["stg.example.com", "example.com"],
  "forbidden_actions": ["payment", "delete", "signup"],
  "max_steps_per_case": 40,
  "step_timeout_sec": 30,
  "case_timeout_sec": 300,
  "stop_on_first_failure": false
}
```

```jsonc
// context_json (암호화 저장, UI 는 값 마스킹)
{
  "accounts": {
    "admin":  { "id": "admin@example.com", "pw": "***" },
    "member": { "id": "user@example.com",  "pw": "***" }
  },
  "urls": { "login": "https://stg.example.com/login", "home": "https://stg.example.com" },
  "test_data": { "sample_product": "테스트 상품 A", "coupon_code": "TEST2024" }
}
```

케이스 스텝에는 `"관리자 계정으로 로그인"` 만 쓴다. 실제 ID/PW 는 프롬프트 빌더가 주입한다. 환경이 바뀌면 프로필만 고치고, 민감정보는 케이스 본문에 남지 않는다.

---

## 6. 프롬프트 빌더 — 케이스를 프롬프트로

입력은 `TestCase` (`name`, `description`, `preCondition`, `postCondition`, `expectedResults`, `steps: List<TestStep>{stepNumber, description, expectedResult}`) 이다.

```
당신은 웹 QA 자동화 에이전트다. 아래 테스트 케이스를 브라우저에서 실행하라.

[환경]
{{context_urls}}
{{context_accounts_hint}}   ← 실제 자격증명은 액션 인자로만 주입, 로그에는 마스킹
{{context_test_data}}

[케이스] {{displayId}} {{name}}
[전제조건] {{preCondition}}
[스텝]
 1. {{step[0].description}}  (기대: {{step[0].expectedResult}})
 2. ...
[전체 기대결과] {{expectedResults}}
[사후조건] {{postCondition}}

[규칙]
- 허용 도메인 밖으로 나가지 마라: {{allowed_domains}}
- 금지 행동: {{forbidden_actions}}
- 스텝마다 무엇을 왜 했는지 한 줄로 남겨라
- 판단이 불가하면 추측하지 말고 실패로 보고하라
```

템플릿은 `LlmTemplate` 테이블에 시드로 등록한다 (`LlmTemplateInitializer` 패턴). 프로필의 `promptTemplate` 이 있으면 그걸 우선한다.

### 6-1. 결과 정규화

에이전트 원문 출력은 자유 텍스트다. 후처리 LLM 을 한 번 더 태워 고정 스키마로 만든다.

```json
{
  "status": "passed | failed | skipped | error",
  "summary": "한 줄 요약",
  "evidence": ["근거1", "근거2"],
  "errors": ["오류 메시지"]
}
```

이 `status` 를 `JunitTestStatus` 로 매핑한다 — `passed→PASSED`, `failed→FAILED`, `error→ERROR`, `skipped→SKIPPED`. `summary` 는 `JunitTestCase.systemOut`, `errors` 는 `failureMessage`, `evidence` 는 `systemOut` 하단에 덧붙인다. **파싱 실패 시 `ERROR` 로 떨어뜨리고 원문을 `systemErr` 에 통째로 남긴다** — 조용히 통과시키지 않는다.

---

## 7. API 스펙

기존 프런트 서비스가 `/api/automation-tests` 를 베이스로 쓰므로(`services/automationTestService.js`) 같은 네임스페이스 아래 둔다.

### `POST /api/automation-tests/agent-runs`
```jsonc
// 요청
{
  "projectId": "uuid",
  "runName": "스모크 — 로그인/검색",
  "testCaseIds": ["uuid1", "uuid2"],
  "profileId": "uuid",         // 생략 시 프로젝트 기본 프로필
  "llmConfigId": "uuid",       // 생략 시 LlmConfigService.getDefaultConfig()
  "testPlanId": null
}
// 응답 202
{ "agentRunId": "uuid", "status": "QUEUED", "totalCases": 2 }
```

### `GET /api/automation-tests/agent-runs/{id}`
실행 메타 + 케이스별 진행 상태 + 누적 비용.

### `GET /api/automation-tests/agent-runs/{id}/stream`  *(text/event-stream)*
```
event: step
data: {"stepIndex":7,"testCaseId":"...","actionType":"click","thought":"로그인 버튼을 찾았다",
       "observation":"이동 완료","screenshotUrl":"/api/.../screenshot/abc.png","status":"OK"}

event: case-done
data: {"testCaseId":"...","status":"PASSED","summary":"...","costUsd":0.041}

event: run-done
data: {"agentRunId":"...","status":"COMPLETED","junitResultId":"uuid","totalCostUsd":0.083}
```

### `POST /api/automation-tests/agent-runs/{id}/cancel`
실행 중단. 런너에 취소 신호, 진행분까지 결과로 확정.

### `GET /api/automation-tests/agent-runs/{id}/steps?testCaseId=`
스텝 로그 페이징 조회 (SSE 놓친 경우·사후 조회용).

### 프로필 CRUD
`GET|POST /api/automation-tests/agent-profiles` , `GET|PUT|DELETE /api/automation-tests/agent-profiles/{id}` — 응답에서 `context_json` 값은 마스킹.

### 런너 → 백엔드 콜백 (내부, ServiceApiKey 인증)
`POST /api/internal/agent-runs/{id}/events` — 런너가 스텝마다 호출. 백엔드가 DB 저장 + SSE 팬아웃.

### agent-runner 자체 API
`POST /run` (실행 시작) · `POST /cancel/{runId}` · `GET /health`

---

## 8. 프런트엔드

### 8-1. S8 화면 구조 변경

`App.jsx` 의 automation 탭 본문을 **서브탭 2개**로 감싼다. 라우트·화면 ID·`projectNavItems.js` 는 손대지 않는다.

| 서브탭 | 내용 | 컴포넌트 |
|---|---|---|
| 결과 (기본) | 지금 그대로 | `JunitResultDashboard` (무변경) |
| **에이전트 실행** | 신규 | `AgentRunPanel` |

목록 행에는 `source` 배지를 붙인다 — `XML` / `AI 에이전트`. 이건 `JunitResultDashboard` 의 컬럼 1개 추가로 끝난다.

### 8-2. 신규 컴포넌트

```
src/main/frontend/src/components/AgentRun/
  AgentRunPanel.jsx        서브탭 루트 — 실행 목록 + 새 실행 버튼
  AgentRunSetupDialog.jsx  케이스 선택(트리 재사용) · 프로필 · LLM · 예상비용 안내
  AgentRunLiveView.jsx     좌: 스텝 타임라인 / 우: 최신 스크린샷 크게
  AgentStepTimeline.jsx    thought·action·observation·상태 배지
  AgentProfileDialog.jsx   정책/컨텍스트 JSON 편집 (값 마스킹)
src/main/frontend/src/services/agentRunService.js
src/main/frontend/src/hooks/useAgentRunStream.js   EventSource 래퍼 (신규 패턴)
```

`agentRunService.js` 는 `automationTestService.js` 의 싱글턴 + `getDynamicApiUrl()` + Bearer 토큰 패턴을 그대로 따른다.

### 8-3. 실시간 화면

참고 글의 핵심 가치는 "에이전트가 지금 뭘 하는지 보이는 것"이다. `AgentRunLiveView` 는:
- 스텝이 도착할 때마다 타임라인에 append, 자동 스크롤
- 최신 스크린샷을 우측에 크게. 클릭하면 라이트박스
- 상단에 진행률(`finishedCases/totalCases`) + 누적 비용($) + 경과 시간
- 연결이 끊기면 폴링(`/steps`)으로 폴백 — SSE 는 프록시 환경에서 끊길 수 있다

### 8-4. i18n

CLAUDE.md 규약대로 새 문구는 **작성 시점에** `t("키", "한국어")` + 시드를 함께 넣는다.
- `config/i18n/keys/AgentRunKeysInitializer.java` 신설 → `TranslationKeyDataInitializer` 에 등록
- `translations/KoreanAgentRunTranslations.java` / `EnglishAgentRunTranslations.java` 신설
- 키 프리픽스: `agentRun.*`

---

## 9. 백엔드 구현

```
controller/AgentRunController.java          공개 API (5개)
controller/AgentProfileController.java      프로필 CRUD
controller/internal/AgentEventController.java  런너 콜백 수신 (ServiceApiKey 인증)

service/agent/AgentRunService.java          검증·생성·조회·취소
service/agent/AgentRunWorker.java           @Async, 런너 호출 + 수명주기
service/agent/AgentPromptBuilder.java       TestCase+TestStep+Profile → 프롬프트
service/agent/AgentResultNormalizer.java    후처리 LLM → 표준 JSON
service/agent/AgentJunitWriter.java         AgentRun → JunitTestResult/Suite/Case
service/agent/AgentEventBroker.java         SseEmitter 레지스트리 + 팬아웃
service/agent/AgentRunnerClient.java        agent-runner HTTP 클라이언트

repository/AgentRunRepository.java
repository/AgentStepLogRepository.java
repository/AgentProfileRepository.java
```

- 비동기는 기존 `config/AsyncConfig.java` 의 ThreadPoolTaskExecutor 를 쓰되, 에이전트 전용 풀을 분리한다(런이 길어 기존 풀을 굶긴다).
- 동시 실행 상한을 시스템 설정으로 둔다 (`SystemSetting`, 기본 2). 초과 요청은 `QUEUED` 로 대기.
- 스크린샷은 `MinIOService` 로 `agent-runs/{runId}/{stepIndex}.png` 에 저장. 조회는 프리사인 URL 또는 프록시 엔드포인트.
- 감사 로그: 실행 시작·취소를 `AuditLog` 에 남긴다 (누가·언제·어떤 프로필·어떤 케이스).

### 9-1. JUnit 매핑 규칙

| 에이전트 개념 | JUnit 엔티티 |
|---|---|
| AgentRun 1건 | `JunitTestResult` 1건 (`source=LLM_AGENT`, `testExecutionName=runName`, `fileName=null`) |
| 케이스 묶음 (폴더 기준 or 단일) | `JunitTestSuite` |
| TestCase 1건 | `JunitTestCase` (`name=displayId + name`, `classname=폴더경로`, `time=실행초`, `linkedTestCaseId=TestCase.id`) |
| 정규화 결과 | `status`, `failureMessage`, `systemOut`(summary+evidence), `systemErr`(원문) |

`linkedTestCaseId` 를 채우면 **기존 `GET /{testResultId}/linked-testcases` 역참조가 그대로 동작**한다. 케이스 상세에서 "이 케이스의 자동화 이력"을 보는 흐름이 공짜로 붙는다.

---

## 10. agent-runner (Python 사이드카)

```
agent-runner/
  app/main.py            FastAPI — /run /cancel/{id} /health
  app/runner.py          케이스 1건 = 자식 프로세스 1개, Queue 로 이벤트 수집
  app/agent.py           browser-use Agent 래핑, use_vision
  app/llm_factory.py     provider 별 LangChain LLM 생성 (백엔드가 넘긴 설정으로)
  app/callback.py        스텝 이벤트 → 백엔드 콜백 POST (재시도 포함)
  app/storage.py         스크린샷 MinIO 업로드
  requirements.txt
  Dockerfile
```

- 참고 글의 프로세스 격리를 그대로 따른다 — `multiprocessing.Process` + `Queue`. 브라우저가 죽어도 런너 본체는 산다.
- 헤드리스 기본, 프로필 옵션으로 headed 전환(디버깅용).
- `docker-compose-build/` 에 `agent-runner` 서비스 추가. 프로파일로 끌 수 있게 한다.
- 백엔드는 `agent.runner.base-url` 설정이 비어 있으면 기능 자체를 비활성으로 표시한다.

---

## 11. 단계별 진행

| Phase | 범위 | 완료 기준 |
|---|---|---|
| **0. 골격** | 엔티티 3종 + 리포지터리 + 컨트롤러 스켈레톤 + `JunitTestResult.source` 추가 | 앱 기동, 기존 자동화 화면 회귀 없음 |
| **1. 런너 최소 루프** | agent-runner 컨테이너 + browser-use 1케이스 실행 + 콜백 | 케이스 1건이 실제 브라우저에서 끝까지 돌고 스텝 로그가 DB 에 남는다 |
| **2. 프롬프트·프로필** | `AgentPromptBuilder` + `AgentProfile` CRUD + 컨텍스트 주입/암호화 + 가드레일 | 케이스 본문에 계정 없이 로그인 스텝이 통과한다 |
| **3. 결과 정규화·적재** | `AgentResultNormalizer` + `AgentJunitWriter` | 실행 결과가 기존 자동화 목록에 `AI 에이전트` 배지로 뜨고 상세가 열린다 |
| **4. 실시간 UI** | SSE + `AgentRunPanel`·`AgentRunLiveView` + i18n | 실행 중 스텝/스크린샷이 흐르고, 새로고침해도 사후 조회로 복구된다 |
| **5. 운영** | 비용 집계·동시성 상한·취소·감사 로그·E2E | 20케이스 스모크가 재실행 가능하고 비용이 보인다 |

각 Phase 끝에서 `.claude/SESSION_LOG.md` 를 갱신한다 (CLAUDE.md §0).

---

## 12. 테스트

**단위** — `AgentPromptBuilder`(컨텍스트 주입·마스킹), `AgentResultNormalizer`(정상/깨진 JSON/빈 응답), `AgentJunitWriter`(상태 매핑 4종), 가드레일 검증(허용 도메인 밖 URL 거부).

**통합** — 런너를 목으로 세우고 콜백 → DB → SSE 까지의 경로. 취소 요청 시 진행분 확정.

**E2E** (`src/test/e2e/`) — `AgentRunPage.js` 페이지 오브젝트 신설. 시나리오: 케이스 2건 선택 → 실행 → 스텝 도착 확인 → 결과가 자동화 목록에 생성됨.

**수동** — 참고 글이 지목한 취약 지점을 일부러 친다. ① 같은 케이스 3회 실행해 결과 편차 기록 ② 허용 도메인 밖 링크가 있는 케이스 ③ 스텝 40개 초과 케이스(상한 동작) ④ 런너 강제 종료 시 실행이 `FAILED` 로 정리되는지.

**i18n** — `scripts/i18n_scan.py` 로 하드코딩 한국어 0건 확인, 영어 모드 왕복 확인.

---

## 13. 알려진 한계 — 화면에도 적는다

참고 글이 실측으로 밝힌 내용이라 그대로 인용해 사용자에게 고지한다.

| 한계 | 실측치/내용 | 우리 대응 |
|---|---|---|
| 느리다 | 간단한 케이스도 30초~1분 | 예상 소요를 실행 전 안내, 스모크 위주 권장 |
| 비싸다 | 케이스당 $0.03~$0.10 | 실행 전 예상 비용 표시, 실행별 실비 집계, 경량 모델 선택 허용 |
| 비결정적 | 같은 케이스도 매번 조금씩 다르게 행동 | temperature 낮춤, 재현성 필요 케이스는 JUnit 자동화 병행 권장 문구 |
| 오판 | 복잡·모호한 UI 에서 틀린 판단 | 가드레일 + 실패 시 원문 보존, FAIL 은 사람이 확인 |
| 복잡 시나리오 취약 | 다중 페이지·파일 업로드·캡차 불안정 | MVP 미지원으로 명시, 스텝 상한으로 폭주 차단 |

**포지셔닝** — 스크립트 자동화의 대체가 아니라 **탐색적 테스트·회귀 초안·반복 스모크의 보완재**다. 이 문장을 화면 안내문에도 넣는다.

---

## 14. 의존성

**Python (agent-runner)** — `browser-use`, `playwright`, `fastapi`, `uvicorn`, `langchain-openai` / `langchain-anthropic` / `langchain-google-genai`, `minio`, `httpx`

**Java** — 신규 라이브러리 없음. `SseEmitter`(Spring Web), `MinIOService`, `LlmConfigService`, `AsyncConfig` 모두 기존 것.

**프런트** — 신규 패키지 없음. `EventSource` 는 브라우저 내장.

**인프라** — agent-runner 컨테이너(브라우저 포함, 이미지 크다), MinIO 버킷 용량(스크린샷 누적 → 보존기간 정책 필요, 기본 30일 제안).

---

## 15. 열린 질문 — 착수 전에 정해야 한다

1. **에이전트 결과를 `TestResult`(수동 실행)에도 반영할 것인가?** 지금 계획은 JUnit 3계층에만 적재한다. 테스트실행(`TestExecution`)에 자동 반영하면 QA 지표가 섞인다. 별도 결정 필요.
2. **컨텍스트 JSON 암호화 키 관리** — `LlmConfig` API 키와 같은 경로를 쓸지, 프로젝트별 키를 둘지.
3. **케이스 선택 단위** — 개별 케이스 다중 선택만 할지, 폴더/테스트플랜 단위 실행까지 허용할지. (플랜 단위가 실사용에 가깝다)
4. **모델 기본값** — 참고 글은 Claude Sonnet 4 를 메인으로 썼다. 우리는 Anthropic 클라이언트가 `service/llm/` 에 없다. Anthropic 클라이언트를 추가할지, OpenAI-호환 경로로 우회할지 결정 필요.
5. **셀프호스팅 고객 대응** — 브라우저 포함 컨테이너를 강제할 수 없는 환경에서는 이 기능을 어떻게 끌 것인가. (설정 플래그로 숨김이 기본안)

---

## 16. 참고

- 원문: 「LLM 기반 TestRail 테스트 자동화 에이전트 구축」, Taeshkim (Worxphere/잡코리아 QA), 2026-07-21, techblog.jobkorea.co.kr
- 원문 기술 스택: Django + Django Channels(WebSocket), Celery, Redis, browser-use + Playwright, LangChain, Claude Sonnet 4 / GPT-4o / Gemini 2.0 Flash, TestRail API
- 레포 내 관련 파일:
  - `src/main/java/.../controller/JunitResultController.java`
  - `src/main/java/.../model/JunitTestResult.java` · `JunitTestSuite.java` · `JunitTestCase.java`
  - `src/main/java/.../model/TestCase.java` · `TestStep.java`
  - `src/main/java/.../service/llm/` (LLM 클라이언트 7종 + `LlmClientFactory`)
  - `src/main/java/.../controller/RagChatController.java` (SSE 선례, L83·L113)
  - `src/main/java/.../service/MinIOService.java`
  - `src/main/frontend/src/components/JunitResult/JunitResultDashboard.jsx`
  - `src/main/frontend/src/services/automationTestService.js`
  - `src/main/frontend/src/components/navigation/projectNavItems.js`
  - `src/main/frontend/src/constants/screenIds.js` (S8)
