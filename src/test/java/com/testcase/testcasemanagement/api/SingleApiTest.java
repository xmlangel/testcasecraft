package com.testcase.testcasemanagement.api;

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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.notNullValue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("단일 API 테스트")
@Feature("인프라 연결 검증")
@ActiveProfiles("test")
public class SingleApiTest extends AbstractTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private static boolean restAssuredConfigured = false;

    @BeforeMethod(alwaysRun = true)
    public void globalSetup() {
        // RestAssured 설정: port가 주입된 후 설정
        if (port > 0) {
            RestAssured.port = port;
            RestAssured.baseURI = "http://localhost";

            waitForServerReady();

            if (!restAssuredConfigured) {
                RestAssured.filters(
                        new RequestLoggingFilter(),
                        new ResponseLoggingFilter(),
                        new AllureRestAssured());

                restAssuredConfigured = true;
            }
        } else {
            throw new RuntimeException("Server port not initialized!");
        }
    }

    private void waitForServerReady() {
        int maxRetries = 30;
        int delay = 1000; // 1 second

        for (int i = 0; i < maxRetries; i++) {
            try {
                // Try to connect to the server
                java.net.Socket socket = new java.net.Socket("localhost", port);
                socket.close();
                System.out.println("Server is ready on port " + port);
                return;
            } catch (Exception e) {
                System.out.println("Waiting for server to be ready on port " + port + "... (Attempt " + (i + 1) + "/"
                        + maxRetries + ")");
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting for server", ie);
                }
            }
        }
        throw new RuntimeException(
                "Server did not become ready on port " + port + " after " + maxRetries + " attempts");
    }

    @Test(priority = 1)
    @Story("사용자 인증")
    @Description("사용자 로그인 API 테스트 - 인프라 연결 확인용")
    public void testAuthLogin() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "test_admin"); // data-test.sql에 맞게 수정됨
        loginRequest.put("password", "admin123");

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
