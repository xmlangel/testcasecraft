// src/main/java/com/testcase/testcasemanagement/service/TestPlanService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestPlanDto;
import com.testcase.testcasemanagement.mapper.TestPlanMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TestPlanService {

    private final TestPlanRepository testPlanRepository;
    private final TestPlanMapper testPlanMapper;

    @Autowired
    public TestPlanService(TestPlanRepository testPlanRepository, TestPlanMapper testPlanMapper) {
        this.testPlanRepository = testPlanRepository;
        this.testPlanMapper = testPlanMapper;
    }

    @Autowired
    private ProjectRepository projectRepository;

    public TestPlan createTestPlan(TestPlanDto dto) {
        // 프로젝트 존재 여부 체크
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

        // DTO -> Entity 변환
        TestPlan testPlan = new TestPlan();
        testPlan.setName(dto.getName());
        testPlan.setDescription(dto.getDescription());
        testPlan.setTestCaseIds(dto.getTestCaseIds());
        testPlan.setProject(project); // 프로젝트 엔티티 설정

        return testPlanRepository.save(testPlan);
    }

    public TestPlan updateTestPlan(String id, TestPlanDto dto) {
        return testPlanRepository.findById(id)
                .map(existingPlan -> {
                    existingPlan.setName(dto.getName());
                    existingPlan.setDescription(dto.getDescription());
                    existingPlan.setTestCaseIds(dto.getTestCaseIds());

                    // 프로젝트 변경이 있는 경우만 업데이트
                    if (dto.getProjectId() != null && !dto.getProjectId().equals(existingPlan.getProject().getId())) {
                        Project project = projectRepository.findById(dto.getProjectId())
                                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));
                        existingPlan.setProject(project);
                    }

                    return testPlanRepository.save(existingPlan);
                })
                .orElseThrow(() -> new RuntimeException("TestPlan not found with id: " + id));
    }

    public void deleteTestPlan(String id) {
        testPlanRepository.deleteById(id);
    }

    public Optional<TestPlan> getTestPlanById(String id) {
        return testPlanRepository.findById(id);
    }

    public List<TestPlan> getTestPlansByProject(String projectId) {
        return testPlanRepository.findByProjectId(projectId);
    }
}
