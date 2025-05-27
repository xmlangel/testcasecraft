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
                @UniqueConstraint(columnNames = {"project_id", "name", "parent_id", "type"}),
                @UniqueConstraint(columnNames = {"parent_id", "display_order"})
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

    /**
     * "testcase", "folder", "systemFolder" 중 하나
     */
    @Column(columnDefinition = "TEXT")
    private String type;

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

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // displayOrder가 null이면 0이 아니라 1로 초기화
        if (this.displayOrder == null) this.displayOrder = 1;
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
