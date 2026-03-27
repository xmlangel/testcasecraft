package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
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
    name = "test_session_approvals",
    indexes = {@Index(name = "idx_test_session_approval_session", columnList = "session_id")})
public class TestSessionApproval {

  public enum ApprovalDecision {
    APPROVED,
    NEEDS_UPDATE
  }

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private TestSession session;

  @Column(name = "lead_id", length = 100)
  private String leadId;

  @Enumerated(EnumType.STRING)
  @Column(name = "decision", nullable = false, length = 30)
  private ApprovalDecision decision;

  @Column(name = "comment", columnDefinition = "TEXT")
  private String comment;

  @Column(name = "decided_at", nullable = false)
  private LocalDateTime decidedAt;

  @PrePersist
  protected void onCreate() {
    if (this.decidedAt == null) {
      this.decidedAt = LocalDateTime.now();
    }
  }
}
