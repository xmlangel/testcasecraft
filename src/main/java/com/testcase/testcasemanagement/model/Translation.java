// src/main/java/com/testcase/testcasemanagement/model/Translation.java
package com.testcase.testcasemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "translations", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "translation_key_id", "language_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "translation_key_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private TranslationKey translationKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "language_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Language language;

    @Column(name = "translation_value", nullable = false, length = 2000)
    private String value; // 번역된 텍스트

    @Column(length = 500)
    private String context; // 번역 컨텍스트 (사용되는 상황 설명)

    @Column(nullable = false)
    private Boolean isActive = true; // 활성화 상태

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy; // 번역을 생성한 사용자

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
    public Translation(TranslationKey translationKey, Language language, String value, String createdBy) {
        this.translationKey = translationKey;
        this.language = language;
        this.value = value;
        this.createdBy = createdBy;
        this.updatedBy = createdBy;
        this.isActive = true;
    }
}