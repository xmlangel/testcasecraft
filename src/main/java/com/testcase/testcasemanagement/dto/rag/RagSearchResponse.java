package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonAlias({ "totalResults", "total_results" })
    private Integer totalResults;

    /**
     * 검색 결과 리스트
     */
    private List<SearchResult> results;

    /**
     * 적용된 유사도 임계값
     */
    @JsonAlias({ "similarityThreshold", "similarity_threshold" })
    private Double similarityThreshold;

    /**
     * 최대 결과 제한
     */
    @JsonAlias({ "maxResults", "max_results" })
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
        @JsonAlias({ "embeddingId", "embedding_id" })
        private UUID embeddingId;

        /**
         * 문서 ID
         */
        @JsonAlias({ "documentId", "document_id" })
        private UUID documentId;

        /**
         * 파일명
         */
        @JsonAlias({ "fileName", "file_name" })
        private String fileName;

        /**
         * 프로젝트 ID
         */
        @JsonAlias({ "projectId", "project_id" })
        private UUID projectId;

        /**
         * 청크 인덱스
         */
        @JsonAlias({ "chunkIndex", "chunk_index" })
        private Integer chunkIndex;

        /**
         * 청크 텍스트 내용
         */
        @JsonAlias({ "chunkText", "chunk_text" })
        private String chunkText;

        /**
         * 청크 메타데이터
         */
        @JsonAlias({ "chunkMetadata", "chunk_metadata" })
        private Map<String, Object> chunkMetadata;

        /**
         * 유사도 점수 (0.0 ~ 1.0)
         */
        @JsonAlias({ "similarityScore", "similarity_score" })
        private Double similarityScore;

        /**
         * 출처 타입 (document 또는 testcase)
         */
        @JsonAlias({ "sourceType", "source_type" })
        private String sourceType;

        // Advanced search scores
        /**
         * 벡터 유사도 점수 (고급 검색)
         */
        @JsonAlias({ "vectorScore", "vector_score" })
        private Double vectorScore;

        /**
         * BM25 키워드 점수 (고급 검색)
         */
        @JsonAlias({ "bm25Score", "bm25_score" })
        private Double bm25Score;

        /**
         * Reranker 점수 (고급 검색)
         */
        @JsonAlias({ "rerankerScore", "reranker_score" })
        private Double rerankerScore;

        /**
         * RRF 융합 점수 (고급 검색)
         */
        @JsonAlias({ "rrfScore", "rrf_score" })
        private Double rrfScore;

        /**
         * 벡터 검색에서의 순위 (고급 검색)
         */
        @JsonAlias({ "vectorRank", "vector_rank" })
        private Integer vectorRank;

        /**
         * BM25 검색에서의 순위 (고급 검색)
         */
        @JsonAlias({ "bm25Rank", "bm25_rank" })
        private Integer bm25Rank;
    }
}
