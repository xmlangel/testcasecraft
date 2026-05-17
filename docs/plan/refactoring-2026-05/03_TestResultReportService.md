# 03. TestResultReportService 리뷰 & 리팩토링 계획

- **파일**: `src/main/java/com/testcase/testcasemanagement/service/TestResultReportService.java`
- **라인 수**: 1,511

## 1. 책임 맵

| 영역 | 주요 메서드 (라인) |
|---|---|
| 집계 | `getTestResultsByProject()`(56), `getTestResultsByTestPlan()`(68), `getTestResultStatistics()`(129), `aggregateTestResults()`(80), `aggregateTestResultsByAssignee()`(101) |
| 조회/필터 | `getDetailedTestResultReport()`(331), `getCompletePopulationResults()`(823), `getJiraStatusSummary()`(507) |
| 계층/내보내기 | `getHierarchicalTestResultReport()`(626), `exportTestResultReport()`(565), `exportHierarchicalTestResultReport()`(666) |

**판정**: 집계 / 조회 / 포맷팅 / 통계 혼재.

## 2. 핵심 코드 스멜

| 위치 | 스멜 | 심각도 |
|---|---|---|
| `TestResultReportService.java:823-1031` | `getCompletePopulationResults()` **208줄** | 높음 |
| `TestResultReportService.java:129-327` | `getTestResultStatistics()` **198줄** | 높음 |
| `TestResultReportService.java:331-439` | `getDetailedTestResultReport()` 108줄 | 높음 |
| `TestResultReportService.java:174-198, 200-213` | 중첩 루프 + 동일 패턴 반복 (ICT-FOLDER-STATS) | 중간 |
| `TestResultReportService.java:190-191,207-208,217` | `!"folder".equalsIgnoreCase()` 검사 반복 | 중간 |
| `TestResultReportService.java:342` | `Integer.MAX_VALUE` 페이지 크기 매직 넘버 | 중간 |
| `TestResultReportService.java:576` | `10000` 최대 내보내기 건수 매직 넘버 | 중간 |
| `TestResultReportService.java:231,237,240` | `"PASS"`, `"FAIL"`, `"BLOCKED"` 매직 스트링 다수 | 중간 |
| `TestResultReportService.java:686-694` | `byte[0]` 반환 주석 처리된 데드 코드 | 높음 |
| `TestResultReportService.java:729-744` | **`System.out` 디버그 프린트** (프로덕션 잔존) | 높음 |
| `TestResultReportService.java:1112, 1117` | `@SuppressWarnings("unchecked")` 과다 | 낮음 |

## 3. 성능 핫스팟

| 위치 | 항목 | 심각도 |
|---|---|---|
| `TestResultReportService.java:1369-1385` | `convertToReportDto()` N+1 (TestCase/TestPlan 매 호출 조회) | 높음 |
| `TestResultReportService.java:1424` | `buildFolderPath()` 재귀 N+1 | 높음 |
| `TestResultReportService.java:445-503` | JIRA 필터 in-memory (`PageRequest.of(0, Integer.MAX_VALUE)`) | 중간 |
| `TestResultReportService.java:146-148` | flatMap + collect — 중간 컬렉션 생성 | 중간 |
| `TestResultReportService.java:1001` | 미실행 케이스도 `buildFolderPath()` 호출 | 중간 |
| `TestResultReportService.java:887-894` | `findAllById()` 중복 호출 (823-880 vs 887-894) | 중간 |

## 4. 트랜잭션 경계

| 메서드 | 현재 | 권장 |
|---|---|---|
| `getTestResultStatistics()` | `@Transactional(readOnly=true)` | ✓ |
| `getDetailedTestResultReport()` | 없음 | **`readOnly=true` 추가** |
| `getHierarchicalTestResultReport()` | 없음 | **`readOnly=true` 추가** |
| `getCompletePopulationResults()` | 없음 | **`readOnly=true` 추가** |
| `exportTestResultReport()` | 없음 | **`readOnly=true` 추가** |
| `getJiraStatusSummary()` | 없음 | **`readOnly=true` 추가** |

