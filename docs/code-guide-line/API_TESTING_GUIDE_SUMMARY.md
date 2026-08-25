# API 테스트 가이드

최종 갱신: 2026-08-23 21:40 KST

이 프로젝트의 API 테스트는 **TestNG**, **RestAssured**, **JSON Schema Validation** 으로 수행합니다. 레이어별 테스트 표준은 [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md)를 참고하세요.

## 1. 테스트 디렉토리 구조

- **테스트 코드**: `src/test/java/com/testcase/testcasemanagement/api/`
- **JSON 스키마**: `src/test/resources/schemas/` (40개)
- **테스트 데이터**: `src/test/resources/test-data/` (CSV·XLSX 임포트 검증용)
- **테스트 프로파일 설정**: `src/test/resources/application-test.yml`

## 2. 주요 기술 스택

- **TestNG 7.10.2**: 테스트 프레임워크
- **RestAssured 5.3.2**: REST API 호출 및 검증
- **Spring Boot Test**: `@SpringBootTest(webEnvironment = RANDOM_PORT)` 통합 테스트 환경
- **JSON Schema Validator**: 응답 구조 검증 (`io.rest-assured:json-schema-validator`)
- **Testcontainers PostgreSQL**: 테스트 DB. H2 를 사용하지 않는 이유는 테스트 아키텍처 가이드 1절에 있습니다.
- **Allure 2.19.0**: 테스트 리포팅

## 3. 테스트 작성 패턴

### 기본 설정

모든 API 테스트 클래스는 `AbstractTestNGSpringContextTests` 를 상속하고 `@SpringBootTest` 를 붙입니다.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = TestcasemanagementApplication.class)
public class MyControllerApiTest extends AbstractTestNGSpringContextTests {
  @LocalServerPort private int port;

  // globalSetup() 에서 RestAssured 설정 (BaseURI, Port, Filters 등)
}
```

### 인증 (JWT)

대부분의 API 는 인증이 필요합니다. `@BeforeClass` 에서 로그인해 토큰을 받습니다.

**응답 필드 이름은 `accessToken` 입니다.** `token` 으로 읽으면 null 이 들어가고, 이후 모든 요청이 401 로 떨어지면서 인증 문제가 아닌 다른 원인을 찾게 됩니다.

```java
@BeforeClass
public void globalSetup() {
  RestAssured.port = port;
  jwtToken =
      given()
          .contentType(ContentType.JSON)
          .body(Map.of("username", "admin", "password", "admin123"))
          .post("/api/auth/login")
          .then()
          .extract()
          .path("accessToken");
}
```

재발급이 필요하면 같은 응답의 `refreshToken` 을 `/api/auth/refresh` 에 보냅니다.

### JSON 스키마 검증

응답 구조가 계약대로인지 스키마로 확인합니다. 필드 이름이 조용히 바뀌는 것을 이 층이 잡습니다.

```java
@Test
public void getTestCaseTest() {
  given()
      .header("Authorization", "Bearer " + jwtToken)
  .when()
      .get("/api/testcases/{id}", testCaseId)   // id 는 UUID 문자열
  .then()
      .statusCode(200)
      .body(matchesJsonSchema(testCaseSchema));
}
```

식별자는 전부 **UUID 문자열**입니다. 숫자 ID 를 넣은 경로는 404 로 떨어집니다.

## 4. 테스트 실행 방법

### ⚠️ `api` 패키지는 기본 `test` 태스크에서 제외되어 있다

`build.gradle` 의 `test` 태스크가 `exclude 'com/testcase/testcasemanagement/api/**'` 를 걸고 있습니다. 그래서 아래 명령은 **아무 테스트도 실행하지 않고 성공으로 끝납니다.**

```bash
# 실행되지 않는다 (api 패키지가 제외되어 있음)
./gradlew test --tests "com.testcase.testcasemanagement.api.*"
```

### 종합 테스트 실행

`api-comprehensive-test` 그룹은 전용 태스크로 돕니다.

```bash
./gradlew apiComprehensiveTest
```

### 그 밖의 api 패키지 테스트

`apiComprehensiveTest` 는 `@Test(groups = "api-comprehensive-test")` 가 붙은 것만 실행합니다. 현재 그 그룹을 가진 클래스는 `AllApiComprehensiveTest` 하나입니다.

그래서 `TestCaseControllerJsonSchemaTest`·`SingleApiTest`·`OrganizationSecurityTest` 같은 나머지 `api` 패키지 클래스는 **어느 표준 Gradle 태스크에도 걸리지 않습니다.** `test` 는 경로로 제외하고(`--tests` 로는 경로 제외를 되돌릴 수 없습니다), `apiComprehensiveTest` 는 그룹으로 걸러냅니다. 이 클래스들을 CI 에서 돌리려면 둘 중 하나가 필요합니다.

- 해당 클래스의 `@Test` 에 `groups = {"api-comprehensive-test"}` 를 붙여 종합 태스크에 편입합니다.
- 또는 `build.gradle` 에 이 클래스들만 포함하는 Test 태스크를 따로 만듭니다.

손으로 한 번 확인할 때는 IDE 에서 클래스를 직접 실행하는 것이 가장 빠릅니다.

### 실행 전 조건

- **Docker 데몬이 떠 있어야 합니다.** Testcontainers 가 PostgreSQL 컨테이너를 직접 기동합니다.
- 로컬 DB(`localhost:5434`)는 띄우지 않아도 됩니다.

## 5. 참고할 기존 테스트 사례

- **가장 기본적인 예시**: `SingleApiTest.java` (인프라 연결 확인용)
- **포괄적인 스키마 검증**: `TestCaseControllerJsonSchemaTest.java`
- **종합 API 시나리오**: `AllApiComprehensiveTest.java` (역할별 토큰 발급·권한 경계 검증 포함)
- **권한 경계 전용**: `OrganizationSecurityTest.java`

---

## 📚 관련 문서

- [API 개발 가이드](./API_GUIDE.md): API 설계 및 개발 표준
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md): 레이어별(API, Service, Repository) 테스트 표준
- [E2E 테스트 가이드](./E2E_TESTING_GUIDE.md): Playwright 시나리오 테스트
- [API 종합 테스트 가이드](../API_COMPREHENSIVE_TEST_README.md): 전체 엔드포인트 커버리지 테스트 안내
- [개발 가이드](./DEVELOPMENT_GUIDE.md): 개발 환경 및 워크플로우 가이드
