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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Slf4j
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
      throw new AccessDeniedException("No permission to edit project: " + dto.getProjectId());
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
    TestPlan existingPlan =
        testPlanRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("TestPlan not found with id: " + id));

    // ICT-446: 요청 값이 아니라 DB 에 저장된 플랜의 프로젝트로 편집 권한을 검사한다.
    String storedProjectId = existingPlan.getProject().getId();
    if (!projectSecurityService.canEditProject(storedProjectId)) {
      throw new AccessDeniedException("No permission to edit project: " + storedProjectId);
    }

    // 수정으로는 플랜의 프로젝트를 바꾸지 않는다. 요청의 projectId 가 달라도 무시한다.
    if (dto.getProjectId() != null && !dto.getProjectId().equals(storedProjectId)) {
      log.warn(
          "updateTestPlan: 요청 projectId({})가 저장된 값({})과 달라 무시합니다. planId={}",
          dto.getProjectId(),
          storedProjectId,
          id);
    }

    existingPlan.setName(dto.getName());
    existingPlan.setDescription(dto.getDescription());
    existingPlan.setTestCaseIds(dto.getTestCaseIds());

    return testPlanRepository.save(existingPlan);
  }

  public void deleteTestPlan(String id) {
    // 프로젝트 편집 권한 검사
    TestPlan testPlan =
        testPlanRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("TestPlan not found with id: " + id));
    if (!projectSecurityService.canEditProject(testPlan.getProject().getId())) {
      throw new AccessDeniedException(
          "No permission to edit project: " + testPlan.getProject().getId());
    }

    testPlanRepository.deleteById(id);
  }

  public Optional<TestPlan> getTestPlanById(String id) {
    Optional<TestPlan> testPlan = testPlanRepository.findById(id);
    testPlan.ifPresent(
        plan -> {
          if (!projectSecurityService.canAccessProject(plan.getProject().getId())) {
            throw new AccessDeniedException(
                "No permission to access project: " + plan.getProject().getId());
          }
        });
    return testPlan;
  }

  public List<TestPlan> getTestPlansByProject(String projectId) {
    if (!projectSecurityService.canAccessProject(projectId)) {
      throw new AccessDeniedException("No permission to access project: " + projectId);
    }
    return testPlanRepository.findByProjectId(projectId);
  }
}
