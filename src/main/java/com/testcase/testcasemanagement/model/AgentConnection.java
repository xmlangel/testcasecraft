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
import org.hibernate.annotations.Comment;

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
@Comment("외부 에이전트 연결: 프로젝트가 외부 QA 에이전트에 접속할 때 쓰는 연결 정보와 검증 상태 | External Agent Connection: connection information and verification status that a project uses to connect to an external QA agent")
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

  @Comment("식별자: 이 연동 설정을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies this integration setting (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("프로젝트 식별자: 이 연동이 속한 프로젝트 (값 영역: projects.id 참조) | Project Identifier: project to which this integration belongs (Value domain: references projects.id)")
  @Column(name = "project_id", nullable = false, length = 36)
  private String projectId;

  /** 화면에 노출되는 이름. 버튼 문구가 "스테이징 QA 에이전트로 실행" 이 된다. */
  @Comment("에이전트 명: 화면에 표시되는 에이전트의 이름 | Agent Name: name of the agent displayed on screen")
  @Column(nullable = false, length = 100)
  private String name;

  /** 에이전트 앱 주소. 예: https://qa-agent.internal:8090 */
  @Comment("서버 URL: 에이전트 앱의 서버 주소 (값 영역: 500자 이하 URL) | Server URL: server address of the agent app (Value domain: URL up to 500 characters)")
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
  @Comment("브라우저 URL: 딥링크 실행 시 브라우저가 열 주소 (값 영역: 500자 이하 URL, 비면 서버_URL 사용) | Browser URL: address the browser opens when a deep link is launched (Value domain: URL up to 500 characters, server_url is used when empty)")
  @Column(name = "browser_url", length = 500)
  private String browserUrl;

  /** 인증 토큰. JiraConfig.encryptedApiToken 과 같은 암호화 경로를 쓴다. */
  @Comment("인증 토큰: 암호화된 에이전트 접근 인증값 | Authentication Token: encrypted authentication value for agent access")
  @Column(name = "encrypted_token", columnDefinition = "TEXT")
  private String encryptedToken;

  /** 에이전트 앱에 있는 기본 프로필 식별자 (정책·컨텍스트 묶음). */
  @Comment("기본 프로필 식별자: 에이전트 앱의 기본 정책·컨텍스트 묶음 식별자 | Default Profile Identifier: identifier of the default policy and context bundle of the agent app")
  @Column(name = "default_profile", length = 100)
  private String defaultProfile;

  /** On/Off. 기본은 꺼짐. */
  @Comment("활성 여부: 이 연동이 화면에 표시되고 실행 가능한지 (값 영역: true, false) | Active Indicator: indicator of whether this integration is shown on screen and can be run (Value domain: true, false)")
  @Builder.Default
  @Column(name = "is_active", nullable = false)
  private Boolean isActive = false;

  @Comment("연결 검증 여부: 마지막 검증 시 서버와 정상 연결됨을 확인했는지 (값 영역: true, false) | Connection Verified Indicator: whether the last verification confirmed a successful connection to the server (Value domain: true, false)")
  @Builder.Default
  @Column(name = "connection_verified")
  private Boolean connectionVerified = false;

  @Comment("마지막 연결 테스트 일시: 가장 최근에 연결을 확인한 일시 | Last Connection Test Date Time: date and time the connection was most recently checked")
  @Column(name = "last_connection_test")
  private LocalDateTime lastConnectionTest;

  @Comment("마지막 연결 오류: 가장 최근 연결 시도에서 발생한 오류 메시지 | Last Connection Error: error message produced by the most recent connection attempt")
  @Column(name = "last_connection_error", columnDefinition = "TEXT")
  private String lastConnectionError;

  @Comment("에이전트 버전: 에이전트 앱의 버전 정보 (값 영역: 50자 이하) | Agent Version: version information of the agent app (Value domain: up to 50 characters)")
  @Column(name = "agent_version", length = 50)
  private String agentVersion;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("수정자 명: 이 행을 마지막으로 변경한 사용자의 사용자명 | Updater Name: username of the user who last changed this row")
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
