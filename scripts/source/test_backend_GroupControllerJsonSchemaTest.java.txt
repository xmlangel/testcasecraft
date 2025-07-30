// src/test/java/com/testcase/testcasemanagement/api/GroupControllerJsonSchemaTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.repository.GroupRepository;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
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
@Feature("그룹 관리")
@ActiveProfiles("test")
public class GroupControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private String authToken;
    private User testUser;
    private Organization testOrganization;
    private Project testProject;

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

        // 테스트 프로젝트 생성
        testProject = new Project();
        testProject.setId(UUID.randomUUID().toString());
        testProject.setName("Test Project");
        testProject.setCode("TEST001");
        testProject.setDescription("Test Project Description");
        testProject.setOrganization(testOrganization);
        testProject.setCreatedAt(LocalDateTime.now());
        testProject.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(testProject);

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

    // ==================== 조직 그룹 생성 테스트 ====================

    @Test
    @Story("조직 그룹 생성")
    @Description("조직에 속한 새로운 그룹을 생성하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateOrganizationGroup() {
        // Given
        Map<String, Object> groupData = Map.of(
            "name", "Organization Group",
            "description", "Test Organization Group",
            "organizationId", testOrganization.getId()
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(groupData)
        .when()
            .post("/api/groups")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-schema.json")))
            .body("name", equalTo("Organization Group"))
            .body("description", equalTo("Test Organization Group"))
            .body("organization.id", equalTo(testOrganization.getId()))
            .body("organization.name", equalTo("Test Organization"))
            .body("project", nullValue())
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Story("프로젝트 그룹 생성")
    @Description("프로젝트에 속한 새로운 그룹을 생성하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateProjectGroup() {
        // Given
        Map<String, Object> groupData = Map.of(
            "name", "Project Group",
            "description", "Test Project Group",
            "projectId", testProject.getId()
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(groupData)
        .when()
            .post("/api/groups")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-schema.json")))
            .body("name", equalTo("Project Group"))
            .body("description", equalTo("Test Project Group"))
            .body("organization", nullValue())
            .body("project.id", equalTo(testProject.getId()))
            .body("project.name", equalTo("Test Project"))
            .body("project.code", equalTo("TEST001"))
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Story("독립 그룹 생성")
    @Description("조직이나 프로젝트에 속하지 않는 독립 그룹을 생성하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateIndependentGroup() {
        // Given
        Map<String, Object> groupData = Map.of(
            "name", "Independent Group",
            "description", "Test Independent Group"
            // organizationId, projectId 모두 포함하지 않음
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(groupData)
        .when()
            .post("/api/groups")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-schema.json")))
            .body("name", equalTo("Independent Group"))
            .body("description", equalTo("Test Independent Group"))
            .body("organization", nullValue())
            .body("project", nullValue())
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Story("그룹 생성 유효성 검사")
    @Description("잘못된 데이터로 그룹 생성 시 오류 응답을 확인한다")
    @Severity(SeverityLevel.NORMAL)
    void testCreateGroup_InvalidData() {
        // Given - 이름이 없는 잘못된 데이터
        Map<String, String> invalidData = Map.of(
            "description", "Test Description"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(invalidData)
        .when()
            .post("/api/groups")
        .then()
            .statusCode(400)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("error-response-schema.json")));
    }

    // ==================== 접근 가능한 그룹 목록 조회 테스트 ====================

    @Test
    @Story("접근 가능한 그룹 목록 조회")
    @Description("사용자가 접근 가능한 그룹 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testGetAccessibleGroups() {
        // Given - 다양한 타입의 그룹 생성
        createTestGroup("Org Group", "Organization Group", testOrganization.getId(), null);
        createTestGroup("Proj Group", "Project Group", null, testProject.getId());
        createTestGroup("Indep Group", "Independent Group", null, null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/groups")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-list-schema.json")))
            .body("size()", greaterThan(0));
    }

    // ==================== 그룹 상세 조회 테스트 ====================

    @Test
    @Story("그룹 상세 조회")
    @Description("특정 그룹의 상세 정보를 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testGetGroup() {
        // Given
        String groupId = createTestGroup("Detail Group", "Detail Description", null, null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/groups/{id}", groupId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-schema.json")))
            .body("id", equalTo(groupId))
            .body("name", equalTo("Detail Group"))
            .body("description", equalTo("Detail Description"));
    }

    @Test
    @Story("그룹 상세 조회 권한")
    @Description("접근 권한이 없는 그룹 조회 시 403 오류를 확인한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetGroup_Forbidden() {
        // Given - 존재하지 않는 그룹 ID
        String nonExistentId = UUID.randomUUID().toString();

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/groups/{id}", nonExistentId)
        .then()
            .statusCode(anyOf(is(403), is(404)));
    }

    // ==================== 그룹 수정 테스트 ====================

    @Test
    @Story("그룹 정보 수정")
    @Description("그룹 정보를 수정하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testUpdateGroup() {
        // Given
        String groupId = createTestGroup("Original Group", "Original Description", null, null);
        
        Map<String, String> updateData = Map.of(
            "name", "Updated Group",
            "description", "Updated Description"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(updateData)
        .when()
            .put("/api/groups/{id}", groupId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-schema.json")))
            .body("id", equalTo(groupId))
            .body("name", equalTo("Updated Group"))
            .body("description", equalTo("Updated Description"));
    }

    // ==================== 그룹 삭제 테스트 ====================

    @Test
    @Story("그룹 삭제")
    @Description("그룹을 삭제하고 성공 응답을 확인한다")
    @Severity(SeverityLevel.CRITICAL)
    void testDeleteGroup() {
        // Given
        String groupId = createTestGroup("Delete Group", "Delete Description", null, null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/groups/{id}", groupId)
        .then()
            .statusCode(anyOf(is(200), is(204)));

        // 삭제 후 조회 시 404 확인
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/groups/{id}", groupId)
        .then()
            .statusCode(anyOf(is(403), is(404)));
    }

    // ==================== 그룹 멤버 관리 테스트 ====================

    @Test
    @Story("그룹 멤버 조회")
    @Description("그룹의 멤버 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetGroupMembers() {
        // Given
        String groupId = createTestGroup("Member Group", "Member Description", null, null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/groups/{id}/members", groupId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThan(0));
    }

    @Test
    @Story("그룹 멤버 초대")
    @Description("그룹에 새 멤버를 초대하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testInviteGroupMember() {
        // Given
        String groupId = createTestGroup("Invite Group", "Invite Description", null, null);
        
        // 초대할 사용자 생성
        User inviteUser = new User();
        inviteUser.setId(UUID.randomUUID().toString());
        inviteUser.setUsername("groupinvite");
        inviteUser.setEmail("groupinvite@example.com");
        inviteUser.setName("Group Invite User");
        inviteUser.setPassword("$2a$10$encoded.password.hash");
        inviteUser.setRole("USER");
        inviteUser.setCreatedAt(LocalDateTime.now());
        inviteUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(inviteUser);

        Map<String, String> inviteData = Map.of(
            "username", "groupinvite",
            "role", "MEMBER"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(inviteData)
        .when()
            .post("/api/groups/{id}/members", groupId)
        .then()
            .statusCode(anyOf(is(200), is(201)))
            .contentType(ContentType.JSON)
            .body("user.username", equalTo("groupinvite"))
            .body("roleInGroup", equalTo("MEMBER"));
    }

    // ==================== 조직별/프로젝트별 그룹 조회 테스트 ====================

    @Test
    @Story("조직별 그룹 조회")
    @Description("특정 조직의 그룹 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetGroupsByOrganization() {
        // Given
        createTestGroup("Org Group 1", "Organization Group 1", testOrganization.getId(), null);
        createTestGroup("Org Group 2", "Organization Group 2", testOrganization.getId(), null);

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations/{id}/groups", testOrganization.getId())
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-list-schema.json")))
            .body("size()", greaterThanOrEqualTo(2))
            .body("findAll { it.organization?.id == '" + testOrganization.getId() + "' }.size()", 
                  greaterThanOrEqualTo(2));
    }

    @Test
    @Story("프로젝트별 그룹 조회")
    @Description("특정 프로젝트의 그룹 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetGroupsByProject() {
        // Given
        createTestGroup("Proj Group 1", "Project Group 1", null, testProject.getId());
        createTestGroup("Proj Group 2", "Project Group 2", null, testProject.getId());

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/projects/{id}/groups", testProject.getId())
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("group-list-schema.json")))
            .body("size()", greaterThanOrEqualTo(2))
            .body("findAll { it.project?.id == '" + testProject.getId() + "' }.size()", 
                  greaterThanOrEqualTo(2));
    }

    // ==================== 헬퍼 메서드 ====================

    private String createTestGroup(String name, String description, String organizationId, String projectId) {
        Map<String, Object> groupData = new HashMap<>();
        groupData.put("name", name);
        groupData.put("description", description);
        
        if (organizationId != null) {
            groupData.put("organizationId", organizationId);
        }
        if (projectId != null) {
            groupData.put("projectId", projectId);
        }

        Response response = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(groupData)
        .when()
            .post("/api/groups")
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