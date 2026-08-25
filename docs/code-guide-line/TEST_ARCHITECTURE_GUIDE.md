# 테스트 아키텍처 가이드 (Test Architecture Guide)

최종 갱신: 2026-08-23 21:40 KST

프로젝트의 레이어별 테스트 표준과 아키텍처 구조입니다. 모든 백엔드 테스트는 **TestNG** 프레임워크를 기반으로 작성합니다.

## 1. 테스트 레이어 개요

| 레이어 | 테스트 방식 | 주요 도구 | 베이스 클래스/어노테이션 |
| :--- | :--- | :--- | :--- |
| **API (Controller)** | 통합/스키마 테스트 | RestAssured, SpringBootTest | `AbstractTestNGSpringContextTests` |
| **Service** | 단위 테스트 (Mock) | Mockito | 상속 없음 (`MockitoAnnotations.openMocks`) |
| **Repository** | DB 접근 테스트 | `@DataJpaTest`, Testcontainers PostgreSQL | `AbstractTestNGSpringContextTests` |

테스트 DB 는 **Testcontainers 가 띄우는 PostgreSQL 컨테이너**입니다. H2 는 사용하지 않습니다. 프로덕션이 PostgreSQL 전용 문법(`jsonb`, `ON CONFLICT`, 배열 함수)을 쓰기 때문에 H2 로는 통과했다가 운영에서 깨지는 쿼리를 걸러내지 못합니다.

---

## 2. 레이어별 상세 가이드

### 2.1. API (Controller) 테스트

API 테스트는 실제 서블릿 컨테이너를 구동하여 엔드 투 엔드 흐름과 JSON 스키마를 검증합니다.

- **설정**: `@SpringBootTest(webEnvironment = RANDOM_PORT)`
- **도구**: `RestAssured` 로 요청·검증을 선언적으로 작성
- **필수 상속**: `AbstractTestNGSpringContextTests` (Spring 컨텍스트 연동에 필요)

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class MyControllerTest extends AbstractTestNGSpringContextTests {
  @LocalServerPort private int port;
  // ... RestAssured 설정
}
```

`src/test/java/com/testcase/testcasemanagement/api/` 아래의 테스트는 **기본 `test` 태스크에서 제외**되어 있습니다. 실행 방법은 [API 테스트 가이드 요약](./API_TESTING_GUIDE_SUMMARY.md)의 실행 절을 따릅니다.

### 2.2. Service 테스트

비즈니스 로직에 집중하며 의존성은 Mock 으로 대체합니다. Spring 컨텍스트를 올리지 않아 빠릅니다.

- **도구**: `Mockito` (`@Mock`, `@InjectMocks`)
- **초기화**: `@BeforeMethod` 에서 `MockitoAnnotations.openMocks(this)` 를 호출하고, 반환된 `AutoCloseable` 을 `@AfterMethod` 에서 닫습니다. 닫지 않으면 병렬 포크에서 목이 누적됩니다.

```java
public class MyServiceTest {
  @Mock private MyRepository repository;
  @InjectMocks private MyService service;

  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }
}
```

### 2.3. Repository 테스트

데이터 입출력과 쿼리 로직을 검증합니다. **Testcontainers 가 기동한 PostgreSQL 컨테이너**에 붙습니다.

- **설정**: `@DataJpaTest`, `@AutoConfigureTestDatabase(replace = Replace.NONE)`, `@ActiveProfiles("test")`, `@Transactional`
- **도구**: `TestEntityManager` 로 데이터를 준비하고 검증
- **🚨 중요**: TestNG 에서는 **반드시 `AbstractTestNGSpringContextTests` 를 상속**해야 `@Autowired` 가 작동합니다.
- **🚨 중요**: `@AutoConfigureTestDatabase(replace = Replace.NONE)` 를 빼면 Spring Boot 가 내장 DB 로 데이터소스를 갈아치우고, 그러면 컨테이너 연결이 무효가 됩니다.

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Transactional
public class MyRepositoryTest extends AbstractTestNGSpringContextTests {
  @Autowired private TestEntityManager entityManager;
  @Autowired private MyRepository myRepository;
  // ...
}
```

#### 컨테이너 연결 경로

테스트 코드가 컨테이너를 직접 선언하지 않습니다. 아래 두 클래스가 대신합니다.

| 클래스 | 위치 | 역할 |
| :--- | :--- | :--- |
| `PostgresTestContainer` | `src/test/java/.../testsupport/` | JVM 전역 단일 `PostgreSQLContainer`(`postgres:15-alpine`). static 초기화에서 한 번 기동하고, JVM 종료 시 Ryuk 이 폐기합니다. |
| `TestcontainersInitializer` | `src/test/java/.../testsupport/` | `META-INF/spring.factories` 에 `ApplicationContextInitializer` 로 등록되어 모든 Spring 테스트 컨텍스트에 컨테이너의 JDBC URL·계정·`ddl-auto=update` 를 주입합니다. |

그래서 `application-test.yml` 에 적힌 `localhost:5434` 는 실제로 쓰이지 않고 컨테이너 매핑 주소로 덮어써집니다. 로컬 DB 를 띄우지 않아도 테스트가 돕니다. 대신 **Docker 데몬은 떠 있어야 합니다.**

---

## 3. 공통 규칙 및 팁

- **Profile**: 테스트에서는 항상 `test` 프로파일을 활성화합니다(`@ActiveProfiles("test")`).
- **Data Cleanup**: `@DataJpaTest` 또는 `@Transactional` 로 테스트 종료 후 데이터를 롤백합니다. 컨테이너 스키마는 포크 안에서 공유되므로, 롤백되지 않는 데이터를 남기면 같은 포크의 다른 테스트가 그것을 봅니다.
- **병렬 실행**: `test` 태스크는 `maxParallelForks` 를 `코어/2`(최대 4)로 두고 테스트 클래스를 여러 JVM 에 나눕니다. 컨테이너는 포크마다 하나씩 뜨므로 포크 간 DB 충돌은 없습니다. 다만 **static 가변 상태를 공유하는 테스트는 포크 안에서 여전히 충돌**하니 클래스 간 순서 의존을 만들지 않습니다.
- **Reporting**: Allure 어노테이션(`@Epic`, `@Feature`, `@Story`, `@Description`) 사용을 권장합니다. 결과는 `build/allure-results` 에 쌓이고 `./gradlew allureReport` 로 렌더합니다.

### 실행 명령 정리

```bash
# 단위·통합 테스트 (api 패키지와 Google Sheets 연동 테스트는 제외됨)
./gradlew test

# 특정 클래스만
./gradlew test --tests "*ProjectServiceTest*"

# API 전체 엔드포인트 종합 테스트 (api-comprehensive-test 그룹)
./gradlew apiComprehensiveTest

# 성능·부하 테스트
./gradlew performanceTest
./gradlew loadTest

# Allure 리포트
./gradlew allureReport
```

---

## 📚 관련 문서

- [API 개발 가이드](./API_GUIDE.md): API 설계 및 개발 표준
- [API 테스트 가이드 요약](./API_TESTING_GUIDE_SUMMARY.md): API 테스트 작성 패턴 및 실행 방법
- [E2E 테스트 가이드](./E2E_TESTING_GUIDE.md): Playwright 시나리오 테스트
- [API 종합 테스트 가이드](../API_COMPREHENSIVE_TEST_README.md): 전체 엔드포인트 커버리지 테스트 안내
- [개발 가이드](./DEVELOPMENT_GUIDE.md): 개발 환경 및 워크플로우 가이드
