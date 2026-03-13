package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.BulkTestResultDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * ICT-341: TestExecutionService의 DisplayID 기반 결과 입력 기능 테스트
 */
public class TestExecutionServiceDisplayIdTest {

    @Mock
    private TestExecutionRepository testExecutionRepository;
    @Mock
    private TestResultRepository testResultRepository;
    @Mock
    private TestPlanRepository testPlanRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JiraIntegrationService jiraIntegrationService;
    @Mock
    private TestCaseRepository testCaseRepository;

    private TestExecutionService testExecutionService;

    private TestExecution mockExecution;
    private Project mockProject;
    private TestCase mockTestCase;
    private User mockUser;

    @BeforeMethod
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // 서비스 수동 생성 (생성자 주입 방식 대응)
        testExecutionService = new TestExecutionService(
                testExecutionRepository,
                testResultRepository,
                testPlanRepository,
                projectRepository,
                userRepository,
                jiraIntegrationService,
                testCaseRepository
        );

        // SecurityContext Mocking
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("testuser");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        mockUser = new User();
        mockUser.setId("user-1");
        mockUser.setUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

        mockProject = new Project();
        mockProject.setId("project-1");
        
        mockExecution = new TestExecution();
        mockExecution.setId("exec-1");
        mockExecution.setProject(mockProject);
        mockExecution.setResults(new ArrayList<>());
        
        mockTestCase = new TestCase();
        mockTestCase.setId("uuid-123");
        mockTestCase.setDisplayId("ON-439");
        mockTestCase.setProject(mockProject);

        when(testExecutionRepository.findById("exec-1")).thenReturn(Optional.of(mockExecution));
        when(testExecutionRepository.findByIdWithResults("exec-1")).thenReturn(Optional.of(mockExecution));
        when(testExecutionRepository.save(any(TestExecution.class))).thenAnswer(i -> i.getArguments()[0]);
    }



    /**
     * testCaseId(UUID)가 제공된 경우 DisplayID보다 우선순위를 갖는지 테스트 (하위 호환성)
     */
    @Test
    public void testUpdateTestResult_PriorityToTestCaseId() {
        // Given
        TestResultDto dto = new TestResultDto();
        dto.setTestCaseId("uuid-direct");
        dto.setDisplayId("ON-439"); // 제공되어도 무시되어야 함
        dto.setResult("PASS");

        // When
        testExecutionService.updateTestResult("exec-1", dto);

        // Then
        verify(testCaseRepository, never()).findByProjectIdAndDisplayId(anyString(), anyString());
        assertEquals(mockExecution.getResults().size(), 1);
        assertEquals(mockExecution.getResults().get(0).getTestCaseId(), "uuid-direct");
    }

    /**
     * testCaseId가 없고 DisplayID만 제공된 경우 조회를 수행하는지 테스트
     */
    @Test
    public void testUpdateTestResult_FallbackToDisplayId() {
        // Given
        TestResultDto dto = new TestResultDto();
        dto.setTestCaseId(null);
        dto.setDisplayId("ON-439");
        dto.setResult("FAIL");

        when(testCaseRepository.findByProjectIdAndDisplayId("project-1", "ON-439"))
                .thenReturn(Optional.of(mockTestCase));

        // When
        testExecutionService.updateTestResult("exec-1", dto);

        // Then
        verify(testCaseRepository, times(1)).findByProjectIdAndDisplayId("project-1", "ON-439");
        assertEquals(mockExecution.getResults().size(), 1);
        assertEquals(mockExecution.getResults().get(0).getTestCaseId(), "uuid-123");
    }

    /**
     * 일괄 업데이트에서 UUID와 DisplayID를 혼합하여 사용하는 테스트
     */
    @Test
    public void testUpdateTestResultsBulk_MixedIds() {
        // Given
        BulkTestResultDto bulkDto = new BulkTestResultDto();
        bulkDto.setTestCaseIds(Collections.singletonList("uuid-direct"));
        bulkDto.setDisplayIds(Collections.singletonList("ON-439"));
        bulkDto.setResult("PASS");

        TestCase otherCase = new TestCase();
        otherCase.setId("uuid-from-display");
        when(testCaseRepository.findByProjectIdAndDisplayId("project-1", "ON-439"))
                .thenReturn(Optional.of(otherCase));

        // When
        testExecutionService.updateTestResultsBulk("exec-1", bulkDto);

        // Then
        assertEquals(mockExecution.getResults().size(), 2);
        Set<String> resultIds = new HashSet<>();
        mockExecution.getResults().forEach(r -> resultIds.add(r.getTestCaseId()));
        
        assertTrue(resultIds.contains("uuid-direct"));
        assertTrue(resultIds.contains("uuid-from-display"));
    }

    /**
     * 존재하지 않는 DisplayID 제공 시 예외 발생 테스트
     */
    @Test(expectedExceptions = IllegalArgumentException.class)
    public void testUpdateTestResult_InvalidDisplayId() {
        // Given
        TestResultDto dto = new TestResultDto();
        dto.setDisplayId("NON-EXISTENT");
        dto.setResult("PASS");

        when(testCaseRepository.findByProjectIdAndDisplayId(anyString(), eq("NON-EXISTENT")))
                .thenReturn(Optional.empty());

        // When
        testExecutionService.updateTestResult("exec-1", dto);
    }
}
