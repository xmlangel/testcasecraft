package com.testcase.testcasemanagement.model.rag;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "rag_global_document_requests",
        indexes = {
                @Index(name = "idx_rag_global_doc_req_status", columnList = "status"),
                @Index(name = "idx_rag_global_doc_req_document", columnList = "document_id")
        }
)
public class RagGlobalDocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, updatable = false)
    private String id;

    @Column(name = "document_id", nullable = false, columnDefinition = "uuid")
    private UUID documentId;

    @Column(name = "project_id", nullable = false, columnDefinition = "uuid")
    private UUID projectId;

    @Column(name = "document_name", nullable = false, length = 512)
    private String documentName;

    @Column(name = "requested_by", nullable = false, length = 100)
    private String requestedBy;

    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RagGlobalDocumentRequestStatus status;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RagGlobalDocumentRequestStatus.PENDING;
        }
    }

    public boolean isPending() {
        return RagGlobalDocumentRequestStatus.PENDING.equals(this.status);
    }
}
