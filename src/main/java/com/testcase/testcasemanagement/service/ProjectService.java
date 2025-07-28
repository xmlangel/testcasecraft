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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

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
     * - 일반 삭제: 테스트 플랜이 존재하면 삭제 불가
     * - 일반 삭제: 테스트 케이스(폴더 제외)가 존재하면 삭제 불가
     * - 일반 삭제: 테스트 실행이 존재하면 삭제 불가
     * - 강제 삭제: 모든 연관 데이터를 함께 삭제
     */
    public Project deleteProject(String id) {
        return deleteProject(id, false);
    }

    /**
     * 프로젝트 삭제 (강제 삭제 옵션 포함)
     * @param id 프로젝트 ID
     * @param force 강제 삭제 여부
     * @return 삭제된 프로젝트
     */
    @Transactional
    public Project deleteProject(String id, boolean force) {
        logger.info("프로젝트 삭제 시작 - ID: {}, 강제삭제: {}", id, force);
        
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        try {
            if (force) {
                logger.info("강제 삭제 시작 - 프로젝트: {}", project.getName());
                
                // 1. 테스트 실행 삭제
                List<TestExecution> executions = testExecutionRepository.findByProjectId(id);
                logger.info("삭제할 테스트 실행 개수: {}", executions.size());
                if (!executions.isEmpty()) {
                    testExecutionRepository.deleteAll(executions);
                    logger.info("테스트 실행 삭제 완료");
                }
                
                // 2. 테스트 플랜 삭제
                List<TestPlan> plans = testPlanRepository.findByProjectId(id);
                logger.info("삭제할 테스트 플랜 개수: {}", plans.size());
                if (!plans.isEmpty()) {
                    testPlanRepository.deleteAll(plans);
                    logger.info("테스트 플랜 삭제 완료");
                }
                
                // 3. 테스트 케이스 삭제
                List<TestCase> testCases = testCaseRepository.findAllByProjectIdWithSteps(id);
                logger.info("삭제할 테스트 케이스 개수: {}", testCases.size());
                if (!testCases.isEmpty()) {
                    testCaseRepository.deleteAll(testCases);
                    logger.info("테스트 케이스 삭제 완료");
                }
                
                // 4. 프로젝트 삭제
                projectRepository.delete(project);
                logger.info("프로젝트 삭제 완료");
                
            } else {
                // 일반 삭제: 제약 조건 체크
                logger.info("일반 삭제 - 제약 조건 체크 시작");
                
                // 1. 테스트 플랜 존재 여부 체크
                List<TestPlan> plans = testPlanRepository.findByProjectId(id);
                if (!plans.isEmpty()) {
                    logger.warn("테스트 플랜이 존재하여 삭제 불가: {} 개", plans.size());
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "프로젝트에 연결된 테스트 플랜이 존재하여 삭제할 수 없습니다.");
                }

                // 2. 테스트 케이스(폴더 제외) 존재 여부 체크
                List<TestCase> testCases = testCaseRepository.findAllByProjectIdWithSteps(id);
                boolean hasTestCase = testCases.stream()
                        .anyMatch(tc -> !"folder".equals(tc.getType()));
                if (hasTestCase) {
                    logger.warn("테스트 케이스가 존재하여 삭제 불가");
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "프로젝트에 테스트 케이스가 존재하여 삭제할 수 없습니다.");
                }

                // 3. 테스트 실행 존재 여부 체크
                List<TestExecution> executions = testExecutionRepository.findByProjectId(id);
                if (!executions.isEmpty()) {
                    logger.warn("테스트 실행이 존재하여 삭제 불가: {} 개", executions.size());
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "프로젝트에 테스트 실행 이력이 존재하여 삭제할 수 없습니다.");
                }

                projectRepository.delete(project);
                logger.info("일반 삭제 완료");
            }

            logger.info("프로젝트 삭제 성공 - ID: {}", id);
            return project;
            
        } catch (Exception e) {
            logger.error("프로젝트 삭제 실패 - ID: {}, 오류: {}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "프로젝트 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
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
