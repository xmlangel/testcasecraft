// src/main/java/com/testcase/testcasemanagement/model/BookmarkCollection.java
// BookmarkCollection: 사용자별·프로젝트별 이름붙은 북마크 모음(컬렉션).
// 한 사용자는 한 프로젝트 내에서 여러 개의 모음을 가질 수 있다(플레이리스트 패턴).
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Comment("북마크 모음: 사용자가 프로젝트 안에서 이름을 붙여 만든 테스트 케이스 북마크 묶음 | Bookmark Collection: named group of test case bookmarks a user creates within a project")
@Table(
    name = "bookmark_collections",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_bookmark_collection_user_project_name",
          columnNames = {"user_id", "project_id", "name"})
    },
    indexes = {
      @Index(name = "idx_bookmark_collection_user_project", columnList = "user_id, project_id")
    })
public class BookmarkCollection {
  @Comment("식별자: 북마크 모음을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a bookmark collection (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("사용자: 이 모음을 소유한 사용자 (값 영역: users.id 참조) | User: user who owns this collection (Value domain: references users.id)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Comment("프로젝트: 이 모음이 속한 프로젝트 (값 영역: projects.id 참조) | Project: project to which this collection belongs (Value domain: references projects.id)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("모음 명: 사용자가 붙인 북마크 모음의 이름 (값 영역: 100자 이하) | Collection Name: name the user gave to the bookmark collection (Value domain: up to 100 characters)")
  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Comment("설명: 이 모음에 대한 상세 설명 (값 영역: 500자 이하) | Description: detailed description of this collection (Value domain: up to 500 characters)")
  @Column(name = "description", length = 500)
  private String description;

  /** 별(즐겨찾기) 버튼 토글의 기본 대상이 되는 모음. 사용자·프로젝트별 1개. */
  @Comment("기본 모음 여부: 별 버튼의 기본 저장 대상 (값 영역: true, false) | Default Collection Indicator: whether this collection is the default save target of the star button (Value domain: true, false)")
  @Column(name = "is_default", nullable = false)
  private boolean isDefault;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

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
