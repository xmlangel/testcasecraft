// src/main/java/com/testcase/testcasemanagement/service/TestExecutionService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.dto.TestExecutionDto;
import com.testcase.testcasemanagement.dto.TestResultDto;
import com.testcase.testcasemanagement.dto.BulkTestResultDto;
import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final TestCaseRepository testCaseRepository;

    @Autowired
    public TestExecutionService(
            TestExecutionRepository testExecutionRepository,
            TestResultRepository testResultRepository,
            TestPlanRepository testPlanRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            JiraIntegrationService jiraIntegrationService,
            TestCaseRepository testCaseRepository) {
        this.testExecutionRepository = testExecutionRepository;
        this.testResultRepository = testResultRepository;
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.jiraIntegrationService = jiraIntegrationService;
        this.testCaseRepository = testCaseRepository;
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

    @Transactional(readOnly = true)
    public List<TestExecutionDto> getTestExecutions(String testPlanId) {
        List<TestExecution> executions;
        if (testPlanId != null) {
            executions = testExecutionRepository.findByTestPlanId(testPlanId);
        } else {
            executions = testExecutionRepository.findAll();
        }
        return executions.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<TestExecutionDto> getTestExecutionById(String id) {
        return testExecutionRepository.findByIdWithResults(id).map(entity -> toDto(entity, true));
    }

    @Transactional
    public TestExecutionDto updateTestExecution(String id, TestExecutionDto dto) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        if (dto.getTags() != null) {
            entity.setTags(new java.util.LinkedHashSet<>(dto.getTags()));
        }
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    public void deleteTestExecution(String id) {
        testExecutionRepository.deleteById(id);
    }

    @Transactional
    public TestExecutionDto startTestExecution(String id) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        entity.setStatus("INPROGRESS");
        entity.setStartDate(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public TestExecutionDto completeTestExecution(String id) {
        TestExecution entity = testExecutionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));
        entity.setStatus("COMPLETED");
        entity.setEndDate(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        TestExecution saved = testExecutionRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
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
    @Transactional
    public TestExecutionDto updateTestResult(String executionId, TestResultDto resultDto) {
        TestExecution entity = testExecutionRepository.findByIdWithResults(executionId)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

        List<TestResult> results = entity.getResults() != null ? entity.getResults() : new ArrayList<>();
        User currentUser = getCurrentUser();

        // ICT-184: JIRA 이슈 키 존재 여부 검증 (JIRA 설정이 있을 때만)
        if (resultDto.getJiraIssueKey() != null && !resultDto.getJiraIssueKey().trim().isEmpty()) {
            String jiraIssueKey = resultDto.getJiraIssueKey().trim();

            try {
                JiraConfigDto.IssueExistsDto validationResult = jiraIntegrationService
                        .checkJiraIssueExists(currentUser.getUsername(), jiraIssueKey);

                // JIRA 설정이 없는 경우는 검증을 건너뛰고 계속 진행
                if (validationResult.getErrorMessage() != null
                        && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
                    System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
                } else if (!validationResult.getExists()) {
                    // JIRA 설정은 있지만 이슈가 존재하지 않는 경우만 에러 처리
                    throw new IllegalArgumentException(
                            String.format("존재하지 않는 JIRA 이슈입니다: %s (%s)",
                                    jiraIssueKey,
                                    validationResult.getErrorMessage() != null ? validationResult.getErrorMessage()
                                            : "이슈를 찾을 수 없습니다"));
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

        // ICT-341: displayId 지원 (testCaseId가 없을 경우)
        String testCaseId = resultDto.getTestCaseId();
        if ((testCaseId == null || testCaseId.trim().isEmpty())
                && (resultDto.getDisplayId() != null && !resultDto.getDisplayId().trim().isEmpty())) {
            testCaseId = testCaseRepository.findByProjectIdAndDisplayId(entity.getProject().getId(), resultDto.getDisplayId())
                    .map(TestCase::getId)
                    .orElseThrow(() -> new IllegalArgumentException("DisplayID를 찾을 수 없습니다: " + resultDto.getDisplayId()));
        }

        if (testCaseId == null || testCaseId.trim().isEmpty()) {
            throw new IllegalArgumentException("testCaseId 또는 displayId가 필요합니다.");
        }

        // 항상 새로운 결과를 추가
        TestResult r = new TestResult();
        r.setTestExecution(entity);
        r.setTestCaseId(testCaseId);
        r.setResult(resultDto.getResult());
        r.setNotes(resultDto.getNotes());

        r.setJiraIssueKey(resultDto.getJiraIssueKey()); // ICT-178: JIRA 이슈 키 설정
        if (resultDto.getTags() != null) {
            r.setTags(new java.util.LinkedHashSet<>(resultDto.getTags()));
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

    /**
     * 일괄 테스트 결과 업데이트
     * 여러 테스트케이스에 대해 동일한 결과를 한 번에 저장
     */
    @Transactional
    public TestExecutionDto updateTestResultsBulk(String executionId, BulkTestResultDto bulkDto) {
        TestExecution entity = testExecutionRepository.findByIdWithResults(executionId)
                .orElseThrow(() -> new NoSuchElementException("TestExecution not found"));

        List<TestResult> results = entity.getResults() != null ? entity.getResults() : new ArrayList<>();
        User currentUser = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();

        // JIRA 이슈 키 검증 (한 번만)
        if (bulkDto.getJiraIssueKey() != null && !bulkDto.getJiraIssueKey().trim().isEmpty()) {
            String jiraIssueKey = bulkDto.getJiraIssueKey().trim();

            try {
                JiraConfigDto.IssueExistsDto validationResult = jiraIntegrationService
                        .checkJiraIssueExists(currentUser.getUsername(), jiraIssueKey);

                if (validationResult.getErrorMessage() != null
                        && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
                    System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
                } else if (!validationResult.getExists()) {
                    throw new IllegalArgumentException(
                            String.format("존재하지 않는 JIRA 이슈입니다: %s (%s)",
                                    jiraIssueKey,
                                    validationResult.getErrorMessage() != null ? validationResult.getErrorMessage()
                                            : "이슈를 찾을 수 없습니다"));
                }
            } catch (IllegalArgumentException e) {
                throw e;
            } catch (Exception e) {
                System.err.println("JIRA 이슈 검증 중 오류 발생: " + e.getMessage() + " (이슈 키: " + jiraIssueKey + ")");
            }
        }

        // 각 테스트케이스에 대해 결과 생성
        Set<String> finalTestCaseIds = new LinkedHashSet<>();
        
        // 1. 기존 UUID 기반 ID 추가
        if (bulkDto.getTestCaseIds() != null) {
            finalTestCaseIds.addAll(bulkDto.getTestCaseIds());
        }
        
        // 2. DisplayID 기반 ID 추가
        if (bulkDto.getDisplayIds() != null && !bulkDto.getDisplayIds().isEmpty()) {
            for (String displayId : bulkDto.getDisplayIds()) {
                if (displayId != null && !displayId.trim().isEmpty()) {
                    String caseId = testCaseRepository.findByProjectIdAndDisplayId(entity.getProject().getId(), displayId)
                            .map(TestCase::getId)
                            .orElseThrow(() -> new IllegalArgumentException("DisplayID를 찾을 수 없습니다: " + displayId));
                    finalTestCaseIds.add(caseId);
                }
            }
        }

        if (finalTestCaseIds.isEmpty()) {
            throw new IllegalArgumentException("결과를 입력할 테스트케이스 ID 또는 DisplayID가 없습니다.");
        }

        for (String testCaseId : finalTestCaseIds) {
            TestResult r = new TestResult();
            r.setTestExecution(entity);
            r.setTestCaseId(testCaseId);
            r.setResult(bulkDto.getResult());
            r.setNotes(bulkDto.getNotes());
            r.setJiraIssueKey(bulkDto.getJiraIssueKey());
            if (bulkDto.getTags() != null) {
                r.setTags(new java.util.LinkedHashSet<>(bulkDto.getTags()));
            }
            r.setExecutedAt(now);
            r.setExecutedBy(currentUser);

            results.add(r);
        }


        entity.setResults(results);
        entity.setUpdatedAt(now);
        TestExecution saved = testExecutionRepository.save(entity);

        // 저장 후 다시 조회
        TestExecution reloaded = testExecutionRepository.findByIdWithResults(saved.getId())
                .orElse(saved);

        return toDto(reloaded);
    }

    // Entity <-> DTO 변환 메서드 (기본값: 결과 상세 포함)
    private TestExecutionDto toDto(TestExecution entity) {
        return toDto(entity, true);
    }

    // Entity <-> DTO 변환 메서드 (결과 상세 포함 여부 선택 가능)
    private TestExecutionDto toDto(TestExecution entity, boolean includeResults) {
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

        // 요약 통계 계산 및 결과 정렬
        List<TestResult> entityResults = entity.getResults();
        if (entityResults == null) {
            entityResults = new ArrayList<>();
        }

        // 1. 실행일시 역순(최신순)으로 정렬
        List<TestResult> sortedEntityResults = entityResults.stream()
                .sorted((a, b) -> {
                    LocalDateTime dateA = a.getExecutedAt();
                    LocalDateTime dateB = b.getExecutedAt();
                    if (dateA == null && dateB == null) return 0;
                    if (dateA == null) return 1;
                    if (dateB == null) return -1;
                    return dateB.compareTo(dateA);
                })
                .collect(Collectors.toList());

        // 2. 요약 통계 계산 (TestPlan의 TestCase 목록 기준)
        TestPlan testPlan = null;
        if (entity.getTestPlanId() != null) {
            testPlan = testPlanRepository.findById(entity.getTestPlanId()).orElse(null);
        }

        if (testPlan != null && testPlan.getTestCaseIds() != null) {
            List<String> planCaseIds = testPlan.getTestCaseIds();
            int total = planCaseIds.size();
            int passed = 0;
            int failed = 0;
            int completed = 0;

            // 각 테스트케이스별 최신 결과 확인
            Map<String, TestResult> latestResultsMap = new HashMap<>();
            for (TestResult r : sortedEntityResults) {
                if (!latestResultsMap.containsKey(r.getTestCaseId())) {
                    latestResultsMap.put(r.getTestCaseId(), r);
                }
            }

            for (String caseId : planCaseIds) {
                TestResult latest = latestResultsMap.get(caseId);
                if (latest != null && latest.getResult() != null) {
                    String resultStatus = latest.getResult();
                    if (!"NOTRUN".equalsIgnoreCase(resultStatus)) {
                        completed++;
                        if ("PASS".equalsIgnoreCase(resultStatus)) {
                            passed++;
                        } else if ("FAIL".equalsIgnoreCase(resultStatus)) {
                            failed++;
                        }
                    }
                }
            }

            dto.setTotalCount(total);
            dto.setPassedCount(passed);
            dto.setFailedCount(failed);
            dto.setProgress(total > 0 ? (completed * 100 / total) : 0);
        } else {
            dto.setTotalCount(0);
            dto.setPassedCount(0);
            dto.setFailedCount(0);
            dto.setProgress(0);
        }

        // 3. 결과 리스트 설정 (요청된 경우만)
        if (includeResults) {
            List<TestResultDto> resultDtos = sortedEntityResults.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            dto.setResults(resultDtos);
        } else {
            dto.setResults(null); 
        }

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
            entity.setTags(new java.util.LinkedHashSet<>(dto.getTags()));
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
            entity.setTags(new java.util.LinkedHashSet<>(dto.getTags()));
        }
        // executedBy는 updateTestResult에서만 세팅
        return entity;
    }

    @Transactional(readOnly = true)
    public List<TestExecutionDto> getTestExecutionsByProject(String projectId, String name) {
        return getTestExecutionsByProject(projectId, name, Pageable.unpaged()).getContent();
    }

    @Transactional(readOnly = true)
    public Page<TestExecutionDto> getTestExecutionsByProject(String projectId, String name, Pageable pageable) {
        // 1. 실행 목록 페이징 조회 (results fetch 제거로 매우 빨라짐)
        org.springframework.data.domain.Page<TestExecution> executionPage;
        if (name != null && !name.trim().isEmpty()) {
            executionPage = testExecutionRepository.findPageByProjectIdAndNameContainingIgnoreCase(projectId, name.trim(), pageable);
        } else {
            executionPage = testExecutionRepository.findPageByProjectId(projectId, pageable);
        }

        if (executionPage.isEmpty()) {
            return org.springframework.data.domain.Page.empty(pageable);
        }

        List<TestExecution> executions = executionPage.getContent();

        // 2. 필요한 데이터 일괄 조회를 위한 ID 수집
        List<String> executionIds = executions.stream().map(TestExecution::getId).collect(Collectors.toList());
        List<String> testPlanIds = executions.stream()
                .map(TestExecution::getTestPlanId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // 3. TestPlan 정보 벌크 로드
        Map<String, TestPlan> testPlanMap = new HashMap<>();
        if (!testPlanIds.isEmpty()) {
            List<TestPlan> plans = testPlanRepository.findAllById(testPlanIds);
            plans.forEach(p -> testPlanMap.put(p.getId(), p));
        }

        // 4. 결과 집계 정보 벌크 로드 (Native Query 사용)
        List<Map<String, Object>> summaryData = testResultRepository.findSummaryByExecutionIds(executionIds);
        Map<String, Map<String, Long>> executionSummaryMap = new HashMap<>();
        
        for (Map<String, Object> row : summaryData) {
            String execId = (String) row.get("test_execution_id");
            String status = (String) row.get("result");
            Long count = ((Number) row.get("count")).longValue();
            
            executionSummaryMap.computeIfAbsent(execId, k -> new HashMap<>()).put(status, count);
        }

        // 5. DTO 변환 및 Page 생성
        List<TestExecutionDto> dtos = executions.stream()
                .map(entity -> {
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

                    // 집계 데이터 설정
                    TestPlan plan = testPlanMap.get(entity.getTestPlanId());
                    Map<String, Long> counts = executionSummaryMap.getOrDefault(entity.getId(), Collections.emptyMap());
                    
                    if (plan != null && plan.getTestCaseIds() != null) {
                        int total = plan.getTestCaseIds().size();
                        long passed = counts.getOrDefault("PASS", 0L);
                        long failed = counts.getOrDefault("FAIL", 0L);
                        long blocked = counts.getOrDefault("BLOCKED", 0L);
                        long completed = passed + failed + blocked;
                        
                        dto.setTotalCount(total);
                        dto.setPassedCount((int) passed);
                        dto.setFailedCount((int) failed);
                        dto.setSkippedCount((int) blocked);
                        dto.setProgress(total > 0 ? (int)(completed * 100 / total) : 0);
                    } else {
                        dto.setTotalCount(0);
                        dto.setPassedCount(0);
                        dto.setFailedCount(0);
                        dto.setSkippedCount(0);
                        dto.setProgress(0);
                    }
                    
                    dto.setResults(null); 
                    return dto;
                })
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, executionPage.getTotalElements());
    }

    // 테스트케이스ID로 결과 조회 (최신순 정렬)
    public List<TestResultDto> getTestResultsByTestCaseId(String testCaseId) {
        List<TestResult> results = testResultRepository.findByTestCaseId(testCaseId);
        return results.stream()
                .sorted((a, b) -> {
                    LocalDateTime dateA = a.getExecutedAt();
                    LocalDateTime dateB = b.getExecutedAt();
                    if (dateA == null && dateB == null)
                        return 0;
                    if (dateA == null)
                        return 1;
                    if (dateB == null)
                        return -1;
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

    /**
     * 이전 테스트 결과 수정 (PreviousResultsDialog용)
     * 권한 체크: 실행한 본인 OR ADMIN OR MANAGER
     * 
     * @param resultId        수정할 테스트 결과 ID
     * @param resultDto       수정할 데이터
     * @param currentUsername 현재 사용자 username
     * @return 수정된 TestResultDto
     * @throws SecurityException        권한이 없는 경우
     * @throws IllegalArgumentException 결과를 찾을 수 없는 경우
     */
    public TestResultDto updatePreviousTestResult(String resultId, TestResultDto resultDto, String currentUsername) {
        // 1. 기존 TestResult 조회
        TestResult existingResult = testResultRepository.findById(resultId)
                .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + resultId));

        // 2. 현재 사용자 조회
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + currentUsername));

        // 3. 권한 확인: 실행한 본인 OR ADMIN OR MANAGER
        boolean isOwner = existingResult.getExecutedBy() != null
                && existingResult.getExecutedBy().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isManager = "MANAGER".equals(currentUser.getRole());

        if (!isOwner && !isAdmin && !isManager) {
            throw new SecurityException(
                    String.format("권한이 없습니다. (사용자: %s, 역할: %s, 소유자: %s)",
                            currentUsername,
                            currentUser.getRole(),
                            existingResult.getExecutedBy() != null ? existingResult.getExecutedBy().getUsername()
                                    : "unknown"));
        }

        // 4. JIRA 이슈 키 검증 (변경된 경우에만)
        if (resultDto.getJiraIssueKey() != null && !resultDto.getJiraIssueKey().trim().isEmpty()) {
            String jiraIssueKey = resultDto.getJiraIssueKey().trim();
            // 기존 값과 다를 때만 검증
            if (!jiraIssueKey.equals(existingResult.getJiraIssueKey())) {
                try {
                    JiraConfigDto.IssueExistsDto validationResult = jiraIntegrationService
                            .checkJiraIssueExists(currentUsername, jiraIssueKey);

                    if (validationResult.getErrorMessage() != null
                            && validationResult.getErrorMessage().contains("JIRA 설정이 필요합니다")) {
                        System.out.println("JIRA 설정이 없어 이슈 검증을 건너뜁니다: " + jiraIssueKey);
                    } else if (!validationResult.getExists()) {
                        throw new IllegalArgumentException(
                                String.format("존재하지 않는 JIRA 이슈입니다: %s (%s)",
                                        jiraIssueKey,
                                        validationResult.getErrorMessage() != null ? validationResult.getErrorMessage()
                                                : "이슈를 찾을 수 없습니다"));
                    }
                } catch (IllegalArgumentException e) {
                    throw e;
                } catch (Exception e) {
                    System.err.println("JIRA 이슈 검증 중 오류 발생: " + e.getMessage() + " (이슈 키: " + jiraIssueKey + ")");
                }
            }
        }

        // 5. TestResult 업데이트
        existingResult.setResult(resultDto.getResult());
        existingResult.setNotes(resultDto.getNotes());
        existingResult.setJiraIssueKey(resultDto.getJiraIssueKey());

        if (resultDto.getTags() != null) {
            existingResult.setTags(new java.util.LinkedHashSet<>(resultDto.getTags()));
        }

        // 6. 저장
        TestResult updatedResult = testResultRepository.save(existingResult);

        // 7. DTO로 변환하여 반환
        TestResultDto responseDto = new TestResultDto();
        responseDto.setId(updatedResult.getId());
        responseDto.setResult(updatedResult.getResult());
        responseDto.setTestCaseId(updatedResult.getTestCaseId());
        responseDto.setNotes(updatedResult.getNotes());
        responseDto.setJiraIssueKey(updatedResult.getJiraIssueKey());
        responseDto.setExecutedBy(
                updatedResult.getExecutedBy() != null ? updatedResult.getExecutedBy().getUsername() : null);
        responseDto.setExecutedAt(updatedResult.getExecutedAt());
        responseDto.setTestExecutionId(
                updatedResult.getTestExecution() != null ? updatedResult.getTestExecution().getId() : null);
        responseDto.setTestExecutionName(
                updatedResult.getTestExecution() != null ? updatedResult.getTestExecution().getName() : null);
        responseDto.setAttachmentCount(updatedResult.getActiveAttachmentCount());

        if (updatedResult.getTags() != null) {
            updatedResult.getTags().size(); // LAZY 로딩 강제 초기화
            responseDto.setTags(new ArrayList<>(updatedResult.getTags()));
        }

        System.out.println("✅ 테스트 결과 수정 완료: " + resultId + " by " + currentUsername);
        return responseDto;
    }

    /**
     * 이전 테스트 결과 삭제 (PreviousResultsDialog용)
     * 권한 체크: ADMIN OR MANAGER만
     * 
     * @param resultId        삭제할 테스트 결과 ID
     * @param currentUsername 현재 사용자 username
     * @throws SecurityException        권한이 없는 경우 (ADMIN/MANAGER가 아닌 경우)
     * @throws IllegalArgumentException 결과를 찾을 수 없는 경우
     */
    public void deletePreviousTestResult(String resultId, String currentUsername) {
        // 1. 기존 TestResult 조회
        TestResult existingResult = testResultRepository.findById(resultId)
                .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + resultId));

        // 2. 현재 사용자 조회
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + currentUsername));

        // 3. 권한 확인: ADMIN OR MANAGER만
        boolean isAdmin = "ADMIN".equals(currentUser.getRole());
        boolean isManager = "MANAGER".equals(currentUser.getRole());

        if (!isAdmin && !isManager) {
            throw new SecurityException(
                    String.format("삭제 권한이 없습니다. Admin 또는 Manager만 삭제할 수 있습니다. (사용자: %s, 역할: %s)",
                            currentUsername,
                            currentUser.getRole()));
        }

        // 4. 삭제
        testResultRepository.delete(existingResult);

        System.out.println("🗑️ 테스트 결과 삭제 완료: " + resultId + " by " + currentUsername);
    }
}
