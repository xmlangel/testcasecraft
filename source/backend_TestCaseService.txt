package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;

    // 1. ProjectRepository 주입 추가
    @Autowired
    private ProjectRepository projectRepository;

    public TestCaseService(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    public List<TestCase> getAllTestCases() {
        return testCaseRepository.findAllWithSteps();
    }

    public List<TestCase> getTestCasesByParentId(String parentId) {
        return testCaseRepository.findByParentId(parentId);
    }

    public TestCase saveTestCase(TestCaseDto testCaseDto) {
        Map<String, String> errors = new HashMap<>();

        // 필수 필드 검증
        if (testCaseDto.getName() == null || testCaseDto.getName().trim().isEmpty()) {
            errors.put("name", "Name is required");
        }

        // 프로젝트 존재 여부 검증
        if (testCaseDto.getProjectId() == null || testCaseDto.getProjectId().isEmpty()) {
            errors.put("projectId", "Project ID is required");
        }
        Project project = projectRepository.findById(testCaseDto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

        if (testCaseDto.getParentId() != null && !testCaseDto.getParentId().isEmpty()) {
            testCaseRepository.findById(testCaseDto.getParentId())
                    .ifPresentOrElse(
                            parent -> {
                                if (!"folder".equals(parent.getType())) {
                                    errors.put("parentId", "Parent must be a folder");
                                }
                            },
                            () -> errors.put("parentId", "Parent folder not found")
                    );
        }

        if (!errors.isEmpty()) {
            throw new ResourceNotValidException("Validation failed", errors);
        }

        TestCase entity = TestCaseMapper.toEntity(testCaseDto);
        entity.setProject(project);

        if (entity.getId() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        return testCaseRepository.save(entity);
    }


    public TestCase findById(String id) {
        return testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("테스트케이스를 찾을 수 없습니다: " + id));
    }

    @Transactional // 트랜잭션 추가
    public void deleteTestCase(String id) {
        List<TestCase> children = testCaseRepository.findByParentId(id);
        if (!children.isEmpty()) {
            children.forEach(child -> deleteTestCase(child.getId()));
        }
        testCaseRepository.deleteById(id);
    }

    public Optional<TestCase> getTestCaseById(String id) {
        return testCaseRepository.findById(id);
    }

    public List<TestCase> getTestCasesByProjectId(String projectId) {
        return testCaseRepository.findAllByProjectIdWithHierarchy(projectId);
    }
}
