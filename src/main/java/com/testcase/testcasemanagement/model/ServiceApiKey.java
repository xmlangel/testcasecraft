package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Comment("서비스 API 키: 외부 서비스가 이 시스템의 API 를 호출할 때 제출하는 인증 키")
@Table(name = "service_api_keys")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ServiceApiKey {

  @Comment("식별자: 이 API 키 기록을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @Column(length = 36)
  private String id;

  // 저장 값은 원본 키가 아니라 SHA-256 hex(64자) 해시. 직렬화 응답에 절대 노출하지 않는다.
  @Comment("API 키 해시: SHA-256 으로 해시한 API 키 (값 영역: 16진 64자)")
  @JsonIgnore
  @Column(nullable = false, unique = true, length = 100)
  private String apiKey;

  @Comment("키 명: 이 API 키의 용도를 나타내는 사람이 읽을 수 있는 이름 (값 영역: 100자 이하)")
  @Column(nullable = false, length = 100)
  private String name;

  @Comment("생성 일시: 이 API 키가 발급된 일시")
  @CreatedDate
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("생성자 명: 이 API 키를 발급한 사용자의 사용자명 (값 영역: 100자 이하)")
  @CreatedBy
  @Column(nullable = true, updatable = false)
  private String createdBy;

  @Comment("만료 일시: 이 API 키가 더 이상 사용할 수 없게 되는 일시")
  @Column(nullable = false)
  private LocalDateTime expiresAt;

  @Comment("활성 여부: 이 API 키를 사용할 수 있는지 (값 영역: true, false)")
  @Column(nullable = false)
  @Builder.Default
  private boolean isActive = true;

  @PrePersist
  public void prePersist() {
    if (this.id == null) {
      this.id = java.util.UUID.randomUUID().toString();
    }
    if (this.createdAt == null) {
      this.createdAt = LocalDateTime.now();
    }
  }
}
