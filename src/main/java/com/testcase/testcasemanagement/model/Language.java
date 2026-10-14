// src/main/java/com/testcase/testcasemanagement/model/Language.java
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
@Comment("언어: 시스템에서 지원하는 표시 언어 | Language: display language supported by the system")
@Table(name = "languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Language {
  @Comment("언어 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Language Identifier: value that uniquely identifies this row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("언어 코드: ISO 639-1 기준 언어 코드 (값 영역: ko, en, ja, zh 등) | Language Code: language code based on ISO 639-1 (Value domain: ko, en, ja, zh, etc.)")
  @Column(nullable = false, unique = true, length = 10)
  private String code; // ko, en, ja, zh, etc.

  @Comment("언어명: 영어로 표현된 언어 이름 | Language Name: name of the language expressed in English")
  @Column(nullable = false, length = 50)
  private String name; // 한국어, English, 日本語, 中文, etc.

  @Comment("모국어명: 해당 언어로 표현된 언어 이름 | Native Name: name of the language as expressed in that language")
  @Column(nullable = false, length = 50)
  private String nativeName; // 해당 언어로 표현된 이름

  @Comment("활성 여부: 이 언어를 사용자 선택지로 제공할지 여부 | Active Indicator: indicator of whether this language is offered as a user option")
  @Column(nullable = false)
  private Boolean isActive = true; // 활성화 상태

  @Comment("기본 언어 여부: 시스템 기본으로 사용할 언어인지 여부 | Default Language Indicator: whether this language is used as the system default")
  @Column(nullable = false)
  private Boolean isDefault = false; // 기본 언어 여부

  @Comment("표시 순서: UI 언어 선택 메뉴에서 나타나는 순서 | Display Order: order in which the language appears in the UI language selection menu")
  @Column(nullable = false)
  private Integer sortOrder = 0; // 표시 순서

  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // 이 언어로 된 번역들
  @JsonIgnore
  @OneToMany(mappedBy = "language", cascade = CascadeType.ALL, orphanRemoval = true)
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

  // 생성자 - 기본 언어 생성용
  public Language(
      String code, String name, String nativeName, Boolean isDefault, Integer sortOrder) {
    this.code = code;
    this.name = name;
    this.nativeName = nativeName;
    this.isDefault = isDefault;
    this.sortOrder = sortOrder;
    this.isActive = true;
  }
}
