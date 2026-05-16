# 01. TestCaseService 리뷰 & 리팩토링 계획

- **파일**: `src/main/java/com/testcase/testcasemanagement/service/TestCaseService.java`
- **라인 수**: 2,856
- **공개 메서드 수**: 34개

## 1. 책임 맵

| 책임 영역 | 주요 메서드 | 개수 |
|---|---|---|
| CRUD | saveTestCase, updateTestCase, deleteTestCase, deleteSingleTestCase, findById, getTestCaseById, getAllTestCases, getTestCasesByProjectId, getTestCasesByParentId | 9 |
| 벌크 작업 | batchDeleteTestCases, batchSaveTestCases | 2 |
| Import | importFromCsv, importFromExcel, importFromGoogleSheet, importFromStandardCsv, importFromStandardExcel, importFromJson | 6 |
| Export | exportTestCasesToGoogleSheet, exportToCsvBytes, exportToExcelBytes, exportToJsonString, exportToGoogleSheetByProject | 5 |
| 샘플 생성 | generateSampleCsv, generateSampleExcel, generateSampleJson | 3 |
| 조회/변환 | getAllTestCasesWithParentName, getTestCaseDtoById, findByDisplayIdWithRedirect | 3 |
| RAG/벡터화 | vectorizeSingleTestCase, vectorizeAllTestCases | 2 |
| 검증 | validateImport | 1 |

**판정**: **God Service.** 7개 책임 영역 혼재.

## 2. 핵심 코드 스멜

| 위치 | 스멜 | 심각도 |
|---|---|---|
| `TestCaseService.java:224-255` | `deleteTestCase()` 32줄, 재귀 제거용 BFS 로직 | 높음 |
| `TestCaseService.java:414-601` | `updateTestCase()` **188줄**, 검증·업데이트·태그·displayOrder 혼재 | 높음 |
| `TestCaseService.java:735-794` | `importFromCsv()` 59줄 | 높음 |
| `TestCaseService.java:1375-1639` | `batchSaveTestCases()` **264줄**, 변환·검증·저장·이벤트·RAG 모두 처리 | 높음 |
| `TestCaseService.java:126-162` | saveTestCase/updateTestCase 검증 로직 중복 | 중간 |
| `TestCaseService.java:132,137,147,236` | 매직 스트링: `"orphaned-items-folder"`, `"null"`, `"folder"`, `"[SYSTEM] 기본 폴더 - 삭제불가"` | 중간 |
| `TestCaseService.java:551-552` | DB 제약 위반 감지용 `"UKL7WIR8HGJNYHVRMU717NSRTYY"`, `"23505"` 하드코딩 | 중간 |
| `TestCaseService.java:661` | `isTestCaseVectorized()` 루프 호출 → **N+1** (TODO 주석 660줄) | 높음 |
| `TestCaseService.java:291-298, 823-824` | `CompletableFuture.runAsync()` 예외 무시 | 중간 |

## 3. 트랜잭션 경계

| 메서드 | 현재 | 문제 / 권장 |
|---|---|---|
| `saveTestCase` | `@Transactional` | RAG 비동기 호출 예외 무시 → 별도 트랜잭션 분리 |
| `updateTestCase` | `@Transactional` | displayOrder 재시도(546-575)에서 중복 쿼리 → REQUIRES_NEW 메서드 분리 |
| `deleteTestCase` | `@Transactional` | 자식 삭제 루프(248-254) 각 호출이 동일 트랜잭션 → 부분 실패 처리 명확화 |
| `batchSaveTestCases` | `@Transactional` | 264줄, 트랜잭션 범위 과도 → 검증(readOnly) + 저장 분리 |
| `importFromGoogleSheet` | `@Transactional` | 1037-1060, 검증+저장 통합 → 검증 readOnly 분리 |
| `getAllTestCases` (94) | 없음 | **`readOnly=true` 추가** |
| `getTestCasesByProjectId` (409) | 없음 | **`readOnly=true` 추가** |
| `getAllTestCasesWithParentName` (721) | 없음 | **`readOnly=true` 추가** |

## 4. 예외 처리

