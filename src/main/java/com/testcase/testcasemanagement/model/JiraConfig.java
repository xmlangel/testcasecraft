// src/main/java/com/testcase/testcasemanagement/model/JiraConfig.java
package com.testcase.testcasemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "jira_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JiraConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 500)
    private String serverUrl;

    @Column(nullable = false, length = 100)
    private String username;

    @JsonIgnore
    @Column(nullable = false, columnDefinition = "TEXT")
    private String encryptedApiToken;

    @Column(length = 50)
    private String testProjectKey;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "connection_verified")
    private Boolean connectionVerified = false;

    @Column(name = "last_connection_test")
    private LocalDateTime lastConnectionTest;

    @Column(name = "last_connection_error", columnDefinition = "TEXT")
    private String lastConnectionError;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

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