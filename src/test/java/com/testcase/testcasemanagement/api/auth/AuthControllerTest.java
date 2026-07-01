// src/test/java/com/testcase/testcasemanagement/api/auth/AuthControllerTest.java
package com.testcase.testcasemanagement.api.auth;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.module.jsv.JsonSchemaValidator;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * AuthController API 통합 테스트
 *
 * <p>테스트 범위: - 회원가입 (성공/실패 케이스) - 로그인 (성공/실패 케이스) - 내 정보 조회/수정 - 토큰 갱신/검증 - 로그아웃 - 비밀번호 변경 - 선호 언어
 * 설정
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("API 테스트")
@Feature("인증 및 사용자 관리")
@ActiveProfiles("test")
public class AuthControllerTest extends AbstractTestNGSpringContextTests {

  @LocalServerPort private int port;

  private String registerSchema;
  private String loginSchema;
  private String userInfoSchema;
  private String jwtToken;
  private String refreshToken;
  private String adminUsername; // @BeforeClass에서 생성한 관리자 username (로그인 테스트에서 사용)

  @Autowired private com.testcase.testcasemanagement.repository.UserRepository userRepository;

  @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

  @Autowired private JdbcTemplate jdbcTemplate;

  // 클래스 시작 시점에 이미 존재하던 username 스냅샷 — 종료 시 이 목록에 없는(=이 테스트가 만든) 사용자만 삭제한다.
  private Set<String> preExistingUsernames;

  @BeforeClass
  public void globalSetup() throws Exception {
    RestAssured.port = port;
    RestAssured.baseURI = "http://localhost";

    RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter());

    // 정리(teardown) 기준선: 이 테스트가 사용자를 만들기 "전"의 username 집합을 스냅샷.
    preExistingUsernames =
        new HashSet<>(jdbcTemplate.queryForList("SELECT username FROM users", String.class));

    // JSON Schema 로드
    try (InputStream is =
        getClass().getClassLoader().getResourceAsStream("schemas/auth/register-response.json")) {
      registerSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }

    try (InputStream is =
        getClass().getClassLoader().getResourceAsStream("schemas/auth/login-response.json")) {
      loginSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }

    try (InputStream is =
        getClass().getClassLoader().getResourceAsStream("schemas/auth/user-info.json")) {
      userInfoSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }

    // Admin 사용자 생성 또는 업데이트 (비밀번호 보장)
    // 테스트용 유니크 ID 생성
    String uniqueId = UUID.randomUUID().toString().substring(0, 8);
    adminUsername = "test_admin_" + uniqueId;
    String adminEmail = "admin_" + uniqueId + "@test.com";

    // Admin 사용자 생성
    com.testcase.testcasemanagement.model.User admin =
        new com.testcase.testcasemanagement.model.User();
    admin.setUsername(adminUsername);
    admin.setEmail(adminEmail);
    admin.setRole("ADMIN");
    admin.setCreatedAt(java.time.LocalDateTime.now());
    admin.setPassword(passwordEncoder.encode("admin123"));
    admin.setName("Administrator " + uniqueId);
    admin.setEmailVerified(true);
    admin.setUpdatedAt(java.time.LocalDateTime.now());
    userRepository.save(admin);

    // 관리자 로그인하여 JWT 토큰 발급
    Map<String, Object> loginRequest = new HashMap<>();
    loginRequest.put("username", adminUsername);
    loginRequest.put("password", "admin123");

    io.restassured.response.Response loginResponse =
        given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .extract()
            .response();

