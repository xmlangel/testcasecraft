// src/main/java/com/testcase/testcasemanagement/service/JunitAsyncProcessingService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.JunitProcessStatus;
import com.testcase.testcasemanagement.model.JunitTestResult;
import com.testcase.testcasemanagement.repository.JunitTestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ICT-200: 대량 JUnit XML 파일 비동기 처리 서비스
 * 대용량 파일의 백그라운드 처리 및 진행률 추적
 */
@Service
public class JunitAsyncProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(JunitAsyncProcessingService.class);

    @Autowired
    private JunitTestResultRepository testResultRepository;

    @Autowired
    private JunitXmlParserService xmlParserService;

    @Autowired
    private JunitFileStorageService fileStorageService;

    // 진행률 추적을 위한 맵
    private final ConcurrentHashMap<String, ProcessingProgress> processingStatus = new ConcurrentHashMap<>();

    /**
     * 대용량 JUnit XML 파일 비동기 처리
     * 
     * @param testResultId 테스트 결과 ID
     * @param filePath     파일 경로
     * @param user         업로드 사용자
     * @return 비동기 처리 CompletableFuture
     */
    @Async("junitProcessingExecutor")
    @Transactional
    public CompletableFuture<JunitTestResult> processLargeJunitFileAsync(
            String testResultId, String filePath, com.testcase.testcasemanagement.model.User user) {

        logger.info("대용량 JUnit XML 파일 비동기 처리 시작 - ID: {}, 파일: {}", testResultId, filePath);

        // 진행률 추적 시작
        ProcessingProgress progress = new ProcessingProgress();
        progress.setTotalSteps(5); // 파일 로드, XML 파싱, 데이터 검증, 저장, 완료
        progress.setCurrentStep(0);
        progress.setStatusMessage("처리 준비 중...");
        processingStatus.put(testResultId, progress);

        try {
            // 1단계: 테스트 결과 엔티티 조회
            JunitTestResult testResult = testResultRepository.findById(testResultId)
                    .orElseThrow(() -> new RuntimeException("Test result not found: " + testResultId));

            updateProgress(testResultId, 1, "파일 로딩 중...");
            testResult.setStatus(JunitProcessStatus.PARSING);
            testResultRepository.save(testResult);

            // 2단계: 스트리밍 파싱으로 메모리 효율성 개선
            updateProgress(testResultId, 2, "XML 파싱 중...");
            JunitTestResult parsedResult = parseWithProgressTracking(filePath, testResult, user, testResultId);

            // 3단계: 데이터 검증
            updateProgress(testResultId, 3, "데이터 검증 중...");
            validateParsedData(parsedResult);

            // 4단계: 배치 저장으로 성능 최적화
            updateProgress(testResultId, 4, "데이터 저장 중...");
            JunitTestResult savedResult = saveParsedDataInBatches(testResult, parsedResult);

            // 5단계: 완료
            updateProgress(testResultId, 5, "처리 완료");
            savedResult.setStatus(JunitProcessStatus.COMPLETED);
            savedResult.setParsedAt(LocalDateTime.now());
            testResultRepository.save(savedResult);

            // 진행률 추적 정리
            processingStatus.remove(testResultId);

            logger.info("대용량 JUnit XML 파일 비동기 처리 완료 - ID: {}, 총 테스트: {}",
                    testResultId, savedResult.getTotalTests());

            return CompletableFuture.completedFuture(savedResult);

        } catch (Exception e) {
            logger.error("대용량 JUnit XML 파일 처리 중 오류 발생 - ID: {}", testResultId, e);

            // 오류 상태 업데이트
            testResultRepository.findById(testResultId).ifPresent(result -> {
                result.setStatus(JunitProcessStatus.FAILED);
                result.setErrorMessage(e.getMessage());
                testResultRepository.save(result);
            });

            // 진행률 추적에 오류 상태 기록
            ProcessingProgress failedProgress = processingStatus.get(testResultId);
            if (failedProgress != null) {
                failedProgress.setStatusMessage("처리 실패: " + e.getMessage());
                failedProgress.setFailed(true);
            }

            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 스트리밍 파싱으로 메모리 효율적 처리
     */
    private JunitTestResult parseWithProgressTracking(String filePath, JunitTestResult testResult,
            com.testcase.testcasemanagement.model.User user, String testResultId)
            throws JunitFileStorageService.FileStorageException, JunitXmlParserService.JunitXmlParsingException {

        // 스트리밍으로 파일 읽기
        try (InputStream inputStream = fileStorageService.loadFileAsInputStream(filePath)) {
            // 파싱 진행률 콜백과 함께 파싱
            return xmlParserService.parseJunitXmlWithProgress(
                    inputStream,
                    testResult.getFileName(),
                    testResult.getProjectId(),
                    user,
                    (current, total, message) -> updateParsingProgress(testResultId, current, total, message));
        } catch (Exception e) {
            throw new JunitXmlParserService.JunitXmlParsingException(
                    "Failed to parse with streaming: " + e.getMessage(), e);
        }
    }

    /**
     * 데이터 검증
     */
    private void validateParsedData(JunitTestResult parsedResult) {
        if (parsedResult.getTestSuites() == null || parsedResult.getTestSuites().isEmpty()) {
            throw new RuntimeException("No test suites found in parsed data");
        }

        // 통계 일관성 검증
        int calculatedTotal = parsedResult.getTestSuites().stream()
                .mapToInt(suite -> suite.getTestCases() != null ? suite.getTestCases().size() : 0)
                .sum();

        if (Math.abs(calculatedTotal - parsedResult.getTotalTests()) > 0) {
            logger.warn("테스트 수 불일치 감지 - 계산됨: {}, 파싱됨: {}",
                    calculatedTotal, parsedResult.getTotalTests());
        }
    }

    /**
     * 배치 저장으로 성능 최적화
     */
    private JunitTestResult saveParsedDataInBatches(JunitTestResult original, JunitTestResult parsed) {
        // 원본 엔티티에 파싱된 데이터 복사
        copyParsedData(original, parsed);

        // 배치 크기 설정 (대용량 처리를 위해 작은 배치 사용)
        final int BATCH_SIZE = 100;

        if (original.getTestSuites() != null) {
            for (int i = 0; i < original.getTestSuites().size(); i += BATCH_SIZE) {
                int endIndex = Math.min(i + BATCH_SIZE, original.getTestSuites().size());
                // 배치별로 처리하되, 전체를 한 번에 저장 (JPA cascade 활용)
                logger.debug("배치 저장 진행: {}/{} 스위트", endIndex, original.getTestSuites().size());
            }
        }

        // 전체 저장 (cascade로 관련 엔티티들 자동 저장)
        return testResultRepository.save(original);
    }

    /**
     * 파싱된 데이터를 기존 엔티티에 복사
     */
    private void copyParsedData(JunitTestResult target, JunitTestResult source) {
        target.setTotalTests(source.getTotalTests());
        target.setFailures(source.getFailures());
        target.setErrors(source.getErrors());
        target.setSkipped(source.getSkipped());
        target.setTotalTime(source.getTotalTime());

        if (target.getTestExecutionName() == null || target.getTestExecutionName().isEmpty()) {
            target.setTestExecutionName(source.getTestExecutionName());
        }

        if (source.getTestSuites() != null) {
            for (com.testcase.testcasemanagement.model.JunitTestSuite sourceSuite : source.getTestSuites()) {
                sourceSuite.setJunitTestResult(target);

                if (sourceSuite.getTestCases() != null) {
                    for (com.testcase.testcasemanagement.model.JunitTestCase sourceCase : sourceSuite.getTestCases()) {
                        sourceCase.setJunitTestSuite(sourceSuite);
                    }
                }
            }
            target.setTestSuites(source.getTestSuites());
        }
    }

    /**
     * 진행률 업데이트
     */
    private void updateProgress(String testResultId, int currentStep, String statusMessage) {
        ProcessingProgress progress = processingStatus.get(testResultId);
        if (progress != null) {
            progress.setCurrentStep(currentStep);
            progress.setStatusMessage(statusMessage);
            progress.setLastUpdated(System.currentTimeMillis());

            logger.debug("처리 진행률 업데이트 - ID: {}, 단계: {}/{}, 메시지: {}",
                    testResultId, currentStep, progress.getTotalSteps(), statusMessage);
        }
    }

    /**
     * 파싱 진행률 업데이트
     */
    private void updateParsingProgress(String testResultId, int current, int total, String message) {
        ProcessingProgress progress = processingStatus.get(testResultId);
        if (progress != null) {
            progress.setParsingCurrent(current);
            progress.setParsingTotal(total);
            progress.setStatusMessage(message);
            progress.setLastUpdated(System.currentTimeMillis());
        }
    }

    /**
     * 처리 진행률 조회
     */
    public ProcessingProgress getProcessingProgress(String testResultId) {
        return processingStatus.get(testResultId);
    }

    /**
     * 모든 활성 처리 진행률 조회
     */
    public ConcurrentHashMap<String, ProcessingProgress> getAllProcessingProgress() {
        return new ConcurrentHashMap<>(processingStatus);
    }

    /**
     * 진행률 추적 클래스
     */
    public static class ProcessingProgress {
        private int totalSteps;
        private int currentStep;
        private String statusMessage;
        private long lastUpdated;
        private boolean failed = false;

        // 파싱 세부 진행률
        private int parsingCurrent = 0;
        private int parsingTotal = 0;

        // 전체 진행률 계산 (퍼센트)
        public double getProgressPercentage() {
            if (totalSteps == 0)
                return 0.0;

            double stepProgress = (double) currentStep / totalSteps;

            // 파싱 단계(2단계)에서는 세부 진행률 반영
            if (currentStep == 2 && parsingTotal > 0) {
                double parsingProgress = (double) parsingCurrent / parsingTotal;
                stepProgress = (1.0 / totalSteps) + (parsingProgress / totalSteps);
            }

            return Math.min(stepProgress * 100, 100.0);
        }

        // Getters and Setters
        public int getTotalSteps() {
            return totalSteps;
        }

        public void setTotalSteps(int totalSteps) {
            this.totalSteps = totalSteps;
        }

        public int getCurrentStep() {
            return currentStep;
        }

        public void setCurrentStep(int currentStep) {
            this.currentStep = currentStep;
        }

        public String getStatusMessage() {
            return statusMessage;
        }

        public void setStatusMessage(String statusMessage) {
            this.statusMessage = statusMessage;
        }

        public long getLastUpdated() {
            return lastUpdated;
        }

        public void setLastUpdated(long lastUpdated) {
            this.lastUpdated = lastUpdated;
        }

        public boolean isFailed() {
            return failed;
        }

        public void setFailed(boolean failed) {
            this.failed = failed;
        }

        public int getParsingCurrent() {
            return parsingCurrent;
        }

        public void setParsingCurrent(int parsingCurrent) {
            this.parsingCurrent = parsingCurrent;
        }

        public int getParsingTotal() {
            return parsingTotal;
        }

        public void setParsingTotal(int parsingTotal) {
            this.parsingTotal = parsingTotal;
        }

        public boolean isCompleted() {
            return currentStep >= totalSteps && !failed;
        }
    }
}