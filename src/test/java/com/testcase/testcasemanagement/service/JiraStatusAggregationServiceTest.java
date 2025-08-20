// src/test/java/com/testcase/testcasemanagement/service/JiraStatusAggregationServiceTest.java

package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.JiraSyncStatus;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * ICT-189: JIRA 상태 집계 서비스 테스트
 */
public class JiraStatusAggregationServiceTest {

    private JiraStatusAggregationService jiraStatusAggregationService;

    @Mock
    private TestResultRepository testResultRepository;

    @Mock
    private JiraApiService jiraApiService;

    @Mock
    private JiraConfigService jiraConfigService;


    @Mock
    private EncryptionUtil encryptionUtil;

    private ObjectMapper objectMapper;

    @BeforeMethod
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();
        
        jiraStatusAggregationService = new JiraStatusAggregationService(
            testResultRepository,
            jiraApiService,
            jiraConfigService,
            encryptionUtil
        );
    }

    @Test
    public void testGetProjectJiraStatusSummary_EmptyResults() {
        // Given
        String projectId = "test-project-1";
        when(testResultRepository.findByProjectIdAndJiraIssueKeyIsNotNull(projectId))
            .thenReturn(Collections.emptyList());

        // When
        List<JiraStatusSummaryDto> result = jiraStatusAggregationService.getProjectJiraStatusSummary(projectId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(testResultRepository).findByProjectIdAndJiraIssueKeyIsNotNull(projectId);
    }

    @Test
    public void testGetProjectJiraStatusSummary_WithValidJiraIds() throws Exception {
        // Given
        String projectId = "test-project-1";
        
        // Mock test results
        List<TestResult> mockTestResults = createMockTestResults();
        when(testResultRepository.findByProjectIdAndJiraIssueKeyIsNotNull(projectId))
            .thenReturn(mockTestResults);
        
        // Mock JIRA configuration
        JiraConfigDto mockJiraConfig = createMockJiraConfig();
        when(jiraConfigService.getActiveConfigByUserId("admin"))
            .thenReturn(Optional.of(mockJiraConfig));
        
        // Mock encryption service
        when(encryptionUtil.decrypt(any())).thenReturn("decrypted-api-token");
        
        // Mock JIRA API service
        JsonNode mockIssueInfo = createMockJiraIssueInfo();
        when(jiraApiService.getIssueInfo(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockIssueInfo);
        when(jiraApiService.isValidIssueKey("TEST-123")).thenReturn(true);
        when(jiraApiService.generateIssueUrl(anyString(), anyString()))
            .thenReturn("https://jira.example.com/browse/TEST-123");
        
        
        // Mock test result repository for JIRA issue
        when(testResultRepository.findByJiraIssueKeyOrderByExecutedAtDesc("TEST-123"))
            .thenReturn(mockTestResults);

        // When
        List<JiraStatusSummaryDto> result = jiraStatusAggregationService.getProjectJiraStatusSummary(projectId);

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(result.size(), 1);
        
        JiraStatusSummaryDto summary = result.get(0);
        assertEquals(summary.getJiraIssueKey(), "TEST-123");
        assertEquals(summary.getCurrentStatus(), "In Progress");
        assertEquals(summary.getIssueType(), "Bug");
        assertEquals(summary.getPriority(), "High");
        assertEquals(summary.getLinkedTestCount(), Long.valueOf(2));
        assertTrue(summary.getSuccessRate() > 0);
    }

    @Test
    public void testGetJiraStatusDetail_ValidJiraId() throws Exception {
        // Given
        String jiraId = "TEST-123";
        
        List<TestResult> mockTestResults = createMockTestResults();
        when(testResultRepository.findByJiraIssueKeyOrderByExecutedAtDesc(jiraId))
            .thenReturn(mockTestResults);
        
        // Mock JIRA configuration
        JiraConfigDto mockJiraConfig = createMockJiraConfig();
        when(jiraConfigService.getActiveConfigByUserId("admin"))
            .thenReturn(Optional.of(mockJiraConfig));
        
        // Mock encryption and API services
        when(encryptionUtil.decrypt(any())).thenReturn("decrypted-api-token");
        JsonNode mockIssueInfo = createMockJiraIssueInfo();
        when(jiraApiService.getIssueInfo(anyString(), anyString(), anyString(), eq(jiraId)))
            .thenReturn(mockIssueInfo);
        when(jiraApiService.generateIssueUrl(anyString(), eq(jiraId)))
            .thenReturn("https://jira.example.com/browse/TEST-123");
        

        // When
        JiraStatusSummaryDto result = jiraStatusAggregationService.getJiraStatusDetail(jiraId);

        // Then
        assertNotNull(result);
        assertEquals(result.getJiraIssueKey(), jiraId);
        assertEquals(result.getCurrentStatus(), "In Progress");
        assertEquals(result.getLinkedTestCount(), Long.valueOf(2));
        assertNotNull(result.getTestResultDistribution());
    }

    @Test
    public void testBatchGetJiraIssueInfo_ValidIds() throws Exception {
        // Given
        Set<String> jiraIds = Set.of("TEST-123", "TEST-456");
        
        // Mock JIRA configuration
        JiraConfigDto mockJiraConfig = createMockJiraConfig();
        when(jiraConfigService.getActiveConfigByUserId("admin"))
            .thenReturn(Optional.of(mockJiraConfig));
        
        // Mock encryption
        when(encryptionUtil.decrypt(any())).thenReturn("decrypted-api-token");
        
        // Mock JIRA API search
        List<JsonNode> mockIssues = List.of(createMockJiraIssueInfo());
        when(jiraApiService.searchIssues(anyString(), anyString(), anyString(), anyString(), anyInt()))
            .thenReturn(mockIssues);

        // When
        Map<String, JsonNode> result = jiraStatusAggregationService.batchGetJiraIssueInfo(jiraIds);

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(jiraApiService, atLeastOnce()).searchIssues(anyString(), anyString(), anyString(), anyString(), anyInt());
    }

    @Test
    public void testRefreshProjectJiraStatus() {
        // Given
        String projectId = "test-project-1";
        when(testResultRepository.findByProjectIdAndJiraIssueKeyIsNotNull(projectId))
            .thenReturn(Collections.emptyList());

        // When
        List<JiraStatusSummaryDto> result = jiraStatusAggregationService.refreshProjectJiraStatus(projectId);

        // Then
        assertNotNull(result);
        verify(testResultRepository).findByProjectIdAndJiraIssueKeyIsNotNull(projectId);
    }

    // Helper methods for creating mock objects

    private List<TestResult> createMockTestResults() {
        List<TestResult> testResults = new ArrayList<>();
        
        TestResult result1 = new TestResult();
        result1.setId("result-1");
        result1.setJiraIssueKey("TEST-123");
        result1.setResult("PASS");
        result1.setExecutedAt(LocalDateTime.now().minusHours(1));
        result1.setJiraSyncStatus(JiraSyncStatus.SYNCED);
        result1.setLastJiraSyncAt(LocalDateTime.now().minusMinutes(30));
        testResults.add(result1);
        
        TestResult result2 = new TestResult();
        result2.setId("result-2");
        result2.setJiraIssueKey("TEST-123");
        result2.setResult("FAIL");
        result2.setExecutedAt(LocalDateTime.now().minusHours(2));
        result2.setJiraSyncStatus(JiraSyncStatus.SYNCED);
        result2.setLastJiraSyncAt(LocalDateTime.now().minusMinutes(45));
        testResults.add(result2);
        
        return testResults;
    }

    private JiraConfigDto createMockJiraConfig() {
        return JiraConfigDto.builder()
            .id("config-1")
            .userId("admin")
            .serverUrl("https://jira.example.com")
            .username("testuser")
            .apiToken("encrypted-token")
            .isActive(true)
            .connectionVerified(true)
            .build();
    }

    private JsonNode createMockJiraIssueInfo() throws Exception {
        String jsonString = """
            {
                "key": "TEST-123",
                "fields": {
                    "summary": "Test issue summary",
                    "status": {
                        "name": "In Progress"
                    },
                    "issuetype": {
                        "name": "Bug"
                    },
                    "priority": {
                        "name": "High"
                    }
                }
            }
            """;
        
        return objectMapper.readTree(jsonString);
    }
}