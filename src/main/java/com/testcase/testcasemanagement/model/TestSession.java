package com.testcase.testcasemanagement.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 세션: 테스터가 차터를 기준으로 정해진 시간 동안 수행한 탐색적 테스트 한 회차 | Test Session: single round of exploratory testing that a tester performs against a charter within a set time")
@Table(
    name = "test_sessions",
    indexes = {
      @Index(name = "idx_test_session_project", columnList = "project_id"),
      @Index(name = "idx_test_session_status", columnList = "status"),
      @Index(name = "idx_test_session_project_status", columnList = "project_id, status")
    })
public class TestSession {

  public enum SessionStatus {
    DRAFT,
    RUNNING,
    PAUSED,
    COMPLETED,
    SUBMITTED,
    NEEDS_UPDATE,
    APPROVED,
    ARCHIVED
  }

  @Comment("식별자: 테스트 세션을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a test session (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트: 이 세션이 속한 프로젝트 (값 영역: projects.id 참조) | Project: project to which this session belongs (Value domain: references projects.id)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("테스트 차터 식별자: 이 세션에서 수행할 테스트 활동을 정의한 차터 (값 영역: test_charters.id 참조) | Test Charter Identifier: charter that defines the test activity to be performed in this session (Value domain: references test_charters.id)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "charter_id", nullable = false)
  private TestCharter charter;

  @Comment("세션 제목: 테스터가 붙이는 이 세션의 이름 (값 영역: 255자 이하) | Session Title: name the tester gives to this session (Value domain: up to 255 characters)")
  @Column(name = "title", nullable = false, length = 255)
  private String title;

  @Comment("차터 제목 스냅샷: 세션 시점의 차터 제목 (값 영역: 200자 이하) | Charter Title Snapshot: charter title as of the session (Value domain: up to 200 characters)")
  @Column(name = "charter_snapshot_title", nullable = false, length = 200)
  private String charterSnapshotTitle;

  @Comment("차터 미션 스냅샷: 세션 시점의 차터 미션 내용 | Charter Mission Snapshot Text: charter mission content as of the session")
  @Column(name = "charter_snapshot_mission", nullable = false, columnDefinition = "TEXT")
  private String charterSnapshotMission;

  @Comment("테스터 명: 이 세션을 수행한 테스터의 이름 (값 영역: 100자 이하) | Tester Name: name of the tester who performed this session (Value domain: up to 100 characters)")
  @Column(name = "tester_name", nullable = false, length = 100)
  private String testerName;

  @Comment("테스트 리드 명: 이 세션을 감독한 테스트 리드의 이름 (값 영역: 100자 이하) | Test Lead Name: name of the test lead who supervised this session (Value domain: up to 100 characters)")
  @Column(name = "lead_name", nullable = false, length = 100)
  private String leadName;

  @Comment("테스터 식별자: 이 세션을 수행한 테스터 (값 영역: users.id 참조) | Tester Identifier: tester who performed this session (Value domain: references users.id)")
  @Column(name = "tester_id", length = 100)
  private String testerId;

  @Comment("테스트 리드 식별자: 이 세션을 감독한 테스트 리드 (값 영역: users.id 참조) | Test Lead Identifier: test lead who supervised this session (Value domain: references users.id)")
  @Column(name = "lead_id", length = 100)
  private String leadId;

  @Comment("순 진행 시간: 실제 테스트 실행에 사용된 시간 (값 영역: 분) | Net Duration: time actually spent on test execution (Value domain: minutes)")
  @Column(name = "net_duration_minutes", nullable = false)
  private Integer netDurationMinutes;

  @Comment("테스트 실행 비율: 세션 시간 중 실제 테스트 실행에 사용한 비율 (값 영역: 0~100, %) | Test Execution Ratio: share of the session time actually spent on test execution (Value domain: 0 to 100, %)")
  @Column(name = "test_execution_pct", nullable = false)
  private Integer testExecutionPct;

  @Comment("결함 조사 비율: 세션 시간 중 발견된 결함 조사에 사용한 비율 (값 영역: 0~100, %) | Defect Investigation Percentage: share of the session time spent investigating the defects found (Value domain: 0 to 100, percent)")
  @Column(name = "bug_investigation_pct", nullable = false)
  private Integer bugInvestigationPct;

  @Comment("설정 및 관리 비율: 세션 시간 중 환경 설정 및 행정 업무에 사용한 비율 (값 영역: 0~100, %) | Setup and Admin Percentage: proportion of the session time spent on environment setup and administrative tasks (Value domain: 0 to 100, %)")
  @Column(name = "setup_admin_pct", nullable = false)
  private Integer setupAdminPct;

  @Comment("환경 요약: 테스트를 수행한 환경(OS, 브라우저 등)에 대한 설명 | Environment Summary Text: description of the environment (OS, browser, etc.) in which the test was performed")
  @Column(name = "environment_summary", columnDefinition = "TEXT")
  private String environmentSummary;

