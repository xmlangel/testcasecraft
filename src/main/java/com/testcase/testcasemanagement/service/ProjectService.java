// src/main/java/com/testcase/testcasemanagement/service/ProjectService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private TestCaseRepository testCaseRepository;
    @Autowired
    private TestPlanRepository testPlanRepository;
    @Autowired
    private TestExecutionRepository testExecutionRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    /**
     * 프로젝트 생성 시 테스트케이스 폴더 자동 생성
     * - 생성되는 폴더는 삭제 불가
     */
    public Project saveProject(Project project) {
        if (project.getCode() == null || project.getCode().trim().isEmpty())
            throw new IllegalArgumentException();
        if (projectRepository.existsByCode(project.getCode()))
            throw new DuplicateProjectCodeException(project.getCode());

        Project savedProject = projectRepository.save(project);

        // 프로젝트와 동일한 이름의 폴더 자동 생성 (삭제불가)
        TestCase folder = new TestCase();
        folder.setName(savedProject.getName());
        folder.setType("folder");
        folder.setProject(savedProject);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());
        folder.setDisplayOrder(1);
        // 삭제불가 플래그(설명에 명시)
        folder.setDescription("[SYSTEM] 기본 폴더 - 삭제불가");
        // isDeletable 필드가 있다면 false로 설정 (없으면 생략)
        // folder.setIsDeletable(false);
        testCaseRepository.save(folder);

        return savedProject;
    }

    /**
     * 프로젝트 이름 변경 시 폴더명도 동기화
     */
    public Project updateProject(String id, ProjectDto dto) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        existingProject.setName(dto.getName());
        existingProject.setCode(dto.getCode());
        existingProject.setDescription(dto.getDescription());
        existingProject.setDisplayOrder(dto.getDisplayOrder());

        Project updated = projectRepository.save(existingProject);

        // 프로젝트의 최상위 폴더(삭제불가 폴더) 이름도 같이 변경
        TestCase folder = testCaseRepository.findByProjectIdAndType(updated.getId(), "folder")
                .stream()
                .filter(tc -> "[SYSTEM] 기본 폴더 - 삭제불가".equals(tc.getDescription()))
                .findFirst()
                .orElse(null);
        if (folder != null) {
            folder.setName(updated.getName());
            folder.setUpdatedAt(LocalDateTime.now());
            testCaseRepository.save(folder);
        }
        return updated;
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    /**
     * 프로젝트 삭제
     * - 테스트 플랜이 존재하면 삭제 불가
     * - 테스트 케이스(폴더 제외)가 존재하면 삭제 불가
     * - 테스트 실행이 존재하면 삭제 불가
     */
    public Project deleteProject(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        // 1. 테스트 플랜 존재 여부 체크
        List<TestPlan> plans = testPlanRepository.findByProjectId(id);
        if (!plans.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "프로젝트에 연결된 테스트 플랜이 존재하여 삭제할 수 없습니다.");
        }

        // 2. 테스트 케이스(폴더 제외) 존재 여부 체크
        List<TestCase> testCases = testCaseRepository.findAllByProjectIdWithSteps(id);
        boolean hasTestCase = testCases.stream()
                .anyMatch(tc -> !"folder".equals(tc.getType()));
        if (hasTestCase) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "프로젝트에 테스트 케이스가 존재하여 삭제할 수 없습니다.");
        }

        // 3. 테스트 실행 존재 여부 체크
        List<TestExecution> executions = testExecutionRepository.findByProjectId(id);
        if (!executions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "프로젝트에 테스트 실행 이력이 존재하여 삭제할 수 없습니다.");
        }

        projectRepository.delete(project);
        return project;
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
            super("Project code already exists " + code);
        }
    }
}
