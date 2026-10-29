package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.dto.TestResultStepDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import java.util.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-469: 결과 저장·수정 요청의 steps 처리 */
public class TestExecutionServiceStepResultsTest {

  @Mock private TestExecutionRepository testExecutionRepository;
  @Mock private TestResultRepository testResultRepository;
  @Mock private TestPlanRepository testPlanRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private UserRepository userRepository;
  @Mock private JiraIntegrationService jiraIntegrationService;
  @Mock private TestCaseRepository testCaseRepository;
  @Mock private TestCaseFileStorageService fileStorageService;
  @Mock private ProjectSecurityService projectSecurityService;

  private TestExecutionService service;
  private TestExecution execution;
  private TestCase testCase;
  private User user;

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    service =
        new TestExecutionService(
            testExecutionRepository,
            testResultRepository,
            testPlanRepository,
            projectRepository,
            userRepository,
            jiraIntegrationService,
            testCaseRepository,
            fileStorageService,
            projectSecurityService);

    Authentication authentication = mock(Authentication.class);
    when(authentication.getName()).thenReturn("tester");
    SecurityContext ctx = mock(SecurityContext.class);
    when(ctx.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(ctx);

    user = new User();
    user.setId("user-1");
    user.setUsername("tester");
    user.setRole("USER");
    when(userRepository.findByUsername("tester")).thenReturn(Optional.of(user));

    Project project = new Project();
    project.setId("project-1");
    execution = new TestExecution();
    execution.setId("exec-1");
    execution.setProject(project);
    execution.setResults(new ArrayList<>());

    testCase = new TestCase();
    testCase.setId("tc-1");
    testCase.setProject(project);
    testCase.setSteps(
        new ArrayList<>(
            List.of(
                new TestStep(1, "로그인", "대시보드가 보인다"),
                new TestStep(2, "저장", "저장 완료 알림"),
                new TestStep(3, "로그아웃", "로그인 화면"))));
    when(testCaseRepository.findById("tc-1")).thenReturn(Optional.of(testCase));

    when(testExecutionRepository.findByIdWithResults("exec-1")).thenReturn(Optional.of(execution));
    when(testExecutionRepository.save(any(TestExecution.class)))
        .thenAnswer(i -> i.getArguments()[0]);
    when(testResultRepository.save(any(TestResult.class))).thenAnswer(i -> i.getArguments()[0]);
    when(projectSecurityService.canRecordTestResult(anyString())).thenReturn(true);
  }

  @AfterMethod
  public void clear() {
    SecurityContextHolder.clearContext();
  }

  private static TestResultStepDto step(int n, String result, String actual) {
    TestResultStepDto d = new TestResultStepDto();
    d.setStepNumber(n);
    d.setResult(result);
    d.setActualResult(actual);
    return d;
  }

  private TestResultDto request(String result, TestResultStepDto... steps) {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult(result);
    dto.setSteps(steps.length == 0 ? null : new ArrayList<>(List.of(steps)));
    return dto;
  }

  private TestResult saved() {
    return execution.getResults().get(0);
  }

  @Test
  public void withoutStepsBehavesAsBefore() {
    service.updateTestResult("exec-1", request("PASS"));
    assertEquals(saved().getResult(), "PASS");
    assertTrue(saved().getSteps().isEmpty());
  }

  @Test
  public void stepsWithoutResultRollUpToFail() {
    service.updateTestResult(
        "exec-1",
        request(null, step(1, "PASS", null), step(2, "FAIL", "반응 없음"), step(3, "BLOCKED", null)));
    assertEquals(saved().getResult(), "FAIL");
    assertEquals(saved().getSteps().size(), 3);
    TestResultStep s2 = saved().getSteps().get(1);
    assertEquals(s2.getActualResult(), "반응 없음");
    // 설명·기대 결과는 케이스에서 복사한 실행 당시 사본
    assertEquals(s2.getDescription(), "저장");
    assertEquals(s2.getExpectedResult(), "저장 완료 알림");
  }

