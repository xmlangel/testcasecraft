package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagChatCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RagChatCategoryRepository extends JpaRepository<RagChatCategory, String> {

  List<RagChatCategory> findByProject_IdOrderByNameAsc(String projectId);

  Optional<RagChatCategory> findByIdAndProject_Id(String id, String projectId);

  /** 카테고리가 속한 프로젝트 ID (객체수준 인가용). */
  @Query("SELECT c.project.id FROM RagChatCategory c WHERE c.id = :categoryId")
  Optional<String> findProjectIdById(@Param("categoryId") String categoryId);
}
