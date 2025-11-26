// src/main/java/com/testcase/testcasemanagement/model/EmailVerificationToken.java
package com.testcase.testcasemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens", indexes = {
        @Index(name = "idx_token", columnList = "token"),
        @Index(name = "idx_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            // 기본 만료 시간: 24시간
            expiresAt = LocalDateTime.now().plusHours(24);
        }
    }

    // 토큰 만료 여부 확인
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // 토큰 사용 가능 여부 확인
    public boolean isValid() {
        return !isUsed && !isExpired();
    }
}
