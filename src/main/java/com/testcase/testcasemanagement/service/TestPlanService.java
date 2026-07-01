// src/main/java/com/testcase/testcasemanagement/service/TestPlanService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestPlanDto;
import com.testcase.testcasemanagement.mapper.TestPlanMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class TestPlanService {

  private final TestPlanRepository testPlanRepository;
  private final TestPlanMapper testPlanMapper;
  private final ProjectSecurityService projectSecurityService;

  @Autowired
  public TestPlanService(
      TestPlanRepository testPlanRepository,
      TestPlanMapper testPlanMapper,
      ProjectSecurityService projectSecurityService) {
    this.testPlanRepository = testPlanRepository;
    this.testPlanMapper = testPlanMapper;
    this.projectSecurityService = projectSecurityService;
  }

  @Autowired private ProjectRepository projectRepository;

  public TestPlan createTestPlan(TestPlanDto dto) {
    // 프로젝트 편집 권한 검사
    if (!projectSecurityService.canEditProject(dto.getProjectId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + dto.getProjectId());
    }

    // 프로젝트 존재 여부 체크
    Project project =
        projectRepository
            .findById(dto.getProjectId())
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
    // 프로젝트 편집 권한 검사
    if (dto.getProjectId() != null) {
      if (!projectSecurityService.canEditProject(dto.getProjectId())) {
        throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + dto.getProjectId());
      }
    }

    return testPlanRepository
        .findById(id)
        .map(
            existingPlan -> {
              existingPlan.setName(dto.getName());
              existingPlan.setDescription(dto.getDescription());
              existingPlan.setTestCaseIds(dto.getTestCaseIds());

              // 프로젝트 변경이 있는 경우만 업데이트
              if (dto.getProjectId() != null
                  && !dto.getProjectId().equals(existingPlan.getProject().getId())) {
                Project project =
                    projectRepository
                        .findById(dto.getProjectId())
                        .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));
                existingPlan.setProject(project);
              }

              return testPlanRepository.save(existingPlan);
            })
        .orElseThrow(() -> new RuntimeException("TestPlan not found with id: " + id));
  }

  public void deleteTestPlan(String id) {
    // 프로젝트 편집 권한 검사
    TestPlan testPlan =
        testPlanRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("TestPlan not found with id: " + id));
    if (!projectSecurityService.canEditProject(testPlan.getProject().getId())) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + testPlan.getProject().getId());
    }

    testPlanRepository.deleteById(id);
  }

  public Optional<TestPlan> getTestPlanById(String id) {
    Optional<TestPlan> testPlan = testPlanRepository.findById(id);
    testPlan.ifPresent(
        plan -> {
          if (!projectSecurityService.canAccessProject(plan.getProject().getId())) {
            throw new AccessDeniedException("프로젝트 접근 권한이 없습니다: " + plan.getProject().getId());
          }
        });
    return testPlan;
  }

  public List<TestPlan> getTestPlansByProject(String projectId) {
    if (!projectSecurityService.canAccessProject(projectId)) {
      throw new AccessDeniedException("프로젝트 접근 권한이 없습니다: " + projectId);
    }
    return testPlanRepository.findByProjectId(projectId);
  }
}
