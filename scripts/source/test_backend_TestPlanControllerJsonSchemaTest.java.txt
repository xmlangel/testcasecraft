// src/test/java/com/testcase/testcasemanagement/api/TestPlanControllerJsonSchemaTest.java
package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import io.qameta.allure.*;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;
import org.springframework.transaction.annotation.Transactional;
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
@TestExecutionListeners({
        DependencyInjectionTestExecutionListener.class,
        TransactionalTestExecutionListener.class
})
@Epic("API 테스트")
@Feature("테스트플랜")
@ActiveProfiles("test")
public class TestPlanControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestPlanRepository testPlanRepository;

    private String jwtToken;
    private String testPlanSchema;
    private String testPlanListSchema;
    private static String testPlanId;
    private static String createdAt;
    private static String updatedAt;

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter());

        // JWT 토큰 발급
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

        // 스키마 파일 로드
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testplan-schema.json")) {
            testPlanSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testplan-list-schema.json")) {
            testPlanListSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @BeforeMethod
    @AfterMethod
    @Transactional
    @Step("테스트 데이터 초기화")
    public void cleanTestData() {
        testPlanRepository.deleteAll();
    }

    @Test(priority = 1)
    @Story("테스트 플랜 생성")
    @Severity(SeverityLevel.CRITICAL)
    @Description("새로운 테스트 플랜을 생성하고 스키마 검증")
    public void createTestPlanTest() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "Regression Test");
        requestBody.put("description", "Full regression test suite");
        requestBody.put("testCaseIds", new String[]{"ba0f5d9c-1486-45cd-bcbe-a4425d688700", "45e3c021-1e46-4e96-b5ca-7507e57ae8fd"});
        requestBody.put("projectId", "d77bc65c-3359-497e-a022-ee3044949ed3");

        Response createRes = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(requestBody)
                .when()
                .post("/api/test-plans")
                .then()
                .statusCode(201)
                .body(matchesJsonSchema(testPlanSchema))
                .body("name", equalTo("Regression Test"))
                .body("createdAt", matchesPattern("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+"))
                .extract().response();

        testPlanId = createRes.path("id");
        createdAt = createRes.path("createdAt");
        updatedAt = createRes.path("updatedAt");
    }

    @Test(priority = 2, dependsOnMethods = "createTestPlanTest")
    @Story("테스트 플랜 조회")
    @Severity(SeverityLevel.CRITICAL)
    @Description("ID로 테스트 플랜 조회 및 스키마 검증")
    public void getTestPlanByIdTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-plans/" + testPlanId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testPlanSchema))
                .body("id", equalTo(testPlanId))
                .body("createdAt", equalTo(createdAt))
                .body("updatedAt", equalTo(updatedAt));
    }

    @Test(priority = 3)
    @Story("전체 테스트 플랜 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("전체 테스트 플랜 목록 조회 및 스키마 검증")
    public void getAllTestPlansTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-plans")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testPlanListSchema))
                .body("size()", greaterThanOrEqualTo(0));
    }

    @Test(priority = 4)
    @Story("테스트 플랜 수정")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트 플랜 정보 업데이트 및 스키마 검증")
    public void updateTestPlanTest() {
        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("name", "Updated Regression Test");
        updateBody.put("description", "Updated test plan description");
        updateBody.put("testCaseIds", new String[]{"f6912b8f-b10a-4c1a-8dd2-67dfeb9eee97", "adc6a5ee-e809-46bd-8c44-83e8ac182172"});

        given()
                .contentType(ContentType.JSON)
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .body(updateBody)
                .when()
                .put("/api/test-plans/" + testPlanId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testPlanSchema))
                .body("name", equalTo("Updated Regression Test"));
    }

    @Test(priority = 5)
    @Story("테스트 플랜 삭제")
    @Severity(SeverityLevel.CRITICAL)
    @Description("테스트 플랜 삭제 및 검증")
    public void deleteTestPlanTest() {
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .delete("/api/test-plans/" + testPlanId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testPlanSchema));

        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-plans/" + testPlanId)
                .then()
                .statusCode(404);
    }

    @Test(priority = 6)
    @Story("프로젝트별 테스트 플랜 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("프로젝트 ID로 테스트 플랜 조회 및 스키마 검증")
    public void getTestPlansByProjectTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-plans/project/d77bc65c-3359-497e-a022-ee3044949ed3")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testPlanListSchema));
    }
}
