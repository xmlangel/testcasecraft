// src/main/java/com/testcase/testcasemanagement/controller/ProjectController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.mapper.ProjectMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        List<ProjectDto> dtos = projects.stream()
                .map(ProjectMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectDto projectDto) {
        // 코드 필드 검증
        if (projectDto.getCode() == null || projectDto.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "프로젝트 코드는 필수 입력 항목입니다"));
        }

        Project project = ProjectMapper.toEntity(projectDto);
        Project savedProject = projectService.saveProject(project);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProjectMapper.toDto(savedProject));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable String id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(value -> ResponseEntity.ok(ProjectMapper.toDto(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable String id,
            @RequestBody ProjectDto projectDto
    ) {
        Project project = ProjectMapper.toEntity(projectDto);
        Project updatedProject = projectService.updateProject(id, project);
        return ResponseEntity.ok(ProjectMapper.toDto(updatedProject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProjectDto> deleteProject(@PathVariable String id) {
        Project deletedProject = projectService.deleteProject(id);
        return ResponseEntity.ok(ProjectMapper.toDto(deletedProject));
    }
}
