// src/main/java/com/testcase/testcasemanagement/model/UserActivity.java
// UserActivity: 사용자 활동 이력을 추적하는 엔티티
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "user_activities", indexes = {
    @Index(name = "idx_user_activities_user_id", columnList = "user_id"),
    @Index(name = "idx_user_activities_activity_type", columnList = "activity_type"),
    @Index(name = "idx_user_activities_timestamp", columnList = "timestamp"),
    @Index(name = "idx_user_activities_session_id", columnList = "session_id")
})
public class UserActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType; // LOGIN, LOGOUT, PROJECT_ACCESS, TESTCASE_CREATE, TESTCASE_UPDATE, etc.

    @Column(name = "activity_category", nullable = false, length = 30)
    private String activityCategory; // AUTHENTICATION, PROJECT_MANAGEMENT, TEST_MANAGEMENT, SYSTEM

    @Column(name = "target_entity_type", length = 50)
    private String targetEntityType; // PROJECT, TESTCASE, ORGANIZATION, etc.

    @Column(name = "target_entity_id")
    private String targetEntityId;

    @Column(name = "target_entity_name", length = 200)
    private String targetEntityName; // 참조용 이름 저장

    @Column(name = "session_id", length = 100)
    private String sessionId; // 세션 추적용

    @Column(name = "ip_address", length = 45)
    private String ipAddress; // IPv6 지원

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "duration_ms")
    private Long durationMs; // 활동 지속 시간 (밀리초)

    @Column(name = "is_successful", nullable = false)
    @Builder.Default
    private Boolean isSuccessful = true; // 성공/실패 여부

    @Column(name = "error_message", length = 500)
    private String errorMessage; // 실패 시 오류 메시지

    @Column(name = "details", columnDefinition = "TEXT")
    private String details; // JSON 형태의 추가 정보

    @Column(name = "risk_score")
    private Integer riskScore; // 위험도 점수 (0-100)

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