  @Test
  public void missingStepsAreStoredAsNotRunAndKeepCaseNotRun() {
    service.updateTestResult("exec-1", request(null, step(1, "PASS", null), step(3, "PASS", null)));
    assertEquals(saved().getSteps().size(), 3);
    assertEquals(saved().getSteps().get(1).getResult(), "NOT_RUN");
    assertEquals(saved().getResult(), "NOT_RUN");
  }

  @Test
  public void explicitResultOverridesRollup() {
    service.updateTestResult("exec-1", request("PASS", step(1, "FAIL", "x")));
    assertEquals(saved().getResult(), "PASS");
    assertEquals(saved().getSteps().get(0).getResult(), "FAIL");
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void unknownStepNumberIsRejected() {
    service.updateTestResult("exec-1", request(null, step(9, "PASS", null)));
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void duplicateStepNumberIsRejected() {
    service.updateTestResult("exec-1", request(null, step(1, "PASS", null), step(1, "FAIL", null)));
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void noResultAndNoStepsIsRejected() {
    service.updateTestResult("exec-1", request(null));
  }

  @Test
  public void updateReplacesStepsAgainstSnapshotNotCurrentCase() {
    service.updateTestResult(
        "exec-1",
        request(null, step(1, "PASS", null), step(2, "PASS", null), step(3, "PASS", null)));
    TestResult existing = saved();
    existing.setId("res-1");
    existing.setExecutedBy(user);
    when(testResultRepository.findById("res-1")).thenReturn(Optional.of(existing));

    // 실행 뒤 케이스 스텝을 고쳐도 수정은 실행 당시 사본을 기준으로 한다
    testCase.getSteps().get(1).setDescription("바뀐 설명");

    TestResultDto put = request(null, step(2, "FAIL", "다시 해 보니 실패"));
    TestResultDto out = service.updatePreviousTestResult("res-1", put, "tester");

    assertEquals(out.getResult(), "FAIL");
    assertEquals(out.getSteps().size(), 3);
    assertEquals(out.getSteps().get(0).getResult(), "NOT_RUN");
    assertEquals(out.getSteps().get(1).getDescription(), "저장");
    assertEquals(out.getSteps().get(1).getActualResult(), "다시 해 보니 실패");
  }

  @Test
  public void updateWithoutStepsKeepsExistingSteps() {
    service.updateTestResult(
        "exec-1",
        request(null, step(1, "PASS", null), step(2, "PASS", null), step(3, "PASS", null)));
    TestResult existing = saved();
    existing.setId("res-1");
    existing.setExecutedBy(user);
    when(testResultRepository.findById("res-1")).thenReturn(Optional.of(existing));

    TestResultDto out = service.updatePreviousTestResult("res-1", request("BLOCKED"), "tester");
    assertEquals(out.getResult(), "BLOCKED");
    assertEquals(out.getSteps().size(), 3);
    assertEquals(out.getSteps().get(2).getResult(), "PASS");
  }

  @Test
  public void rollupOrder() {
    assertEquals(TestExecutionService.rollupStepResults(steps("PASS", "BLOCKED", "FAIL")), "FAIL");
    assertEquals(
        TestExecutionService.rollupStepResults(steps("PASS", "NOT_RUN", "BLOCKED")), "BLOCKED");
    assertEquals(TestExecutionService.rollupStepResults(steps("PASS", "NOT_RUN")), "NOT_RUN");
    assertEquals(TestExecutionService.rollupStepResults(steps("PASS", "PASS")), "PASS");
  }

  private static List<TestResultStep> steps(String... results) {
    List<TestResultStep> out = new ArrayList<>();
    for (int i = 0; i < results.length; i++) {
      out.add(new TestResultStep(i + 1, null, null, results[i], null));
    }
    return out;
  }
}