## 5. 예외 처리

| 위치 | 문제 |
|---|---|
| 606-610 | Generic `catch (Exception)` |
| 661, 700, 752 | `throw new RuntimeException()` 일반화 |
| 729-744 | `System.out` 사용 (로깅 표준화 부족) |
| 743-746 | 예외 무시 후 빈 리스트 반환 (silent failure) |

## 6. 의존성

**생성자 주입 (6개)**: TestExecutionRepository, TestPlanRepository, ProjectRepository, TestResultRepository, TestCaseRepository, ExportService

→ 적절한 수준. 가이드라인 준수.

## 7. 테스트 용이성 블로커

| 블로커 | 위치 |
|---|---|
| `LocalDateTime.now()` | 655, 1479 |
| 상태 문자열 하드코딩 | 1001-1002 ("NOT_RUN" 등) |
| "루트" 매직 폴더 경로 | 1347, 1421 |
| 더미 구현 (`getUserFilterPresets`) | 615, 620 |
| 복잡한 통합 로직 (모킹 다수 필요) | 823-1031 |
| `System.out` | 729-744 |

## 8. 리팩토링 후보 (중간 강도, 7개)

| # | 신규 클래스 | 대상 라인 | 책임 |
|---|---|---|---|
| 1 | `ResultStatusCounter` | 80-98, 230-246, 1491-1509 | `countByStatus()`, `updateStatusCount()` |
| 2 | `FolderPathBuilder` | 1340-1436 | 폴더 경로 + 캐싱 + 재귀 |
| 3 | `TestResultAggregator` | 822-1031 | 최신 결과 추적, 실행 카운팅, JIRA 정보 |
| 4 | `ReportDataBuilder` | 1250-1416 | DTO 변환 + 배치 로딩 (N+1 해소) |
| 5 | `JiraStatusCalculator` | 1438-1482 | JIRA 상태 동기화 |
| 6 | `FilterExpressionParser` | 473-481 | JIRA 키 쉼표 분리 파싱 |
| 7 | `HierarchicalReportBuilder` | 626-784 | 3단계 계층 구성 전담 |

## 9. 테스트 타겟

### 단위 테스트 — 9개
1. `aggregateTestResults()` — 상태별 카운팅 정확성
2. `getTestResultStatistics()` — pass rate / execution rate 계산
3. `updateLatestStatusCount()` — 상태 업데이트
4. `buildFolderPathFromCache()` — 폴더 경로 캐싱
5. `applySorting()` — 정렬 옵션별 순서
6. `getCompletePopulationResults()` — 미실행 케이스 포함
7. `convertToReportDtoWithCache()` — N+1 방지 캐시
8. `createJiraStatusSummary()` — JIRA 상태 요약
9. 상태 문자열 매핑 enum (PASS/FAIL/BLOCKED/NOT_RUN/SKIPPED)

### 통합 테스트 (`@SpringBootTest`) — 3개
1. 프로젝트별 상세 리포트 조회 + 페이징 + 정렬
2. JIRA 필터 적용 리포트 조회
3. 계층적 리포트 생성 (플랜 > 실행 > 케이스)

## 10. 우선순위 액션

| 우선순위 | 항목 |
|---|---|
| **P0** | `System.out` 제거 (729-744) → 로깅 표준화 |
| **P0** | N+1 쿼리 (`buildFolderPath` 재귀) 해결 |
| **P0** | 조회 메서드 `@Transactional(readOnly=true)` 추가 |
| **P1** | 상태 문자열 `TestStatus` enum 도입 |
| **P1** | 6개 대형 메서드 분해 (823, 129, 331줄 등) |
| **P2** | Generic Exception 캐치 제거 |
| **P3** | `getCompletePopulationResults()` 성능 최적화 |
