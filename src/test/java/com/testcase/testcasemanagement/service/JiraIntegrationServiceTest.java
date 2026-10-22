// src/test/java/com/testcase/testcasemanagement/service/JiraIntegrationServiceTest.java
package com.testcase.testcasemanagement.service;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.TestCaseAttachment;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** JIRA 통합 서비스 테스트 ICT-162: JIRA API 클라이언트 및 연동 서비스 구현 */
public class JiraIntegrationServiceTest {

  private JiraIntegrationService jiraIntegrationService;

  @Mock private JiraConfigService jiraConfigService;

  @Mock private TestResultRepository testResultRepository;

  @Mock private MinIOService minIOService;

  @Mock private TestCaseAttachmentRepository testCaseAttachmentRepository;

  @BeforeMethod
  void setUp() {
    MockitoAnnotations.openMocks(this);
    jiraIntegrationService =
        new JiraIntegrationService(
            jiraConfigService, testResultRepository, minIOService, testCaseAttachmentRepository);
    // @Value 로 주입되는 필드의 기본값을 ReflectionTestUtils 로 설정
    ReflectionTestUtils.setField(
        jiraIntegrationService, "issueKeyPattern", "^[A-Z][A-Z0-9]+-[0-9]+$");
    ReflectionTestUtils.setField(jiraIntegrationService, "autoCommentEnabled", true);
  }

  @Test
  public void testExtractJiraIssueKeys_Success() {
    // Given
    String text = "이 테스트는 ICT-123과 PROJ-456 이슈와 관련이 있습니다. TEST-789도 확인하세요.";

    // When
    List<String> issueKeys = jiraIntegrationService.extractJiraIssueKeys(text);

    // Then
    assertEquals(issueKeys.size(), 3);
    assertTrue(issueKeys.contains("ICT-123"));
    assertTrue(issueKeys.contains("PROJ-456"));
    assertTrue(issueKeys.contains("TEST-789"));
  }

  @Test
  public void testExtractJiraIssueKeys_EmptyText() {
    // Given
    String text = "";

    // When
    List<String> issueKeys = jiraIntegrationService.extractJiraIssueKeys(text);

    // Then
    assertTrue(issueKeys.isEmpty());
  }

  @Test
  public void testExtractJiraIssueKeys_NullText() {
    // Given
    String text = null;

    // When
    List<String> issueKeys = jiraIntegrationService.extractJiraIssueKeys(text);

    // Then
    assertTrue(issueKeys.isEmpty());
  }

  @Test
  public void testExtractJiraIssueKeys_NoMatches() {
    // Given
    String text = "이 텍스트에는 JIRA 이슈 키가 없습니다.";

    // When
    List<String> issueKeys = jiraIntegrationService.extractJiraIssueKeys(text);

    // Then
    assertTrue(issueKeys.isEmpty());
  }

  @Test
  public void testIsValidJiraIssueKey_ValidKeys() {
    // Valid keys
    assertTrue(jiraIntegrationService.isValidJiraIssueKey("ICT-123"));
    assertTrue(jiraIntegrationService.isValidJiraIssueKey("PROJ-1"));
    assertTrue(jiraIntegrationService.isValidJiraIssueKey("TEST-999"));
    assertTrue(jiraIntegrationService.isValidJiraIssueKey("ABC-1234"));
  }

  @Test
  public void testIsValidJiraIssueKey_InvalidKeys() {
    // Invalid keys
    assertFalse(jiraIntegrationService.isValidJiraIssueKey("ict-123")); // lowercase
    assertFalse(jiraIntegrationService.isValidJiraIssueKey("ICT123")); // no dash
    assertFalse(jiraIntegrationService.isValidJiraIssueKey("ICT-")); // no number
    assertFalse(jiraIntegrationService.isValidJiraIssueKey("123-ICT")); // reversed
    assertFalse(jiraIntegrationService.isValidJiraIssueKey("ICT-ABC")); // letters after dash
    assertFalse(jiraIntegrationService.isValidJiraIssueKey("")); // empty
    assertFalse(jiraIntegrationService.isValidJiraIssueKey(null)); // null
  }

