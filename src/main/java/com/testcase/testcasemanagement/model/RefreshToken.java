package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.Comment;

@Entity
@Comment("리프레시 토큰: 로그인한 사용자가 액세스 토큰을 다시 발급받을 때 제출하는 토큰 | Refresh Token: token a logged-in user submits to be issued a new access token")
@Table(name = "refresh_tokens")
public class RefreshToken {

  @Comment("식별자: 갱신 토큰을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies a refresh token (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false)
  private String id;

  @Comment("토큰 값: JWT 형식의 갱신 토큰 (값 영역: 512자 이하) | Token Value: refresh token in JWT format (Value domain: up to 512 characters)")
  @Column(name = "token", nullable = false, unique = true, length = 512)
  private String token;

  @Comment("사용자 식별자: 이 토큰을 소유한 사용자 (값 영역: users.id 참조) | User Identifier: user who owns this token (Value domain: references users.id)")
  @Column(name = "user_id", nullable = false)
  private String userId;

  @Comment("만료 일시: 이 토큰이 더 이상 유효하지 않은 시점 | Expiration Date Time: point in time after which this token is no longer valid")
  @Column(name = "expiry_date", nullable = false)
  private LocalDateTime expiryDate;

  @Comment("폐기 여부: 사용자의 로그아웃 또는 토큰 재발급으로 무효화되었는지 여부 (값 영역: true, false) | Revoked Indicator: indicator of whether the token was invalidated by user logout or token reissue (Value domain: true, false)")
  @Column(name = "is_revoked", nullable = false)
  private boolean isRevoked = false;

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("사용자: 이 토큰을 소유한 사용자 | User: user who owns this token")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  private User user;

  // 기본 생성자
  public RefreshToken() {
    this.createdAt = LocalDateTime.now();
  }

  // 생성자
  public RefreshToken(String token, String userId, LocalDateTime expiryDate) {
    this();
    this.token = token;
    this.userId = userId;
    this.expiryDate = expiryDate;
  }

  // 만료 여부 확인
  public boolean isExpired() {
    return LocalDateTime.now().isAfter(this.expiryDate);
  }

  // 토큰 무효화
  public void revoke() {
    this.isRevoked = true;
    this.updatedAt = LocalDateTime.now();
  }

  // PreUpdate 콜백
  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public LocalDateTime getExpiryDate() {
    return expiryDate;
  }

  public void setExpiryDate(LocalDateTime expiryDate) {
    this.expiryDate = expiryDate;
  }

  public boolean isRevoked() {
    return isRevoked;
  }

  public void setRevoked(boolean revoked) {
    isRevoked = revoked;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }
}
