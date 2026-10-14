// src/main/java/com/testcase/testcasemanagement/model/User.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Comment("사용자: 로그인해 이 시스템을 쓰는 계정")
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
  @Comment("사용자 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("사용자명: 시스템 로그인에 사용하는 유일한 이름")
  @Column(nullable = false, unique = true, length = 50)
  private String username;

  @Comment("이메일: 사용자의 이메일 주소")
  @Column(nullable = false, unique = true, length = 100)
  private String email;

  @Comment("이름: 사용자의 표시 이름")
  @Column(nullable = false, length = 100)
  private String name;

  @Comment("비밀번호: 해시 처리된 사용자 비밀번호")
  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  @Column(nullable = false, columnDefinition = "TEXT")
  private String password;

  @Comment("역할: 사용자의 권한 수준 (값 영역: ADMIN, MANAGER, TESTER)")
  @Column(length = 20)
  private String role; // ADMIN, MANAGER, TESTER, null

  @Comment("선호 언어: 사용자가 UI에서 선택한 언어 코드 (값 영역: ko, en 등)")
  @Column(length = 10)
  private String preferredLanguage = "ko"; // 사용자 선호 언어 (기본값: 한국어)

  @Comment("시간대: 사용자의 시간대 (값 영역: UTC, Asia/Seoul 등)")
  @Column(length = 50)
  private String timezone = "UTC"; // 사용자 시간대 (기본값: UTC)

  // UI 환경설정 (JSON 텍스트) — 테스트케이스 폼 필드 표시 토글 등.
  // JPA ddl-auto=update 로 컬럼 자동 추가됨.
  @Comment("UI 환경설정: JSON 형식으로 저장된 사용자의 UI 환경설정")
  @Column(name = "ui_preferences", columnDefinition = "TEXT")
  private String uiPreferences;

  @Comment("활성 여부: 이 사용자 계정을 사용할 수 있는지 여부 (값 영역: true, false)")
  @Column(nullable = false)
  private Boolean isActive = true; // 기본값은 활성화

  @Comment("이메일 인증 여부: 사용자의 이메일 주소가 인증되었는지 여부 (값 영역: true, false)")
  @Column(name = "email_verified", nullable = false)
  private Boolean emailVerified = false; // 이메일 인증 여부 (기본값: 미인증)

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시")
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
  public User(
      String id,
      String username,
      String email,
      String name,
      String role,
      String preferredLanguage,
      String timezone,
      Boolean isActive,
      Boolean emailVerified,
      LocalDateTime createdAt,
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
