// src/main/java/com/testcase/testcasemanagement/model/GoogleConfig.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "google_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleConfig {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(name = "user_id", nullable = false, unique = true)
  private String userId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", insertable = false, updatable = false)
  @JsonIgnore
  private User user;

  @Column(nullable = false, length = 200)
  private String clientEmail;

  @Column(nullable = false, length = 100)
  private String projectId;

  @JsonIgnore
  @Column(nullable = false, columnDefinition = "TEXT")
  private String encryptedJsonKey; // 암호화된 JSON 원본

  @Column(nullable = false)
  private Boolean isActive = true;

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
}
