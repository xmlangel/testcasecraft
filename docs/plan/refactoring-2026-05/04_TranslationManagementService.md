# 04. TranslationManagementService 리뷰 & 리팩토링 계획

- **파일**: `src/main/java/com/testcase/testcasemanagement/service/TranslationManagementService.java`
- **라인 수**: 964

## 1. 책임 맵

| 영역 | 메서드 (라인) |
|---|---|
| 언어 관리 | createLanguage(38), updateLanguage(71), deleteLanguage(113), getAllLanguages(700) |
| 번역 키 | createTranslationKey(134), updateTranslationKey(152), deleteTranslationKey(174), searchTranslationKeys(189), searchTranslationKeysWithPagination(228), getAllCategories(316), getCategoryStats(321) |
| 번역 | createOrUpdateTranslation(502), deleteTranslation(601), searchTranslationsWithPagination(431), getTranslationsByLanguage/Key(712) |
| 대량 작업 | batchCreateTranslations(621), deactivateTranslation(660), activateTranslation(679) |
| Import/Export | exportTranslationsAsCsv(748), importTranslationsFromCsv(782) |
| 통계 | getCategoryTranslationCompletionStats(337), getCategoryCompletionStatsByLanguage(376), getLanguageCompletionStatsByCategory(402), getTranslationProgress(725) |

## 2. 핵심 코드 스멜

| 위치 | 스멜 | 심각도 |
|---|---|---|
| `TranslationManagementService.java:782-913` | `importTranslationsFromCsv()` **131줄**, 다중 책임 | 높음 |
| `TranslationManagementService.java:228-313` | `searchTranslationKeysWithPagination()` 85줄, 복잡 변환 | 중간 |
| `TranslationManagementService.java:45-54 vs 89-99` | 기본 언어 설정 로직 중복 (create/update) | 중간 |
| 캐시 초기화 호출 11곳 (65, 104, 127, 146, 168, 184, 579, 611, 671, 690, 904) | 무분별한 캐시 무효화 호출 | 중간 |
| 81-82, 117-118, 156-158, 176-179, 604-606, 664-665, 684-685 | `orElseThrow` 패턴 중복 | 중간 |
| `TranslationManagementService.java:759, 792` | CSV 헤더/`"UTF-8"` 하드코딩 | 낮음 |
| `TranslationManagementService.java:193` | `searchKeyword` 변수 선언만, 미사용 | 낮음 |
| `TranslationManagementService.java:189` vs `:228` | `searchTranslationKeys` 데드코드 가능성 (페이징 없는 중복 버전) | 중간 |
| `TranslationManagementService.java:585-598` | Generic catch + `e.getMessage().contains("constraint")` | 높음 |

## 3. 캐시 전략

- **현재**: `i18nService.clearLanguageCache()`, `clearTranslationCache()`, `clearAllCache()` 호출로 즉시 무효화 (reactive invalidation)
- **문제점**:
  - 세분화 부족: 언어/번역 캐시 분리 불명확
  - 스레드 안전성 미확인 (i18nService 구현 미점검)
  - `searchTranslationKeysWithPagination` 내 N+1 최적화(243-250)는 캐시 미사용

## 4. 트랜잭션 경계

- **쓰기**: 모두 `@Transactional` 적용 (38, 71, 113, 134, 152, 174, 502, 621, 660, 679, 782)
- **읽기**: 대부분 `readOnly=true` 적용 (189, 228, 316, 322, 337, 376, 402, 431)
- **누락**: `getTranslationProgress`(725), `getAllLanguages`(700) — `readOnly=true` 미적용
- **`batchCreateTranslations`(621)**: 내부 루프에서 `createOrUpdateTranslation` 호출 → 각각 별도 트랜잭션, 부분 실패 시 롤백 불명확
- **`importTranslationsFromCsv`(782)**: 대량 작업이나 individual `save()` 호출(862, 882) — 배치 최적화 미흡

## 5. 예외 처리

| 문제 | 위치 |
|---|---|
| Generic `RuntimeException` 남용 | 42, 82, 118, 121, 138, 158, 176, 179, 597, 606, 665, 685 (12+) |
| 도메인 커스텀 예외 부재 | 전반 |
| 메시지 기반 예외 판단 | 593 (`contains("constraint")`) |
| `IllegalArgumentException` vs `IllegalStateException` 혼재 | 506-516 vs 524-535 |

## 6. 의존성

**생성자 주입 (4개, Lombok `@RequiredArgsConstructor`)**:
- LanguageRepository, TranslationKeyRepository, TranslationRepository, I18nService

→ 적절. 가이드라인 준수.

## 7. 테스트 용이성 블로커

- 정적 호출 없음 (✓)
- 하드코딩: `"UTF-8"`(792), CSV 헤더(759), 에러 메시지
- 시간: `LocalDateTime.now()`(562, 861, 881)
- I/O: `BufferedReader`(791) — 스트림 주입 불가
- CSV 파싱 로직 복잡(932-963)

## 8. 리팩토링 후보 (중간 강도, 5개)

| # | 변경 | 대상 라인 |
|---|---|---|
| 1 | `setAsDefaultLanguage(Language)` private 메서드 추출 | 45-54, 89-99 |
| 2 | `invalidateCaches(CacheInvalidationType)` 래퍼 | 65, 104, 127 외 다수 |
| 3 | CSV Import 메서드 분할: `parseCsvRecord()`, `processCsvRecord()`, `handleImportResult()` | 782-913 |
| 4 | 엔티티 조회 래퍼: `<T> T findByIdOrThrow(id, finder, errMsg)` | 81, 156, 604 외 |
| 5 | Map 변환을 `TranslationKeyDataMapper`, `TranslationDataMapper`로 분리 | 260-285, 450-486 |

## 9. 테스트 타겟

### 단위 테스트 — 8개
1. `createLanguage` — 기본 언어 설정 시 기존 기본 언어 변경
2. `createOrUpdateTranslation` — 동일 값 업데이트 시 캐시 초기화 여부
3. `searchTranslationKeysWithPagination` — N+1 최적화 (쿼리 수 측정)
4. `getTranslationProgress` — 누락 키 계산 정확성
5. `parseCsvLine` — CSV 파싱 (쌍따옴표 이스케이프 포함)
6. `escapeCsv` — CSV 필드 이스케이프
7. `batchCreateTranslations` — 부분 실패 오류 수집
8. `importTranslationsFromCsv` — overwrite 플래그 동작

### 통합 테스트 (`@SpringBootTest`) — 2개
1. 언어 생성 → 번역 생성 → 진행도 조회 (캐시 동기화 검증)
2. CSV 대량 import → 통계 조회 (트랜잭션 경계, 캐시 일관성)

## 10. 우선순위 액션

| 우선순위 | 항목 |
|---|---|
| **P0** | `TranslationKeyNotFoundException`, `LanguageNotFoundException` 등 커스텀 예외 도입 |
| **P0** | 메시지 기반 예외 판단(593) 제거 — DB 제약 위반 catch 분리 |
| **P1** | `importTranslationsFromCsv` 분할 |
| **P1** | 캐시 무효화 래퍼 메서드 도입 |
| **P2** | 기본 언어 설정 로직 추출 |
| **P3** | 데드코드 정리 (`searchTranslationKeys`, 미사용 변수) |
