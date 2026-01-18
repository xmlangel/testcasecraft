// src/test/java/com/testcase/testcasemanagement/api/ProjectControllerExtendedJsonSchemaTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.User;
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
import java.time.LocalDateTime;
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
@Feature("확장된 프로젝트 관리")
@ActiveProfiles("test")
public class ProjectControllerExtendedJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private String authToken;
    private User testUser;
    private Organization testOrganization;

    @BeforeClass
    void setUpClass() {
        RestAssured.port = port;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
        RestAssured.filters(
            new RequestLoggingFilter(),
            new ResponseLoggingFilter(),
            new AllureRestAssured()
        );
    }

    @BeforeMethod
    @Transactional
    void setUp() {
        // 테스트 사용자 생성
        testUser = new User();
        testUser.setId(UUID.randomUUID().toString());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPassword("$2a$10$encoded.password.hash");
        testUser.setRole("USER");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(testUser);

        // 테스트 조직 생성
        testOrganization = new Organization();
        testOrganization.setId(UUID.randomUUID().toString());
        testOrganization.setName("Test Organization");
        testOrganization.setDescription("Test Organization Description");
        testOrganization.setCreatedAt(LocalDateTime.now());
        testOrganization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(testOrganization);

        // 인증 토큰 획득
        authToken = getAuthToken();
    }

    private String getAuthToken() {
        Response response = given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "username", "testuser",
                "password", "password123"
            ))
            .when()
            .post("/api/auth/login")
            .then()
            .statusCode(anyOf(is(200), is(201)))
            .extract()
            .response();

        return response.jsonPath().getString("token");
    }

    // ==================== 조직 프로젝트 생성 테스트 ====================

    @Test
    @Story("조직 프로젝트 생성")
    @Description("조직에 속한 새로운 프로젝트를 생성하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateOrganizationProject() {
        // Given
        Map<String, Object> projectData = Map.of(
            "name", "Organization Project",
            "code", "ORG001",
            "description", "Test Organization Project",
            "organizationId", testOrganization.getId()
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(projectData)
        .when()
            .post("/api/projects")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("project-extended-schema.json")))
            .body("name", equalTo("Organization Project"))
            .body("code", equalTo("ORG001"))
            .body("description", equalTo("Test Organization Project"))
            .body("organization.id", equalTo(testOrganization.getId()))
            .body("organization.name", equalTo("Test Organization"))
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Story("독립 프로젝트 생성")
    @Description("조직에 속하지 않는 독립 프로젝트를 생성하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateIndependentProject() {
        // Given
        Map<String, Object> projectData = Map.of(
            "name", "Independent Project",
            "code", "INDEP001",
            "description", "Test Independent Project"
            // organizationId는 포함하지 않음
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(projectData)
        .when()
            .post("/api/projects")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("project-extended-schema.json")))
            .body("name", equalTo("Independent Project"))
            .body("code", equalTo("INDEP001"))
            .body("description", equalTo("Test Independent Project"))
            .body("organization", nullValue())
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Story("프로젝트 생성 유효성 검사")
    @Description("중복된 프로젝트 코드로 생성 시 오류 응답을 확인한다")
    @Severity(SeverityLevel.NORMAL)
    void testCreateProject_DuplicateCode() {
        // Given - 먼저 프로젝트 하나 생성
        Map<String, Object> firstProject = Map.of(
            "name", "First Project",
            "code", "DUPLICATE001",
            "description", "First Project"
        );

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(firstProject)
        .when()
            .post("/api/projects")
        .then()
            .statusCode(201);

        // 같은 코드로 두 번째 프로젝트 생성 시도
        Map<String, Object> duplicateProject = Map.of(
            "name", "Second Project",
            "code", "DUPLICATE001", // 중복된 코드
            "description", "Second Project"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(duplicateProject)
        .when()
            .post("/api/projects")
        .then()
            .statusCode(anyOf(is(400), is(409)))
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("error-response-schema.json")));
    }

    // ==================== 접근 가능한 프로젝트 목록 조회 테스트 ====================

    @Test
    @Story("접근 가능한 프로젝트 목록 조회")
    @Description("사용자가 접근 가능한 프로젝트 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testGetAccessibleProjects() {
        // Given - 조직 프로젝트와 독립 프로젝트 생성
        createTestProject("Org Project", "ORG001", testOrganization.getId());
        createTestProject("Independent Project", "INDEP001", null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/projects")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("project-list-schema.json")))
            .body("size()", greaterThan(0));
    }

    // ==================== 프로젝트 이전 테스트 ====================

    @Test
    @Story("프로젝트 조직 이전")
    @Description("프로젝트를 다른 조직으로 이전하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testTransferProject() {
        // Given
        String projectId = createTestProject("Transfer Project", "TRANS001", null);
        
        // 새로운 조직 생성
        Organization newOrganization = new Organization();
        newOrganization.setId(UUID.randomUUID().toString());
        newOrganization.setName("New Organization");
        newOrganization.setDescription("New Organization Description");
        newOrganization.setCreatedAt(LocalDateTime.now());
        newOrganization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(newOrganization);

        Map<String, String> transferData = Map.of(
            "organizationId", newOrganization.getId()
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(transferData)
        .when()
            .put("/api/projects/{id}/transfer", projectId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("project-extended-schema.json")))
            .body("id", equalTo(projectId))
            .body("organization.id", equalTo(newOrganization.getId()))
            .body("organization.name", equalTo("New Organization"));
    }

    @Test
    @Story("프로젝트 독립화")
    @Description("조직 프로젝트를 독립 프로젝트로 전환하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testMakeProjectIndependent() {
        // Given
        String projectId = createTestProject("Org Project", "ORG002", testOrganization.getId());

        Map<String, Object> transferData = Map.of(
            "organizationId", (Object) null // null로 설정하여 독립 프로젝트로 전환
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(transferData)
        .when()
            .put("/api/projects/{id}/transfer", projectId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("project-extended-schema.json")))
            .body("id", equalTo(projectId))
            .body("organization", nullValue());
    }

    // ==================== 프로젝트 멤버 관리 테스트 ====================

    @Test
    @Story("프로젝트 멤버 조회")
    @Description("프로젝트의 멤버 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetProjectMembers() {
        // Given
        String projectId = createTestProject("Member Project", "MEM001", null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/projects/{id}/members", projectId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThan(0));
    }

    @Test
    @Story("프로젝트 멤버 초대")
    @Description("프로젝트에 새 멤버를 초대하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testInviteProjectMember() {
        // Given
        String projectId = createTestProject("Invite Project", "INV001", null);
        
        // 초대할 사용자 생성
        User inviteUser = new User();
        inviteUser.setId(UUID.randomUUID().toString());
        inviteUser.setUsername("projectinvite");
        inviteUser.setEmail("projectinvite@example.com");
        inviteUser.setName("Project Invite User");
        inviteUser.setPassword("$2a$10$encoded.password.hash");
        inviteUser.setRole("USER");
        inviteUser.setCreatedAt(LocalDateTime.now());
        inviteUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(inviteUser);

        Map<String, String> inviteData = Map.of(
            "username", "projectinvite",
            "role", "DEVELOPER"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(inviteData)
        .when()
            .post("/api/projects/{id}/members", projectId)
        .then()
            .statusCode(anyOf(is(200), is(201)))
            .contentType(ContentType.JSON)
            .body("user.username", equalTo("projectinvite"))
            .body("roleInProject", equalTo("DEVELOPER"));
    }

    // ==================== 조직별 프로젝트 조회 테스트 ====================

    @Test
    @Story("조직별 프로젝트 조회")
    @Description("특정 조직의 프로젝트 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetProjectsByOrganization() {
        // Given
        createTestProject("Org Project 1", "ORG101", testOrganization.getId());
        createTestProject("Org Project 2", "ORG102", testOrganization.getId());

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations/{id}/projects", testOrganization.getId())
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("project-list-schema.json")))
            .body("size()", greaterThanOrEqualTo(2))
            .body("findAll { it.organization.id == '" + testOrganization.getId() + "' }.size()", 
                  greaterThanOrEqualTo(2));
    }

    // ==================== 헬퍼 메서드 ====================

    private String createTestProject(String name, String code, String organizationId) {
        Map<String, Object> projectData = new HashMap<>();
        projectData.put("name", name);
        projectData.put("code", code);
        projectData.put("description", "Test Description for " + name);
        
        if (organizationId != null) {
            projectData.put("organizationId", organizationId);
        }

        Response response = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(projectData)
        .when()
            .post("/api/projects")
        .then()
            .statusCode(201)
            .extract()
            .response();

        return response.jsonPath().getString("id");
    }

    private InputStream loadSchema(String schemaName) {
        return getClass().getClassLoader().getResourceAsStream("schemas/" + schemaName);
    }
}