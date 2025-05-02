// src/main/java/com/testcase/testcasemanagement/service/ProjectService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project saveProject(Project project) {
        // 코드 필드 유효성 검사
        if (project.getCode() == null || project.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("프로젝트 코드는 필수입니다");
        }

        // 코드 중복 체크
        if (projectRepository.existsByCode(project.getCode())) {
            throw new DuplicateProjectCodeException(project.getCode());
        }
        return projectRepository.save(project);
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project updateProject(String id, Project project) {
        // 프로젝트 코드 중복 체크 (자기 자신 제외)
        Optional<Project> existing = projectRepository.findByCode(project.getCode());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new DuplicateProjectCodeException(project.getCode());
        }
        project.setId(id);
        return projectRepository.save(project);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    static class ProjectNotFoundException extends RuntimeException {
        public ProjectNotFoundException(String id) {
            super("Could not find project " + id);
        }
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class DuplicateProjectCodeException extends RuntimeException {
        public DuplicateProjectCodeException(String code) {
            super("Project code already exists: " + code);
        }
    }

    public Project deleteProject(String id) {
        return projectRepository.findById(id)
                .map(project -> {
                    projectRepository.delete(project);
                    return project;
                })
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }
}
