package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.rag.RagGlobalDocumentRequest;
import com.testcase.testcasemanagement.model.rag.RagGlobalDocumentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RagGlobalDocumentRequestRepository extends JpaRepository<RagGlobalDocumentRequest, String> {

    List<RagGlobalDocumentRequest> findByStatusOrderByCreatedAtAsc(RagGlobalDocumentRequestStatus status);

    Optional<RagGlobalDocumentRequest> findTopByDocumentIdAndStatusOrderByCreatedAtDesc(
            java.util.UUID documentId,
            RagGlobalDocumentRequestStatus status
    );
}
