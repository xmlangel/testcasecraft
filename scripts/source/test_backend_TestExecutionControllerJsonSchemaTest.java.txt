// src/test/java/com/testcase/testcasemanagement/api/TestExecutionControllerJsonSchemaTest.java
package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.testng.annotations.*;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("API 테스트")
@Feature("테스트실행")
@ActiveProfiles("test")
public class TestExecutionControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String testExecutionSchema;
    private String testExecutionListSchema;
    private static String testExecutionId;
    private static String projectId;
    private static String testPlanId;

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";

        RestAssured.filters(
                new RequestLoggingFilter(),
                new ResponseLoggingFilter()
        );

        // JWT 토큰 발급
        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "admin123");

        jwtToken = given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract().path("token");

        // Schema 로딩
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testexecution-schema.json")) {
            testExecutionSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testexecution-list-schema.json")) {
            testExecutionListSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @BeforeMethod
    public void setupProjectAndTestPlan() {
        // 1. 프로젝트 생성
        String uniqueCode = "API-" + System.currentTimeMillis();
        Map<String, Object> projectRequest = new HashMap<>();
        projectRequest.put("name", "테스트 프로젝트");
        projectRequest.put("code", uniqueCode);
        projectRequest.put("description", "API 테스트용 프로젝트");
        projectRequest.put("displayOrder", 1);

        Response projectRes = given()
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(projectRequest)
                .post("/api/projects")
                .then()
                .statusCode(201)
                .extract().response();

        projectId = projectRes.path("id");

        // 2. 테스트 플랜 생성 (테스트케이스 없이도 생성 가능)
        Map<String, Object> testPlanRequest = new HashMap<>();
        testPlanRequest.put("name", "기본 테스트 플랜");
        testPlanRequest.put("projectId", projectId);

        Response testPlanRes = given()
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(testPlanRequest)
                .post("/api/test-plans")
                .then()
                .statusCode(201)
                .extract().response();

        testPlanId = testPlanRes.path("id");
    }

    @AfterClass
    public void cleanUpTestData() {
        // 1. 프로젝트에 연결된 모든 테스트 실행 삭제
        if (projectId != null) {
            // 테스트 실행 전체 삭제
            Response executionsRes = given()
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .get("/api/test-executions/by-project/" + projectId)
                    .then()
                    .statusCode(200)
                    .extract().response();

            List<String> executionIds = executionsRes.jsonPath().getList("id");
            if (executionIds != null) {
                for (String execId : executionIds) {
                    try {
                        given()
                                .header("Authorization", "Bearer " + jwtToken)
                                .when()
                                .delete("/api/test-executions/" + execId);
                    } catch (Exception ignore) {}
                }
            }

            // 테스트 플랜 전체 삭제
            Response plansRes = given()
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .get("/api/test-plans/project/" + projectId)
                    .then()
                    .statusCode(200)
                    .extract().response();

            List<String> planIds = plansRes.jsonPath().getList("id");
            if (planIds != null) {
                for (String planId : planIds) {
                    try {
                        given()
                                .header("Authorization", "Bearer " + jwtToken)
                                .when()
                                .delete("/api/test-plans/" + planId);
                    } catch (Exception ignore) {}
                }
            }

            // 프로젝트 삭제
            try {
                given()
                        .header("Authorization", "Bearer " + jwtToken)
                        .when()
                        .delete("/api/projects/" + projectId);
            } catch (Exception ignore) {}
        }
    }

    @Test(priority = 1)
    @Story("Create Test Execution")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트 실행 생성 및 스키마 검증")
    public void createTestExecutionTest() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "Smoke Test");
        requestBody.put("testPlanId", testPlanId);
        requestBody.put("projectId", projectId);
        requestBody.put("description", "기본 기능 검증 테스트");

        Response response = given()
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(requestBody)
                .when()
                .post("/api/test-executions")
                .then()
                .statusCode(201)
                .body(matchesJsonSchema(testExecutionSchema))
                .body("status", equalTo("NOTSTARTED"))
                .extract().response();

        testExecutionId = response.path("id");
    }


    @Test(priority = 2, dependsOnMethods = "createTestExecutionTest")
    @Story("Update Test Execution")
    @Severity(SeverityLevel.CRITICAL)
    public void updateTestExecutionTest() {
        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("name", "Updated Smoke Test");
        updateBody.put("description", "업데이트된 테스트 실행");

        given()
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(updateBody)
                .when()
                .put("/api/test-executions/" + testExecutionId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionSchema))
                .body("name", equalTo("Updated Smoke Test"));
    }

    @Test(priority = 3, dependsOnMethods = "updateTestExecutionTest")
    @Story("Start Test Execution")
    @Severity(SeverityLevel.CRITICAL)
    public void startTestExecutionTest() {
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .post("/api/test-executions/" + testExecutionId + "/start")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionSchema))
                .body("status", equalTo("INPROGRESS"));
    }

    @Test(priority = 4, dependsOnMethods = "startTestExecutionTest")
    @Story("Complete Test Execution")
    @Severity(SeverityLevel.CRITICAL)
    public void completeTestExecutionTest() {
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .post("/api/test-executions/" + testExecutionId + "/complete")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionSchema))
                .body("status", equalTo("COMPLETED"));
    }

    @Test(priority = 5)
    @Story("Get All Test Executions")
    @Severity(SeverityLevel.NORMAL)
    public void getAllTestExecutionsTest() {
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-executions")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionListSchema));
    }

    @Test(priority = 6)
    @Story("프로젝트별 TestExecution 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("프로젝트 ID로 테스트 실행 목록 조회 및 JSON 스키마 검증")
    public void getTestExecutionsByProjectTest() {
        // When & Then: API 호출 및 검증
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-executions/by-project/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testExecutionListSchema)) // <-- 배열 스키마로 변경
                .body("size()", greaterThanOrEqualTo(1))
                .body("[0].name", notNullValue())
                .body("[0].status", isOneOf("NOTSTARTED", "INPROGRESS", "COMPLETED"));
    }

    private void createTestPlanAndExecution(String projectId) {
        // 테스트 플랜 생성
        Map<String, Object> testPlanRequest = new HashMap<>();
        testPlanRequest.put("name", "Regression Plan");
        testPlanRequest.put("projectId", projectId);

        String testPlanId = given()
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(testPlanRequest)
                .post("/api/test-plans")
                .then()
                .extract()
                .path("id");

        // 테스트 실행 생성
        Map<String, Object> executionRequest = new HashMap<>();
        executionRequest.put("name", "Smoke Test");
        executionRequest.put("testPlanId", testPlanId);

        given()
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(executionRequest)
                .post("/api/test-executions");
    }
}
