// src/main/java/com/testcase/testcasemanagement/model/LlmConfig.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** LLM 설정 엔티티 OpenWebUI, OpenAI 또는 Ollama API 연동 설정 정보를 저장합니다. */
@Entity
@Comment("LLM 설정: 대규모 언어 모델(LLM) 제공자에 접속하는 데 쓰는 설정")
@Table(name = "llm_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LlmConfig {

  @Comment("설정 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  /** 설정 이름 (사용자 정의) */
  @Comment("설정명: 관리자가 지정한 이 설정의 이름")
  @Column(nullable = false, length = 100)
  private String name;

  /** LLM 제공자 (OPENWEBUI, OPENAI, OLLAMA) */
  @Comment("LLM 제공자: 연동할 모델의 제공자 (값 영역: OPENWEBUI, OPENAI, OLLAMA, PERPLEXITY, OPENROUTER, NVIDIA)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private LlmProvider provider;

  /**
   * API URL - OpenWebUI: http://localhost:3000/api/chat/completions - OpenAI:
   * https://api.openai.com/v1/chat/completions - Ollama: http://localhost:11434/v1/chat/completions
   */
  @Comment("API URL: 해당 LLM 제공자의 API 엔드포인트 주소")
  @Column(nullable = false, length = 500)
  private String apiUrl;

  /** 암호화된 API Key AES-256으로 암호화하여 저장 */
  @Comment("암호화된 API 키: LLM 제공자 인증에 사용할 암호화된 API 키")
  @JsonIgnore
  @Column(nullable = false, columnDefinition = "TEXT")
  private String encryptedApiKey;

  /**
   * 모델 이름 - OpenWebUI: llama3.1, granite3.1-dense:8b 등 - OpenAI: gpt-4, gpt-3.5-turbo 등 - Ollama:
   * llama3:latest, qwen2.5-coder:7b 등
   */
  @Comment("모델명: 실제 사용할 언어 모델의 이름")
  @Column(nullable = false, length = 100)
  private String modelName;

  /** 기본 설정 여부 (시스템에서 기본으로 사용할 LLM) */
  @Comment("기본 설정 여부: 사용자가 명시하지 않을 때 기본으로 사용할 설정인지 여부")
  @Column(nullable = false)
  private Boolean isDefault = false;

  /** 활성 상태 */
  @Comment("활성 여부: 이 설정을 사용할 수 있는지 여부")
  @Column(nullable = false)
  private Boolean isActive = true;

  /** 테스트 케이스 생성 템플릿 AI에게 테스트 케이스 생성을 요청할 때 참고할 JSON 형식 예시 */
  @Comment("테스트 케이스 템플릿: 테스트 케이스 생성 요청 시 LLM에게 전달할 JSON 형식 예시")
  @Column(name = "test_case_template", columnDefinition = "TEXT")
  private String testCaseTemplate;

  /**
   * 질의 의도 분석과 데이터 요약에 쓸 모델. 비우면 {@link #modelName} 을 쓴다.
   *
   * <p>분석은 질문을 읽고 정해진 형식으로 답하는 분류 작업이라 추론이 값어치를 내지 않는다. 그런데 답변용으로 좋은 모델을 고르면 그것이 분석에도 쓰여, 실측에서 추론
   * 모델의 분석 호출 하나가 7.3초에 1,275 토큰을 썼다. 답변은 좋은 모델로, 분석은 값싼 모델로 갈라 쓰려는 것이다.
   */
  @Comment("분석용 모델명: 질의 분류와 데이터 요약에 사용할 모델 (비우면 모델명을 사용)")
  @Column(name = "analysis_model_name", length = 100)
  private String analysisModelName;

  /**
   * 분석에 실제로 쓸 모델 이름.
   *
   * <p>분석용 모델을 지정하지 않았으면 답변 모델을 그대로 쓴다. 빈 문자열도 없는 것으로 본다(관리자가 지우고 저장한 경우).
   */
  public String resolveAnalysisModelName() {
    return analysisModelName != null && !analysisModelName.isBlank()
        ? analysisModelName
        : modelName;
  }

  /** 연결 검증 여부 */
  @Comment("연결 검증 여부: 마지막 연결 테스트의 성공 여부")
  @Column(name = "connection_verified")
  private Boolean connectionVerified = false;

  /** 마지막 연결 테스트 시간 */
  @Comment("마지막 연결 테스트 일시: 마지막으로 연결을 검증한 시각")
  @Column(name = "last_connection_test")
  private LocalDateTime lastConnectionTest;

  /** 마지막 연결 에러 메시지 */
  @Comment("마지막 연결 오류: 마지막 연결 시도 실패 시 오류 메시지")
  @Column(name = "last_connection_error", columnDefinition = "TEXT")
  private String lastConnectionError;

  /** 생성 시간 */
  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /** 수정 시간 */
  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시")
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

  /** 연결 상태가 정상인지 확인 1시간 이내에 연결 테스트가 성공했는지 확인 */
  public boolean isConnectionHealthy() {
    return connectionVerified
        && lastConnectionTest != null
        && lastConnectionTest.isAfter(LocalDateTime.now().minusHours(1));
  }

  /** 연결 테스트 성공 처리 */
  public void markConnectionSuccess() {
    this.connectionVerified = true;
    this.lastConnectionTest = LocalDateTime.now();
    this.lastConnectionError = null;
  }

  /** 연결 테스트 실패 처리 */
  public void markConnectionFailure(String error) {
    this.connectionVerified = false;
    this.lastConnectionTest = LocalDateTime.now();
    this.lastConnectionError = error;
  }

  /** LLM 제공자 Enum */
  public enum LlmProvider {
    OPENWEBUI("OpenWebUI"),
    OPENAI("OpenAI"),
    OLLAMA("Ollama"),
    PERPLEXITY("Perplexity"),
    OPENROUTER("OpenRouter"),
    NVIDIA("NVIDIA");

    private final String displayName;

    LlmProvider(String displayName) {
      this.displayName = displayName;
    }

    public String getDisplayName() {
      return displayName;
    }
  }
}
