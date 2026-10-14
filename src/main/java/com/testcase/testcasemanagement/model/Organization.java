// src/main/java/com/testcase/testcasemanagement/model/Organization.java
// Organization: 조직 정보 테이블.
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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
@Comment("조직: 프로젝트와 사용자를 포함하는 최상위 조직 단위 | Organization: top-level organizational unit that contains projects and users")
@Table(name = "organizations")
public class Organization {
  @Comment("조직 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Organization Identifier: value that uniquely identifies this row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("조직명: 이 조직을 구분하는 이름 | Organization Name: name that distinguishes this organization")
  @Column(nullable = false, unique = true, length = 100)
  private String name;

  @Comment("설명: 이 조직에 대한 설명 | Description: description of this organization")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // 조직 멤버 관계 (양방향)
  @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("organization-members")
  private List<OrganizationUser> organizationUsers = new ArrayList<>();

  // 조직에 속한 프로젝트들
  @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
  @JsonManagedReference("organization-projects")
  private List<Project> projects = new ArrayList<>();

  // 조직에 속한 그룹들
  @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
  @JsonManagedReference("organization-groups")
  private List<Group> groups = new ArrayList<>();

  // 현재 사용자의 조직 내 역할 (데이터베이스에 저장되지 않음)
  @Transient private String userRole;

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
