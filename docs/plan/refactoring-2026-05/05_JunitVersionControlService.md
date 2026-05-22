# 05. JunitVersionControlService 리뷰 & 리팩토링 계획

- **파일**: `src/main/java/com/testcase/testcasemanagement/service/JunitVersionControlService.java`
- **라인 수**: 921

## 1. 책임 맵

| 영역 | 메서드 (라인) |
|---|---|
| 버전 생성 | `createVersion()`(65-128), `getNextVersionNumber()`(357-360), `updateVersionHistory()`(373-386) |
| 비교 | `compareVersions()`(222-258) — 메타데이터 기반 |
| 복원 | `restoreVersion()`(138-186) |
| 차이 분석 | (239-250) — 메타데이터 요약, 심화 XML diff 없음 |
| 백업 | `createBackup()`(261-303) |
| 정리 | `cleanupOldVersions()`(388-414) |
| 통계 | (332 부근) |

## 2. 핵심 코드 스멜

| 위치 | 스멜 | 심각도 |
|---|---|---|
| `JunitVersionControlService.java:65-128` | `createVersion()` 64줄, I/O + 체크섬 + 메타 + 백업 통합 | 중간 |
| `JunitVersionControlService.java:261-303` | `createBackup()` 43줄 | 중간 |
| `JunitVersionControlService.java:421, 434, 447` | 버퍼 크기 `8192` 매직 넘버 | 낮음 |
| `JunitVersionControlService.java:44` | `maxVersionsPerFile` 기본 10 (설정 외 변경 불가) | 낮음 |
| `JunitVersionControlService.java:66, 138, 222` | null 파라미터 체크 부재 | 중간 |
| `JunitVersionControlService.java:382-385` | `updateVersionHistory()` 캐시 업데이트 시 동기화 없음 | 높음 |
| `JunitVersionControlService.java:409` | `cleanupOldVersions()`에서 `updateVersionHistory(testResultId, null)` — null 전달 | 중간 |
| `JunitVersionControlService.java:464` | 체크섬 실패 시 `"checksum_error"` 문자열 반환 — 실제 값과 구분 불가 | 높음 |

## 3. 동시성

| 위치 | 문제 | 심각도 |
|---|---|---|
| `JunitVersionControlService.java:357-359` | `getNextVersionNumber()` — 히스토리 크기 기반 계산. 동시 호출 시 **중복 번호 발생** | **높음** |
| `JunitVersionControlService.java:373-386` | `updateVersionHistory()` 읽기-수정-쓰기 비원자 — **TOCTOU 취약** | **높음** |
| 전반 | `@Transactional`, `@Version` 모두 부재 | 높음 |
| 캐시 갱신 검증 부재 | 189-211 | 외부 파일 변경 시 stale 캐시 | 중간 |

## 4. 트랜잭션 경계

- **`@Transactional` 어노테이션 전무**
- 파일 I/O + 메타데이터 업데이트 사이 실패 시 일관성 깨짐:
  - 88-89 파일 복사 후 109 히스토리 업데이트 실패 → 파일만 남음
  - 113 백업 실패 후에도 버전 진행 → 데이터 불일치

## 5. 예외 처리

| 위치 | 문제 |
|---|---|
| 254 | `catch (Exception e)` 광범위 |
| 332-334 | `IOException` 무시하고 빈 통계 반환 |
| 400-402 | `cleanupOldVersions` 파일 삭제 실패해도 진행 → 메타 불일치 |
| 409-412 | 히스토리 업데이트 실패 로그만 |
| 464 | `"checksum_error"` 문자열 반환 |

## 6. 의존성

**의존성 5개**: `ObjectMapper` + 5개 `@Value` 설정 (38-51)

→ 결합도 낮음. 테스트 용이.
→ 단, `LocalDateTime.now()` 고정 참조로 결정론적 테스트 어려움.

## 7. 테스트 용이성 블로커

| 블로커 | 위치 |
|---|---|
| `LocalDateTime.now()` 직접 호출 | 104, 175, 207, 273, 363, 369 |
| 파일 I/O 임베드 | 78-89, 196-206 |
| 정적 호출 없음 | (양호) |

## 8. 리팩토링 후보 (중간 강도, 5개)

| # | 변경 | 대상 |
|---|---|---|
| 1 | `Clock` 추상화 주입 → `Clock.fixed()` 테스트 가능 | 104, 175, 363, 369 |
| 2 | `FileVersionRepository` 추출 | 373-414 (`updateVersionHistory`, `getVersionHistory`, `cleanupOldVersions`) |
| 3 | **버전 번호 생성 동시성 수정** — DB 시퀀스 또는 `AtomicLong`, 분산 환경이라면 DB row lock 활용 | 357-359 |
| 4 | `ChecksumCalculator` 추상화 | 442-466 |
| 5 | `FileBackupService` 추출 | 261-303 |

## 9. 테스트 타겟

### 단위 테스트 — 5개
1. **동시 버전 생성** (2-3 스레드) → 중복 번호 없음 검증
2. 체크섬 계산 (정상/손상 파일)
3. 버전 번호 순차성 (`maxVersionsPerFile` 초과 시 정리)
4. 버전 복원 체크섬 불일치 (warn 로그)
5. 예외 처리 (`FileNotFoundException`, `IOException` 시나리오)

### 통합 테스트 (`@SpringBootTest`) — 2개
1. **생성-복원 라운드트립** (압축 활성/비활성)
2. 자동 백업 실패 시 버전 생성 롤백 (트랜잭션 보장)

## 10. 우선순위 액션

| 우선순위 | 항목 |
|---|---|
| **P0** | `getNextVersionNumber()` 동시성 수정 (DB 시퀀스 or AtomicLong) |
| **P0** | `updateVersionHistory()` TOCTOU 수정 (synchronized 또는 트랜잭션 lock) |
| **P0** | `createVersion()` `@Transactional` 도입, 실패 시 파일 롤백 |
| **P1** | `Clock` 추상화 도입 |
| **P1** | `"checksum_error"` 문자열 → 명시적 예외 또는 `Optional<String>` 반환 |
| **P2** | `FileVersionRepository`, `ChecksumCalculator`, `FileBackupService` 분리 |
| **P3** | 매직 넘버 상수화, null 체크 추가 |
