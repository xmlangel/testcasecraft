package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "service_api_keys")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ServiceApiKey {

  @Id
  @Column(length = 36)
  private String id;

  // 저장 값은 원본 키가 아니라 SHA-256 hex(64자) 해시. 직렬화 응답에 절대 노출하지 않는다.
  @JsonIgnore
  @Column(nullable = false, unique = true, length = 100)
  private String apiKey;

  @Column(nullable = false, length = 100)
  private String name;

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @CreatedBy
  @Column(nullable = true, updatable = false)
  private String createdBy;

  @Column(nullable = false)
  private LocalDateTime expiresAt;

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
