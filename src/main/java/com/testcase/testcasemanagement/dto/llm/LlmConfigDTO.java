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
   * 기본 테스트 케이스 템플릿
   * LLM 설정 생성 시 초기값으로 사용됨
   */
  public static final String DEFAULT_TEST_CASE_TEMPLATE = """
      {
        "name": "사용자 로그인 테스트",
        "description": "정상 사용자 ID/비밀번호 입력 시 로그인 성공",
        "priority": "High",
        "tags": ["인증", "로그인", "P1"],
        "preCondition": "테스트 환경에 로그인 화면이 배포되어 있고, 테스트 DB에 test.user@example.com 계정이 존재해야 함",
        "postCondition": "사용자는 대시보드로 리다이렉트되고 세션이 생성됨",
        "isAutomated": true,
        "testTechnique": "Boundary Value Analysis",
        "steps": [
          {
            "stepNumber": 1,
            "description": "로그인 URL에 접속",
            "expectedResult": "로그인 폼이 표시됨"
          },
          {
            "stepNumber": 2,
            "description": "이메일에 test.user@example.com 입력",
            "expectedResult": "입력값이 표시됨"
          },
          {
            "stepNumber": 3,
            "description": "비밀번호에 Password123! 입력",
            "expectedResult": "마스킹되어 표시됨"
          },
          {
            "stepNumber": 4,
            "description": "로그인 버튼 클릭",
            "expectedResult": "대시보드로 이동되고 환영 메시지 표시됨"
          }
        ],
        "expectedResults": "사용자가 정상적으로 인증되고 대시보드에 접근할 수 있어야 함"
      }
      """;

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
   * 테스트 케이스 생성 템플릿
   * AI에게 테스트 케이스 생성을 요청할 때 참고할 JSON 형식 예시
   */
  private String testCaseTemplate;

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
   * 
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
