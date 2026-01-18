// src/test/java/com/testcase/testcasemanagement/api/TestCaseControllerNameDuplicateTest.java

package com.testcase.testcasemanagement.api;

import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.*;

import java.util.*;

import static io.restassured.RestAssured.given;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class TestCaseControllerNameDuplicateTest extends AbstractTestNGSpringContextTests {

    @LocalServerPort
    private int port;

    private String jwtToken;
    private final List<String> createdProjectIds = new ArrayList<>();

    @BeforeClass
    public void globalSetup() {
        RestAssured.port = port;
        RestAssured.baseURI = "http://localhost";
        RestAssured.filters(new RequestLoggingFilter(), new ResponseLoggingFilter());

        // JWT 인증
        Map<String, Object> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "admin123");

        jwtToken = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract().path("token");
    }

    @AfterMethod
    public void cleanUpProjects() {
        for (String projectId : createdProjectIds) {
            deleteProject(projectId);
        }
        createdProjectIds.clear();
    }

    private String createTestProject() {
        String uniqueCode = "DUP-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> projectRequest = new HashMap<>();
        projectRequest.put("name", "중복테스트 프로젝트");
        projectRequest.put("code", uniqueCode);

        Response response = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(projectRequest)
                .when()
                .post("/api/projects")
                .then()
                .statusCode(201)
                .extract().response();

        String projectId = response.path("id");
        createdProjectIds.add(projectId);
        return projectId;
    }

    private String createFolder(String projectId, String name, String parentId) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", name);
        requestBody.put("type", "folder");
        requestBody.put("projectId", projectId);
        if (parentId != null) requestBody.put("parentId", parentId);

        Response response = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(requestBody)
                .when()
                .post("/api/testcases")
                .then()
                .statusCode(201)
                .extract().response();

        return response.path("id");
    }

    private String createTestCase(String projectId, String name, String parentId) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", name);
        requestBody.put("type", "testcase");
        requestBody.put("projectId", projectId);
        requestBody.put("expectedResults", "결과");
        requestBody.put("description", "설명");
        if (parentId != null) requestBody.put("parentId", parentId);

        Response response = given()
                .filter(new AllureRestAssured())
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + jwtToken)
                .body(requestBody)
                .when()
                .post("/api/testcases")
                .then()
                .statusCode(201)
                .extract().response();

        return response.path("id");
    }

    private void deleteTestCase(String testCaseId) {
        try {
            given()
                    .filter(new AllureRestAssured())
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .delete("/api/testcases/" + testCaseId);
        } catch (Exception ignore) {}
    }

    private void deleteProject(String projectId) {
        try {
            given()
                    .filter(new AllureRestAssured())
                    .header("Authorization", "Bearer " + jwtToken)
                    .when()
                    .delete("/api/projects/" + projectId);
        } catch (Exception ignore) {}
    }

    @Test(description = "동일한 폴더 이름이 중복될 경우 정상적으로 각각 추가되는지 검증")
    public void createFolderWithDuplicateName() {
        String projectId = createTestProject();

        // 동일한 부모 아래 폴더 이름 중복 허용 (type 기준)
        String folderId1 = createFolder(projectId, "중복폴더", null);
        String folderId2 = createFolder(projectId, "중복폴더", null);

        // 두 폴더의 id가 달라야 함
        assertNotEquals(folderId1, folderId2);

        deleteTestCase(folderId1);
        deleteTestCase(folderId2);
    }

    @Test(description = "동일한 테스트케이스 이름이 중복될 경우 정상적으로 각각 추가되는지 검증")
    public void createTestCaseWithDuplicateName() {
        String projectId = createTestProject();

        // 동일한 부모 아래 테스트케이스 이름 중복 허용 (type 기준)
        String tcId1 = createTestCase(projectId, "중복케이스", null);
        String tcId2 = createTestCase(projectId, "중복케이스", null);

        // 두 테스트케이스의 id가 달라야 함
        assertNotEquals(tcId1, tcId2);

        deleteTestCase(tcId1);
        deleteTestCase(tcId2);
    }

    @Test(description = "동일한 이름의 폴더와 테스트케이스가 각각 추가되는지 검증")
    public void createFolderAndTestCaseWithSameName() {
        String projectId = createTestProject();

        // 동일한 부모 아래 폴더와 테스트케이스가 같은 이름으로 각각 추가 가능해야 함
        String folderId = createFolder(projectId, "동일이름", null);
        String testCaseId = createTestCase(projectId, "동일이름", null);

        assertNotEquals(folderId, testCaseId);

        deleteTestCase(folderId);
        deleteTestCase(testCaseId);
    }

    private void assertNotEquals(String a, String b) {
        if (a == null || b == null) throw new AssertionError("ID가 null입니다");
        if (a.equals(b)) throw new AssertionError("ID가 같으면 안 됩니다: " + a);
    }
}
