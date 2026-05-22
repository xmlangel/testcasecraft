# 06. 테스트 작성 계획 (단위 + 통합)

## 개요

- **프레임워크**: TestNG (Mockito + WireMock + `@SpringBootTest`)
- **목표 커버리지**: 신규 분리 클래스 80% / 기존 핵심 분기 70%
- **위치**: `src/test/java/com/testcase/testcasemanagement/service/`

## 기존 테스트 자산

- `TestResultReportServiceMockTest.java`: TestNG + Mockito 보일러플레이트 활용 가능
- `JunitXmlParserServiceTest.java`: 파일 IO Service 테스트 참고
- `service/rag/` 디렉토리: RAG 관련 기존 테스트 존재 (확장 활용)
- `GoogleConfigServiceTest.java`: 외부 의존성 모킹 사례

## 신규 테스트 파일 매핑

| 대상 Service | 신규/확장 테스트 파일 |
|---|---|
| TestCaseService | `TestCaseServiceTest.java` (단위), `TestCaseServiceIntegrationTest.java` (통합) |
| RagServiceImpl | `service/rag/RagServiceImplTest.java` 확장, `RagServiceImplIntegrationTest.java` (WireMock 통합) |
| TestResultReportService | `TestResultReportServiceMockTest.java` 확장, `TestResultReportServiceIntegrationTest.java` |
| TranslationManagementService | `TranslationManagementServiceTest.java`, `TranslationManagementServiceIntegrationTest.java` |
| JunitVersionControlService | `JunitVersionControlServiceTest.java`, `JunitVersionControlServiceConcurrencyTest.java` |

## 단위 테스트 표준 패턴

```java
package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class <ServiceName>Test {
    @Mock private SomeRepository someRepository;
    @InjectMocks private <ServiceName> service;

    @BeforeMethod
    public void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    public void given_<condition>_when_<action>_then_<result>() {
        // given
        when(someRepository.findById(any())).thenReturn(Optional.of(fixture()));
        // when
        var result = service.doSomething(...);
        // then
        assertEquals(result.getStatus(), "OK");
        verify(someRepository).save(any());
    }
}
```

## 통합 테스트 표준 패턴

```java
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class <ServiceName>IntegrationTest extends AbstractTestNGSpringContextTests {

    @Autowired private <ServiceName> service;

    @Test
    public void e2e_<scenario>() {
        // arrange real fixtures via repositories
        // act through service public API
        // assert side effects
    }
}
```

## WireMock 통합 (RagServiceImpl 전용)

```java
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureWireMock(port = 0)
public class RagServiceImplIntegrationTest extends AbstractTestNGSpringContextTests {

    @Autowired private RagService ragService;

    @Test
    public void vectorizeTestCase_polls_until_completion() {
        stubFor(post(urlPathEqualTo("/api/v1/documents/upload"))
            .willReturn(okJson("{\"documentId\":\"abc\"}")));
        stubFor(post(urlPathEqualTo("/api/v1/analyze"))
            .willReturn(okJson("{\"status\":\"PENDING\"}")));
        stubFor(get(urlPathMatching("/api/v1/documents/.*"))
            .willReturn(okJson("{\"status\":\"COMPLETED\"}")));
        // ...
    }
}
```

## 동시성 테스트 (JunitVersionControlService)

```java
@Test
public void getNextVersionNumber_underConcurrency_yieldsUniqueNumbers() throws Exception {
    int threads = 10;
    ExecutorService pool = Executors.newFixedThreadPool(threads);
    Set<Integer> results = ConcurrentHashMap.newKeySet();
    CountDownLatch latch = new CountDownLatch(threads);
    for (int i = 0; i < threads; i++) {
        pool.submit(() -> {
            try { results.add(service.createVersion(SAME_TEST_RESULT_ID, ...).getVersionNumber()); }
            finally { latch.countDown(); }
        });
    }
    latch.await(30, TimeUnit.SECONDS);
    assertEquals(results.size(), threads, "버전 번호가 중복 발급되지 않아야 함");
}
```

## 단위 테스트 인벤토리 (총 42개)

| Service | 케이스 수 | 우선순위 |
|---|---|---|
| TestCaseService | 10 | P1 |
| RagServiceImpl | 10 | P1 |
| TestResultReportService | 9 | P1 |
| TranslationManagementService | 8 | P2 |
| JunitVersionControlService | 5 | P0 (동시성 포함) |

**상세 케이스 목록은 각 Service 리뷰 문서(§8)를 참조.**

## 통합 테스트 인벤토리 (총 13개)

| Service | 시나리오 |
|---|---|
| TestCaseService | (1) CSV import→파일저장→RAG→버전이벤트 (2) GoogleSheet export 클리어+작성 (3) 배치저장 displayOrder 재조정 |
| RagServiceImpl | (1) 벡터화 E2E (WireMock) (2) LLM 분석 재개 (3) RAG 비활성화 시 IllegalStateException |
| TestResultReportService | (1) 상세 리포트 페이징/정렬 (2) JIRA 필터 적용 (3) 계층 리포트 생성 |
| TranslationManagementService | (1) 언어→번역→진행도 (2) CSV bulk import→통계 |
| JunitVersionControlService | (1) 생성-복원 라운드트립 (2) 백업 실패 시 롤백 |

## QA 절차 (Phase 4)

### 1. 단위 테스트
```bash
./gradlew test --tests "*ServiceTest*"
```

### 2. 통합 테스트
```bash
./gradlew test --tests "*ServiceIntegrationTest*"
```

### 3. 동시성 테스트 (선택)
```bash
./gradlew test --tests "*ConcurrencyTest*"
```

### 4. Allure 리포트
```bash
./gradlew allureReport
```

### 5. E2E 회귀 검증
```bash
# (1) 서버 기동 — 사용자에게 요청 (가이드라인에 따라 자동 실행 금지)
./gradlew bootRun

# (2) E2E
npm run test:ict-138 --prefix src/test/e2e
```

### 6. 수동 검증 체크리스트
- [ ] TestCase 생성/수정/삭제 정상 동작
- [ ] CSV/Excel/JSON Import 모두 성공
- [ ] Google Sheet Export 성공
- [ ] RAG 벡터화 → 검색 결과 반환
- [ ] 테스트 결과 리포트 페이징 정상
- [ ] 번역 키 검색/대량 추가 정상
- [ ] Junit XML 버전 생성·복원 정상

## DoD (Definition of Done)

각 PR 머지 전:
- [ ] `./gradlew test` 100% 통과
- [ ] JaCoCo 신규 클래스 80% 이상 (CI 게이트 추가 필요)
- [ ] 코드 리뷰 1인 이상 승인
- [ ] 동시성 테스트 100회 연속 통과 (JunitVersionControlService 변경 시)
- [ ] 회귀 E2E 1회 실행
