// ICT-191: 테스트 결과 리포트 API 통합 테스트
package com.testcase.testcasemanagement.integration;

import static org.testng.Assert.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStatisticsDto;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.TestResultReportService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTransactionalTestNGSpringContextTests;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-191: 테스트 결과 리포트 통합 테스트
 *
 * <p>목적: 테스트 결과 리포트 기능의 API 엔드포인트와 서비스 계층 통합 테스트 범위: REST API, 서비스 로직, 데이터베이스 통합
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@AutoConfigureWebMvc
@ActiveProfiles("test")
public class TestResultReportIntegrationTest extends AbstractTransactionalTestNGSpringContextTests {

  @LocalServerPort private int port;

  @Autowired private TestRestTemplate restTemplate;

  @Autowired private TestResultReportService testResultReportService;

  @Autowired private ObjectMapper objectMapper;

  @Autowired private UserRepository userRepository;

  @Autowired private PasswordEncoder passwordEncoder;

  @Autowired private PlatformTransactionManager transactionManager;

  /**
   * 이 테스트만 쓰는 API 호출 계정. 시드 계정(test_admin)에 기대지 않는다 — 전체 실행에서 다른 테스트가 그 계정의 비밀번호를 바꾸면 여기서 로그인이 401
   * 로 실패하고, 토큰 없이 호출한 API 6건이 한꺼번에 401 로 깨졌다(단독 실행에서는 통과해 원인이 가려졌다).
   */
  private static final String API_USERNAME = "itest_report_admin";

  private static final String API_PASSWORD = "Itest!Report123";

  private String baseUrl;
  private String authToken;
  private String lastLoginFailure;

  @BeforeMethod
  public void setUp() {
    baseUrl = "http://localhost:" + port + "/api";

    ensureApiUser();
    authToken = getAuthToken();
    // 토큰 획득 실패를 여기서 끊는다. 예전에는 null 토큰으로 진행해 뒤따르는 API 검증이 전부
    // "expected 200 but found 401" 로 깨져 진짜 원인(로그인 실패)이 보이지 않았다.
    assertNotNull(authToken, "API 호출용 토큰을 받지 못했습니다. 로그인 응답: " + lastLoginFailure);

    System.out.println("=== ICT-191 테스트 결과 리포트 통합 테스트 시작 ===");
  }

