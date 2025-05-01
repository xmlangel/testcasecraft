// src/main/java/com/testcase/testcasemanagement/model/TestCase.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private String description;
    private String parentId; // 프론트와 맞추기 위해 String 타입

    @ElementCollection
    @CollectionTable(name = "test_case_steps", joinColumns = @JoinColumn(name = "test_case_id"))
    private List<TestStep> steps; // 객체 리스트

    @Column(columnDefinition = "TEXT")
    private String expectedResults; // 단일 문자열

    @Column(name = "display_order")
    private Integer displayOrder;

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TestCase() {}

    public String getId() { return id != null ? id.toString() : null; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }

    public List<TestStep> getSteps() { return steps; }
    public void setSteps(List<TestStep> steps) { this.steps = steps; }

    public String getExpectedResults() { return expectedResults; }
    public void setExpectedResults(String expectedResults) { this.expectedResults = expectedResults; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
