package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.rag.RagChatMessageRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RagChatMessageRepository extends JpaRepository<RagChatMessage, String> {

  List<RagChatMessage> findByThread_IdOrderByCreatedAtAsc(String threadId);

  Optional<RagChatMessage> findByIdAndThread_Id(String id, String threadId);

  /** 메시지가 속한 스레드의 프로젝트 ID (객체수준 인가용). */
  @Query("SELECT m.thread.project.id FROM RagChatMessage m WHERE m.id = :messageId")
  Optional<String> findProjectIdByMessageId(@Param("messageId") String messageId);

  List<RagChatMessage> findByThread_IdAndRoleOrderByCreatedAtAsc(
      String threadId, RagChatMessageRole role);

  Optional<RagChatMessage> findFirstByThread_IdOrderByCreatedAtDesc(String threadId);

  Optional<RagChatMessage> findByEmbeddingMessageId(String embeddingMessageId);

  long countByThread_Id(String threadId);
}
