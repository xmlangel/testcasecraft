// src/main/java/com/testcase/testcasemanagement/model/User.java
package com.testcase.testcasemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String password;

    @Column(length = 20)
    private String role; // ADMIN, MANAGER, TESTER, null

    @Column(length = 10)
    private String preferredLanguage = "ko"; // 사용자 선호 언어 (기본값: 한국어)

    @Column(length = 50)
    private String timezone = "UTC"; // 사용자 시간대 (기본값: UTC)

    @Column(nullable = false)
    private Boolean isActive = true; // 기본값은 활성화

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false; // 이메일 인증 여부 (기본값: 미인증)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 사용자가 속한 조직들
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrganizationUser> organizationUsers = new ArrayList<>();

    // 사용자가 참여한 프로젝트들
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectUser> projectUsers = new ArrayList<>();

    // 사용자가 속한 그룹들
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMember> groupMembers = new ArrayList<>();

    // 사용자의 리프레시 토큰들
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // password 필드를 제외한 생성자 (JPQL SELECT new 절용)
    public User(String id, String username, String email, String name, String role, String preferredLanguage,
            String timezone, Boolean isActive, Boolean emailVerified, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.role = role;
        this.preferredLanguage = preferredLanguage;
        this.timezone = timezone;
        this.isActive = isActive;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}