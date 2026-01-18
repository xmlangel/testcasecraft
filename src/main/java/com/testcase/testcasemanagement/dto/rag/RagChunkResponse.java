package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.testcase.testcasemanagement.config.LocalDateTimeArrayDeserializer;
import com.testcase.testcasemanagement.config.LocalDateTimeArraySerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * RAG API Chunk 응답 DTO
 *
 * FastAPI ChunkResponse 스키마와 매핑되는 DTO
 * 문서의 텍스트 청크 조회 응답에 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChunkResponse {

    /**
     * 청크 ID
     * Frontend: id (unchanged)
     * FastAPI: id (unchanged)
     */
    @JsonProperty("id")
    private UUID id;

    /**
     * 문서 ID
     * Frontend: documentId (camelCase)
     * FastAPI: document_id (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("documentId")
    @com.fasterxml.jackson.annotation.JsonAlias({"document_id"})
    private UUID documentId;

    /**
     * 청크 인덱스 (순서)
     * Frontend: chunkIndex (camelCase)
     * FastAPI: chunk_index (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("chunkIndex")
    @com.fasterxml.jackson.annotation.JsonAlias({"chunk_index"})
    private Integer chunkIndex;

    /**
     * 청크 텍스트 내용
     * Frontend: chunkText (camelCase)
     * FastAPI: chunk_text (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("chunkText")
    @com.fasterxml.jackson.annotation.JsonAlias({"chunk_text"})
    private String chunkText;

    /**
     * 청크 메타데이터
     * Frontend: chunkMetadata (camelCase)
     * FastAPI: chunk_metadata (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("chunkMetadata")
    @com.fasterxml.jackson.annotation.JsonAlias({"chunk_metadata"})
    private Map<String, Object> chunkMetadata;

    /**
     * 생성 시각
     * Frontend: createdAt (camelCase)
     * FastAPI: created_at (snake_case) - JsonAlias로 매핑
     * FastAPI는 배열 또는 ISO 8601 형태로 전송
     * Frontend로는 ISO 8601 문자열 형태로 전송
     */
    @JsonProperty("createdAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"created_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime createdAt;
}
