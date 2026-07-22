# 스키마 비교 — 코어 온톨로지(기존) ↔ 적용 그래프(현재)

정본: 온톨로지 `testcasecraft.rdf` · 그래프 `01-init-graph.sql` + 서비스 코드(live 판정)

- 온톨로지: 클래스 **11** · 관계 **15**
- 그래프: VLABEL **17** (live 13) · ELABEL **21** (live 16)

**판정 범례:** 정합=양쪽 존재(이름/방향만 정리) · 현재채택=그래프에 있고 온톨로지 누락(추가 권장) · 기존유지=온톨로지 전용 개념 · 제거후보=그래프 선언만·미사용(dead)

## ⚠️ DRIFT — 매핑 테이블 갱신 필요

- [SCAN] ELABEL 'BLOCKS' 는 LIVE 정본이나 스캔 미검출(동적 레이블 가능) — 정보
- [SCAN] ELABEL 'DEPENDS_ON' 는 LIVE 정본이나 스캔 미검출(동적 레이블 가능) — 정보
- [SCAN] ELABEL 'RELATES_TO' 는 LIVE 정본이나 스캔 미검출(동적 레이블 가능) — 정보

## 노드(정점) 비교

판정 집계: {'기존유지': 4, '정합': 6, '제거후보': 4, '현재채택': 6}

| 개념 | 온톨로지 | 그래프 | JPA 근거 | 판정 | 사유 |
|---|---|---|---|---|---|
| 조직 | Organization | — | Organization | **기존유지** | JPA 엔티티 근거 있음. 그래프 범위 밖일 뿐 — 온톨로지에 남긴다 |
| 프로젝트 | Project | Project | Project | **정합** | 양쪽 존재 — 이름/분리 차이만 정리(그래프 표현 유지) |
| 케이스/폴더 | TestCase | TestCase, Folder | TestCase | **정합** | 양쪽 존재 — 이름/분리 차이만 정리(그래프 표현 유지) |
| 테스트 단계 | TestStep | StepNode | TestStep(embedded) | **정합** | 양쪽 존재 — 이름/분리 차이만 정리(그래프 표현 유지) |
| 케이스 버전 | TestCaseVersion | — | TestCaseVersion | **기존유지** | JPA 엔티티 근거 있음. 그래프 범위 밖일 뿐 — 온톨로지에 남긴다 |
| 테스트 플랜 | TestPlan | TestPlan | TestPlan | **정합** | 양쪽 존재 — 이름/분리 차이만 정리(그래프 표현 유지) |
| 실행 회차 | TestExecution | TestExecution | TestExecution | **정합** | 양쪽 존재 — 이름/분리 차이만 정리(그래프 표현 유지) |
| 실행 결과 | TestResult | TestResult | TestResult | **정합** | 양쪽 존재 — 이름/분리 차이만 정리(그래프 표현 유지) |
| 테스트 차터 | TestCharter | — | TestCharter | **기존유지** | JPA 엔티티 근거 있음. 그래프 범위 밖일 뿐 — 온톨로지에 남긴다 |
| 테스트 세션 | TestSession | — | TestSession | **기존유지** | JPA 엔티티 근거 있음. 그래프 범위 밖일 뿐 — 온톨로지에 남긴다 |
| 사용자 | User | User(dead) | User | **제거후보** | 그래프 선언만·미사용(dead) — init SQL 에서 제거 또는 배선 |
| JUnit 케이스 | — | JunitCase | JunitTestCase | **현재채택** | 그래프에서 실사용·근거 있음 — 코어 온톨로지에 추가 |
| 실패 유형 | — | FailureType | derived | **현재채택** | 그래프에서 실사용·근거 있음 — 코어 온톨로지에 추가 |
| Jira 이슈 | — | JiraIssue | derived | **현재채택** | 그래프에서 실사용·근거 있음 — 코어 온톨로지에 추가 |
| 버그 | — | Bug(dead) | — | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |
| 그래프 케이스 | — | GraphTestCase | derived | **현재채택** | 그래프에서 실사용·근거 있음 — 코어 온톨로지에 추가 |
| 사전조건 노드 | — | Precondition | derived | **현재채택** | 그래프에서 실사용·근거 있음 — 코어 온톨로지에 추가 |
| 분기 노드 | — | Decision | derived | **현재채택** | 그래프에서 실사용·근거 있음 — 코어 온톨로지에 추가 |
| 상태 노드 | — | State(dead) | — | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |
| 기대결과 노드 | — | Expected(dead) | — | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |

## 간선(관계) 비교

판정 집계: {'기존유지': 6, '정합': 8, '정합·주의': 1, '현재채택': 8, '제거후보': 4}

| 개념 | 온톨로지 | 그래프 | 판정 | 사유 |
|---|---|---|---|---|
| 조직→프로젝트 포함 | Organization.contains→Project | — | **기존유지** | 온톨로지 전용 관계 |
| 프로젝트→케이스 포함 | Project.has→TestCase | CONTAINS | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 폴더 트리 | TestCase.parentOf→TestCase | PARENT_OF | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 프로젝트→플랜 | Project.hasPlan→TestPlan | HAS_PLAN | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 프로젝트→실행 | Project.hasExecution→TestExecution | — | **기존유지** | 온톨로지 전용 관계 |
| 프로젝트→차터 | Project.hasCharter→TestCharter | — | **기존유지** | 온톨로지 전용 관계 |
| 프로젝트→세션 | Project.hasSession→TestSession | — | **기존유지** | 온톨로지 전용 관계 |
| 케이스→단계 | TestCase.hasStep→TestStep | STARTS_AT | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 케이스→버전 | TestCase.hasVersion→TestCaseVersion | — | **기존유지** | 온톨로지 전용 관계 |
| 플랜→케이스 참조 | TestPlan.references→TestCase | INCLUDES | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 실행→플랜 기반 | TestExecution.basedOn→TestPlan | FROM_PLAN | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 실행→결과 산출 | TestExecution.produces→TestResult | IN_EXECUTION | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 결과→케이스 대상 | TestResult.targets→TestCase | OF_CASE | **정합** | 양쪽 존재 — 이름/방향 차이 정리 |
| 결과→실행자 | TestResult.executedBy→User | EXECUTED_BY(dead) | **정합·주의** | 온톨로지엔 있으나 그래프 간선 dead |
| 세션→차터 수행 | TestSession.runs→TestCharter | — | **기존유지** | 온톨로지 전용 관계 |
| 결과→Jira 연동 | — | LINKED_TO | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| JUnit→실패유형 | — | FAILED_WITH | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 케이스 유사도 | — | SIMILAR_TO | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 수동 관계 | — | RELATES_TO | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 수동 차단 | — | BLOCKS | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 수동 의존 | — | DEPENDS_ON | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 저작 다음단계 | — | NEXT | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 저작 분기 | — | BRANCH_ON | **현재채택** | 그래프 실사용 관계 — 온톨로지 반영 검토 |
| 영향(dead) | — | AFFECTS(dead) | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |
| 보고(dead) | — | REPORTED_AS(dead) | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |
| 검증(dead) | — | VERIFIES(dead) | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |
| 전이(dead) | — | TRANSITION(dead) | **제거후보** | 그래프 선언만·미사용(dead) — 제거 |
