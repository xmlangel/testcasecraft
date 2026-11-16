package com.testcase.testcasemanagement.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.TestCaseLatestResultDto;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-491: 케이스 목록 「최근 결과」 열이 케이스마다 가장 늦게 실행된 결과를 받는지 확인한다. */
public class TestCaseLatestResultServiceTest {

  private static final String PROJECT = "11111111-1111-1111-1111-111111111111";

  private TestResultRepository testResultRepository;
  private ProjectSecurityService projectSecurityService;
  private TestCaseLatestResultService service;

  @BeforeMethod
  public void setUp() {
    testResultRepository = Mockito.mock(TestResultRepository.class);
    projectSecurityService = Mockito.mock(ProjectSecurityService.class);
    service = new TestCaseLatestResultService(testResultRepository, projectSecurityService);
  }

  @Test
  public void picksLatestExecutedResultPerTestCase() {
    LocalDateTime t1 = LocalDateTime.of(2026, 11, 1, 10, 0);
    LocalDateTime t2 = LocalDateTime.of(2026, 11, 2, 10, 0);
    when(projectSecurityService.canAccessProject(PROJECT)).thenReturn(true);
    when(testResultRepository.findExecutedResultRowsByProjectId(PROJECT))
        .thenReturn(
            List.of(
                new Object[] {"tc1", "FAIL", t2},
                new Object[] {"tc1", "PASS", t1},
                new Object[] {"tc2", "BLOCKED", t1},
                new Object[] {"tc3", "PASS", null}));

    Map<String, TestCaseLatestResultDto> latest = service.getLatestResults(PROJECT);

    Assert.assertEquals(latest.size(), 2);
    Assert.assertEquals(latest.get("tc1"), new TestCaseLatestResultDto("FAIL", t2));
    Assert.assertEquals(latest.get("tc2").result(), "BLOCKED");
    Assert.assertFalse(latest.containsKey("tc3"));
  }

  @Test
  public void rejectsProjectWithoutAccess() {
    when(projectSecurityService.canAccessProject(PROJECT)).thenReturn(false);

    Assert.assertThrows(AccessDeniedException.class, () -> service.getLatestResults(PROJECT));
    verify(testResultRepository, never()).findExecutedResultRowsByProjectId(PROJECT);
  }
}
