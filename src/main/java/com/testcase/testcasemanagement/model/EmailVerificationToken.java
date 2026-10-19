// src/main/java/com/testcase/testcasemanagement/model/EmailVerificationToken.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Comment("이메일 인증 토큰: 사용자 이메일 주소를 인증할 때 발급하는 일회용 토큰")
@Table(
    name = "email_verification_tokens",
    indexes = {
      @Index(name = "idx_token", columnList = "token"),
      @Index(name = "idx_user_id", columnList = "user_id")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {

  @Comment("식별자: 이 토큰 기록을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("검증 토큰: 이메일 확인 링크에 사용되는 일회용 토큰 (값 영역: 100자 이하)")
  @Column(nullable = false, unique = true, length = 100)
  private String token;

  @Comment("사용자 식별자: 이 토큰으로 검증할 사용자 (값 영역: users.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Comment("이메일 주소: 검증 대상 이메일 주소 (값 영역: 100자 이하 이메일)")
  @Column(nullable = false, length = 100)
  private String email;

  @Comment("사용 여부: 이 토큰으로 검증이 완료됐는지 (값 영역: true, false)")
  @Column(nullable = false)
  private Boolean isUsed = false;

  @Comment("만료 일시: 이 토큰이 사용 불가능해지는 일시 (값 영역: 발급 일시 + 24시간)")
  @Column(nullable = false)
  private LocalDateTime expiresAt;

  @Comment("사용 일시: 이 토큰으로 검증이 완료된 일시")
  @Column private LocalDateTime usedAt;

  @Comment("생성 일시: 이 토큰이 발급된 일시")
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
