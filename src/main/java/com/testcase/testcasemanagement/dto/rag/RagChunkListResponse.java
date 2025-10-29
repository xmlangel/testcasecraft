package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * RAG API Chunk 목록 응답 DTO
 *
 * FastAPI ChunkListResponse 스키마와 매핑되는 DTO
 * 문서의 모든 청크 목록 조회 응답에 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChunkListResponse {

    /**
     * 전체 청크 수
     * Frontend: total (unchanged)
     * FastAPI: total (unchanged)
     */
    @JsonProperty("total")
    private Integer total;

    /**
     * 문서 ID
     * Frontend: documentId (camelCase)
     * FastAPI: document_id (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("documentId")
    @com.fasterxml.jackson.annotation.JsonAlias({"document_id"})
    private UUID documentId;

    /**
     * 청크 목록
     * Frontend: chunks (unchanged)
     * FastAPI: chunks (unchanged)
     */
    @JsonProperty("chunks")
    private List<RagChunkResponse> chunks;
}
