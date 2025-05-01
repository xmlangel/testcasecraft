// src/main/java/com/testcase/testcasemanagement/model/TestCase.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "testcases")
public class TestCase {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String type; // "folder" or "testcase"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "parentid", length = 36)
    private String parentId;

    @ElementCollection
    @CollectionTable(name = "testcasesteps", joinColumns = @JoinColumn(name = "testcaseid"))
    @OrderColumn(name = "steporder")
    private List<TestStep> steps;

    @Column(columnDefinition = "TEXT", name = "expectedresults")
    private String expectedResults;

    @Column(name = "displayorder")
    private Integer displayOrder;

    @Column(name = "createdat", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
