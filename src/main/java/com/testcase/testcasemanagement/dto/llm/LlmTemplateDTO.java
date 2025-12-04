package com.testcase.testcasemanagement.dto.llm;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * LLM 템플릿 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmTemplateDTO {

    private String id;

    @JsonProperty("promptTemplate")
    private String promptTemplate;

    @JsonProperty("chunkBatchSize")
    private Integer chunkBatchSize;

    @JsonProperty("pauseAfterBatch")
    private Boolean pauseAfterBatch;

    @JsonProperty("maxTokens")
    private Integer maxTokens;

    @JsonProperty("temperature")
    private Double temperature;

    private String createdBy;
    private LocalDateTime createdDate;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
}
