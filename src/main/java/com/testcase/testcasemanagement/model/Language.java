// src/main/java/com/testcase/testcasemanagement/model/Language.java
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
@Table(name = "languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Language {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 10)
    private String code; // ko, en, ja, zh, etc.

    @Column(nullable = false, length = 50)
    private String name; // 한국어, English, 日本語, 中文, etc.

    @Column(nullable = false, length = 50)
    private String nativeName; // 해당 언어로 표현된 이름

    @Column(nullable = false)
    private Boolean isActive = true; // 활성화 상태

    @Column(nullable = false)
    private Boolean isDefault = false; // 기본 언어 여부

    @Column(nullable = false)
    private Integer sortOrder = 0; // 표시 순서

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

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
    public Language(String code, String name, String nativeName, Boolean isDefault, Integer sortOrder) {
        this.code = code;
        this.name = name;
        this.nativeName = nativeName;
        this.isDefault = isDefault;
        this.sortOrder = sortOrder;
        this.isActive = true;
    }
}