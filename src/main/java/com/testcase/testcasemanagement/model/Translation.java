// src/main/java/com/testcase/testcasemanagement/model/Translation.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Comment("번역: 번역 키 하나를 특정 언어로 옮긴 문구")
@Table(
    name = "translations",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"translation_key_id", "language_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Translation {
  @Comment("번역 식별자: 이 번역 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment(value = "번역 키 식별자: 이 번역의 소스 문자열을 가리키는 값 (값 영역: translation_keys.id 참조, UUID 36자)", on = "translation_key_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "translation_key_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private TranslationKey translationKey;

  @Comment(value = "언어 식별자: 이 번역의 대상 언어를 가리키는 값 (값 영역: languages.id 참조, UUID 36자)", on = "language_id")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "language_id", nullable = false)
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Language language;

  @Comment("번역 내용: 소스 문자열을 대상 언어로 번역한 텍스트")
  @Column(name = "translation_value", nullable = false, length = 2000)
  private String value; // 번역된 텍스트

  @Comment("번역 컨텍스트: 번역이 사용되는 상황이나 맥락을 설명하는 내용")
  @Column(length = 500)
  private String context; // 번역 컨텍스트 (사용되는 상황 설명)

  @Comment("활성화 여부: 이 번역이 시스템에서 사용 중인지를 나타내는 값 (값 영역: true, false)")
  @Column(nullable = false)
  private Boolean isActive = true; // 활성화 상태

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시", on = "created_at")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시", on = "updated_at")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("생성자 명: 이 번역을 처음 생성한 사용자의 식별자")
  @Column(name = "created_by", length = 50)
  private String createdBy; // 번역을 생성한 사용자

  @Comment("최종 수정자 명: 이 번역을 마지막으로 수정한 사용자의 식별자")
  @Column(name = "updated_by", length = 50)
  private String updatedBy; // 번역을 수정한 사용자

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  // 생성자 - 기본 번역 생성용
  public Translation(
      TranslationKey translationKey, Language language, String value, String createdBy) {
    this.translationKey = translationKey;
    this.language = language;
    this.value = value;
    this.createdBy = createdBy;
    this.updatedBy = createdBy;
    this.isActive = true;
  }
}