  @Comment("제품 버전: 테스트한 제품의 버전 정보 | Product Version: version information of the product under test")
  @Column(name = "product_version", length = 100)
  private String productVersion;

  @Comment("세션 시작 일시: 테스트 세션이 시작된 일시 | Session Start Date Time: date and time the test session started")
  @Column(name = "started_at")
  private LocalDateTime startedAt;

  @Comment("세션 종료 일시: 테스트 세션이 종료된 일시 | Session End Date Time: date and time the test session ended")
  @Column(name = "ended_at")
  private LocalDateTime endedAt;

  @Comment("중단 시간: 세션 중간에 중단된 누적 시간 (값 영역: 분) | Interruption Duration: accumulated time the session was interrupted midway (Value domain: minutes)")
  @Column(name = "interrupted_minutes")
  private Integer interruptedMinutes;

  @Comment("테스트 세션 전략 태그: 이 세션에서 사용한 테스트 전략 키워드 | Test Session Strategy Tag: keyword for a test strategy used in this session")
  @Comment(value = "테스트 세션 식별자: 전략 태그가 붙은 테스트 세션 (값 영역: test_sessions.id 참조) | Test Session Identifier: test session to which the strategy tag is attached (Value domain: references test_sessions.id)", on = "session_id")
  @Comment(value = "전략 태그 명: 이 세션에 붙인 테스트 전략 키워드 (값 영역: 100자 이하) | Strategy Tag Name: test strategy keyword attached to this session (Value domain: up to 100 characters)", on = "tag")
  @ElementCollection
  @CollectionTable(
      name = "test_session_strategy_tags",
      joinColumns = @JoinColumn(name = "session_id"))
  @Column(name = "tag", length = 100)
  private List<String> strategyTags = new ArrayList<>();

  @Comment("테스트 세션 영역 태그: 이 세션에서 테스트한 제품 영역 키워드 | Test Session Area Tag: keyword for a product area tested in this session")
  @Comment(value = "테스트 세션 식별자: 영역 태그가 붙은 테스트 세션 (값 영역: test_sessions.id 참조) | Test Session Identifier: test session to which the area tag is attached (Value domain: references test_sessions.id)", on = "session_id")
  @Comment(value = "영역 태그 명: 이 세션에서 테스트한 제품 영역 키워드 (값 영역: 100자 이하) | Area Tag Name: keyword for a product area tested in this session (Value domain: up to 100 characters)", on = "tag")
  @ElementCollection
  @CollectionTable(name = "test_session_area_tags", joinColumns = @JoinColumn(name = "session_id"))
  @Column(name = "tag", length = 100)
  private List<String> areaTags = new ArrayList<>();