| 위치 | 문제 |
|---|---|
| 203-205, 251-254, 318-320 | Generic `catch (Exception e)` |
| 592-595, 664-666, 1023-1034 | 예외 무시 후 진행 (RAG, 버전 이벤트) |
| 723-726, 846-855 | `CompletableFuture` 내 예외 무시 |
| 메시지 일관성 | 국문/영문 혼재 ("테스트케이스를 찾을 수 없습니다" vs "TestCase not found") |
| 250-254 | `deleteSingleTestCase` 부분 실패 시 이전 삭제 항목 롤백 미고려 |

## 5. 의존성

**생성자 주입 (8개)**: TestCaseRepository, TestCaseDisplayIdService, ApplicationEventPublisher, RagService, TestCaseAttachmentRepository, DisplayIdHistoryRepository, TestCaseFileStorageService, GoogleConfigService

**필드 주입 (2개)** ⚠️:
- `TestCaseService.java:72` — `@Autowired ProjectRepository`
- `TestCaseService.java:70` — `@PersistenceContext EntityManager`

→ JAVA_CODING_GUIDELINES.md §3.2 위반. 생성자 주입으로 통일 필요.

## 6. 테스트 용이성 블로커

| 블로커 | 위치 |
|---|---|
| `SecurityContextHolder` 직결 | `getCurrentUsername()` 1690-1700 |
| GoogleConfigService 직결 | `getSheetsServiceForCurrentUser()` 1703-1718 |
| `LocalDateTime.now()` 직접 호출 | 171, 532, 781 등 |
| Private 헬퍼 다수 | `propagateTags`, `buildFullFolderPath` 등 |
| EntityManager 네이티브 쿼리 | 336-365, 312-317 |

## 7. 리팩토링 후보 (중간 강도, 7개)

| # | 신규 클래스 | 분리 대상 라인 | 책임 |
|---|---|---|---|
| 1 | `TestCaseHierarchyService` | 224-277 | deleteTestCase, collectDescendantIds, 트리 조작 |
| 2 | `TestCaseImportService` | 735-1061 | CSV/Excel/GoogleSheet Import |
| 3 | `TestCaseExportService` | 1164-2765 | 모든 export*, sample* |
| 4 | `TestCaseStandardFormatService` | 2204-2623 | Standard 포맷 Import + validation |
| 5 | `TestCaseValidationService` | 113-167, 414-484 | projectId/parentId/description 검증 통합 |
| 6 | `TestCaseRagBridgeService` | 1796-1901 | vectorize/delete/format RAG 캡슐화 |
| 7 | `DisplayOrderManager` | 518-570 | displayOrder 충돌 처리, 매직 스트링 상수화 |

## 8. 테스트 타겟

### 단위 테스트 (TestNG + Mockito) — 10개
1. `saveTestCase()` — 정상, projectId 없음, name 공백
2. `updateTestCase()` — 부모 변경 displayOrder 재조정, 충돌 자동 복구
3. `deleteTestCase()` — 자식 항목 함께 삭제, 특수 폴더 거부
4. `propagateTags()` — 폴더 태그 전파, 재귀 처리
5. `batchSaveTestCases()` — sequentialId 증가, 낙관적 락 충돌
6. `importFromStandardCsv()` — 폴더 우선 생성, 중복 이름 차단
7. `validateImport()` — type/priority 검증, 미리보기 20개 한정
8. `vectorizeSingleTestCase()` — folder 타입 거부, 비동기 요청 확인
9. `buildFullFolderPath()` — 경로 캐싱, null 부모 처리
10. `getCurrentUsername()` — anonymousUser, 시큐리티 미설정 시 "system"

### 통합 테스트 (`@SpringBootTest`) — 3개
1. CSV import → 파일 저장 → RAG 벡터화 → 버전 이벤트 발행 (E2E)
2. Google Sheet export → 기존 데이터 클리어 → 작성 성공/실패
3. 배치 저장 시 displayOrder 충돌 자동 재조정 재시도

## 9. 우선순위 액션

| 우선순위 | 항목 |
|---|---|
| **P0** | `batchSaveTestCases` (264줄), `updateTestCase` (188줄) 분해 |
| **P0** | `TestCaseHierarchyService`, `TestCaseImportService` 분리 |
| **P1** | `ProjectRepository` 필드 주입 → 생성자 주입 |
| **P1** | RAG 비동기 예외 처리 개선 |
| **P1** | 조회 메서드 `readOnly=true` 추가 |
| **P2** | 매직 스트링/숫자 상수화 |
| **P2** | N+1 해결 (`isTestCaseVectorized` 벌크 조회) |
| **P3** | JavaDoc 보강 |
