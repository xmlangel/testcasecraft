package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagChatCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RagChatCategoryRepository extends JpaRepository<RagChatCategory, String> {

    List<RagChatCategory> findByProject_IdOrderByNameAsc(String projectId);

    Optional<RagChatCategory> findByIdAndProject_Id(String id, String projectId);
}
