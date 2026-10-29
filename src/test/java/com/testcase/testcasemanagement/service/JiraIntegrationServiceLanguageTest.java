package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestResultStep;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JiraCommentLabels;
import com.testcase.testcasemanagement.util.LabelTable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-474: Jira 자동 댓글이 댓글을 남기는 사용자의 선호 언어를 따른다 */
public class JiraIntegrationServiceLanguageTest {

  private static final String HANGUL = "(?s).*[가-힣].*";

  private JiraConfigService jiraConfigService;
  private UserRepository userRepository;
  private I18nService i18nService;
  private JiraIntegrationService service;

  @BeforeMethod
  void setUp() {
    jiraConfigService = mock(JiraConfigService.class);
    userRepository = mock(UserRepository.class);
    i18nService = mock(I18nService.class);
    when(jiraConfigService.addTestResultComment(anyString(), anyString(), anyString()))
        .thenReturn(true);
    when(i18nService.getTranslationsMap(anyString())).thenReturn(Map.of());
    service =
        new JiraIntegrationService(
            jiraConfigService,
            mock(TestResultRepository.class),
            mock(MinIOService.class),
            mock(TestCaseAttachmentRepository.class),
            userRepository,
            i18nService);
    ReflectionTestUtils.setField(service, "autoCommentEnabled", true);
  }

  private void userWithLanguage(String id, String lang) {
    User u = new User();
    u.setId(id);
    u.setPreferredLanguage(lang);
    when(userRepository.findById(id)).thenReturn(Optional.of(u));
  }

  private static TestResult failedResult() {
    TestResult r = new TestResult();
    r.setTestCaseId("tc-1");
    r.setResult("FAIL");
    r.setNotes("ICT-1 broken");
    r.setExecutedAt(LocalDateTime.of(2026, 10, 29, 9, 0));
    r.setSteps(
        new ArrayList<>(List.of(new TestResultStep(2, "Save", "Saved", "FAIL", "no response"))));
    return r;
  }

  private static TestExecution execution() {
    TestExecution e = new TestExecution();
    e.setId("exec-1");
    e.setTestPlanId("plan-1");
    e.setStatus("COMPLETED");
    return e;
  }

  private String capturedComment(String userId) {
    ArgumentCaptor<String> c = ArgumentCaptor.forClass(String.class);
    verify(jiraConfigService).addTestResultComment(eq(userId), anyString(), c.capture());
    return c.getValue();
  }

  @Test
  public void resultCommentInEnglish() {
    userWithLanguage("u-en", "en");
    assertTrue(service.addManualTestResultComment("u-en", "ICT-1", failedResult()));
    String comment = capturedComment("u-en");
    assertTrue(comment.contains("**Test result update**"), comment);
    assertTrue(comment.contains("- Result: Fail"), comment);
    assertTrue(comment.contains("**Failed or blocked steps:**"), comment);
    assertTrue(
        comment.contains("- Step 2 FAIL: Save\n  - Expected: Saved\n  - Actual: no response"),
        comment);
    assertFalse(comment.matches(HANGUL), comment);
  }

  @Test
  public void resultCommentDefaultsToKoreanForUnknownUser() {
    when(userRepository.findById("u-x")).thenReturn(Optional.empty());
    service.addManualTestResultComment("u-x", "ICT-1", failedResult());
    String comment = capturedComment("u-x");
    assertTrue(comment.contains("**테스트 결과 업데이트**"), comment);
    assertTrue(comment.contains("- 결과: 실패"), comment);
    assertTrue(comment.contains("- 스텝 2 FAIL: Save\n  - 기대: Saved\n  - 실제: no response"), comment);
  }

  @Test
  public void failureAlertInEnglish() {
    userWithLanguage("u-en", "en");
    List<TestResult> results = new ArrayList<>();
    for (int i = 0; i < 6; i++) results.add(failedResult());
    service.processTestExecutionResults("u-en", execution(), results);
    String comment = capturedComment("u-en");
    assertTrue(comment.contains("**Test execution failure alert**"), comment);
    assertTrue(comment.contains("- Started: Not set"), comment);
    assertTrue(comment.contains("**Failed test cases (6):**"), comment);
    assertTrue(comment.contains("- ... and 1 more"), comment);
    assertTrue(comment.contains("**Action required:** Review the failed test cases"), comment);
    assertFalse(comment.matches(HANGUL), comment);
  }

  @Test
  public void summaryInEnglish() {
    userWithLanguage("u-en", "en");
    TestResult pass = new TestResult();
    pass.setTestCaseId("tc-2");
    pass.setResult("PASS");
    service.addTestExecutionSummary(
        "u-en", "ICT-1", execution(), List.of(failedResult(), pass, pass));
    String comment = capturedComment("u-en");
    assertTrue(comment.contains("**Test execution summary**"), comment);
    assertTrue(comment.contains("- Total: 3"), comment);
    assertTrue(comment.contains("- ✅ Passed: 2"), comment);
    assertTrue(comment.contains("- 📊 Pass rate: 66.7%"), comment);
    assertTrue(comment.contains("**Failed tests:**\n- tc-1"), comment);
    assertFalse(comment.matches(HANGUL), comment);
  }

  @Test
  public void databaseTranslationWinsOverTable() {
    userWithLanguage("u-en", "en");
    when(i18nService.getTranslationsMap("en"))
        .thenReturn(Map.of(JiraCommentLabels.PREFIX + "result.title", "Result changed"));
    service.addManualTestResultComment("u-en", "ICT-1", failedResult());
    assertTrue(capturedComment("u-en").contains("**Result changed**"));
  }

  @Test
  public void translationLookupFailureFallsBackToTable() {
    userWithLanguage("u-en", "en");
    when(i18nService.getTranslationsMap("en")).thenThrow(new RuntimeException("db down"));
    service.addManualTestResultComment("u-en", "ICT-1", failedResult());
    assertTrue(capturedComment("u-en").contains("**Test result update**"));
  }

  @Test
  public void labelTableHasUniqueKeysAndBothLanguages() {
    Set<String> keys = new HashSet<>();
    for (LabelTable.Entry e : JiraCommentLabels.TABLE.entries()) {
      assertTrue(keys.add(e.key()), "duplicate " + e.key());
      assertFalse(e.ko().isBlank(), e.key());
      assertFalse(e.en().isBlank(), e.key());
      assertFalse(e.en().matches(HANGUL), "Korean in en value: " + e.key());
    }
  }
}
