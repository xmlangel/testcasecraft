// src/main/java/com/testcase/testcasemanagement/repository/BookmarkItemRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.BookmarkItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookmarkItemRepository extends JpaRepository<BookmarkItem, String> {

  /** 모음 내 항목 목록 (최신순). */
  List<BookmarkItem> findByCollection_IdOrderByCreatedAtDesc(String collectionId);

  /** 모음 내 동일 케이스 존재 여부. */
  boolean existsByCollection_IdAndTestCase_Id(String collectionId, String testCaseId);

  /** 모음 내 특정 케이스 항목. */
  Optional<BookmarkItem> findByCollection_IdAndTestCase_Id(String collectionId, String testCaseId);

  /** 소유자 검증 포함 단건 조회 (모음의 소유 사용자 기준). */
  Optional<BookmarkItem> findByIdAndCollection_User_Id(String id, String userId);

  /** 모음 항목 수. */
  long countByCollection_Id(String collectionId);

  /**
   * 사용자가 특정 프로젝트에서 (어느 모음에든) 북마크한 케이스 ID 집합. 별 버튼 상태 표시용(NFR-1: 단일 조회로 N+1 회피).
   */
  @Query(
      "SELECT DISTINCT i.testCase.id FROM BookmarkItem i "
          + "WHERE i.collection.user.id = :userId AND i.collection.project.id = :projectId")
  List<String> findBookmarkedTestCaseIds(
      @Param("userId") String userId, @Param("projectId") String projectId);

  /** 모음 삭제 시 항목 일괄 삭제. */
  @Modifying
  void deleteByCollection_Id(String collectionId);

  /** 케이스 삭제 시 항목 일괄 삭제(FR-6.1). */
  @Modifying
  void deleteByTestCase_Id(String testCaseId);
}
