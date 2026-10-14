// src/main/java/com/testcase/testcasemanagement/model/BookmarkItem.java
// BookmarkItem: 특정 북마크 모음에 담긴 하나의 테스트케이스 참조(+개인 메모).
// 케이스 콘텐츠 스냅샷이 아니라 현재 케이스를 가리키는 살아있는 참조다(FR-4.5).
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
@Comment("북마크 항목: 특정 북마크 모음에 담긴 하나의 테스트 케이스 참조")
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
  @Comment("북마크 항목 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("북마크 모음 식별자: 이 항목이 속한 북마크 모음을 가리키는 값 (값 영역: bookmark_collections.id 참조)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "collection_id", nullable = false)
  private BookmarkCollection collection;

  @Comment("테스트 케이스 식별자: 북마크된 테스트 케이스를 가리키는 값 (값 영역: testcases.id 참조)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "testcase_id", nullable = false)
  private TestCase testCase;

  /** 항목별 사용자 개인 메모(선택). */
  @Comment("메모: 이 항목에 대한 사용자 개인 메모")
  @Column(name = "note", length = 1000)
  private String note;

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
