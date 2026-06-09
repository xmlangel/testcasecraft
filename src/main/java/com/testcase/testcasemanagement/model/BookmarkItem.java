// src/main/java/com/testcase/testcasemanagement/model/BookmarkItem.java
// BookmarkItem: 특정 북마크 모음에 담긴 하나의 테스트케이스 참조(+개인 메모).
// 케이스 콘텐츠 스냅샷이 아니라 현재 케이스를 가리키는 살아있는 참조다(FR-4.5).
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
    name = "bookmark_items",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_bookmark_item_collection_testcase",
          columnNames = {"collection_id", "testcase_id"})
    },
    indexes = {
      @Index(name = "idx_bookmark_item_collection", columnList = "collection_id"),
      @Index(name = "idx_bookmark_item_testcase", columnList = "testcase_id")
    })
public class BookmarkItem {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "collection_id", nullable = false)
  private BookmarkCollection collection;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "testcase_id", nullable = false)
  private TestCase testCase;

  /** 항목별 사용자 개인 메모(선택). */
  @Column(name = "note", length = 1000)
  private String note;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
