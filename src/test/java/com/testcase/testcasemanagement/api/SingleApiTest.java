package com.testcase.testcasemanagement.api;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.notNullValue;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("단일 API 테스트")
@Feature("인프라 연결 검증")
@ActiveProfiles("test")
public class SingleApiTest extends AbstractTestNGSpringContextTests {

  @LocalServerPort private int port;

  @Autowired private com.testcase.testcasemanagement.repository.UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  private String testUsername;
  private String testPassword = "password123";
  private static boolean restAssuredConfigured = false;

  @BeforeMethod(alwaysRun = true)
  public void globalSetup() {
    if (port > 0) {
      RestAssured.port = port;
      RestAssured.baseURI = "http://localhost";

      // 테스트용 고유 사용자 생성
      String uniqueId = UUID.randomUUID().toString().substring(0, 8);
      testUsername = "api_test_user_" + uniqueId;

      com.testcase.testcasemanagement.model.User user =
          new com.testcase.testcasemanagement.model.User();
      user.setUsername(testUsername);
      user.setPassword(passwordEncoder.encode(testPassword));
      user.setName("API Test User");
      user.setEmail(testUsername + "@example.com");
      user.setRole("ADMIN");
      user.setIsActive(true);
      user.setEmailVerified(true);
      userRepository.save(user);

      if (!restAssuredConfigured) {
        RestAssured.filters(
            new RequestLoggingFilter(), new ResponseLoggingFilter(), new AllureRestAssured());

        restAssuredConfigured = true;
      }
    } else {
      throw new RuntimeException("Server port not initialized!");
    }
  }

  @Test(priority = 1)
  @Story("사용자 인증")
  @Description("사용자 로그인 API 테스트 - 인프라 연결 확인용")
  public void testAuthLogin() {
    Map<String, String> loginRequest = new HashMap<>();
    loginRequest.put("username", testUsername);
    loginRequest.put("password", testPassword);

    given()
        .contentType(ContentType.JSON)
        .body(loginRequest)
        .when()
        .post("/api/auth/login")
        .then()
        .statusCode(200)
        .body("accessToken", notNullValue())
        .body("refreshToken", notNullValue())
        .body("accessTokenExpiration", greaterThan(0));
  }
}
