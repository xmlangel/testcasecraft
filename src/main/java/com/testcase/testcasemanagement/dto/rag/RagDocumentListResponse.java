package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * RAG API 문서 목록 응답 DTO
 *
 * FastAPI DocumentListResponse 스키마와 매핑되는 DTO
 * 페이징된 문서 목록 조회 응답에 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagDocumentListResponse {

    /**
     * 전체 문서 수
     * Frontend/FastAPI 공통: total
     */
    @JsonProperty("total")
    private Integer total;

    /**
     * 현재 페이지 번호
     * Frontend/FastAPI 공통: page
     */
    @JsonProperty("page")
    private Integer page;

    /**
     * 페이지당 문서 수
     * Frontend: pageSize (camelCase)
     * FastAPI: page_size (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("pageSize")
    @com.fasterxml.jackson.annotation.JsonAlias({"page_size"})
    private Integer pageSize;

    /**
     * 문서 목록
     * Frontend/FastAPI 공통: documents
     */
    @JsonProperty("documents")
    private List<RagDocumentResponse> documents;
}
