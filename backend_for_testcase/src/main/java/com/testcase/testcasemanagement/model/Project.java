// src/main/java/com/testcase/testcasemanagement/model/Project.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"code"})
})
public class Project {
    @Id
    @GeneratedValue(generator = "uuid2")
    @org.hibernate.annotations.GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "displayorder")
    private Integer displayOrder;

    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code; // ✅ NOT NULL + 유니크 제약조건

    @Column(name = "createdat", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
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
