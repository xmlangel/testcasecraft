// src/main/java/com/testcase/testcasemanagement/model/Group.java
// Group, GroupMember: 조직/프로젝트 내 그룹 및 멤버 관리.
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("그룹: 조직 또는 프로젝트 내에서 사용자를 분류하는 집합 단위")
@Table(name = "groups")
public class Group {
  @Comment("그룹 식별자: 이 그룹을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("그룹 명: 사용자가 지정한 그룹의 이름")
  @Column(nullable = false, length = 100)
  private String name;

  @Comment(value = "조직 식별자: 이 그룹이 속한 조직을 가리키는 값 (값 영역: organizations.id 참조, UUID 36자)", on = "organization_id")
  @JsonBackReference("organization-groups")
  @ManyToOne
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Comment(value = "프로젝트 식별자: 이 그룹이 속한 프로젝트를 가리키는 값 (값 영역: projects.id 참조, UUID 36자)", on = "project_id")
  @JsonIgnore
  @ManyToOne
  @JoinColumn(name = "project_id")
  private Project project;

  @Comment("그룹 설명: 그룹의 목적과 용도를 나타내는 상세 내용")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시", on = "created_at")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시", on = "updated_at")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // 그룹 멤버 관계 (양방향)
  @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<GroupMember> groupMembers = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
