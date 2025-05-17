// src/main/java/com/testcase/testcasemanagement/service/TestExecutionService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
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


    @Autowired
    public TestExecutionService(
            TestExecutionRepository testExecutionRepository,
            TestResultRepository testResultRepository,
            TestPlanRepository testPlanRepository,
            ProjectRepository projectRepository
    ) {
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
    }

    public TestExecutionDto createTestExecution(TestExecutionDto dto) {
        TestExecution entity = toEntity(dto);
        entity.setStatus("NOTSTARTED");
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setResults(new ArrayList<>());

        Project project = projectRepository.findById(dto.getProjectId()) // ← 추가
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

    public TestExecutionDto updateTestResult(String executionId, TestResultDto resultDto) {
        TestExecution entity = testExecutionRepository.findById(executionId)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        List<TestResult> results = entity.getResults() != null ? entity.getResults() : new ArrayList<>();
        Optional<TestResult> existing = results.stream()
                .filter(r -> resultDto.getTestCaseId() != null && resultDto.getTestCaseId().equals(r.getTestCaseId()))
                .findFirst();
        if (existing.isPresent()) {
            TestResult r = existing.get();
            r.setResult(resultDto.getResult());
            r.setNotes(resultDto.getNotes());
            r.setExecutedAt(LocalDateTime.now());
        } else {
            TestResult r = new TestResult();
            r.setTestExecution(entity);
            r.setTestCaseId(resultDto.getTestCaseId());
            r.setResult(resultDto.getResult());
            r.setNotes(resultDto.getNotes());
            r.setExecutedAt(LocalDateTime.now());
            results.add(r);
        }
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
        dto.setProjectId(entity.getProject().getId()); // ← 추가
        dto.setResults(entity.getResults().stream().map(this::toDto).collect(Collectors.toList()));
        return dto;
    }

    private TestResultDto toDto(TestResult entity) {
        TestResultDto dto = new TestResultDto();
        dto.setTestCaseId(entity.getTestCaseId());
        dto.setResult(entity.getResult());
        dto.setNotes(entity.getNotes());
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
        return entity;
    }

    public List<TestExecutionDto> getTestExecutionsByProject(String projectId) {
        // 기존 복잡한 계층 조회 로직 제거
        return testExecutionRepository.findByProjectId(projectId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
