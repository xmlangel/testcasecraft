// src/test/java/com/testcase/testcasemanagement/api/DashboardApiComprehensiveValidationTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;
import org.springframework.transaction.annotation.Transactional;
import org.testng.Assert;
import org.testng.annotations.*;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.ValidationMessage;
import com.networknt.schema.SpecVersion;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.InputStream;
import java.util.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * ICT-132: 대시보드 API JSON Schema 검증 구현 - 종합 검증 테스트
 * 
 * 이 클래스는 모든 대시보드 API에 대한 종합적인 JSON Schema 검증을 수행합니다.
 * - 스키마 구조 검증
 * - 데이터 타입 검증
 * - 비즈니스 로직 검증
 * - 에지 케이스 검증
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@TestExecutionListeners({
        DependencyInjectionTestExecutionListener.class,
        TransactionalTestExecutionListener.class
})
@Epic("ICT-132: Dashboard API JSON Schema Validation")
@Feature("대시보드 API 종합 검증")
@ActiveProfiles("test")
public class DashboardApiComprehensiveValidationTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private static String testProjectId;
    private ObjectMapper objectMapper = new ObjectMapper();
    private JsonSchemaFactory schemaFactory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V7);

    // 생성된 리소스 ID 리스트
    private final List<String> createdProjectIds = new ArrayList<>();

    @BeforeClass
    @Step("ICT-132 종합 검증 테스트 환경 설정")
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.filters(
                new RequestLoggingFilter(),
                new ResponseLoggingFilter());

        // JWT 토큰 획득
        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "admin");

        jwtToken = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract().path("accessToken");

        // 테스트용 프로젝트 생성
        Map<String, Object> projectRequest = new HashMap<>();
        projectRequest.put("name", "ICT-132 종합검증 테스트 프로젝트");
        projectRequest.put("code", "ICT132-" + System.currentTimeMillis());
        projectRequest.put("description", "대시보드 API JSON Schema 종합 검증용");
        projectRequest.put("displayOrder", 1);

        testProjectId = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(projectRequest)
                .when()
                .post("/api/projects")
                .then()
                .statusCode(201)
                .extract().path("id");

        createdProjectIds.add(testProjectId);
    }

    @BeforeMethod
    @AfterMethod
    @Transactional
    @Step("테스트 데이터 초기화")
    public void cleanTestData() {
        // 별도 데이터 클린업 없음 (트랜잭션 롤백)
    }

    @AfterClass
    public void cleanUpResources() {
        // 생성된 프로젝트들 정리
        for (String id : createdProjectIds) {
            try {
                given()
                        .header("Authorization", "Bearer " + jwtToken)
                        .when()
                        .delete("/api/projects/" + id + "?force=true");
            } catch (Exception ignore) {
            }
        }
        createdProjectIds.clear();
    }

    @Attachment(value = "응답 본문", type = "application/json")
    private String attachResponse(Response response) {
        return response.asPrettyString();
    }

    /**
     * 커스텀 JSON Schema 검증
     */
    private void validateJsonSchema(String responseBody, String schemaResourcePath) throws Exception {
        try (InputStream schemaStream = getClass().getClassLoader().getResourceAsStream(schemaResourcePath)) {
            Assert.assertNotNull(schemaStream, "스키마 파일을 찾을 수 없습니다: " + schemaResourcePath);

            JsonNode schemaNode = objectMapper.readTree(schemaStream);
            JsonSchema schema = schemaFactory.getSchema(schemaNode);

            JsonNode responseNode = objectMapper.readTree(responseBody);
            Set<ValidationMessage> errors = schema.validate(responseNode);

            if (!errors.isEmpty()) {
                StringBuilder errorMessage = new StringBuilder("JSON Schema 검증 실패:\n");
                for (ValidationMessage error : errors) {
                    errorMessage.append("- ").append(error.getMessage()).append("\n");
                }
                Assert.fail(errorMessage.toString());
            }
        }
    }

    @Test(priority = 1)
    @Story("최근 테스트 결과 API 종합 검증")
    @Severity(SeverityLevel.CRITICAL)
    @Description("최근 테스트 결과 API의 모든 시나리오에 대한 종합 JSON Schema 검증")
    public void validateRecentTestResultsApiComprehensively() throws Exception {
        // 1. 전체 최근 테스트 결과 검증
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response1.getBody().asString(), "schemas/dashboard-recent-test-results-schema.json");
        attachResponse(response1);

        // 2. Limit 파라미터 검증
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 5)
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .body("size()", lessThanOrEqualTo(5))
                .extract().response();

        validateJsonSchema(response2.getBody().asString(), "schemas/dashboard-recent-test-results-schema.json");

        // 3. 프로젝트별 최근 테스트 결과 검증
        Response response3 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/recent-test-results")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response3.getBody().asString(), "schemas/dashboard-recent-test-results-schema.json");

        // 4. 응답 데이터 비즈니스 로직 검증
        List<Map<String, Object>> results = response3.jsonPath().getList("$");
        for (Map<String, Object> result : results) {
            if (result.get("projectId") != null) {
                Assert.assertEquals(result.get("projectId"), testProjectId,
                        "프로젝트별 조회 시 모든 결과는 요청한 프로젝트의 것이어야 합니다.");
            }
        }
    }

    @Test(priority = 2)
    @Story("오픈 테스트런 담당자별 결과 API 종합 검증")
    @Severity(SeverityLevel.CRITICAL)
    @Description("오픈 테스트런 담당자별 결과 API의 모든 시나리오에 대한 종합 JSON Schema 검증")
    public void validateOpenTestRunAssigneeResultsApiComprehensively() throws Exception {
        // 1. 전체 오픈 테스트런 담당자별 결과 검증
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response1.getBody().asString(),
                "schemas/dashboard-open-test-run-assignee-results-schema.json");
        attachResponse(response1);

        // 2. Limit 파라미터 검증
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 5)
                .when()
                .get("/api/dashboard/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body("size()", lessThanOrEqualTo(5))
                .extract().response();

        validateJsonSchema(response2.getBody().asString(),
                "schemas/dashboard-open-test-run-assignee-results-schema.json");

        // 3. 프로젝트별 오픈 테스트런 담당자별 결과 검증
        Response response3 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response3.getBody().asString(),
                "schemas/dashboard-open-test-run-assignee-results-schema.json");

        // 4. 응답 데이터 범위 검증
        List<Map<String, Object>> results = response1.jsonPath().getList("$");
        for (Map<String, Object> result : results) {
            Double completionRate = ((Number) result.get("completionRate")).doubleValue();
            Double passRate = ((Number) result.get("passRate")).doubleValue();

            Assert.assertTrue(completionRate >= 0 && completionRate <= 100,
                    "완료율은 0-100 범위여야 합니다. 실제: " + completionRate);
            Assert.assertTrue(passRate >= 0 && passRate <= 100,
                    "통과율은 0-100 범위여야 합니다. 실제: " + passRate);
        }
    }

    @Test(priority = 3)
    @Story("테스트 결과 추이 API 종합 검증")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트 결과 추이 API의 모든 시나리오에 대한 종합 JSON Schema 검증")
    public void validateTestResultsTrendApiComprehensively() throws Exception {
        // 1. 기본 테스트 결과 추이 검증
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response1.getBody().asString(), "schemas/dashboard-test-results-trend-schema.json");
        attachResponse(response1);

        // 2. 날짜 범위 지정 검증
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("startDate", "2025-01-01")
                .queryParam("endDate", "2025-12-31")
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response2.getBody().asString(), "schemas/dashboard-test-results-trend-schema.json");

        // 3. 응답 데이터 형식 검증
        List<Map<String, Object>> results = response1.jsonPath().getList("$");
        for (Map<String, Object> result : results) {
            String dateStr = (String) result.get("date");
            Assert.assertTrue(dateStr.matches("^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/[0-9]{4}$"),
                    "날짜 형식이 MM/dd/yyyy 패턴이어야 합니다. 실제: " + dateStr);

            Integer completeRate = (Integer) result.get("completeRate");
            Assert.assertTrue(completeRate >= 0 && completeRate <= 100,
                    "완료율은 0-100 범위여야 합니다. 실제: " + completeRate);
        }
    }

    @Test(priority = 4)
    @Story("프로젝트 통계 API 종합 검증")
    @Severity(SeverityLevel.CRITICAL)
    @Description("ICT-129 프로젝트 통계 API의 모든 시나리오에 대한 종합 JSON Schema 검증")
    public void validateProjectStatisticsApiComprehensively() throws Exception {
        // 1. 프로젝트 통계 기본 검증
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/statistics")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response1.getBody().asString(), "schemas/project-statistics-schema.json");
        attachResponse(response1);

        // 2. 존재하지 않는 프로젝트 ID 검증 (기본값 반환)
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/statistics")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response2.getBody().asString(), "schemas/project-statistics-schema.json");

        // 3. 응답 데이터 비즈니스 로직 검증
        Map<String, Object> statistics = response1.jsonPath().getMap("$");

        Assert.assertEquals(statistics.get("projectId"), testProjectId,
                "프로젝트 ID가 요청한 ID와 일치해야 합니다.");

        // 비율 필드 검증
        Double executionRate = ((Number) statistics.get("executionRate")).doubleValue();
        Double passRate = ((Number) statistics.get("passRate")).doubleValue();
        Double testCoverage = ((Number) statistics.get("testCoverage")).doubleValue();

        Assert.assertTrue(executionRate >= 0 && executionRate <= 100,
                "실행률은 0-100 범위여야 합니다.");
        Assert.assertTrue(passRate >= 0 && passRate <= 100,
                "통과율은 0-100 범위여야 합니다.");
        Assert.assertTrue(testCoverage >= 0 && testCoverage <= 100,
                "테스트 커버리지는 0-100 범위여야 합니다.");

        // 개수 필드 검증 (음수가 아니어야 함)
        Assert.assertTrue((Integer) statistics.get("totalTestCases") >= 0,
                "총 테스트케이스 수는 0 이상이어야 합니다.");
        Assert.assertTrue((Integer) statistics.get("executedTestCases") >= 0,
                "실행된 테스트케이스 수는 0 이상이어야 합니다.");

        // 필수 필드 존재 검증
        Assert.assertNotNull(statistics.get("calculatedAt"),
                "calculatedAt 필드는 null이 아니어야 합니다.");
        Assert.assertTrue((Integer) statistics.get("dataFreshnessMinutes") >= 0,
                "데이터 신선도는 0 이상이어야 합니다.");
    }

    @Test(priority = 5)
    @Story("테스트케이스 통계 API 종합 검증")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트케이스 상태별 통계 API의 모든 시나리오에 대한 종합 JSON Schema 검증")
    public void validateTestCaseStatisticsApiComprehensively() throws Exception {
        // 1. 테스트케이스 통계 기본 검증
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-case-statistics")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response1.getBody().asString(), "schemas/dashboard-test-case-statistics-schema.json");
        attachResponse(response1);

        // 2. 응답 데이터 일관성 검증
        Map<String, Object> statistics = response1.jsonPath().getMap("$");

        Integer totalCases = (Integer) statistics.get("totalCases");
        Integer pass = (Integer) statistics.get("PASS");
        Integer fail = (Integer) statistics.get("FAIL");
        Integer blocked = (Integer) statistics.get("BLOCKED");
        Integer skipped = (Integer) statistics.get("SKIPPED");
        Integer notrun = (Integer) statistics.get("NOTRUN");

        // 각 상태별 개수의 합이 전체 개수와 일치해야 함
        Integer sum = pass + fail + blocked + skipped + notrun;
        Assert.assertEquals(totalCases, sum,
                "각 상태별 개수의 합이 전체 개수와 일치해야 합니다. 전체: " + totalCases + ", 합계: " + sum);
    }

    @Test(priority = 6)
    @Story("테스트 실행 진행률 API 종합 검증")
    @Severity(SeverityLevel.CRITICAL)
    @Description("진행 중인 테스트 실행 진행률 API의 모든 시나리오에 대한 종합 JSON Schema 검증")
    public void validateTestExecutionProgressApiComprehensively() throws Exception {
        // 1. 전체 진행 중인 테스트 실행 검증
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/in-progress-test-executions")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response1.getBody().asString(), "schemas/dashboard-test-execution-progress-schema.json");
        attachResponse(response1);

        // 2. 프로젝트별 진행 중인 테스트 실행 검증
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/in-progress-test-executions")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response2.getBody().asString(), "schemas/dashboard-test-execution-progress-schema.json");

        // 3. 응답 데이터 범위 검증
        List<Map<String, Object>> results = response1.jsonPath().getList("$");
        for (Map<String, Object> result : results) {
            Double completionRate = ((Number) result.get("completionRate")).doubleValue();
            Double passRate = ((Number) result.get("passRate")).doubleValue();

            Assert.assertTrue(completionRate >= 0 && completionRate <= 100,
                    "완료율은 0-100 범위여야 합니다.");
            Assert.assertTrue(passRate >= 0 && passRate <= 100,
                    "통과율은 0-100 범위여야 합니다.");

            Assert.assertTrue((Integer) result.get("totalTestCases") >= 0,
                    "총 테스트케이스 수는 0 이상이어야 합니다.");
            Assert.assertTrue((Integer) result.get("completedTestCases") >= 0,
                    "완료된 테스트케이스 수는 0 이상이어야 합니다.");
        }
    }

    @Test(priority = 7)
    @Story("대시보드 API 에지 케이스 종합 검증")
    @Severity(SeverityLevel.NORMAL)
    @Description("대시보드 API의 모든 에지 케이스에 대한 JSON Schema 검증")
    public void validateDashboardApiEdgeCasesComprehensively() throws Exception {
        // 1. 잘못된 프로젝트 ID 형식
        String invalidProjectId = "invalid-project-id";
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + invalidProjectId + "/statistics")
                .then()
                .statusCode(200) // 오류 처리되어 기본값 반환
                .extract().response();

        validateJsonSchema(response1.getBody().asString(), "schemas/project-statistics-schema.json");

        // 2. 극한 limit 값 테스트
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 999999) // 매우 큰 값
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response2.getBody().asString(), "schemas/dashboard-recent-test-results-schema.json");

        // 3. 음수 limit 값 테스트
        Response response3 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", -1)
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .extract().response();

        validateJsonSchema(response3.getBody().asString(), "schemas/dashboard-recent-test-results-schema.json");
    }
}