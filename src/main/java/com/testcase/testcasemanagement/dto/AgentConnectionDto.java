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

  @NotBlank(message = "Agent name is required")
  @Size(max = 100, message = "Agent name must be 100 characters or fewer")
  private String name;

  @NotBlank(message = "Agent URL is required")
  @Size(max = 500, message = "Agent URL must be 500 characters or fewer")
  private String serverUrl;

  /** 브라우저가 딥링크를 열 때 쓸 주소. 비면 serverUrl 을 쓴다. */
  @Size(max = 500, message = "Browser URL must be 500 characters or fewer")
  private String browserUrl;

  /**
   * 요청에서만 쓴다. 생략하면 기존 토큰을 유지하고, 빈 문자열이면 삭제한다. 응답에는 담지 않는다.
   */
  private String token;

  @Size(max = 100, message = "Default profile must be 100 characters or fewer")
  private String defaultProfile;

  private Boolean isActive;

  // 이하 응답 전용
  private Boolean hasToken;
  private Boolean connectionVerified;
  private LocalDateTime lastConnectionTest;
  private String lastConnectionError;
  private String agentVersion;
  private Boolean runnable;
  /** 버튼이 실제로 열 주소. browserUrl 이 있으면 그것, 없으면 serverUrl. */
  private String effectiveBrowserUrl;
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
