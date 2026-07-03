# AgensGraph 기반 테스트 케이스·오류 그래프 구현 계획

> **버전 타깃:** 1.0.x → **1.1.1** (신규 태깅)
> **그래프 엔진:** AgensGraph 2.16.9 (PostgreSQL 16.9 기반, `skaiworldwide/agensgraph`)
> **프런트엔드:** Cytoscape.js (<https://cytoscape.org/>)
> **작성일:** 2026-07-04
> **상태:** 구현 계획 (Draft)

---

## 0. 요약 (Executive Summary)

testcasecraft에 그래프 데이터 모델을 도입한다. 목적은 두 가지다. 테스트 케이스·실행·결과·오류 사이의 관계를 그래프로 시각화하는 것, 그리고 테스트 케이스 자체를 그래프 기반으로 만들거나 기존 케이스를 전환할 수 있게 하는 것. 기존 관계형(1.0.x) 자산은 손대지 않고, 그래프는 그 위에 얹는 추가 기능으로 간다.

주요 결정 사항은 다음과 같다.

| 항목 | 결정 | 근거 |
|------|------|------|
| 그래프 엔진 | **AgensGraph 2.16.9** 별도 인스턴스 | PG16 기반 → 현재 메인(pgvector/**pg18**)과 동거 불가, 별도 컨테이너 필수 |
| 배치 토폴로지 | 메인 DB=SSOT, AgensGraph=그래프 프로젝션/저작 스토어 | 관계형 자산 보존 + 그래프 이점 병행 |
| 프런트 | Cytoscape.js (react-cytoscapejs) | 대규모 그래프·레이아웃·필터 강력, MUI와 병존 |
| 버전 | **1.1.1** | 상향 호환(1.0.x→1.1.1 OK), 하향 비호환(1.1.1→1.0.x 불가) |
| 전환 | 시나리오 선택식 (기본 / 그래프 / 기본→그래프) | 사용자가 케이스 단위로 표현 방식 선택 |

---

## 1. 배경 & 두 가지 "그래프" 개념 정리 (혼동 방지)

이번 작업에서 말하는 "그래프"는 사실 두 가지다. 헷갈리기 쉬우니 처음부터 구분해 둔다.

### 1-A. 관계 그래프 (Relationship / Metadata Graph) — *시각화용*
프로젝트 → 폴더 → 테스트 케이스 → 계획 → 실행 → 결과 → 오류 유형으로 이어지는 관계망을 그래프로 그린다. 같은 오류가 어느 케이스·폴더·실행에 걸쳐 반복되는지 눈으로 확인하는 용도다. (최초 요청)

### 1-B. 그래프 테스트 케이스 (Graph-native Test Case) — *저작·전환용*
테스트 케이스의 내용 자체를 선형 스텝 리스트 대신 노드(스텝/전제/분기/상태)와 엣지(흐름/전이/의존)로 모델링한다. 분기나 상태전이가 있는 시나리오는 이쪽이 표현하기 훨씬 자연스럽다. (신규 요청)

> 두 개념 모두 **동일한 AgensGraph 인스턴스** 안에서, **서로 다른 그래프(graph namespace) 또는 라벨 집합**으로 공존한다.

---

## 2. 현행 시스템 분석 (As-Is)

코드베이스 조사 결과 (근거 파일 경로 병기):

### 2-A. 데이터베이스
- **메인 DB:** `pgvector/pgvector:pg18`, DB=`testcase_management`, 포트 `5434:5432` (`docker-compose-build/docker-compose.yml:122-134`)
- **RAG DB:** `rag_db` (동일 인스턴스, pgvector 사용)
- **드라이버/ORM:** `org.postgresql:postgresql:42.7.11`, Spring Data JPA/Hibernate, **Flyway** (`classpath:db/migration`) (`build.gradle:371-378`, `application.yml:18-20`)

### 2-B. 핵심 엔티티 (그래프 모델의 원천)
| 엔티티 | 파일 | 그래프 관점 핵심 필드 |
|--------|------|----------------------|
| `Project` | `model/Project.java` | id, name, code, organization |
| `TestCase` | `model/TestCase.java` | id, displayId, name, type, priority, isAutomated, **parentId(폴더 계층)**, **steps(TestStep 리스트)**, expectedResults, preCondition, postCondition, tags, linkedDocumentIds |
| `TestPlan` | `model/TestPlan.java` | id, name, **testCaseIds(리스트)** |
| `TestExecution` | `model/TestExecution.java` | id, name, status, testPlanId |
| `TestResult` | `model/TestResult.java` | id, **result(PASS/FAIL/BLOCKED/NOT_RUN)**, testCaseId, executedBy, **jiraIssueKey** |
| `TestSessionBug` | `model/TestSessionBug.java` | title, **severity**, jiraIssueKey (탐색적 테스트 결함) |
| `JunitTestCase` | `model/JunitTestCase.java` | name, className, status, **failureType**, failureMessage, stackTrace |

### 2-C. 프런트엔드
- `src/main/frontend/` — **Vite + React 18 + MUI 7 + recharts + react-router 7 + axios** (`package.json`)
- 상태 관리: **ProjectContext** (⚠️ `@tanstack/react-query` **미설치** — import 시 빌드 깨짐. 메모리 `frontend-react-query-dead-code` 참조)
- 그래프 라이브러리: **없음** (신규 도입 대상)

### 2-D. 제약 & 시사점
1. AgensGraph 2.16.9는 PostgreSQL 16.9 기반 포크다. 메인 DB가 pg18이라 같은 인스턴스에 합칠 수 없고, 별도 컨테이너로 가는 수밖에 없다.
2. Flyway가 이미 깔려 있어서 스키마 변경은 additive 마이그레이션으로 안전하게 처리할 수 있다.
3. 프런트에 react-query가 없으므로 그래프 데이터 페칭도 기존 axios + ProjectContext 패턴을 따른다.

---

## 3. 목표 아키텍처 (To-Be)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         testcasecraft (Spring Boot)                    │
│                                                                        │
│   ┌──────────────┐    ┌─────────────────┐    ┌────────────────────┐   │
│   │ 기존 REST API │    │ GraphController  │    │ GraphSyncService   │   │
│   │ (/api/v1/*)  │    │ (/api/graph/*)   │    │ (@Scheduled+이벤트)│   │
│   └──────┬───────┘    └────────┬─────────┘    └─────────┬──────────┘   │
│          │ JPA/Hibernate       │ JdbcTemplate            │ ETL          │
└──────────┼─────────────────────┼─────────────────────────┼─────────────┘
           │                     │                          │
           ▼                     ▼                          │
   ┌────────────────┐   ┌──────────────────────┐            │
   │  메인 DB (SSOT) │   │  AgensGraph 2.16.9    │◀───────────┘
   │  pgvector/pg18 │   │  (PG16, 포트 5436)     │  MERGE(Cypher)
   │  testcase_mgmt │   │  graph: tc_graph       │
   │  :5434         │   │   - 관계 그래프(1-A)    │
   └────────────────┘   │   - 그래프 TC(1-B)      │
                        └──────────┬───────────┘
                                   │ {nodes, edges} JSON
                                   ▼
                        ┌──────────────────────┐
                        │  React + Cytoscape.js │
                        │  /graph, /graph-tc    │
                        └──────────────────────┘
```

**원칙:**
- **메인 DB = 관계형 자산의 SSOT.** 그래프는 여기서 파생(관계 그래프) 또는 여기에 역투영(그래프 TC).
- **AgensGraph = 그래프 시각화 + 그래프-네이티브 TC 저작 스토어.**
- 두 저장소 간 **양방향 동기화**(프로젝션): 관계형↔그래프.

---

## 4. 그래프 데이터 모델

AgensGraph에서 `CREATE GRAPH tc_graph;` 후 아래 라벨을 정의한다. (VLABEL=정점, ELABEL=간선)

### 4-A. 관계 그래프 라벨 (시각화)

**정점(VLABEL):**
| 라벨 | 주요 속성 | 관계형 원천 |
|------|-----------|-------------|
| `Project` | id, name, code | Project |
| `Folder` | id, name | TestCase(type='folder') / parentId 계층 |
| `TestCase` | id, displayId, name, type, priority, isAutomated | TestCase |
| `TestPlan` | id, name | TestPlan |
| `TestExecution` | id, name, status | TestExecution |
| `TestResult` | id, result, executedAt | TestResult |
| `Bug` | id, title, severity | TestSessionBug |
| `JunitCase` | id, name, className, status | JunitTestCase |
| `FailureType` | signature, message | JunitTestCase.failureType / 정규화 |
| `User` | id, username | User |
| `JiraIssue` | key, url | TestResult.jiraIssueKey / Bug.jiraIssueKey |

**간선(ELABEL):**
```
(Project)   -[:CONTAINS]->     (Folder|TestCase)
(Folder)    -[:PARENT_OF]->    (Folder|TestCase)     // parentId 계층
(Project)   -[:HAS_PLAN]->     (TestPlan)
(TestPlan)  -[:INCLUDES]->     (TestCase)             // testCaseIds
(TestExecution) -[:FROM_PLAN]->(TestPlan)
(TestResult)-[:OF_CASE]->      (TestCase)
(TestResult)-[:IN_EXECUTION]-> (TestExecution)
(TestResult)-[:EXECUTED_BY]->  (User)
(TestResult)-[:FAILED_WITH]->  (FailureType)          // result=FAIL → 오류 클러스터
(JunitCase) -[:FAILED_WITH]->  (FailureType)
(Bug)       -[:AFFECTS]->      (TestCase)
(Bug)       -[:REPORTED_AS]->  (JiraIssue)
(TestResult)-[:LINKED_TO]->    (JiraIssue)
(TestCase)  -[:SIMILAR_TO]->   (TestCase)             // (선택) pgvector 임베딩 유사도
```

> `FailureType`을 허브로 두는 이유: 같은 근본원인(failureType/stackTrace 시그니처)이 어느 케이스·폴더·실행까지 퍼져 있는지가 그래프에서 바로 보인다. stackTrace는 상위 N개 프레임을 해시해서 시그니처로 만든다.

### 4-B. 그래프 테스트 케이스 라벨 (저작)

하나의 그래프 TC는 `GraphTestCase` 루트 정점 + 스텝 서브그래프로 구성한다.

**정점:**
| 라벨 | 속성 | 의미 |
|------|------|------|
| `GraphTestCase` | id(=TestCase.id), name, projectId | 그래프 TC 루트 |
| `StepNode` | id, order, action, expected | 실행 스텝 |
| `Precondition` | id, text | 전제조건 |
| `Decision` | id, condition | 분기(조건) |
| `State` | id, name | 상태(상태전이 테스트용) |
| `Expected` | id, text | 기대 결과 |

**간선:**
```
(GraphTestCase)-[:STARTS_AT]-> (StepNode|Precondition)
(StepNode)     -[:NEXT]->      (StepNode|Decision)      // 순차 흐름
(Decision)     -[:ON {label}]->(StepNode)               // 분기 (label: 'Yes'/'No'/조건)
(StepNode)     -[:VERIFIES]->  (Expected)
(State)        -[:TRANSITION {event}]-> (State)         // 상태전이
(StepNode)     -[:DEPENDS_ON]->(StepNode)               // 의존
```

> 기본(선형) TC를 전환하면 스텝 N개 → `StepNode` N개 + `NEXT` 간선 N-1개로 매핑된다(§6).

---

## 5. 표현 이중화 & 관계형 역투영

> 요구: **"그래프로 만든 테스트 케이스를 관계형 DB에서도 볼 수 있게."**

### 5-A. TestCase 표현 모드 (additive 컬럼)

`TestCase`에 컬럼 추가 (Flyway, nullable/default → 1.0.x 호환):

```sql
ALTER TABLE testcase
  ADD COLUMN representation_mode VARCHAR(10) NOT NULL DEFAULT 'BASIC',  -- BASIC | GRAPH | HYBRID
  ADD COLUMN graph_vertex_id     VARCHAR(64),   -- AgensGraph GraphTestCase 정점 참조
  ADD COLUMN graph_synced_at     TIMESTAMP;     -- 마지막 프로젝션 시각
```

| 모드 | SSOT | 관계형 스텝(testcasesteps) | 그래프(AgensGraph) |
|------|------|---------------------------|--------------------|
| `BASIC` | 관계형 | 원본(편집 대상) | 없음 |
| `GRAPH` | 그래프 | **프로젝션(read-only 미러)** | 원본(편집 대상) |
| `HYBRID` | 그래프 | 프로젝션(대표 경로) | 원본, 분기 포함 |

### 5-B. 관계형 역투영 (Graph → Relational)

그래프 TC를 기존 `testcasesteps` 테이블로 **평탄화**하여 기존 스프레드시트/폼(1.0.x UI 포함)에서 그대로 조회 가능하게 한다.

**직렬화 규칙:**
1. `GraphTestCase`에서 `STARTS_AT` → `NEXT`를 따라 **주 경로(main path)** 를 위상정렬로 추출.
2. 분기(`Decision`)가 있으면 대표 경로(기본 분기) 를 선형화 + `notes`에 "분기 존재: N개 경로" 주석 → `representation_mode=HYBRID`.
3. 각 `StepNode` → `TestStep{order, action, expected}` 행으로 기록.
4. `graph_synced_at` 갱신. 관계형 미러는 **read-only** (편집 시 그래프에서 재생성).

> 이렇게 하면 그래프 TC도 항상 관계형 표에서 조회할 수 있다. 분기 구조 전체는 그래프 뷰에서 보고, 선형 요약은 관계형 쪽에 늘 남는다.

### 5-C. 편집 충돌 방지
- 편집은 `representation_mode`가 지정한 SSOT 쪽에서만 허용.
- 반대편은 재생성(regenerate)으로만 갱신한다. 양쪽을 따로 고치는 일이 생기지 않는다.
- UI에 "이 케이스는 그래프 모드 — 관계형 뷰는 읽기 전용" 배지 표시.

---

## 6. 시나리오 선택식 저작·전환

케이스 생성/편집 진입 시 **표현 방식을 선택**한다.

```
┌─────────────────────────────────────────────────────────────┐
│  새 테스트 케이스 만들기                                       │
│  ○ 기본 테스트 케이스     (선형 스텝 — 현재 방식)             │
│  ○ 그래프 테스트 케이스   (분기·상태전이 — Cytoscape 저작)    │
│  ○ 기존 케이스를 그래프로 전환                                 │
└─────────────────────────────────────────────────────────────┘
```

### 시나리오 A — 기본 테스트 케이스
- 지금과 완전히 같은 동작이다(`representation_mode=BASIC`). AgensGraph를 거치지 않으므로 회귀 걱정이 없다.

### 시나리오 B — 그래프 테스트 케이스 (신규 저작)
1. Cytoscape 편집기에서 `StepNode`/`Decision`/`Expected`를 배치·연결.
2. 저장 시: 메인 DB에 `TestCase{representation_mode=GRAPH}` 행 생성(메타) + AgensGraph에 서브그래프 `MERGE`.
3. 즉시 **관계형 역투영**(§5-B) 실행 → `testcasesteps` 미러 생성.

### 시나리오 C — 기본 → 그래프 전환 (마이그레이션)
**변환 알고리즘 (BASIC → GRAPH):**
```
입력:  TestCase.steps = [s1, s2, ..., sn] (순서 보존)
출력:  GraphTestCase 서브그래프
절차:
  MERGE (g:GraphTestCase {id: tc.id})
  preCondition  → (p:Precondition)  ; (g)-[:STARTS_AT]->(p)-[:NEXT]->(첫 StepNode)
  각 si         → (n_i:StepNode {order:i, action:si.action, expected:si.expected})
  n_i -[:NEXT]-> n_{i+1}                    // 선형 체인
  si.expected   → (e_i:Expected) ; (n_i)-[:VERIFIES]->(e_i)
  postCondition → 마지막 StepNode -[:NEXT]-> (Expected/State)
사후:  representation_mode = GRAPH, graph_vertex_id 기록, 관계형 미러 유지
```
- 전환은 비파괴적이다. 원본 `testcasesteps`는 미러로 남고 SSOT만 그래프로 옮겨 간다.
- **일괄 전환(bulk)**: 폴더/프로젝트 단위로 다건 전환하는 관리자 배치 제공(§8 Phase 5).
- **롤백**: `GRAPH → BASIC` 역전환 = 현재 관계형 미러를 SSOT로 승격 + 그래프 정점 보관/삭제 선택.

### 전환 매트릭스
| From \ To | BASIC | GRAPH |
|-----------|-------|-------|
| **BASIC** | — | 시나리오 C (선형→그래프) |
| **GRAPH** | 역전환(미러 승격) | — |

---

## 7. 동기화 / ETL 설계

### 7-A. 관계 그래프(1-A) 동기화 — 파생
- **초기 풀 적재:** 배치가 메인 DB에서 SELECT → AgensGraph에 멱등 `MERGE`.
- **증분:** `updated_at` 델타 기반. 트리거 방식 3종 (조합):
  1. `@Scheduled` 주기 배치 (기본, 예: 5분).
  2. 도메인 이벤트 훅 (`event` 패키지 활용 — 결과 기록/케이스 변경 시).
  3. 관리자 수동 트리거 (`POST /api/graph/sync`).
- 모든 upsert는 `MERGE (n:Label {id})` + `SET` 패턴이라 몇 번을 돌려도 결과가 같다.

### 7-B. 그래프 TC(1-B) 동기화 — 역투영
- 그래프 TC 저장/편집 → 즉시 관계형 미러 재생성(§5-B), 동기 실행(트랜잭션 경계 주의: 2-phase 아님 → 실패 시 보상/재시도 큐).

### 7-C. 정합성 정책
- 관계 그래프는 **최종 일관성(eventual)** — read-model 특성 명시, 재적재 가능.
- 그래프 TC 미러는 **쓰기 직후 일관성** 목표 — 실패 시 `graph_synced_at` 미갱신으로 감지 + 재시도.

---

## 8. 백엔드 구현

### 8-A. 두 번째 DataSource
- AgensGraph는 표준 PostgreSQL 와이어 프로토콜 → **`org.postgresql` 드라이버 그대로** 사용 가능.
- `GraphDataSourceConfig` — `@ConfigurationProperties("spring.graph-datasource")`, 전용 `JdbcTemplate`(`graphJdbcTemplate`). JPA 엔티티 매핑 없이 JdbcTemplate 전용.
- 세션마다 `SET graph_path = tc_graph;` 후 Cypher 실행.

### 8-B. Cypher 실행 & JSON 매핑
- AgensGraph는 SQL 문맥에서 `MATCH ... RETURN ...` 직접 실행. 반환 `vertex`/`edge` 타입을 `{id,label,properties}` / `{start,end,label,properties}` 로 파싱 → `GraphResponse{nodes[], edges[]}`.
- `GraphQueryService` — 파라미터 바인딩(Cypher 인젝션 방지: 화이트리스트 + 파라미터화), 프로젝트 스코프 강제.

### 8-C. REST 엔드포인트 (신규, `/api/graph/*`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/graph/project/{id}/structure` | 프로젝트 구조 그래프(폴더·케이스·계획·실행) |
| GET | `/api/graph/failures?projectId=&from=&to=` | 오류 클러스터 그래프(FailureType 허브) |
| GET | `/api/graph/testcase/{id}/neighborhood?depth=` | 케이스 이웃 그래프 |
| GET | `/api/graph/testcase/{id}/steps` | 그래프 TC 스텝 서브그래프(저작 뷰) |
| POST | `/api/graph/testcase/{id}/convert` | 기본→그래프 전환(시나리오 C) |
| POST | `/api/graph/testcase` | 그래프 TC 신규 저장(시나리오 B) |
| PUT | `/api/graph/testcase/{id}/steps` | 그래프 TC 스텝 편집 |
| POST | `/api/graph/testcase/{id}/revert` | 그래프→기본 역전환 |
| POST | `/api/graph/sync` | 관계 그래프 수동 재동기화(관리자) |

- **권한:** 모든 엔드포인트 `@PreAuthorize` + 프로젝트 멤버십 검증. (메모리 `backend-test-gate-layout` — 통합테스트는 실제 Postgres 사용, 그래프 테스트도 Testcontainers AgensGraph 권장.)
- AgensGraph **Row-Level Security가 Cypher에도 적용** → 프로젝트 스코프를 DB 레벨에서 이중 방어 가능.

### 8-D. 모듈 배치
```
controller/GraphController.java
service/graph/GraphQueryService.java
service/graph/GraphSyncService.java
service/graph/TestCaseGraphConverter.java   // §6 변환/역투영
config/GraphDataSourceConfig.java
dto/graph/GraphResponse.java (nodes/edges)
```

---

## 9. 프런트엔드 구현 (Cytoscape.js)

### 9-A. 의존성
```jsonc
// src/main/frontend/package.json 추가
"cytoscape": "^3.30.0",
"react-cytoscapejs": "^2.0.0",
"cytoscape-fcose": "^2.2.0",      // force-directed 레이아웃
"cytoscape-dagre": "^2.5.0"        // DAG/흐름 레이아웃(그래프 TC용)
```
- ⚠️ react-query 미사용 → 데이터 페칭은 **axios + ProjectContext** 패턴 준수 (메모리 `frontend-react-query-dead-code`).
- 모든 사용자 노출 문구는 **`t("키","한국어")`** 래핑 + 시드 추가 (메모리 `i18n-architecture`, 한/영 동시).

### 9-B. 화면/라우트
| 라우트 | 뷰 | 내용 |
|--------|-----|------|
| `/graph/structure` | 구조 그래프 | 프로젝트→폴더→케이스→계획→실행 (dagre/fcose 토글) |
| `/graph/failures` | **오류 클러스터** | FailureType 허브 방사형, 노드 크기=발생 빈도, 색=severity |
| `/graph/testcase/:id` | 케이스 이웃 | 선택 케이스 중심 depth 조절 |
| `/graph-tc/:id/edit` | **그래프 TC 편집기** | StepNode/Decision 배치·연결(시나리오 B/C) |

- 진입점: 프로젝트 상단에 **"그래프 뷰" 탭** 추가(기존 탭 구조 확장), MUI 스타일 통합.

### 9-C. 인터랙션
- 노드 클릭 → 우측 상세 패널(케이스/결과/오류 상세, 기존 상세 컴포넌트 재사용).
- 필터: 결과(PASS/FAIL/BLOCKED), 우선순위, 기간, 자동화 여부.
- 레이아웃 토글, 오류 hotspot 강조, 확대/축소·검색.
- 그래프 TC 편집기: 노드 추가·드래그·간선 연결, 분기 라벨 편집, 저장 시 §8-C API 호출.

### 9-D. 공통 컴포넌트
```
components/Graph/GraphCanvas.jsx        // react-cytoscapejs 래퍼(레이아웃/스타일)
components/Graph/GraphToolbar.jsx       // 필터·레이아웃·검색
components/Graph/NodeDetailPanel.jsx
components/Graph/TestCaseGraphEditor.jsx // 시나리오 B/C 저작
services/graphApi.js                    // axios 호출
```

---

## 10. 버전 & 호환성 정책 (1.0.x → 1.1.1)

> 요구: **낮은 버전→높은 버전 사용 가능(상향 호환), 높은 버전→낮은 버전 사용 불가(하향 비호환).** 태깅 **1.1.1**.

### 10-A. 호환성 계약
| 방향 | 지원 | 설명 |
|------|------|------|
| **1.0.x 데이터 → 1.1.1** | ✅ 상향 호환 | 기존 관계형 케이스는 `representation_mode=BASIC` 기본값으로 그대로 동작. 추가 컬럼/테이블/그래프는 옵셔널. |
| **1.1.1 → 1.0.x** | ❌ 하향 비호환 | GRAPH/HYBRID 케이스는 1.0.x 클라이언트가 완전히 표현 못함(그래프 미인지). 다운그레이드 공식 미지원. |

### 10-B. 상향 호환 보장 설계
1. **Additive-only 스키마 마이그레이션** (Flyway): 신규 컬럼은 전부 nullable/DEFAULT, 기존 컬럼·테이블 변경 없음.
2. **API 버저닝:** 기존 `/api/v1/*` 계약 불변. 그래프는 **신규 경로 `/api/graph/*`** 로만 추가.
3. **관계형 미러 보장:** 모든 그래프 TC는 §5-B 역투영으로 관계형 표에 항상 존재 → 그래프 미지원 소비자도 최소 선형 표현 확보.
4. **Feature flag:** `features.graph.enabled` — 미활성 시 1.0.x와 동일 동작(그래프 UI/탭 숨김).

### 10-C. 하향 비호환 명시
- 1.1.1에서 생성된 GRAPH 케이스를 1.0.x 이미지로 롤백하면: 관계형 미러(선형 요약)만 조회 가능, 그래프 편집 불가. 신규 컬럼은 무시됨(추가 컬럼이라 크래시는 없음).
- 릴리즈 노트에 **"1.1.1 이상에서 생성한 그래프 테스트 케이스는 1.0.x로 다운그레이드 시 완전 복원 불가"** 명시.

### 10-D. 태깅
- `incrementVersion` Gradle 태스크로 **app 컴포넌트 1.0.x → 1.1.1** 범프 (SESSION_LOG의 버전 관리 규약 준수).
- Docker 이미지 태그: `xmlangel/testcasecraft:1.1.1`.
- 신규 컴포넌트 `skaiworldwide/agensgraph:2.16.9` 는 compose에 별도 서비스로 고정 태깅.

---

## 11. 배포 (docker-compose)

`docker-compose-build/docker-compose.yml` 에 서비스 추가:

```yaml
  agensgraph:
    image: skaiworldwide/agensgraph:2.16.9
    container_name: testcasecraft-agensgraph
    environment:
      POSTGRES_DB: tc_graph_db
      POSTGRES_USER: graph_user
      POSTGRES_PASSWORD: ${GRAPH_DB_PASSWORD}
    ports:
      - "5436:5432"                       # 메인(5434)과 분리
    volumes:
      - ./data/agensgraph:/var/lib/postgresql/data
      - ./init-scripts/graph:/docker-entrypoint-initdb.d  # CREATE GRAPH + VLABEL/ELABEL
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U graph_user -d tc_graph_db || exit 1"]
```
- app 서비스에 env 추가: `GRAPH_DB_URL=jdbc:postgresql://agensgraph:5432/tc_graph_db`, `GRAPH_DB_USERNAME`, `GRAPH_DB_PASSWORD`, `FEATURES_GRAPH_ENABLED=true`.
- init 스크립트: `CREATE GRAPH tc_graph; CREATE VLABEL ...; CREATE ELABEL ...; CREATE PROPERTY INDEX ...` (§4).
- ⚠️ 이미지 태그 `2.16.9` 실제 존재 여부는 **Phase 0에서 검증**(없으면 소스 빌드 or 최신 2.16 태그). 저장소: `github.com/skaiworldwide-oss/agensgraph`.

---

## 12. 단계별 로드맵 (Phases)

| Phase | 목표 | 산출물 | 예상 |
|-------|------|--------|------|
| **P0 — PoC/검증** | AgensGraph 2.16.9 기동, 이미지 태그·PG16.9 base 확인, 샘플 그래프 수동 적재, Cypher 검증 | 컨테이너 실행 + 검증 노트 | 3~5일 |
| **P1 — 데이터 모델 + 초기 ETL** | §4 라벨 스키마 확정, 인덱스, 관계형→관계 그래프 풀 적재 배치 | init 스크립트, `GraphSyncService` 초판 | 1~2주 |
| **P2 — 백엔드 그래프 API** | 두 번째 DataSource, Cypher→JSON, `/api/graph/*` 조회 API | `GraphController`, `GraphQueryService` | 1~2주 |
| **P3 — 표현 이중화 & 전환** | `representation_mode` 마이그레이션, 변환기(B/C/역투영), 전환 API | `TestCaseGraphConverter` | 1.5~2주 |
| **P4 — 프런트 (Cytoscape)** | 구조·오류·이웃 뷰 + 그래프 TC 편집기, i18n 한/영 | React 컴포넌트, 라우트, 시드 | 2~3주 |
| **P5 — 증분 동기화 & 일괄 전환** | @Scheduled/이벤트 훅, 폴더/프로젝트 단위 bulk 전환, 관리자 UI | 스케줄러, bulk API | 1주 |
| **P6 — 마감** | 1.1.1 버전 범프, 매뉴얼(한/영) §신설, E2E, 릴리즈 노트 | v1.1.1 태그, 문서 | 1주 |

> 1인 기준 8~11주 정도로 본다(병렬로 나누면 단축). P0가 통과돼야 나머지를 시작한다.

---

## 13. 리스크 & 완화

| 리스크 | 영향 | 완화 |
|--------|------|------|
| PG 버전 차이(16 vs 18) | 동거 불가 | **별도 인스턴스**(확정). 마이그레이션 아님 — 메인 pg18 유지. |
| `2.16.9` 도커 태그 부재 가능 | 배포 지연 | P0 검증. 대안: 소스 빌드(skaiworldwide-oss) / 최신 2.16 태그 고정. |
| 동기화 지연·정합성 | 그래프 뷰 stale | 관계 그래프=최종 일관성 명시 + 재적재. 그래프 TC 미러=쓰기 직후 + 재시도 큐. |
| 그래프 규모 폭증 | 렌더 성능 | 프로젝트 스코프 + depth/페이지네이션 제한 + Cytoscape 뷰포트 컬링. |
| 이중 편집 충돌 | 데이터 불일치 | SSOT 단일화(§5-C), 반대편 read-only + regenerate. |
| Cypher 인젝션 | 보안 | 파라미터화 + 라벨/키 화이트리스트 + RLS 이중 방어. |
| 하향 비호환 오해 | 운영 사고 | 릴리즈 노트/매뉴얼 명시, feature flag로 점진 활성. |
| 프런트 react-query 오도입 | 빌드 깨짐 | axios+ProjectContext 강제(메모리 규칙). |

---

## 14. 검증 / 완료 기준 (DoD)

- [ ] AgensGraph 2.16.9 컨테이너 기동 + healthcheck 통과 (P0)
- [ ] 관계 그래프 풀 적재 후 Cypher 쿼리 3종(구조·오류·이웃) 정상 반환
- [ ] `BASIC → GRAPH` 전환 후 그래프 편집 + **관계형 미러 조회** 동시 성립
- [ ] `GRAPH` 케이스가 기존 스프레드시트/폼(1.0.x UI)에서 선형 표시됨
- [ ] Cytoscape 3뷰 + 편집기 동작, 한/영 전환 무결(하드코딩 한국어 0)
- [ ] 1.0.x 데이터로 1.1.1 기동 시 회귀 0 (상향 호환)
- [ ] `@PreAuthorize` + 프로젝트 스코프 + RLS 검증, 통합테스트(Testcontainers) 통과
- [ ] v1.1.1 태그, 매뉴얼 한/영 신규 섹션, 릴리즈 노트(하향 비호환 명시)

---

## 15. 부록 — 참고 Cypher 스니펫

**오류 클러스터 (FailureType 허브):**
```cypher
MATCH (ft:FailureType)<-[:FAILED_WITH]-(r:TestResult)-[:OF_CASE]->(tc:TestCase)
WHERE tc.projectId = $projectId
RETURN ft, r, tc
ORDER BY ft.signature;
```

**케이스 이웃 (depth 2):**
```cypher
MATCH p=(tc:TestCase {id:$id})-[*1..2]-(n)
RETURN p;
```

**기본→그래프 전환(선형 체인 생성, 의사 Cypher):**
```cypher
MERGE (g:GraphTestCase {id:$tcId}) SET g.name=$name, g.projectId=$pid
WITH g
UNWIND $steps AS s
  MERGE (n:StepNode {id:$tcId + ':' + s.order})
    SET n.order=s.order, n.action=s.action, n.expected=s.expected
// NEXT 체인은 order 인접쌍으로 애플리케이션에서 MERGE
```

## 16. 참고 자료
- AgensGraph (skaiworldwide-oss): <https://github.com/skaiworldwide-oss/agensgraph>
- AgensGraph v2.16.0 릴리즈: <https://www.postgresql.org/about/news/announcing-the-release-of-agensgraph-v2160-3149/> — PostgreSQL 16.9까지 호환, SQL+openCypher 단일 쿼리, Cypher RLS 지원
- Cytoscape.js: <https://cytoscape.org/>
- Docker 이미지: `skaiworldwide/agensgraph`

---

*구현 계획 초안이며, Phase 0 검증 결과에 따라 이미지 태그·스키마·일정은 조정될 수 있다.*




