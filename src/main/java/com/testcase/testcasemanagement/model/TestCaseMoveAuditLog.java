package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/**
 * 테스트케이스 트리 이동(DnD)의 감사 로그.
 *
 * <p>단건 이동은 {@code requestKind = "single"}, 배치 이동은 {@code "batch"}로 기록되며, 같은 배치 호출에 속한 행은 동일한
 * {@code batchGroupId}를 공유한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "tc_move_audit_log",
    indexes = {
      @Index(name = "idx_tcmal_testcase", columnList = "testcase_id"),
      @Index(name = "idx_tcmal_batch", columnList = "batch_group_id"),
      @Index(name = "idx_tcmal_project_moved_at", columnList = "project_id, moved_at")
    })
public class TestCaseMoveAuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Column(name = "testcase_id", columnDefinition = "VARCHAR(36)", nullable = false)
  private String testcaseId;

  @Column(name = "from_parent_id", columnDefinition = "VARCHAR(36)")
  private String fromParentId;

  @Column(name = "to_parent_id", columnDefinition = "VARCHAR(36)")
  private String toParentId;

  @Column(name = "from_display_order")
  private Integer fromDisplayOrder;

  @Column(name = "to_display_order", nullable = false)
  private Integer toDisplayOrder;

  @Column(name = "moved_by", length = 100, nullable = false)
  private String movedBy;

  @Column(name = "moved_at", nullable = false)
  private LocalDateTime movedAt;

  /** "single" | "batch" */
  @Column(name = "request_kind", length = 16, nullable = false)
  private String requestKind;

  @Column(name = "batch_group_id", columnDefinition = "VARCHAR(36)")
  private String batchGroupId;

  @Column(name = "project_id", columnDefinition = "VARCHAR(36)", nullable = false)
  private String projectId;

  @PrePersist
  protected void onCreate() {
    if (this.movedAt == null) this.movedAt = LocalDateTime.now();
  }
}