    jwtToken = loginResponse.path("accessToken");
    refreshToken = loginResponse.path("refreshToken");
  }

  /**
   * 이 테스트가 생성한 사용자(admin + 회원가입으로 만든 사용자들)와 그들이 남긴 refresh_token/audit_log를 실제 DB에서 정리한다.
   * RestAssured가 실제 HTTP(RANDOM_PORT)라 트랜잭션 롤백이 없으므로 명시적 삭제가 필요하다. 시작 스냅샷에 없던 username 만 삭제하므로 기존
   * 사용자는 보존된다. FK 순서: audit_logs(performed_by) → refresh_tokens(user_id) → users.
   */
  @AfterClass(alwaysRun = true)
  public void globalTeardown() {
    if (preExistingUsernames == null) {
      return;
    }
    List<String> current = jdbcTemplate.queryForList("SELECT username FROM users", String.class);
    for (String username : current) {
      if (preExistingUsernames.contains(username)) {
        continue; // 이 테스트가 만든 게 아니면 건드리지 않는다
      }
      try {
        jdbcTemplate.update(
            "DELETE FROM audit_logs WHERE performed_by = (SELECT id FROM users WHERE username = ?)",
            username);
        jdbcTemplate.update(
            "DELETE FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE username = ?)",
            username);
        jdbcTemplate.update("DELETE FROM users WHERE username = ?", username);
      } catch (Exception e) {
        System.err.println("AuthControllerTest 사용자 정리 실패: " + username + " - " + e.getMessage());
      }
    }
  }

  // ========== 회원가입 테스트 ==========

  @Test(priority = 1)
  @Story("회원가입")
  @Severity(SeverityLevel.CRITICAL)
  @Description("정상적인 회원가입 요청 시 성공 응답 검증")
  public void testRegister_Success() {
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("username", "testuser_" + System.currentTimeMillis());
    requestBody.put("password", "Test1234!");
    requestBody.put("name", "Test User");
    requestBody.put("email", "test@example.com");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(requestBody)
        .when()
        .post("/api/auth/register")
        .then()
        .statusCode(200)
        .body(JsonSchemaValidator.matchesJsonSchema(registerSchema))
        .body("message", equalTo("User registered successfully"))
        .body("username", equalTo(requestBody.get("username")))
        .body("name", equalTo(requestBody.get("name")))
        .body("email", equalTo(requestBody.get("email")));
  }

  @Test(priority = 1)
  @Story("회원가입")
  @Severity(SeverityLevel.CRITICAL)
  @Description("중복된 사용자명으로 회원가입 시도 시 409 + 친화적 메시지 반환")
  public void testRegister_DuplicateUsername_ShouldReturn409() {
    String duplicateUsername = "duplicate_" + System.currentTimeMillis();
    String firstEmail = "first_" + System.currentTimeMillis() + "@example.com";
    String secondEmail = "second_" + System.currentTimeMillis() + "@example.com";

    Map<String, Object> firstUser = new HashMap<>();
    firstUser.put("username", duplicateUsername);
    firstUser.put("password", "Test1234!");
    firstUser.put("name", "First User");
    firstUser.put("email", firstEmail);

    // 1. 첫 번째 사용자 등록 (성공)
    given()
        .contentType(ContentType.JSON)
        .body(firstUser)
        .post("/api/auth/register")
        .then()
        .statusCode(200);

    // 2. 동일한 사용자명으로 재등록 시도 (실패)
    Map<String, Object> duplicateUser = new HashMap<>();
    duplicateUser.put("username", duplicateUsername);
    duplicateUser.put("password", "Test5678!");
    duplicateUser.put("name", "Duplicate User");
    duplicateUser.put("email", secondEmail);

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(duplicateUser)
        .when()
        .post("/api/auth/register")
        .then()
        .statusCode(409)
        .body("field", equalTo("username"))
        .body("message", equalTo("이미 사용 중인 사용자 이름입니다."))
        .body("username", equalTo(duplicateUsername));
  }

  @Test(priority = 1)
  @Story("회원가입")
  @Severity(SeverityLevel.CRITICAL)
  @Description("중복된 이메일로 회원가입 시도 시 409 + 친화적 메시지 반환 (PG raw 메시지 노출 금지)")
  public void testRegister_DuplicateEmail_ShouldReturn409() {
    String sharedEmail = "dup_email_" + System.currentTimeMillis() + "@example.com";

    Map<String, Object> firstUser = new HashMap<>();
    firstUser.put("username", "first_" + System.currentTimeMillis());
    firstUser.put("password", "Test1234!");
    firstUser.put("name", "First User");
    firstUser.put("email", sharedEmail);

    // 1. 첫 번째 사용자 등록 (성공)
    given()
        .contentType(ContentType.JSON)
        .body(firstUser)
        .post("/api/auth/register")
        .then()
        .statusCode(200);

    // 2. 동일한 이메일·다른 사용자명으로 재등록 시도 (실패)
    Map<String, Object> duplicateEmailUser = new HashMap<>();
    duplicateEmailUser.put("username", "second_" + System.currentTimeMillis());
    duplicateEmailUser.put("password", "Test5678!");
    duplicateEmailUser.put("name", "Second User");
    duplicateEmailUser.put("email", sharedEmail);

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(duplicateEmailUser)
        .when()
        .post("/api/auth/register")
        .then()
        .statusCode(409)
        .body("field", equalTo("email"))
        .body("message", equalTo("이미 등록된 이메일입니다."))
        .body("email", equalTo(sharedEmail))
        // PG raw 메시지가 노출되지 않아야 한다 (regression guard)
        .body("message", not(containsString("duplicate key")))
        .body("message", not(containsString("uk_")));
  }

  @Test(priority = 1)
  @Story("회원가입")
  @Severity(SeverityLevel.NORMAL)
  @Description("필수 필드(username) 누락 시 400 에러 반환")
  public void testRegister_MissingUsername_ShouldReturn400() {
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("password", "Test1234!");
    requestBody.put("name", "Test User");
    requestBody.put("email", "test@example.com");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(requestBody)
        .when()
        .post("/api/auth/register")
        .then()
        .statusCode(400)
        .body("message", containsString("required"));
  }

  @Test(priority = 1)
  @Story("회원가입")
  @Severity(SeverityLevel.NORMAL)
  @Description("필수 필드(password) 누락 시 400 에러 반환")
  public void testRegister_MissingPassword_ShouldReturn400() {
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("username", "testuser_" + System.currentTimeMillis());
    requestBody.put("name", "Test User");
    requestBody.put("email", "test@example.com");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(requestBody)
        .when()
        .post("/api/auth/register")
        .then()
        .statusCode(400)
        .body("message", containsString("required"));
  }

  // ========== 로그인 테스트 ==========

  @Test(priority = 2)
  @Story("로그인")
  @Severity(SeverityLevel.CRITICAL)
  @Description("정상적인 로그인 시 JWT 토큰 발급 검증")
  public void testLogin_Success() {
    // @BeforeClass에서 생성한 실제 관리자 계정으로 로그인한다(고정 시드유저 "test_admin"과 혼동 금지).
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("username", adminUsername);
    requestBody.put("password", "admin123");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(requestBody)
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(200)
        .body(JsonSchemaValidator.matchesJsonSchema(loginSchema))
        .body("accessToken", notNullValue())
        .body("refreshToken", notNullValue())
        .body("tokenType", equalTo("Bearer"))
        .body("accessTokenExpiration", is(notNullValue()))
        .body("refreshTokenExpiration", greaterThan(0L))
        .body("user.username", equalTo(adminUsername))
        .body("user.role", equalTo("ADMIN"));
  }

  @Test(priority = 2)
  @Story("로그인")
  @Severity(SeverityLevel.CRITICAL)
  @Description("존재하지 않는 사용자명으로 로그인 시도 시 401 에러 반환")
  public void testLogin_InvalidUsername_ShouldReturn401() {
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("username", "nonexistent_user");
    requestBody.put("password", "anypassword");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(requestBody)
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(401)
        .body("errorCode", equalTo("INVALID_CREDENTIALS"))
        .body("message", containsString("올바르지 않습니다"));
  }

  @Test(priority = 2)
  @Story("로그인")
  @Severity(SeverityLevel.CRITICAL)
  @Description("잘못된 비밀번호로 로그인 시도 시 401 에러 반환")
  public void testLogin_InvalidPassword_ShouldReturn401() {
    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("username", "admin");
    requestBody.put("password", "wrongpassword");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(requestBody)
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(401)
        .body("errorCode", equalTo("INVALID_CREDENTIALS"));
  }

  // ========== 내 정보 조회 테스트 ==========

  @Test(priority = 3)
  @Story("사용자 정보")
  @Severity(SeverityLevel.NORMAL)
  @Description("인증된 사용자의 정보 조회 성공")
  public void testGetMyInfo_Success() {
    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + jwtToken)
        .when()
        .get("/api/auth/me")
        .then()
        .log()
        .ifError()
        .statusCode(200)
        .body(JsonSchemaValidator.matchesJsonSchema(userInfoSchema))
        .body("username", startsWith("test_admin_"))
        .body("role", equalTo("ADMIN"))
        .body("name", notNullValue())
        .body("email", notNullValue());
  }

  @Test(priority = 3)
  @Story("사용자 정보")
  @Severity(SeverityLevel.CRITICAL)
  @Description("인증 없이 내 정보 조회 시도 시 401 에러 반환")
  public void testGetMyInfo_Unauthorized_ShouldReturn401() {
    given().filter(new AllureRestAssured()).when().get("/api/auth/me").then().statusCode(401);
  }

  @Test(priority = 3)
  @Story("사용자 정보")
  @Severity(SeverityLevel.CRITICAL)
  @Description("만료된 토큰으로 내 정보 조회 시도 시 401 에러 반환")
  public void testGetMyInfo_ExpiredToken_ShouldReturn401() {
    String expiredToken =
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTYwMDAwMDAwMH0.invalid";

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + expiredToken)
        .when()
        .get("/api/auth/me")
        .then()
        .statusCode(401);
  }

  // ========== 내 정보 수정 테스트 ==========

  @Test(priority = 4)
  @Story("사용자 정보")
  @Severity(SeverityLevel.NORMAL)
  @Description("사용자 프로필 정보 수정 성공")
  public void testUpdateMyInfo_Success() {
    Map<String, String> updateRequest = new HashMap<>();
    updateRequest.put("name", "Updated Admin Name");
    updateRequest.put("email", "updated_admin@example.com");
    updateRequest.put("timezone", "Asia/Seoul");

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + jwtToken)
        .contentType(ContentType.JSON)
        .body(updateRequest)
        .when()
        .put("/api/auth/me")
        .then()
        .statusCode(200)
        .body("name", equalTo("Updated Admin Name"))
        .body("email", equalTo("updated_admin@example.com"))
        .body("timezone", equalTo("Asia/Seoul"));
  }

  @Test(priority = 4)
  @Story("사용자 정보")
  @Severity(SeverityLevel.NORMAL)
  @Description("인증 없이 정보 수정 시도 시 401 에러 반환")
  public void testUpdateMyInfo_Unauthorized_ShouldReturn401() {
    Map<String, String> updateRequest = new HashMap<>();
    updateRequest.put("name", "Hacker");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(updateRequest)
        .when()
        .put("/api/auth/me")
        .then()
        .statusCode(401);
  }

  // ========== 토큰 갱신 테스트 ==========

  @Test(priority = 5)
  @Story("토큰 관리")
  @Severity(SeverityLevel.CRITICAL)
  @Description("유효한 Refresh Token으로 새 Access Token 발급 성공")
  public void testRefreshToken_Success() {
    Map<String, String> request = new HashMap<>();
    request.put("refreshToken", refreshToken);

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/api/auth/refresh")
        .then()
        .statusCode(200)
        .body("accessToken", notNullValue())
        .body("tokenType", equalTo("Bearer"))
        .body("accessTokenExpiration", greaterThan(0));
  }

  @Test(priority = 5)
  @Story("토큰 관리")
  @Severity(SeverityLevel.CRITICAL)
  @Description("Refresh Token 누락 시 400 에러 반환")
  public void testRefreshToken_MissingToken_ShouldReturn400() {
    Map<String, String> request = new HashMap<>();

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/api/auth/refresh")
        .then()
        .statusCode(400)
        .body("message", containsString("Refresh Token이 필요합니다"));
  }

  @Test(priority = 5)
  @Story("토큰 관리")
  @Severity(SeverityLevel.CRITICAL)
  @Description("유효하지 않은 Refresh Token으로 갱신 시도 시 401 에러 반환")
  public void testRefreshToken_InvalidToken_ShouldReturn401() {
    Map<String, String> request = new HashMap<>();
    request.put("refreshToken", "invalid_refresh_token_12345");

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/api/auth/refresh")
        .then()
        .statusCode(401)
        .body("message", containsString("유효하지 않은"));
  }

  // ========== 로그아웃 테스트 ==========

  @Test(priority = 6)
  @Story("로그아웃")
  @Severity(SeverityLevel.NORMAL)
  @Description("정상적인 로그아웃 처리 성공")
  public void testLogout_Success() {
    // 새로운 사용자 생성 및 로그인
    String testUsername = "logout_test_" + System.currentTimeMillis();
    Map<String, Object> registerRequest = new HashMap<>();
    registerRequest.put("username", testUsername);
    registerRequest.put("password", "Test1234!");
    registerRequest.put("name", "Logout Test User");
    registerRequest.put("email", "logout@example.com");

    given().contentType(ContentType.JSON).body(registerRequest).post("/api/auth/register");

    Map<String, Object> loginRequest = new HashMap<>();
    loginRequest.put("username", testUsername);
    loginRequest.put("password", "Test1234!");

    io.restassured.response.Response loginResponse =
        given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .extract()
            .response();

    String testRefreshToken = loginResponse.path("refreshToken");

    // 로그아웃
    Map<String, String> logoutRequest = new HashMap<>();
    logoutRequest.put("refreshToken", testRefreshToken);

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(logoutRequest)
        .when()
        .post("/api/auth/logout")
        .then()
        .statusCode(200)
        .body("message", containsString("로그아웃이 완료되었습니다"));
  }

  // ========== 비밀번호 변경 테스트 ==========

  @Test(priority = 7)
  @Story("비밀번호 관리")
  @Severity(SeverityLevel.CRITICAL)
  @Description("정상적인 비밀번호 변경 성공")
  public void testChangePassword_Success() {
    // 새로운 사용자 생성
    String testUsername = "password_test_" + System.currentTimeMillis();
    Map<String, Object> registerRequest = new HashMap<>();
    registerRequest.put("username", testUsername);
    registerRequest.put("password", "OldPassword123!");
    registerRequest.put("name", "Password Test User");
    registerRequest.put("email", "password@example.com");

    given().contentType(ContentType.JSON).body(registerRequest).post("/api/auth/register");

    // 로그인
    Map<String, Object> loginRequest = new HashMap<>();
    loginRequest.put("username", testUsername);
    loginRequest.put("password", "OldPassword123!");

    String userToken =
        given()
            .contentType(ContentType.JSON)
            .body(loginRequest)
            .post("/api/auth/login")
            .then()
            .statusCode(200)
            .extract()
            .path("accessToken");

    // 비밀번호 변경
    Map<String, String> changePasswordRequest = new HashMap<>();
    changePasswordRequest.put("currentPassword", "OldPassword123!");
    changePasswordRequest.put("newPassword", "NewPassword456!");

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + userToken)
        .contentType(ContentType.JSON)
        .body(changePasswordRequest)
        .when()
        .put("/api/auth/change-password")
        .then()
        .statusCode(200)
        .body("message", containsString("성공적으로 변경되었습니다"));

    // 새 비밀번호로 로그인 확인
    Map<String, Object> newLoginRequest = new HashMap<>();
    newLoginRequest.put("username", testUsername);
    newLoginRequest.put("password", "NewPassword456!");

    given()
        .contentType(ContentType.JSON)
        .body(newLoginRequest)
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(200);
  }

  @Test(priority = 7)
  @Story("비밀번호 관리")
  @Severity(SeverityLevel.CRITICAL)
  @Description("현재 비밀번호 오류 시 400 에러 반환")
  public void testChangePassword_WrongCurrentPassword_ShouldReturn400() {
    Map<String, String> changePasswordRequest = new HashMap<>();
    changePasswordRequest.put("currentPassword", "WrongPassword!");
    changePasswordRequest.put("newPassword", "NewPassword456!");

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + jwtToken)
        .contentType(ContentType.JSON)
        .body(changePasswordRequest)
        .when()
        .put("/api/auth/change-password")
        .then()
        .statusCode(400);
  }

  @Test(priority = 7)
  @Story("비밀번호 관리")
  @Severity(SeverityLevel.NORMAL)
  @Description("현재 비밀번호 누락 시 400 에러 반환")
  public void testChangePassword_MissingCurrentPassword_ShouldReturn400() {
    Map<String, String> changePasswordRequest = new HashMap<>();
    changePasswordRequest.put("newPassword", "NewPassword456!");

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + jwtToken)
        .contentType(ContentType.JSON)
        .body(changePasswordRequest)
        .when()
        .put("/api/auth/change-password")
        .then()
        .statusCode(400)
        .body("message", containsString("현재 비밀번호"));
  }

  // ========== 선호 언어 설정 테스트 ==========

  @Test(priority = 8)
  @Story("사용자 설정")
  @Severity(SeverityLevel.NORMAL)
  @Description("선호 언어 설정 성공")
  public void testUpdatePreferredLanguage_Success() {
    Map<String, String> request = new HashMap<>();
    request.put("languageCode", "en");

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + jwtToken)
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .put("/api/auth/preferred-language")
        .then()
        .statusCode(200)
        .body("message", containsString("성공적으로 업데이트"))
        .body("preferredLanguage", equalTo("en"));
  }

  @Test(priority = 8)
  @Story("사용자 설정")
  @Severity(SeverityLevel.NORMAL)
  @Description("언어 코드 누락 시 400 에러 반환")
  public void testUpdatePreferredLanguage_MissingCode_ShouldReturn400() {
    Map<String, String> request = new HashMap<>();

    given()
        .filter(new AllureRestAssured())
        .header("Authorization", "Bearer " + jwtToken)
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .put("/api/auth/preferred-language")
        .then()
        .statusCode(400)
        .body("message", containsString("언어 코드가 필요합니다"));
  }

  // ========== 토큰 검증 테스트 ==========

  @Test(priority = 9)
  @Story("토큰 관리")
  @Severity(SeverityLevel.NORMAL)
  @Description("유효한 Access Token 검증 성공")
  public void testValidateToken_ValidAccessToken() {
    Map<String, String> request = new HashMap<>();
    request.put("accessToken", jwtToken);

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/api/auth/validate")
        .then()
        .statusCode(200)
        .body("accessToken.valid", equalTo(true))
        .body("accessToken.username", startsWith("test_admin_"));
  }

  @Test(priority = 9)
  @Story("토큰 관리")
  @Severity(SeverityLevel.NORMAL)
  @Description("유효한 Refresh Token 검증 성공")
  public void testValidateToken_ValidRefreshToken() {
    Map<String, String> request = new HashMap<>();
    request.put("refreshToken", refreshToken);

    given()
        .filter(new AllureRestAssured())
        .contentType(ContentType.JSON)
        .body(request)
        .when()
        .post("/api/auth/validate")
        .then()
        .statusCode(200)
        .body("refreshToken.valid", equalTo(true));
  }
}
