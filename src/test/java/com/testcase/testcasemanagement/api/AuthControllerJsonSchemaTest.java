// src/test/java/com/testcase/testcasemanagement/api/AuthControllerJsonSchemaTest.java
package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.module.jsv.JsonSchemaValidator;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("API 테스트")
@Feature("사용자 인증 및 관리")
@ActiveProfiles("test")
public class AuthControllerJsonSchemaTest extends AbstractTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String registerSchema;
    private String loginSchema;
    private String userInfoSchema;
    private String jwtToken;

    @BeforeClass
    public void globalSetup() throws Exception {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";

        RestAssured.filters(
                new RequestLoggingFilter(), // 요청 로깅
                new ResponseLoggingFilter() // 응답 로깅
        );

        // Schema loading
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/auth-register-schema.json")) {
            registerSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/auth-login-schema.json")) {
            loginSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        try (InputStream is = getClass().getClassLoader().getResourceAsStream("schemas/auth-userinfo-schema.json")) {
            userInfoSchema = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        // Get JWT Token
        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "admin123");

        jwtToken = given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract().path("token");
    }

    @Test(priority = 1)
    @Story("사용자 등록")
    @Severity(SeverityLevel.CRITICAL)
    @Description("새 사용자 등록 및 응답 구조 검증")
    public void registerUserTest() {
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
                .body("message", equalTo("User registered successfully"));
    }

    @Test(priority = 1, dependsOnMethods = "registerUserTest")
    @Story("사용자 등록 실패 케이스")
    @Severity(SeverityLevel.CRITICAL)
    @Description("중복 사용자명으로 등록 시도 시 실패 검증")
    public void registerUserWithExistingUsernameTest() {
        // 기존 테스트에서 사용한 동일한 요청 본문 재사용
        Map<String, Object> existingUser = new HashMap<>();
        existingUser.put("username", "testuser_" + System.currentTimeMillis()); // 동적 사용자명 생성
        existingUser.put("password", "Test1234!");
        existingUser.put("name", "Test User");
        existingUser.put("email", "test@example.com");

        // 1. 정상 등록
        given()
                .contentType(ContentType.JSON)
                .body(existingUser)
                .post("/api/auth/register");

        // 2. 중복 등록 시도
        given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .body(existingUser)
                .when()
                .post("/api/auth/register")
                .then()
                .statusCode(400) // 400 Bad Request
                .body(JsonSchemaValidator.matchesJsonSchema(registerSchema))
                .body("message", equalTo("Username already exists"))
                .body("username", equalTo(existingUser.get("username")));
    }

    @Test(priority = 2)
    @Story("로그인 기능")
    @Severity(SeverityLevel.CRITICAL)
    @Description("JWT 토큰 발급 검증")
    public void loginTest() {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("username", "admin");
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
                .body("token", notNullValue())
                .body("expiration", notNullValue());
    }

    @Test(priority = 3)
    @Story("사용자 정보 조회")
    @Severity(SeverityLevel.NORMAL)
    @Description("인증된 사용자 정보 조회 검증")
    public void getMyInfoTest() {
        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/auth/me")
                .then()
                .statusCode(200)
                .body(JsonSchemaValidator.matchesJsonSchema(userInfoSchema))
                .body("username", equalTo("admin"))
                .body("role", equalTo("ADMIN"));
    }

    @Test(priority = 4)
    @Story("사용자 정보 수정")
    @Severity(SeverityLevel.NORMAL)
    @Description("사용자 프로필 업데이트 검증")
    public void updateMyInfoTest() {
        Map<String, String> updateRequest = new HashMap<>();
        updateRequest.put("name", "Updated Name");
        updateRequest.put("email", "updated@example.com");

        given()
                .filter(new AllureRestAssured())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(ContentType.JSON)
                .body(updateRequest)
                .when()
                .put("/api/auth/me")
                .then()
                .statusCode(200)
                .body(JsonSchemaValidator.matchesJsonSchema(userInfoSchema))
                .body("name", equalTo("Updated Name"))
                .body("email", equalTo("updated@example.com"));
    }
}
