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
 * RAG API 유사도 검색 요청 DTO
 *
 * FastAPI SearchRequest 스키마와 매핑
 * POST /api/v1/search/similar 엔드포인트 요청 DTO
 * 벡터 유사도 검색을 위한 파라미터 정의
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagSearchRequest {

    /**
     * 검색 쿼리 텍스트
     * 유사한 청크를 검색할 텍스트
     */
    @NotBlank(message = "검색 쿼리는 필수입니다")
    @Size(min = 1, max = 10000, message = "검색 쿼리는 1~10000자여야 합니다")
    @JsonProperty("query_text")
    @JsonAlias({"queryText", "query_text"})
    private String queryText;

    /**
     * 프로젝트 ID (필터링용)
     * null인 경우 모든 프로젝트 대상 검색
     */
    @JsonProperty("project_id")
    @JsonAlias({"projectId", "project_id"})
    private UUID projectId;

    /**
     * 유사도 임계값 (0.0 ~ 1.0)
     * 이 값 이상의 유사도를 가진 결과만 반환
     * 기본값: 0.7
     */
    @Min(0)
    @Max(1)
    @Builder.Default
    @JsonProperty("similarity_threshold")
    @JsonAlias({"similarityThreshold", "similarity_threshold"})
    private Double similarityThreshold = 0.7;

    /**
     * 최대 결과 수
     * 반환할 최대 검색 결과 개수
     * 기본값: 10, 최대: 100
     */
    @NotNull(message = "최대 결과 수는 필수입니다")
    @Min(1)
    @Max(100)
    @Builder.Default
    @JsonProperty("max_results")
    @JsonAlias({"maxResults", "max_results"})
    private Integer maxResults = 10;
}
