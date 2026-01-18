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
import static org.hamcrest.Matchers.*;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import org.springframework.test.context.ContextConfiguration;

@Epic("API 테스트")
@Feature("테스트케이스 관리")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = TestcasemanagementApplication.class)
public class TestCaseControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

        @LocalServerPort
        private int port;

        private String jwtToken;
        private String testCaseSchema;
        private String testCaseListSchema;
        private String testCaseTreeSchema;

        // 테스트마다 생성된 프로젝트ID를 저장 (여러 테스트에서 활용)
        private final List<String> createdProjectIds = new ArrayList<>();

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
                try (InputStream is = getClass().getClassLoader()
                                .getResourceAsStream("schemas/testcase-list-schema.json")) {
                        testCaseListSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                }
                try (InputStream is = getClass().getClassLoader()
                                .getResourceAsStream("schemas/testcase-tree-schema.json")) {
                        testCaseTreeSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                }
        }

        @AfterMethod
        public void cleanUpProjects() {
                for (String projectId : createdProjectIds) {
                        deleteProject(projectId);
                }
                createdProjectIds.clear();
        }

        // --- 정상 플로우 테스트 ---

        @Test
        public void getTestCaseByIdTest() {
                String projectId = createTestProject();
                String testCaseId = createTestCase(projectId);

                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .when()
                                .get("/api/testcases/" + testCaseId)
                                .then()
                                .statusCode(200)
                                .body(matchesJsonSchema(testCaseSchema));

                deleteTestCase(testCaseId);
        }

        @Test
        public void createTestCaseTest() {
                String projectId = createTestProject();
                String testCaseId = createTestCase(projectId);
                deleteTestCase(testCaseId);
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
        }

        // --- Validation(예외) 테스트 ---

        @Test
        public void createTestCase_NameIsNull_ShouldReturnBadRequest() {
                String projectId = createTestProject();
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("name", null);
                requestBody.put("type", "testcase");
                requestBody.put("projectId", projectId);
                requestBody.put("expectedResults", "로그인 성공 후 대시보드 진입");

                Response response = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(requestBody)
                                .when()
                                .post("/api/testcases")
                                .then()
                                .statusCode(400)
                                .body("details.name", notNullValue())
                                .extract().response();

                Map<String, Object> errorBody = response.as(Map.class);
                Map<String, Object> details = (Map<String, Object>) errorBody.get("details");
                assert details != null;
                assert details.containsKey("name");
                assert details.get("name").toString().contains("required") ||
                                details.get("name").toString().contains("필수");
        }

        @Test
        public void createTestCase_NameTooLong_ShouldReturnBadRequest() {
                String projectId = createTestProject();
                String longName = "a".repeat(201); // 200자 초과
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("name", longName);
                requestBody.put("type", "testcase");
                requestBody.put("projectId", projectId);

                Response response = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(requestBody)
                                .when()
                                .post("/api/testcases")
                                .then()
                                .statusCode(400)
                                .body("details.name", notNullValue())
                                .extract().response();

                Map<String, Object> errorBody = response.as(Map.class);
                Map<String, Object> details = (Map<String, Object>) errorBody.get("details");
                assert details != null;
                assert details.containsKey("name");
                assert details.get("name").toString().contains("200") ||
                                details.get("name").toString().contains("length");
        }

        @Test
        public void createTestCase_ProjectIdIsNull_ShouldReturnBadRequest() {
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("name", "로그인 케이스");
                requestBody.put("type", "testcase");
                requestBody.put("projectId", null);

                Response response = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(requestBody)
                                .when()
                                .post("/api/testcases")
                                .then()
                                .statusCode(400)
                                .body("details.projectId", notNullValue())
                                .extract().response();

                Map<String, Object> errorBody = response.as(Map.class);
                Map<String, Object> details = (Map<String, Object>) errorBody.get("details");
                assert details != null;
                assert details.containsKey("projectId");
                assert details.get("projectId").toString().contains("required") ||
                                details.get("projectId").toString().contains("필수");
        }

        @Test
        public void createTestCase_NameIsEmpty_ShouldReturnBadRequest() {
                String projectId = createTestProject();
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("name", "");
                requestBody.put("type", "testcase");
                requestBody.put("projectId", projectId);

                Response response = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(requestBody)
                                .when()
                                .post("/api/testcases")
                                .then()
                                .statusCode(400)
                                .body("details.name", notNullValue())
                                .extract().response();

                Map<String, Object> errorBody = response.as(Map.class);
                Map<String, Object> details = (Map<String, Object>) errorBody.get("details");
                assert details.containsKey("name");
                assert details.get("name").toString().contains("필수");
        }

        @Test
        public void createTestCase_DescriptionTooLong_ShouldReturnBadRequest() {
                String projectId = createTestProject();
                String longDescription = "b".repeat(10001); // 10000자 초과
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("name", "로그인 케이스");
                requestBody.put("type", "testcase");
                requestBody.put("projectId", projectId);
                requestBody.put("description", longDescription);

                Response response = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(requestBody)
                                .when()
                                .post("/api/testcases")
                                .then()
                                .statusCode(400)
                                .body("details.description", notNullValue())
                                .extract().response();

                Map<String, Object> errorBody = response.as(Map.class);
                Map<String, Object> details = (Map<String, Object>) errorBody.get("details");
                assert details != null;
                assert details.containsKey("description");
                assert details.get("description").toString().contains("10,000") ||
                                details.get("description").toString().contains("10000");
        }

        /**
         * 최초 생성된 테스트케이스 폴더(시스템 폴더) 삭제 시도 시 INTERNAL_ERROR 반환 검증
         */
        @Test
        public void deleteSystemFolder_ShouldReturnInternalError() {
                // 1. 프로젝트 생성
                String projectId = createTestProject();

                // 2. 프로젝트의 테스트케이스 폴더(시스템 폴더) 조회
                Response folderRes = given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .when()
                                .get("/api/testcases/project/" + projectId)
                                .then()
                                .statusCode(200)
                                .extract().response();

                List<Map<String, Object>> folders = folderRes.jsonPath().getList("$");
                String systemFolderId = null;
                for (Map<String, Object> folder : folders) {
                        // description이 [SYSTEM]으로 시작하면 시스템 폴더로 간주
                        String description = (String) folder.get("description");
                        if (description != null && description.startsWith("[SYSTEM]")) {
                                systemFolderId = (String) folder.get("id");
                                break;
                        }
                }
                assert systemFolderId != null : "시스템 폴더 ID를 찾을 수 없습니다.";

                // 3. 시스템 폴더 삭제 시도
                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .when()
                                .delete("/api/testcases/" + systemFolderId)
                                .then()
                                .statusCode(500)
                                .body("errorCode", equalTo("INTERNAL_ERROR"))
                                .body("message", containsString("최초 생성된 테스트케이스 폴더는 삭제할 수 없습니다."));
        }

        // --- CSV Import 테스트케이스 추가 ---

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.CRITICAL)
        @Description("유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증")
        public void importValidCsvFileTest() {
                // 1. 테스트용 프로젝트 동적 생성
                String uniqueCode = "CSV-" + UUID.randomUUID().toString().substring(0, 8);
                Map<String, Object> projectRequest = new HashMap<>();
                projectRequest.put("name", "CSV");
                projectRequest.put("code", uniqueCode);

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                // 2. CSV 파일 준비
                String csvFilePath = "test-data/valid_testcases.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                // 3. 매핑 정보 준비
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

                // 4. CSV 임포트 API 호출 및 검증
                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .param("mapping", mappingJson)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(200)
                                .body("size()", equalTo(3))
                                .body("[0].projectId", equalTo(projectId))
                                .body("[0].name", equalTo("01로그인 성공"))
                                .body("[0].steps.size()", equalTo(3))
                                .body("[0].steps[0].stepNumber", equalTo(1))
                                .body("[0].steps[0].description", equalTo("로그인 페이지 접속"))
                                .body("[2].type", equalTo("folder"))
                                .body("[2].children", empty());

                // 5. 테스트케이스 전체 삭제 (프로젝트 삭제 조건 충족)
                deleteAllTestCasesByProjectId(projectId);

                // 6. 프로젝트 삭제
                deleteProject(projectId);
        }

        private static Map<String, Object> getProjectRequest(String x, String value) {
                String uniqueCode = x + UUID.randomUUID().toString().substring(0, 8);
                Map<String, Object> projectRequest = new HashMap<>();
                projectRequest.put("name", value);
                projectRequest.put("code", uniqueCode);
                projectRequest.put("displayOrder", 1);
                return projectRequest;
        }

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.CRITICAL)
        @Description("유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증 (다른 포맷)")
        public void importValidCsvFileTest2() {
                // 1. 프로젝트 생성
                Map<String, Object> projectRequest = getProjectRequest("CSV2-",
                                "유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증 (다른 포맷)");

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                // 2. CSV 파일 준비
                String csvFilePath = "test-data/ahm-notifications.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                // 3. 매핑 정보 준비
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

                // 4. API 호출 및 검증
                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .param("mapping", mappingJson)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(200);

                deleteAllTestCasesByProjectId(projectId);

                deleteProject(projectId);
        }

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.CRITICAL)
        @Description("유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증 (줄바꿈)")
        public void importValidCsvFileTest3() {
                // 1. 프로젝트 생성
                Map<String, Object> projectRequest = getProjectRequest("CSV2-",
                                "유효한 CSV 파일 업로드 시 테스트 케이스 정상 등록 검증 (줄바꿈)");

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                // 2. CSV 파일 준비
                String csvFilePath = "test-data/ahm-notifications2.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                // 3. 매핑 정보 준비
                String mappingJson = "{\n" +
                                "  \"fieldMappings\": {\n" +
                                "    \"name\": \"name\",\n" +
                                "    \"type\": \"type\",\n" +
                                "    \"preCondition\": \"preCondition\",\n" +
                                "    \"step1\": \"steps[0].description\",\n" +
                                "    \"expectedResults\": \"expectedResults\"\n" +
                                "  }\n" +
                                "}";

                // 4. API 호출 및 검증
                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .param("mapping", mappingJson)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(200);

                deleteAllTestCasesByProjectId(projectId);

                deleteProject(projectId);
        }

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.NORMAL)
        @Description("필드 매핑 정보가 없는 경우 에러 반환")
        public void importCsvFileWithoutMappingShouldFail() {

                // 1. 프로젝트 생성
                Map<String, Object> projectRequest = getProjectRequest("CSV2-", "필드 매핑 정보가 없는 경우 에러 반환");

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                String csvFilePath = "test-data/valid_testcases.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(400)
                                .body("error", containsString("No field mappings"));

                deleteProject(projectId);
        }

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.NORMAL)
        @Description("매핑 정보가 잘못된 경우 에러 반환")
        public void importCsvFileWithInvalidMappingShouldFail() {
                // 1. 프로젝트 생성
                Map<String, Object> projectRequest = getProjectRequest("CSV2-", "CSV 파일 업로드로 테스트 케이스 가져오기");

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                String csvFilePath = "test-data/valid_testcases.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                String invalidMappingJson = "{ \"fieldMappings\": {} }"; // 필드 매핑 없음

                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .param("mapping", invalidMappingJson)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(400)
                                .body("error", containsString("필드 매핑")); // 한글 메시지 검증

                deleteProject(projectId);
        }

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.NORMAL)
        @Description("CSV 데이터가 유효하지 않은 경우 에러 반환")
        public void importInvalidCsvFileShouldFail() {
                // 1. 프로젝트 생성
                Map<String, Object> projectRequest = getProjectRequest("CSV2-", "CSV 데이터가 유효하지 않은 경우 에러 반환");

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                String csvFilePath = "test-data/invalid_testcases.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                String mappingJson = "{ \"fieldMappings\": {"
                                + "\"name\":\"name\","
                                + "\"type\":\"type\""
                                + "}}";

                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .param("mapping", mappingJson)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(400)
                                .body("error", containsString("CSV import failed"));

                deleteProject(projectId);
        }

        @Test
        @Story("CSV 파일 업로드로 테스트 케이스 가져오기")
        @Severity(SeverityLevel.NORMAL)
        @Description("2MB 초과 파일 업로드 시 에러 반환")
        public void importLargeCsvFileShouldFail() {
                // 1. 프로젝트 생성
                Map<String, Object> projectRequest = getProjectRequest("CSV2-", "2MB 초과 파일 업로드 시 에러 반환");

                String projectId = given()
                                .filter(new AllureRestAssured())
                                .contentType(ContentType.JSON)
                                .header("Authorization", "Bearer " + jwtToken)
                                .body(projectRequest)
                                .when()
                                .post("/api/projects")
                                .then()
                                .statusCode(201)
                                .extract().path("id");

                String csvFilePath = "test-data/large_testcases.csv";
                InputStream csvFileStream = getClass().getClassLoader().getResourceAsStream(csvFilePath);

                String mappingJson = "{ \"fieldMappings\": {"
                                + "\"name\":\"name\","
                                + "\"type\":\"type\""
                                + "}}";

                given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .multiPart("file", "testcases.csv", csvFileStream, "text/csv")
                                .param("projectId", projectId)
                                .param("mapping", mappingJson)
                                .when()
                                .post("/api/testcases/import/csv")
                                .then()
                                .statusCode(400)
                                .body("message", containsString("File size exceeds 2MB limit"));
                deleteProject(projectId);
        }

        // --- 유틸 메서드 (SRP 적용) ---

        private String createTestProject() {
                Map<String, Object> projectRequest = getProjectRequest("TEST-", "테스트 프로젝트");

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
                createdProjectIds.add(projectId); // 생성된 프로젝트ID 저장
                return projectId;
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
                } catch (Exception ignore) {
                }
        }

        /**
         * 프로젝트 내 모든 테스트케이스(폴더 포함)를 삭제한다.
         */
        private void deleteAllTestCasesByProjectId(String projectId) {
                List<Map<String, Object>> testCases = given()
                                .filter(new AllureRestAssured())
                                .header("Authorization", "Bearer " + jwtToken)
                                .when()
                                .get("/api/testcases/project/" + projectId)
                                .then()
                                .statusCode(200)
                                .extract()
                                .jsonPath().getList("");

                // 자식부터 먼저 삭제 (폴더/트리 구조 지원)
                // 폴더가 마지막에 남지 않도록 역순 삭제
                testCases.sort((a, b) -> {
                        // 폴더가 뒤로 가게
                        String typeA = (String) a.get("type");
                        String typeB = (String) b.get("type");
                        return typeA.equals("folder") && !typeB.equals("folder") ? 1
                                        : !typeA.equals("folder") && typeB.equals("folder") ? -1 : 0;
                });

                for (Map<String, Object> testCase : testCases) {
                        String testCaseId = (String) testCase.get("id");
                        deleteTestCase(testCaseId);
                }
        }

        private void deleteProject(String projectId) {
                try {
                        given()
                                        .filter(new AllureRestAssured())
                                        .header("Authorization", "Bearer " + jwtToken)
                                        .when()
                                        .delete("/api/projects/" + projectId);
                } catch (Exception ignore) {
                }
        }
}
