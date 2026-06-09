// src/main/java/com/testcase/testcasemanagement/model/BookmarkCollection.java
// BookmarkCollection: 사용자별·프로젝트별 이름붙은 북마크 모음(컬렉션).
// 한 사용자는 한 프로젝트 내에서 여러 개의 모음을 가질 수 있다(플레이리스트 패턴).
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
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
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "description", length = 500)
  private String description;

  /** 별(즐겨찾기) 버튼 토글의 기본 대상이 되는 모음. 사용자·프로젝트별 1개. */
  @Column(name = "is_default", nullable = false)
  private boolean isDefault;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

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
