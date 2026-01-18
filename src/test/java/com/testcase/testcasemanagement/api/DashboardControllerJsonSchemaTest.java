// src/test/java/com/testcase/testcasemanagement/api/DashboardControllerJsonSchemaTest.java

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
import org.testng.annotations.*;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@TestExecutionListeners({
        DependencyInjectionTestExecutionListener.class,
        TransactionalTestExecutionListener.class
})
@Epic("API 테스트")
@Feature("대시보드 관리")
@ActiveProfiles("test")
public class DashboardControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String recentTestResultsSchema;
    private String openTestRunAssigneeResultsSchema;
    private String testResultsTrendSchema;
    private String testCaseStatisticsSchema;
    private String testExecutionProgressSchema;
    private String projectStatisticsSchema;
    private static String testProjectId;
    
    // 생성된 리소스 ID 리스트
    private final List<String> createdProjectIds = new ArrayList<>();

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.filters(
                new RequestLoggingFilter(),
                new ResponseLoggingFilter()
        );
        
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

        // 스키마 파일 사전 로드
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-recent-test-results-schema.json")) {
            recentTestResultsSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-open-test-run-assignee-results-schema.json")) {
            openTestRunAssigneeResultsSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-test-results-trend-schema.json")) {
            testResultsTrendSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-test-case-statistics-schema.json")) {
            testCaseStatisticsSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-test-execution-progress-schema.json")) {
            testExecutionProgressSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/project-statistics-schema.json")) {
            projectStatisticsSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        // 테스트용 프로젝트 생성
        Map<String, Object> projectRequest = new HashMap<>();
        projectRequest.put("name", "대시보드 테스트용 프로젝트");
        projectRequest.put("code", "DASH-" + System.currentTimeMillis());
        projectRequest.put("description", "대시보드 API 테스트용");
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
            } catch (Exception ignore) {}
        }
        createdProjectIds.clear();
    }

    @Attachment(value = "응답 본문", type = "application/json")
    private String attachResponse(Response response) {
        return response.asPrettyString();
    }

    @Test(priority = 1)
    @Story("전체 최근 테스트 결과 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("전체 최근 테스트케이스 결과 조회 API 테스트")
    public void getRecentTestResultsTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 2)
    @Story("전체 최근 테스트 결과 조회 - limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("limit 파라미터를 사용한 최근 테스트 결과 조회 API 테스트")
    public void getRecentTestResultsWithLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 5)
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .body("size()", lessThanOrEqualTo(5))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 3)
    @Story("전체 최근 테스트 결과 조회 - 최대 limit 제한")
    @Severity(SeverityLevel.NORMAL)
    @Description("최대 limit(100) 제한 테스트")
    public void getRecentTestResultsWithMaxLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 150) // 100보다 큰 값 요청
                .when()
                .get("/api/dashboard/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 4)
    @Story("프로젝트별 최근 테스트 결과 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("특정 프로젝트의 최근 테스트케이스 결과 조회 API 테스트")
    public void getRecentTestResultsByProjectTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .extract().response();

        // 반환된 결과의 프로젝트 ID 검증 (결과가 있는 경우)
        List<Map<String, Object>> results = response.jsonPath().getList("$");
        for (Map<String, Object> result : results) {
            if (result.get("projectId") != null) {
                // 모든 결과가 요청한 프로젝트의 것이어야 함
                assert result.get("projectId").equals(testProjectId);
            }
        }

        attachResponse(response);
    }

    @Test(priority = 5)
    @Story("프로젝트별 최근 테스트 결과 조회 - limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("특정 프로젝트의 limit 파라미터를 사용한 최근 테스트 결과 조회 API 테스트")
    public void getRecentTestResultsByProjectWithLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 3)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .body("size()", lessThanOrEqualTo(3))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 6)
    @Story("프로젝트별 최근 테스트 결과 조회 - 잘못된 limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("잘못된 limit 파라미터 처리 테스트")
    public void getRecentTestResultsByProjectWithInvalidLimitTest() {
        // 음수 limit - 기본값 10으로 처리되어야 함
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", -1)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .extract().response();

        attachResponse(response1);

        // 0 limit - 기본값 10으로 처리되어야 함
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 0)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .extract().response();

        attachResponse(response2);
    }

    @Test(priority = 7)
    @Story("존재하지 않는 프로젝트의 최근 테스트 결과 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("존재하지 않는 프로젝트 ID로 조회 시 빈 결과 반환 테스트")
    public void getRecentTestResultsByNonExistentProjectTest() {
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/recent-test-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(recentTestResultsSchema))
                .body("size()", equalTo(0)) // 빈 배열이어야 함
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 8)
    @Story("전체 오픈 테스트런 담당자별 결과 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("전체 오픈 테스트런 담당자별 테스트케이스 결과 조회 API 테스트")
    public void getOpenTestRunAssigneeResultsTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .extract().response();

        // 추가 검증: 배열 형태 확인
        List<Map<String, Object>> results = response.jsonPath().getList("$");
        
        // 결과가 있는 경우 필수 필드 검증
        for (Map<String, Object> result : results) {
            assert result.containsKey("assigneeName");
            assert result.containsKey("assigneeUsername");
            assert result.containsKey("testExecutionId");
            assert result.containsKey("testExecutionName");
            assert result.containsKey("totalTestCases");
            assert result.containsKey("completedTestCases");
            assert result.containsKey("completionRate");
            assert result.containsKey("passRate");

            // 범위 검증
            Double completionRate = (Double) result.get("completionRate");
            Double passRate = (Double) result.get("passRate");
            assert completionRate >= 0 && completionRate <= 100;
            assert passRate >= 0 && passRate <= 100;
        }

        attachResponse(response);
    }

    @Test(priority = 9)
    @Story("전체 오픈 테스트런 담당자별 결과 조회 - limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("limit 파라미터를 사용한 오픈 테스트런 담당자별 결과 조회 API 테스트")
    public void getOpenTestRunAssigneeResultsWithLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 5)
                .when()
                .get("/api/dashboard/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .body("size()", lessThanOrEqualTo(5))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 10)
    @Story("전체 오픈 테스트런 담당자별 결과 조회 - 최대 limit 제한")
    @Severity(SeverityLevel.NORMAL)
    @Description("최대 limit(100) 제한 테스트")
    public void getOpenTestRunAssigneeResultsWithMaxLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 150) // 100보다 큰 값 요청
                .when()
                .get("/api/dashboard/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 11)
    @Story("프로젝트별 오픈 테스트런 담당자별 결과 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("특정 프로젝트의 오픈 테스트런 담당자별 테스트케이스 결과 조회 API 테스트")
    public void getOpenTestRunAssigneeResultsByProjectTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 12)
    @Story("프로젝트별 오픈 테스트런 담당자별 결과 조회 - limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("특정 프로젝트의 limit 파라미터를 사용한 오픈 테스트런 담당자별 결과 조회 API 테스트")
    public void getOpenTestRunAssigneeResultsByProjectWithLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 3)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .body("size()", lessThanOrEqualTo(3))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 13)
    @Story("프로젝트별 오픈 테스트런 담당자별 결과 조회 - 잘못된 limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("잘못된 limit 파라미터 처리 테스트")
    public void getOpenTestRunAssigneeResultsByProjectWithInvalidLimitTest() {
        // 음수 limit - 기본값 20으로 처리되어야 함
        Response response1 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", -1)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .extract().response();

        attachResponse(response1);

        // 0 limit - 기본값 20으로 처리되어야 함
        Response response2 = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 0)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .extract().response();

        attachResponse(response2);
    }

    @Test(priority = 14)
    @Story("존재하지 않는 프로젝트의 오픈 테스트런 담당자별 결과 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("존재하지 않는 프로젝트 ID로 조회 시 빈 결과 반환 테스트")
    public void getOpenTestRunAssigneeResultsByNonExistentProjectTest() {
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/open-test-runs/assignee-results")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(openTestRunAssigneeResultsSchema))
                .body("size()", equalTo(0)) // 빈 배열이어야 함
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 15)
    @Story("프로젝트별 테스트케이스 결과 추이 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("특정 프로젝트의 테스트케이스 결과 추이 조회 API 테스트")
    public void getTestResultsTrendTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testResultsTrendSchema))
                .extract().response();

        // 응답 데이터 검증
        List<Map<String, Object>> results = response.jsonPath().getList("$");
        
        // 결과가 있는 경우 필수 필드 검증
        for (Map<String, Object> result : results) {
            assert result.containsKey("date");
            assert result.containsKey("PASS");
            assert result.containsKey("FAIL");
            assert result.containsKey("BLOCKED");
            assert result.containsKey("SKIPPED");
            assert result.containsKey("NOTRUN");
            assert result.containsKey("completeRate");
            assert result.containsKey("notRun");

            // 값 타입 및 범위 검증
            Integer completeRate = (Integer) result.get("completeRate");
            assert completeRate >= 0 && completeRate <= 100;
            
            // 개수 필드는 음수가 아니어야 함
            assert (Integer) result.get("PASS") >= 0;
            assert (Integer) result.get("FAIL") >= 0;
            assert (Integer) result.get("BLOCKED") >= 0;
            assert (Integer) result.get("SKIPPED") >= 0;
            assert (Integer) result.get("NOTRUN") >= 0;
            assert (Integer) result.get("notRun") >= 0;
            
            // 날짜 형식 검증
            String dateStr = (String) result.get("date");
            assert dateStr.matches("^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/[0-9]{4}$");
        }

        attachResponse(response);
    }

    @Test(priority = 16)
    @Story("프로젝트별 테스트케이스 결과 추이 조회 - 날짜 범위 지정")
    @Severity(SeverityLevel.NORMAL)
    @Description("startDate와 endDate 파라미터를 사용한 테스트 결과 추이 조회 API 테스트")
    public void getTestResultsTrendWithDateRangeTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("startDate", "2025-01-01")
                .queryParam("endDate", "2025-12-31")
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testResultsTrendSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 17)
    @Story("프로젝트별 테스트케이스 결과 추이 조회 - 잘못된 날짜 범위")
    @Severity(SeverityLevel.NORMAL)
    @Description("시작 날짜가 종료 날짜보다 뒤인 경우 자동 교정 테스트")
    public void getTestResultsTrendWithInvalidDateRangeTest() {
        // 시작 날짜가 종료 날짜보다 뒤인 경우
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("startDate", "2025-12-31")
                .queryParam("endDate", "2025-01-01")
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testResultsTrendSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 18)
    @Story("존재하지 않는 프로젝트의 테스트케이스 결과 추이 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("존재하지 않는 프로젝트 ID로 조회 시 빈 결과 반환 테스트")
    public void getTestResultsTrendByNonExistentProjectTest() {
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testResultsTrendSchema))
                .body("size()", equalTo(0)) // 빈 배열이어야 함
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 19)
    @Story("프로젝트별 테스트케이스 상태별 통계 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("특정 프로젝트의 테스트케이스 상태별 통계 조회 API 테스트")
    public void getTestCaseStatisticsTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-case-statistics")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseStatisticsSchema))
                .extract().response();

        // 응답 데이터 검증
        Map<String, Object> result = response.jsonPath().getMap("$");
        
        // 필수 필드 검증
        assert result.containsKey("totalCases");
        assert result.containsKey("PASS");
        assert result.containsKey("FAIL");
        assert result.containsKey("BLOCKED");
        assert result.containsKey("SKIPPED");
        assert result.containsKey("NOTRUN");

        // 값 타입 및 범위 검증
        Integer totalCases = (Integer) result.get("totalCases");
        Integer pass = (Integer) result.get("PASS");
        Integer fail = (Integer) result.get("FAIL");
        Integer blocked = (Integer) result.get("BLOCKED");
        Integer skipped = (Integer) result.get("SKIPPED");
        Integer notrun = (Integer) result.get("NOTRUN");

        // 모든 값은 음수가 아니어야 함
        assert totalCases >= 0;
        assert pass >= 0;
        assert fail >= 0;
        assert blocked >= 0;
        assert skipped >= 0;
        assert notrun >= 0;
        
        // 각 상태별 개수의 합이 전체 개수와 일치해야 함
        assert totalCases.equals(pass + fail + blocked + skipped + notrun);

        attachResponse(response);
    }

    @Test(priority = 20)
    @Story("존재하지 않는 프로젝트의 테스트케이스 상태별 통계 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("존재하지 않는 프로젝트 ID로 조회 시 0 값들로 구성된 통계 반환 테스트")
    public void getTestCaseStatisticsByNonExistentProjectTest() {
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/test-case-statistics")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseStatisticsSchema))
                .extract().response();

        // 존재하지 않는 프로젝트의 경우 모든 값이 0이어야 함
        Map<String, Object> result = response.jsonPath().getMap("$");
        assert result.get("totalCases").equals(0);
        assert result.get("PASS").equals(0);
        assert result.get("FAIL").equals(0);
        assert result.get("BLOCKED").equals(0);
        assert result.get("SKIPPED").equals(0);
        assert result.get("NOTRUN").equals(0);

        attachResponse(response);
    }

    @Test(priority = 21)
    @Story("전체 진행 중인 테스트 실행 진행률 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("전체 진행 중인 테스트 실행 진행률 조회 API 테스트")
    public void getInProgressTestExecutionsTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/in-progress-test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionProgressSchema))
                .extract().response();

        // 응답 데이터 검증
        List<Map<String, Object>> results = response.jsonPath().getList("$");
        
        // 결과가 있는 경우 필수 필드 검증
        for (Map<String, Object> result : results) {
            assert result.containsKey("testExecutionId");
            assert result.containsKey("testExecutionName");
            assert result.containsKey("projectId");
            assert result.containsKey("projectName");
            assert result.containsKey("status");
            assert result.containsKey("totalTestCases");
            assert result.containsKey("completedTestCases");
            assert result.containsKey("completionRate");
            assert result.containsKey("passRate");

            // 값 타입 및 범위 검증
            Double completionRate = ((Number) result.get("completionRate")).doubleValue();
            Double passRate = ((Number) result.get("passRate")).doubleValue();
            assert completionRate >= 0 && completionRate <= 100;
            assert passRate >= 0 && passRate <= 100;
            
            // 개수 필드는 음수가 아니어야 함
            assert ((Integer) result.get("totalTestCases")) >= 0;
            assert ((Integer) result.get("completedTestCases")) >= 0;
            assert ((Integer) result.get("passedTestCases")) >= 0;
            assert ((Integer) result.get("failedTestCases")) >= 0;
            assert ((Integer) result.get("blockedTestCases")) >= 0;
            assert ((Integer) result.get("skippedTestCases")) >= 0;
            assert ((Integer) result.get("notRunTestCases")) >= 0;
        }

        attachResponse(response);
    }

    @Test(priority = 22)
    @Story("전체 진행 중인 테스트 실행 진행률 조회 - limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("limit 파라미터를 사용한 진행 중인 테스트 실행 진행률 조회 API 테스트")
    public void getInProgressTestExecutionsWithLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 5)
                .when()
                .get("/api/dashboard/in-progress-test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionProgressSchema))
                .body("size()", lessThanOrEqualTo(5))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 23)
    @Story("전체 진행 중인 테스트 실행 진행률 조회 - 최대 limit 제한")
    @Severity(SeverityLevel.NORMAL)
    @Description("최대 limit(50) 제한 테스트")
    public void getInProgressTestExecutionsWithMaxLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 100) // 50보다 큰 값 요청
                .when()
                .get("/api/dashboard/in-progress-test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionProgressSchema))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 24)
    @Story("프로젝트별 진행 중인 테스트 실행 진행률 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("특정 프로젝트의 진행 중인 테스트 실행 진행률 조회 API 테스트")
    public void getInProgressTestExecutionsByProjectTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/in-progress-test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionProgressSchema))
                .extract().response();

        // 반환된 결과의 프로젝트 ID 검증 (결과가 있는 경우)
        List<Map<String, Object>> results = response.jsonPath().getList("$");
        for (Map<String, Object> result : results) {
            if (result.get("projectId") != null) {
                // 모든 결과가 요청한 프로젝트의 것이어야 함
                assert result.get("projectId").equals(testProjectId);
            }
        }

        attachResponse(response);
    }

    @Test(priority = 25)
    @Story("프로젝트별 진행 중인 테스트 실행 진행률 조회 - limit 파라미터")
    @Severity(SeverityLevel.NORMAL)
    @Description("특정 프로젝트의 limit 파라미터를 사용한 진행 중인 테스트 실행 진행률 조회 API 테스트")
    public void getInProgressTestExecutionsByProjectWithLimitTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("limit", 3)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/in-progress-test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionProgressSchema))
                .body("size()", lessThanOrEqualTo(3))
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 26)
    @Story("존재하지 않는 프로젝트의 진행 중인 테스트 실행 진행률 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("존재하지 않는 프로젝트 ID로 조회 시 빈 결과 반환 테스트")
    public void getInProgressTestExecutionsByNonExistentProjectTest() {
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/in-progress-test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionProgressSchema))
                .body("size()", equalTo(0)) // 빈 배열이어야 함
                .extract().response();

        attachResponse(response);
    }

    @Test(priority = 27)
    @Story("ICT-129: 프로젝트 전체 통계 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("프로젝트 전체 통계 대시보드 API 테스트")
    public void getProjectStatisticsTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/statistics")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(projectStatisticsSchema))
                .extract().response();

        // 응답 데이터 검증
        Map<String, Object> result = response.jsonPath().getMap("$");
        
        // 필수 필드 검증
        assert result.containsKey("projectId");
        assert result.containsKey("projectName");
        assert result.containsKey("totalTestCases");
        assert result.containsKey("totalTestPlans");
        assert result.containsKey("totalTestExecutions");
        assert result.containsKey("executedTestCases");
        assert result.containsKey("executionRate");
        assert result.containsKey("passedTestCases");
        assert result.containsKey("passRate");
        assert result.containsKey("failedTestCases");
        assert result.containsKey("blockedTestCases");
        assert result.containsKey("skippedTestCases");
        assert result.containsKey("notRunTestCases");
        assert result.containsKey("testCoverage");
        assert result.containsKey("activePriorityHighCases");
        assert result.containsKey("activePriorityMediumCases");
        assert result.containsKey("activePriorityLowCases");
        assert result.containsKey("yesterdayExecutions");
        assert result.containsKey("lastWeekExecutions");
        assert result.containsKey("dailyChangeRate");
        assert result.containsKey("weeklyChangeRate");
        assert result.containsKey("averagePassRateLast7Days");
        assert result.containsKey("averagePassRateLast30Days");
        assert result.containsKey("criticalFailuresLast7Days");
        assert result.containsKey("activeTestExecutions");
        assert result.containsKey("completedTestExecutions");
        assert result.containsKey("pausedTestExecutions");
        assert result.containsKey("calculatedAt");
        assert result.containsKey("dataFreshnessMinutes");

        // 프로젝트 ID 검증
        assert result.get("projectId").equals(testProjectId);

        // 값 타입 및 범위 검증
        Integer totalTestCases = (Integer) result.get("totalTestCases");
        Integer executedTestCases = (Integer) result.get("executedTestCases");
        Double executionRate = ((Number) result.get("executionRate")).doubleValue();
        Double passRate = ((Number) result.get("passRate")).doubleValue();
        Double testCoverage = ((Number) result.get("testCoverage")).doubleValue();
        
        // 개수 필드는 음수가 아니어야 함
        assert totalTestCases >= 0;
        assert executedTestCases >= 0;
        assert (Integer) result.get("totalTestPlans") >= 0;
        assert (Integer) result.get("totalTestExecutions") >= 0;
        assert (Integer) result.get("passedTestCases") >= 0;
        assert (Integer) result.get("failedTestCases") >= 0;
        assert (Integer) result.get("blockedTestCases") >= 0;
        assert (Integer) result.get("skippedTestCases") >= 0;
        assert (Integer) result.get("notRunTestCases") >= 0;
        
        // 비율 필드는 0~100 범위여야 함
        assert executionRate >= 0 && executionRate <= 100;
        assert passRate >= 0 && passRate <= 100;
        assert testCoverage >= 0 && testCoverage <= 100;
        assert ((Number) result.get("averagePassRateLast7Days")).doubleValue() >= 0 
               && ((Number) result.get("averagePassRateLast7Days")).doubleValue() <= 100;
        assert ((Number) result.get("averagePassRateLast30Days")).doubleValue() >= 0 
               && ((Number) result.get("averagePassRateLast30Days")).doubleValue() <= 100;
        
        // 우선순위별 케이스 개수는 음수가 아니어야 함
        assert (Integer) result.get("activePriorityHighCases") >= 0;
        assert (Integer) result.get("activePriorityMediumCases") >= 0;
        assert (Integer) result.get("activePriorityLowCases") >= 0;
        
        // 실행 관련 개수는 음수가 아니어야 함
        assert (Integer) result.get("yesterdayExecutions") >= 0;
        assert (Integer) result.get("lastWeekExecutions") >= 0;
        assert (Integer) result.get("criticalFailuresLast7Days") >= 0;
        assert (Integer) result.get("activeTestExecutions") >= 0;
        assert (Integer) result.get("completedTestExecutions") >= 0;
        assert (Integer) result.get("pausedTestExecutions") >= 0;
        
        // 데이터 신선도는 음수가 아니어야 함
        assert (Integer) result.get("dataFreshnessMinutes") >= 0;
        
        // calculatedAt 필드는 null이 아니어야 함
        assert result.get("calculatedAt") != null;

        attachResponse(response);
    }

    @Test(priority = 28)
    @Story("ICT-129: 존재하지 않는 프로젝트의 전체 통계 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("존재하지 않는 프로젝트 ID로 조회 시 기본값 통계 반환 테스트")
    public void getProjectStatisticsByNonExistentProjectTest() {
        String nonExistentProjectId = "00000000-0000-0000-0000-000000000000";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + nonExistentProjectId + "/statistics")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(projectStatisticsSchema))
                .extract().response();

        // 존재하지 않는 프로젝트의 경우 기본값(대부분 0)이 반환되어야 함
        Map<String, Object> result = response.jsonPath().getMap("$");
        assert result.get("projectId").equals(nonExistentProjectId);
        assert result.get("totalTestCases").equals(0);
        assert result.get("totalTestPlans").equals(0);
        assert result.get("totalTestExecutions").equals(0);
        assert result.get("executedTestCases").equals(0);
        assert ((Number) result.get("executionRate")).doubleValue() == 0.0;
        assert result.get("passedTestCases").equals(0);
        assert ((Number) result.get("passRate")).doubleValue() == 0.0;

        attachResponse(response);
    }

    @Test(priority = 29)
    @Story("ICT-129: 프로젝트 전체 통계 조회 - 오류 처리")
    @Severity(SeverityLevel.NORMAL)
    @Description("잘못된 프로젝트 ID 형식으로 요청 시 처리 테스트")
    public void getProjectStatisticsWithInvalidProjectIdTest() {
        String invalidProjectId = "invalid-project-id";
        
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + invalidProjectId + "/statistics")
                .then()
                .statusCode(200) // 오류 처리되어 200 상태로 기본값 반환
                .body(matchesJsonSchema(projectStatisticsSchema))
                .extract().response();

        // 오류 발생 시 기본값으로 반환되는지 확인
        Map<String, Object> result = response.jsonPath().getMap("$");
        assert result.get("projectId").equals(invalidProjectId);
        assert result.get("totalTestCases").equals(0);

        attachResponse(response);
    }

    @Test(priority = 30)
    @Story("ICT-137: 권한 검증 테스트 - 유효하지 않은 토큰으로 프로젝트 통계 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("잘못된 JWT 토큰으로 API 호출 시 403 Forbidden 응답 테스트")
    public void getProjectStatisticsWithInvalidTokenTest() {
        String invalidToken = "invalid.jwt.token";
        
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + invalidToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/statistics")
                .then()
                .statusCode(403); // Forbidden
    }

    @Test(priority = 31)
    @Story("ICT-137: 권한 검증 테스트 - 인증 헤더 없이 프로젝트 통계 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Authorization 헤더 없이 API 호출 시 401 Unauthorized 응답 테스트")
    public void getProjectStatisticsWithoutAuthHeaderTest() {
        given()
                .filter(new AllureRestAssured())
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/statistics")
                .then()
                .statusCode(401); // Unauthorized
    }

    @Test(priority = 32)
    @Story("ICT-137: 권한 검증 테스트 - 테스트 결과 요약 API")
    @Severity(SeverityLevel.CRITICAL)
    @Description("권한이 수정된 테스트 결과 요약 API의 정상 작동 검증")
    public void getProjectTestResultsSummaryWithAuthTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-summary")
                .then()
                .statusCode(200)
                .extract().response();

        // 응답 데이터 검증
        Map<String, Object> result = response.jsonPath().getMap("$");
        
        // 필수 필드 검증
        assert result.containsKey("projectId");
        assert result.containsKey("totalCases");
        assert result.containsKey("lastResult");
        assert result.containsKey("completeRate");
        assert result.containsKey("lastUpdated");
        
        // 프로젝트 ID 검증
        assert result.get("projectId").equals(testProjectId);
        
        // lastResult 객체 검증
        Map<String, Object> lastResult = (Map<String, Object>) result.get("lastResult");
        assert lastResult.containsKey("PASS");
        assert lastResult.containsKey("FAIL");
        assert lastResult.containsKey("BLOCKED");
        assert lastResult.containsKey("SKIPPED");
        assert lastResult.containsKey("NOTRUN");

        attachResponse(response);
    }

    @Test(priority = 33)
    @Story("ICT-137: 권한 검증 테스트 - 테스트 결과 요약 API 무권한 접근")
    @Severity(SeverityLevel.CRITICAL)
    @Description("권한 없이 테스트 결과 요약 API 호출 시 401 Unauthorized 응답 테스트")
    public void getProjectTestResultsSummaryWithoutAuthTest() {
        given()
                .filter(new AllureRestAssured())
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-summary")
                .then()
                .statusCode(401); // Unauthorized (no auth header)
    }

    @Test(priority = 34)
    @Story("ICT-137: 권한 검증 테스트 - 대시보드 종합 정보 API")
    @Severity(SeverityLevel.CRITICAL)
    @Description("권한이 수정된 대시보드 종합 정보 API의 정상 작동 검증")
    public void getProjectDashboardOverviewWithAuthTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/overview")
                .then()
                .statusCode(200)
                .extract().response();

        // 응답 데이터 검증
        Map<String, Object> result = response.jsonPath().getMap("$");
        
        // 필수 섹션 검증
        assert result.containsKey("projectId");
        assert result.containsKey("basicStatistics");
        assert result.containsKey("activeExecutions");
        assert result.containsKey("activePriorityCases");
        assert result.containsKey("trends");
        
        // 프로젝트 ID 검증
        assert result.get("projectId").equals(testProjectId);
        
        // basicStatistics 섹션 검증
        Map<String, Object> basicStats = (Map<String, Object>) result.get("basicStatistics");
        assert basicStats.containsKey("totalTestCases");
        assert basicStats.containsKey("totalTestPlans");
        assert basicStats.containsKey("executionRate");
        assert basicStats.containsKey("passRate");
        assert basicStats.containsKey("testCoverage");
        
        // activeExecutions 섹션 검증
        Map<String, Object> activeExecs = (Map<String, Object>) result.get("activeExecutions");
        assert activeExecs.containsKey("activeTestExecutions");
        assert activeExecs.containsKey("completedTestExecutions");
        assert activeExecs.containsKey("pausedTestExecutions");

        attachResponse(response);
    }

    @Test(priority = 35)
    @Story("ICT-137: 권한 검증 테스트 - 대시보드 종합 정보 API 무권한 접근")
    @Severity(SeverityLevel.CRITICAL)
    @Description("권한 없이 대시보드 종합 정보 API 호출 시 401 Unauthorized 응답 테스트")
    public void getProjectDashboardOverviewWithoutAuthTest() {
        given()
                .filter(new AllureRestAssured())
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/overview")
                .then()
                .statusCode(401); // Unauthorized (no auth header)
    }

    @Test(priority = 36)
    @Story("ICT-137: 권한 검증 테스트 - 테스트 결과 추이 API")
    @Severity(SeverityLevel.CRITICAL)
    @Description("권한이 수정된 테스트 결과 추이 API의 정상 작동 검증")
    public void getTestResultsTrendWithAuthTest() {
        Response response = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .queryParam("days", 7)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(200)
                .extract().response();

        // 응답 데이터 검증
        Map<String, Object> result = response.jsonPath().getMap("$");
        
        // 필수 필드 검증
        assert result.containsKey("projectId");
        assert result.containsKey("testResultsHistory");
        assert result.containsKey("dataCount");
        assert result.containsKey("startDate");
        assert result.containsKey("endDate");
        assert result.containsKey("period");
        
        // 프로젝트 ID 검증
        assert result.get("projectId").equals(testProjectId);
        
        // period 검증
        assert result.get("period").equals("7일");

        attachResponse(response);
    }

    @Test(priority = 37)
    @Story("ICT-137: 권한 검증 테스트 - 테스트 결과 추이 API 무권한 접근")
    @Severity(SeverityLevel.CRITICAL)
    @Description("권한 없이 테스트 결과 추이 API 호출 시 401 Unauthorized 응답 테스트")
    public void getTestResultsTrendWithoutAuthTest() {
        given()
                .filter(new AllureRestAssured())
                .queryParam("days", 7)
                .when()
                .get("/api/dashboard/projects/" + testProjectId + "/test-results-trend")
                .then()
                .statusCode(401); // Unauthorized (no auth header)
    }
}