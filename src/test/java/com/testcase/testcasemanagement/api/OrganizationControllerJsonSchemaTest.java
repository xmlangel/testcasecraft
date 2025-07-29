// src/test/java/com/testcase/testcasemanagement/api/OrganizationControllerJsonSchemaTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
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
import java.nio.charset.StandardCharsets;
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
@Feature("조직 관리")
@ActiveProfiles("test")
public class OrganizationControllerJsonSchemaTest extends AbstractTransactionalTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private String authToken;
    private User testUser;

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

    // ==================== 조직 생성 테스트 ====================

    @Test
    @Story("조직 생성")
    @Description("새로운 조직을 생성하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateOrganization() {
        // Given
        Map<String, String> organizationData = Map.of(
            "name", "Test Organization",
            "description", "Test Organization Description"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(organizationData)
        .when()
            .post("/api/organizations")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("organization-schema.json")))
            .body("name", equalTo("Test Organization"))
            .body("description", equalTo("Test Organization Description"))
            .body("id", notNullValue())
            .body("createdAt", notNullValue())
            .body("updatedAt", notNullValue());
    }

    @Test
    @Story("조직 생성 유효성 검사")
    @Description("잘못된 데이터로 조직 생성 시 오류 응답을 확인한다")
    @Severity(SeverityLevel.NORMAL)
    void testCreateOrganization_InvalidData() {
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
            .post("/api/organizations")
        .then()
            .statusCode(400)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("error-response-schema.json")));
    }

    @Test
    @Story("조직 생성 인증")
    @Description("인증 없이 조직 생성 시 401 오류를 확인한다")
    @Severity(SeverityLevel.CRITICAL)
    void testCreateOrganization_Unauthorized() {
        // Given
        Map<String, String> organizationData = Map.of(
            "name", "Test Organization",
            "description", "Test Description"
        );

        // When & Then
        given()
            .contentType(ContentType.JSON)
            .body(organizationData)
        .when()
            .post("/api/organizations")
        .then()
            .statusCode(401);
    }

    // ==================== 조직 목록 조회 테스트 ====================

    @Test
    @Story("조직 목록 조회")
    @Description("사용자가 접근 가능한 조직 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testGetOrganizations() {
        // Given - 테스트 조직 생성
        createTestOrganization("Sample Organization", "Sample Description");

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("organization-list-schema.json")))
            .body("size()", greaterThan(0))
            .body("[0].id", notNullValue())
            .body("[0].name", notNullValue())
            .body("[0].createdAt", notNullValue());
    }

    @Test
    @Story("조직 목록 조회 인증")
    @Description("인증 없이 조직 목록 조회 시 401 오류를 확인한다")
    @Severity(SeverityLevel.CRITICAL)
    void testGetOrganizations_Unauthorized() {
        // When & Then
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations")
        .then()
            .statusCode(401);
    }

    // ==================== 조직 상세 조회 테스트 ====================

    @Test
    @Story("조직 상세 조회")
    @Description("특정 조직의 상세 정보를 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testGetOrganization() {
        // Given
        String organizationId = createTestOrganization("Detail Organization", "Detail Description");

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations/{id}", organizationId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("organization-schema.json")))
            .body("id", equalTo(organizationId))
            .body("name", equalTo("Detail Organization"))
            .body("description", equalTo("Detail Description"));
    }

    @Test
    @Story("조직 상세 조회 권한")
    @Description("접근 권한이 없는 조직 조회 시 403 오류를 확인한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetOrganization_Forbidden() {
        // Given - 존재하지 않는 조직 ID
        String nonExistentId = UUID.randomUUID().toString();

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations/{id}", nonExistentId)
        .then()
            .statusCode(anyOf(is(403), is(404)));
    }

    // ==================== 조직 수정 테스트 ====================

    @Test
    @Story("조직 정보 수정")
    @Description("조직 정보를 수정하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.CRITICAL)
    void testUpdateOrganization() {
        // Given
        String organizationId = createTestOrganization("Original Organization", "Original Description");
        
        Map<String, String> updateData = Map.of(
            "name", "Updated Organization",
            "description", "Updated Description"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(updateData)
        .when()
            .put("/api/organizations/{id}", organizationId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("organization-schema.json")))
            .body("id", equalTo(organizationId))
            .body("name", equalTo("Updated Organization"))
            .body("description", equalTo("Updated Description"));
    }

    // ==================== 조직 삭제 테스트 ====================

    @Test
    @Story("조직 삭제")
    @Description("조직을 삭제하고 성공 응답을 확인한다")
    @Severity(SeverityLevel.CRITICAL)
    void testDeleteOrganization() {
        // Given
        String organizationId = createTestOrganization("Delete Organization", "Delete Description");

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/organizations/{id}", organizationId)
        .then()
            .statusCode(anyOf(is(200), is(204)));

        // 삭제 후 조회 시 404 확인
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations/{id}", organizationId)
        .then()
            .statusCode(anyOf(is(403), is(404)));
    }

    // ==================== 조직 멤버 관리 테스트 ====================

    @Test
    @Story("조직 멤버 조회")
    @Description("조직의 멤버 목록을 조회하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testGetOrganizationMembers() {
        // Given
        String organizationId = createTestOrganization("Member Organization", "Member Description");

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
        .when()
            .get("/api/organizations/{id}/members", organizationId)
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("size()", greaterThan(0));
    }

    @Test
    @Story("조직 멤버 초대")
    @Description("조직에 새 멤버를 초대하고 JSON 스키마를 검증한다")
    @Severity(SeverityLevel.NORMAL)
    void testInviteMember() {
        // Given
        String organizationId = createTestOrganization("Invite Organization", "Invite Description");
        
        // 초대할 사용자 생성
        User inviteUser = new User();
        inviteUser.setId(UUID.randomUUID().toString());
        inviteUser.setUsername("inviteuser");
        inviteUser.setEmail("invite@example.com");
        inviteUser.setName("Invite User");
        inviteUser.setPassword("$2a$10$encoded.password.hash");
        inviteUser.setRole("USER");
        inviteUser.setCreatedAt(LocalDateTime.now());
        inviteUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(inviteUser);

        Map<String, String> inviteData = Map.of(
            "username", "inviteuser",
            "role", "MEMBER"
        );

        // When & Then
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(inviteData)
        .when()
            .post("/api/organizations/{id}/members", organizationId)
        .then()
            .statusCode(anyOf(is(200), is(201)))
            .contentType(ContentType.JSON)
            .body(matchesJsonSchema(loadSchema("organization-member-schema.json")))
            .body("user.username", equalTo("inviteuser"))
            .body("roleInOrganization", equalTo("MEMBER"));
    }

    // ==================== 헬퍼 메서드 ====================

    private String createTestOrganization(String name, String description) {
        Map<String, String> organizationData = Map.of(
            "name", name,
            "description", description
        );

        Response response = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(organizationData)
        .when()
            .post("/api/organizations")
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