// src/main/java/com/testcase/testcasemanagement/controller/TestCaseController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.service.TestCaseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;
import java.util.stream.Collectors;

// DTO 클래스 정의 (엔티티와 동일 구조, 필요시 별도 파일로 분리)
class TestCaseDto {
    private String id;
    private String name;
    private String type;
    private String description;
    private String parentId;
    private List<TestStepDto> steps;
    private String expectedResults;
    private String createdAt;
    private String updatedAt;

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
    public void setParentId(String parentId) { this.parentId = parentId; }
    public List<TestStepDto> getSteps() { return steps; }
    public void setSteps(List<TestStepDto> steps) { this.steps = steps; }
    public String getExpectedResults() { return expectedResults; }
    public void setExpectedResults(String expectedResults) { this.expectedResults = expectedResults; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

// TestStep DTO 정의
class TestStepDto {
    private int stepNumber;
    private String description;
    private String expectedResult;

    // Getter/Setter
    public int getStepNumber() { return stepNumber; }
    public void setStepNumber(int stepNumber) { this.stepNumber = stepNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getExpectedResult() { return expectedResult; }
    public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }
}

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {
    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping
    public List<TestCaseDto> getAllTestCases() {
        return testCaseService.getAllTestCases().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Entity → DTO 변환 메서드
    private TestCaseDto toDto(TestCase entity) {
        TestCaseDto dto = new TestCaseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setDescription(entity.getDescription());
        dto.setParentId(entity.getParentId());
        if (entity.getSteps() != null) {
            dto.setSteps(
                    entity.getSteps().stream().map(step -> {
                        TestStepDto stepDto = new TestStepDto();
                        stepDto.setStepNumber(step.getStepNumber());
                        stepDto.setDescription(step.getDescription());
                        stepDto.setExpectedResult(step.getExpectedResult());
                        return stepDto;
                    }).collect(Collectors.toList())
            );
        }
        dto.setExpectedResults(entity.getExpectedResults());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);
        return dto;
    }
}
