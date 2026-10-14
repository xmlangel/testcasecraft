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
import org.hibernate.annotations.Comment;

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
@Comment("요구사항 관계: 두 요구사항 사이의 포함, 의존, 관련 관계 | Requirement Relation: containment, dependency, or association relationship between two requirements")
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

  @Comment("요구사항 관계 식별자: 이 관계 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Requirement Relation Identifier: value that uniquely identifies this relation row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment(value = "출발 요구사항 식별자: 관계의 출발점이 되는 요구사항을 가리키는 값 (값 영역: UUID 36자) | Source Requirement Identifier: value that identifies the requirement serving as the starting point of the relation (Value domain: UUID, 36 characters)", on = "source_id")
  @Column(name = "source_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String sourceId;

  @Comment(value = "대상 요구사항 식별자: 관계의 대상이 되는 요구사항을 가리키는 값 (값 영역: UUID 36자) | Target Requirement Identifier: value that points to the requirement that is the target of the relation (Value domain: UUID, 36 characters)", on = "target_id")
  @Column(name = "target_id", nullable = false, columnDefinition = "VARCHAR(36)")
  private String targetId;

  @Comment("관계 유형 코드: 두 요구사항 간의 관계 방식을 나타내는 코드 (값 영역: PARENT_OF, DEPENDS_ON, RELATED_TO) | Relation Type Code: code that indicates how two requirements are related (Value domain: PARENT_OF, DEPENDS_ON, RELATED_TO)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Type type;

  @Comment("생성자: 이 관계를 생성한 사용자를 나타내는 값 | Creator: value that identifies the user who created this relation")
  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved", on = "created_at")
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