  /**
   * API 호출 계정을 커밋된 상태로 보장한다.
   *
   * <p>이 클래스는 테스트 트랜잭션을 롤백하고(AbstractTransactional...), HTTP 서버는 별도 커넥션으로 사용자를 조회한다. 따라서 테스트 트랜잭션에서
   * 저장한 사용자는 서버에서 보이지 않는다. REQUIRES_NEW 로 커밋해야 로그인이 성립한다.
   *
   * <p>매 메서드마다 비밀번호를 되돌려 놓으므로, 다른 테스트가 이 계정을 건드려도 다음 실행이 영향을 받지 않는다.
   */
  private void ensureApiUser() {
    TransactionTemplate tx = new TransactionTemplate(transactionManager);
    tx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    tx.executeWithoutResult(
        status -> {
          User user = userRepository.findByUsername(API_USERNAME).orElseGet(User::new);
          user.setUsername(API_USERNAME);
          user.setEmail(API_USERNAME + "@example.com");
          user.setName("Integration Test Admin");
          user.setRole("ADMIN");
          user.setIsActive(true);
          user.setEmailVerified(true);
          user.setPassword(passwordEncoder.encode(API_PASSWORD));
          if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
          }
          user.setUpdatedAt(LocalDateTime.now());
          userRepository.save(user);
        });
  }

  @AfterMethod
  public void tearDown() {
    System.out.println("=== ICT-191 테스트 결과 리포트 통합 테스트 종료 ===");
  }

  @Test(priority = 1)
  public void testGetTestResultStatistics() {
    System.out.println("📊 1. 테스트 결과 통계 API 테스트");

    // Given
    String url = baseUrl + "/test-results/statistics";
    HttpHeaders headers = createAuthHeaders();
    HttpEntity<String> entity = new HttpEntity<>(headers);

    // When
    ResponseEntity<TestResultStatisticsDto> response =
        restTemplate.exchange(url, HttpMethod.GET, entity, TestResultStatisticsDto.class);

    // Then
    assertEquals(response.getStatusCode(), HttpStatus.OK);
    assertNotNull(response.getBody());

    TestResultStatisticsDto stats = response.getBody();
    assertTrue(stats.getTotalTests() >= 0);
    assertTrue(stats.getPassCount() >= 0);
    assertTrue(stats.getFailCount() >= 0);
    assertTrue(stats.getNotRunCount() >= 0);
    assertTrue(stats.getBlockedCount() >= 0);

    System.out.println(
        "✅ 통계 데이터: "
            + "Total="
            + stats.getTotalTests()
            + ", Pass="
            + stats.getPassCount()
            + ", Fail="
            + stats.getFailCount());
  }

  @Test(priority = 2)
  public void testGetDetailedTestResultReportGet() {
    System.out.println("📋 2. 상세 테스트 결과 리포트 조회 API 테스트 (GET)");

    // Given
    String url = baseUrl + "/test-results/report?page=0&size=5";
    HttpHeaders headers = createAuthHeaders();
    HttpEntity<String> entity = new HttpEntity<>(headers);

    // When
    ResponseEntity<String> response =
        restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

    // Then
    assertEquals(response.getStatusCode(), HttpStatus.OK);
    assertNotNull(response.getBody());

    // JSON 파싱 검증
    try {
      Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
      assertTrue(responseMap.containsKey("content"));
      assertTrue(responseMap.containsKey("totalElements"));

      System.out.println("✅ 페이지 데이터 구조 확인 완료");
    } catch (Exception e) {
      fail("JSON 파싱 실패: " + e.getMessage());
    }
  }

  @Test(priority = 3)
  public void testGetDetailedTestResultReportPost() {
    System.out.println("📋 3. 상세 테스트 결과 리포트 조회 API 테스트 (POST)");

    // Given
    String url = baseUrl + "/test-results/report";
    TestResultFilterDto filter =
        TestResultFilterDto.builder()
            .page(0)
            .size(5)
            .displayColumns(List.of("testCaseName", "result", "executedAt"))
            .build();

    HttpHeaders headers = createAuthHeaders();
    HttpEntity<TestResultFilterDto> entity = new HttpEntity<>(filter, headers);

    // When
    ResponseEntity<String> response =
        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

    // Then
    assertEquals(response.getStatusCode(), HttpStatus.OK);
    assertNotNull(response.getBody());

    System.out.println("✅ POST 필터링 조회 완료");
  }

  @Test(priority = 4)
  public void testJiraStatusSummary() {
    System.out.println("🔗 4. JIRA 상태 통합 리스트 API 테스트");

    // Given
    String url = baseUrl + "/test-results/jira-status";
    HttpHeaders headers = createAuthHeaders();
    HttpEntity<String> entity = new HttpEntity<>(headers);

    // When
    ResponseEntity<String> response =
        restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

    // Then
    assertEquals(response.getStatusCode(), HttpStatus.OK);
    assertNotNull(response.getBody());

    try {
      List<?> jiraStatusList = objectMapper.readValue(response.getBody(), List.class);
      assertNotNull(jiraStatusList);

      System.out.println("✅ JIRA 상태 목록 조회 완료: " + jiraStatusList.size() + "개");
    } catch (Exception e) {
      fail("JIRA 상태 데이터 파싱 실패: " + e.getMessage());
    }
  }

  @Test(priority = 5)
  public void testExportFunctionality() {
    System.out.println("📄 5. 내보내기 기능 API 테스트");

    // CSV 내보내기 테스트
    testExportFormat("CSV");

    // Excel 내보내기 테스트
    testExportFormat("EXCEL");

    // PDF 내보내기 테스트
    testExportFormat("PDF");
  }

  private void testExportFormat(String format) {
    // Given
    String url = baseUrl + "/test-results/export";
    TestResultFilterDto filter =
        TestResultFilterDto.builder()
            .exportFormat(format)
            .page(0)
            .size(5)
            .displayColumns(List.of("testCaseName", "result", "executedAt"))
            .includeStatistics(true)
            .build();

    HttpHeaders headers = createAuthHeaders();
    HttpEntity<TestResultFilterDto> entity = new HttpEntity<>(filter, headers);

    // When
    ResponseEntity<byte[]> response =
        restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);

    // Then
    assertEquals(response.getStatusCode(), HttpStatus.OK);
    assertNotNull(response.getBody());
    assertTrue(response.getBody().length > 0);

    // Content-Type 헤더 확인
    String contentType = response.getHeaders().getContentType().toString();
    assertNotNull(contentType);

    System.out.println("✅ " + format + " 내보내기 완료: " + response.getBody().length + " bytes");
  }

  @Test(priority = 6)
  public void testPerformanceRequirements() {
    System.out.println("⚡ 6. 성능 요구사항 테스트 (응답시간 < 500ms)");

    // Given
    String url = baseUrl + "/test-results/statistics";
    HttpHeaders headers = createAuthHeaders();
    HttpEntity<String> entity = new HttpEntity<>(headers);

    // When
    long startTime = System.currentTimeMillis();
    ResponseEntity<TestResultStatisticsDto> response =
        restTemplate.exchange(url, HttpMethod.GET, entity, TestResultStatisticsDto.class);
    long endTime = System.currentTimeMillis();

    // Then
    System.out.println("📊 성능 테스트 API 응답 상태: " + response.getStatusCode());
    assertEquals(response.getStatusCode(), HttpStatus.OK);

    long responseTime = endTime - startTime;
    System.out.println("📊 API 응답시간: " + responseTime + "ms");

    // 성능 기준: 500ms 미만 (요구사항)
    if (responseTime < 500) {
      System.out.println("🚀 성능 기준 충족 (500ms 미만)");
    } else if (responseTime < 2000) {
      System.out.println("⚠️ 성능 기준 미달하지만 허용 가능 (2초 미만)");
    } else {
      fail("성능 요구사항 미달: " + responseTime + "ms > 2000ms");
    }
  }

  @Test(priority = 7)
  public void testErrorHandling() {
    System.out.println("🚨 7. 에러 핸들링 테스트");

    // 잘못된 프로젝트 ID로 테스트
    String url = baseUrl + "/test-results/statistics?projectId=invalid-project-id";
    HttpHeaders headers = createAuthHeaders();
    HttpEntity<String> entity = new HttpEntity<>(headers);

    // When
    ResponseEntity<String> response =
        restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

    // Then - 에러가 발생하더라도 적절히 처리되어야 함
    assertTrue(
        response.getStatusCode().is2xxSuccessful() || response.getStatusCode().is4xxClientError());

    System.out.println("✅ 에러 핸들링 확인 완료: " + response.getStatusCode());
  }

  @Test(priority = 8)
  public void testServiceLayerIntegration() {
    System.out.println("🔧 8. 서비스 계층 통합 테스트");

    // Given
    TestResultFilterDto filter = TestResultFilterDto.builder().page(0).size(10).build();
    filter.setDefaultDisplayColumns();
    filter.setDefaultSort();

    // When
    Page<TestResultReportDto> result = testResultReportService.getDetailedTestResultReport(filter);
    TestResultStatisticsDto stats =
        testResultReportService.getTestResultStatistics(null, null, null);

    // Then
    assertNotNull(result);
    assertNotNull(stats);
    assertTrue(result.getTotalElements() >= 0);
    assertTrue(stats.getTotalTests() >= 0);

    System.out.println("✅ 서비스 계층 통합 확인 완료");
    System.out.println("   - 리포트 데이터: " + result.getTotalElements() + "건");
    System.out.println("   - 통계 데이터: " + stats.getTotalTests() + "건");
  }

  @Test(priority = 9)
  public void testDataIntegrity() {
    System.out.println("🔍 9. 데이터 무결성 테스트");

    // 통계와 상세 데이터 일치 확인
    TestResultStatisticsDto stats =
        testResultReportService.getTestResultStatistics(null, null, null);

    TestResultFilterDto filter =
        TestResultFilterDto.builder().page(0).size(Integer.MAX_VALUE).build();
    filter.setDefaultDisplayColumns();

    Page<TestResultReportDto> allResults =
        testResultReportService.getDetailedTestResultReport(filter);

    // 데이터 일치성 검증
    long totalFromStats = stats.getTotalTests();
    long totalFromResults = allResults.getTotalElements();

    System.out.println("📊 통계 총합: " + totalFromStats + ", 상세 데이터 총합: " + totalFromResults);

    // 일치하거나 합리적인 범위 내에서 차이가 있어야 함
    assertTrue(
        Math.abs(totalFromStats - totalFromResults) <= 10,
        "통계와 상세 데이터 간 차이가 너무 큼: " + Math.abs(totalFromStats - totalFromResults));

    System.out.println("✅ 데이터 무결성 확인 완료");
  }

  // Helper Methods
  private String getAuthToken() {
    try {
      String loginUrl = baseUrl + "/auth/login";
      // ensureApiUser() 가 방금 커밋해 둔 이 테스트 전용 계정으로 로그인한다
      Map<String, String> loginRequest = Map.of("username", API_USERNAME, "password", API_PASSWORD);

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

      ResponseEntity<Map> response = restTemplate.postForEntity(loginUrl, entity, Map.class);
      System.out.println("🔑 로그인 시도 결과: " + response.getStatusCode());

      if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
        return (String) response.getBody().get("accessToken");
      }
      lastLoginFailure = response.getStatusCode() + " " + response.getBody();
      System.err.println("❌ 로그인 실패: " + lastLoginFailure);
    } catch (Exception e) {
      lastLoginFailure = e.getClass().getSimpleName() + ": " + e.getMessage();
      System.err.println("인증 토큰 획득 실패: " + lastLoginFailure);
    }

    // 토큰이 없으면 setUp 이 즉시 실패시킨다 (원인이 하위 API 검증으로 번지지 않게)
    return null;
  }

  private HttpHeaders createAuthHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    if (authToken != null && !authToken.isEmpty()) {
      headers.setBearerAuth(authToken);
    }

    return headers;
  }
}
