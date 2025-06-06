// src/main/java/com/testcase/testcasemanagement/service/TestExecutionService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestExecutionService {

    private final TestExecutionRepository testExecutionRepository;
    private final TestResultRepository testResultRepository;
    private final TestPlanRepository testPlanRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Autowired
    public TestExecutionService(
            TestExecutionRepository testExecutionRepository,
            TestResultRepository testResultRepository,
            TestPlanRepository testPlanRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public TestExecutionDto createTestExecution(TestExecutionDto dto) {
        TestExecution entity = toEntity(dto);
        entity.setStatus("NOTSTARTED");
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setResults(new ArrayList<>());

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Project ID"));
        entity.setProject(project);

        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    public List<TestExecutionDto> getTestExecutions(String testPlanId) {
        List<TestExecution> executions;
        if (testPlanId != null) {
            executions = testExecutionRepository.findByTestPlanId(testPlanId);
        } else {
            executions = testExecutionRepository.findAll();
        }
        return executions.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<TestExecutionDto> getTestExecutionById(String id) {
        return testExecutionRepository.findById(id).map(this::toDto);
    }

    public TestExecutionDto updateTestExecution(String id, TestExecutionDto dto) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    public void deleteTestExecution(String id) {
        testExecutionRepository.deleteById(id);
    }

    public TestExecutionDto startTestExecution(String id) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        entity.setStatus("INPROGRESS");
        entity.setStartDate(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    public TestExecutionDto completeTestExecution(String id) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        entity.setStatus("COMPLETED");
        entity.setEndDate(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    // 수정된 부분: 항상 새로운 TestResult를 추가
    public TestExecutionDto updateTestResult(String executionId, TestResultDto resultDto) {
        TestExecution entity = testExecutionRepository.findById(executionId)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

        List<TestResult> results = entity.getResults() != null ? entity.getResults() : new ArrayList<>();
        User currentUser = getCurrentUser();

        // 항상 새로운 결과를 추가
        TestResult r = new TestResult();
        r.setTestExecution(entity);
        r.setTestCaseId(resultDto.getTestCaseId());
        r.setResult(resultDto.getResult());
        r.setNotes(resultDto.getNotes());
        r.setExecutedAt(LocalDateTime.now());
        r.setExecutedBy(currentUser);

        results.add(r);

        entity.setResults(results);
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    // Entity <-> DTO 변환 메서드
    private TestExecutionDto toDto(TestExecution entity) {
        TestExecutionDto dto = new TestExecutionDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setTestPlanId(entity.getTestPlanId());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setProjectId(entity.getProject().getId());
        dto.setResults(entity.getResults().stream().map(this::toDto).collect(Collectors.toList()));
        return dto;
    }

    private TestResultDto toDto(TestResult entity) {
        TestResultDto dto = new TestResultDto();
        dto.setTestCaseId(entity.getTestCaseId());
        dto.setResult(entity.getResult());
        dto.setNotes(entity.getNotes());
        dto.setExecutedAt(entity.getExecutedAt());
        dto.setExecutedBy(entity.getExecutedBy() != null ? entity.getExecutedBy().getUsername() : null);
        return dto;
    }

    private TestExecution toEntity(TestExecutionDto dto) {
        TestExecution entity = new TestExecution();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setTestPlanId(dto.getTestPlanId());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        dto.setProjectId(dto.getProjectId());

        if (dto.getResults() != null) {
            entity.setResults(dto.getResults().stream().map(this::toEntity).collect(Collectors.toList()));
        }
        return entity;
    }

    private TestResult toEntity(TestResultDto dto) {
        TestResult entity = new TestResult();
        entity.setTestCaseId(dto.getTestCaseId());
        entity.setResult(dto.getResult());
        entity.setNotes(dto.getNotes());
        entity.setExecutedAt(dto.getExecutedAt());
        // executedBy는 updateTestResult에서만 세팅
        return entity;
    }

    public List<TestExecutionDto> getTestExecutionsByProject(String projectId) {
        return testExecutionRepository.findByProjectId(projectId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 테스트케이스ID로 결과 조회
    public List<TestResultDto> getTestResultsByTestCaseId(String testCaseId) {
        List<TestResult> results = testResultRepository.findByTestCaseId(testCaseId);
        return results.stream().map(result -> {
            TestExecution execution = result.getTestExecution();
            TestResultDto dto = new TestResultDto();
            dto.setResult(result.getResult());
            dto.setTestCaseId(result.getTestCaseId());
            dto.setNotes(result.getNotes());
            dto.setExecutedBy(result.getExecutedBy() != null ? result.getExecutedBy().getUsername() : null);
            dto.setExecutedAt(result.getExecutedAt());
            // 추가 필드
            dto.setTestExecutionId(execution != null ? execution.getId() : null);
            dto.setTestExecutionName(execution != null ? execution.getName() : null);
            return dto;
        }).collect(Collectors.toList());
    }
}
