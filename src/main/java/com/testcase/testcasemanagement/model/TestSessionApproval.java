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
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 세션 승인: 리드가 테스트 세션 보고에 내린 승인 결정과 의견")
@Table(
    name = "test_session_approvals",
    indexes = {@Index(name = "idx_test_session_approval_session", columnList = "session_id")})
public class TestSessionApproval {

  public enum ApprovalDecision {
    APPROVED,
    NEEDS_UPDATE
  }

  @Comment("승인 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("테스트 세션 식별자: 승인 대상인 테스트 세션 (값 영역: test_sessions.id 참조)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private TestSession session;

  @Comment("테스트 리드 식별자: 승인을 수행한 테스트 리드의 사용자명")
  @Column(name = "lead_id", length = 100)
  private String leadId;

  @Comment("승인 결정: 테스트 세션에 대한 승인 의사 (값 영역: APPROVED, NEEDS_UPDATE)")
  @Enumerated(EnumType.STRING)
  @Column(name = "decision", nullable = false, length = 30)
  private ApprovalDecision decision;

  @Comment("의견: 승인 또는 거부에 대한 설명 및 의견")
  @Column(name = "comment", columnDefinition = "TEXT")
  private String comment;

  @Comment("결정 일시: 승인 결정을 한 일시")
  @Column(name = "decided_at", nullable = false)
  private LocalDateTime decidedAt;

  @PrePersist
  protected void onCreate() {
    if (this.decidedAt == null) {
      this.decidedAt = LocalDateTime.now();
    }
  }
}
