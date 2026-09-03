package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 프로젝트별 외부 QA 에이전트 연동 설정.
 *
 * <p>에이전트는 제품 밖의 별도 스택이다. 제품은 에이전트를 호출하지 않고, 에이전트가 제품의 공개 API 로 결과를 넘긴다. 이 엔티티가 하는 일은 두 가지뿐이다. 자동화
 * 화면에 딥링크 버튼을 띄울지 정하고, 그 주소가 살아 있는지 확인한다.
 *
 * <p>필드 모양은 {@link JiraConfig} 를 따랐다. 외부 서비스 연동 설정의 검증된 형태이고, 주소 + 암호화 토큰 + 활성 플래그 + 연결 검증 상태 3종이 같은
 * 구성이다.
 *
 * <p>{@code isActive} 기본값이 {@code false} 인 이유가 있다. 기존 프로젝트가 업그레이드만으로 새 UI 를 보면 안 된다. 명시적으로 켜야 나타난다.
 *
 * <p>지금은 프로젝트당 하나다({@code UNIQUE(project_id)}). 여러 에이전트를 등록해야 하면 이 제약을 풀고 {@code isDefault} 를 더한다.
 * {@link LlmConfig} 가 이미 그 구조라 확장 경로가 검증돼 있다.
 */
@Entity
@Table(
    name = "agent_connections",
    uniqueConstraints =
        @UniqueConstraint(name = "uk_agent_conn_project", columnNames = "project_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentConnection {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Column(name = "project_id", nullable = false, length = 36)
  private String projectId;

  /** 화면에 노출되는 이름. 버튼 문구가 "스테이징 QA 에이전트로 실행" 이 된다. */
  @Column(nullable = false, length = 100)
  private String name;

  /** 에이전트 앱 주소. 예: https://qa-agent.internal:8090 */
  @Column(name = "server_url", nullable = false, length = 500)
  private String serverUrl;

  /**
   * 브라우저가 딥링크를 열 때 쓸 주소. 비면 {@link #serverUrl} 을 쓴다.
   *
   * <p>왜 칸이 둘인가. {@code serverUrl} 은 <b>서버</b>가 연결 확인에 쓰고, 딥링크는
   * <b>브라우저</b>가 연다. 두 시점이 다르다. 운영에서는 같은 이름으로 양쪽이 닿으므로
   * 이 칸을 비워 둔다.
   *
   * <p>갈리는 배치가 실제로 있다. 제품이 컨테이너 안이면 서버는 {@code
   * host.docker.internal} 로만 에이전트에 닿고, 브라우저는 그 이름을 풀지 못한다
   * ({@code ERR_NAME_NOT_RESOLVED}). 반대로 {@code localhost} 를 넣으면 서버가
   * 자기 자신을 가리켜 연결 확인이 깨지고, 그러면 버튼이 비활성된다. 한 칸으로는
   * 어떤 값을 넣어도 둘 다 만족하지 못한다.
   */
  @Column(name = "browser_url", length = 500)
  private String browserUrl;

  /** 인증 토큰. JiraConfig.encryptedApiToken 과 같은 암호화 경로를 쓴다. */
  @Column(name = "encrypted_token", columnDefinition = "TEXT")
  private String encryptedToken;

  /** 에이전트 앱에 있는 기본 프로필 식별자 (정책·컨텍스트 묶음). */
  @Column(name = "default_profile", length = 100)
  private String defaultProfile;

  /** On/Off. 기본은 꺼짐. */
  @Builder.Default
  @Column(name = "is_active", nullable = false)
  private Boolean isActive = false;

  @Builder.Default
  @Column(name = "connection_verified")
  private Boolean connectionVerified = false;

  @Column(name = "last_connection_test")
  private LocalDateTime lastConnectionTest;

  @Column(name = "last_connection_error", columnDefinition = "TEXT")
  private String lastConnectionError;

  @Column(name = "agent_version", length = 50)
  private String agentVersion;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "updated_by", length = 100)
  private String updatedBy;

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.isActive == null) {
      this.isActive = false;
    }
    if (this.connectionVerified == null) {
      this.connectionVerified = false;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  /** 실행 버튼을 띄울 수 있는 상태인가. 켜져 있고 연결이 확인된 경우만 참이다. */
  public boolean isRunnable() {
    return Boolean.TRUE.equals(this.isActive) && Boolean.TRUE.equals(this.connectionVerified);
  }

  /** 브라우저가 열 주소. 별도 지정이 없으면 서버 주소를 그대로 쓴다. */
  public String effectiveBrowserUrl() {
    return (this.browserUrl == null || this.browserUrl.isBlank())
        ? this.serverUrl
        : this.browserUrl;
  }
}
