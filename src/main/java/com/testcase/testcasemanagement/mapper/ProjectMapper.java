// src/main/java/com/testcase/testcasemanagement/mapper/ProjectMapper.java
package com.testcase.testcasemanagement.mapper;

import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.model.Project;
import java.time.format.DateTimeFormatter;

public class ProjectMapper {
    public static final DateTimeFormatter formatter =
            DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static ProjectDto toDto(Project entity) {
        ProjectDto dto = new ProjectDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setCreatedAt(entity.getCreatedAt() != null ?
                entity.getCreatedAt().format(formatter) : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ?
                entity.getUpdatedAt().format(formatter) : null);
        // 조직 ID 설정
        dto.setOrganizationId(entity.getOrganization() != null ? 
                entity.getOrganization().getId() : null);
        return dto;
    }

    public static Project toEntity(ProjectDto dto) {
        Project entity = new Project();
        // 새 프로젝트 생성 시에는 ID를 null로 두어 JPA가 자동 생성하도록 함
        // 기존 프로젝트 수정 시에만 ID 설정
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            entity.setId(dto.getId());
        }
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }
}
