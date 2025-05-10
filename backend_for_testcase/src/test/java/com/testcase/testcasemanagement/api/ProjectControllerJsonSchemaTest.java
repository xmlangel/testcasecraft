package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.hamcrest.Matchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;
import org.springframework.transaction.annotation.Transactional;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;

import java.io.InputStream;
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
public class ProjectControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private String createdProjectId;

    @BeforeClass
    public void setup() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";

        // JWT 토큰 획득
        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "admin123");

        jwtToken = given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .path("token");
    }
    @Autowired
    private ProjectRepository projectRepository;


    @BeforeMethod
    @Transactional
    @Test
    public void cleanUpTestProjects() {
        projectRepository.findAll().stream()
                .filter(project -> project.getCode() != null && project.getCode().startsWith("AUTO-"))
                .forEach(project -> projectRepository.deleteById(project.getId()));
    }

    @Test(priority = 1) // 테스트 실행 순서 지정
    @Transactional
    public void createAndGetProject_schemaAndResponseValidation() {
        InputStream schema = getClass().getClassLoader().getResourceAsStream("schemas/project-schema.json");
        String code = "AUTO-" + System.currentTimeMillis();
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "자동생성-테스트프로젝트");
        requestBody.put("code", code);
        requestBody.put("description", "트랜잭션 롤백 테스트");
        requestBody.put("displayorder", "1");

        // 프로젝트 생성
        createdProjectId =
                given()
                        .contentType(ContentType.JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .body(requestBody)
                        .when()
                        .post("/api/projects")
                        .then()
                        .statusCode(201)
                        .body(matchesJsonSchema(schema))
                        .body("name", equalTo("자동생성-테스트프로젝트"))
                        .body("code", equalTo(code))
                        .body("description", equalTo("트랜잭션 롤백 테스트"))
                        .body("displayorder",equalTo(1))
                        .extract()
                        .path("id");

        // 단건 조회 및 응답 본문 검증
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .accept(ContentType.JSON)
                .when()
                .get("/api/projects/" + createdProjectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(schema))
                .body("id", equalTo(createdProjectId))
                .body("name", equalTo("자동생성_테스트프로젝트"))
                .body("code", equalTo(code))
                .body("description", equalTo("트랜잭션 롤백 테스트"));
    }

    @Test
    @Transactional
    public void getAllProjects_schemaAndListContentValidation() {
        InputStream schema = getClass().getClassLoader().getResourceAsStream("schemas/project-list-schema.json");
        // 전체 목록 조회 및 스키마, 일부 값 검증
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .accept(ContentType.JSON)
                .when()
                .get("/api/projects")
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(schema))
                .body("size()", greaterThanOrEqualTo(0))
                .body("[0].id", notNullValue())
                .body("[0].name", notNullValue());
    }

    @Test
    @Transactional
    public void updateProject_schemaAndResponseValidation() {
        // 사전 생성
        String code = "AUTO_" + System.currentTimeMillis();
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "업데이트용 프로젝트");
        requestBody.put("code", code);
        requestBody.put("description", "업데이트 전");

        String projectId =
                given()
                        .contentType(ContentType.JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .body(requestBody)
                        .when()
                        .post("/api/projects")
                        .then()
                        .statusCode(201)
                        .extract()
                        .path("id");

        // 수정 요청
        InputStream schema = getClass().getClassLoader().getResourceAsStream("schemas/project-schema.json");
        Map<String, Object> updateBody = new HashMap<>();
        updateBody.put("name", "수정된 프로젝트명");
        updateBody.put("code", "UPDATED_" + code);
        updateBody.put("description", "수정된 설명");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(updateBody)
                .when()
                .put("/api/projects/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(schema))
                .body("id", equalTo(projectId))
                .body("name", equalTo("수정된 프로젝트명"))
                .body("code", equalTo("UPDATED-" + code))
                .body("description", equalTo("수정된 설명"));
    }

    @Test
    @Transactional
    public void deleteProject_schemaAndResponseValidation() {
        // 사전 생성
        String code = "AUTO_" + System.currentTimeMillis();
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", "삭제용 프로젝트");
        requestBody.put("code", code);
        requestBody.put("description", "삭제 테스트");

        String projectId =
                given()
                        .contentType(ContentType.JSON)
                        .header("Authorization", "Bearer " + jwtToken)
                        .body(requestBody)
                        .when()
                        .post("/api/projects")
                        .then()
                        .statusCode(201)
                        .extract()
                        .path("id");

        InputStream schema = getClass().getClassLoader().getResourceAsStream("schemas/project-schema.json");

        // 삭제 요청
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .delete("/api/projects/" + projectId)
                .then()
                .statusCode(200)
                .body(matchesJsonSchema(schema))
                .body("id", equalTo(projectId))
                .body("name", equalTo("삭제용 프로젝트"))
                .body("code", equalTo(code))
                .body("description", equalTo("삭제 테스트"));

        // 실제로 삭제되었는지 확인
        given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/projects/" + projectId)
                .then()
                .statusCode(404);
    }
}
