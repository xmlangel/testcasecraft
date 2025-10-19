// src/main/java/com/testcase/testcasemanagement/service/TestExecutionService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
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
    private final JiraIntegrationService jiraIntegrationService;

    @Autowired
    public TestExecutionService(
            TestExecutionRepository testExecutionRepository,
            TestResultRepository testResultRepository,
            TestPlanRepository testPlanRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            JiraIntegrationService jiraIntegrationService
    ) {
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jiraIntegrationService = jiraIntegrationService;
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
        return testExecutionRepository.findByIdWithResults(id).map(this::toDto);
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

    public TestExecutionDto restartTestExecution(String id) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

        // Only allow restarting of completed test executions
        if (!"COMPLETED".equals(entity.getStatus())) {
            throw new IllegalStateException("Only completed test executions can be restarted");
        }

        entity.setStatus("INPROGRESS");
        entity.setEndDate(null); // Clear the end date since we're restarting
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    // 수정된 부분: 항상 새로운 TestResult를 추가
    public TestExecutionDto updateTestResult(String executionId, TestResultDto resultDto) {
        TestExecution entity = testExecutionRepository.findByIdWithResults(executionId)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

        List<TestResult> results = entity.getResults() != null ? entity.getResults() : new ArrayList<>();
        User currentUser = getCurrentUser();

        // ICT-184: JIRA 이슈 키 존재 여부 검증 (JIRA 설정이 있을 때만)
        if (resultDto.getJiraIssueKey() != null && !resultDto.getJiraIssueKey().trim().isEmpty()) {
            String jiraIssueKey = resultDto.getJiraIssueKey().trim();
            
            try {
                JiraConfigDto.IssueExistsDto validationResult = jiraIntegrationService.checkJiraIssueExists(currentUser.getUsername(), jiraIssueKey);
                
                // JIRA 설정이 없는 경우는 검증을 건너뛰고 계속 진행
                if (validationResult.getErrorMessage() != null && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
                    System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
                } else if (!validationResult.getExists()) {
                    // JIRA 설정은 있지만 이슈가 존재하지 않는 경우만 에러 처리
                    throw new IllegalArgumentException(
                        String.format("존재하지 않는 JIRA 이슈입니다: %s (%s)", 
                            jiraIssueKey, 
                            validationResult.getErrorMessage() != null ? validationResult.getErrorMessage() : "이슈를 찾을 수 없습니다"
                        )
                    );
                }
            } catch (IllegalArgumentException e) {
                // JIRA 검증 실패 시 다시 던지기 (위에서 처리된 경우)
                throw e;
            } catch (Exception e) {
                // 기타 예외의 경우 경고 로그를 남기고 계속 진행 (JIRA 서버 장애 등)
                System.err.println("JIRA 이슈 검증 중 오류 발생: " + e.getMessage() + " (이슈 키: " + jiraIssueKey + ")");
                // 검증 실패를 에러로 처리하지 않고 계속 진행 (서버 장애 시에도 테스트 결과 저장 허용)
            }
        }

        // 항상 새로운 결과를 추가
        TestResult r = new TestResult();
        r.setTestExecution(entity);
        r.setTestCaseId(resultDto.getTestCaseId());
        r.setResult(resultDto.getResult());
        r.setNotes(resultDto.getNotes());
        r.setJiraIssueKey(resultDto.getJiraIssueKey()); // ICT-178: JIRA 이슈 키 설정
        if (resultDto.getTags() != null) {
            r.setTags(new ArrayList<>(resultDto.getTags()));
        }
        r.setExecutedAt(LocalDateTime.now());
        r.setExecutedBy(currentUser);

        results.add(r);

        entity.setResults(results);
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);

        // 저장 후 다시 조회하여 tags를 포함한 모든 데이터를 가져옴
        TestExecution reloaded = testExecutionRepository.findByIdWithResults(saved.getId())
                .orElse(saved);

        return toDto(reloaded);
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
        if (entity.getTags() != null) {
            dto.setTags(new ArrayList<>(entity.getTags()));
        }
        // 결과를 실행일시 역순(최신순)으로 정렬해서 반환
        List<TestResultDto> sortedResults = entity.getResults().stream()
                .sorted((a, b) -> {
                    LocalDateTime dateA = a.getExecutedAt();
                    LocalDateTime dateB = b.getExecutedAt();
                    if (dateA == null && dateB == null) return 0;
                    if (dateA == null) return 1;
                    if (dateB == null) return -1;
                    return dateB.compareTo(dateA); // 내림차순 (최신순)
                })
                .map(this::toDto)
                .collect(Collectors.toList());
        dto.setResults(sortedResults);
        return dto;
    }

    private TestResultDto toDto(TestResult entity) {
        TestResultDto dto = new TestResultDto();
        dto.setId(entity.getId()); // 첨부파일 조회에 필요한 ID 설정
        dto.setTestCaseId(entity.getTestCaseId());
        dto.setResult(entity.getResult());
        dto.setNotes(entity.getNotes());
        dto.setJiraIssueKey(entity.getJiraIssueKey()); // ICT-178: JIRA 이슈 키 설정
        dto.setExecutedAt(entity.getExecutedAt());
        dto.setExecutedBy(entity.getExecutedBy() != null ? entity.getExecutedBy().getUsername() : null);
        dto.setAttachmentCount(entity.getActiveAttachmentCount());

        // tags 초기화 - size()를 호출하여 LAZY 로딩 트리거
        if (entity.getTags() != null) {
            entity.getTags().size(); // LAZY 로딩 강제 초기화
            dto.setTags(new ArrayList<>(entity.getTags()));
        }
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
        if (dto.getTags() != null) {
            entity.setTags(new ArrayList<>(dto.getTags()));
        }

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
        if (dto.getTags() != null) {
            entity.setTags(new ArrayList<>(dto.getTags()));
        }
        // executedBy는 updateTestResult에서만 세팅
        return entity;
    }

    public List<TestExecutionDto> getTestExecutionsByProject(String projectId) {
        return testExecutionRepository.findByProjectId(projectId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 테스트케이스ID로 결과 조회 (최신순 정렬)
    public List<TestResultDto> getTestResultsByTestCaseId(String testCaseId) {
        List<TestResult> results = testResultRepository.findByTestCaseId(testCaseId);
        return results.stream()
                .sorted((a, b) -> {
                    LocalDateTime dateA = a.getExecutedAt();
                    LocalDateTime dateB = b.getExecutedAt();
                    if (dateA == null && dateB == null) return 0;
                    if (dateA == null) return 1;
                    if (dateB == null) return -1;
                    return dateB.compareTo(dateA); // 내림차순 (최신순)
                })
                .map(result -> {
            TestExecution execution = result.getTestExecution();
            TestResultDto dto = new TestResultDto();
            dto.setId(result.getId()); // 첨부파일 조회에 필요한 ID 설정
            dto.setResult(result.getResult());
            dto.setTestCaseId(result.getTestCaseId());
            dto.setNotes(result.getNotes());
            dto.setJiraIssueKey(result.getJiraIssueKey()); // ICT-178: JIRA 이슈 키 설정
            dto.setExecutedBy(result.getExecutedBy() != null ? result.getExecutedBy().getUsername() : null);
            dto.setExecutedAt(result.getExecutedAt());
            // 추가 필드
            dto.setTestExecutionId(execution != null ? execution.getId() : null);
            dto.setTestExecutionName(execution != null ? execution.getName() : null);
            dto.setAttachmentCount(result.getActiveAttachmentCount());
            return dto;
        }).collect(Collectors.toList());
    }
}
