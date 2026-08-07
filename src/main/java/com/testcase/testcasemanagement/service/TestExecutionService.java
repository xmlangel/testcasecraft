// src/main/java/com/testcase/testcasemanagement/service/TestExecutionService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.BulkTestResultDto;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.model.TestResultStatus;
import com.testcase.testcasemanagement.repository.*;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.JiraKeyUtils;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestExecutionService {

  /**
   * ICT-InlineImage: 노트 본문에 삽입된 첨부 이미지 URL에서 첨부 ID를 뽑아내는 패턴.
   *
   * <p>예: {@code /api/testcase-attachments/public/{uuid}?token=...}
   */
  private static final java.util.regex.Pattern INLINE_IMAGE_PATTERN =
      java.util.regex.Pattern.compile(
          "(?i)/api/testcase-attachments/public/"
              + "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})");

  private final TestExecutionRepository testExecutionRepository;
  private final TestResultRepository testResultRepository;
  private final TestPlanRepository testPlanRepository;
  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;
  private final JiraIntegrationService jiraIntegrationService;

  private final TestCaseRepository testCaseRepository;
  private final TestCaseFileStorageService fileStorageService; // ICT-InlineImage: 첨부파일 삭제 연동용
  private final ProjectSecurityService projectSecurityService;

  @Autowired
  public TestExecutionService(
      TestExecutionRepository testExecutionRepository,
      TestResultRepository testResultRepository,
      TestPlanRepository testPlanRepository,
      ProjectRepository projectRepository,
      UserRepository userRepository,
      JiraIntegrationService jiraIntegrationService,
      TestCaseRepository testCaseRepository,
      TestCaseFileStorageService fileStorageService,
      ProjectSecurityService projectSecurityService) {
    this.testExecutionRepository = testExecutionRepository;
    this.testResultRepository = testResultRepository;
    this.testPlanRepository = testPlanRepository;
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.jiraIntegrationService = jiraIntegrationService;
    this.testCaseRepository = testCaseRepository;
    this.fileStorageService = fileStorageService;
    this.projectSecurityService = projectSecurityService;
  }

  /**
   * ICT-427: 새 결과 줄에 붙일 태그를 정한다.
   *
   * <p>이 시스템은 결과를 덮어쓰지 않고 계속 쌓는다. 그래서 태그("이 케이스 고쳐야 함")를 달아 둔 뒤 같은 케이스를 다시 실행하면 새 줄이 생기는데, 그 줄에 태그가
   * 없으면 화면(최신 줄만 보여줌)에서 표시가 사라진 것처럼 보인다. 결과 입력 화면은 최신 결과의 태그를 입력창에 채워 넣어 사실상 물려받고 있었지만, 일괄 입력과 자동화
   * 적재는 태그를 보내지 않아 연결이 끊겼다. 규칙을 서버 한 곳으로 모아 셋을 같게 만든다.
   *
   * <ul>
   *   <li>태그를 보내지 않으면(null) 같은 실행 안에서 그 케이스의 가장 최근 태그를 물려받는다
   *   <li>빈 배열을 보내면 명시적 삭제로 보고 물려받지 않는다 (다 고쳐서 태그를 떼는 경우)
   *   <li>값을 보내면 그 값을 쓴다
   * </ul>
   *
   * @param existingResults 이 실행에 이미 쌓여 있는 결과 목록
   * @param testCaseId 대상 테스트케이스
   * @param requestedTags 요청이 보낸 태그 (null = 미지정)
   * @return 새 결과에 붙일 태그 (없으면 null)
   */
  private java.util.Set<String> resolveTagsForNewResult(
      List<TestResult> existingResults, String testCaseId, List<String> requestedTags) {
    if (requestedTags != null) {
      return new java.util.LinkedHashSet<>(requestedTags);
    }

    return existingResults.stream()
        .filter(prev -> testCaseId.equals(prev.getTestCaseId()))
        .filter(prev -> prev.getTags() != null && !prev.getTags().isEmpty())
        .max(
            Comparator.comparing(
                TestResult::getExecutedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
        .map(prev -> (java.util.Set<String>) new java.util.LinkedHashSet<>(prev.getTags()))
        .orElse(null);
  }

  private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String username = authentication.getName();
    return userRepository
        .findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
  }

  public TestExecutionDto createTestExecution(TestExecutionDto dto) {
    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(dto.getProjectId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + dto.getProjectId());
    }

    TestExecution entity = toEntity(dto);
    entity.setStatus("NOTSTARTED");
    entity.setCreatedAt(LocalDateTime.now());
    entity.setUpdatedAt(LocalDateTime.now());
    entity.setResults(new ArrayList<>());

    Project project =
        projectRepository
            .findById(dto.getProjectId())
            .orElseThrow(() -> new IllegalArgumentException("Invalid Project ID"));
    entity.setProject(project);

    TestExecution saved = testExecutionRepository.save(entity);
    return toDto(saved);
  }

  @Transactional(readOnly = true)
  public List<TestExecutionDto> getTestExecutions(String testPlanId) {
    List<TestExecution> executions;
    if (testPlanId != null) {
      TestPlan plan =
          testPlanRepository
              .findById(testPlanId)
              .orElseThrow(() -> new NoSuchElementException("TestPlan not found: " + testPlanId));
      if (!projectSecurityService.canAccessProject(plan.getProject().getId())) {
        throw new AccessDeniedException("프로젝트 접근 권한이 없습니다: " + plan.getProject().getId());
      }
      executions = testExecutionRepository.findByTestPlanId(testPlanId);
    } else {
      if (!projectSecurityService.isSystemAdmin()) {
        throw new AccessDeniedException("전체 테스트 실행 조회는 시스템 관리자만 가능합니다.");
      }
      executions = testExecutionRepository.findAll();
    }
    return executions.stream().map(this::toDto).collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public Optional<TestExecutionDto> getTestExecutionById(String id) {
    Optional<TestExecutionDto> result =
        testExecutionRepository.findByIdWithResults(id).map(entity -> toDto(entity, true));
    if (result.isPresent()
        && !projectSecurityService.canAccessProject(result.get().getProjectId())) {
      throw new AccessDeniedException("프로젝트 접근 권한이 없습니다: " + result.get().getProjectId());
    }
    return result;
  }

  @Transactional
  public TestExecutionDto updateTestExecution(String id, TestExecutionDto dto) {
    TestExecution entity =
        testExecutionRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(entity.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + entity.getProject().getId());
    }

    entity.setName(dto.getName());
    entity.setDescription(dto.getDescription());
    if (dto.getTags() != null) {
      entity.setTags(new java.util.LinkedHashSet<>(dto.getTags()));
    }
    entity.setUpdatedAt(LocalDateTime.now());
    TestExecution saved = testExecutionRepository.save(entity);
    return toDto(saved);
  }

  // QA 총평 저장 (실행 단위 마크다운 코멘트)
  @Transactional
  public TestExecutionDto updateQaSummary(String id, String qaSummary, String username) {
    TestExecution entity =
        testExecutionRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(entity.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + entity.getProject().getId());
    }

    entity.setQaSummary(qaSummary);
    entity.setQaSummaryUpdatedBy(username);
    entity.setQaSummaryUpdatedAt(LocalDateTime.now());
    entity.setUpdatedAt(LocalDateTime.now());
    TestExecution saved = testExecutionRepository.save(entity);
    return toDto(saved);
  }

  @Transactional
  public void deleteTestExecution(String id) {
    // ICT-InlineImage: 실행 삭제 전 모든 결과의 인라인 이미지 정리
    TestExecution entity =
        testExecutionRepository
            .findByIdWithResults(id)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(entity.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + entity.getProject().getId());
    }

    if (entity.getResults() != null) {
      for (TestResult result : entity.getResults()) {
        deleteInlineImagesFromNotes(result.getNotes());
      }
    }

    testExecutionRepository.delete(entity);
  }

  @Transactional
  public TestExecutionDto startTestExecution(String id) {
    TestExecution entity =
        testExecutionRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(entity.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + entity.getProject().getId());
    }

    entity.setStatus("INPROGRESS");
    entity.setStartDate(LocalDateTime.now());
    entity.setUpdatedAt(LocalDateTime.now());
    TestExecution saved = testExecutionRepository.save(entity);
    return toDto(saved);
  }

  @Transactional
  public TestExecutionDto completeTestExecution(String id) {
    TestExecution entity =
        testExecutionRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(entity.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + entity.getProject().getId());
    }

    entity.setStatus("COMPLETED");
    entity.setEndDate(LocalDateTime.now());
    entity.setUpdatedAt(LocalDateTime.now());
    TestExecution saved = testExecutionRepository.save(entity);
    return toDto(saved);
  }

  @Transactional
  public TestExecutionDto restartTestExecution(String id) {
    TestExecution entity =
        testExecutionRepository
            .findById(id)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(entity.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + entity.getProject().getId());
    }

    // Only allow restarting of completed test executions
    if (!"COMPLETED".equals(entity.getStatus())) {
      throw new IllegalStateException("Only completed test executions can be restarted");
    }

    entity.setStatus("INPROGRESS");
    entity.setEndDate(null); // Clear the end date since we're restarting
    entity.setUpdatedAt(LocalDateTime.now());
    TestExecution saved = testExecutionRepository.save(entity);
    return toDto(saved);
  }

  // 수정된 부분: 항상 새로운 TestResult를 추가
  @Transactional
  public TestExecutionDto updateTestResult(String executionId, TestResultDto resultDto) {
    TestExecution entity =
        testExecutionRepository
            .findByIdWithResults(executionId)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 결과 기록 권한 검사 (PM/LEAD/DEV/CONTRIBUTOR 편집 롤 + TESTER)
    if (!projectSecurityService.canRecordTestResult(entity.getProject().getId())) {
      throw new AccessDeniedException("결과 기록 권한이 없습니다: " + entity.getProject().getId());
    }

    if ("COMPLETED".equals(entity.getStatus())) {
      throw new IllegalStateException("COMPLETED_EXECUTION");
    }

    List<TestResult> results =
        entity.getResults() != null ? entity.getResults() : new ArrayList<>();
    User currentUser = getCurrentUser();

    // ICT-184: JIRA 이슈 키 존재 여부 검증 (JIRA 설정이 있을 때만) 및 키 정제
    String cleanedJiraKeys = JiraKeyUtils.extractJiraKeys(resultDto.getJiraIssueKey());
    if (!cleanedJiraKeys.isEmpty()) {
      String[] jiraIssueKeys = cleanedJiraKeys.split(",");
      for (String rawKey : jiraIssueKeys) {
        String jiraIssueKey = rawKey.trim();
        if (jiraIssueKey.isEmpty()) continue;

        try {
          JiraConfigDto.IssueExistsDto validationResult =
              jiraIntegrationService.checkJiraIssueExists(currentUser.getUsername(), jiraIssueKey);

          // JIRA 설정이 없는 경우는 검증을 건너뛰고 계속 진행
          if (validationResult.getErrorMessage() != null
              && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
            System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
          } else if (!validationResult.getExists()) {
            // JIRA 설정은 있지만 이슈가 존재하지 않는 경우만 에러 처리
            throw new IllegalArgumentException(
                String.format(
                    "존재하지 않는 JIRA 이슈입니다: %s (%s)",
                    jiraIssueKey,
                    validationResult.getErrorMessage() != null
                        ? validationResult.getErrorMessage()
                        : "이슈를 찾을 수 없습니다"));
          }
        } catch (IllegalArgumentException e) {
          throw e;
        } catch (Exception e) {
          System.err.println(
              "JIRA 이슈 검증 중 오류 발생: " + e.getMessage() + " (이슈 키: " + jiraIssueKey + ")");
        }
      }
    }

    // ICT-341: displayId 지원 (testCaseId가 없을 경우)
    String testCaseId = resultDto.getTestCaseId();
    if ((testCaseId == null || testCaseId.trim().isEmpty())
        && (resultDto.getDisplayId() != null && !resultDto.getDisplayId().trim().isEmpty())) {
      testCaseId =
          testCaseRepository
              .findByProjectIdAndDisplayId(entity.getProject().getId(), resultDto.getDisplayId())
              .map(TestCase::getId)
              .orElseThrow(
                  () ->
                      new IllegalArgumentException(
                          "DisplayID를 찾을 수 없습니다: " + resultDto.getDisplayId()));
    }

    if (testCaseId == null || testCaseId.trim().isEmpty()) {
      throw new IllegalArgumentException("testCaseId 또는 displayId가 필요합니다.");
    }

    // 항상 새로운 결과를 추가
    TestResult r = new TestResult();
    r.setTestExecution(entity);
    r.setTestCaseId(testCaseId);
    r.setResult(resultDto.getResult());
    r.setNotes(resultDto.getNotes());

    r.setJiraIssueKey(cleanedJiraKeys); // ICT-178: 정제된 JIRA 이슈 키 설정
    // ICT-427: 태그를 보내지 않으면 이 케이스의 이전 결과 태그를 물려받는다
    r.setTags(resolveTagsForNewResult(results, testCaseId, resultDto.getTags()));
    r.setExecutedAt(LocalDateTime.now());
    r.setExecutedBy(currentUser);

    results.add(r);

    entity.setResults(results);
    entity.setUpdatedAt(LocalDateTime.now());
    TestExecution saved = testExecutionRepository.save(entity);

    // ICT-InlineImage: 노트에 붙여넣은 이미지를 사용 중으로 표시 (미사용 정리로 지워지는 것 방지)
    markInlineImagesAsUsed(r.getNotes());

    // 저장 후 다시 조회하여 tags를 포함한 모든 데이터를 가져옴
    TestExecution reloaded =
        testExecutionRepository.findByIdWithResults(saved.getId()).orElse(saved);

    return toDto(reloaded);
  }

  /** 일괄 테스트 결과 업데이트 여러 테스트케이스에 대해 동일한 결과를 한 번에 저장 */
  @Transactional
  public TestExecutionDto updateTestResultsBulk(String executionId, BulkTestResultDto bulkDto) {
    TestExecution entity =
        testExecutionRepository
            .findByIdWithResults(executionId)
            .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

    // 결과 기록 권한 검사 (PM/LEAD/DEV/CONTRIBUTOR 편집 롤 + TESTER)
    if (!projectSecurityService.canRecordTestResult(entity.getProject().getId())) {
      throw new AccessDeniedException("결과 기록 권한이 없습니다: " + entity.getProject().getId());
    }

    if ("COMPLETED".equals(entity.getStatus())) {
      throw new IllegalStateException("COMPLETED_EXECUTION");
    }

    List<TestResult> results =
        entity.getResults() != null ? entity.getResults() : new ArrayList<>();
    User currentUser = getCurrentUser();
    LocalDateTime now = LocalDateTime.now();

    // JIRA 이슈 키 검증 및 정제
    String cleanedBulkJiraKeys = JiraKeyUtils.extractJiraKeys(bulkDto.getJiraIssueKey());
    if (!cleanedBulkJiraKeys.isEmpty()) {
      String[] jiraIssueKeys = cleanedBulkJiraKeys.split(",");
      for (String rawKey : jiraIssueKeys) {
        String jiraIssueKey = rawKey.trim();
        if (jiraIssueKey.isEmpty()) continue;

        try {
          JiraConfigDto.IssueExistsDto validationResult =
              jiraIntegrationService.checkJiraIssueExists(currentUser.getUsername(), jiraIssueKey);

          if (validationResult.getErrorMessage() != null
              && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
            System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
          } else if (!validationResult.getExists()) {
            throw new IllegalArgumentException(
                String.format(
                    "존재하지 않는 JIRA 이슈입니다: %s (%s)",
                    jiraIssueKey,
                    validationResult.getErrorMessage() != null
                        ? validationResult.getErrorMessage()
                        : "이슈를 찾을 수 없습니다"));
          }
        } catch (IllegalArgumentException e) {
          throw e;
        } catch (Exception e) {
          System.err.println(
              "JIRA 이슈 검증 중 오류 발생: " + e.getMessage() + " (이슈 키: " + jiraIssueKey + ")");
        }
      }
    }

    // 각 테스트케이스에 대해 결과 생성
    Set<String> finalTestCaseIds = new LinkedHashSet<>();

    // 1. 기존 UUID 기반 ID 추가
    if (bulkDto.getTestCaseIds() != null) {
      finalTestCaseIds.addAll(bulkDto.getTestCaseIds());
    }

    // 2. DisplayID 기반 ID 추가
    if (bulkDto.getDisplayIds() != null && !bulkDto.getDisplayIds().isEmpty()) {
      for (String displayId : bulkDto.getDisplayIds()) {
        if (displayId != null && !displayId.trim().isEmpty()) {
          String caseId =
              testCaseRepository
                  .findByProjectIdAndDisplayId(entity.getProject().getId(), displayId)
                  .map(TestCase::getId)
                  .orElseThrow(
                      () -> new IllegalArgumentException("DisplayID를 찾을 수 없습니다: " + displayId));
          finalTestCaseIds.add(caseId);
        }
      }
    }

    if (finalTestCaseIds.isEmpty()) {
      throw new IllegalArgumentException("결과를 입력할 테스트케이스 ID 또는 DisplayID가 없습니다.");
    }

    for (String testCaseId : finalTestCaseIds) {
      TestResult r = new TestResult();
      r.setTestExecution(entity);
      r.setTestCaseId(testCaseId);
      r.setResult(bulkDto.getResult());
      r.setNotes(bulkDto.getNotes());
      r.setJiraIssueKey(cleanedBulkJiraKeys);
      // ICT-427: 공통 태그를 지정하지 않았으면 케이스별로 각자의 이전 태그를 물려받는다
      r.setTags(resolveTagsForNewResult(results, testCaseId, bulkDto.getTags()));
      r.setExecutedAt(now);
      r.setExecutedBy(currentUser);

      results.add(r);
    }

    entity.setResults(results);
    entity.setUpdatedAt(now);
    TestExecution saved = testExecutionRepository.save(entity);

    // ICT-InlineImage: 케이스가 여럿이어도 같은 노트를 공유하므로 이미지 표시는 한 번만
    markInlineImagesAsUsed(bulkDto.getNotes());

    // 저장 후 다시 조회
    TestExecution reloaded =
        testExecutionRepository.findByIdWithResults(saved.getId()).orElse(saved);

    return toDto(reloaded);
  }

  // Entity <-> DTO 변환 메서드 (기본값: 결과 상세 포함)
  private TestExecutionDto toDto(TestExecution entity) {
    return toDto(entity, true);
  }

  // Entity <-> DTO 변환 메서드 (결과 상세 포함 여부 선택 가능)
  private TestExecutionDto toDto(TestExecution entity, boolean includeResults) {
    TestExecutionDto dto = new TestExecutionDto();
    dto.setId(entity.getId());
    dto.setName(entity.getName());
    dto.setTestPlanId(entity.getTestPlanId());
    dto.setDescription(entity.getDescription());
    dto.setStatus(entity.getStatus());
    dto.setStartDate(entity.getStartDate());
    dto.setEndDate(entity.getEndDate());
    dto.setCreatedAt(entity.getCreatedAt());
    dto.setUpdatedAt(entity.getUpdatedAt());
    dto.setProjectId(entity.getProject().getId());
    if (entity.getTags() != null) {
      dto.setTags(new ArrayList<>(entity.getTags()));
    }
    dto.setQaSummary(entity.getQaSummary());
    dto.setQaSummaryUpdatedBy(entity.getQaSummaryUpdatedBy());
    dto.setQaSummaryUpdatedAt(entity.getQaSummaryUpdatedAt());

    // 요약 통계 계산 및 결과 정렬
    List<TestResult> entityResults = entity.getResults();
    if (entityResults == null) {
      entityResults = new ArrayList<>();
    }

    // 1. 실행일시 역순(최신순)으로 정렬
    List<TestResult> sortedEntityResults =
        entityResults.stream()
            .sorted(
                (a, b) -> {
                  LocalDateTime dateA = a.getExecutedAt();
                  LocalDateTime dateB = b.getExecutedAt();
                  if (dateA == null && dateB == null) return 0;
                  if (dateA == null) return 1;
                  if (dateB == null) return -1;
                  return dateB.compareTo(dateA);
                })
            .collect(Collectors.toList());

    // 2. 요약 통계 계산 (TestPlan의 TestCase 목록 기준)
    TestPlan testPlan = null;
    if (entity.getTestPlanId() != null) {
      testPlan = testPlanRepository.findById(entity.getTestPlanId()).orElse(null);
    }

    if (testPlan != null && testPlan.getTestCaseIds() != null) {
      List<String> planCaseIds = testPlan.getTestCaseIds();
      int total = planCaseIds.size();
      int passed = 0;
      int failed = 0;
      int completed = 0;

      // 각 테스트케이스별 최신 결과 확인
      Map<String, TestResult> latestResultsMap = new HashMap<>();
      for (TestResult r : sortedEntityResults) {
        if (!latestResultsMap.containsKey(r.getTestCaseId())) {
          latestResultsMap.put(r.getTestCaseId(), r);
        }
      }

      for (String caseId : planCaseIds) {
        TestResult latest = latestResultsMap.get(caseId);
        if (latest != null && latest.getResult() != null) {
          String resultStatus = latest.getResult();
          // 저장 정본은 "NOT_RUN" — "NOTRUN"과 비교하면 미실행이 완료로 오집계됐다.
          if (!TestResultStatus.NOT_RUN.value().equalsIgnoreCase(resultStatus)) {
            completed++;
            if (TestResultStatus.PASS.value().equalsIgnoreCase(resultStatus)) {
              passed++;
            } else if (TestResultStatus.FAIL.value().equalsIgnoreCase(resultStatus)) {
              failed++;
            }
          }
        }
      }

      dto.setTotalCount(total);
      dto.setPassedCount(passed);
      dto.setFailedCount(failed);
      dto.setProgress(total > 0 ? (completed * 100 / total) : 0);
    } else {
      dto.setTotalCount(0);
      dto.setPassedCount(0);
      dto.setFailedCount(0);
      dto.setProgress(0);
    }

    // 3. 결과 리스트 설정 (요청된 경우만)
    if (includeResults) {
      List<TestResultDto> resultDtos =
          sortedEntityResults.stream().map(this::toDto).collect(Collectors.toList());
      dto.setResults(resultDtos);
    } else {
      dto.setResults(null);
    }

    return dto;
  }

  private TestResultDto toDto(TestResult entity) {
    TestResultDto dto = new TestResultDto();
    dto.setId(entity.getId()); // 첨부파일 조회에 필요한 ID 설정
    dto.setTestCaseId(entity.getTestCaseId());
    dto.setResult(entity.getResult());
    dto.setNotes(entity.getNotes());
    dto.setJiraIssueKey(entity.getJiraIssueKey()); // ICT-178: JIRA 이슈 키 설정
    dto.setExecutedAt(entity.getExecutedAt());
    dto.setExecutedBy(entity.getExecutedBy() != null ? entity.getExecutedBy().getUsername() : null);
    dto.setAttachmentCount(entity.getActiveAttachmentCount());

    // tags 초기화 - size()를 호출하여 LAZY 로딩 트리거
    if (entity.getTags() != null) {
      entity.getTags().size(); // LAZY 로딩 강제 초기화
      dto.setTags(new ArrayList<>(entity.getTags()));
    }
    return dto;
  }

  private TestExecution toEntity(TestExecutionDto dto) {
    TestExecution entity = new TestExecution();
    entity.setId(dto.getId());
    entity.setName(dto.getName());
    entity.setTestPlanId(dto.getTestPlanId());
    entity.setDescription(dto.getDescription());
    entity.setStatus(dto.getStatus());
    entity.setStartDate(dto.getStartDate());
    entity.setEndDate(dto.getEndDate());
    entity.setCreatedAt(dto.getCreatedAt());
    entity.setUpdatedAt(dto.getUpdatedAt());
    dto.setProjectId(dto.getProjectId());
    if (dto.getTags() != null) {
      entity.setTags(new java.util.LinkedHashSet<>(dto.getTags()));
    }

    if (dto.getResults() != null) {
      entity.setResults(dto.getResults().stream().map(this::toEntity).collect(Collectors.toList()));
    }
    return entity;
  }

  private TestResult toEntity(TestResultDto dto) {
    TestResult entity = new TestResult();
    entity.setTestCaseId(dto.getTestCaseId());
    entity.setResult(dto.getResult());
    entity.setNotes(dto.getNotes());
    entity.setExecutedAt(dto.getExecutedAt());
    if (dto.getTags() != null) {
      entity.setTags(new java.util.LinkedHashSet<>(dto.getTags()));
    }
    // executedBy는 updateTestResult에서만 세팅
    return entity;
  }

  @Transactional(readOnly = true)
  public List<TestExecutionDto> getTestExecutionsByProject(String projectId, String name) {
    return getTestExecutionsByProject(projectId, name, Pageable.unpaged()).getContent();
  }

  @Transactional(readOnly = true)
  public Page<TestExecutionDto> getTestExecutionsByProject(
      String projectId, String name, Pageable pageable) {
    if (!projectSecurityService.canAccessProject(projectId)) {
      throw new AccessDeniedException("프로젝트 접근 권한이 없습니다: " + projectId);
    }
    // 1. 실행 목록 페이징 조회 (results fetch 제거로 매우 빨라짐)
    org.springframework.data.domain.Page<TestExecution> executionPage;
    if (name != null && !name.trim().isEmpty()) {
      executionPage =
          testExecutionRepository.findPageByProjectIdAndNameContainingIgnoreCase(
              projectId, name.trim(), pageable);
    } else {
      executionPage = testExecutionRepository.findPageByProjectId(projectId, pageable);
    }

    if (executionPage.isEmpty()) {
      return org.springframework.data.domain.Page.empty(pageable);
    }

    List<TestExecution> executions = executionPage.getContent();

    // 2. 필요한 데이터 일괄 조회를 위한 ID 수집
    List<String> executionIds =
        executions.stream().map(TestExecution::getId).collect(Collectors.toList());
    List<String> testPlanIds =
        executions.stream()
            .map(TestExecution::getTestPlanId)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());

    // 3. TestPlan 정보 벌크 로드
    Map<String, TestPlan> testPlanMap = new HashMap<>();
    if (!testPlanIds.isEmpty()) {
      List<TestPlan> plans = testPlanRepository.findAllById(testPlanIds);
      plans.forEach(p -> testPlanMap.put(p.getId(), p));
    }

    // 4. 결과 집계 정보 벌크 로드 (Native Query 사용)
    List<Map<String, Object>> summaryData =
        testResultRepository.findSummaryByExecutionIds(executionIds);
    Map<String, Map<String, Long>> executionSummaryMap = new HashMap<>();

    for (Map<String, Object> row : summaryData) {
      String execId = (String) row.get("test_execution_id");
      String status = (String) row.get("result");
      Long count = ((Number) row.get("count")).longValue();

      executionSummaryMap.computeIfAbsent(execId, k -> new HashMap<>()).put(status, count);
    }

    // 5. DTO 변환 및 Page 생성
    List<TestExecutionDto> dtos =
        executions.stream()
            .map(
                entity -> {
                  TestExecutionDto dto = new TestExecutionDto();
                  dto.setId(entity.getId());
                  dto.setName(entity.getName());
                  dto.setTestPlanId(entity.getTestPlanId());
                  dto.setDescription(entity.getDescription());
                  dto.setStatus(entity.getStatus());
                  dto.setStartDate(entity.getStartDate());
                  dto.setEndDate(entity.getEndDate());
                  dto.setCreatedAt(entity.getCreatedAt());
                  dto.setUpdatedAt(entity.getUpdatedAt());
                  dto.setProjectId(entity.getProject().getId());
                  if (entity.getTags() != null) {
                    dto.setTags(new ArrayList<>(entity.getTags()));
                  }

                  // 집계 데이터 설정
                  TestPlan plan = testPlanMap.get(entity.getTestPlanId());
                  Map<String, Long> counts =
                      executionSummaryMap.getOrDefault(entity.getId(), Collections.emptyMap());

                  if (plan != null && plan.getTestCaseIds() != null) {
                    int total = plan.getTestCaseIds().size();
                    long passed = counts.getOrDefault(TestResultStatus.PASS.value(), 0L);
                    long failed = counts.getOrDefault(TestResultStatus.FAIL.value(), 0L);
                    long blocked = counts.getOrDefault(TestResultStatus.BLOCKED.value(), 0L);
                    long completed = passed + failed + blocked;

                    dto.setTotalCount(total);
                    dto.setPassedCount((int) passed);
                    dto.setFailedCount((int) failed);
                    dto.setSkippedCount((int) blocked);
                    dto.setProgress(total > 0 ? (int) (completed * 100 / total) : 0);
                  } else {
                    dto.setTotalCount(0);
                    dto.setPassedCount(0);
                    dto.setFailedCount(0);
                    dto.setSkippedCount(0);
                    dto.setProgress(0);
                  }

                  dto.setResults(null);
                  return dto;
                })
            .collect(Collectors.toList());

    return new org.springframework.data.domain.PageImpl<>(
        dtos, pageable, executionPage.getTotalElements());
  }

  // 테스트케이스ID로 결과 조회 (최신순 정렬)
  public List<TestResultDto> getTestResultsByTestCaseId(String testCaseId) {
    testCaseRepository
        .findById(testCaseId)
        .ifPresent(
            testCase -> {
              if (testCase.getProject() != null
                  && !projectSecurityService.canAccessProject(testCase.getProject().getId())) {
                throw new AccessDeniedException(
                    "프로젝트 접근 권한이 없습니다: " + testCase.getProject().getId());
              }
            });
    List<TestResult> results = testResultRepository.findByTestCaseId(testCaseId);
    return results.stream()
        .sorted(
            (a, b) -> {
              LocalDateTime dateA = a.getExecutedAt();
              LocalDateTime dateB = b.getExecutedAt();
              if (dateA == null && dateB == null) return 0;
              if (dateA == null) return 1;
              if (dateB == null) return -1;
              return dateB.compareTo(dateA); // 내림차순 (최신순)
            })
        .map(
            result -> {
              TestExecution execution = result.getTestExecution();
              TestResultDto dto = new TestResultDto();
              dto.setId(result.getId()); // 첨부파일 조회에 필요한 ID 설정
              dto.setResult(result.getResult());
              dto.setTestCaseId(result.getTestCaseId());
              dto.setNotes(result.getNotes());
              dto.setJiraIssueKey(result.getJiraIssueKey()); // ICT-178: JIRA 이슈 키 설정
              dto.setExecutedBy(
                  result.getExecutedBy() != null ? result.getExecutedBy().getUsername() : null);
              dto.setExecutedAt(result.getExecutedAt());
              // 추가 필드
              dto.setTestExecutionId(execution != null ? execution.getId() : null);
              dto.setTestExecutionName(execution != null ? execution.getName() : null);
              dto.setAttachmentCount(result.getActiveAttachmentCount());
              return dto;
            })
        .collect(Collectors.toList());
  }

  /**
   * 이전 테스트 결과 수정 (PreviousResultsDialog용) 권한 체크: 실행한 본인 OR ADMIN OR MANAGER
   *
   * @param resultId 수정할 테스트 결과 ID
   * @param resultDto 수정할 데이터
   * @param currentUsername 현재 사용자 username
   * @return 수정된 TestResultDto
   * @throws SecurityException 권한이 없는 경우
   * @throws IllegalArgumentException 결과를 찾을 수 없는 경우
   */
  public TestResultDto updatePreviousTestResult(
      String resultId, TestResultDto resultDto, String currentUsername) {
    // 1. 기존 TestResult 조회
    TestResult existingResult =
        testResultRepository
            .findById(resultId)
            .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + resultId));

    if (existingResult.getTestExecution() != null
        && "COMPLETED".equals(existingResult.getTestExecution().getStatus())) {
      throw new IllegalStateException("COMPLETED_EXECUTION");
    }

    // 2. 현재 사용자 조회
    User currentUser =
        userRepository
            .findByUsername(currentUsername)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + currentUsername));

    // 3. 권한 확인: 실행한 본인 OR ADMIN OR MANAGER
    boolean isOwner =
        existingResult.getExecutedBy() != null
            && existingResult.getExecutedBy().getId().equals(currentUser.getId());
    boolean isAdmin = "ADMIN".equals(currentUser.getRole());
    boolean isManager = "MANAGER".equals(currentUser.getRole());

    if (!isOwner && !isAdmin && !isManager) {
      throw new SecurityException(
          String.format(
              "권한이 없습니다. (사용자: %s, 역할: %s, 소유자: %s)",
              currentUsername,
              currentUser.getRole(),
              existingResult.getExecutedBy() != null
                  ? existingResult.getExecutedBy().getUsername()
                  : "unknown"));
    }

    // 4. JIRA 이슈 키 검증 및 정제 (변경된 경우에만)
    String cleanedPreviousJiraKeys = JiraKeyUtils.extractJiraKeys(resultDto.getJiraIssueKey());
    if (!cleanedPreviousJiraKeys.isEmpty()) {
      String[] jiraIssueKeys = cleanedPreviousJiraKeys.split(",");
      for (String rawKey : jiraIssueKeys) {
        String jiraIssueKey = rawKey.trim();
        if (jiraIssueKey.isEmpty()) continue;

        // 기존 값들 중에 포함되어 있지 않은 새로운 키만 검증
        boolean isNewKey = true;
        if (existingResult.getJiraIssueKey() != null) {
          List<String> existingKeys = Arrays.asList(existingResult.getJiraIssueKey().split(","));
          if (existingKeys.stream().anyMatch(k -> k.trim().equals(jiraIssueKey))) {
            isNewKey = false;
          }
        }

        if (isNewKey) {
          try {
            JiraConfigDto.IssueExistsDto validationResult =
                jiraIntegrationService.checkJiraIssueExists(currentUsername, jiraIssueKey);

            if (validationResult.getErrorMessage() != null
                && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
              System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
            } else if (!validationResult.getExists()) {
              throw new IllegalArgumentException(
                  String.format(
                      "존재하지 않는 JIRA 이슈입니다: %s (%s)",
                      jiraIssueKey,
                      validationResult.getErrorMessage() != null
                          ? validationResult.getErrorMessage()
                          : "이슈를 찾을 수 없습니다"));
            }
          } catch (IllegalArgumentException e) {
            throw e;
          } catch (Exception e) {
            System.err.println(
                "JIRA 이슈 검증 중 오류 발생: " + e.getMessage() + " (이슈 키: " + jiraIssueKey + ")");
          }
        }
      }
    }

    // 5. TestResult 업데이트
    existingResult.setResult(resultDto.getResult());
    existingResult.setNotes(resultDto.getNotes());
    existingResult.setJiraIssueKey(cleanedPreviousJiraKeys);

    if (resultDto.getTags() != null) {
      existingResult.setTags(new java.util.LinkedHashSet<>(resultDto.getTags()));
    }

    // 6. 저장
    TestResult updatedResult = testResultRepository.save(existingResult);

    // ICT-InlineImage: 수정하면서 새로 넣은 이미지도 사용 중으로 표시
    markInlineImagesAsUsed(updatedResult.getNotes());

    // 7. DTO로 변환하여 반환
    TestResultDto responseDto = new TestResultDto();
    responseDto.setId(updatedResult.getId());
    responseDto.setResult(updatedResult.getResult());
    responseDto.setTestCaseId(updatedResult.getTestCaseId());
    responseDto.setNotes(updatedResult.getNotes());
    responseDto.setJiraIssueKey(updatedResult.getJiraIssueKey());
    responseDto.setExecutedBy(
        updatedResult.getExecutedBy() != null ? updatedResult.getExecutedBy().getUsername() : null);
    responseDto.setExecutedAt(updatedResult.getExecutedAt());
    responseDto.setTestExecutionId(
        updatedResult.getTestExecution() != null ? updatedResult.getTestExecution().getId() : null);
    responseDto.setTestExecutionName(
        updatedResult.getTestExecution() != null
            ? updatedResult.getTestExecution().getName()
            : null);
    responseDto.setAttachmentCount(updatedResult.getActiveAttachmentCount());

    if (updatedResult.getTags() != null) {
      updatedResult.getTags().size(); // LAZY 로딩 강제 초기화
      responseDto.setTags(new ArrayList<>(updatedResult.getTags()));
    }

    System.out.println("✅ 테스트 결과 수정 완료: " + resultId + " by " + currentUsername);
    return responseDto;
  }

  /**
   * 이전 테스트 결과 삭제 (PreviousResultsDialog용) 권한 체크: ADMIN OR MANAGER만
   *
   * @param resultId 삭제할 테스트 결과 ID
   * @param currentUsername 현재 사용자 username
   * @throws SecurityException 권한이 없는 경우 (ADMIN/MANAGER가 아닌 경우)
   * @throws IllegalArgumentException 결과를 찾을 수 없는 경우
   */
  public void deletePreviousTestResult(String resultId, String currentUsername) {
    // 1. 기존 TestResult 조회
    TestResult existingResult =
        testResultRepository
            .findById(resultId)
            .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + resultId));

    if (existingResult.getTestExecution() != null
        && "COMPLETED".equals(existingResult.getTestExecution().getStatus())) {
      throw new IllegalStateException("COMPLETED_EXECUTION");
    }

    // 2. 현재 사용자 조회
    User currentUser =
        userRepository
            .findByUsername(currentUsername)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + currentUsername));

    // 3. 권한 확인: ADMIN OR MANAGER만
    boolean isAdmin = "ADMIN".equals(currentUser.getRole());
    boolean isManager = "MANAGER".equals(currentUser.getRole());

    if (!isAdmin && !isManager) {
      throw new SecurityException(
          String.format(
              "삭제 권한이 없습니다. Admin 또는 Manager만 삭제할 수 있습니다. (사용자: %s, 역할: %s)",
              currentUsername, currentUser.getRole()));
    }

    // 4. ICT-InlineImage: 인라인 이미지 삭제 연동
    deleteInlineImagesFromNotes(existingResult.getNotes());

    // 5. 삭제
    testResultRepository.delete(existingResult);

    System.out.println("🗑️ 테스트 결과 삭제 완료: " + resultId + " by " + currentUsername);
  }

  /**
   * ICT-InlineImage: 노트 본문에서 인라인 이미지 ID를 추출하여 삭제 처리
   *
   * @param notes 마크다운 본문
   */
  private void deleteInlineImagesFromNotes(String notes) {
    Set<String> attachmentIds = extractInlineImageIds(notes);
    if (attachmentIds.isEmpty()) {
      // 지울 이미지가 없으면 사용자 조회도 하지 않는다 — 인증 컨텍스트가 없는 경로에서 실패하지 않도록
      return;
    }

    User currentUser = getCurrentUser();
    for (String attachmentId : attachmentIds) {
      try {
        fileStorageService.deleteAttachment(attachmentId, currentUser);
        System.out.println("🖼️ 인라인 이미지 연계 삭제 완료: " + attachmentId);
      } catch (Exception e) {
        System.err.println("❌ 인라인 이미지 삭제 실패 (ID: " + attachmentId + "): " + e.getMessage());
        // 개별 이미지 삭제 실패가 전체 프로세스를 중단시키지 않도록 예외 처리
      }
    }
  }

  /**
   * ICT-InlineImage: 노트 본문에 삽입된 인라인 이미지를 "사용 중"으로 표시한다.
   *
   * <p>표시가 없으면 미사용 첨부로 분류되어 정리 대상이 되고, 결과 화면에서 이미지가 사라진다. 결과를 저장하는 모든 경로가 이 메서드를 거치게 해서, 화면마다 따로
   * 호출하다 빠뜨리는 일을 막는다.
   *
   * @param notes 결과 노트 본문
   */
  private void markInlineImagesAsUsed(String notes) {
    for (String attachmentId : extractInlineImageIds(notes)) {
      try {
        fileStorageService.markAsUsedIfPresent(attachmentId);
      } catch (Exception e) {
        // 표시 실패가 결과 저장을 되돌리게 하지 않는다
        System.err.println("❌ 인라인 이미지 사용 표시 실패 (ID: " + attachmentId + "): " + e.getMessage());
      }
    }
  }

  /**
   * 본문에서 인라인 이미지 첨부 ID를 중복 없이 추출한다.
   *
   * @param content 노트 또는 설명 본문
   * @return 등장 순서를 지킨 첨부 ID 집합 (본문이 비면 빈 집합)
   */
  private Set<String> extractInlineImageIds(String content) {
    if (content == null || content.isBlank()) {
      return Collections.emptySet();
    }

    Set<String> ids = new LinkedHashSet<>();
    java.util.regex.Matcher matcher = INLINE_IMAGE_PATTERN.matcher(content);
    while (matcher.find()) {
      // 저장된 첨부 ID는 소문자 UUID이므로 대문자로 적힌 URL도 같은 값으로 취급한다
      ids.add(matcher.group(1).toLowerCase(java.util.Locale.ROOT));
    }
    return ids;
  }
}
