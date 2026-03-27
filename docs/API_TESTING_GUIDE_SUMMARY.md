# API 테스트 가이드

이 프로젝트의 API 테스트는 **TestNG**, **RestAssured**, 그리고 **JSON Schema Validation**을 사용하여 수행됩니다. 전체적인 테스트 아키텍처 및 레이어별 상세 가이드는 [테스트 아키텍처 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/TEST_ARCHITECTURE_GUIDE.md)를 참고하세요.

## 1. 테스트 디렉토리 구조

- **테스트 코드**: `src/test/java/com/testcase/testcasemanagement/api/`
- **JSON 스키마**: `src/test/resources/schemas/`
- **테스트 데이터**: `src/test/resources/test-data/`

## 2. 주요 기술 스택

- **TestNG**: 테스트 프레임워크 (단위 및 통합 테스트)
- **RestAssured**: REST API 호출 및 검증
- **Spring Boot Test**: `@SpringBootTest`를 이용한 통합 테스트 환경 (Random Port 사용)
- **JSON Schema Validator**: API 응답 구조 검증
- **Allure**: 테스트 리포팅

## 3. 테스트 작성 패턴

### 기본 설정

모든 API 테스트 클래스는 `AbstractTestNGSpringContextTests`를 상속받으며, `@SpringBootTest` 어노테이션을 사용합니다.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = TestcasemanagementApplication.class)
public class MyControllerApiTest extends AbstractTestNGSpringContextTests {
    @LocalServerPort
    private int port;

    // globalSetup()에서 RestAssured 설정 (BaseURI, Port, Filters 등)
}
```

### 인증 (JWT)

대부분의 API는 인증이 필요합니다. `BeforeClass`에서 로그인을 통해 토큰을 획득합니다.

```java
@BeforeClass
public void globalSetup() {
    RestAssured.port = port;
    jwtToken = given()
        .contentType(ContentType.JSON)
        .body(Map.of("username", "admin", "password", "admin123"))
        .post("/api/auth/login")
        .then()
        .extract().path("token");
}
```

### JSON 스키마 검증

응답 데이터의 구조가 올바른지 확인하기 위해 JSON Schema를 활용합니다.

```java
@Test
public void getTestCaseTest() {
    given()
        .header("Authorization", "Bearer " + jwtToken)
    .when()
        .get("/api/testcases/1")
    .then()
        .statusCode(200)
        .body(matchesJsonSchema(testCaseSchema));
}
```

## 4. 테스트 실행 방법

### Gradle을 통한 실행

```bash
./gradlew test --tests "com.testcase.testcasemanagement.api.*"
```

### 특정 테스트 클래스 실행

```bash
./gradlew test --tests "com.testcase.testcasemanagement.api.TestCaseControllerJsonSchemaTest"
```

## 5. 참고할 기존 테스트 사례

- **가장 기본적인 예시**: `SingleApiTest.java` (인프라 연결 확인용)
- **포괄적인 스키마 검증**: `TestCaseControllerJsonSchemaTest.java`
- **종합 API 시나리오**: `AllApiComprehensiveTest.java`

---

## 📚 관련 문서

- [API 개발 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_GUIDE.md): API 설계 및 개발 표준
- [API 테스트 가이드 요약](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_TESTING_GUIDE_SUMMARY.md): API 테스트 작성 패턴 및 실행 방법
- [테스트 아키텍처 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/TEST_ARCHITECTURE_GUIDE.md): 레이어별(API, Service, Repository) 테스트 표준
- [API 종합 테스트 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_COMPREHENSIVE_TEST_README.md): 전체 엔드포인트 커버리지 테스트 안내
- [API 테스트 결과 리포트](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/APITestResult.md): 최근 테스트 실행 결과 요약
