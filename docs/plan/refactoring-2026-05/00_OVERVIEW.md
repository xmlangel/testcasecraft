# Java Service 리팩토링 계획 - 2026-05

## 개요

- **대상 브랜치**: `claude/refactor-java-service-jpRhE`
- **작성일**: 2026-05-16
- **리팩토링 강도**: **중간** (구조 개선 포함, 외부 API 시그니처는 유지)
- **테스트 범위**: **단위 + 통합** (TestNG + Mockito + @SpringBootTest)
- **현재 단계**: 리뷰/계획 산출 단계. **코드 변경은 별도 PR로 진행 예정.**

## 대상 Service (코드 라인 수 Top 5)

| 순위 | 파일 | 라인 수 | 리뷰 문서 |
|---|---|---|---|
| 1 | `TestCaseService.java` | 2,856 | [01_TestCaseService.md](01_TestCaseService.md) |
| 2 | `RagServiceImpl.java` | 1,846 | [02_RagServiceImpl.md](02_RagServiceImpl.md) |
| 3 | `TestResultReportService.java` | 1,511 | [03_TestResultReportService.md](03_TestResultReportService.md) |
| 4 | `TranslationManagementService.java` | 964 | [04_TranslationManagementService.md](04_TranslationManagementService.md) |
| 5 | `JunitVersionControlService.java` | 921 | [05_JunitVersionControlService.md](05_JunitVersionControlService.md) |
| **합계** | | **8,098 lines** | |

## 공통 발견 사항 (Cross-cutting Findings)

### 🔴 즉시 개선 필요
1. **God Service 패턴**: TestCaseService(34개 public), RagServiceImpl(7개 책임 영역), TestResultReportService(집계+조회+포맷팅 혼재) — 단일 책임 원칙(SRP) 위반
2. **`@Transactional(readOnly=true)` 누락**: 조회 메서드에 readOnly 미적용으로 DB 성능 손실 (TestResultReportService 5+ 메서드, RagServiceImpl 전무)
3. **`LocalDateTime.now()` / `System.currentTimeMillis()` 직접 호출**: Clock 추상화 부재로 결정론적 테스트 불가 (5개 Service 전반)
4. **WebClient 타임아웃/재시도 미설정**: RagServiceImpl 20+ 호출에서 무한 대기 위험
5. **버전 번호 생성 레이스 컨디션**: JunitVersionControlService `getNextVersionNumber()` 동시성 미보장

### 🟡 구조적 개선 필요
6. **장문 메서드 다수**: 100줄 이상 메서드가 다수 (TestCaseService.batchSaveTestCases 264줄, updateTestCase 188줄, getCompletePopulationResults 208줄, getTestResultStatistics 198줄, vectorizeTestCase 154줄, importTranslationsFromCsv 131줄)
7. **Generic Exception 캐치**: 모든 Service에 광범위 `catch (Exception e)` 패턴 존재
8. **매직 스트링/넘버 하드코딩**: "PASS"/"FAIL"/"folder", `Integer.MAX_VALUE`, `10000`, `8192` 등
9. **N+1 쿼리**: TestResultReportService.buildFolderPath 재귀, TestCaseService.isTestCaseVectorized

### 🟢 코딩 가이드라인 위반
10. **필드 주입 잔존**: TestCaseService의 `@Autowired ProjectRepository` (line 72) — 생성자 주입으로 통일 필요 (JAVA_CODING_GUIDELINES.md 3.2)
11. **커스텀 예외 부재**: `new RuntimeException()` 남발 (TranslationManagementService 12+ 곳)
12. **JavaDoc 누락**: 공개 API 대부분 미작성

## 리팩토링 실행 전략

### Phase 1: 안전망 구축 (Pre-refactoring)
> "테스트 없이는 리팩토링하지 않는다" — 각 Service 리뷰 문서의 §9 "테스트 타겟"을 먼저 작성한다.

- [ ] 단위 테스트: TestNG + Mockito, 각 Service당 5~10 케이스
- [ ] 통합 테스트: `@SpringBootTest` 기반, 각 Service당 2~3 시나리오
- [ ] 외부 호출 통합 테스트: WireMock 도입 (RagServiceImpl 전용)
- [ ] 목표 커버리지: 신규 분리 클래스 80% / 기존 핵심 분기 70%

### Phase 2: 횡단 기반 작업 (Cross-cutting)
- [ ] `Clock` Bean 등록 → 모든 `LocalDateTime.now()` 치환
- [ ] `RestClientConfig`: WebClient 타임아웃·재시도·서킷브레이커
- [ ] 도메인별 커스텀 예외 추가: `TestCaseNotFoundException`, `TranslationKeyNotFoundException`, `RagApiException`, `VersionConflictException`
- [ ] `TestStatus`, `TestCaseType` enum 도입 → 매직 스트링 제거
- [ ] `BackendConstants` 또는 도메인별 상수 클래스 분리

