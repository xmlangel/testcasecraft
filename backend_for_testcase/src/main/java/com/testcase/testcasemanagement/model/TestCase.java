// src/main/java/com/testcase/testcasemanagement/model/TestCase.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "testcases",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"project_id", "name"})
        }
)
public class TestCase {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    @JsonBackReference
    private Project project;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String type; // folder, testcase

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String preCondition;

    @Column(name = "parent_id")
    private String parentId;

    @ElementCollection
    @CollectionTable(name = "testcasesteps", joinColumns = @JoinColumn(name = "testcase_id"))
    @OrderColumn(name = "step_order")
    private List<TestStep> steps;

    @Column(columnDefinition = "TEXT", name = "expected_results")
    private String expectedResults;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.displayOrder == null) this.displayOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "TestCase{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", project=" + (project != null ? project.getId() : null) +
                '}';
    }
}