  @Test
  public void testAddManualTestResultComment_Success() {
    // Given
    String userId = "testuser";
    String issueKey = "ICT-123";
    TestResult testResult = createTestResult();

    when(jiraConfigService.addTestResultComment(eq(userId), eq(issueKey), anyString()))
        .thenReturn(true);

    // When
    boolean result =
        jiraIntegrationService.addManualTestResultComment(userId, issueKey, testResult);

    // Then
    assertTrue(result);
    verify(jiraConfigService).addTestResultComment(eq(userId), eq(issueKey), anyString());
  }

  @Test
  public void testAddManualTestResultComment_Failure() {
    // Given
    String userId = "testuser";
    String issueKey = "ICT-123";
    TestResult testResult = createTestResult();

    when(jiraConfigService.addTestResultComment(eq(userId), eq(issueKey), anyString()))
        .thenReturn(false);

    // When
    boolean result =
        jiraIntegrationService.addManualTestResultComment(userId, issueKey, testResult);

    // Then
    assertFalse(result);
    verify(jiraConfigService).addTestResultComment(eq(userId), eq(issueKey), anyString());
  }

  @Test
  public void testAddManualTestResultComment_NullTestResult() {
    // Given
    String userId = "testuser";
    String issueKey = "ICT-123";
    TestResult testResult = null;

    // When
    boolean result =
        jiraIntegrationService.addManualTestResultComment(userId, issueKey, testResult);

    // Then
    assertFalse(result);
    verifyNoInteractions(jiraConfigService);
  }

  @Test
  public void testAddTestExecutionSummary_Success() {
    // Given
    String userId = "testuser";
    String issueKey = "ICT-123";
    TestExecution testExecution = createTestExecution();
    List<TestResult> testResults = createTestResults();

    when(jiraConfigService.addTestResultComment(eq(userId), eq(issueKey), anyString()))
        .thenReturn(true);

    // When
    boolean result =
        jiraIntegrationService.addTestExecutionSummary(
            userId, issueKey, testExecution, testResults);

    // Then
    assertTrue(result);
    verify(jiraConfigService).addTestResultComment(eq(userId), eq(issueKey), anyString());
  }

  // Helper methods for creating test data

  private TestResult createTestResult() {
    TestResult testResult = new TestResult();
    testResult.setId("test-result-1");
    testResult.setTestCaseId("tc-001");
    testResult.setResult("FAIL");
    testResult.setNotes("테스트 실행 중 오류가 발생했습니다. ICT-123 이슈 확인 필요");
    testResult.setExecutedAt(LocalDateTime.now());

    User user = new User();
    user.setId("user-1");
    user.setUsername("testuser");
    user.setName("테스트 사용자");
    testResult.setExecutedBy(user);

    return testResult;
  }

