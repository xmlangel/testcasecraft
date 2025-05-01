package com.testcase.testcasemanagement.dto;

import java.util.ArrayList;
import java.util.List;

public class TestCaseDto {
    private String id;
    private String name;
    private String type;
    private String description;
    private String parentId = ""; // 기본값을 빈 문자열로 설정
    private List<TestStepDto> steps = new ArrayList<>();
    private String expectedResults;
    private String createdAt;
    private String updatedAt;
    private List<TestCaseDto> children = new ArrayList<>(); // 트리 구조용 필드 추가

    // Getter/Setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) {
        this.parentId = (parentId == null) ? "" : parentId; // null → 빈 문자열 변환
    }
    public List<TestStepDto> getSteps() { return steps; }
    public void setSteps(List<TestStepDto> steps) { this.steps = steps; }
    public String getExpectedResults() { return expectedResults; }
    public void setExpectedResults(String expectedResults) { this.expectedResults = expectedResults; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public List<TestCaseDto> getChildren() { return children; }
    public void setChildren(List<TestCaseDto> children) { this.children = children; }
}
