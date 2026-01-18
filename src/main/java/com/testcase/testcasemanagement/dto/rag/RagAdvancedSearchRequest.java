package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/**
 * RAG API 고급 검색 요청 DTO
 *
 * FastAPI AdvancedSearchRequest 스키마와 매핑
 * POST /api/v1/search/advanced 엔드포인트 요청 DTO
 * 다양한 검색 방법 (vector, BM25, hybrid, reranker) 지원
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagAdvancedSearchRequest {

    /**
     * 검색 쿼리 텍스트
     */
    @NotBlank(message = "검색 쿼리는 필수입니다")
    @Size(min = 1, max = 10000, message = "검색 쿼리는 1~10000자여야 합니다")
    @JsonProperty("query_text")
    @JsonAlias({"queryText", "query_text"})
    private String queryText;

    /**
     * 프로젝트 ID (필터링용)
     */
    @JsonProperty("project_id")
    @JsonAlias({"projectId", "project_id"})
    private UUID projectId;

    /**
     * 검색 방법
     * vector: 순수 벡터 검색
     * bm25: 순수 키워드 검색
     * hybrid: 하이브리드 (벡터 + BM25)
     * hybrid_rerank: 하이브리드 + Reranker (권장)
     */
    @NotNull(message = "검색 방법은 필수입니다")
    @Builder.Default
    @JsonProperty("search_method")
    @JsonAlias({"searchMethod", "search_method"})
    private String searchMethod = "hybrid_rerank";

    /**
     * 유사도 임계값 (0.0 ~ 1.0)
     */
    @Min(0)
    @Max(1)
    @Builder.Default
    @JsonProperty("similarity_threshold")
    @JsonAlias({"similarityThreshold", "similarity_threshold"})
    private Double similarityThreshold = 0.6;

    /**
     * 최대 결과 수
     */
    @NotNull(message = "최대 결과 수는 필수입니다")
    @Min(1)
    @Max(100)
    @Builder.Default
    @JsonProperty("max_results")
    @JsonAlias({"maxResults", "max_results"})
    private Integer maxResults = 10;

    /**
     * 벡터 검색 가중치 (하이브리드 모드)
     */
    @Min(0)
    @Max(1)
    @Builder.Default
    @JsonProperty("vector_weight")
    @JsonAlias({"vectorWeight", "vector_weight"})
    private Double vectorWeight = 0.6;

    /**
     * BM25 검색 가중치 (하이브리드 모드)
     */
    @Min(0)
    @Max(1)
    @Builder.Default
    @JsonProperty("bm25_weight")
    @JsonAlias({"bm25Weight", "bm25_weight"})
    private Double bm25Weight = 0.4;

    /**
     * Reranker 사용 여부
     */
    @Builder.Default
    @JsonProperty("use_reranker")
    @JsonAlias({"useReranker", "use_reranker"})
    private Boolean useReranker = true;

    /**
     * Reranker Top K (재순위 후 유지할 결과 수)
     */
    @JsonProperty("reranker_top_k")
    @JsonAlias({"rerankerTopK", "reranker_top_k"})
    private Integer rerankerTopK;
}
