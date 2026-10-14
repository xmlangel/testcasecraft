// src/main/java/com/testcase/testcasemanagement/model/JiraConfig.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Comment("Jira 연동 설정: 사용자별 Jira 서버 접속 정보와 연결 검증 상태 | Jira Integration Configuration: per-user Jira server connection information and connection verification status")
@Table(name = "jira_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JiraConfig {
  @Comment("설정 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Configuration Identifier: value that uniquely identifies this row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("사용자 식별자: 이 설정을 소유한 사용자 (값 영역: users.id 참조) | User Identifier: user who owns this configuration (Value domain: references users.id)")
  @Column(name = "user_id", nullable = false)
  private String userId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  @JsonIgnore
  private User user;

  @Comment("서버 URL: Jira 서버의 기본 주소 | Server URL: base address of the Jira server")
  @Column(nullable = false, length = 500)
  private String serverUrl;

  @Comment("사용자명: Jira 서버에 로그인할 사용자명 | Username: username used to log in to the Jira server")
  @Column(nullable = false, length = 100)
  private String username;

  @Comment("암호화된 API 토큰: Jira 서버 인증에 사용할 암호화된 API 토큰 | Encrypted API Token: encrypted API token used for Jira server authentication")
  @JsonIgnore
  @Column(nullable = false, columnDefinition = "TEXT")
  private String encryptedApiToken;

  @Comment("테스트 프로젝트 키: 연결 검증에 사용할 Jira 프로젝트 키 | Test Project Key: Jira project key used to verify the connection")
  @Column(length = 50)
  private String testProjectKey;

  @Comment("활성 여부: 이 설정을 사용할지 여부 | Active Indicator: indicator of whether this configuration is to be used")
  @Column(nullable = false)
  private Boolean isActive = true;

  @Comment("연결 검증 여부: 마지막 연결 테스트의 성공 여부 | Connection Verified Indicator: whether the last connection test succeeded")
  @Column(name = "connection_verified")
  private Boolean connectionVerified = false;

  @Comment("마지막 연결 테스트 일시: 마지막으로 연결을 검증한 시각 | Last Connection Test Date Time: time at which the connection was last verified")
  @Column(name = "last_connection_test")
  private LocalDateTime lastConnectionTest;

  @Comment("마지막 연결 오류: 마지막 연결 시도 실패 시 오류 메시지 | Last Connection Error: error message from the last connection attempt when it failed")
  @Column(name = "last_connection_error", columnDefinition = "TEXT")
  private String lastConnectionError;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
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

  // Helper methods
  public boolean isConnectionHealthy() {
    // 자동 재검증 로직이 있으므로 시간 체크 제거 (무제한)
    // 단순히 마지막 연결 검증이 성공했는지만 확인
    return connectionVerified;
  }

  public void markConnectionSuccess() {
    this.connectionVerified = true;
    this.lastConnectionTest = LocalDateTime.now();
    this.lastConnectionError = null;
  }

  public void markConnectionFailure(String error) {
    this.connectionVerified = false;
    this.lastConnectionTest = LocalDateTime.now();
    this.lastConnectionError = error;
  }
}
