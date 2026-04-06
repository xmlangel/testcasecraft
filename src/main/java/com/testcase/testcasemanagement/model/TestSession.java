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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
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
    SUBMITTED,
    NEEDS_UPDATE,
    APPROVED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "charter_id", nullable = false)
  private TestCharter charter;

  @Column(name = "charter_snapshot_title", nullable = false, length = 200)
  private String charterSnapshotTitle;

  @Column(name = "charter_snapshot_mission", nullable = false, columnDefinition = "TEXT")
  private String charterSnapshotMission;

  @Column(name = "tester_name", nullable = false, length = 100)
  private String testerName;

  @Column(name = "lead_name", nullable = false, length = 100)
  private String leadName;

  @Column(name = "tester_id", length = 100)
  private String testerId;

  @Column(name = "lead_id", length = 100)
  private String leadId;

  @Column(name = "net_duration_minutes", nullable = false)
  private Integer netDurationMinutes;

  @Column(name = "test_execution_pct", nullable = false)
  private Integer testExecutionPct;

  @Column(name = "bug_investigation_pct", nullable = false)
  private Integer bugInvestigationPct;

  @Column(name = "setup_admin_pct", nullable = false)
  private Integer setupAdminPct;

  @Column(name = "environment_summary", columnDefinition = "TEXT")
  private String environmentSummary;

  @Column(name = "product_version", length = 100)
  private String productVersion;

  @Column(name = "started_at")
  private LocalDateTime startedAt;

  @Column(name = "ended_at")
  private LocalDateTime endedAt;

  @Column(name = "interrupted_minutes")
  private Integer interruptedMinutes;

  @ElementCollection
  @CollectionTable(
      name = "test_session_strategy_tags",
      joinColumns = @JoinColumn(name = "session_id"))
  @Column(name = "tag", length = 100)
  private List<String> strategyTags = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "test_session_area_tags", joinColumns = @JoinColumn(name = "session_id"))
  @Column(name = "tag", length = 100)
  private List<String> areaTags = new ArrayList<>();

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private SessionStatus status;

  @Column(name = "flow_notes", columnDefinition = "TEXT")
  private String flowNotes;

  @Column(name = "coverage_notes", columnDefinition = "TEXT")
  private String coverageNotes;

  @Column(name = "oracle_notes", columnDefinition = "TEXT")
  private String oracleNotes;

  @Column(name = "activity_notes", columnDefinition = "TEXT")
  private String activityNotes;

  @Column(name = "bug_headline", length = 500)
  private String bugHeadline;

  @Column(name = "blockers", columnDefinition = "TEXT")
  private String blockers;

  @Column(name = "remaining_questions", columnDefinition = "TEXT")
  private String remainingQuestions;

  @Column(name = "test_data", columnDefinition = "TEXT")
  private String testData;

  @Column(name = "evaluation", columnDefinition = "TEXT")
  private String evaluation;

  @Column(name = "next_charter", columnDefinition = "TEXT")
  private String nextCharter;

  @Column(name = "achievement")
  private Integer achievement;

  @Column(name = "review_comment", columnDefinition = "TEXT")
  private String reviewComment;

  @Column(name = "submitted_at")
  private LocalDateTime submittedAt;

  @Column(name = "reviewed_at")
  private LocalDateTime reviewedAt;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

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
