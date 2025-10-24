package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * RAG API 유사도 검색 응답 DTO
 *
 * FastAPI SearchResponse 스키마와 매핑
 * 벡터 유사도 검색 결과 반환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagSearchResponse {

    /**
     * 검색 쿼리 텍스트
     */
    private String query;

    /**
     * 전체 결과 수
     */
    @JsonProperty("total_results")
    private Integer totalResults;

    /**
     * 검색 결과 리스트
     */
    private List<SearchResult> results;

    /**
     * 적용된 유사도 임계값
     */
    @JsonProperty("similarity_threshold")
    private Double similarityThreshold;

    /**
     * 최대 결과 제한
     */
    @JsonProperty("max_results")
    private Integer maxResults;

    /**
     * 개별 검색 결과
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResult {
        /**
         * 임베딩 ID
         */
        @JsonProperty("embedding_id")
        private UUID embeddingId;

        /**
         * 문서 ID
         */
        @JsonProperty("document_id")
        private UUID documentId;

        /**
         * 파일명
         */
        @JsonProperty("file_name")
        private String fileName;

        /**
         * 프로젝트 ID
         */
        @JsonProperty("project_id")
        private UUID projectId;

        /**
         * 청크 인덱스
         */
        @JsonProperty("chunk_index")
        private Integer chunkIndex;

        /**
         * 청크 텍스트 내용
         */
        @JsonProperty("chunk_text")
        private String chunkText;

        /**
         * 청크 메타데이터
         */
        @JsonProperty("chunk_metadata")
        private Map<String, Object> chunkMetadata;

        /**
         * 유사도 점수 (0.0 ~ 1.0)
         */
        @JsonProperty("similarity_score")
        private Double similarityScore;
    }
}
