// src/test/java/com/testcase/testcasemanagement/api/TestExecutionControllerJsonSchemaTest.java
package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.testng.annotations.*;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("API 테스트")
@Feature("테스트실행")
public class TestExecutionControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String testExecutionSchema;
    private String testExecutionListSchema;
    private static String testExecutionId;
    private static String testPlanId;

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";

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
    @AfterMethod
    public void cleanTestData() {
        // 테스트 데이터 초기화
    }

    @Test(priority = 1)
    @Story("Create Test Execution")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트 실행 생성 및 스키마 검증")
    public void createTestExecutionTest() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "Smoke Test");
        requestBody.put("testPlanId", testPlanId);
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
}
