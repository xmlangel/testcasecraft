// src/test/java/com/testcase/testcasemanagement/api/ProjectControllerJsonSchemaTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.repository.ProjectRepository;
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
@Feature("프로젝트 관리")
@ActiveProfiles("test")
public class ProjectControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    @Autowired
    private ProjectRepository projectRepository;

    private String jwtToken;
    private String projectSchema;
    private String projectListSchema;
    private static String projectId;
    private static String createdAt;
    private static String updatedAt;
    String code = "AUTO-" + System.currentTimeMillis();

    // 생성된 프로젝트 ID 리스트
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
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/project-schema.json")) {
            projectSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/project-list-schema.json")) {
            projectListSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @BeforeMethod
    @AfterMethod
    @Transactional
    @Step("테스트 데이터 초기화")
    public void cleanTestData() {
        // 별도 데이터 클린업 없음 (트랜잭션 롤백)
    }

    @AfterClass
    public void cleanUpProjects() {
        for (String id : createdProjectIds) {
            try {
                given()
                        .header("Authorization", "Bearer " + jwtToken)
                        .when()
                        .delete("/api/projects/" + id);
            } catch (Exception ignore) {}
        }
        createdProjectIds.clear();
    }

    @Attachment(value = "요청 본문", type = "application/json")
    private String attachRequest(Map<String, Object> request) {
        return request.toString();
    }

    @Attachment(value = "응답 본문", type = "application/json")
    private String attachResponse(Response response) {
        return response.asPrettyString();
    }

    @Test(priority = 1)
    @Story("프로젝트 생성 플로우")
    @Severity(SeverityLevel.CRITICAL)
    @Description("프로젝트 생성 엔드투엔드 테스트")
    public void createProjectTest() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "자동생성-테스트프로젝트");
        requestBody.put("code", code);
        requestBody.put("description", "트랜잭션 롤백 테스트");
        requestBody.put("displayOrder", 1);

        Response createRes = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(requestBody)
                .when()
                .post("/api/projects")
                .then()
                .statusCode(201)
                .body(matchesJsonSchema(projectSchema))
                .body("code", equalTo(code))
                .body("createdAt", matchesPattern("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+$"))
                .extract().response();

        projectId = createRes.path("id");
        createdAt = createRes.path("createdAt");
        updatedAt = createRes.path("updatedAt");
        createdProjectIds.add(projectId);
    }

    @Test(priority = 2, dependsOnMethods = "createProjectTest")
    @Story("프로젝트 조회 플로우")
    @Severity(SeverityLevel.CRITICAL)
    @Description("프로젝트 단건 조회 엔드투엔드 테스트")
    public void getProjectByIdTest() {
        Response getRes = given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/projects/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(projectSchema))
                .body("id", equalTo(projectId))
                .body("createdAt", equalTo(createdAt))
                .body("updatedAt", equalTo(updatedAt))
                .extract().response();
    }

    @Test
    @Story("프로젝트 목록 조회")
    @Severity(SeverityLevel.NORMAL)
    public void getAllProjectsTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/projects")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(projectListSchema))
                .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    @Story("프로젝트 업데이트")
    @Severity(SeverityLevel.NORMAL)
    public void updateProjectTest() {
        // 사전 데이터 생성
        String projectId = given()
                .contentType(ContentType.JSON)
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .body(Map.of(
                        "name", "업데이트용 프로젝트",
                        "code", code,
                        "description", "초기 설명"
                ))
                .post("/api/projects")
                .then()
                .extract().path("id");

        createdProjectIds.add(projectId);

        // 업데이트 요청
        given()
                .contentType(ContentType.JSON)
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .body(Map.of(
                        "name", "AUTO-수정된 프로젝트명",
                        "code", "UPD-" + code,
                        "description", "수정된 설명",
                        "displayOrder", 2
                ))
                .when()
                .put("/api/projects/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(projectSchema))
                .body("code", equalTo("UPD-" + code));
    }

    @Test
    @Story("프로젝트 삭제")
    @Severity(SeverityLevel.CRITICAL)
    public void deleteProjectTest() {
        String projectId = given()
                .contentType(ContentType.JSON)
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .body(Map.of(
                        "name", "AUTO-삭제용 프로젝트",
                        "code", "AUTO-" + System.currentTimeMillis(),
                        "description", "삭제용 설명",
                        "displayOrder", 1
                ))
                .post("/api/projects")
                .then()
                .extract().path("id");

        // 삭제 테스트이므로 리스트에 추가하지 않음

        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .delete("/api/projects/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(projectSchema));

        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/projects/" + projectId)
                .then()
                .statusCode(404);
    }
}
