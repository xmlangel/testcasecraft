// src/main/java/com/testcase/testcasemanagement/model/LlmConfig.java
package com.testcase.testcasemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * LLM 설정 엔티티
 * OpenWebUI, OpenAI 또는 Ollama API 연동 설정 정보를 저장합니다.
 */
@Entity
@Table(name = "llm_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LlmConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /**
     * 설정 이름 (사용자 정의)
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * LLM 제공자 (OPENWEBUI, OPENAI, OLLAMA)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LlmProvider provider;

    /**
     * API URL
     * - OpenWebUI: http://localhost:3000/api/chat/completions
     * - OpenAI: https://api.openai.com/v1/chat/completions
     * - Ollama: http://localhost:11434/v1/chat/completions
     */
    @Column(nullable = false, length = 500)
    private String apiUrl;

    /**
     * 암호화된 API Key
     * AES-256으로 암호화하여 저장
     */
    @JsonIgnore
    @Column(nullable = false, columnDefinition = "TEXT")
    private String encryptedApiKey;

    /**
     * 모델 이름
     * - OpenWebUI: llama3.1, granite3.1-dense:8b 등
     * - OpenAI: gpt-4, gpt-3.5-turbo 등
     * - Ollama: llama3:latest, qwen2.5-coder:7b 등
     */
    @Column(nullable = false, length = 100)
    private String modelName;

    /**
     * 기본 설정 여부 (시스템에서 기본으로 사용할 LLM)
     */
    @Column(nullable = false)
    private Boolean isDefault = false;

    /**
     * 활성 상태
     */
    @Column(nullable = false)
    private Boolean isActive = true;

    /**
     * 테스트 케이스 생성 템플릿
     * AI에게 테스트 케이스 생성을 요청할 때 참고할 JSON 형식 예시
     */
    @Column(name = "test_case_template", columnDefinition = "TEXT")
    private String testCaseTemplate;

    /**
     * 연결 검증 여부
     */
    @Column(name = "connection_verified")
    private Boolean connectionVerified = false;

    /**
     * 마지막 연결 테스트 시간
     */
    @Column(name = "last_connection_test")
    private LocalDateTime lastConnectionTest;

    /**
     * 마지막 연결 에러 메시지
     */
    @Column(name = "last_connection_error", columnDefinition = "TEXT")
    private String lastConnectionError;

    /**
     * 생성 시간
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정 시간
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 연결 상태가 정상인지 확인
     * 1시간 이내에 연결 테스트가 성공했는지 확인
     */
    public boolean isConnectionHealthy() {
        return connectionVerified && lastConnectionTest != null
                && lastConnectionTest.isAfter(LocalDateTime.now().minusHours(1));
    }

    /**
     * 연결 테스트 성공 처리
     */
    public void markConnectionSuccess() {
        this.connectionVerified = true;
        this.lastConnectionTest = LocalDateTime.now();
        this.lastConnectionError = null;
    }

    /**
     * 연결 테스트 실패 처리
     */
    public void markConnectionFailure(String error) {
        this.connectionVerified = false;
        this.lastConnectionTest = LocalDateTime.now();
        this.lastConnectionError = error;
    }

    /**
     * LLM 제공자 Enum
     */
    public enum LlmProvider {
        OPENWEBUI("OpenWebUI"),
        OPENAI("OpenAI"),
        OLLAMA("Ollama"),
        PERPLEXITY("Perplexity"),
        OPENROUTER("OpenRouter");

        private final String displayName;

        LlmProvider(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
