package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestSessionRequestDto;
import com.testcase.testcasemanagement.dto.TestSessionResponseDto;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCharter;
import com.testcase.testcasemanagement.model.TestSession;
import com.testcase.testcasemanagement.model.TestSessionApproval;
import com.testcase.testcasemanagement.model.TestSessionInterruption;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestSessionApprovalRepository;
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

  public TestSessionResponseDto createSession(TestSessionRequestDto request) {
    validateTimeDistribution(request);

    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(
                () -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다: " + request.getProjectId()));

    TestCharter charter = testCharterService.findActiveCharter(request.getCharterId());

    if (!charter.getProject().getId().equals(project.getId())) {
      throw new ResourceNotValidException(
          "세션 프로젝트와 차터 프로젝트가 일치하지 않습니다.",
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
        List.of(TestSession.SessionStatus.DRAFT, TestSession.SessionStatus.NEEDS_UPDATE),
        "세션 수정은 DRAFT 또는 NEEDS_UPDATE 상태에서만 가능합니다.");

    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(
                () -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다: " + request.getProjectId()));

    TestCharter charter = testCharterService.findActiveCharter(request.getCharterId());
    if (!charter.getProject().getId().equals(project.getId())) {
      throw new ResourceNotValidException(
          "세션 프로젝트와 차터 프로젝트가 일치하지 않습니다.",
          Map.of("projectId", project.getId(), "charterProjectId", charter.getProject().getId()));
    }

    applyRequest(session, request, project, charter);
    TestSession updated = testSessionRepository.save(session);
    return toDto(updated);
  }

  public TestSessionResponseDto startSession(String id) {
    TestSession session = findById(id);
    ensureStatus(session, List.of(TestSession.SessionStatus.DRAFT), "시작은 DRAFT 상태에서만 가능합니다.");

    session.setStatus(TestSession.SessionStatus.RUNNING);
    if (session.getStartedAt() == null) {
      session.setStartedAt(LocalDateTime.now());
    }
    session.setEndedAt(null);

    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto pauseSession(String id, String reason) {
    TestSession session = findById(id);
    ensureStatus(session, List.of(TestSession.SessionStatus.RUNNING), "중단은 RUNNING 상태에서만 가능합니다.");

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
    ensureStatus(session, List.of(TestSession.SessionStatus.PAUSED), "재개는 PAUSED 상태에서만 가능합니다.");

    TestSessionInterruption open =
        testSessionInterruptionRepository
            .findFirstBySessionIdAndEndedAtIsNullOrderByStartedAtDesc(id)
            .orElseThrow(
                () -> new ResourceNotValidException("진행 중인 중단 기록이 없습니다.", Map.of("sessionId", id)));

    open.setEndedAt(LocalDateTime.now());
    testSessionInterruptionRepository.save(open);

    session.setStatus(TestSession.SessionStatus.RUNNING);
    session.setInterruptedMinutes(calculateInterruptedMinutes(id));
    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto endSession(String id) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(TestSession.SessionStatus.RUNNING, TestSession.SessionStatus.PAUSED),
        "종료는 RUNNING 또는 PAUSED 상태에서만 가능합니다.");

    if (session.getStatus() == TestSession.SessionStatus.PAUSED) {
      testSessionInterruptionRepository
          .findFirstBySessionIdAndEndedAtIsNullOrderByStartedAtDesc(id)
          .ifPresent(
              interruption -> {
                interruption.setEndedAt(LocalDateTime.now());
                testSessionInterruptionRepository.save(interruption);
              });
    }

    session.setStatus(TestSession.SessionStatus.DRAFT);
    session.setEndedAt(LocalDateTime.now());
    session.setInterruptedMinutes(calculateInterruptedMinutes(id));

    return toDto(testSessionRepository.save(session));
  }

  public TestSessionResponseDto submitSession(String id) {
    TestSession session = findById(id);
    ensureStatus(
        session,
        List.of(TestSession.SessionStatus.DRAFT, TestSession.SessionStatus.NEEDS_UPDATE),
        "제출은 DRAFT 또는 NEEDS_UPDATE 상태에서만 가능합니다.");

    session.setStatus(TestSession.SessionStatus.SUBMITTED);
    session.setSubmittedAt(LocalDateTime.now());
    TestSession updated = testSessionRepository.save(session);
    return toDto(updated);
  }

  public TestSessionResponseDto approveSession(String id, String comment) {
    TestSession session = findById(id);
    ensureStatus(
        session, List.of(TestSession.SessionStatus.SUBMITTED), "승인은 SUBMITTED 상태에서만 가능합니다.");

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
        session, List.of(TestSession.SessionStatus.SUBMITTED), "보완 요청은 SUBMITTED 상태에서만 가능합니다.");

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
      throw new ResourceNotFoundException("프로젝트를 찾을 수 없습니다: " + projectId);
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
          "시간 비율 합계는 100이어야 합니다.", Map.of("timeDistributionSum", String.valueOf(sum)));
    }
  }

  private void applyRequest(
      TestSession session, TestSessionRequestDto request, Project project, TestCharter charter) {
    session.setProject(project);
    session.setCharter(charter);
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
  }

  private TestSession findById(String id) {
    return testSessionRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("세션을 찾을 수 없습니다: " + id));
  }

  private void ensureStatus(
      TestSession session, List<TestSession.SessionStatus> allowedStatuses, String message) {
    if (!allowedStatuses.contains(session.getStatus())) {
      throw new ResourceNotValidException(message, Map.of("status", session.getStatus().name()));
    }
  }

  private Integer calculateInterruptedMinutes(String sessionId) {
    List<TestSessionInterruption> interruptions =
        testSessionInterruptionRepository.findBySessionIdOrderByStartedAtAsc(sessionId);

    long totalMinutes =
        interruptions.stream()
            .filter(it -> it.getEndedAt() != null)
            .mapToLong(it -> Duration.between(it.getStartedAt(), it.getEndedAt()).toMinutes())
            .sum();

    return (int) totalMinutes;
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

  private TestSessionResponseDto toDto(TestSession session) {
    return new TestSessionResponseDto(
        session.getId(),
        session.getProject().getId(),
        session.getCharter().getId(),
        session.getCharterSnapshotTitle(),
        session.getCharterSnapshotMission(),
        session.getTesterId(),
        session.getLeadId(),
        session.getTesterName(),
        session.getLeadName(),
        session.getNetDurationMinutes(),
        session.getTestExecutionPct(),
        session.getBugInvestigationPct(),
        session.getSetupAdminPct(),
        session.getEnvironmentSummary(),
        session.getProductVersion(),
        session.getStrategyTags(),
        session.getAreaTags(),
        session.getStatus().name(),
        session.getReviewComment(),
        session.getStartedAt(),
        session.getEndedAt(),
        session.getInterruptedMinutes(),
        session.getSubmittedAt(),
        session.getReviewedAt(),
        session.getCreatedAt(),
        session.getUpdatedAt());
  }
}
