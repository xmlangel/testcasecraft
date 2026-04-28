# 테스트 아키텍처 가이드 (Test Architecture Guide)

이 문서는 프로젝트의 각 레이어별 테스트 표준과 아키텍처 구조를 정의합니다. 모든 테스트는 **TestNG** 프레임워크를 기반으로 작성됩니다.

## 1. 테스트 레이어 개요

| 레이어               | 테스트 방식        | 주요 도구                   | 베이스 클래스/어노테이션           |
| :------------------- | :----------------- | :-------------------------- | :--------------------------------- |
| **API (Controller)** | 통합/스키마 테스트 | RestAssured, SpringBootTest | `AbstractTestNGSpringContextTests` |
| **Service**          | 단위 테스트 (Mock) | Mockito                     | N/A (MockitoAnnotations)           |
| **Repository**       | DB 접근 테스트     | DataJpaTest, H2             | `AbstractTestNGSpringContextTests` |

---

## 2. 레이어별 상세 가이드

### 2.1. API (Controller) 테스트

API 테스트는 실제 서블릿 컨테이너를 구동하여 엔드 투 엔드 흐름 및 JSON 스키마를 검증합니다.

- **설정**: `@SpringBootTest(webEnvironment = RANDOM_PORT)`
- **도구**: `RestAssured`를 사용하여 선언적인 API 로직 검증.
- **필수 상속**: `AbstractTestNGSpringContextTests` (Spring 컨텍스트 연동을 위해 필수).

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class MyControllerTest extends AbstractTestNGSpringContextTests {
    @LocalServerPort
    private int port;
    // ... setup RestAssured
}
```

### 2.2. Service 테스트

비즈니스 로직에 집중하며, 의존성은 Mock으로 대체합니다. Spring 컨텍스트를 로드하지 않아 속도가 빠릅니다.

- **도구**: `Mockito` (`@Mock`, `@InjectMocks`)
- **초기화**: `MockitoAnnotations.openMocks(this)` 를 `@BeforeMethod`에서 호출.

```java
public class MyServiceTest {
    @Mock
    private MyRepository repository;
    @InjectMocks
    private MyService service;

    @BeforeMethod
    void setUp() { MockitoAnnotations.openMocks(this); }
}
```

### 2.3. Repository 테스트

데이터 입출력 및 쿼리 로직을 검증합니다. 내장 H2 데이터베이스를 사용합니다.

- **설정**: `@DataJpaTest`, `@ActiveProfiles("test")`
- **도구**: `TestEntityManager`를 사용한 데이터 준비 및 검증.
- **🚨 중요**: TestNG 사용 시 **반드시 `AbstractTestNGSpringContextTests`를 상속**받아야 `@Autowired` (entityManager 등)가 작동합니다.

```java
@DataJpaTest
@ActiveProfiles("test")
public class MyRepositoryTest extends AbstractTestNGSpringContextTests {
    @Autowired
    private TestEntityManager entityManager;
    // ...
}
```

---

## 3. 공통 규칙 및 팁

- **Profile**: 테스트 시에는 항상 `test` 프로필을 활성화합니다 (`@ActiveProfiles("test")`).
- **Data Cleanup**: `@DataJpaTest` 또는 `@Transactional`을 사용하여 테스트 종료 후 데이터를 자동 롤백합니다.
- **Reporting**: 모든 테스트는 Allure 리포트 작성을 위한 어노테이션(`@Epic`, `@Feature`, `@Story`, `@Description`) 사용을 권장합니다.

---

## 📚 관련 문서

- [API 개발 가이드](./API_GUIDE.md): API 설계 및 개발 표준
- [API 테스트 가이드 요약](./API_TESTING_GUIDE_SUMMARY.md): API 테스트 작성 패턴 및 실행 방법
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md): 레이어별(API, Service, Repository) 테스트 표준
- [API 종합 테스트 가이드](../API_COMPREHENSIVE_TEST_README.md): 전체 엔드포인트 커버리지 테스트 안내
- [API 테스트 결과 리포트](../APITestResult.md): 최근 테스트 실행 결과 요약
- [개발 가이드](./DEVELOPMENT_GUIDE.md): 개발 환경 및 워크플로우 가이드
