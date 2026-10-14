// src/main/java/com/testcase/testcasemanagement/model/UserActivity.java
// UserActivity: 사용자 활동 이력을 추적하는 엔티티
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Comment("사용자 활동: 사용자의 로그인, 화면 접근, 작업 수행 기록 | User Activity: record of a user login, screen access, or action performed")
@Table(
    name = "user_activities",
    indexes = {
      @Index(name = "idx_user_activities_user_id", columnList = "user_id"),
      @Index(name = "idx_user_activities_activity_type", columnList = "activity_type"),
      @Index(name = "idx_user_activities_timestamp", columnList = "timestamp"),
      @Index(name = "idx_user_activities_session_id", columnList = "session_id")
    })
public class UserActivity {
  @Comment("식별자: 이 활동 기록을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies this activity record (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("사용자 식별자: 이 활동을 수행한 사용자 (값 영역: users.id 참조) | User Identifier: user who performed this activity (Value domain: references users.id)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Comment("활동 유형: 구체적인 활동 종류 (값 영역: LOGIN, LOGOUT, PROJECT_ACCESS, TESTCASE_CREATE, TESTCASE_UPDATE 등) | Activity Type Code: specific kind of activity (Value domain: LOGIN, LOGOUT, PROJECT_ACCESS, TESTCASE_CREATE, TESTCASE_UPDATE, etc.)")
  @Column(name = "activity_type", nullable = false, length = 50)
  private String
      activityType; // LOGIN, LOGOUT, PROJECT_ACCESS, TESTCASE_CREATE, TESTCASE_UPDATE, etc.

  @Comment("활동 분류: 활동이 속한 상위 카테고리 (값 영역: AUTHENTICATION, PROJECT_MANAGEMENT, TEST_MANAGEMENT, SYSTEM) | Activity Category Code: higher-level category to which the activity belongs (Value domain: AUTHENTICATION, PROJECT_MANAGEMENT, TEST_MANAGEMENT, SYSTEM)")
  @Column(name = "activity_category", nullable = false, length = 30)
  private String activityCategory; // AUTHENTICATION, PROJECT_MANAGEMENT, TEST_MANAGEMENT, SYSTEM

  @Comment("대상 엔티티 유형: 이 활동이 영향을 미친 대상의 종류 (값 영역: PROJECT, TESTCASE, ORGANIZATION, REQUIREMENT 등) | Target Entity Type: kind of target affected by this activity (Value domain: PROJECT, TESTCASE, ORGANIZATION, REQUIREMENT, etc.)")
  @Column(name = "target_entity_type", length = 50)
  private String targetEntityType; // PROJECT, TESTCASE, ORGANIZATION, etc.

  @Comment("대상 엔티티 식별자: 이 활동이 영향을 미친 대상의 ID (값 영역: 해당 엔티티의 ID) | Target Entity Identifier: ID of the target affected by this activity (Value domain: ID of the corresponding entity)")
  @Column(name = "target_entity_id")
  private String targetEntityId;

  @Comment("대상 엔티티 명: 이 활동이 영향을 미친 대상의 이름 (값 영역: 200자 이하) | Target Entity Name: name of the target affected by this activity (Value domain: up to 200 characters)")
  @Column(name = "target_entity_name", length = 200)
  private String targetEntityName; // 참조용 이름 저장

  @Comment("세션 식별자: 이 활동이 속한 세션 (값 영역: 100자 이하) | Session Identifier: session to which this activity belongs (Value domain: up to 100 characters)")
  @Column(name = "session_id", length = 100)
  private String sessionId; // 세션 추적용

  @Comment("IP 주소: 이 활동을 수행한 클라이언트의 IP 주소 (값 영역: 45자 이하, IPv4/IPv6 지원) | IP Address: IP address of the client that performed this activity (Value domain: up to 45 characters, supports IPv4/IPv6)")
  @Column(name = "ip_address", length = 45)
  private String ipAddress; // IPv6 지원

  @Comment("사용자 에이전트: 클라이언트의 브라우저·앱 정보 (값 영역: 500자 이하) | User Agent: browser or app information of the client (Value domain: up to 500 characters)")
  @Column(name = "user_agent", length = 500)
  private String userAgent;

  @Comment("기록 일시: 이 활동이 일어난 일시 | Recorded Date Time: date and time this activity occurred")
  @Column(name = "timestamp", nullable = false)
  private LocalDateTime timestamp;

  @Comment("지속 시간: 이 활동이 걸린 시간 (값 영역: 0 이상의 정수, 단위: 밀리초) | Duration: time this activity took (Value domain: integer of 0 or greater, unit: milliseconds)")
  @Column(name = "duration_ms")
  private Long durationMs; // 활동 지속 시간 (밀리초)

  @Comment("성공 여부: 이 활동이 성공했는지 (값 영역: true, false) | Success Indicator: whether this activity succeeded (Value domain: true, false)")
  @Column(name = "is_successful", nullable = false)
  @Builder.Default
  private Boolean isSuccessful = true; // 성공/실패 여부

  @Comment("오류 메시지: 활동 실패 시 오류 메시지 (값 영역: 500자 이하) | Error Message: error message recorded when the activity failed (Value domain: up to 500 characters)")
  @Column(name = "error_message", length = 500)
  private String errorMessage; // 실패 시 오류 메시지

  @Comment("상세 정보: 활동의 추가 정보 또는 JSON 형태의 매개변수 | Detail Text: additional information about the activity or parameters in JSON form")
  @Column(name = "details", columnDefinition = "TEXT")
  private String details; // JSON 형태의 추가 정보

  @Comment("위험도 점수: 이 활동의 보안 위험도 (값 영역: 0 이상 100 이하의 정수) | Risk Score: security risk level of this activity (Value domain: integer from 0 to 100 inclusive)")
  @Column(name = "risk_score")
  private Integer riskScore; // 위험도 점수 (0-100)

  @Comment("이상 활동 감지: 이 활동이 평상시와 다른 이상 패턴인지 (값 영역: true, false) | Anomaly Detected Indicator: whether this activity shows an abnormal pattern that differs from usual behavior (Value domain: true, false)")
  @Column(name = "anomaly_detected")
  @Builder.Default
  private Boolean anomalyDetected = false; // 이상 활동 감지 여부

  @PrePersist
  protected void onCreate() {
    if (timestamp == null) {
      timestamp = LocalDateTime.now();
    }
    if (isSuccessful == null) {
      isSuccessful = true;
    }
    if (anomalyDetected == null) {
      anomalyDetected = false;
    }
  }

  // 편의 메서드들
  public boolean isLoginActivity() {
    return "LOGIN".equals(activityType);
  }

  public boolean isLogoutActivity() {
    return "LOGOUT".equals(activityType);
  }

  public boolean isProjectActivity() {
    return "PROJECT_MANAGEMENT".equals(activityCategory);
  }

  public boolean isTestManagementActivity() {
    return "TEST_MANAGEMENT".equals(activityCategory);
  }

  public boolean isHighRisk() {
    return riskScore != null && riskScore >= 70;
  }
}
