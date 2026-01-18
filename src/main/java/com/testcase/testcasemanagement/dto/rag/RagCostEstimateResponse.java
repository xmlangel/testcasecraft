package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * LLM 분석 비용 추정 응답 DTO
 *
 * FastAPI 비용 추정 API 응답
 * 예상 토큰 사용량, 비용, 경고 메시지 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagCostEstimateResponse {

    /**
     * 문서 ID
     * FastAPI: document_id
     */
    @JsonProperty("documentId")
    @com.fasterxml.jackson.annotation.JsonAlias({"document_id"})
    private UUID documentId;

    /**
     * 전체 청크 수
     * FastAPI: total_chunks
     */
    @JsonProperty("totalChunks")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_chunks"})
    private Integer totalChunks;

    /**
     * 예상 입력 토큰 수
     * FastAPI: estimated_input_tokens
     */
    @JsonProperty("estimatedInputTokens")
    @com.fasterxml.jackson.annotation.JsonAlias({"estimated_input_tokens"})
    private Integer estimatedInputTokens;

    /**
     * 예상 출력 토큰 수
     * FastAPI: estimated_output_tokens
     */
    @JsonProperty("estimatedOutputTokens")
    @com.fasterxml.jackson.annotation.JsonAlias({"estimated_output_tokens"})
    private Integer estimatedOutputTokens;

    /**
     * 예상 총 토큰 수
     * FastAPI: estimated_total_tokens
     */
    @JsonProperty("estimatedTotalTokens")
    @com.fasterxml.jackson.annotation.JsonAlias({"estimated_total_tokens"})
    private Integer estimatedTotalTokens;

    /**
     * 비용 상세 정보
     * FastAPI: cost_breakdown
     */
    @JsonProperty("costBreakdown")
    @com.fasterxml.jackson.annotation.JsonAlias({"cost_breakdown"})
    private CostBreakdown costBreakdown;

    /**
     * 청크당 예상 비용 (USD)
     * FastAPI: cost_per_chunk_usd
     */
    @JsonProperty("costPerChunkUsd")
    @com.fasterxml.jackson.annotation.JsonAlias({"cost_per_chunk_usd"})
    private BigDecimal costPerChunkUsd;

    /**
     * 모델 가격 정보
     * FastAPI: model_pricing
     */
    @JsonProperty("modelPricing")
    @com.fasterxml.jackson.annotation.JsonAlias({"model_pricing"})
    private ModelPricing modelPricing;

    /**
     * 경고 메시지 리스트
     * FastAPI: warnings
     */
    private List<String> warnings;

    /**
     * 비용 상세 정보 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CostBreakdown {
        /**
         * 입력 토큰 비용 (USD)
         * FastAPI: input_cost_usd
         */
        @JsonProperty("inputCostUsd")
        @com.fasterxml.jackson.annotation.JsonAlias({"input_cost_usd"})
        private BigDecimal inputCostUsd;

        /**
         * 출력 토큰 비용 (USD)
         * FastAPI: output_cost_usd
         */
        @JsonProperty("outputCostUsd")
        @com.fasterxml.jackson.annotation.JsonAlias({"output_cost_usd"})
        private BigDecimal outputCostUsd;

        /**
         * 총 비용 (USD)
         * FastAPI: total_cost_usd
         */
        @JsonProperty("totalCostUsd")
        @com.fasterxml.jackson.annotation.JsonAlias({"total_cost_usd"})
        private BigDecimal totalCostUsd;
    }

    /**
     * 모델 가격 정보 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelPricing {
        /**
         * LLM 제공자
         * FastAPI: provider
         */
        private String provider;

        /**
         * 모델명
         * FastAPI: model
         */
        private String model;

        /**
         * 입력 토큰 1K당 가격 (USD)
         * FastAPI: input_price_per_1k
         */
        @JsonProperty("inputPricePer1k")
        @com.fasterxml.jackson.annotation.JsonAlias({"input_price_per_1k"})
        private BigDecimal inputPricePer1k;

        /**
         * 출력 토큰 1K당 가격 (USD)
         * FastAPI: output_price_per_1k
         */
        @JsonProperty("outputPricePer1k")
        @com.fasterxml.jackson.annotation.JsonAlias({"output_price_per_1k"})
        private BigDecimal outputPricePer1k;
    }
}
