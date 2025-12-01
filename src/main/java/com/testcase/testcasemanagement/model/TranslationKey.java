// src/main/java/com/testcase/testcasemanagement/model/TranslationKey.java
package com.testcase.testcasemanagement.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "translation_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TranslationKey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 200)
    private String keyName; // login.username, login.password, button.submit, etc.

    @Column(length = 100)
    private String category; // login, button, message, validation, etc.

    @Column(length = 500)
    private String description; // 키에 대한 설명

    @Column(length = 500)
    private String defaultValue; // 기본값 (fallback용)

    @Column(nullable = false)
    private Boolean isActive = true; // 활성화 상태

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

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