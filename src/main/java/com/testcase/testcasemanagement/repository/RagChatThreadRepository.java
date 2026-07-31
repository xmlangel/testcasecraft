package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagChatThread;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RagChatThreadRepository extends JpaRepository<RagChatThread, String> {

  List<RagChatThread> findByProject_IdOrderByCreatedAtDesc(String projectId);

  Optional<RagChatThread> findByIdAndProject_Id(String id, String projectId);

  /** 스레드가 속한 프로젝트 ID (객체수준 인가용). */
  @Query("SELECT t.project.id FROM RagChatThread t WHERE t.id = :threadId")
  Optional<String> findProjectIdById(@Param("threadId") String threadId);

  void deleteByProject_Id(String projectId);
}
