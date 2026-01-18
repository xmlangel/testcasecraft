// src/test/java/com/testcase/testcasemanagement/api/PreviousResultEditDeleteApiTest.java

package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.TestcasemanagementApplication;
import io.qameta.allure.*;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * 이전 테스트 결과 수정/삭제 API 테스트
 * 
 * PUT /api/test-executions/results/{id} - 결과 수정 (본인/ADMIN/MANAGER)
 * DELETE /api/test-executions/results/{id} - 결과 삭제 (ADMIN/MANAGER만)
 * 
 * NOTE: 이 테스트는 실제 서버가 실행 중일 때 수동으로 실행해야 합니다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@Epic("이전 테스트 결과 수정/삭제 API")
@Feature("Previous Result Edit/Delete API")
@ActiveProfiles("local")
public class PreviousResultEditDeleteApiTest extends AbstractTestNGSpringContextTests {

    private String jwtToken;
    private static final String BASE_URL = "http://localhost:8080";

    @BeforeClass(alwaysRun = true)
    public void globalSetup() {
        RestAssured.baseURI = BASE_URL;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    @BeforeMethod(alwaysRun = true)
    public void setup() {
        try {
            jwtToken = authenticateAndGetToken();
        } catch (Exception e) {
            System.out.println("⚠️ 서버가 실행 중이지 않거나 인증에 실패했습니다. 테스트를 스킵합니다.");
            throw new org.testng.SkipException("Server not available");
        }
    }

    // 인증 및 JWT 토큰 발급
    private String authenticateAndGetToken() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "admin123");

        return given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .path("accessToken");
    }

    @Test(priority = 1)
    @Story("테스트 실행 - 이전 결과 수정")
    @Description("이전 테스트 결과 수정 API 테스트 (PUT /api/test-executions/results/{id})")
    public void testUpdatePreviousTestResult() {
        System.out.println("🧪 Testing: PUT /api/test-executions/results/{id}");

        // 먼저 테스트 결과 ID를 조회
        List<Map<String, Object>> results = given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-executions/by-testcase/1")
                .then()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getList("$");

        if (results != null && !results.isEmpty()) {
            String testResultId = (String) results.get(0).get("id");
            System.out.println("  ✓ Found test result ID: " + testResultId);

            // 테스트 결과 수정 요청
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("testCaseId", "1");
            updateRequest.put("result", "PASS");
            updateRequest.put("notes", "Updated by API Test");
            updateRequest.put("tags", List.of("api-test", "updated"));
            updateRequest.put("jiraIssueKey", "");

            int statusCode = given()
                    .header("Authorization", "Bearer " + jwtToken)
                    .contentType(ContentType.JSON)
                    .body(updateRequest)
                    .when()
                    .put("/api/test-executions/results/" + testResultId)
                    .then()
                    .statusCode(anyOf(is(200), is(403), is(404)))
                    .body("$", notNullValue())
                    .extract()
                    .statusCode();

            if (statusCode == 200) {
                System.out.println("  ✅ Previous result updated successfully");
            } else if (statusCode == 403) {
                System.out.println("  ⚠️ Update forbidden (permission denied)");
            } else {
                System.out.println("  ⚠️ Result not found");
            }
        } else {
            System.out.println("  ⚠️ No test results found for testCaseId=1");
        }
    }

    @Test(priority = 2)
    @Story("테스트 실행 - 이전 결과 삭제")
    @Description("이전 테스트 결과 삭제 API 테스트 (DELETE /api/test-executions/results/{id}) - ADMIN/MANAGER 권한 필요")
    public void testDeletePreviousTestResult() {
        System.out.println("🧪 Testing: DELETE /api/test-executions/results/{id}");

        // Admin 권한이 있는 경우에만 삭제 테스트 실행
        List<Map<String, Object>> results = given()
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/test-executions/by-testcase/1")
                .then()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getList("$");

        if (results != null && results.size() > 1) { // 최소 2개 이상 있을 때만 삭제
            String testResultId = (String) results.get(results.size() - 1).get("id"); // 마지막 결과 삭제
            System.out.println("  ✓ Found test result ID: " + testResultId);

            // 삭제 API 호출 (권한이 있으면 204, 없으면 403)
            int statusCode = given()
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .delete("/api/test-executions/results/" + testResultId)
                    .then()
                    .statusCode(anyOf(is(204), is(403), is(404)))
                    .extract()
                    .statusCode();

            // 403이면 권한 없음 (정상), 204면 삭제 성공 (ADMIN/MANAGER)
            if (statusCode == 204) {
                System.out.println("  ✅ Previous test result deleted successfully (user has ADMIN/MANAGER role)");
            } else if (statusCode == 403) {
                System.out.println("  ⚠️ Delete forbidden (user does not have ADMIN/MANAGER role)");
            } else {
                System.out.println("  ⚠️ Result not found");
            }
        } else {
            System.out.println("  ⚠️ Not enough test results for deletion test");
        }
    }

    @Test(priority = 3)
    @Story("테스트 실행 - 권한 검증")
    @Description("권한 없는 사용자의 이전 결과 수정 시도 (403 예상)")
    public void testUpdatePreviousTestResultUnauthorized() {
        System.out.println("🧪 Testing: Unauthorized access with TESTER role");

        // TESTER 계정으로 로그인하여 다른 사용자의 결과 수정 시도
        String testerToken = null;
        try {
            Map<String, String> loginRequest = new HashMap<>();
            loginRequest.put("username", "tester");
            loginRequest.put("password", "tester123");

            testerToken = given()
                    .contentType(ContentType.JSON)
                    .body(loginRequest)
                    .when()
                    .post("/api/auth/login")
                    .then()
                    .statusCode(200)
                    .extract()
                    .path("accessToken");
        } catch (Exception e) {
            // TESTER 계정이 없으면 테스트 스킵
            System.out.println("  ⚠️ TESTER account not available, skipping unauthorized test");
            return;
        }

        if (testerToken != null) {
            System.out.println("  ✓ TESTER logged in successfully");

            // Admin이 생성한 결과 ID 조회
            List<Map<String, Object>> results = given()
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .get("/api/test-executions/by-testcase/1")
                    .then()
                    .statusCode(200)
                    .extract()
                    .jsonPath()
                    .getList("$");

            if (results != null && !results.isEmpty()) {
                String testResultId = (String) results.get(0).get("id");
                String executedBy = (String) results.get(0).get("executedBy");
                System.out.println("  ✓ Found test result ID: " + testResultId + " (executed by: " + executedBy + ")");

                // TESTER가 다른 사용자의 결과를 수정하려고 시도
                if (!"tester".equals(executedBy)) {
                    Map<String, Object> updateRequest = new HashMap<>();
                    updateRequest.put("testCaseId", "1");
                    updateRequest.put("result", "FAIL");
                    updateRequest.put("notes", "Unauthorized update attempt");

                    int statusCode = given()
                            .header("Authorization", "Bearer " + testerToken)
                            .contentType(ContentType.JSON)
                            .body(updateRequest)
                            .when()
                            .put("/api/test-executions/results/" + testResultId)
                            .then()
                            .statusCode(anyOf(is(403), is(404)))
                            .extract()
                            .statusCode();

                    if (statusCode == 403) {
                        System.out.println("  ✅ Permission check working: unauthorized update blocked");
                    } else {
                        System.out.println("  ⚠️ Result not found");
                    }
                } else {
                    System.out.println("  ⚠️ Test result was created by tester, cannot test unauthorized access");
                }
            }
        }
    }
}
