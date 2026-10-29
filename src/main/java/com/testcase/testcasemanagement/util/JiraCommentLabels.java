// src/main/java/com/testcase/testcasemanagement/util/JiraCommentLabels.java
package com.testcase.testcasemanagement.util;

import com.testcase.testcasemanagement.util.LabelTable.Entry;
import java.util.List;

/**
 * ICT-474: 서버가 Jira 이슈에 남기는 자동 댓글(실행 실패 알림, 결과 업데이트, 실행 완료 요약)의 문구.
 *
 * <p>번역 키 등록과 한국어·영어 시드, {@code JiraIntegrationService} 가 모두 이 표를 읽는다. 조회 방식은 {@link LabelTable} 을
 * 따른다. 사용자가 입력한 비고·스텝 설명·실제 결과는 번역하지 않는다.
 */
public final class JiraCommentLabels {

  private JiraCommentLabels() {}

  public static final String PREFIX = "jira.autoComment.";

  public static final LabelTable TABLE =
      new LabelTable(
          PREFIX,
          List.of(
              // 제목
              new Entry(
                  "failure.title",
                  "Jira 댓글: 실행 실패 알림 제목",
                  "테스트 실행 실패 알림",
                  "Test execution failure alert"),
              new Entry("result.title", "Jira 댓글: 결과 업데이트 제목", "테스트 결과 업데이트", "Test result update"),
              new Entry(
                  "summary.title",
                  "Jira 댓글: 실행 완료 요약 제목",
                  "테스트 실행 완료 요약",
                  "Test execution summary"),
              // 절 머리말
              new Entry(
                  "section.testExecutionInfo",
                  "Jira 댓글: 테스트 실행 정보",
                  "테스트 실행 정보",
                  "Test execution info"),
              new Entry("section.executionInfo", "Jira 댓글: 실행 정보", "실행 정보", "Execution info"),
              new Entry("section.testInfo", "Jira 댓글: 테스트 정보", "테스트 정보", "Test info"),
              new Entry("section.details", "Jira 댓글: 상세 내용", "상세 내용", "Details"),
              new Entry(
                  "section.problemSteps",
                  "Jira 댓글: 실패·차단 스텝",
                  "실패·차단 스텝",
                  "Failed or blocked steps"),
              new Entry("section.resultSummary", "Jira 댓글: 결과 요약", "결과 요약", "Result summary"),
              new Entry("section.failedTests", "Jira 댓글: 실패한 테스트", "실패한 테스트", "Failed tests"),
              new Entry(
                  "section.failedCases",
                  "Jira 댓글: 실패한 테스트 케이스와 건수",
                  "실패한 테스트 케이스 ({count}건)",
                  "Failed test cases ({count})"),
              // 항목 이름
              new Entry("field.executionId", "Jira 댓글: 실행 ID", "실행 ID", "Execution ID"),
              new Entry("field.testPlanId", "Jira 댓글: 테스트 플랜 ID", "테스트 플랜 ID", "Test plan ID"),
              new Entry("field.startDate", "Jira 댓글: 실행 시작", "실행 시작", "Started"),
              new Entry("field.status", "Jira 댓글: 상태", "상태", "Status"),
              new Entry("field.testCaseId", "Jira 댓글: 테스트 케이스 ID", "테스트 케이스 ID", "Test case ID"),
              new Entry("field.result", "Jira 댓글: 결과", "결과", "Result"),
              new Entry("field.executedAt", "Jira 댓글: 실행 시각", "실행 시각", "Executed at"),
              new Entry("field.executor", "Jira 댓글: 실행자", "실행자", "Executor"),
              new Entry("value.notSet", "Jira 댓글: 값 없음", "미설정", "Not set"),
              new Entry("value.more", "Jira 댓글: 나머지 건수", "... 외 {count}건", "... and {count} more"),
              // 조치 안내
              new Entry("failure.actionLabel", "Jira 댓글: 조치 필요 머리말", "조치 필요", "Action required"),
              new Entry(
                  "failure.actionText",
                  "Jira 댓글: 조치 안내",
                  "실패한 테스트 케이스를 검토하고 관련 이슈를 수정해 주세요.",
                  "Review the failed test cases and fix the related issues."),
              // 스텝
              new Entry("step.label", "Jira 댓글: 스텝", "스텝", "Step"),
              new Entry("step.expected", "Jira 댓글: 스텝 기대 결과", "기대", "Expected"),
              new Entry("step.actual", "Jira 댓글: 스텝 실제 결과", "실제", "Actual"),
              // 결과 요약
              new Entry("summary.total", "Jira 댓글: 전체 건수", "전체: {count}건", "Total: {count}"),
              new Entry("summary.pass", "Jira 댓글: 통과 건수", "통과: {count}건", "Passed: {count}"),
              new Entry("summary.fail", "Jira 댓글: 실패 건수", "실패: {count}건", "Failed: {count}"),
              new Entry("summary.blocked", "Jira 댓글: 차단 건수", "차단: {count}건", "Blocked: {count}"),
              new Entry("summary.notRun", "Jira 댓글: 미실행 건수", "미실행: {count}건", "Not run: {count}"),
              new Entry("summary.passRate", "Jira 댓글: 통과율", "통과율: {rate}%", "Pass rate: {rate}%"),
              // 결과 값
              new Entry("status.pass", "Jira 댓글 결과: 통과", "통과", "Pass"),
              new Entry("status.fail", "Jira 댓글 결과: 실패", "실패", "Fail"),
              new Entry("status.blocked", "Jira 댓글 결과: 차단", "차단", "Blocked"),
              new Entry("status.notRun", "Jira 댓글 결과: 미실행", "미실행", "Not run"),
              new Entry("status.unknown", "Jira 댓글 결과: 알 수 없음", "알 수 없음", "Unknown")));
}
