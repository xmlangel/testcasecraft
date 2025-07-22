// srctestjavacomtestcasetestcasemanagementapi/TestResultReportControllerJsonSchemaTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("API")
@Feature("TestResultReportController")
@ActiveProfiles("test")
public class TestResultReportControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String byProjectSchema;
    private String byProjectAssigneeSchema;
    private String byTestPlanSchema;
    private String byTestPlanAssigneeSchema;

    private static final String TEST_PROJECT_ID = "d77bc65c-3359-497e-a022-ee3044949ed3";
    private static final String TEST_TESTPLAN_ID = "ba0f5d9c-1486-45cd-bcbe-a4425d688700";

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter());

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

        // JSON 스키마 로딩
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testresultreport-by-project-schema.json")) {
            byProjectSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testresultreport-by-project-assignee-schema.json")) {
            byProjectAssigneeSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testresultreport-by-testplan-schema.json")) {
            byTestPlanSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testresultreport-by-project-assignee-schema.json")) {
            byTestPlanAssigneeSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test(priority = 1)
    @Story("프로젝트별 테스트 결과 리포트 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("프로젝트별 테스트 결과 리포트 API가 Json 스키마를 준수하는지 검증")
    public void getTestResultsByProjectTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-results/by-project/{projectId}", TEST_PROJECT_ID)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(byProjectSchema));
    }

    @Test(priority = 2)
    @Story("프로젝트별 담당자별 테스트 결과 리포트 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("프로젝트별 담당자별 테스트 결과 리포트 API가 Json 스키마를 준수하는지 검증")
    public void getTestResultsByProjectAndAssigneeTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-results/by-project/{projectId}/by-assignee", TEST_PROJECT_ID)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(byProjectAssigneeSchema));
    }

    @Test(priority = 3)
    @Story("테스트플랜별 테스트 결과 리포트 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트플랜별 테스트 결과 리포트 API가 Json 스키마를 준수하는지 검증")
    public void getTestResultsByTestPlanTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-results/by-testplan/{testPlanId}", TEST_TESTPLAN_ID)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(byTestPlanSchema));
    }

    @Test(priority = 4)
    @Story("테스트플랜별 담당자별 테스트 결과 리포트 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("테스트플랜별 담당자별 테스트 결과 리포트 API가 Json 스키마를 준수하는지 검증")
    public void getTestResultsByTestPlanAndAssigneeTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-results/by-testplan/{testPlanId}/by-assignee", TEST_TESTPLAN_ID)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(byTestPlanAssigneeSchema));
    }
}
