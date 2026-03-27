package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** 전역 시스템 설정 Entity 시스템이 재시작되어도 유지되어야 하는 동적인 전역 설정값 (예: RAG 활성화/비활성화 토글) 보관 */
@Entity
@Table(name = "system_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SystemSetting {

  @Id
  @Column(name = "setting_key", nullable = false, length = 100)
  private String settingKey;

  @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
  private String settingValue;

  @Column(length = 500)
  private String description;

  @LastModifiedDate private LocalDateTime lastModifiedDate;
}
