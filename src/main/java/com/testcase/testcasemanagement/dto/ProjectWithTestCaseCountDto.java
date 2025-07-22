package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.Project;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectWithTestCaseCountDto {
    private String id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private String createdAt;
    private String updatedAt;
    private long testCaseCount;

public ProjectWithTestCaseCountDto(Project project, long testCaseCount) {
        this.id = project.getId();
        this.code = project.getCode();
        this.name = project.getName();
        this.description = project.getDescription();
        this.displayOrder = project.getDisplayOrder();
        this.createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;
        this.updatedAt = project.getUpdatedAt() != null ? project.getUpdatedAt().toString() : null;
        this.testCaseCount = testCaseCount;
    }
}