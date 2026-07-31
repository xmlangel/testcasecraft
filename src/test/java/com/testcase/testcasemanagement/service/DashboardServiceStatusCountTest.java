package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;

import com.testcase.testcasemanagement.dto.TestCaseStatisticsDto;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Pageable;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(실행 상태 리터럴 NOT_RUN/NOTRUN 드리프트) 수정 회귀 가드.
 *
 * <p>저장 정본은 "NOT_RUN"(언더스코어)인데 집계가 "NOTRUN"(언더스코어 없음) 버킷을 읽어 미실행 건수가 0으로 누락됐다. 실제 "NOT_RUN" 결과가
 * NOTRUN 통계에 정확히 반영되는지 검증한다.
 */
public class DashboardServiceStatusCountTest {

  @Mock private TestResultRepository testResultRepository;
  @InjectMocks private DashboardService dashboardService;

  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  private TestResult result(String execId, String caseId, String status) {
    TestExecution exec = new TestExecution();
    exec.setId(execId);
    TestResult tr = new TestResult();
    tr.setTestExecution(exec);
    tr.setTestCaseId(caseId);
    tr.setResult(status);
    tr.setExecutedAt(LocalDateTime.now());
    return tr;
  }

  @Test
  public void notRunResults_areCountedUnderNotRun_notLostToLiteralDrift() {
    List<TestResult> data =
        List.of(
            result("e1", "c1", "PASS"),
            result("e1", "c2", "FAIL"),
            result("e1", "c3", "NOT_RUN"),
            result("e1", "c4", "NOT_RUN"));
    when(testResultRepository.findRecentTestResultsByProject(eq("p1"), any(Pageable.class)))
        .thenReturn(data);

    TestCaseStatisticsDto stats = dashboardService.getTestCaseStatistics("p1");

    assertEquals(stats.getTotalCases(), 4);
    assertEquals(stats.getPASS().intValue(), 1);
    assertEquals(stats.getFAIL().intValue(), 1);
    // 핵심: 실제 NOT_RUN 2건이 누락 없이 집계돼야 함 (드리프트 수정 전에는 0)
    assertEquals(stats.getNOTRUN().intValue(), 2);
  }
}
