package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RagChatThreadRepository extends JpaRepository<RagChatThread, String> {

    List<RagChatThread> findByProject_IdOrderByCreatedAtDesc(String projectId);

    Optional<RagChatThread> findByIdAndProject_Id(String id, String projectId);

    void deleteByProject_Id(String projectId);
}
