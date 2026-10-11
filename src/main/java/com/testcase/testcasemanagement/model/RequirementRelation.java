package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 요구사항 사이의 관계(TestLink 의 req_relations). source 에서 target 으로 읽는다.
 *
 * <ul>
 *   <li>PARENT_OF: source 가 target 의 상위 요구사항이다
 *   <li>DEPENDS_ON: source 가 target 에 의존한다
 *   <li>RELATED_TO: 방향 없는 관련 관계
 * </ul>
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "requirement_relations",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_requirement_relation",
            columnNames = {"source_id", "target_id", "type"}),
    indexes = {
      @Index(name = "idx_req_relation_source", columnList = "source_id"),
      @Index(name = "idx_req_relation_target", columnList = "target_id")
    })
public class RequirementRelation {

  public enum Type {
    PARENT_OF,
    DEPENDS_ON,
    RELATED_TO
  }

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Column(name = "source_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String sourceId;

  @Column(name = "target_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String targetId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Type type;

  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  public RequirementRelation(String sourceId, String targetId, Type type, String createdBy) {
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.type = type;
    this.createdBy = createdBy;
  }

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}
