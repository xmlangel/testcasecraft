package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.Organization;
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
    private String organizationId; // 조직 ID 추가
    private Organization organization; // 조직 정보 추가
    private long testCaseCount;
    private long memberCount; // 멤버수 추가
    private long testPlanCount;
    private long testExecutionCount;

public ProjectWithTestCaseCountDto(Project project, long testCaseCount, long memberCount, long testPlanCount, long testExecutionCount) {
        this.id = project.getId();
        this.code = project.getCode();
        this.name = project.getName();
        this.description = project.getDescription();
        this.displayOrder = project.getDisplayOrder();
        this.createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;
        this.updatedAt = project.getUpdatedAt() != null ? project.getUpdatedAt().toString() : null;
        this.organizationId = project.getOrganization() != null ? project.getOrganization().getId() : null; // 조직 ID 설정
        this.organization = project.getOrganization(); // 조직 정보 설정
        this.testCaseCount = testCaseCount;
        this.memberCount = memberCount;
        this.testPlanCount = testPlanCount;
        this.testExecutionCount = testExecutionCount;
    }
    
    // 이전 버전과의 호환성을 위한 생성자 (memberCount=0으로 기본값)
    public ProjectWithTestCaseCountDto(Project project, long testCaseCount, long memberCount) {
        this(project, testCaseCount, memberCount, 0, 0);
    }
    
    // 이전 버전과의 호환성을 위한 생성자 (memberCount=0으로 기본값)
    public ProjectWithTestCaseCountDto(Project project, long testCaseCount) {
        this(project, testCaseCount, 0);
    }
}