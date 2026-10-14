// src/main/java/com/testcase/testcasemanagement/model/Project.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Comment("프로젝트: 테스트 케이스, 테스트 플랜, 테스트 실행을 함께 관리하는 작업 단위 | Project: unit of work that manages test cases, test plans, and test executions together")
@Table(
    name = "projects",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"code"})})
public class Project {
  @Comment("식별자: 프로젝트를 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a project (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트 명: 프로젝트의 사람이 읽을 수 있는 이름 (값 영역: 100자 이하) | Project Name: human-readable name of the project (Value domain: up to 100 characters)")
  @Column(nullable = false, length = 100)
  private String name;

  @Comment("설명: 프로젝트의 목적과 범위에 대한 상세 설명 | Description: detailed description of the purpose and scope of the project")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment("표시 순서: 프로젝트 목록에서의 정렬 순서 (값 영역: 0 이상) | Display Order: sort order in the project list (Value domain: 0 or greater)")
  @Column(name = "display_order")
  private Integer displayOrder = 0; // 기본값 할당

  @Comment("프로젝트 코드: 프로젝트를 구분하는 짧은 코드, 프로젝트 단위로 유일 (값 영역: 50자 이하) | Project Code: short code that distinguishes a project, unique per project (Value domain: up to 50 characters)")
  @Column(name = "code", nullable = false, length = 50, unique = true)
  private String code; // ✅ NOT NULL + 유니크 제약조건

  // 조직과의 관계 - nullable (조직에 속하지 않은 프로젝트 허용)
  @Comment("조직: 이 프로젝트가 속한 조직 (값 영역: organizations.id 참조) | Organization: organization this project belongs to (Value domain: references organizations.id)")
  @JsonBackReference("organization-projects")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "createdat", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updatedat")
  private LocalDateTime updatedAt;

  // cascade/orphanRemoval 제거:
  // TestCaseService.deleteTestCase()가 재귀 삭제를 명시적으로 처리하므로
  // cascade=ALL, orphanRemoval=true 설정이 불필요하며,
  // 재귀 삭제 시 TransientObjectException의 근본 원인이 됩니다.
  @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
  @JsonManagedReference("project-testcases")
  @JsonIgnore // StackOverflowError 방지: 배치 저장 시 순환 참조 방지
  private List<TestCase> testCases;

  // 프로젝트 멤버 관계 (양방향)
  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("project-users")
  private List<ProjectUser> projectUsers = new ArrayList<>();

  // 프로젝트에 속한 그룹들
  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
  @JsonIgnore
  private List<Group> groups = new ArrayList<>();

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
