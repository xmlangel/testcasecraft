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
@Comment("그룹: 조직 또는 프로젝트 내에서 사용자를 분류하는 집합 단위 | Group: collective unit that classifies users within an organization or project")
@Table(name = "groups")
public class Group {
  @Comment("그룹 식별자: 이 그룹을 유일하게 가리키는 값 (값 영역: UUID 36자) | Group Identifier: value that uniquely identifies this group (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("그룹 명: 사용자가 지정한 그룹의 이름 | Group Name: name of the group specified by the user")
  @Column(nullable = false, length = 100)
  private String name;

  @Comment(value = "조직 식별자: 이 그룹이 속한 조직을 가리키는 값 (값 영역: organizations.id 참조, UUID 36자) | Organization Identifier: value that identifies the organization this group belongs to (Value domain: references organizations.id, UUID, 36 characters)", on = "organization_id")
  @JsonBackReference("organization-groups")
  @ManyToOne
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Comment(value = "프로젝트 식별자: 이 그룹이 속한 프로젝트를 가리키는 값 (값 영역: projects.id 참조, UUID 36자) | Project Identifier: value that points to the project to which this group belongs (Value domain: references projects.id, UUID, 36 characters)", on = "project_id")
  @JsonIgnore
  @ManyToOne
  @JoinColumn(name = "project_id")
  private Project project;

  @Comment("그룹 설명: 그룹의 목적과 용도를 나타내는 상세 내용 | Group Description: detailed content describing the purpose and use of the group")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved", on = "created_at")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed", on = "updated_at")
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
