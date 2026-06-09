// src/main/java/com/testcase/testcasemanagement/repository/BookmarkCollectionRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.BookmarkCollection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkCollectionRepository extends JpaRepository<BookmarkCollection, String> {

  /** 사용자·프로젝트의 모음 목록 (기본 모음 먼저, 이름 오름차순). */
  List<BookmarkCollection> findByUser_IdAndProject_IdOrderByIsDefaultDescNameAsc(
      String userId, String projectId);

  /** 사용자·프로젝트의 기본 모음. */
  Optional<BookmarkCollection> findByUser_IdAndProject_IdAndIsDefaultTrue(
      String userId, String projectId);

  /** 이름 중복 확인용. */
  Optional<BookmarkCollection> findByUser_IdAndProject_IdAndName(
      String userId, String projectId, String name);

  /** 소유자 검증 포함 단건 조회. */
  Optional<BookmarkCollection> findByIdAndUser_Id(String id, String userId);
}
