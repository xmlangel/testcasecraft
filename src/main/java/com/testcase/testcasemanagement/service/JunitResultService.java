// src/main/java/com/testcase/testcasemanagement/service/JunitResultService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ICT-203: JUnit 테스트 결과 메인 서비스
 * 파일 업로드, 파싱, 저장의 전체 프로세스를 관리
 */
@Service
@Transactional
public class JunitResultService {

    private static final Logger logger = LoggerFactory.getLogger(JunitResultService.class);

    @Autowired
    private JunitTestResultRepository testResultRepository;

    @Autowired
    private JunitTestSuiteRepository testSuiteRepository;

    @Autowired
    private JunitTestCaseRepository testCaseRepository;

    @Autowired
    private TestPlanRepository testPlanRepository;

    @Autowired
    private JunitFileStorageService fileStorageService;

    @Autowired
    private JunitXmlParserService xmlParserService;

    @Autowired
    private UserRepository userRepository;

    /**
     * JUnit XML 파일 업로드 및 파싱 처리
     * 
     * @param file          업로드된 XML 파일
     * @param projectId     프로젝트 ID
     * @param userId        업로드한 사용자 ID
     * @param executionName 실행 이름 (선택적)
     * @param description   설명 (선택적)
     * @return 저장된 JunitTestResult
     * @throws JunitProcessingException 처리 중 오류 발생 시
     */
    public JunitTestResult uploadAndProcessJunitXml(MultipartFile file, String projectId,
            String username, String executionName,
            String description) throws JunitProcessingException {
        logger.info("JUnit XML 파일 업로드 및 처리 시작 - 파일: {}, 프로젝트: {}, 사용자: {}",
                file.getOriginalFilename(), projectId, username);

        JunitTestResult testResult = null;

        try {
            // 사용자 정보 조회 (username으로 조회)
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new JunitProcessingException("User not found: " + username));

            // 1. 파일 저장
            JunitFileStorageService.FileStorageResult storageResult = fileStorageService.storeFile(file, projectId);

            // 2. 중복 파일 확인 (체크섬 기반)
            Optional<JunitTestResult> existingResult = testResultRepository.findByProjectIdAndFileChecksum(projectId,
                    storageResult.getChecksum());

            if (existingResult.isPresent()) {
                logger.warn("중복 파일 감지 - 기존 결과 반환: {}", existingResult.get().getId());
                // 중복 파일 삭제
                fileStorageService.deleteFile(storageResult.getFilePath());
                return existingResult.get();
            }

            // 3. 기본 JunitTestResult 엔티티 생성 및 저장 (UPLOADING 상태)
            testResult = new JunitTestResult();
            testResult.setFileName(storageResult.getOriginalFileName());
            testResult.setFileSize(storageResult.getFileSize());
            testResult.setFileChecksum(storageResult.getChecksum());
            testResult.setProjectId(projectId);
            testResult.setUploadedBy(user);
            testResult.setOriginalFilePath(storageResult.getFilePath());
            testResult.setStatus(JunitProcessStatus.UPLOADING);

            if (executionName != null && !executionName.trim().isEmpty()) {
                testResult.setTestExecutionName(executionName.trim());
            }
            if (description != null && !description.trim().isEmpty()) {
                testResult.setDescription(description.trim());
            }

            // 임시 저장
            testResult = testResultRepository.save(testResult);

            // 4. XML 파싱 및 상세 데이터 처리
            processXmlFile(testResult, storageResult.getFilePath(), user);

            logger.info("JUnit XML 파일 처리 완료 - ID: {}, 총 테스트: {}",
                    testResult.getId(), testResult.getTotalTests());

            return testResult;

        } catch (Exception e) {
            logger.error("JUnit XML 파일 처리 중 오류 발생: {}", e.getMessage(), e);

            // 실패 시 정리 작업
            if (testResult != null) {
                testResult.setStatus(JunitProcessStatus.FAILED);
                testResult.setErrorMessage(e.getMessage());
                testResultRepository.save(testResult);
            }

            throw new JunitProcessingException("Failed to process JUnit XML file: " + e.getMessage(), e);
        }
    }

    /**
     * XML 파일 파싱 및 상세 데이터 처리
     */
    private void processXmlFile(JunitTestResult testResult, String filePath, User user)
            throws JunitProcessingException {
        try {
            // 상태를 PARSING으로 변경
            testResult.setStatus(JunitProcessStatus.PARSING);
            testResultRepository.save(testResult);

            // XML 파일 읽기
            try (InputStream inputStream = fileStorageService.loadFileAsInputStream(filePath)) {

                // XML 파싱
                JunitTestResult parsedResult = xmlParserService.parseJunitXml(
                        inputStream, testResult.getFileName(), testResult.getProjectId(), user);

                // 파싱된 데이터를 기존 엔티티에 복사
                copyParsedData(testResult, parsedResult);

                // 최종 저장
                testResult.setStatus(JunitProcessStatus.COMPLETED);
                testResult.setParsedAt(LocalDateTime.now());
                testResultRepository.save(testResult);

                logger.info("XML 파싱 완료 - 테스트 스위트: {}, 총 테스트: {}",
                        testResult.getTestSuites().size(), testResult.getTotalTests());
            }

        } catch (Exception e) {
            logger.error("XML 파싱 중 오류: {}", e.getMessage(), e);
            throw new JunitProcessingException("XML parsing failed: " + e.getMessage(), e);
        }
    }

    /**
     * 파싱된 데이터를 기존 엔티티에 복사
     */
    private void copyParsedData(JunitTestResult target, JunitTestResult source) {
        // 기본 통계 정보 복사
        target.setTotalTests(source.getTotalTests());
        target.setFailures(source.getFailures());
        target.setErrors(source.getErrors());
        target.setSkipped(source.getSkipped());
        target.setTotalTime(source.getTotalTime());

        // 실행 이름이 설정되지 않은 경우 파싱된 이름 사용
        if (target.getTestExecutionName() == null || target.getTestExecutionName().isEmpty()) {
            target.setTestExecutionName(source.getTestExecutionName());
        }

        // 테스트 스위트 및 케이스 데이터 복사
        if (source.getTestSuites() != null) {
            for (JunitTestSuite sourceSuite : source.getTestSuites()) {
                sourceSuite.setJunitTestResult(target);

                if (sourceSuite.getTestCases() != null) {
                    for (JunitTestCase sourceCase : sourceSuite.getTestCases()) {
                        sourceCase.setJunitTestSuite(sourceSuite);
                    }
                }
            }
            target.setTestSuites(source.getTestSuites());
        }
    }

    /**
     * 테스트 결과 목록 조회 (프로젝트별)
     */
    @Transactional(readOnly = true)
    public Page<JunitTestResult> getTestResultsByProject(String projectId, Pageable pageable) {
        return testResultRepository.findByProjectIdOrderByUploadedAtDesc(projectId, pageable);
    }

    /**
     * 테스트 결과 상세 조회
     */
    @Transactional(readOnly = true)
    public Optional<JunitTestResult> getTestResultById(String id) {
        return testResultRepository.findById(id);
    }

    /**
     * 테스트 스위트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<JunitTestSuite> getTestSuitesByResult(String testResultId) {
        List<JunitTestSuite> suites = testSuiteRepository.findByJunitTestResult_IdOrderByName(testResultId);

        // ICT-203: 메타데이터(XML 속성)와 실제 DB 저장된 케이스 수의 불일치로 인한
        // 프론트엔드 페이징 오류 방지를 위해, 실제 DB 카운트로 덮어씀
        for (JunitTestSuite suite : suites) {
            int actualCount = testCaseRepository.countByJunitTestSuite_Id(suite.getId());
            if (suite.getTests() != actualCount) {
                logger.debug("Suite {} count mismatch corrected: metadata={}, db={}",
                        suite.getName(), suite.getTests(), actualCount);
                suite.setTests(actualCount);
            }
        }

        return suites;
    }

    /**
     * 테스트 케이스 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<JunitTestCase> getTestCasesBySuite(String testSuiteId, Pageable pageable) {
        return testCaseRepository.findByJunitTestSuite_IdOrderByName(testSuiteId, pageable);
    }

    /**
     * 실패한 테스트 케이스만 조회
     */
    @Transactional(readOnly = true)
    public List<JunitTestCase> getFailedTestCases(String testResultId) {
        return testCaseRepository.findFailedCasesByTestResult(testResultId);
    }

    /**
     * 가장 느린 테스트 케이스 조회
     */
    @Transactional(readOnly = true)
    public List<JunitTestCase> getSlowestTestCases(String testResultId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return testCaseRepository.findSlowestCasesByTestResult(testResultId, pageable);
    }

    /**
     * 테스트 결과 삭제
     */
    public boolean deleteTestResult(String id) {
        try {
            Optional<JunitTestResult> testResult = testResultRepository.findById(id);
            if (testResult.isPresent()) {
                JunitTestResult result = testResult.get();

                // 원본 파일 삭제
                if (result.getOriginalFilePath() != null) {
                    fileStorageService.deleteFile(result.getOriginalFilePath());
                }

                // 데이터베이스에서 삭제 (Cascade로 인해 관련 데이터도 삭제됨)
                testResultRepository.delete(result);

                logger.info("테스트 결과 삭제 완료: {}", id);
                return true;
            }
            return false;

        } catch (Exception e) {
            logger.error("테스트 결과 삭제 중 오류: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 비동기 처리를 위한 초기 테스트 결과 엔티티 생성
     * 
     * @param file          업로드된 파일
     * @param projectId     프로젝트 ID
     * @param username      업로드한 사용자명
     * @param executionName 실행 이름 (선택적)
     * @param description   설명 (선택적)
     * @return 초기 상태의 JunitTestResult
     * @throws JunitProcessingException 처리 중 오류 발생 시
     */
    public JunitTestResult createInitialTestResult(MultipartFile file, String projectId,
            String username, String executionName,
            String description) throws JunitProcessingException {
        logger.info("비동기 처리용 초기 테스트 결과 생성 - 파일: {}, 프로젝트: {}",
                file.getOriginalFilename(), projectId);

        try {
            // 사용자 정보 조회
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new JunitProcessingException("User not found: " + username));

            // 파일 저장
            JunitFileStorageService.FileStorageResult storageResult = fileStorageService.storeFile(file, projectId);

            // 중복 파일 확인
            Optional<JunitTestResult> existingResult = testResultRepository.findByProjectIdAndFileChecksum(projectId,
                    storageResult.getChecksum());

            if (existingResult.isPresent()) {
                logger.warn("중복 파일 감지 - 기존 결과 반환: {}", existingResult.get().getId());
                // 중복 파일 삭제
                fileStorageService.deleteFile(storageResult.getFilePath());
                return existingResult.get();
            }

            // 초기 JunitTestResult 엔티티 생성
            JunitTestResult testResult = new JunitTestResult();
            testResult.setFileName(storageResult.getOriginalFileName());
            testResult.setFileSize(storageResult.getFileSize());
            testResult.setFileChecksum(storageResult.getChecksum());
            testResult.setProjectId(projectId);
            testResult.setUploadedBy(user);
            testResult.setOriginalFilePath(storageResult.getFilePath());
            testResult.setStatus(JunitProcessStatus.UPLOADING);

            if (executionName != null && !executionName.trim().isEmpty()) {
                testResult.setTestExecutionName(executionName.trim());
            }
            if (description != null && !description.trim().isEmpty()) {
                testResult.setDescription(description.trim());
            }

            // 저장 후 반환
            return testResultRepository.save(testResult);

        } catch (Exception e) {
            logger.error("초기 테스트 결과 생성 중 오류: {}", e.getMessage(), e);
            throw new JunitProcessingException("Failed to create initial test result: " + e.getMessage(), e);
        }
    }

    /**
     * 테스트 케이스 편집
     */
    public JunitTestCase updateTestCase(String testCaseId, String userTitle, String userDescription,
            String userNotes, JunitTestStatus userStatus,
            String tags, String priority, String userId) {

        Optional<JunitTestCase> optionalTestCase = testCaseRepository.findById(testCaseId);
        if (optionalTestCase.isEmpty()) {
            throw new IllegalArgumentException("Test case not found: " + testCaseId);
        }

        JunitTestCase testCase = optionalTestCase.get();

        // 사용자 편집 필드 업데이트
        testCase.setUserTitle(userTitle);
        testCase.setUserDescription(userDescription);
        testCase.setUserNotes(userNotes);
        testCase.setUserStatus(userStatus);
        testCase.setTags(tags);
        testCase.setPriority(priority);

        // 수정자 정보 설정
        if (userId != null) {
            userRepository.findById(userId).ifPresent(testCase::setLastModifiedBy);
        }

        return testCaseRepository.save(testCase);
    }

    /**
     * 프로젝트별 JUnit 요약 통계 조회 (ICT-211)
     */
    public Map<String, Object> getProjectSummaryStatistics(String projectId) {
        logger.debug("프로젝트 JUnit 요약 통계 조회 시작: {}", projectId);

        Map<String, Object> summary = new HashMap<>();

        try {
            // 프로젝트의 모든 JUnit 결과 조회
            List<JunitTestResult> testResults = testResultRepository.findByProjectIdOrderByUploadedAtDesc(projectId);

            if (testResults.isEmpty()) {
                // JUnit 결과가 없는 경우
                summary.put("hasResults", false);
                summary.put("totalResults", 0);
                summary.put("latestSuccessRate", 0.0);
                summary.put("averageSuccessRate", 0.0);
                summary.put("lastExecutedAt", null);
                return summary;
            }

            // 기본 통계
            summary.put("hasResults", true);
            summary.put("totalResults", testResults.size());

            // 최근 결과 정보
            JunitTestResult latestResult = testResults.get(0);
            summary.put("latestSuccessRate", latestResult.getSuccessRate());
            summary.put("lastExecutedAt", latestResult.getUploadedAt());
            summary.put("latestFileName", latestResult.getFileName());
            summary.put("latestExecutionName", latestResult.getTestExecutionName());

            // 최근 7일 또는 최근 5개 결과의 평균 성공률
            List<JunitTestResult> recentResults = testResults.stream()
                    .limit(5) // 최근 5개 결과
                    .filter(result -> result.getStatus() == JunitProcessStatus.COMPLETED)
                    .collect(Collectors.toList());

            if (!recentResults.isEmpty()) {
                double averageSuccessRate = recentResults.stream()
                        .mapToDouble(JunitTestResult::getSuccessRate)
                        .average()
                        .orElse(0.0);
                summary.put("averageSuccessRate", Math.round(averageSuccessRate * 100.0) / 100.0);
            } else {
                summary.put("averageSuccessRate", 0.0);
            }

            // 상태별 통계
            Map<JunitProcessStatus, Long> statusCounts = testResults.stream()
                    .collect(Collectors.groupingBy(JunitTestResult::getStatus, Collectors.counting()));
            summary.put("statusCounts", statusCounts);

            // 성공률 기반 색상 등급
            double latestSuccessRate = latestResult.getSuccessRate();
            String qualityGrade;
            if (latestSuccessRate >= 90.0) {
                qualityGrade = "EXCELLENT"; // 초록색
            } else if (latestSuccessRate >= 70.0) {
                qualityGrade = "GOOD"; // 노란색
            } else {
                qualityGrade = "POOR"; // 빨간색
            }
            summary.put("qualityGrade", qualityGrade);

            logger.debug("프로젝트 JUnit 요약 통계 조회 완료: {} - 결과 {}개, 최근 성공률 {}%",
                    projectId, testResults.size(), latestSuccessRate);

        } catch (Exception e) {
            logger.error("프로젝트 JUnit 요약 통계 조회 실패: {}", projectId, e);
            // 오류 발생 시 기본값 반환
            summary.put("hasResults", false);
            summary.put("totalResults", 0);
            summary.put("latestSuccessRate", 0.0);
            summary.put("averageSuccessRate", 0.0);
            summary.put("lastExecutedAt", null);
            summary.put("qualityGrade", "UNKNOWN");
        }

        return summary;
    }

    /**
     * 여러 프로젝트의 JUnit 요약 통계 배치 조회 (ICT-211)
     */
    public Map<String, Map<String, Object>> getBatchProjectSummaryStatistics(List<String> projectIds) {
        logger.debug("배치 프로젝트 JUnit 요약 통계 조회 시작: {} 프로젝트", projectIds.size());

        Map<String, Map<String, Object>> batchSummary = new HashMap<>();

        for (String projectId : projectIds) {
            try {
                Map<String, Object> summary = getProjectSummaryStatistics(projectId);
                batchSummary.put(projectId, summary);
            } catch (Exception e) {
                logger.error("프로젝트 {} JUnit 요약 통계 조회 실패", projectId, e);
                // 실패한 프로젝트는 기본값으로 설정
                Map<String, Object> defaultSummary = new HashMap<>();
                defaultSummary.put("hasResults", false);
                defaultSummary.put("totalResults", 0);
                defaultSummary.put("latestSuccessRate", 0.0);
                defaultSummary.put("averageSuccessRate", 0.0);
                defaultSummary.put("lastExecutedAt", null);
                defaultSummary.put("qualityGrade", "UNKNOWN");
                batchSummary.put(projectId, defaultSummary);
            }
        }

        logger.debug("배치 프로젝트 JUnit 요약 통계 조회 완료: {}/{} 성공",
                batchSummary.size(), projectIds.size());

        return batchSummary;
    }

    /**
     * ICT-337: 테스트 케이스 ID로 조회 (상세 정보 포함)
     */
    public Optional<JunitTestCase> getTestCaseById(String testCaseId) {
        logger.debug("테스트 케이스 조회 - ID: {}", testCaseId);

        try {
            Optional<JunitTestCase> testCase = testCaseRepository.findById(testCaseId);

            if (testCase.isPresent()) {
                logger.debug("테스트 케이스 조회 성공 - ID: {}, 이름: {}",
                        testCaseId, testCase.get().getName());
            } else {
                logger.warn("테스트 케이스를 찾을 수 없음 - ID: {}", testCaseId);
            }

            return testCase;

        } catch (Exception e) {
            logger.error("테스트 케이스 조회 중 오류 - ID: {}, 오류: {}", testCaseId, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * 테스트 결과를 테스트 플랜에 연결
     */
    public JunitTestResult linkTestPlan(String testResultId, String testPlanId) {
        JunitTestResult testResult = testResultRepository.findById(testResultId)
                .orElseThrow(() -> new IllegalArgumentException("Test result not found: " + testResultId));

        if (testPlanId != null) {
            TestPlan testPlan = testPlanRepository.findById(testPlanId)
                    .orElseThrow(() -> new IllegalArgumentException("Test plan not found: " + testPlanId));
            testResult.setTestPlanId(testPlan.getId());
        } else {
            testResult.setTestPlanId(null); // 연결 해제
        }

        return testResultRepository.save(testResult);
    }

    /**
     * 테스트 플랜에 연결된 테스트 결과 목록 조회
     */
    @Transactional(readOnly = true)
    public List<JunitTestResult> getTestResultsByTestPlan(String testPlanId) {
        return testResultRepository.findByTestPlanIdOrderByUploadedAtDesc(testPlanId);
    }

    /**
     * 테스트 플랜 이름 조회
     */
    @Transactional(readOnly = true)
    public String getTestPlanName(String testPlanId) {
        if (testPlanId == null)
            return null;
        return testPlanRepository.findById(testPlanId)
                .map(TestPlan::getName)
                .orElse(null);
    }

    /**
     * 플랜별 JUnit 비교 통계 조회 (View Type: By Plan)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComparisonStatisticsByPlan(String projectId) {
        logger.info("플랜별 JUnit 비교 통계 조회 - 프로젝트: {}", projectId);

        try {
            List<Map<String, Object>> planStats = testResultRepository.findStatisticsByTestPlan(projectId);

            return planStats.stream().map(stat -> {
                Map<String, Object> result = new HashMap<>();
                result.put("name", stat.get("test_plan_name"));
                result.put("passCount", stat.get("pass_count"));
                result.put("failCount", stat.get("fail_count"));
                result.put("blockedCount", stat.get("blocked_count"));
                result.put("notRunCount", stat.get("not_run_count"));

                // 전체 테스트 수 계산
                long totalTests = ((Number) stat.get("pass_count")).longValue()
                        + ((Number) stat.get("fail_count")).longValue()
                        + ((Number) stat.get("blocked_count")).longValue()
                        + ((Number) stat.get("not_run_count")).longValue();
                result.put("totalTests", totalTests);

                // 성공률 계산 (소수점 둘째자리)
                long executed = totalTests - ((Number) stat.get("not_run_count")).longValue();
                double successRate = executed > 0
                        ? (((Number) stat.get("pass_count")).doubleValue() / executed) * 100.0
                        : 0.0;
                result.put("successRate", Math.round(successRate * 100.0) / 100.0);

                return result;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("플랜별 JUnit 통계 조회 실패: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * 실행자별 JUnit 비교 통계 조회 (View Type: By Executor)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getComparisonStatisticsByExecutor(String projectId) {
        logger.info("실행자별 JUnit 비교 통계 조회 - 프로젝트: {}", projectId);

        try {
            List<Map<String, Object>> executorStats = testResultRepository.findStatisticsByUploader(projectId);

            return executorStats.stream().map(stat -> {
                Map<String, Object> result = new HashMap<>();
                result.put("name", stat.get("executor_name"));
                result.put("passCount", stat.get("pass_count"));
                result.put("failCount", stat.get("fail_count"));
                result.put("blockedCount", stat.get("blocked_count"));
                result.put("notRunCount", stat.get("not_run_count"));

                // 전체 테스트 수 계산
                long totalTests = ((Number) stat.get("pass_count")).longValue()
                        + ((Number) stat.get("fail_count")).longValue()
                        + ((Number) stat.get("blocked_count")).longValue()
                        + ((Number) stat.get("not_run_count")).longValue();
                result.put("totalTests", totalTests);

                // 성공률 계산 (소수점 둘째자리)
                long executed = totalTests - ((Number) stat.get("not_run_count")).longValue();
                double successRate = executed > 0
                        ? (((Number) stat.get("pass_count")).doubleValue() / executed) * 100.0
                        : 0.0;
                result.put("successRate", Math.round(successRate * 100.0) / 100.0);

                return result;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("실행자별 JUnit 통계 조회 실패: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * JUnit 처리 예외 클래스
     */
    public static class JunitProcessingException extends Exception {
        public JunitProcessingException(String message) {
            super(message);
        }

        public JunitProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}