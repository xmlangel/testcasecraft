package com.testcase.testcasemanagement.service;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestResultStep;
import java.util.ArrayList;
import java.util.List;
import org.testng.annotations.Test;

/** ICT-469: Jira 댓글의 실패·차단 스텝 */
public class JiraIntegrationServiceStepCommentTest {

  @Test
  public void onlyFailedAndBlockedStepsWithExpectedAndActual() {
    TestResult r = new TestResult();
    r.setSteps(
        new ArrayList<>(
            List.of(
                new TestResultStep(3, "로그아웃", null, "BLOCKED", null),
                new TestResultStep(1, "열기", "화면", "PASS", null),
                new TestResultStep(2, "저장", "저장 완료 알림", "FAIL", "반응 없음"))));
    StringBuilder sb = new StringBuilder();
    JiraIntegrationService.appendProblemSteps(sb, r, "");
    assertEquals(
        sb.toString(), "- 스텝 2 FAIL: 저장\n  - 기대: 저장 완료 알림\n  - 실제: 반응 없음\n- 스텝 3 BLOCKED: 로그아웃\n");
  }

  @Test
  public void noStepsAddsNothing() {
    StringBuilder sb = new StringBuilder();
    JiraIntegrationService.appendProblemSteps(sb, new TestResult(), "");
    assertEquals(sb.toString(), "");
  }
}
