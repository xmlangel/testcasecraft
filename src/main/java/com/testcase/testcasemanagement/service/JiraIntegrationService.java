// src/main/java/com/testcase/testcasemanagement/service/JiraIntegrationService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
@RequiredArgsConstructor
@Slf4j
public class JiraIntegrationService {

    private final JiraConfigService jiraConfigService;

    @Value("${app.jira.auto-comment.enabled:true}")
    private boolean autoCommentEnabled;

    @Value("${app.jira.issue-key.pattern:^[A-Z]+-\\d+$}")
    private String issueKeyPattern;

    private static final Pattern JIRA_ISSUE_PATTERN = Pattern.compile("[A-Z]+-\\d+");

    /**
     * 테스트 실행 완료 시 자동으로 JIRA 이슈에 코멘트 추가
     */
    @Async
    public void processTestExecutionResults(String userId, TestExecution testExecution, List<TestResult> testResults) {
        if (!autoCommentEnabled) {
            log.debug("JIRA 자동 코멘트 기능이 비활성화됨");
            return;
        }

        try {
            // userId는 파라미터로 전달받음
            if (userId == null) {
                log.warn("사용자 ID가 null입니다: testExecutionId={}", testExecution.getId());
                return;
            }

            // 실패한 테스트 케이스들에서 JIRA 이슈 키 추출
            Map<String, List<TestResult>> failedResultsByIssue = extractJiraIssuesFromFailedTests(testResults);

            if (failedResultsByIssue.isEmpty()) {
                log.debug("실패한 테스트에서 JIRA 이슈 키를 찾을 수 없음: testExecutionId={}", testExecution.getId());
                return;
            }

            for (Map.Entry<String, List<TestResult>> entry : failedResultsByIssue.entrySet()) {
                String issueKey = entry.getKey();
                List<TestResult> relatedFailures = entry.getValue();

                String comment = buildTestFailureComment(testExecution, relatedFailures);

                boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

                if (success) {
                    log.info("테스트 실패 JIRA 코멘트 추가 성공: issueKey={}, failureCount={}",
                            issueKey, relatedFailures.size());
                } else {
                    log.warn("테스트 실패 JIRA 코멘트 추가 실패: issueKey={}", issueKey);
                }
            }

        } catch (Exception e) {
            log.error("테스트 결과 JIRA 연동 처리 실패: testExecutionId={}", testExecution.getId(), e);
        }
    }

    /**
     * 개별 테스트 결과에 대한 JIRA 코멘트 추가 (수동)
     */
    public boolean addManualTestResultComment(String userId, String issueKey, TestResult testResult) {
        try {
            if (testResult == null) {
                log.warn("테스트 결과가 null입니다");
                return false;
            }

            String comment = buildSingleTestResultComment(testResult);

            boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

            if (success) {
                log.info("수동 테스트 결과 JIRA 코멘트 추가 성공: userId={}, issueKey={}, result={}",
                        userId, issueKey, testResult.getResult());
            }

            return success;

        } catch (Exception e) {
            log.error("수동 테스트 결과 JIRA 코멘트 추가 실패: userId={}, issueKey={}", userId, issueKey, e);
            return false;
        }
    }

    /**
     * 테스트 실행 요약 정보를 JIRA 이슈에 코멘트로 추가
     */
    public boolean addTestExecutionSummary(String userId, String issueKey, TestExecution testExecution,
            List<TestResult> testResults) {
        try {
            String comment = buildTestExecutionSummaryComment(testExecution, testResults);

            boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

            if (success) {
                log.info("테스트 실행 요약 JIRA 코멘트 추가 성공: userId={}, issueKey={}, executionId={}",
                        userId, issueKey, testExecution.getId());
            }

            return success;

        } catch (Exception e) {
            log.error("테스트 실행 요약 JIRA 코멘트 추가 실패: userId={}, issueKey={}, executionId={}",
                    userId, issueKey, testExecution.getId(), e);
            return false;
        }
    }