  @Test
  public void createIssue_embedsInlineImagesAsJiraAttachments() throws Exception {
    // Given: 설명에 이 서버 주소로 된 본문 이미지가 있다
    String description =
        "### 테스트 단계\n1. 클릭 <img src=\"/api/testcase-attachments/public/att-1?token=tok1\""
            + " alt=\"shot\" />";
    JiraConfigDto.IssueCreateRequestDto request =
        JiraConfigDto.IssueCreateRequestDto.builder()
            .projectKey("ICT")
            .summary("[Test Fail] 로그인")
            .description(description)
            .issueTypeId("10001")
            .build();

    TestCaseAttachment attachment = new TestCaseAttachment();
    attachment.setId("att-1");
    attachment.setOriginalFileName("shot 1.png");
    attachment.setMimeType("image/png");
    attachment.setFilePath("testcases/att-1.png");
    attachment.setStatus(TestCaseAttachment.AttachmentStatus.ACTIVE);

    when(jiraConfigService.createIssue(eq("u1"), any()))
        .thenReturn(
            JiraConfigDto.IssueCreateResponseDto.builder().success(true).issueKey("ICT-9").build());
    when(testCaseAttachmentRepository.findByIdAndPublicAccessToken("att-1", "tok1"))
        .thenReturn(Optional.of(attachment));
    when(minIOService.downloadFile("testcases/att-1.png"))
        .thenReturn(new ByteArrayInputStream(new byte[] {1, 2, 3}));
    when(jiraConfigService.uploadAttachment(anyString(), anyString(), anyString(), any(), any()))
        .thenReturn(true);
    when(jiraConfigService.updateIssueDescriptionWiki(anyString(), anyString(), anyString()))
        .thenReturn(true);

    // When
    jiraIntegrationService.createIssue("u1", request);

    // Then: 처음 만들 때는 서버 주소 대신 자리 표시를 보낸다
    ArgumentCaptor<JiraConfigDto.IssueCreateRequestDto> created =
        ArgumentCaptor.forClass(JiraConfigDto.IssueCreateRequestDto.class);
    verify(jiraConfigService).createIssue(eq("u1"), created.capture());
    assertFalse(created.getValue().getDescription().contains("/api/"));
    assertTrue(created.getValue().getDescription().contains("[image: shot]"));
    // 원본 요청은 바꾸지 않는다
    assertEquals(request.getDescription(), description);

    // 이미지를 첨부로 올리고 설명을 위키 이미지 구문으로 갱신한다
    verify(jiraConfigService)
        .uploadAttachment(eq("u1"), eq("ICT-9"), eq("image-1-shot_1.png"), any(), eq("image/png"));
    ArgumentCaptor<String> wiki = ArgumentCaptor.forClass(String.class);
    verify(jiraConfigService).updateIssueDescriptionWiki(eq("u1"), eq("ICT-9"), wiki.capture());
    assertTrue(wiki.getValue().contains("!image-1-shot_1.png|thumbnail!"), wiki.getValue());
  }

  @Test
  public void createIssue_withoutInlineImages_keepsExistingFlow() {
    JiraConfigDto.IssueCreateRequestDto request =
        JiraConfigDto.IssueCreateRequestDto.builder()
            .projectKey("ICT")
            .summary("s")
            .description("본문만 있음")
            .build();
    when(jiraConfigService.createIssue(eq("u1"), same(request)))
        .thenReturn(
            JiraConfigDto.IssueCreateResponseDto.builder().success(true).issueKey("ICT-9").build());

    jiraIntegrationService.createIssue("u1", request);

    verify(jiraConfigService).createIssue(eq("u1"), same(request));
    verify(jiraConfigService, never()).updateIssueDescriptionWiki(any(), any(), any());
    verifyNoInteractions(testCaseAttachmentRepository);
  }

  private TestExecution createTestExecution() {
    TestExecution testExecution = new TestExecution();
    testExecution.setId("test-execution-1");
    testExecution.setTestPlanId("test-plan-1");
    testExecution.setStatus("COMPLETED");
    testExecution.setStartDate(LocalDateTime.now().minusHours(1));
    return testExecution;
  }

  private List<TestResult> createTestResults() {
    TestResult passResult = new TestResult();
    passResult.setId("tr-1");
    passResult.setTestCaseId("tc-001");
    passResult.setResult("PASS");
    passResult.setExecutedAt(LocalDateTime.now());

    TestResult failResult = new TestResult();
    failResult.setId("tr-2");
    failResult.setTestCaseId("tc-002");
    failResult.setResult("FAIL");
    failResult.setNotes("ICT-123 관련 실패");
    failResult.setExecutedAt(LocalDateTime.now());

    TestResult blockedResult = new TestResult();
    blockedResult.setId("tr-3");
    blockedResult.setTestCaseId("tc-003");
    blockedResult.setResult("BLOCKED");
    blockedResult.setNotes("PROJ-456 이슈로 인한 차단");
    blockedResult.setExecutedAt(LocalDateTime.now());

    return Arrays.asList(passResult, failResult, blockedResult);
  }
}
