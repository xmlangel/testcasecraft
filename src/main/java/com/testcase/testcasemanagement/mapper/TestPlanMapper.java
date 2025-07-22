// src/main/java/com/testcase/testcasemanagement/mapper/TestPlanMapper.java
package com.testcase.testcasemanagement.mapper;

import com.testcase.testcasemanagement.dto.TestPlanDto;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.time.format.DateTimeFormatter;

@Component
public class TestPlanMapper {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final ProjectRepository projectRepository;

    @Autowired
    public TestPlanMapper(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public TestPlanDto toDto(TestPlan entity) {
        TestPlanDto dto = new TestPlanDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setTestCaseIds(entity.getTestCaseIds());
        dto.setProjectId(entity.getProject().getId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setTestCaseCount(entity.getTestCaseIds() != null ? entity.getTestCaseIds().size() : 0);
        return dto;
    }

    public TestPlan toEntity(TestPlanDto dto) {
        TestPlan entity = new TestPlan();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setTestCaseIds(dto.getTestCaseIds());

        // 프로젝트 조회 및 설정
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));
        entity.setProject(project);

        return entity;
    }
}
