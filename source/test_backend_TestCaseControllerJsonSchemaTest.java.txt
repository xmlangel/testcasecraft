// src/test/java/com/testcase/testcasemanagement/api/TestCaseControllerJsonSchemaTest.java

package com.testcase.testcasemanagement.api;

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
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.*;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;

@Epic("API 테스트")
@Feature("테스트케이스 관리")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class TestCaseControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String testCaseSchema;
    private String testCaseListSchema;
    private String testCaseTreeSchema;

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter());

        // JWT 인증
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

        // JSON Schema 로드
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testcase-schema.json")) {
            testCaseSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testcase-list-schema.json")) {
            testCaseListSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/testcase-tree-schema.json")) {
            testCaseTreeSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * 독립적으로 동작하는 테스트: 각 테스트마다 프로젝트와 테스트케이스를 직접 생성/삭제
     */
    @Test
    public void getTestCaseByIdTest() {
        // 1. 프로젝트 생성
        String projectId = createTestProject();

        // 2. 테스트케이스 생성
        String testCaseId = createTestCase(projectId);

        // 3. 테스트케이스 단건 조회
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases/" + testCaseId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseSchema));

        // 4. 정리(clean-up)
        deleteTestCase(testCaseId);
        deleteProject(projectId);
    }

    @Test
    public void createTestCaseTest() {
        String projectId = createTestProject();
        String testCaseId = createTestCase(projectId);
        deleteTestCase(testCaseId);
        deleteProject(projectId);
    }

    @Test
    public void getAllTestCasesTest() {
        String projectId = createTestProject();
        String testCaseId = createTestCase(projectId);

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseListSchema));

        deleteTestCase(testCaseId);
        deleteProject(projectId);
    }

    @Test
    public void getTestCaseTreeTest() {
        String projectId = createTestProject();
        String testCaseId = createTestCase(projectId);

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases/tree")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseTreeSchema));

        deleteTestCase(testCaseId);
        deleteProject(projectId);
    }

    @Test
    public void updateTestCaseTest() {
        String projectId = createTestProject();
        String testCaseId = createTestCase(projectId);

        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("name", "업데이트된 로그인 테스트");
        updateBody.put("projectId", projectId);

        given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(updateBody)
                .when()
                .put("/api/testcases/" + testCaseId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseSchema));

        deleteTestCase(testCaseId);
        deleteProject(projectId);
    }

    @Test
    public void deleteTestCaseTest() {
        String projectId = createTestProject();
        String testCaseId = createTestCase(projectId);

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .delete("/api/testcases/" + testCaseId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseSchema));

        deleteProject(projectId);
    }

    @Test
    public void getTestCasesByProjectIdTest() {
        String projectId = createTestProject();
        String testCaseId = createTestCase(projectId);

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases/project/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseTreeSchema));

        deleteTestCase(testCaseId);
        deleteProject(projectId);
    }

    // ------------------ 유틸 메서드 ------------------

    private String createTestProject() {
        String uniqueCode = "TEST-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> projectRequest = new HashMap<>();
        projectRequest.put("name", "테스트 프로젝트");
        projectRequest.put("code", uniqueCode);

        Response response = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(projectRequest)
                .when()
                .post("/api/projects")
                .then()
                .statusCode(201)
                .extract().response();

        return response.path("id");
    }

    private String createTestCase(String projectId) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "로그인 기능 테스트");
        requestBody.put("type", "testcase");
        requestBody.put("projectId", projectId);
        requestBody.put("expectedResults", "로그인 성공 후 대시보드 진입");
        requestBody.put("description", "로그인 성공 시나리오");
        requestBody.put("preCondition", "사전조건");

        Response response = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(requestBody)
                .when()
                .post("/api/testcases")
                .then()
                .statusCode(201)
                .body(matchesJsonSchema(testCaseSchema))
                .extract().response();

        return response.path("id");
    }

    private void deleteTestCase(String testCaseId) {
        try {
            given()
                    .filter(new AllureRestAssured())
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .delete("/api/testcases/" + testCaseId);
        } catch (Exception ignore) {}
    }

    private void deleteProject(String projectId) {
        try {
            given()
                    .filter(new AllureRestAssured())
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .delete("/api/projects/" + projectId);
        } catch (Exception ignore) {}
    }
}
