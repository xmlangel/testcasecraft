package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCaseLatestResultDto;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 프로젝트의 케이스별 가장 최근 실행 결과를 한 번에 돌려준다(ICT-491 케이스 목록 「최근 결과」 열). */
@Service
@RequiredArgsConstructor
public class TestCaseLatestResultService {

  private final TestResultRepository testResultRepository;
  private final ProjectSecurityService projectSecurityService;

  @Transactional(readOnly = true)
  public Map<String, TestCaseLatestResultDto> getLatestResults(String projectId) {
    if (!projectSecurityService.canAccessProject(projectId)) {
      throw new AccessDeniedException("No permission to access the project: " + projectId);
    }
    return pickLatest(testResultRepository.findExecutedResultRowsByProjectId(projectId));
  }

  /** (testCaseId, result, executedAt) 행에서 케이스마다 executedAt 이 가장 늦은 행을 고른다. */
  static Map<String, TestCaseLatestResultDto> pickLatest(List<Object[]> rows) {
    Map<String, TestCaseLatestResultDto> latest = new HashMap<>();
    for (Object[] row : rows) {
      String testCaseId = (String) row[0];
      LocalDateTime executedAt = (LocalDateTime) row[2];
      if (testCaseId == null || executedAt == null) {
        continue;
      }
      TestCaseLatestResultDto current = latest.get(testCaseId);
      if (current == null || executedAt.isAfter(current.executedAt())) {
        latest.put(testCaseId, new TestCaseLatestResultDto((String) row[1], executedAt));
      }
    }
    return latest;
  }
}
