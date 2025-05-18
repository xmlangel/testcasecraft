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

import java.io.File;
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
    private static final String CSV_FILE_PATH2 = "test-data/ahm-notifications.csv";

    @Test(priority = 1)
    @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
    @Severity(SeverityLevel.CRITICAL)
    @Description("유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증")
    public void importValidCsvFileTest() {
        InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(CSV_FILE_PATH);

        // 수정사항 1: 필드 매핑 정보 명시적 추가
        String mappingJson = "{ \"fieldMappings\": {"
                + "\"name\":\"name\","
                + "\"type\":\"type\","
                + "\"description\":\"description\","
                + "\"preCondition\":\"preCondition\","
                + "\"step1\":\"steps[0].description\","
                + "\"step2\":\"steps[1].description\","
                + "\"step3\":\"steps[2].description\","
                + "\"expectedResult\":\"expectedResult\""
                + "}}";

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                .param("projectId", "d77bc65c-3359-497e-a022-ee3044949ed3")
                .param("mapping", mappingJson)  // 수정사항 2: 유효한 매핑 정보 전달
                .when()
                .post("/api/testcases/import/csv")
                .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath("schemas/import-csv-schema.json"))
                .body("size()", equalTo(3))
                .body("[0].projectId", equalTo("d77bc65c-3359-497e-a022-ee3044949ed3"))
                .body("[0].name", equalTo("01로그인 성공"))
                .body("[0].steps.size()", equalTo(3))
                .body("[0].steps[0].stepNumber", equalTo(1))
                .body("[0].steps[0].description", equalTo("로그인 페이지 접속"))
                .body("[2].type", equalTo("folder"))
                .body("[2].children", empty());
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

    @Test(priority = 1)
    @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
    @Severity(SeverityLevel.CRITICAL)
    @Description("유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증")
    public void importValidCsvFileTest2() {
        InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(CSV_FILE_PATH2);

        // 수정사항 1: 필드 매핑 정보 명시적 추가
        String mappingJson = "{\n" +
                "  \"fieldMappings\": {\n" +
                "    \"name\": \"name\",\n" +
                "    \"type\": \"type\",\n" +
                "    \"description\": \"description\",\n" +
                "    \"preCondition\": \"preCondition\",\n" +
                "    \"step1\": \"steps[0].description\",\n" +
                "    \"expectedResults\": \"expectedResults\"\n" +
                "  }\n" +
                "}";

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                .param("projectId", "99e18925-5976-4965-a442-dc7be5d6b877")
                .param("mapping", mappingJson)  // 수정사항 2: 유효한 매핑 정보 전달
                .when()
                .post("/api/testcases/import/csv")
                .then()
                .statusCode(200)
                .body(matchesJsonSchemaInClasspath("schemas/import-csv-schema.json"));
    }


    private static final String PROJECT_ID = "dc479890-beda-4c0a-af42-3541a83a1e52";
    private static final String TEST_EXCEL_PATH = "src/test/resources/test-data/excel.xlsx";

    @Test
    @Story("Excel 파일 업로드")
    @Severity(SeverityLevel.CRITICAL)
    @Description("정상적인 Excel 파일 업로드 및 데이터 파싱 검증")
    public void testExcelImportSuccess() {
        File testFile = new File(TEST_EXCEL_PATH);

        given()
                .header("Authorization", "Bearer " + jwtToken)
                .multiPart("file", testFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .formParam("projectId", PROJECT_ID)
                .formParam("mapping", getMappingConfig())
                .when()
                .post("/api/testcases/import/excel")
                .then()
                .statusCode(200)
                .body("size()", greaterThan(0));
    }

    // 매핑 설정 JSON
    private String getMappingConfig() {
        return """
        {
            "fieldMappings": {
                "Name": "name",
                "Type": "type",
                "Description": "description",
                "Pre-Condition": "preCondition",
                "Test Steps": "steps",
                "Expected Result": "expectedResults",
                "Parent Folder": "parentId",
                "Order": "displayOrder"
            },
            "converters": [
                {
                    "csvColumn": "Order",
                    "targetField": "displayOrder",
                    "targetType": "java.lang.Integer"
                }
            ]
        }
        """;
    }

}
