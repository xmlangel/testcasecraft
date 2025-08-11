// src/test/java/com/testcase/testcasemanagement/service/JiraIntegrationServiceTest.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.User;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

/**
 * JIRA 통합 서비스 테스트
 * ICT-162: JIRA API 클라이언트 및 연동 서비스 구현
 */
public class JiraIntegrationServiceTest {

    @InjectMocks
    private JiraIntegrationService jiraIntegrationService;

    @Mock
    private JiraConfigService jiraConfigService;

    @BeforeMethod
    void setUp() {
        MockitoAnnotations.openMocks(this);
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
        assertFalse(jiraIntegrationService.isValidJiraIssueKey("ict-123"));  // lowercase
        assertFalse(jiraIntegrationService.isValidJiraIssueKey("ICT123"));   // no dash
        assertFalse(jiraIntegrationService.isValidJiraIssueKey("ICT-"));     // no number
        assertFalse(jiraIntegrationService.isValidJiraIssueKey("123-ICT"));  // reversed
        assertFalse(jiraIntegrationService.isValidJiraIssueKey("ICT-ABC"));  // letters after dash
        assertFalse(jiraIntegrationService.isValidJiraIssueKey(""));         // empty
        assertFalse(jiraIntegrationService.isValidJiraIssueKey(null));       // null
        assertFalse(jiraIntegrationService.isValidJiraIssueKey(" ICT-123 ")); // with spaces
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
        boolean result = jiraIntegrationService.addManualTestResultComment(userId, issueKey, testResult);

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
        boolean result = jiraIntegrationService.addManualTestResultComment(userId, issueKey, testResult);

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
        boolean result = jiraIntegrationService.addManualTestResultComment(userId, issueKey, testResult);

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
        boolean result = jiraIntegrationService.addTestExecutionSummary(userId, issueKey, testExecution, testResults);

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