// src/main/java/com/testcase/testcasemanagement/service/JiraIntegrationService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.TestCaseAttachment;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestResultAttachment;
import com.testcase.testcasemanagement.model.TestResultStatus;
import com.testcase.testcasemanagement.model.TestResultStep;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JiraCommentLabels;
import com.testcase.testcasemanagement.util.JiraInlineImages;
import com.testcase.testcasemanagement.util.JiraKeyUtils;
import com.testcase.testcasemanagement.util.LabelTable.Labels;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class JiraIntegrationService {

  private final JiraConfigService jiraConfigService;
  private final TestResultRepository testResultRepository;
  private final MinIOService minIOService;
  private final TestCaseAttachmentRepository testCaseAttachmentRepository;
  private final UserRepository userRepository;
  private final I18nService i18nService;

  @Value("${app.jira.auto-comment.enabled:true}")
  private boolean autoCommentEnabled;

  @Value("${app.jira.issue-key.pattern:^[A-Z][A-Z0-9]+-[0-9]+$}")
  private String issueKeyPattern;

  private static final Pattern JIRA_ISSUE_PATTERN =
      Pattern.compile(JiraKeyUtils.JIRA_ISSUE_KEY_REGEX);

  /** 테스트 실행 완료 시 자동으로 JIRA 이슈에 코멘트 추가 */
  @Async
  public void processTestExecutionResults(
      String userId, TestExecution testExecution, List<TestResult> testResults) {
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
      Map<String, List<TestResult>> failedResultsByIssue =
          extractJiraIssuesFromFailedTests(testResults);

      if (failedResultsByIssue.isEmpty()) {
        log.debug("실패한 테스트에서 JIRA 이슈 키를 찾을 수 없음: testExecutionId={}", testExecution.getId());
        return;
      }

      Labels labels = labelsFor(userId);
      for (Map.Entry<String, List<TestResult>> entry : failedResultsByIssue.entrySet()) {
        String issueKey = entry.getKey();
        List<TestResult> relatedFailures = entry.getValue();

        String comment = buildTestFailureComment(testExecution, relatedFailures, labels);

        boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

        if (success) {
          log.info(
              "테스트 실패 JIRA 코멘트 추가 성공: issueKey={}, failureCount={}",
              issueKey,
              relatedFailures.size());
        } else {
          log.warn("테스트 실패 JIRA 코멘트 추가 실패: issueKey={}", issueKey);
        }
      }

    } catch (Exception e) {
      log.error("테스트 결과 JIRA 연동 처리 실패: testExecutionId={}", testExecution.getId(), e);
    }
  }

  /** 개별 테스트 결과에 대한 JIRA 코멘트 추가 (수동) */
  public boolean addManualTestResultComment(String userId, String issueKey, TestResult testResult) {
    try {
      if (testResult == null) {
        log.warn("테스트 결과가 null입니다");
        return false;
      }

      String comment = buildSingleTestResultComment(testResult, labelsFor(userId));

      boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

      if (success) {
        log.info(
            "수동 테스트 결과 JIRA 코멘트 추가 성공: userId={}, issueKey={}, result={}",
            userId,
            issueKey,
            testResult.getResult());
      }

      return success;

    } catch (Exception e) {
      log.error("수동 테스트 결과 JIRA 코멘트 추가 실패: userId={}, issueKey={}", userId, issueKey, e);
      return false;
    }
  }

  /** 테스트 실행 요약 정보를 JIRA 이슈에 코멘트로 추가 */
  public boolean addTestExecutionSummary(
      String userId, String issueKey, TestExecution testExecution, List<TestResult> testResults) {
    try {
      String comment =
          buildTestExecutionSummaryComment(testExecution, testResults, labelsFor(userId));

      boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

      if (success) {
        log.info(
            "테스트 실행 요약 JIRA 코멘트 추가 성공: userId={}, issueKey={}, executionId={}",
            userId,
            issueKey,
            testExecution.getId());
      }

      return success;
    } catch (Exception e) {
      log.error(
          "테스트 실행 요약 JIRA 코멘트 추가 실패: userId={}, issueKey={}, executionId={}",
          userId,
          issueKey,
          testExecution.getId(),
          e);
      return false;
    }
  }

  /** JIRA 이슈 생성 */
  public JiraConfigDto.IssueCreateResponseDto createIssue(
      String userId, JiraConfigDto.IssueCreateRequestDto request) {
    log.info(
        "JIRA 이슈 생성 요청: userId={}, projectKey={}, summary={}",
        userId,
        request.getProjectKey(),
        request.getSummary());

    // ICT-436: 본문 이미지(이 서버 주소)는 JIRA 에서 열리지 않는다. 처음에는 자리 표시 문구로 만들고,
    // 이슈가 생긴 뒤 이미지를 첨부로 올려 본문에 다시 그린다.
    JiraInlineImages.Extracted inlineImages = JiraInlineImages.extract(request.getDescription());
    JiraConfigDto.IssueCreateRequestDto createRequest = request;
    if (inlineImages.hasImages()) {
      createRequest =
          JiraConfigDto.IssueCreateRequestDto.builder()
              .projectKey(request.getProjectKey())
              .summary(request.getSummary())
              .description(JiraInlineImages.withPlaceholders(inlineImages))
              .issueTypeId(request.getIssueTypeId())
              .issueTypeName(request.getIssueTypeName())
              .testResultId(request.getTestResultId())
              .build();
    }

    JiraConfigDto.IssueCreateResponseDto response =
        jiraConfigService.createIssue(userId, createRequest);

    if (Boolean.TRUE.equals(response.getSuccess()) && inlineImages.hasImages()) {
      try {
        embedInlineImages(userId, response.getIssueKey(), inlineImages);
      } catch (Exception e) {
        // 이슈는 이미 만들어졌다. 본문 이미지는 자리 표시로 남기고 생성 결과는 그대로 돌려준다.
        log.error("JIRA 본문 이미지 반영 실패: issueKey={}", response.getIssueKey(), e);
      }
    }

    // 이슈 생성 성공 시 첨부파일 업로드 처리
    if (Boolean.TRUE.equals(response.getSuccess())
        && request.getTestResultId() != null
        && !request.getTestResultId().isEmpty()) {
      try {
        uploadAttachmentsToJira(
            userId, response.getIssueKey(), request.getTestResultId(), response);
      } catch (Exception e) {
        log.error("JIRA 이슈 생성 후 첨부파일 업로드 실패: issueKey={}", response.getIssueKey(), e);
        response.setAttachmentErrorMessage("Error while uploading attachments: " + e.getMessage());
      }
    }

    return response;
  }

  /**
   * ICT-436: 설명에 삽입된 본문 이미지를 JIRA 첨부로 올리고, 설명을 위키 마크업으로 갱신해 본문에 이미지를 그린다. 같은 이름의 첨부가 여럿이면 위키 참조가
   * 엉키므로 순번을 붙여 파일명을 겹치지 않게 한다. 토큰이 맞지 않거나 비활성인 첨부는 건너뛰고 자리 표시로 남긴다.
   */
  private void embedInlineImages(
      String userId, String issueKey, JiraInlineImages.Extracted inlineImages) {
    Map<Integer, String> uploadedNames = new HashMap<>();
    List<JiraInlineImages.InlineImage> images = inlineImages.images();
    for (int i = 0; i < images.size(); i++) {
      JiraInlineImages.InlineImage image = images.get(i);
      Optional<TestCaseAttachment> attachmentOpt =
          testCaseAttachmentRepository.findByIdAndPublicAccessToken(
              image.attachmentId(), image.token());
      if (attachmentOpt.isEmpty()
          || attachmentOpt.get().getStatus() != TestCaseAttachment.AttachmentStatus.ACTIVE) {
        log.warn("JIRA 본문 이미지로 쓸 첨부를 찾지 못함: attachmentId={}", image.attachmentId());
        continue;
      }
      TestCaseAttachment attachment = attachmentOpt.get();
      String fileName = "image-" + (i + 1) + "-" + safeFileName(attachment.getOriginalFileName());
      try (InputStream fileStream = minIOService.downloadFile(attachment.getFilePath())) {
        boolean uploaded =
            jiraConfigService.uploadAttachment(
                userId, issueKey, fileName, fileStream.readAllBytes(), attachment.getMimeType());
        if (uploaded) {
          uploadedNames.put(i, fileName);
        } else {
          log.warn("JIRA 본문 이미지 업로드 실패: issueKey={}, fileName={}", issueKey, fileName);
        }
      } catch (Exception e) {
        log.error("JIRA 본문 이미지 처리 오류: issueKey={}, fileName={}", issueKey, fileName, e);
      }
    }

    if (uploadedNames.isEmpty()) {
      return;
    }
    boolean updated =
        jiraConfigService.updateIssueDescriptionWiki(
            userId, issueKey, JiraInlineImages.toWiki(inlineImages, uploadedNames));
    if (!updated) {
      log.warn("JIRA 이슈 설명에 본문 이미지를 반영하지 못함: issueKey={}", issueKey);
    }
  }

  /** 위키 마크업의 이미지 구문({@code !이름|옵션!})을 깨뜨리는 문자를 파일명에서 뺀다. */
  private static String safeFileName(String name) {
    if (name == null || name.isBlank()) {
      return "image.png";
    }
    return name.replaceAll("[!|\\[\\]{}\\s/\\\\]+", "_");
  }

  /** 테스트 결과의 첨부파일들을 JIRA 이슈에 업로드 */
  private void uploadAttachmentsToJira(
      String userId,
      String issueKey,
      String testResultId,
      JiraConfigDto.IssueCreateResponseDto response) {
    Optional<TestResult> resultOpt = testResultRepository.findById(testResultId);
    if (resultOpt.isEmpty()) {
      log.warn("첨부파일 업로드를 위한 테스트 결과를 찾을 수 없음: testResultId={}", testResultId);
      return;
    }

    TestResult testResult = resultOpt.get();
    List<TestResultAttachment> attachments = testResult.getAttachments();

    if (attachments == null || attachments.isEmpty()) {
      log.info("업로드할 첨부파일이 없습니다: testResultId={}", testResultId);
      return;
    }

    int successCount = 0;
    for (TestResultAttachment attachment : attachments) {
      // 삭제된 파일은 제외
      if (attachment.getStatus() != TestResultAttachment.AttachmentStatus.ACTIVE) {
        continue;
      }

      try {
        log.info(
            "JIRA 첨부파일 업로드 시작: fileName={}, size={}",
            attachment.getOriginalFileName(),
            attachment.getFileSize());

        // MinIO에서 파일 가져오기
        InputStream fileStream = minIOService.downloadFile(attachment.getFilePath());
        byte[] fileData = fileStream.readAllBytes();

        boolean success =
            jiraConfigService.uploadAttachment(
                userId,
                issueKey,
                attachment.getOriginalFileName(),
                fileData,
                attachment.getMimeType());

        if (success) {
          successCount++;
        } else {
          log.warn("JIRA 첨부파일 업로드 실패: fileName={}", attachment.getOriginalFileName());
        }
      } catch (Exception e) {
        log.error("파일 처리 중 오류 발생: fileName={}", attachment.getOriginalFileName(), e);
      }
    }

    response.setAttachmentCount(successCount);
    if (successCount < attachments.size()) {
      response.setAttachmentErrorMessage(
          String.format("총 %d개의 파일 중 %d개 업로드 성공", attachments.size(), successCount));
    }
  }

  /** JIRA 이슈 유형 조회 */
  public List<JiraConfigDto.IssueTypeDto> getIssueTypes(String userId, String projectKey) {
    log.info("JIRA 이슈 유형 조회 요청: userId={}, projectKey={}", userId, projectKey);
    return jiraConfigService.getProjectIssueTypes(userId, projectKey);
  }

  /** 텍스트에서 JIRA 이슈 키 추출 */
  public List<String> extractJiraIssueKeys(String text) {
    if (text == null || text.trim().isEmpty()) {
      return List.of();
    }

    Matcher matcher = JIRA_ISSUE_PATTERN.matcher(text);
    return matcher
        .results()
        .map(matchResult -> matchResult.group())
        .distinct()
        .collect(Collectors.toList());
  }

  /** JIRA 이슈 키 유효성 검증 */
  public boolean isValidJiraIssueKey(String issueKey) {
    if (issueKey == null || issueKey.trim().isEmpty()) {
      return false;
    }

    return Pattern.compile(issueKeyPattern).matcher(issueKey.trim()).matches();
  }

  /** JIRA 이슈 존재 여부 확인 ICT-184: 이슈 입력 시 존재 여부 검증 */
  public JiraConfigDto.IssueExistsDto checkJiraIssueExists(String userId, String issueKey) {
    try {
      if (issueKey == null || issueKey.trim().isEmpty()) {
        return JiraConfigDto.IssueExistsDto.builder()
            .exists(false)
            .issueKey(issueKey)
            .errorMessage("Issue key was not provided.")
            .build();
      }

      // 형식 유효성 먼저 검사
      if (!isValidJiraIssueKey(issueKey)) {
        return JiraConfigDto.IssueExistsDto.builder()
            .exists(false)
            .issueKey(issueKey)
            .errorMessage("Invalid issue key format. (e.g., TEST-123)")
            .build();
      }

      // JIRA 설정이 있는지 확인
      if (!jiraConfigService.hasActiveConfig(userId)) {
        return JiraConfigDto.IssueExistsDto.builder()
            .exists(false)
            .issueKey(issueKey)
            .errorMessage("JIRA configuration is required.")
            .build();
      }

      // 실제 이슈 존재 여부 확인
      return jiraConfigService.checkIssueExists(userId, issueKey);

    } catch (Exception e) {
      log.error("JIRA 이슈 존재 확인 실패: userId={}, issueKey={}", userId, issueKey, e);
      return JiraConfigDto.IssueExistsDto.builder()
          .exists(false)
          .issueKey(issueKey)
          .errorMessage("A system error occurred.")
          .build();
    }
  }

  // Private helper methods

  private Map<String, List<TestResult>> extractJiraIssuesFromFailedTests(
      List<TestResult> testResults) {
    return testResults.stream()
        .filter(
            result ->
                TestResultStatus.FAIL.value().equals(result.getResult())
                    || TestResultStatus.BLOCKED.value().equals(result.getResult()))
        .filter(result -> result.getNotes() != null && !result.getNotes().trim().isEmpty())
        .flatMap(
            result -> {
              List<String> issueKeys = extractJiraIssueKeys(result.getNotes());
              return issueKeys.stream().map(issueKey -> Map.entry(issueKey, result));
            })
        .collect(
            Collectors.groupingBy(
                Map.Entry::getKey, Collectors.mapping(Map.Entry::getValue, Collectors.toList())));
  }

  /** ICT-474: 댓글을 남기는 사용자의 선호 언어로 문구 묶음을 만든다. 찾지 못하면 한국어. */
  Labels labelsFor(String userId) {
    String lang = "ko";
    try {
      if (userId != null) {
        lang =
            userRepository
                .findById(userId)
                .map(User::getPreferredLanguage)
                .filter(l -> l != null && !l.isBlank())
                .orElse("ko");
      }
      return JiraCommentLabels.TABLE.labels(lang, i18nService.getTranslationsMap(lang));
    } catch (Exception e) {
      log.warn("Jira 댓글 번역 조회 실패, 기본 문구 사용 - 사용자: {}, 언어: {}", userId, lang, e);
      return JiraCommentLabels.TABLE.defaults(lang);
    }
  }

  private static String formatDateTime(java.time.LocalDateTime value, Labels labels) {
    return value != null
        ? value.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        : labels.get("value.notSet");
  }

  private static void appendField(StringBuilder comment, Labels labels, String key, Object value) {
    comment.append("- ").append(labels.get(key)).append(": ").append(value).append("\n");
  }

  private String buildTestFailureComment(
      TestExecution testExecution, List<TestResult> failedResults, Labels labels) {
    StringBuilder comment = new StringBuilder();

    comment.append("🔴 **").append(labels.get("failure.title")).append("**\n\n");

    comment.append("**").append(labels.get("section.testExecutionInfo")).append(":**\n");
    appendField(comment, labels, "field.executionId", testExecution.getId());
    appendField(comment, labels, "field.testPlanId", testExecution.getTestPlanId());
    appendField(
        comment, labels, "field.startDate", formatDateTime(testExecution.getStartDate(), labels));
    comment
        .append("- ")
        .append(labels.get("field.status"))
        .append(": ")
        .append(testExecution.getStatus())
        .append("\n\n");

    comment
        .append("**")
        .append(labels.format("section.failedCases", Map.of("count", failedResults.size())))
        .append(":**\n");

    for (int i = 0; i < Math.min(failedResults.size(), 5); i++) {
      TestResult result = failedResults.get(i);
      comment
          .append("- ")
          .append(result.getTestCaseId())
          .append(" (")
          .append(result.getResult())
          .append(")");

      if (result.getNotes() != null && !result.getNotes().trim().isEmpty()) {
        String truncatedNotes =
            result.getNotes().length() > 100
                ? result.getNotes().substring(0, 100) + "..."
                : result.getNotes();
        comment.append(": ").append(truncatedNotes);
      }
      comment.append("\n");
      appendProblemSteps(comment, result, "  ", labels);
    }

    if (failedResults.size() > 5) {
      comment
          .append("- ")
          .append(labels.format("value.more", Map.of("count", failedResults.size() - 5)))
          .append("\n");
    }

    comment
        .append("\n**")
        .append(labels.get("failure.actionLabel"))
        .append(":** ")
        .append(labels.get("failure.actionText"));

    return comment.toString();
  }

  private String buildSingleTestResultComment(TestResult testResult, Labels labels) {
    StringBuilder comment = new StringBuilder();

    String statusIcon = getStatusIcon(testResult.getResult());
    String statusText = getStatusText(testResult.getResult(), labels);

    comment.append(statusIcon).append(" **").append(labels.get("result.title")).append("**\n\n");

    comment.append("**").append(labels.get("section.testInfo")).append(":**\n");
    appendField(comment, labels, "field.testCaseId", testResult.getTestCaseId());
    appendField(comment, labels, "field.result", statusText);
    appendField(
        comment, labels, "field.executedAt", formatDateTime(testResult.getExecutedAt(), labels));

    if (testResult.getExecutedBy() != null) {
      appendField(comment, labels, "field.executor", testResult.getExecutedBy().getName());
    }

    if (testResult.getNotes() != null && !testResult.getNotes().trim().isEmpty()) {
      comment
          .append("\n**")
          .append(labels.get("section.details"))
          .append(":**\n")
          .append(testResult.getNotes());
    }

    // ICT-469: 실패·차단 스텝을 기대 / 실제 형식으로
    if (hasProblemSteps(testResult)) {
      comment.append("\n\n**").append(labels.get("section.problemSteps")).append(":**\n");
      appendProblemSteps(comment, testResult, "", labels);
    }

    return comment.toString();
  }

  private static boolean isProblemStep(TestResultStep step) {
    return "FAIL".equals(step.getResult()) || "BLOCKED".equals(step.getResult());
  }

  private static boolean hasProblemSteps(TestResult result) {
    return result.getSteps() != null
        && result.getSteps().stream().anyMatch(JiraIntegrationService::isProblemStep);
  }

  /** ICT-469: FAIL·BLOCKED 스텝을 한 줄씩, 아래에 기대·실제 결과. 문구는 한국어 기본값 */
  static void appendProblemSteps(StringBuilder comment, TestResult result, String indent) {
    appendProblemSteps(comment, result, indent, JiraCommentLabels.TABLE.defaults("ko"));
  }

  /** ICT-474: 문구를 요청 언어로 */
  static void appendProblemSteps(
      StringBuilder comment, TestResult result, String indent, Labels labels) {
    if (!hasProblemSteps(result)) {
      return;
    }
    String stepLabel = labels.get("step.label");
    String expectedLabel = labels.get("step.expected");
    String actualLabel = labels.get("step.actual");
    result.getSteps().stream()
        .filter(JiraIntegrationService::isProblemStep)
        .sorted(java.util.Comparator.comparingInt(TestResultStep::getStepNumber))
        .forEach(
            st -> {
              comment
                  .append(indent)
                  .append("- ")
                  .append(stepLabel)
                  .append(" ")
                  .append(st.getStepNumber())
                  .append(" ")
                  .append(st.getResult());
              if (st.getDescription() != null && !st.getDescription().isBlank()) {
                comment.append(": ").append(st.getDescription());
              }
              comment.append("\n");
              if (st.getExpectedResult() != null && !st.getExpectedResult().isBlank()) {
                comment
                    .append(indent)
                    .append("  - ")
                    .append(expectedLabel)
                    .append(": ")
                    .append(st.getExpectedResult())
                    .append("\n");
              }
              if (st.getActualResult() != null && !st.getActualResult().isBlank()) {
                comment
                    .append(indent)
                    .append("  - ")
                    .append(actualLabel)
                    .append(": ")
                    .append(st.getActualResult())
                    .append("\n");
              }
            });
  }

  private String buildTestExecutionSummaryComment(
      TestExecution testExecution, List<TestResult> testResults, Labels labels) {
    StringBuilder comment = new StringBuilder();

    // 결과 통계 계산
    long passCount =
        testResults.stream()
            .filter(r -> TestResultStatus.PASS.value().equals(r.getResult()))
            .count();
    long failCount =
        testResults.stream()
            .filter(r -> TestResultStatus.FAIL.value().equals(r.getResult()))
            .count();
    long blockedCount =
        testResults.stream()
            .filter(r -> TestResultStatus.BLOCKED.value().equals(r.getResult()))
            .count();
    long notRunCount =
        testResults.stream()
            .filter(r -> TestResultStatus.NOT_RUN.value().equals(r.getResult()))
            .count();

    double passRate = testResults.size() > 0 ? (double) passCount / testResults.size() * 100 : 0;

    String summaryIcon = failCount > 0 ? "🔴" : (blockedCount > 0 ? "🟡" : "✅");

    comment.append(summaryIcon).append(" **").append(labels.get("summary.title")).append("**\n\n");

    comment.append("**").append(labels.get("section.executionInfo")).append(":**\n");
    appendField(comment, labels, "field.testPlanId", testExecution.getTestPlanId());
    appendField(
        comment, labels, "field.startDate", formatDateTime(testExecution.getStartDate(), labels));
    comment
        .append("- ")
        .append(labels.get("field.status"))
        .append(": ")
        .append(testExecution.getStatus())
        .append("\n\n");

    comment.append("**").append(labels.get("section.resultSummary")).append(":**\n");
    comment
        .append("- ")
        .append(labels.format("summary.total", Map.of("count", testResults.size())))
        .append("\n");
    comment
        .append("- ✅ ")
        .append(labels.format("summary.pass", Map.of("count", passCount)))
        .append("\n");
    comment
        .append("- ❌ ")
        .append(labels.format("summary.fail", Map.of("count", failCount)))
        .append("\n");
    comment
        .append("- ⚠️ ")
        .append(labels.format("summary.blocked", Map.of("count", blockedCount)))
        .append("\n");
    comment
        .append("- ⏳ ")
        .append(labels.format("summary.notRun", Map.of("count", notRunCount)))
        .append("\n");
    comment
        .append("- 📊 ")
        .append(labels.format("summary.passRate", Map.of("rate", String.format("%.1f", passRate))))
        .append("\n");

    if (failCount > 0) {
      comment.append("\n**").append(labels.get("section.failedTests")).append(":**\n");
      testResults.stream()
          .filter(r -> TestResultStatus.FAIL.value().equals(r.getResult()))
          .limit(3)
          .forEach(r -> comment.append("- ").append(r.getTestCaseId()).append("\n"));

      if (failCount > 3) {
        comment
            .append("- ")
            .append(labels.format("value.more", Map.of("count", failCount - 3)))
            .append("\n");
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

  private String getStatusText(String result, Labels labels) {
    return switch (result) {
      case "PASS" -> labels.get("status.pass");
      case "FAIL" -> labels.get("status.fail");
      case "BLOCKED" -> labels.get("status.blocked");
      case "NOT_RUN" -> labels.get("status.notRun");
      default -> labels.get("status.unknown");
    };
  }
}