  @Comment("상태: 세션의 라이프사이클 상태 (값 영역: DRAFT, RUNNING, PAUSED, COMPLETED, SUBMITTED, NEEDS_UPDATE, APPROVED, ARCHIVED) | Status: lifecycle status of the session (Value domain: DRAFT, RUNNING, PAUSED, COMPLETED, SUBMITTED, NEEDS_UPDATE, APPROVED, ARCHIVED)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private SessionStatus status;

  @Comment("흐름 노트: 세션 진행 방식 및 테스트 흐름에 대한 메모 | Flow Note Text: note on how the session was conducted and on the test flow")
  @Column(name = "flow_notes", columnDefinition = "TEXT")
  private String flowNotes;

  @Comment("커버리지 노트: 세션에서 달성한 테스트 커버리지에 대한 기록 | Coverage Note Text: record of the test coverage achieved in the session")
  @Column(name = "coverage_notes", columnDefinition = "TEXT")
  private String coverageNotes;

  @Comment("오라클 노트: 테스트 기대값 설정 또는 기대값 판정 근거에 대한 기록 | Oracle Note: record of how the test expected values were set or of the basis for judging results against them")
  @Column(name = "oracle_notes", columnDefinition = "TEXT")
  private String oracleNotes;

  @Comment("활동 노트: 세션 중 수행한 추가 활동(예: 성능 테스트, 보안 검증)에 대한 기록 | Activity Note Text: record of additional activities performed during the session (for example, performance testing or security verification)")
  @Column(name = "activity_notes", columnDefinition = "TEXT")
  private String activityNotes;

  @Comment("결함 요약: 세션에서 발견한 결함의 분포, 심각도, 특성을 한 문장으로 정리 | Defect Summary: one-sentence summary of the distribution, severity, and characteristics of the defects found in the session")
  @Column(name = "bug_headline", length = 500)
  private String bugHeadline;

  @Comment("장애물: 세션 수행 중 마주친 테스트를 막는 환경 이슈 또는 요구사항 모호함 | Blocker Text: environment issue or requirement ambiguity encountered during the session that blocked testing")
  @Column(name = "blockers", columnDefinition = "TEXT")
  private String blockers;

  @Comment("미해결 질문: 세션 중 답을 찾지 못한 제품 또는 명세 관련 질문 | Remaining Questions: product or specification question left unanswered during the session")
  @Column(name = "remaining_questions", columnDefinition = "TEXT")
  private String remainingQuestions;

  @Comment("테스트 데이터: 세션 수행에 사용한 테스트 데이터의 특징 및 출처 | Test Data Text: characteristics and source of the test data used to perform the session")
  @Column(name = "test_data", columnDefinition = "TEXT")
  private String testData;

  @Comment("평가: 이 세션의 유용성, 결과, 학습점을 테스트 리드가 기록 | Evaluation Text: test lead record of the usefulness, outcomes, and lessons learned of this session")
  @Column(name = "evaluation", columnDefinition = "TEXT")
  private String evaluation;

  @Comment("다음 차터: 다음 세션에서 수행할 테스트 활동 제안 | Next Charter: suggested test activity to perform in the next session")
  @Column(name = "next_charter", columnDefinition = "TEXT")
  private String nextCharter;

  @Comment("성취도: 이 세션의 목표 달성 정도를 백분율로 표현 (값 영역: 0~100, %) | Achievement Percentage: degree to which the goals of this session were achieved, expressed as a percentage (Value domain: 0 to 100, %)")
  @Column(name = "achievement")
  private Integer achievement;

  @Comment("리뷰 의견: 테스트 리드의 최종 검토 및 피드백 | Review Comment: final review and feedback from the test lead")
  @Column(name = "review_comment", columnDefinition = "TEXT")
  private String reviewComment;

  /** 연결된 JIRA 이슈 키 (예: PRJ-123) */
  @Comment("Jira 이슈 키: 이 세션이 연결된 Jira 이슈 식별자 | Jira Issue Key: identifier of the Jira issue to which this session is linked")
  @Column(name = "jira_issue_key", length = 500)
  private String jiraIssueKey;

  @Comment("테스트 세션 노트: 세션 중 테스터가 기록한 자유 형식의 메모 | Test Session Note: free-form note recorded by the tester during a session")
  @Comment(value = "테스트 세션 식별자: 노트를 기록한 테스트 세션 (값 영역: test_sessions.id 참조) | Test Session Identifier: test session in which the note was recorded (Value domain: references test_sessions.id)", on = "session_id")
  @ElementCollection
  @CollectionTable(name = "test_session_notes", joinColumns = @JoinColumn(name = "session_id"))
  private List<TestSessionNote> notes = new ArrayList<>();

  @Comment("테스트 세션 테스트: 테스트 세션에서 수행한 테스트 하나의 절차와 결과 | Test Session Test: procedure and result of a single test performed in a test session")
  @Comment(value = "테스트 세션 식별자: 테스트를 수행한 테스트 세션 (값 영역: test_sessions.id 참조) | Test Session Identifier: test session in which the test was performed (Value domain: references test_sessions.id)", on = "session_id")
  @ElementCollection
  @CollectionTable(name = "test_session_tests", joinColumns = @JoinColumn(name = "session_id"))
  private List<TestSessionTest> tests = new ArrayList<>();

  @Comment("테스트 세션 결함: 세션에서 발견한 개별 결함 기록 | Test Session Defect: record of an individual defect found during a session")
  @Comment(value = "테스트 세션 식별자: 결함을 발견한 테스트 세션 (값 영역: test_sessions.id 참조) | Test Session Identifier: test session in which the defect was found (Value domain: references test_sessions.id)", on = "session_id")
  @ElementCollection
  @CollectionTable(name = "test_session_bugs", joinColumns = @JoinColumn(name = "session_id"))
  private List<TestSessionBug> bugs = new ArrayList<>();

  @Comment("제출 일시: 이 세션이 리드에게 제출된 일시 | Submitted Date Time: date and time this session was submitted to the lead")
  @Column(name = "submitted_at")
  private LocalDateTime submittedAt;

  @Comment("검토 일시: 이 세션이 리드에게 검토된 일시 | Reviewed Date Time: date and time this session was reviewed by the lead")
  @Column(name = "reviewed_at")
  private LocalDateTime reviewedAt;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.status == null) {
      this.status = SessionStatus.DRAFT;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  @OneToMany(
      mappedBy = "session",
      cascade = jakarta.persistence.CascadeType.ALL,
      orphanRemoval = true)
  private List<TestSessionApproval> approvals = new ArrayList<>();

  @OneToMany(
      mappedBy = "session",
      cascade = jakarta.persistence.CascadeType.ALL,
      orphanRemoval = true)
  private List<TestSessionInterruption> interruptions = new ArrayList<>();
}
