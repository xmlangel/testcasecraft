// src/main/java/com/testcase/testcasemanagement/model/TranslationKey.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Comment("번역 키: 화면 문구를 언어별로 번역할 때 기준이 되는 키 | Translation Key: key used as the reference when translating screen text into each language")
@Table(name = "translation_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TranslationKey {
  @Comment("번역 키 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Translation Key Identifier: value that uniquely identifies this row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("키명: 번역 대상을 구분하는 유일한 이름 (예: login.username, button.submit) | Key Name: unique name that distinguishes a translation target (for example, login.username, button.submit)")
  @Column(nullable = false, unique = true, length = 200)
  private String keyName; // login.username, login.password, button.submit, etc.

  @Comment("범주: 번역 키를 분류하는 카테고리 (예: login, button, message, validation) | Category: category that classifies the translation key (e.g. login, button, message, validation)")
  @Column(length = 100)
  private String category; // login, button, message, validation, etc.

  @Comment("설명: 이 번역 키의 용도와 문맥에 대한 설명 | Description: description of the purpose and context of this translation key")
  @Column(length = 500)
  private String description; // 키에 대한 설명

  @Comment("기본값: 번역을 찾지 못했을 때 사용할 기본 텍스트 | Default Value: default text used when no translation is found")
  @Column(length = 500)
  private String defaultValue; // 기본값 (fallback용)

  @Comment("활성 여부: 이 번역 키를 사용할지 여부 (값 영역: true, false) | Active Indicator: indicator of whether this translation key is to be used (Value domain: true, false)")
  @Column(nullable = false)
  private Boolean isActive = true; // 활성화 상태

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // 이 키에 대한 번역들
  @JsonIgnore
  @OneToMany(mappedBy = "translationKey", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Translation> translations = new ArrayList<>();

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  // 생성자 - 기본 키 생성용
  public TranslationKey(String keyName, String category, String description, String defaultValue) {
    this.keyName = keyName;
    this.category = category;
    this.description = description;
    this.defaultValue = defaultValue;
    this.isActive = true;
  }
}
