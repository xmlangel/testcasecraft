package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** 전역 시스템 설정 Entity 시스템이 재시작되어도 유지되어야 하는 동적인 전역 설정값 (예: RAG 활성화/비활성화 토글) 보관 */
@Entity
@Comment("시스템 설정: 시스템 전체에 적용하는 키와 값 형태의 설정")
@Table(name = "system_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SystemSetting {

  @Comment("설정 키: 이 설정을 구분하는 식별자 (값 영역: 설정 이름, 예: rag.enabled)")
  @Id
  @Column(name = "setting_key", nullable = false, length = 100)
  private String settingKey;

  @Comment("설정값: 설정 키에 해당하는 값 (형식은 설정에 따라 다름)")
  @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
  private String settingValue;

  @Comment("설명: 이 설정의 용도와 허용 값에 대한 설명")
  @Column(length = 500)
  private String description;

  @Comment("마지막 수정 일시: 이 행이 마지막으로 변경된 일시")
  @LastModifiedDate private LocalDateTime lastModifiedDate;
}
