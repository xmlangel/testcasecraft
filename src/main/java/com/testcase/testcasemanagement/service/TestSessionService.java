package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestSessionAttachmentDto;
import com.testcase.testcasemanagement.dto.TestSessionBugDto;
import com.testcase.testcasemanagement.dto.TestSessionNoteDto;
import com.testcase.testcasemanagement.dto.TestSessionRequestDto;
import com.testcase.testcasemanagement.dto.TestSessionResponseDto;
import com.testcase.testcasemanagement.dto.TestSessionTestDto;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCharter;
import com.testcase.testcasemanagement.model.TestSession;
import com.testcase.testcasemanagement.model.TestSessionApproval;
import com.testcase.testcasemanagement.model.TestSessionInterruption;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestSessionApprovalRepository;
import com.testcase.testcasemanagement.repository.TestSessionAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestSessionInterruptionRepository;
import com.testcase.testcasemanagement.repository.TestSessionRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TestSessionService {

  @Autowired private TestSessionRepository testSessionRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private TestCharterService testCharterService;

  @Autowired private TestSessionApprovalRepository testSessionApprovalRepository;

  @Autowired private TestSessionInterruptionRepository testSessionInterruptionRepository;
  @Autowired private TestSessionAttachmentRepository testSessionAttachmentRepository;

  public TestSessionResponseDto createSession(TestSessionRequestDto request) {
    validateTimeDistribution(request);

    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException("Project not found: " + request.getProjectId()));

    TestCharter charter = testCharterService.findActiveCharter(request.getCharterId());

    if (!charter.getProject().getId().equals(project.getId())) {
      throw new ResourceNotValidException(
          "The session project does not match the charter project.",
          Map.of("projectId", project.getId(), "charterProjectId", charter.getProject().getId()));
    }

    TestSession session = new TestSession();
    applyRequest(session, request, project, charter);
    session.setStatus(TestSession.SessionStatus.DRAFT);
    session.setInterruptedMinutes(0);

    TestSession saved = testSessionRepository.save(session);
    return toDto(saved);
  }

  @Transactional(readOnly = true)
  public TestSessionResponseDto getSession(String id) {
    return toDto(findById(id));
  }

  public TestSessionResponseDto updateSession(String id, TestSessionRequestDto request) {
    validateTimeDistribution(request);

    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(
            TestSession.SessionStatus.DRAFT,
            TestSession.SessionStatus.COMPLETED,
            TestSession.SessionStatus.SUBMITTED,
            TestSession.SessionStatus.NEEDS_UPDATE),
        "A session can only be updated in DRAFT, COMPLETED, SUBMITTED, or NEEDS_UPDATE status.");

    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException("Project not found: " + request.getProjectId()));

    TestCharter charter =
        testCharterService.getCharterById(request.getCharterId()); // findActiveCharter 대신 일반 조회 사용
    if (!charter.getProject().getId().equals(project.getId())) {
      throw new ResourceNotValidException(
          "The session project does not match the charter project.",
          Map.of("projectId", project.getId(), "charterProjectId", charter.getProject().getId()));
    }

    applyRequest(session, request, project, charter);
    TestSession updated = testSessionRepository.save(session);
    return toDto(updated);
  }

  public TestSessionResponseDto startSession(String id) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(TestSession.SessionStatus.DRAFT),
        "A session can only be started in DRAFT status.");

    session.setStatus(TestSession.SessionStatus.RUNNING);
    if (session.getStartedAt() == null) {
      session.setStartedAt(LocalDateTime.now());
    }
    session.setEndedAt(null);

    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto pauseSession(String id, String reason) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(TestSession.SessionStatus.RUNNING),
        "A session can only be paused in RUNNING status.");

    TestSessionInterruption interruption = new TestSessionInterruption();
    interruption.setSession(session);
    interruption.setStartedAt(LocalDateTime.now());
    interruption.setReason(reason);
    testSessionInterruptionRepository.save(interruption);

    session.setStatus(TestSession.SessionStatus.PAUSED);
    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto resumeSession(String id) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(
            TestSession.SessionStatus.DRAFT,
            TestSession.SessionStatus.PAUSED,
            TestSession.SessionStatus.COMPLETED,
            TestSession.SessionStatus.NEEDS_UPDATE),
        "A session can only be resumed in DRAFT, PAUSED, COMPLETED, or NEEDS_UPDATE status.");

    if (session.getStartedAt() == null) {
      throw new ResourceNotValidException(
          "A session with no start record cannot be resumed. Start it instead.",
          java.util.Collections.emptyMap());
    }

    if (session.getStatus() == TestSession.SessionStatus.PAUSED) {
      testSessionInterruptionRepository
          .findFirstBySessionIdAndEndedAtIsNullOrderByStartedAtDesc(id)
          .ifPresent(
              open -> {
                open.setEndedAt(LocalDateTime.now());
                testSessionInterruptionRepository.save(open);
              });
    }

    session.setStatus(TestSession.SessionStatus.RUNNING);
    session.setEndedAt(null); // 재개 시 종료 시각 초기화
    session.setInterruptedMinutes(calculateInterruptedMinutes(id));
    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto endSession(String id) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(
            TestSession.SessionStatus.DRAFT,
            TestSession.SessionStatus.RUNNING,
            TestSession.SessionStatus.PAUSED),
        "A session can only be ended in DRAFT, RUNNING, or PAUSED status.");

    if (session.getStatus() == TestSession.SessionStatus.DRAFT) {
      if (session.getStartedAt() == null) {
        session.setStartedAt(LocalDateTime.now());
      }
    }

    if (session.getStatus() == TestSession.SessionStatus.PAUSED) {
      testSessionInterruptionRepository
          .findFirstBySessionIdAndEndedAtIsNullOrderByStartedAtDesc(id)
          .ifPresent(
              interruption -> {
                interruption.setEndedAt(LocalDateTime.now());
                testSessionInterruptionRepository.save(interruption);
              });
    }

    session.setStatus(TestSession.SessionStatus.COMPLETED);
    session.setEndedAt(LocalDateTime.now());
    session.setInterruptedMinutes(calculateInterruptedMinutes(id));

    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto submitSession(String id) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(
            TestSession.SessionStatus.DRAFT,
            TestSession.SessionStatus.COMPLETED,
            TestSession.SessionStatus.NEEDS_UPDATE),
        "A session can only be submitted in DRAFT, COMPLETED, or NEEDS_UPDATE status.");

    session.setStatus(TestSession.SessionStatus.SUBMITTED);
    session.setSubmittedAt(LocalDateTime.now());
    TestSession updated = testSessionRepository.save(session);
    return toDto(updated);
  }

  public TestSessionResponseDto approveSession(String id, String comment) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(TestSession.SessionStatus.SUBMITTED),
        "A session can only be approved in SUBMITTED status.");

    session.setStatus(TestSession.SessionStatus.APPROVED);
    session.setReviewComment(comment);
    session.setReviewedAt(LocalDateTime.now());
    TestSession updated = testSessionRepository.save(session);

    appendApprovalHistory(updated, TestSessionApproval.ApprovalDecision.APPROVED, comment);
    return toDto(updated);
  }

  public TestSessionResponseDto requestUpdate(String id, String comment) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(TestSession.SessionStatus.SUBMITTED),
        "An update can only be requested in SUBMITTED status.");

    session.setStatus(TestSession.SessionStatus.NEEDS_UPDATE);
    session.setReviewComment(comment);
    session.setReviewedAt(LocalDateTime.now());
    TestSession updated = testSessionRepository.save(session);

    appendApprovalHistory(updated, TestSessionApproval.ApprovalDecision.NEEDS_UPDATE, comment);
    return toDto(updated);
  }

  @Transactional(readOnly = true)
  public List<TestSessionResponseDto> listByProject(
      String projectId,
      TestSession.SessionStatus status,
      LocalDateTime from,
      LocalDateTime to,
      String testerId,
      String charterId,
      int page,
      int size,
      String sort) {
    if (!projectRepository.existsById(projectId)) {
      throw new ResourceNotFoundException("Project not found: " + projectId);
    }

    Sort sortSpec = parseSort(sort);
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sortSpec);

    Specification<TestSession> spec =
        (root, query, cb) -> cb.equal(root.get("project").get("id"), projectId);

    if (status != null) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
    }
    if (from != null) {
      spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
    }
    if (to != null) {
      spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
    }
    if (testerId != null && !testerId.isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("testerId"), testerId));
    }
    if (charterId != null && !charterId.isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("charter").get("id"), charterId));
    }

    return testSessionRepository.findAll(spec, pageable).stream().map(this::toDto).toList();
  }

  private void validateTimeDistribution(TestSessionRequestDto request) {
    int sum =
        request.getTestExecutionPct()
            + request.getBugInvestigationPct()
            + request.getSetupAdminPct();
    if (sum != 100) {
      throw new ResourceNotValidException(
          "The time distribution must sum to 100.",
          Map.of("timeDistributionSum", String.valueOf(sum)));
    }
  }

  private void applyRequest(
      TestSession session, TestSessionRequestDto request, Project project, TestCharter charter) {
    session.setProject(project);
    session.setCharter(charter);
    session.setTitle(request.getTitle());
    session.setCharterSnapshotTitle(charter.getTitle());
    session.setCharterSnapshotMission(charter.getMission());
    session.setTesterId(request.getTesterId());
    session.setLeadId(request.getLeadId());
    session.setTesterName(request.getTesterName());
    session.setLeadName(request.getLeadName());
    session.setNetDurationMinutes(request.getNetDurationMinutes());
    session.setTestExecutionPct(request.getTestExecutionPct());
    session.setBugInvestigationPct(request.getBugInvestigationPct());
    session.setSetupAdminPct(request.getSetupAdminPct());
    session.setEnvironmentSummary(request.getEnvironmentSummary());
    session.setProductVersion(request.getProductVersion());
    session.setStrategyTags(
        request.getStrategyTags() == null ? List.of() : request.getStrategyTags());
    session.setAreaTags(request.getAreaTags() == null ? List.of() : request.getAreaTags());
    session.setFlowNotes(request.getFlowNotes());
    session.setCoverageNotes(request.getCoverageNotes());
    session.setOracleNotes(request.getOracleNotes());
    session.setActivityNotes(request.getActivityNotes());
    session.setBugHeadline(request.getBugHeadline());
    session.setBlockers(request.getBlockers());
    session.setRemainingQuestions(request.getRemainingQuestions());
    session.setTestData(request.getTestData());
    session.setEvaluation(request.getEvaluation());
    session.setNextCharter(request.getNextCharter());
    session.setAchievement(request.getAchievement());
    session.setJiraIssueKey(request.getJiraIssueKey());

    if (request.getNotes() != null) {
      session.getNotes().clear();
      request
          .getNotes()
          .forEach(
              n ->
                  session
                      .getNotes()
                      .add(
                          new com.testcase.testcasemanagement.model.TestSessionNote(
                              n.getTitle(), n.getContent())));
    }

    if (request.getTests() != null) {
      session.getTests().clear();
      request
          .getTests()
          .forEach(
              t ->
                  session
                      .getTests()
                      .add(
                          new com.testcase.testcasemanagement.model.TestSessionTest(
                              t.getTitle(), t.getSteps(), t.getExpectedResult(), t.getStatus())));
    }

    if (request.getBugs() != null) {
      session.getBugs().clear();
      request
          .getBugs()
          .forEach(
              b ->
                  session
                      .getBugs()
                      .add(
                          new com.testcase.testcasemanagement.model.TestSessionBug(
                              b.getTitle(),
                              b.getDescription(),
                              b.getSeverity(),
                              b.getJiraIssueKey())));
    }
  }

  private TestSession findById(String id) {
    return testSessionRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + id));
  }

  private void ensureStatus(
      TestSession session, List<TestSession.SessionStatus> allowedStatuses, String message) {
    if (!allowedStatuses.contains(session.getStatus())) {
      throw new ResourceNotValidException(message, Map.of("status", session.getStatus().name()));
    }
  }

  private Integer calculateInterruptedMinutes(String sessionId) {
    return (int) (calculateInterruptedSeconds(sessionId) / 60);
  }

  private Long calculateInterruptedSeconds(String sessionId) {
    List<TestSessionInterruption> interruptions =
        testSessionInterruptionRepository.findBySessionIdOrderByStartedAtAsc(sessionId);

    return interruptions.stream()
        .filter(it -> it.getEndedAt() != null)
        .mapToLong(it -> Duration.between(it.getStartedAt(), it.getEndedAt()).toSeconds())
        .sum();
  }

  private void appendApprovalHistory(
      TestSession session, TestSessionApproval.ApprovalDecision decision, String comment) {
    TestSessionApproval approval = new TestSessionApproval();
    approval.setSession(session);
    approval.setLeadId(SecurityContextHolder.getContext().getAuthentication().getName());
    approval.setDecision(decision);
    approval.setComment(comment);
    approval.setDecidedAt(LocalDateTime.now());
    testSessionApprovalRepository.save(approval);
  }

  private Sort parseSort(String sort) {
    if (sort == null || sort.isBlank()) {
      return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    String[] tokens = sort.split(",");
    String field = tokens[0].isBlank() ? "createdAt" : tokens[0];
    Sort.Direction direction =
        (tokens.length > 1 && "asc".equalsIgnoreCase(tokens[1]))
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
    return Sort.by(direction, field);
  }

  public void deleteSession(String id) {
    TestSession session = findById(id);
    // 연관된 승인 기록 및 중단 기록은 JPA Cascade 등에 의해 처리되거나 수동 삭제
    testSessionRepository.delete(session);
  }

  private TestSessionResponseDto toDto(TestSession session) {
    TestSessionResponseDto dto = new TestSessionResponseDto();
    dto.setId(session.getId());
    dto.setProjectId(session.getProject().getId());
    dto.setCharterId(session.getCharter().getId());
    dto.setTitle(session.getTitle());
    dto.setCharterSnapshotTitle(session.getCharterSnapshotTitle());
    dto.setCharterSnapshotMission(session.getCharterSnapshotMission());
    dto.setTesterId(session.getTesterId());
    dto.setLeadId(session.getLeadId());
    dto.setTesterName(session.getTesterName());
    dto.setLeadName(session.getLeadName());
    dto.setNetDurationMinutes(session.getNetDurationMinutes());
    dto.setTestExecutionPct(session.getTestExecutionPct());
    dto.setBugInvestigationPct(session.getBugInvestigationPct());
    dto.setSetupAdminPct(session.getSetupAdminPct());
    dto.setEnvironmentSummary(session.getEnvironmentSummary());
    dto.setProductVersion(session.getProductVersion());
    dto.setStrategyTags(session.getStrategyTags());
    dto.setAreaTags(session.getAreaTags());
    dto.setFlowNotes(session.getFlowNotes());
    dto.setCoverageNotes(session.getCoverageNotes());
    dto.setOracleNotes(session.getOracleNotes());
    dto.setActivityNotes(session.getActivityNotes());
    dto.setBugHeadline(session.getBugHeadline());
    dto.setBlockers(session.getBlockers());
    dto.setRemainingQuestions(session.getRemainingQuestions());
    dto.setTestData(session.getTestData());
    dto.setEvaluation(session.getEvaluation());
    dto.setNextCharter(session.getNextCharter());
    dto.setAchievement(session.getAchievement());
    dto.setJiraIssueKey(session.getJiraIssueKey());

    if (session.getNotes() != null) {
      dto.setNotes(
          session.getNotes().stream()
              .map(n -> new TestSessionNoteDto(n.getTitle(), n.getContent()))
              .collect(java.util.stream.Collectors.toList()));
    }

    if (session.getTests() != null) {
      dto.setTests(
          session.getTests().stream()
              .map(
                  t ->
                      new TestSessionTestDto(
                          t.getTitle(), t.getSteps(), t.getExpectedResult(), t.getStatus()))
              .collect(java.util.stream.Collectors.toList()));
    }

    if (session.getBugs() != null) {
      dto.setBugs(
          session.getBugs().stream()
              .map(
                  b ->
                      new TestSessionBugDto(
                          b.getTitle(), b.getDescription(), b.getSeverity(), b.getJiraIssueKey()))
              .collect(java.util.stream.Collectors.toList()));
    }

    List<com.testcase.testcasemanagement.model.TestSessionAttachment> attachments =
        testSessionAttachmentRepository.findActiveBySessionId(session.getId());
    if (attachments != null) {
      dto.setAttachments(
          attachments.stream()
              .map(TestSessionAttachmentDto::fromEntity)
              .collect(java.util.stream.Collectors.toList()));
    }

    dto.setStatus(session.getStatus().name());
    dto.setReviewComment(session.getReviewComment());
    dto.setStartedAt(session.getStartedAt());
    dto.setEndedAt(session.getEndedAt());
    dto.setInterruptedMinutes(session.getInterruptedMinutes());
    dto.setSubmittedAt(session.getSubmittedAt());
    dto.setReviewedAt(session.getReviewedAt());
    dto.setCreatedAt(session.getCreatedAt());
    dto.setUpdatedAt(session.getUpdatedAt());

    // 실시간 세션 진행 시간 계산 (초 단위)
    Long totalInterruptedSec = calculateInterruptedSeconds(session.getId());
    dto.setInterruptedSeconds(totalInterruptedSec);

    if (session.getStatus() == TestSession.SessionStatus.RUNNING
        && session.getStartedAt() != null) {
      long elapsed = Duration.between(session.getStartedAt(), LocalDateTime.now()).toSeconds();
      dto.setCurrentElapsedSeconds(Math.max(0, elapsed - totalInterruptedSec));
    } else if (session.getStatus() == TestSession.SessionStatus.PAUSED
        && session.getStartedAt() != null) {
      // 마지막 중단 시작 시간 기준으로 이전에 진행되었던 시간 계산
      testSessionInterruptionRepository
          .findFirstBySessionIdAndEndedAtIsNullOrderByStartedAtDesc(session.getId())
          .ifPresent(
              ongoing -> {
                long totalSinceStart =
                    Duration.between(session.getStartedAt(), ongoing.getStartedAt()).toSeconds();
                dto.setCurrentElapsedSeconds(Math.max(0, totalSinceStart - totalInterruptedSec));
              });
    } else if (session.getEndedAt() != null && session.getStartedAt() != null) {
      long total = Duration.between(session.getStartedAt(), session.getEndedAt()).toSeconds();
      dto.setCurrentElapsedSeconds(Math.max(0, total - totalInterruptedSec));
    } else {
      dto.setCurrentElapsedSeconds(0L);
    }

    return dto;
  }
}
