package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * RAG API 임베딩 생성 요청 DTO
 *
 * FastAPI GenerateEmbeddingRequest 스키마와 매핑
 * POST /api/v1/embeddings/generate 엔드포인트 요청 DTO
 * 문서 청크에 대한 임베딩 벡터 생성
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagEmbeddingRequest {

    /**
     * 임베딩을 생성할 문서 ID
     */
    @NotNull(message = "문서 ID는 필수입니다")
    @JsonProperty("document_id")
    private UUID documentId;
}
