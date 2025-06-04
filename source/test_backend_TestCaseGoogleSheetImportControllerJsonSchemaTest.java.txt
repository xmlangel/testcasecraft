// src/test/java/com/testcase/testcasemanagement/api/TestCaseGoogleSheetImportControllerJsonSchemaTest.java

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
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.*;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchema;
import static org.hamcrest.Matchers.*;

/**
 * GoogleSheet Import API의 Json 스키마 및 오류 응답 구조를 검증하는 테스트
 * - SOLID 원칙 및 Clean Architecture 적용:
 *   - SRP: 테스트는 API 응답 구조 검증에만 집중
 *   - OCP/DIP: 테스트 데이터/스키마/환경 분리, 확장성 고려
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("API")
@Feature("TestCase GoogleSheet Import Controller")
@ActiveProfiles("test")
public class TestCaseGoogleSheetImportControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String testCaseSchema;
    private String testCaseListSchema;
    private String errorResponseSchema;

    // 프로젝트 생성/삭제 관리를 위한 리스트 (SRP)
    private final List<String> createdProjectIds = new ArrayList<>();

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

        // JSON 스키마 로딩
        testCaseSchema = loadSchema("schemas/testcase-schema.json");
        testCaseListSchema = loadSchema("schemas/testcase-list-schema.json");
        errorResponseSchema = loadSchema("schemas/error-response-schema.json");
    }

    @AfterMethod
    public void cleanUpProjects() {
        for (String projectId : createdProjectIds) {
            try {
                given()
                        .filter(new AllureRestAssured())
                        .header("Authorization", "Bearer " + jwtToken)
                        .when()
                        .delete("/api/projects/" + projectId);
            } catch (Exception ignore) {}
        }
        createdProjectIds.clear();
    }

    @Test(priority = 1, description = "구글시트에서 테스트케이스를 바로 import할 때 Json 형태가 스키마를 준수하는지 검증")
    @Story("GoogleSheet Import")
    @Severity(SeverityLevel.CRITICAL)
    public void importFromGoogleSheetShouldReturnValidJson() {
        String projectId = createTestProject("GoogleSheetImport");
        // 실제 테스트에서는 접근 가능한 구글시트 ID/시트명을 사용해야 함
        String spreadsheetId = "18G07mpMXCt9RYhzAxWFGxEhBKRd1beFacMc_EuAsrNE";
        String sheetName = "import-test";
        String mappingJson = """
        {
          "fieldMappings": {
            "ProjectName": "projectName",
            "Type": "type",
            "DisplayOrder": "displayOrder",
            "Name": "name",
            "Description": "description",
            "Precondition": "preCondition",
            "StepNumber": "steps0.stepNumber",
            "StepDescription": "steps0.description",
            "StepExpectedResult": "steps0.expectedResult",
            "ExpectedResults": "expectedResults"
          }
        }
    """;

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .queryParam("spreadsheetId", spreadsheetId)
                .queryParam("sheetName", sheetName)
                .queryParam("projectId", projectId)
                .body(mappingJson)
                .when()
                .post("/api/testcases/import/google-sheet")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(testCaseListSchema))
                .body("size()", greaterThan(0))
                .body("[0].projectId", equalTo(projectId))
                .body("[0].name", notNullValue())
                .body("[0].steps", notNullValue());
    }
    @Test(priority = 2, description = "매핑 정보 없이 요청 시 400 에러와 메시지/스키마 반환 확인")
    @Story("GoogleSheet Import")
    @Severity(SeverityLevel.NORMAL)
    public void importFromGoogleSheetWithoutMappingShouldFail() {
        String projectId = createTestProject("GoogleSheetImport2");

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .queryParam("spreadsheetId", "18G07mpMXCt9RYhzAxWFGxEhBKRd1beFacMcEuAsrNE")
                .queryParam("sheetName", "import-test")
                .queryParam("projectId", projectId)
                .body("{}")
                .when()
                .post("/api/testcases/import/google-sheet")
                .then()
                .statusCode(400)
                .body(matchesJsonSchema(errorResponseSchema))
                .body("errorCode", anyOf(equalTo("VALIDATIONFAILED"), equalTo("CSVIMPORTERROR")))
                .body("message", containsString("No field mappings"));
    }

    @Test(priority = 3, description = "존재하지 않는 구글시트 ID/시트명 요청 시 404 에러와 메시지/스키마 반환 확인")
    @Story("GoogleSheet Import")
    @Severity(SeverityLevel.NORMAL)
    public void importFromGoogleSheetNotFoundShouldReturn404() {
        String projectId = createTestProject("GoogleSheetImport3");
        String mappingJson = """
            {
              "fieldMappings": {
                "ProjectID": "projectId"
              }
            }
        """;

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .queryParam("spreadsheetId", "invalid-id-1234")
                .queryParam("sheetName", "no-sheet")
                .queryParam("projectId", projectId)
                .body(mappingJson)
                .when()
                .post("/api/testcases/import/google-sheet")
                .then()
                .statusCode(404)
                .body(matchesJsonSchema(errorResponseSchema))
                .body("errorCode", equalTo("GOOGLE_SHEETS_ERROR"))
                .body("message", containsString("Requested entity was not found"));
    }

    // --- 유틸리티 메서드 ---

    private String createTestProject(String namePrefix) {
        String uniqueCode = namePrefix + "-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> projectRequest = new HashMap<>();
        projectRequest.put("name", namePrefix);
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

        String projectId = response.path("id");
        createdProjectIds.add(projectId);
        return projectId;
    }

    private String loadSchema(String resourcePath) throws Exception {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            if (is == null) throw new IllegalArgumentException("Schema not found: " + resourcePath);
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
