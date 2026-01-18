// ICT-191: 테스트 결과 리포트 서비스 목킹 테스트
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStatisticsDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * ICT-191: 테스트 결과 리포트 서비스 목킹 테스트
 * 
 * 목적: JIRA 서비스와 데이터베이스 의존성을 목킹하여 비즈니스 로직 테스트
 * 범위: TestResultReportService의 모든 메서드
 */
public class TestResultReportServiceMockTest {

    @Mock
    private TestExecutionRepository testExecutionRepository;

    @Mock
    private TestPlanRepository testPlanRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TestResultRepository testResultRepository;

    @Mock
    private TestCaseRepository testCaseRepository;

    @Mock
    private ExportService exportService;

    @InjectMocks
    private TestResultReportService testResultReportService;

    private TestResult mockTestResult;
    private TestCase mockTestCase;
    private TestExecution mockTestExecution;
    private TestPlan mockTestPlan;
    private User mockUser;

    @BeforeMethod
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        System.out.println("=== ICT-191 테스트 결과 리포트 서비스 목킹 테스트 시작 ===");

        setupMockData();
    }

    private void setupMockData() {
        // Mock User
        mockUser = new User();
        mockUser.setId("user-1");
        mockUser.setUsername("testuser");

        // Mock TestCase
        mockTestCase = new TestCase();
        mockTestCase.setId("testcase-1");
        mockTestCase.setName("테스트케이스1");
        mockTestCase.setParentId(null);

        // Mock TestPlan
        mockTestPlan = new TestPlan();
        mockTestPlan.setId("testplan-1");
        mockTestPlan.setName("테스트플랜1");

        // Mock TestExecution
        mockTestExecution = new TestExecution();
        mockTestExecution.setId("execution-1");
        mockTestExecution.setName("실행1");
        mockTestExecution.setTestPlanId("testplan-1");

        // Mock TestResult
        mockTestResult = new TestResult();
        mockTestResult.setId("result-1");
        mockTestResult.setTestCaseId("testcase-1");
        mockTestResult.setResult("PASS");
        mockTestResult.setExecutedAt(LocalDateTime.now());
        mockTestResult.setExecutedBy(mockUser);
        mockTestResult.setNotes("테스트 노트");
        mockTestResult.setJiraIssueKey("ICT-123");
        mockTestResult.setJiraIssueUrl("https://example.atlassian.net/browse/ICT-123");
        mockTestResult.setJiraSyncStatus(JiraSyncStatus.SYNCED);
        mockTestResult.setTestExecution(mockTestExecution);
    }

    @Test(priority = 1)
    public void testGetTestResultStatistics_AllData() {
        System.out.println("📊 1. 전체 데이터 통계 조회 테스트");

        // Given
        List<TestResult> mockResults = Arrays.asList(
                createMockResult("PASS"),
                createMockResult("FAIL"),
                createMockResult("PASS"),
                createMockResult("NOT_RUN"),
                createMockResult("BLOCKED"));

        when(testResultRepository.findAll()).thenReturn(mockResults);

        // When
        TestResultStatisticsDto statistics = testResultReportService.getTestResultStatistics(null, null, null);

        // Then
        assertNotNull(statistics);
        assertEquals(statistics.getTotalTests(), 5L);
        assertEquals(statistics.getPassCount(), 2L);
        assertEquals(statistics.getFailCount(), 1L);
        assertEquals(statistics.getNotRunCount(), 1L);
        assertEquals(statistics.getBlockedCount(), 1L);
        assertEquals(statistics.getFilterType(), "ALL");

        System.out.println("✅ 전체 통계 조회 성공: " + statistics.getTotalTests() + "건");
    }

    @Test(priority = 2)
    public void testGetTestResultStatistics_ProjectFilter() {
        System.out.println("📊 2. 프로젝트별 통계 조회 테스트");

        // Given
        String projectId = "project-1";
        List<TestExecution> mockExecutions = Arrays.asList(mockTestExecution);
        List<TestResult> mockResults = Arrays.asList(createMockResult("PASS"), createMockResult("FAIL"));

        mockTestExecution.setResults(mockResults);

        when(testExecutionRepository.findByProjectId(projectId)).thenReturn(mockExecutions);

        // When
        TestResultStatisticsDto statistics = testResultReportService.getTestResultStatistics(projectId, null, null);

        // Then
        assertNotNull(statistics);
        assertEquals(statistics.getTotalTests(), 2L);
        assertEquals(statistics.getPassCount(), 1L);
        assertEquals(statistics.getFailCount(), 1L);
        assertEquals(statistics.getFilterType(), "PROJECT");
        assertEquals(statistics.getFilterId(), projectId);

        System.out.println("✅ 프로젝트별 통계 조회 성공: " + statistics.getTotalTests() + "건");
    }

    @Test(priority = 3)
    public void testGetDetailedTestResultReport() {
        System.out.println("📋 3. 상세 테스트 결과 리포트 조회 테스트");

        // Given
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .page(0)
                .size(10)
                .displayColumns(Arrays.asList("testCaseName", "result", "executedAt"))
                .build();
        filter.setDefaultSort();

        Pageable pageable = PageRequest.of(0, 10);
        List<TestResult> mockResults = Arrays.asList(mockTestResult);
        Page<TestResult> mockPage = new PageImpl<>(mockResults, pageable, 1);

        // Repository mock 설정 - 모든 경우에 대비
        when(testResultRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(testResultRepository.findRecentTestResultsByProject(anyString(), any(PageRequest.class)))
                .thenReturn(mockResults);
        when(testCaseRepository.findById("testcase-1")).thenReturn(Optional.of(mockTestCase));
        when(testPlanRepository.findById("testplan-1")).thenReturn(Optional.of(mockTestPlan));

        // When
        Page<TestResultReportDto> result = testResultReportService.getDetailedTestResultReport(filter);

        // Then
        assertNotNull(result);
        assertEquals(result.getTotalElements(), 1L);
        assertEquals(result.getContent().size(), 1);

        TestResultReportDto dto = result.getContent().get(0);
        assertEquals(dto.getTestCaseName(), "테스트케이스1");
        assertEquals(dto.getResult(), "PASS");
        assertEquals(dto.getTestPlanName(), "테스트플랜1");

        System.out.println("✅ 상세 리포트 조회 성공: " + result.getTotalElements() + "건");
    }

    @Test(priority = 4)
    public void testGetJiraStatusSummary() {
        System.out.println("🔗 4. JIRA 상태 통합 리스트 조회 테스트");

        // Given
        String projectId = "project-1";
        List<TestExecution> mockExecutions = Arrays.asList(mockTestExecution);
        List<TestResult> mockResults = Arrays.asList(
                createMockResultWithJira("ICT-123", "PASS"),
                createMockResultWithJira("ICT-123", "FAIL"),
                createMockResultWithJira("ICT-456", "PASS"));

        mockTestExecution.setResults(mockResults);

        when(testExecutionRepository.findByProjectId(projectId)).thenReturn(mockExecutions);

        // When
        List<JiraStatusSummaryDto> result = testResultReportService.getJiraStatusSummary(projectId, null, null, false);

        // Then
        assertNotNull(result);
        assertEquals(result.size(), 2); // ICT-123과 ICT-456 두 개의 이슈

        // ICT-123은 2개의 테스트 결과를 가져야 함
        JiraStatusSummaryDto ict123 = result.stream()
                .filter(dto -> "ICT-123".equals(dto.getJiraIssueKey()))
                .findFirst()
                .orElse(null);

        assertNotNull(ict123);
        assertEquals(ict123.getLinkedTestCount(), Long.valueOf(2));

        System.out.println("✅ JIRA 상태 통합 조회 성공: " + result.size() + "개 이슈");
    }

    @Test(priority = 5)
    public void testExportTestResultReport() {
        System.out.println("📄 5. 테스트 결과 내보내기 테스트");

        // Given
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .exportFormat("CSV")
                .page(0)
                .size(100)
                .includeStatistics(true)
                .build();
        filter.setAllDisplayColumns();

        List<TestResult> mockResults = Arrays.asList(mockTestResult);
        Page<TestResult> mockPage = new PageImpl<>(mockResults, PageRequest.of(0, 100), 1);
        byte[] mockExportData = "Mock CSV Data".getBytes();

        // Repository mock 설정 - 모든 경우에 대비
        when(testResultRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(testResultRepository.findRecentTestResultsByProject(anyString(), any(PageRequest.class)))
                .thenReturn(mockResults);
        when(testCaseRepository.findById(anyString())).thenReturn(Optional.of(mockTestCase));
        when(testPlanRepository.findById(anyString())).thenReturn(Optional.of(mockTestPlan));
        when(exportService.exportToCsv(any(), any())).thenReturn(mockExportData);

        // When
        byte[] result = testResultReportService.exportTestResultReport(filter);

        // Then
        assertNotNull(result);
        assertTrue(result.length > 0);
        assertEquals(new String(result), "Mock CSV Data");

        verify(exportService).exportToCsv(any(), eq(filter));

        System.out.println("✅ CSV 내보내기 성공: " + result.length + " bytes");
    }

    @Test(priority = 6)
    public void testExportTestResultReport_Excel() {
        System.out.println("📄 6. Excel 내보내기 테스트");

        // Given
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .exportFormat("EXCEL")
                .page(0)
                .size(50)
                .build();

        List<TestResult> mockResults = Arrays.asList(mockTestResult);
        Page<TestResult> mockPage = new PageImpl<>(mockResults, PageRequest.of(0, 50), 1);
        byte[] mockExcelData = "Mock Excel Data".getBytes();

        when(testResultRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(testResultRepository.findRecentTestResultsByProject(anyString(), any(PageRequest.class)))
                .thenReturn(mockResults);
        when(testCaseRepository.findById(anyString())).thenReturn(Optional.of(mockTestCase));
        when(testPlanRepository.findById(anyString())).thenReturn(Optional.of(mockTestPlan));
        when(exportService.exportToExcel(any(), any())).thenReturn(mockExcelData);

        // When
        byte[] result = testResultReportService.exportTestResultReport(filter);

        // Then
        assertNotNull(result);
        assertEquals(new String(result), "Mock Excel Data");
        verify(exportService).exportToExcel(any(), eq(filter));

        System.out.println("✅ Excel 내보내기 성공");
    }

    @Test(priority = 7)
    public void testExportTestResultReport_PDF() {
        System.out.println("📄 7. PDF 내보내기 테스트");

        // Given
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .exportFormat("PDF")
                .page(0)
                .size(25)
                .build();

        List<TestResult> mockResults = Arrays.asList(mockTestResult);
        Page<TestResult> mockPage = new PageImpl<>(mockResults, PageRequest.of(0, 25), 1);
        byte[] mockPdfData = "Mock PDF Data".getBytes();

        when(testResultRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(testResultRepository.findRecentTestResultsByProject(anyString(), any(PageRequest.class)))
                .thenReturn(mockResults);
        when(testCaseRepository.findById(anyString())).thenReturn(Optional.of(mockTestCase));
        when(testPlanRepository.findById(anyString())).thenReturn(Optional.of(mockTestPlan));
        when(exportService.exportToPdf(any(), any())).thenReturn(mockPdfData);

        // When
        byte[] result = testResultReportService.exportTestResultReport(filter);

        // Then
        assertNotNull(result);
        assertEquals(new String(result), "Mock PDF Data");
        verify(exportService).exportToPdf(any(), eq(filter));

        System.out.println("✅ PDF 내보내기 성공");
    }

    @Test(priority = 8)
    public void testGetDetailedTestResultReport_ProjectFiltering() {
        System.out.println("🔍 8. 프로젝트 필터링 테스트");

        // Given
        String projectId = "project-1";
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .projectId(projectId)
                .page(0)
                .size(10)
                .build();
        filter.setDefaultSort();
        filter.setDefaultDisplayColumns();

        List<TestResult> mockResults = Arrays.asList(mockTestResult);

        when(testResultRepository.findRecentTestResultsByProject(
                eq(projectId), any(PageRequest.class))).thenReturn(mockResults);
        when(testCaseRepository.findById(anyString())).thenReturn(Optional.of(mockTestCase));
        when(testPlanRepository.findById(anyString())).thenReturn(Optional.of(mockTestPlan));

        // When
        Page<TestResultReportDto> result = testResultReportService.getDetailedTestResultReport(filter);

        // Then
        assertNotNull(result);
        verify(testResultRepository).findRecentTestResultsByProject(eq(projectId), any(PageRequest.class));

        System.out.println("✅ 프로젝트 필터링 성공");
    }

    @Test(priority = 9)
    public void testBuildFolderPath() {
        System.out.println("📁 9. 폴더 경로 생성 테스트");

        // Given - 중첩된 폴더 구조
        TestCase rootFolder = new TestCase();
        rootFolder.setId("root");
        rootFolder.setName("루트폴더");
        rootFolder.setParentId(null);

        TestCase subFolder = new TestCase();
        subFolder.setId("sub");
        subFolder.setName("서브폴더");
        subFolder.setParentId("root");

        TestCase testCase = new TestCase();
        testCase.setId("testcase");
        testCase.setName("테스트케이스");
        testCase.setParentId("sub");

        when(testCaseRepository.findById("testcase")).thenReturn(Optional.of(testCase));
        when(testCaseRepository.findById("sub")).thenReturn(Optional.of(subFolder));
        when(testCaseRepository.findById("root")).thenReturn(Optional.of(rootFolder));

        TestResultFilterDto filter = TestResultFilterDto.builder()
                .page(0)
                .size(1)
                .build();
        filter.setDefaultDisplayColumns();
        filter.setDefaultSort();

        TestResult nestedResult = new TestResult();
        nestedResult.setId("nested-result");
        nestedResult.setTestCaseId("testcase");
        nestedResult.setResult("PASS");
        nestedResult.setExecutedAt(LocalDateTime.now());
        nestedResult.setExecutedBy(mockUser);
        nestedResult.setTestExecution(mockTestExecution);

        List<TestResult> results = Arrays.asList(nestedResult);
        Page<TestResult> mockPage = new PageImpl<>(results, PageRequest.of(0, 1), 1);

        when(testResultRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(testPlanRepository.findById(anyString())).thenReturn(Optional.of(mockTestPlan));

        // When
        Page<TestResultReportDto> result = testResultReportService.getDetailedTestResultReport(filter);

        // Then
        assertNotNull(result);
        assertEquals(result.getContent().size(), 1);

        TestResultReportDto dto = result.getContent().get(0);
        assertEquals(dto.getFolderPath(), "루트폴더/서브폴더");

        System.out.println("✅ 폴더 경로 생성 성공: " + dto.getFolderPath());
    }

    @Test(priority = 10, expectedExceptions = IllegalArgumentException.class)
    public void testExportWithInvalidFormat() {
        System.out.println("🚨 10. 잘못된 내보내기 형식 테스트");

        // Given
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .exportFormat("INVALID_FORMAT")
                .page(0)
                .size(10)
                .build();

        List<TestResult> mockResults = Arrays.asList(mockTestResult);
        Page<TestResult> mockPage = new PageImpl<>(mockResults, PageRequest.of(0, 10), 1);

        when(testResultRepository.findAll(any(Pageable.class))).thenReturn(mockPage);
        when(testResultRepository.findRecentTestResultsByProject(anyString(), any(PageRequest.class)))
                .thenReturn(mockResults);
        when(testCaseRepository.findById(anyString())).thenReturn(Optional.of(mockTestCase));
        when(testPlanRepository.findById(anyString())).thenReturn(Optional.of(mockTestPlan));

        // When & Then
        testResultReportService.exportTestResultReport(filter);

        System.out.println("✅ 잘못된 형식 예외 처리 확인");
    }

    @Test(priority = 11)
    public void testGetDetailedTestResultReport_OutOfBoundsPagination() {
        System.out.println("📄 11. Pagination OutOfBounds 테스트");

        // Given
        String projectId = "project-1";
        // 5 items total
        List<TestResult> mockResults = Arrays.asList(
                createMockResult("PASS"),
                createMockResult("PASS"),
                createMockResult("PASS"),
                createMockResult("PASS"),
                createMockResult("PASS"));

        // Requested page 2 (index 2), size 10. Start index = 20. Total size = 5.
        // Start (20) > Size (5) -> Should return empty list, not throw exception.
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .projectId(projectId)
                .page(2)
                .size(10)
                .build();
        filter.setDefaultSort();
        filter.setDefaultDisplayColumns();

        when(testResultRepository.findRecentTestResultsByProject(
                eq(projectId), any(PageRequest.class))).thenReturn(mockResults);

        // When
        Page<TestResultReportDto> result = testResultReportService.getDetailedTestResultReport(filter);

        // Then
        assertNotNull(result);
        assertEquals(result.getContent().size(), 0);
        assertEquals(result.getTotalElements(), 5L);

        System.out.println("✅ Pagination OutOfBounds 처리 성공: 예외 발생 안함, 빈 리스트 반환");
    }

    // Helper Methods
    private TestResult createMockResult(String result) {
        TestResult testResult = new TestResult();
        testResult.setId(UUID.randomUUID().toString());
        testResult.setResult(result);
        testResult.setExecutedAt(LocalDateTime.now());
        testResult.setExecutedBy(mockUser);
        testResult.setTestExecution(mockTestExecution);
        return testResult;
    }

    private TestResult createMockResultWithJira(String jiraKey, String result) {
        TestResult testResult = createMockResult(result);
        testResult.setJiraIssueKey(jiraKey);
        testResult.setJiraIssueUrl("https://example.atlassian.net/browse/" + jiraKey);
        testResult.setJiraSyncStatus(JiraSyncStatus.SYNCED);
        return testResult;
    }
}