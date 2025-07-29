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
        loginRequest.put("password", "admin123");

        jwtToken = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract().path("token");

        // 스키마 파일 사전 로드
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-recent-test-results-schema.json")) {
            recentTestResultsSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/dashboard-open-test-run-assignee-results-schema.json")) {
            openTestRunAssigneeResultsSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
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
}