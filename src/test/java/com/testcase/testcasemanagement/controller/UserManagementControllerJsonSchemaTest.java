// src/test/java/com/testcase/testcasemanagement/controller/UserManagementControllerJsonSchemaTest.java
package com.testcase.testcasemanagement.controller;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import io.qameta.allure.*;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.module.jsv.JsonSchemaValidator;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/** 사용자 관리 API JSON 스키마 검증 테스트 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@ActiveProfiles("test")
@Epic("사용자 관리 시스템")
@Feature("사용자 관리 API")
public class UserManagementControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

  @LocalServerPort private int port;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private String adminToken;
  private String regularUserToken;
  private User adminUser;
  private User regularUser;
  private User testUser;

  @BeforeClass
  public void globalSetup() throws Exception {
    RestAssured.port = port;
    RestAssured.baseURI = "http://localhost";

    RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter());

    // 주의: RestAssured가 실제 HTTP(RANDOM_PORT)로 요청하므로 @Transactional 롤백이 적용되지 않는다.
    // 아래에서 생성한 사용자는 실제 DB에 커밋되므로 @AfterClass(cleanup)에서 명시적으로 삭제한다.

    // 관리자 사용자 생성
    String uniqueId = UUID.randomUUID().toString().substring(0, 8);
    adminUser = new User();
    adminUser.setUsername("admin_test_" + uniqueId);
    adminUser.setEmail("admin_" + uniqueId + "@test.com");
    adminUser.setName("Test Admin " + uniqueId);
    adminUser.setPassword(passwordEncoder.encode("admin123"));
    adminUser.setRole("ADMIN");
    adminUser.setIsActive(true);
    adminUser.setCreatedAt(LocalDateTime.now());
    adminUser.setUpdatedAt(LocalDateTime.now());
    adminUser = userRepository.save(adminUser);

    // 일반 사용자 생성
    regularUser = new User();
    regularUser.setUsername("regular_test_" + uniqueId);
    regularUser.setEmail("regular_" + uniqueId + "@test.com");
    regularUser.setName("Test User " + uniqueId);
    regularUser.setPassword(passwordEncoder.encode("user123"));
    regularUser.setRole("USER");
    regularUser.setIsActive(true);
    regularUser.setCreatedAt(LocalDateTime.now());
    regularUser.setUpdatedAt(LocalDateTime.now());
    regularUser = userRepository.save(regularUser);

    // 테스트 대상 사용자 생성
    testUser = new User();
    testUser.setUsername("test_target_" + uniqueId);
    testUser.setEmail("target_" + uniqueId + "@test.com");
    testUser.setName("Target User " + uniqueId);
    testUser.setPassword(passwordEncoder.encode("target123"));
    testUser.setRole("USER");
    testUser.setIsActive(true);
    testUser.setCreatedAt(LocalDateTime.now());
    testUser.setUpdatedAt(LocalDateTime.now());
    testUser = userRepository.save(testUser);

    // JWT 토큰 생성 (로그인을 통해)
    adminToken = loginAndGetToken(adminUser.getUsername(), "admin123");
    regularUserToken = loginAndGetToken(regularUser.getUsername(), "user123");
  }

  /**
   * 이 테스트가 생성한 사용자(및 로그인으로 생긴 리프레시 토큰)를 실제 DB에서 정리한다. RestAssured는 실제 HTTP라 트랜잭션 롤백이 없으므로 명시적
   * 삭제가 필요하다. User 엔티티의 refreshTokens는 cascade/orphanRemoval 로 함께 삭제된다.
   */
  @AfterClass(alwaysRun = true)
  public void globalTeardown() {
    for (User u : new User[] {testUser, regularUser, adminUser}) {
      if (u != null && u.getId() != null && userRepository.existsById(u.getId())) {
        try {
          userRepository.deleteById(u.getId());
        } catch (Exception e) {
          // 정리 실패는 테스트 결과에 영향 주지 않도록 무시(로그만)
          System.err.println("테스트 사용자 정리 실패: " + u.getUsername() + " - " + e.getMessage());
        }
      }
    }
  }

  private String loginAndGetToken(String username, String password) {
    Map<String, String> loginRequest = new HashMap<>();
    loginRequest.put("username", username);
    loginRequest.put("password", password);

    return given()
        .contentType(ContentType.JSON)
        .body(loginRequest)
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(200)
        .extract()
        .jsonPath()
        .getString("accessToken");
  }

  @Test
  @Story("사용자 목록 조회")
  @Description("관리자가 사용자 목록을 조회하고 JSON 스키마를 검증한다")
  public void testGetUsers_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-list-response-schema.json");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .param("page", "0")
        .param("size", "10")
        .when()
        .get("/api/admin/users")
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("totalElements", greaterThanOrEqualTo(3))
        .body("content", not(empty()));
  }

  @Test
  @Story("사용자 목록 조회")
  @Description("일반 사용자가 사용자 목록을 조회하려고 할 때 권한 오류가 발생한다")
  public void testGetUsers_Forbidden() {
    given()
        .header("Authorization", "Bearer " + regularUserToken)
        .when()
        .get("/api/admin/users")
        .then()
        .statusCode(403);
  }

  @Test
  @Story("사용자 상세 조회")
  @Description("관리자가 특정 사용자의 상세 정보를 조회하고 JSON 스키마를 검증한다")
  public void testGetUserById_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-detail-response-schema.json");

    // USER 역할의 사용자 찾기 (regularUser 사용)
    given()
        .header("Authorization", "Bearer " + adminToken)
        .when()
        .get("/api/admin/users/{userId}", regularUser.getId())
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("id", equalTo(regularUser.getId()))
        .body("username", equalTo(regularUser.getUsername()))
        .body("email", equalTo(regularUser.getEmail()))
        .body("name", equalTo(regularUser.getName()))
        .body("role", equalTo(regularUser.getRole()));
  }

  @Test
  @Story("사용자 상세 조회")
  @Description("존재하지 않는 사용자를 조회할 때 404 오류가 발생한다")
  public void testGetUserById_NotFound() {
    given()
        .header("Authorization", "Bearer " + adminToken)
        .when()
        .get("/api/admin/users/{userId}", "non-existent-id")
        .then()
        .statusCode(404);
  }

  @Test
  @Story("사용자 정보 수정")
  @Description("관리자가 사용자 정보를 수정하고 JSON 스키마를 검증한다")
  public void testUpdateUser_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-detail-response-schema.json");

    Map<String, String> updateRequest = new HashMap<>();
    String uniqueEmail = "updated_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com";
    updateRequest.put("email", uniqueEmail);
    updateRequest.put("name", "Updated Name");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .contentType(ContentType.JSON)
        .body(updateRequest)
        .when()
        .put("/api/admin/users/{userId}", testUser.getId())
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("email", equalTo(uniqueEmail))
        .body("name", equalTo("Updated Name"));
  }

  @Test
  @Story("사용자 계정 활성화")
  @Description("관리자가 사용자 계정을 활성화하고 JSON 스키마를 검증한다")
  public void testActivateUser_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-detail-response-schema.json");

    // 먼저 사용자를 비활성화
    testUser.setIsActive(false);
    userRepository.save(testUser);

    given()
        .header("Authorization", "Bearer " + adminToken)
        .contentType(ContentType.JSON)
        .when()
        .post("/api/admin/users/{userId}/activate", testUser.getId())
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("id", equalTo(testUser.getId()));
  }

  @Test
  @Story("사용자 계정 비활성화")
  @Description("관리자가 사용자 계정을 비활성화하고 JSON 스키마를 검증한다")
  public void testDeactivateUser_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-detail-response-schema.json");

    Map<String, String> deactivationRequest = new HashMap<>();
    deactivationRequest.put("reason", "테스트 비활성화");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .contentType(ContentType.JSON)
        .body(deactivationRequest)
        .when()
        .post("/api/admin/users/{userId}/deactivate", testUser.getId())
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream));
  }

  @Test
  @Story("사용자 역할 변경")
  @Description("관리자가 사용자 역할을 변경하고 JSON 스키마를 검증한다")
  public void testChangeUserRole_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-detail-response-schema.json");

    Map<String, String> roleRequest = new HashMap<>();
    roleRequest.put("role", "ADMIN");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .contentType(ContentType.JSON)
        .body(roleRequest)
        .when()
        .put("/api/admin/users/{userId}/role", testUser.getId())
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("role", equalTo("ADMIN"));
  }

  @Test
  @Story("사용자 통계 조회")
  @Description("관리자가 사용자 통계를 조회하고 JSON 스키마를 검증한다")
  public void testGetUserStatistics_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-statistics-response-schema.json");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .when()
        .get("/api/admin/users/statistics")
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("totalUsers", greaterThanOrEqualTo(3))
        .body("adminUsers", greaterThanOrEqualTo(1));
  }

  @Test
  @Story("검색 기능")
  @Description("관리자가 키워드로 사용자를 검색하고 JSON 스키마를 검증한다")
  public void testSearchUsers_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-list-response-schema.json");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .param("keyword", "Target")
        .param("page", "0")
        .param("size", "10")
        .when()
        .get("/api/admin/users")
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream))
        .body("totalElements", greaterThanOrEqualTo(1));
  }

  @Test
  @Story("필터 기능")
  @Description("관리자가 역할과 활성 상태로 사용자를 필터링하고 JSON 스키마를 검증한다")
  public void testFilterUsers_Success() throws Exception {
    InputStream schemaStream =
        getClass().getResourceAsStream("/schemas/user-list-response-schema.json");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .param("role", "ADMIN")
        .param("isActive", "true")
        .param("page", "0")
        .param("size", "10")
        .when()
        .get("/api/admin/users")
        .then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body(JsonSchemaValidator.matchesJsonSchema(schemaStream));
  }

  @Test
  @Story("권한 검증")
  @Description("자신의 역할을 변경하려고 할 때 오류가 발생한다")
  public void testChangeOwnRole_BadRequest() {
    Map<String, String> roleRequest = new HashMap<>();
    roleRequest.put("role", "USER");

    given()
        .header("Authorization", "Bearer " + adminToken)
        .contentType(ContentType.JSON)
        .body(roleRequest)
        .when()
        .put("/api/admin/users/{userId}/role", adminUser.getId())
        .then()
        .statusCode(400);
  }

  @Test
  @Story("권한 검증")
  @Description("자신의 계정을 비활성화하려고 할 때 오류가 발생한다")
  public void testDeactivateOwnAccount_BadRequest() {
    given()
        .header("Authorization", "Bearer " + adminToken)
        .contentType(ContentType.JSON)
        .when()
        .post("/api/admin/users/{userId}/deactivate", adminUser.getId())
        .then()
        .statusCode(400);
  }
}
