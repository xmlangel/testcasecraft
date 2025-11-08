// src/main/java/com/testcase/testcasemanagement/dto/llm/LlmConfigDTO.java
package com.testcase.testcasemanagement.dto.llm;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * LLM 설정 DTO
 * Request와 Response 모두 사용 가능한 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmConfigDTO {

    /**
     * 설정 ID (생성 시에는 null)
     */
    private String id;

    /**
     * 설정 이름
     */
    private String name;

    /**
     * LLM 제공자 (OPENWEBUI, OPENAI, OLLAMA)
     */
    private LlmProvider provider;

    /**
     * API URL
     */
    private String apiUrl;

    /**
     * API Key (평문 - Request 시만 사용)
     * Response 시에는 마스킹된 값 반환
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String apiKey;

    /**
     * 마스킹된 API Key (Response 전용)
     * 예: "sk-1234...abcd"
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String maskedApiKey;

    /**
     * 모델 이름
     */
    private String modelName;

    /**
     * 기본 설정 여부
     */
    private Boolean isDefault;

    /**
     * 활성 상태
     */
    private Boolean isActive;

    /**
     * 연결 검증 여부 (Response 전용)
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean connectionVerified;

    /**
     * 마지막 연결 테스트 시간 (Response 전용)
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime lastConnectionTest;

    /**
     * 마지막 연결 에러 메시지 (Response 전용)
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String lastConnectionError;

    /**
     * 생성 시간 (Response 전용)
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;

    /**
     * 수정 시간 (Response 전용)
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime updatedAt;

    /**
     * API Key 마스킹 처리
     * @param apiKey 평문 API Key
     * @return 마스킹된 API Key
     */
    public static String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() < 8) {
            return "****";
        }
        return apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length() - 4);
    }
}
