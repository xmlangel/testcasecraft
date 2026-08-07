package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.BulkTestResultDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import java.util.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 결과 노트에 붙여넣은 인라인 이미지가 "본문에서 사용 중"으로 표시되는지 검증한다.
 *
 * <p>표시가 빠지면 그 이미지는 미사용 첨부로 남아 정리 대상이 되고, 결과 화면에서 이미지가 사라진다.
 */
public class TestExecutionServiceInlineImageTest {

  private static final String IMG_A = "12c544bc-acf9-4860-b4ee-f28ee02eccde";
  private static final String IMG_B = "b8a8a9ba-7881-496b-b287-ca191faaf26e";

  @Mock private TestExecutionRepository testExecutionRepository;
  @Mock private TestResultRepository testResultRepository;
  @Mock private TestPlanRepository testPlanRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private UserRepository userRepository;
  @Mock private JiraIntegrationService jiraIntegrationService;
  @Mock private TestCaseRepository testCaseRepository;
  @Mock private TestCaseFileStorageService fileStorageService;
  @Mock private ProjectSecurityService projectSecurityService;

  private TestExecutionService testExecutionService;

  private TestExecution mockExecution;
  private Project mockProject;
  private User mockUser;

  private static String noteWith(String... attachmentIds) {
    StringBuilder sb = new StringBuilder("확인 결과 예상값과 다름\n");
    for (String id : attachmentIds) {
      sb.append("<img src=\"/api/testcase-attachments/public/")
          .append(id)
          .append("?token=933eca699d3647dd8977bab1d046f89f\" alt=\"image\" />\n");
    }
    return sb.toString();
  }

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);

    testExecutionService =
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
    when(authentication.getName()).thenReturn("testuser");
    SecurityContext securityContext = mock(SecurityContext.class);
    when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);

    mockUser = new User();
    mockUser.setId("user-1");
    mockUser.setUsername("testuser");
    mockUser.setRole("ADMIN");
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));

    mockProject = new Project();
    mockProject.setId("project-1");

    mockExecution = new TestExecution();
    mockExecution.setId("exec-1");
    mockExecution.setProject(mockProject);
    mockExecution.setResults(new ArrayList<>());

    when(testExecutionRepository.findById("exec-1")).thenReturn(Optional.of(mockExecution));
    when(testExecutionRepository.findByIdWithResults("exec-1"))
        .thenReturn(Optional.of(mockExecution));
    when(testExecutionRepository.save(any(TestExecution.class)))
        .thenAnswer(i -> i.getArguments()[0]);
    when(testResultRepository.save(any(TestResult.class))).thenAnswer(i -> i.getArguments()[0]);

    when(projectSecurityService.canEditProject(anyString())).thenReturn(true);
    when(projectSecurityService.canRecordTestResult(anyString())).thenReturn(true);
  }

  /** 결과 노트에 이미지 두 장을 넣으면 둘 다 사용 중으로 표시된다. */
  @Test
  public void testUpdateTestResultMarksInlineImagesAsUsed() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult("FAIL");
    dto.setNotes(noteWith(IMG_A, IMG_B));

    testExecutionService.updateTestResult("exec-1", dto);

    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_A);
    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_B);
  }

  /** 같은 이미지를 여러 번 참조해도 표시는 한 번만 한다. */
  @Test
  public void testUpdateTestResultDeduplicatesRepeatedImage() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult("FAIL");
    dto.setNotes(noteWith(IMG_A, IMG_A, IMG_A));

    testExecutionService.updateTestResult("exec-1", dto);

    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_A);
  }

  /** 이미지가 없는 노트는 첨부 표시를 호출하지 않는다. */
  @Test
  public void testUpdateTestResultWithoutImagesMarksNothing() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult("PASS");
    dto.setNotes("이미지 없이 텍스트만 남긴 결과");

    testExecutionService.updateTestResult("exec-1", dto);

    verify(fileStorageService, never()).markAsUsedIfPresent(anyString());
  }

  /** 표시에 실패해도 결과 저장 자체는 성공한다 — 부가 작업이 본작업을 막지 않는다. */
  @Test
  public void testUpdateTestResultSurvivesMarkFailure() {
    doThrow(new IllegalArgumentException("첨부파일을 찾을 수 없습니다"))
        .when(fileStorageService)
        .markAsUsedIfPresent(IMG_A);

    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult("FAIL");
    dto.setNotes(noteWith(IMG_A));

    testExecutionService.updateTestResult("exec-1", dto);

    assertEquals(mockExecution.getResults().size(), 1);
    assertEquals(mockExecution.getResults().get(0).getTestCaseId(), "tc-1");
  }

  /** 일괄 입력도 같은 규칙을 따른다 — 케이스가 여러 개여도 이미지 표시는 한 번씩. */
  @Test
  public void testUpdateTestResultsBulkMarksInlineImagesAsUsed() {
    BulkTestResultDto bulkDto = new BulkTestResultDto();
    bulkDto.setTestCaseIds(Arrays.asList("tc-1", "tc-2"));
    bulkDto.setResult("FAIL");
    bulkDto.setNotes(noteWith(IMG_A, IMG_B));

    testExecutionService.updateTestResultsBulk("exec-1", bulkDto);

    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_A);
    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_B);
  }

  /** 대문자로 적힌 첨부 URL도 같은 이미지로 인식한다 — 저장된 ID는 소문자다. */
  @Test
  public void testUpdateTestResultNormalizesUppercaseUrl() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult("FAIL");
    dto.setNotes(noteWith(IMG_A.toUpperCase(Locale.ROOT)));

    testExecutionService.updateTestResult("exec-1", dto);

    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_A);
  }

  /** UUID 형태가 아닌 36자 문자열은 첨부 ID로 보지 않는다. */
  @Test
  public void testUpdateTestResultIgnoresNonUuidPath() {
    TestResultDto dto = new TestResultDto();
    dto.setTestCaseId("tc-1");
    dto.setResult("FAIL");
    dto.setNotes(noteWith("------------------------------------"));

    testExecutionService.updateTestResult("exec-1", dto);

    verify(fileStorageService, never()).markAsUsedIfPresent(anyString());
  }

  /**
   * 노트가 빈 결과를 지울 때 사용자 조회를 하지 않는다.
   *
   * <p>인증 컨텍스트가 없는 경로(스케줄러·시스템 정리)에서 실행 삭제가 실패하지 않아야 한다.
   */
  @Test
  public void testDeleteExecutionWithBlankNotesDoesNotLookUpUser() {
    TestResult blankNoteResult = new TestResult();
    blankNoteResult.setId("result-blank");
    blankNoteResult.setTestCaseId("tc-1");
    blankNoteResult.setNotes(null);
    mockExecution.getResults().add(blankNoteResult);

    SecurityContextHolder.clearContext();

    testExecutionService.deleteTestExecution("exec-1");

    verify(userRepository, never()).findByUsername(anyString());
    verify(fileStorageService, never()).deleteAttachment(anyString(), any(User.class));
    verify(testExecutionRepository, times(1)).delete(mockExecution);
  }

  /** 이전 결과를 고쳐 이미지를 새로 넣은 경우에도 표시된다. */
  @Test
  public void testUpdatePreviousTestResultMarksInlineImagesAsUsed() {
    TestResult existing = new TestResult();
    existing.setId("result-1");
    existing.setTestCaseId("tc-1");
    existing.setResult("FAIL");
    existing.setNotes("기존 노트");
    existing.setExecutedBy(mockUser);
    existing.setTestExecution(mockExecution);
    when(testResultRepository.findById("result-1")).thenReturn(Optional.of(existing));

    TestResultDto dto = new TestResultDto();
    dto.setResult("FAIL");
    dto.setNotes(noteWith(IMG_A));

    testExecutionService.updatePreviousTestResult("result-1", dto, "testuser");

    verify(fileStorageService, times(1)).markAsUsedIfPresent(IMG_A);
  }
}
