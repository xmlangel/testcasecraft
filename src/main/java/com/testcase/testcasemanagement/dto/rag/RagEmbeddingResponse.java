package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * RAG API 임베딩 생성 응답 DTO
 *
 * FastAPI GenerateEmbeddingResponse 스키마와 매핑
 * 임베딩 벡터 생성 결과 반환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagEmbeddingResponse {

    /**
     * 문서 ID
     */
    @JsonProperty("document_id")
    private UUID documentId;

    /**
     * 전체 청크 수
     */
    @JsonProperty("total_chunks")
    private Integer totalChunks;

    /**
     * 생성된 임베딩 수
     */
    @JsonProperty("embeddings_generated")
    private Integer embeddingsGenerated;

    /**
     * 상태 메시지
     */
    private String message;
}
