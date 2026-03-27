---
name: API Testing
description: RestAssured, TestNG, JSON Schema를 활용한 API 테스트 작성 및 실행 가이드
---

# API 테스트 (RestAssured) 가이드

이 스킬은 프로젝트에서 RestAssured와 TestNG를 활용하여 API 통합 테스트를 작성하고 실행할 때 준수해야 할 규칙을 정의합니다.

## 1. 전제 조건 (Prerequisites)

- **자바 버전**: Java 21 필수
- **데이터베이스**: 테스트 프로필(`test`) 사용 시 H2 인메모리 DB가 사용되나, 필요에 따라 Docker로 PostgreSQL이 구동 중이어야 할 수 있습니다.
- **포트 확인**: 테스트는 일반적으로 `RANDOM_PORT`를 사용하므로 로컬 8080 포트가 비어있지 않아도 되지만, 서버가 정상적으로 구동 가능한 환경이어야 합니다.

## 2. 테스트 작성 가이드 (Best Practices)

### 2.1. 클래스 구조 및 설정

모든 API 테스트 클래스는 `@SpringBootTest`를 사용하며 `AbstractTestNGSpringContextTests`를 상속합니다.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = TestcasemanagementApplication.class)
public class BaseApiTest extends AbstractTestNGSpringContextTests {
    @LocalServerPort
    protected int port;

    protected String jwtToken;

    @BeforeClass(alwaysRun = true)
    public void setup() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        // 공통 필터 설정 (Logging, Allure 등)
        RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter(), new AllureRestAssured());

        // 인증 토큰 획득 로직
        this.jwtToken = loginAndGetToken("admin", "admin123");
    }
}
```

### 2.2. JSON Schema 검증 (중요)

데이터 값뿐만 아니라 응답의 전체 구조를 검증하기 위해 반드시 JSON Schema Validation을 수행해야 합니다.

- **스키마 위치**: `src/test/resources/schemas/`
- **사용법**: `matchesJsonSchema(schemaString)`

```java
@Test
public void validateProjectSchema() {
    given()
        .header("Authorization", "Bearer " + jwtToken)
    .when()
        .get("/api/projects/1")
    .then()
        .statusCode(200)
        .body(matchesJsonSchema(projectSchema));
}
```

### 2.3. 테스트 데이터 관리

- **동적 생성**: 가급적 테스트 시작 시 필요한 데이터(프로젝트, 테스트케이스 등)를 API로 직접 생성하고 사용하세요.
- **정리(Cleanup)**: 테스트가 완료된 후 생성한 데이터를 삭제하여 데이터베이스 상태를 깨끗하게 유지하세요. (`@AfterMethod` 또는 `@AfterClass` 활용)

### 2.4. 명명 규칙

- **클래스명**: `{기능/컨트롤러명}ControllerJsonSchemaTest.java` 또는 `{기능명}ApiTest.java`
- **메서드명**: `should{ExpectedResult}When{Condition}` (예: `shouldReturn400WhenNameEmailIsInvalid`)

## 3. 테스트 실행 및 리포팅

### 3.1. 실행 스크립트 활용

Skill에 포함된 유틸리티 스크립트를 사용하여 간편하게 실행할 수 있습니다.

```bash
# 특정 클래스 실행
./.agent/skills/api-testing/scripts/run-api-test.sh --class TestCaseControllerJsonSchemaTest

# 특정 메서드만 실행
./.agent/skills/api-testing/scripts/run-api-test.sh --method getTestCaseByIdTest
```

### 3.2. Allure 리포트 확인

테스트 실행 후 생성된 결과를 시각적으로 확인하기 위해 Allure 리포트를 활용합니다.

```bash
./gradlew allureServe
```

### 3.3. 테스트 결과 자동 분석 (New)

실행 결과를 빠르게 요약하고 주요 실패 원인을 파악하기 위해 분석 스크립트를 활용합니다.

```bash
# 전체 테스트 결과 요약 분석
./.agent/skills/api-testing/scripts/analyze-test-results.sh
```

## 4. 테스트 결과 분석 워크플로우 (Troubleshooting Workflow)

테스트 실패 시 다음 단계를 거쳐 원인을 파악하고 문서를 업데이트합니다.

1.  **인프라 상태 확인**: `docker-compose ps`를 통해 DB, MinIO 등이 정상인지 먼저 확인합니다.
2.  **분석 스크립트 실행**: `analyze-test-results.sh`를 실행하여 실패한 클래스와 대표적인 에러 메시지를 수집합니다.
3.  **상세 로그 조사**: `build/test-results/test/TEST-{ClassName}.xml` 파일을 직접 열어 에러 스택트레이스를 확인합니다.
4.  **결과 문서화**: `docs/APITestResult.md`에 현재 상태(성공/실패/건너뜀 수)와 주요 장애 내용을 기록하여 공유합니다.

## 5. 트러블슈팅 가이드

- **401 Unauthorized**: JWT 토큰이 만료되었거나 `BeforeClass`에서 토큰 획득에 실패했는지 확인하세요.
- **JsonSchemaMismatchException**: API 응답 구조가 변경되었을 가능성이 큽니다. `src/test/resources/schemas/`의 스키마 파일을 업데이트해야 합니다.
- **Port Binding Error**: 서버 부팅 중 포트 충돌이 발생하면 `lsof -ti:8080 | xargs kill -9` 등으로 정리 후 재실행하세요.
- **NullPointerException (entityManager is null)**: `@DataJpaTest` 사용 시 `entityManager` 주입 설정이나 스프링 컨텍스트 로딩이 정상인지 확인하세요.
