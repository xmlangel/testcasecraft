package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.testcase.testcasemanagement.model.rag.RagGlobalDocumentRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagGlobalDocumentRequestDto {

    private String id;
    private UUID documentId;
    private UUID projectId;
    private String documentName;
    private String requestedBy;
    private String requestMessage;
    private RagGlobalDocumentRequestStatus status;
    private String processedBy;
    private String responseMessage;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime processedAt;
}
