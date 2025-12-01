package com.testcase.testcasemanagement.dto.rag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * RAG API 문서 업로드 요청 DTO
 * POST /api/v1/documents/upload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagDocumentUploadRequest {

    /**
     * 업로드할 파일
     */
    @NotNull(message = "파일은 필수입니다")
    private MultipartFile file;

    /**
     * 프로젝트 ID
     */
    @NotNull(message = "프로젝트 ID는 필수입니다")
    private UUID projectId;

    /**
     * 업로더 사용자명
     */
    private String uploadedBy;
}