    /**
     * 텍스트에서 JIRA 이슈 키 추출
     */
    public List<String> extractJiraIssueKeys(String text) {
        if (text == null || text.trim().isEmpty()) {
            return List.of();
        }

        Matcher matcher = JIRA_ISSUE_PATTERN.matcher(text);
        return matcher.results()
                .map(matchResult -> matchResult.group())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * JIRA 이슈 키 유효성 검증
     */
    public boolean isValidJiraIssueKey(String issueKey) {
        if (issueKey == null || issueKey.trim().isEmpty()) {
            return false;
        }

        return Pattern.compile(issueKeyPattern).matcher(issueKey.trim()).matches();
    }

    /**
     * JIRA 이슈 존재 여부 확인
     * ICT-184: 이슈 입력 시 존재 여부 검증
     */
    public JiraConfigDto.IssueExistsDto checkJiraIssueExists(String userId, String issueKey) {
        try {
            if (issueKey == null || issueKey.trim().isEmpty()) {
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("이슈 키가 입력되지 않았습니다.")
                        .build();
            }

            // 형식 유효성 먼저 검사
            if (!isValidJiraIssueKey(issueKey)) {
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("잘못된 이슈 키 형식입니다. (예: TEST-123)")
                        .build();
            }

            // JIRA 설정이 있는지 확인
            if (!jiraConfigService.hasActiveConfig(userId)) {
                return JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("JIRA 설정이 필요합니다.")
                        .build();
            }

            // 실제 이슈 존재 여부 확인
            return jiraConfigService.checkIssueExists(userId, issueKey);

        } catch (Exception e) {
            log.error("JIRA 이슈 존재 확인 실패: userId={}, issueKey={}", userId, issueKey, e);
            return JiraConfigDto.IssueExistsDto.builder()
                    .exists(false)
                    .issueKey(issueKey)
                    .errorMessage("시스템 오류가 발생했습니다.")
                    .build();
        }
    }

    // Private helper methods

    private Map<String, List<TestResult>> extractJiraIssuesFromFailedTests(List<TestResult> testResults) {
        return testResults.stream()
                .filter(result -> "FAIL".equals(result.getResult()) || "BLOCKED".equals(result.getResult()))
                .filter(result -> result.getNotes() != null && !result.getNotes().trim().isEmpty())
                .flatMap(result -> {
                    List<String> issueKeys = extractJiraIssueKeys(result.getNotes());
                    return issueKeys.stream().map(issueKey -> Map.entry(issueKey, result));
                })
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.mapping(Map.Entry::getValue, Collectors.toList())));
    }

    private String buildTestFailureComment(TestExecution testExecution, List<TestResult> failedResults) {
        StringBuilder comment = new StringBuilder();

        comment.append("🔴 **테스트 실행 실패 알림**\n\n");

        comment.append("**테스트 실행 정보:**\n");
        comment.append("- 실행 ID: ").append(testExecution.getId()).append("\n");
        comment.append("- 테스트 플랜 ID: ").append(testExecution.getTestPlanId()).append("\n");
        comment.append("- 실행 시작: ")
                .append(testExecution.getStartDate() != null
                        ? testExecution.getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        : "미설정")
                .append("\n");
        comment.append("- 상태: ").append(testExecution.getStatus()).append("\n\n");

        comment.append("**실패한 테스트 케이스 (").append(failedResults.size()).append("건):**\n");

        for (int i = 0; i < Math.min(failedResults.size(), 5); i++) {
            TestResult result = failedResults.get(i);
            comment.append("- ").append(result.getTestCaseId())
                    .append(" (").append(result.getResult()).append(")");

            if (result.getNotes() != null && !result.getNotes().trim().isEmpty()) {
                String truncatedNotes = result.getNotes().length() > 100
                        ? result.getNotes().substring(0, 100) + "..."
                        : result.getNotes();
                comment.append(": ").append(truncatedNotes);
            }
            comment.append("\n");
        }

        if (failedResults.size() > 5) {
            comment.append("- ... 외 ").append(failedResults.size() - 5).append("건\n");
        }

        comment.append("\n**조치 필요:** 실패한 테스트 케이스를 검토하고 관련 이슈를 수정해 주세요.");

        return comment.toString();
    }

    private String buildSingleTestResultComment(TestResult testResult) {
        StringBuilder comment = new StringBuilder();

        String statusIcon = getStatusIcon(testResult.getResult());
        String statusText = getStatusText(testResult.getResult());

        comment.append(statusIcon).append(" **테스트 결과 업데이트**\n\n");

        comment.append("**테스트 정보:**\n");
        comment.append("- 테스트 케이스 ID: ").append(testResult.getTestCaseId()).append("\n");
        comment.append("- 결과: ").append(statusText).append("\n");
        comment.append("- 실행 시각: ")
                .append(testResult.getExecutedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .append("\n");

        if (testResult.getExecutedBy() != null) {
            comment.append("- 실행자: ").append(testResult.getExecutedBy().getName()).append("\n");
        }

        if (testResult.getNotes() != null && !testResult.getNotes().trim().isEmpty()) {
            comment.append("\n**상세 내용:**\n").append(testResult.getNotes());
        }

        return comment.toString();
    }

    private String buildTestExecutionSummaryComment(TestExecution testExecution, List<TestResult> testResults) {
        StringBuilder comment = new StringBuilder();

        // 결과 통계 계산
        long passCount = testResults.stream().filter(r -> "PASS".equals(r.getResult())).count();
        long failCount = testResults.stream().filter(r -> "FAIL".equals(r.getResult())).count();
        long blockedCount = testResults.stream().filter(r -> "BLOCKED".equals(r.getResult())).count();
        long notRunCount = testResults.stream().filter(r -> "NOT_RUN".equals(r.getResult())).count();

        double passRate = testResults.size() > 0 ? (double) passCount / testResults.size() * 100 : 0;

        String summaryIcon = failCount > 0 ? "🔴" : (blockedCount > 0 ? "🟡" : "✅");

        comment.append(summaryIcon).append(" **테스트 실행 완료 요약**\n\n");

        comment.append("**실행 정보:**\n");
        comment.append("- 테스트 플랜 ID: ").append(testExecution.getTestPlanId()).append("\n");
        comment.append("- 실행 시작: ")
                .append(testExecution.getStartDate() != null
                        ? testExecution.getStartDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        : "미설정")
                .append("\n");
        comment.append("- 상태: ").append(testExecution.getStatus()).append("\n\n");

        comment.append("**결과 요약:**\n");
        comment.append("- 전체: ").append(testResults.size()).append("건\n");
        comment.append("- ✅ 통과: ").append(passCount).append("건\n");
        comment.append("- ❌ 실패: ").append(failCount).append("건\n");
        comment.append("- ⚠️ 차단: ").append(blockedCount).append("건\n");
        comment.append("- ⏳ 미실행: ").append(notRunCount).append("건\n");
        comment.append("- 📊 통과율: ").append(String.format("%.1f", passRate)).append("%\n");

        if (failCount > 0) {
            comment.append("\n**실패한 테스트:**\n");
            testResults.stream()
                    .filter(r -> "FAIL".equals(r.getResult()))
                    .limit(3)
                    .forEach(r -> comment.append("- ").append(r.getTestCaseId()).append("\n"));

            if (failCount > 3) {
                comment.append("- ... 외 ").append(failCount - 3).append("건\n");
            }
        }

        return comment.toString();
    }

    private String getStatusIcon(String result) {
        return switch (result) {
            case "PASS" -> "✅";
            case "FAIL" -> "❌";
            case "BLOCKED" -> "⚠️";
            case "NOT_RUN" -> "⏳";
            default -> "📝";
        };
    }

    private String getStatusText(String result) {
        return switch (result) {
            case "PASS" -> "통과";
            case "FAIL" -> "실패";
            case "BLOCKED" -> "차단";
            case "NOT_RUN" -> "미실행";
            default -> "알 수 없음";
        };
    }
}