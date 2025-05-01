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
        return projectRepository.save(project);
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project updateProject(String id, Project project) {
        project.setId(id);
        return projectRepository.save(project);
    }

    // 예외 처리 전문화
    @ResponseStatus(HttpStatus.NOT_FOUND)
    class ProjectNotFoundException extends RuntimeException {
        public ProjectNotFoundException(String id) {
            super("Could not find project " + id);
        }
    }

    // 서비스 계층 수정
    public Project deleteProject(String id) {
        return projectRepository.findById(id)
                .map(project -> {
                    projectRepository.delete(project);
                    return project;
                })
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }
}
