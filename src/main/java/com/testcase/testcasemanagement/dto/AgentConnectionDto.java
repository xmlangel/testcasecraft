package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 프로젝트 에이전트 연동 설정 DTO.
 *
 * <p>토큰 값은 응답에 절대 담지 않는다. 저장돼 있는지만 {@code hasToken} 으로 알린다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentConnectionDto {

  private String id;

  @NotBlank(message = "에이전트 이름은 필수입니다")
  @Size(max = 100, message = "에이전트 이름은 100자 이내로 입력해주세요")
  private String name;

  @NotBlank(message = "에이전트 주소는 필수입니다")
  @Size(max = 500, message = "에이전트 주소는 500자 이내로 입력해주세요")
  private String serverUrl;

  /**
   * 요청에서만 쓴다. 생략하면 기존 토큰을 유지하고, 빈 문자열이면 삭제한다. 응답에는 담지 않는다.
   */
  private String token;

  @Size(max = 100, message = "기본 프로필은 100자 이내로 입력해주세요")
  private String defaultProfile;

  private Boolean isActive;

  // 이하 응답 전용
  private Boolean hasToken;
  private Boolean connectionVerified;
  private LocalDateTime lastConnectionTest;
  private String lastConnectionError;
  private String agentVersion;
  private Boolean runnable;
  private LocalDateTime updatedAt;
  private String updatedBy;

  /** 연결 테스트 결과. 에이전트 응답에서 두 필드만 꺼내 담는다. */
  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class ConnectionTestResult {
    private boolean ok;
    private String version;
    private Long latencyMs;
    private String error;
  }
}