### Phase 3: Service 분해 (Per-service)
각 Service의 리뷰 문서 §7 "리팩토링 후보" 항목을 따라 작은 단위로 분리. 각 분리는 별도 커밋/PR 권장.

**TestCaseService → 7개로 분리**
- `TestCaseHierarchyService`, `TestCaseImportService`, `TestCaseExportService`, `TestCaseStandardFormatService`, `TestCaseValidationService`, `TestCaseRagBridgeService`, `DisplayOrderManager`

**RagServiceImpl → 5개로 분리**
- `RagHttpClientAdapter`, `DocumentStatusPoller`, `TestCaseVectorizer`, `LlmConfigEnricher`, `RagErrorHandler`

**TestResultReportService → 6개로 분리**
- `ResultStatusCounter`, `FolderPathBuilder`(캐시 포함), `TestResultAggregator`, `ReportDataBuilder`, `JiraStatusCalculator`, `HierarchicalReportBuilder`

**TranslationManagementService → 3개로 분리**
- `TranslationCsvImportExportService`, `TranslationCacheCoordinator`, `TranslationStatisticsService`

**JunitVersionControlService → 3개로 분리**
- `FileVersionRepository`, `ChecksumCalculator`, `FileBackupService`

### Phase 4: QA & Verification
- [ ] `./gradlew test` 전체 통과
- [ ] `./gradlew allureReport` 결과 검토
- [ ] 신규 분리 클래스 커버리지 측정 (JaCoCo)
- [ ] 회귀 검증: 핵심 E2E 시나리오 1회 실행 (`npm run test:ict-138 --prefix src/test/e2e`)
- [ ] `./gradlew bootRun` 후 수동 스모크 테스트

## 우선순위 매트릭스

| 우선순위 | 작업 | 영향 범위 | 난이도 | 예상 소요 |
|---|---|---|---|---|
| P0 | Clock 추상화 도입 | 5개 Service | 낮음 | 0.5d |
| P0 | WebClient 타임아웃 설정 | RagServiceImpl | 낮음 | 0.5d |
| P0 | 조회 메서드 `readOnly=true` | TestResultReportService 외 | 낮음 | 0.5d |
| P0 | 버전 번호 동시성 수정 | JunitVersionControlService | 중간 | 1d |
| P1 | 단위 테스트 작성 | 5개 Service 전체 | 중간 | 5d |
| P1 | TestCaseService 분해 (7개) | TestCaseService | 높음 | 4d |
| P1 | RagServiceImpl 분해 (5개) | RagServiceImpl | 높음 | 3d |
| P2 | 매직 스트링 Enum화 | 전반 | 중간 | 1d |
| P2 | TestResultReportService 분해 (6개) | Report | 중간 | 3d |
| P3 | Translation/Junit 분해 | 2개 Service | 낮음 | 2d |
| P3 | JavaDoc 보강 | 5개 Service | 낮음 | 1d |

**총 예상 소요**: 약 21 man-days (1인 기준 4주)

## 위험 및 완화

| 위험 | 완화 전략 |
|---|---|
| 외부 API 호환성 깨짐 | Public 메서드 시그니처는 유지, 내부만 분리. 분리된 신규 클래스는 package-private 우선 |
| 트랜잭션 경계 변경으로 인한 데이터 불일치 | 트랜잭션 변경 PR은 단독으로 분리. 통합 테스트로 검증 |
| RAG/Google Sheet 외부 의존성 테스트 곤란 | WireMock + Testcontainers 도입. 외부 호출은 Mock으로 격리 |
| 대규모 리팩토링으로 인한 머지 충돌 | Phase별로 작은 PR (200~500 라인) 단위 머지. Phase 2 횡단 작업 우선 |
| TestNG 환경에서 `@SpringBootTest` 통합 테스트 부족 | 기존 테스트 디렉토리 조사 후 보일러플레이트 작성 |

## 다음 액션

> 이 문서는 **계획 단계**의 산출물입니다. 코드 변경은 아직 수행되지 않았습니다.
>
> **사용자 승인 후 다음 단계로 진행할 수 있습니다:**
> 1. **Phase 1 시작**: 5개 Service에 대한 단위/통합 테스트 작성 PR
> 2. **Phase 2 시작**: 횡단 기반(Clock, WebClient 설정 등) PR
> 3. **승인된 우선순위 항목만 선별 적용**
