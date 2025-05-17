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
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

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
    private static String testCaseId;

    @BeforeClass
    @Test
    public void globalSetup() throws IOException {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";

        RestAssured.filters(
                new RequestLoggingFilter(), // 요청 로깅
                new ResponseLoggingFilter() // 응답 로깅
        );

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

    @BeforeMethod
    public void cleanTestData() {
        // 테스트 데이터 초기화
    }

    @Test(priority = 1)
    @Story("테스트케이스 생성")
    @Severity(SeverityLevel.CRITICAL)
    @Description("새로운 테스트케이스를 생성하고 스키마 검증")
    public void createTestCaseTest() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "로그인 기능 테스트");
        requestBody.put("type", "testcase");
        requestBody.put("projectId", "d77bc65c-3359-497e-a022-ee3044949ed3");
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

        testCaseId = response.path("id");
    }

    @Test(priority = 2, dependsOnMethods = "createTestCaseTest")
    @Story("테스트케이스 조회")
    @Severity(SeverityLevel.CRITICAL)
    public void getTestCaseByIdTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases/" + testCaseId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseSchema));
    }

    @Test(priority = 3)
    @Story("전체 테스트케이스 조회")
    @Severity(SeverityLevel.NORMAL)
    public void getAllTestCasesTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseListSchema));
    }

    @Test(priority = 4, dependsOnMethods = "createTestCaseTest")
    @Story("테스트케이스 트리 구조 조회")
    @Severity(SeverityLevel.NORMAL)
    public void getTestCaseTreeTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases/tree")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseTreeSchema));
    }

    @Test(priority = 5, dependsOnMethods = "createTestCaseTest")
    @Story("테스트케이스 수정")
    @Severity(SeverityLevel.CRITICAL)
    public void updateTestCaseTest() {
        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("name", "업데이트된 로그인 테스트");
        updateBody.put("projectId", "d77bc65c-3359-497e-a022-ee3044949ed3");

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
    }

    @Test(priority = 6, dependsOnMethods = "updateTestCaseTest")
    @Story("테스트케이스 삭제")
    @Severity(SeverityLevel.CRITICAL)
    public void deleteTestCaseTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .delete("/api/testcases/" + testCaseId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseSchema));
    }

    @Test(priority = 7)
    @Story("프로젝트별 테스트케이스 조회")
    @Severity(SeverityLevel.NORMAL)
    public void getTestCasesByProjectIdTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/testcases/project/project-123")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseTreeSchema));
    }

    private static final String CSV_FILE_PATH = "test-data/valid_testcases.csv";

    @Test(priority = 1)
    @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
    @Severity(SeverityLevel.CRITICAL)
    @Description("유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증")
    public void importValidCsvFileTest() {
        InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(CSV_FILE_PATH);

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                .param("projectId", "d77bc65c-3359-497e-a022-ee3044949ed3")
                .when()
                .post("/api/testcases/import/csv")
                .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath("schemas/import-csv-schema.json"))
                .body("size()", greaterThan(0))
                .body("[0].name", notNullValue())
                .body("[0].type", either(equalTo("folder")).or(equalTo("testcase")));
    }

    @Test(priority = 2)
    @Story("대용량 CSV 파일 업로드 실패 검증")
    @Severity(SeverityLevel.NORMAL)
    public void importLargeCsvFileTest() {
        InputStream largeFileStream = getClass().getClassLoader().getResourceAsStream("test-data/large_file.csv");

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .multiPart("file", "large.csv", largeFileStream, "text/csv")
                .param("projectId", "d77bc65c-3359-497e-a022-ee3044949ed3")
                .when()
                .post("/api/testcases/import/csv")
                .then()
                .statusCode(400)
                .body("error", equalTo("File size exceeds 10MB limit"));
    }
}
