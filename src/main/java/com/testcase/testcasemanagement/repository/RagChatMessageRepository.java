package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.rag.RagChatMessageRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RagChatMessageRepository extends JpaRepository<RagChatMessage, String> {

    List<RagChatMessage> findByThread_IdOrderByCreatedAtAsc(String threadId);

    Optional<RagChatMessage> findByIdAndThread_Id(String id, String threadId);

    List<RagChatMessage> findByThread_IdAndRoleOrderByCreatedAtAsc(String threadId, RagChatMessageRole role);

    Optional<RagChatMessage> findFirstByThread_IdOrderByCreatedAtDesc(String threadId);

    Optional<RagChatMessage> findByEmbeddingMessageId(String embeddingMessageId);

    long countByThread_Id(String threadId);
}
