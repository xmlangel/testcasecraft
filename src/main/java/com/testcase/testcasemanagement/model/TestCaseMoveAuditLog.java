package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

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
@Comment("테스트 케이스 이동 감사 로그: 사용자가 트리에서 테스트 케이스를 옮긴 기록 | Test Case Move Audit Log: record of a user moving a test case in the tree")
@Table(
    name = "tc_move_audit_log",
    indexes = {
      @Index(name = "idx_tcmal_testcase", columnList = "testcase_id"),
      @Index(name = "idx_tcmal_batch", columnList = "batch_group_id"),
      @Index(name = "idx_tcmal_project_moved_at", columnList = "project_id, moved_at")
    })
public class TestCaseMoveAuditLog {

  @Comment("식별자: 이동 기록을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a move record (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("테스트 케이스 식별자: 이동한 테스트 케이스 (값 영역: testcases.id 참조) | Test Case Identifier: test case that was moved (Value domain: references testcases.id)")
  @Column(name = "testcase_id", columnDefinition = "VARCHAR(36)", nullable = false)
  private String testcaseId;

  @Comment("이동 전 부모 식별자: 이동하기 전 트리에서 부모의 위치 (값 영역: testcases.id 참조) | Previous Parent Identifier: parent position in the tree before the move (Value domain: references testcases.id)")
  @Column(name = "from_parent_id", columnDefinition = "VARCHAR(36)")
  private String fromParentId;

  @Comment("이동 후 부모 식별자: 이동한 후 트리에서 부모의 위치 (값 영역: testcases.id 참조) | New Parent Identifier: parent position in the tree after the move (Value domain: references testcases.id)")
  @Column(name = "to_parent_id", columnDefinition = "VARCHAR(36)")
  private String toParentId;

  @Comment("이동 전 순서: 이동하기 전 같은 레벨 내에서의 순서 (값 영역: 0 이상) | Previous Order: order within the same level before the move (Value domain: 0 or greater)")
  @Column(name = "from_display_order")
  private Integer fromDisplayOrder;

  @Comment("이동 후 순서: 이동한 후 같은 레벨 내에서의 순서 (값 영역: 0 이상) | New Order: order within the same level after the move (Value domain: 0 or greater)")
  @Column(name = "to_display_order", nullable = false)
  private Integer toDisplayOrder;

  @Comment("이동자: 이 이동을 수행한 사용자 | Mover: user who performed this move")
  @Column(name = "moved_by", length = 100, nullable = false)
  private String movedBy;

  @Comment("이동 일시: 이동이 발생한 일시 | Moved Date Time: date and time the move occurred")
  @Column(name = "moved_at", nullable = false)
  private LocalDateTime movedAt;

  /** "single" | "batch" */
  @Comment("요청 유형: 단건 이동 또는 배치 이동 여부 (값 영역: single, batch) | Request Type: whether the move was a single move or a batch move (Value domain: single, batch)")
  @Column(name = "request_kind", length = 16, nullable = false)
  private String requestKind;

  @Comment("배치 그룹 식별자: 같은 배치 호출에 속한 이동들을 묶는 값 (값 영역: UUID 36자) | Batch Group Identifier: value that groups moves belonging to the same batch call (Value domain: UUID, 36 characters)")
  @Column(name = "batch_group_id", columnDefinition = "VARCHAR(36)")
  private String batchGroupId;

  @Comment("프로젝트 식별자: 이 이동이 발생한 프로젝트 (값 영역: projects.id 참조) | Project Identifier: project in which this move occurred (Value domain: references projects.id)")
  @Column(name = "project_id", columnDefinition = "VARCHAR(36)", nullable = false)
  private String projectId;

  @PrePersist
  protected void onCreate() {
    if (this.movedAt == null) this.movedAt = LocalDateTime.now();
  }
}
