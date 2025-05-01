// src/main/java/com/testcase/testcasemanagement/mapper/ProjectMapper.java
package com.testcase.testcasemanagement.mapper;

import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.model.Project;
import java.time.format.DateTimeFormatter;

public class ProjectMapper {
    private static final DateTimeFormatter formatter =
            DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static ProjectDto toDto(Project entity) {
        ProjectDto dto = new ProjectDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setCreatedAt(entity.getCreatedAt() != null ?
                entity.getCreatedAt().format(formatter) : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ?
                entity.getUpdatedAt().format(formatter) : null);
        return dto;
    }

    public static Project toEntity(ProjectDto dto) {
        Project entity = new Project();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }
}
