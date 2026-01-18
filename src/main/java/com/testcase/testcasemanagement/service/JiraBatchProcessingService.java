package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.JiraConfig;
import com.testcase.testcasemanagement.repository.JiraConfigRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * JIRA API 배치 처리 최적화 서비스
 * ICT-165: 성능 향상을 위한 배치 처리 구현
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "jira.batch-processing.enabled", havingValue = "true", matchIfMissing = false)
public class JiraBatchProcessingService {

    private final JiraConfigRepository jiraConfigRepository;
    private final Optional<JiraApiService> jiraApiService;
    private final EncryptionUtil encryptionUtil;
    
    public JiraBatchProcessingService(JiraConfigRepository jiraConfigRepository,
                                    @Lazy Optional<JiraApiService> jiraApiService,
                                    EncryptionUtil encryptionUtil) {
        this.jiraConfigRepository = jiraConfigRepository;
        this.jiraApiService = jiraApiService;
        this.encryptionUtil = encryptionUtil;
    }

    @Value("${jira.batch-processing.max-threads:5}")
    private int maxThreads;

    @Value("${jira.batch-processing.batch-size:10}")
    private int batchSize;

    @Value("${jira.batch-processing.timeout:30}")
    private long timeoutSeconds;

    @Value("${jira.batch-processing.retry-attempts:3}")
    private int maxRetryAttempts;

    @Value("${jira.batch-processing.retry-delay:2000}")
    private long retryDelayMs;

    private ExecutorService executorService;
    private final Map<String, BatchOperationStats> operationStats = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        this.executorService = Executors.newFixedThreadPool(maxThreads,
                r -> {
                    Thread t = new Thread(r);
                    t.setName("jira-batch-" + t.threadId());
                    t.setDaemon(true);
                    return t;
                });

        log.info("JIRA 배치 처리 서비스 초기화 완료 - 스레드: {}, 배치크기: {}, 타임아웃: {}s",
                maxThreads, batchSize, timeoutSeconds);
    }

    /**
     * 여러 JIRA 이슈에 배치 코멘트 추가
     */
    public BatchOperationResult batchAddComments(String userId, List<BatchCommentRequest> requests) {
        String operationId = "batch_comment_" + System.currentTimeMillis();
        BatchOperationStats stats = new BatchOperationStats(operationId, requests.size());
        operationStats.put(operationId, stats);

        try {
            log.info("배치 코멘트 작업 시작: userId={}, 요청수={}", userId, requests.size());

            // 사용자의 활성 JIRA 설정 조회
            JiraConfig jiraConfig = getActiveJiraConfig(userId);
            if (jiraConfig == null) {
                return BatchOperationResult.failure(operationId, "활성화된 JIRA 설정이 없습니다.");
            }

            String decryptedApiToken = encryptionUtil.decrypt(jiraConfig.getEncryptedApiToken());

            // 배치 단위로 분할하여 처리
            List<List<BatchCommentRequest>> batches = partitionList(requests, batchSize);
            List<Future<List<BatchCommentResult>>> futures = new ArrayList<>();

            for (List<BatchCommentRequest> batch : batches) {
                Future<List<BatchCommentResult>> future = executorService.submit(() ->
                        processBatchComments(jiraConfig, decryptedApiToken, batch, stats));
                futures.add(future);
            }

            // 모든 배치 작업 결과 수집
            List<BatchCommentResult> allResults = new ArrayList<>();
            for (Future<List<BatchCommentResult>> future : futures) {
                try {
                    List<BatchCommentResult> batchResults = future.get(timeoutSeconds, TimeUnit.SECONDS);
                    allResults.addAll(batchResults);
                } catch (TimeoutException e) {
                    log.warn("배치 처리 타임아웃: operationId={}", operationId);
                    stats.recordTimeout();
                } catch (Exception e) {
                    log.error("배치 처리 중 오류: operationId={}", operationId, e);
                    stats.recordError();
                }
            }

            stats.completeOperation();
            
            int successCount = (int) allResults.stream().mapToInt(r -> r.isSuccess() ? 1 : 0).sum();
            int failureCount = allResults.size() - successCount;

            log.info("배치 코멘트 작업 완료: operationId={}, 성공={}, 실패={}, 소요시간={}ms",
                    operationId, successCount, failureCount, stats.getExecutionTime());

            return BatchOperationResult.success(operationId, allResults, successCount, failureCount);

        } catch (Exception e) {
            log.error("배치 코멘트 작업 실패: operationId={}", operationId, e);
            stats.recordError();
            return BatchOperationResult.failure(operationId, "배치 작업 실패: " + e.getMessage());
        }
    }

    /**
     * 여러 JIRA 프로젝트 정보를 배치로 조회
     */
    public BatchOperationResult batchGetProjects(List<String> userIds) {
        String operationId = "batch_projects_" + System.currentTimeMillis();
        BatchOperationStats stats = new BatchOperationStats(operationId, userIds.size());
        operationStats.put(operationId, stats);

        try {
            log.info("배치 프로젝트 조회 시작: 사용자수={}", userIds.size());

            // 배치 단위로 분할하여 처리
            List<List<String>> batches = partitionList(userIds, batchSize);
            List<Future<List<BatchProjectResult>>> futures = new ArrayList<>();

            for (List<String> batch : batches) {
                Future<List<BatchProjectResult>> future = executorService.submit(() ->
                        processBatchProjects(batch, stats));
                futures.add(future);
            }

            // 결과 수집
            List<BatchProjectResult> allResults = new ArrayList<>();
            for (Future<List<BatchProjectResult>> future : futures) {
                try {
                    List<BatchProjectResult> batchResults = future.get(timeoutSeconds, TimeUnit.SECONDS);
                    allResults.addAll(batchResults);
                } catch (Exception e) {
                    log.error("프로젝트 배치 처리 중 오류", e);
                    stats.recordError();
                }
            }

            stats.completeOperation();
            
            int successCount = (int) allResults.stream().mapToInt(r -> r.isSuccess() ? 1 : 0).sum();
            int failureCount = allResults.size() - successCount;

            return BatchOperationResult.success(operationId, allResults, successCount, failureCount);

        } catch (Exception e) {
            log.error("배치 프로젝트 조회 실패: operationId={}", operationId, e);
            stats.recordError();
            return BatchOperationResult.failure(operationId, "배치 작업 실패: " + e.getMessage());
        }
    }

    /**
     * 연결 상태 배치 검증
     */
    @Transactional
    public BatchOperationResult batchTestConnections(List<String> configIds) {
        String operationId = "batch_connection_test_" + System.currentTimeMillis();
        BatchOperationStats stats = new BatchOperationStats(operationId, configIds.size());
        operationStats.put(operationId, stats);

        try {
            log.info("배치 연결 테스트 시작: 설정수={}", configIds.size());

            List<JiraConfig> configs = jiraConfigRepository.findAllById(configIds);
            List<List<JiraConfig>> batches = partitionList(configs, batchSize);
            List<Future<List<BatchConnectionTestResult>>> futures = new ArrayList<>();

            for (List<JiraConfig> batch : batches) {
                Future<List<BatchConnectionTestResult>> future = executorService.submit(() ->
                        processBatchConnectionTests(batch, stats));
                futures.add(future);
            }

            // 결과 수집 및 DB 업데이트
            List<BatchConnectionTestResult> allResults = new ArrayList<>();
            for (Future<List<BatchConnectionTestResult>> future : futures) {
                try {
                    List<BatchConnectionTestResult> batchResults = future.get(timeoutSeconds, TimeUnit.SECONDS);
                    allResults.addAll(batchResults);
                    
                    // 연결 테스트 결과로 설정 업데이트
                    updateConnectionTestResults(batchResults);
                } catch (Exception e) {
                    log.error("연결 테스트 배치 처리 중 오류", e);
                    stats.recordError();
                }
            }

            stats.completeOperation();
            
            int successCount = (int) allResults.stream().mapToInt(r -> r.isSuccess() ? 1 : 0).sum();
            int failureCount = allResults.size() - successCount;

            return BatchOperationResult.success(operationId, allResults, successCount, failureCount);

        } catch (Exception e) {
            log.error("배치 연결 테스트 실패: operationId={}", operationId, e);
            stats.recordError();
            return BatchOperationResult.failure(operationId, "배치 작업 실패: " + e.getMessage());
        }
    }

    /**
     * 배치 작업 통계 조회
     */
    public Map<String, BatchOperationStats> getBatchOperationStats() {
        return new ConcurrentHashMap<>(operationStats);
    }

    /**
     * 완료된 오래된 통계 정리
     */
    public void cleanupOldStats() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        operationStats.entrySet().removeIf(entry -> {
            BatchOperationStats stats = entry.getValue();
            return stats.isCompleted() && stats.getStartTime().isBefore(threshold);
        });
        log.debug("오래된 배치 작업 통계 정리 완료");
    }

    // Private Helper Methods

    private JiraConfig getActiveJiraConfig(String userId) {
        return jiraConfigRepository.findByUserIdAndIsActiveTrue(userId).orElse(null);
    }

    private List<BatchCommentResult> processBatchComments(JiraConfig config, String apiToken, 
                                                        List<BatchCommentRequest> requests, 
                                                        BatchOperationStats stats) {
        return requests.stream().map(request -> {
            try {
                boolean success = addCommentWithRetry(config, apiToken, request.getIssueKey(), request.getComment());
                stats.recordSuccess();
                return new BatchCommentResult(request.getIssueKey(), success, null);
            } catch (Exception e) {
                stats.recordError();
                log.warn("배치 코멘트 추가 실패: issueKey={}", request.getIssueKey(), e);
                return new BatchCommentResult(request.getIssueKey(), false, e.getMessage());
            }
        }).collect(Collectors.toList());
    }

    private List<BatchProjectResult> processBatchProjects(List<String> userIds, BatchOperationStats stats) {
        return userIds.stream().map(userId -> {
            try {
                JiraConfig config = getActiveJiraConfig(userId);
                if (config == null) {
                    stats.recordError();
                    return new BatchProjectResult(userId, false, null, "활성 JIRA 설정 없음");
                }

                String apiToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
                List<JiraConfigDto.JiraProjectDto> projects = jiraApiService
                        .map(service -> service.getProjects(
                            config.getServerUrl(), config.getUsername(), apiToken))
                        .orElse(new ArrayList<>());
                
                stats.recordSuccess();
                return new BatchProjectResult(userId, true, projects, null);
            } catch (Exception e) {
                stats.recordError();
                log.warn("배치 프로젝트 조회 실패: userId={}", userId, e);
                return new BatchProjectResult(userId, false, null, e.getMessage());
            }
        }).collect(Collectors.toList());
    }

    private List<BatchConnectionTestResult> processBatchConnectionTests(List<JiraConfig> configs, BatchOperationStats stats) {
        return configs.stream().map(config -> {
            try {
                String apiToken = encryptionUtil.decrypt(config.getEncryptedApiToken());
                
                JiraConfigDto.TestConnectionDto testConfig = JiraConfigDto.TestConnectionDto.builder()
                        .serverUrl(config.getServerUrl())
                        .username(config.getUsername())
                        .apiToken(apiToken)
                        .build();

                JiraConfigDto.ConnectionStatusDto status = jiraApiService
                        .map(service -> service.testConnection(testConfig))
                        .orElse(JiraConfigDto.ConnectionStatusDto.builder()
                            .isConnected(false)
                            .status("SERVICE_UNAVAILABLE")
                            .message("JIRA API 서비스 사용 불가")
                            .build());
                stats.recordSuccess();
                
                return new BatchConnectionTestResult(config.getId(), status.getIsConnected(), status);
            } catch (Exception e) {
                stats.recordError();
                log.warn("배치 연결 테스트 실패: configId={}", config.getId(), e);
                
                JiraConfigDto.ConnectionStatusDto errorStatus = JiraConfigDto.ConnectionStatusDto.builder()
                        .isConnected(false)
                        .status("ERROR")
                        .message("테스트 실패: " + e.getMessage())
                        .lastTested(LocalDateTime.now())
                        .build();
                        
                return new BatchConnectionTestResult(config.getId(), false, errorStatus);
            }
        }).collect(Collectors.toList());
    }

    private boolean addCommentWithRetry(JiraConfig config, String apiToken, String issueKey, String comment) {
        for (int attempt = 1; attempt <= maxRetryAttempts; attempt++) {
            try {
                boolean success = jiraApiService
                        .map(service -> service.addCommentToIssue(
                            config.getServerUrl(), config.getUsername(), apiToken, issueKey, comment))
                        .orElse(false);
                        
                if (success) {
                    return true;
                }
                
                if (attempt < maxRetryAttempts) {
                    Thread.sleep(retryDelayMs);
                }
            } catch (Exception e) {
                log.warn("코멘트 추가 시도 실패: attempt={}, issueKey={}", attempt, issueKey, e);
                if (attempt < maxRetryAttempts) {
                    try {
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        return false;
    }

    private void updateConnectionTestResults(List<BatchConnectionTestResult> results) {
        try {
            for (BatchConnectionTestResult result : results) {
                JiraConfig config = jiraConfigRepository.findById(result.getConfigId()).orElse(null);
                if (config != null) {
                    if (result.isSuccess()) {
                        config.markConnectionSuccess();
                    } else {
                        config.markConnectionFailure(result.getStatus().getMessage());
                    }
                    jiraConfigRepository.save(config);
                }
            }
        } catch (Exception e) {
            log.error("연결 테스트 결과 업데이트 실패", e);
        }
    }

    private static <T> List<List<T>> partitionList(List<T> list, int batchSize) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += batchSize) {
            partitions.add(list.subList(i, Math.min(i + batchSize, list.size())));
        }
        return partitions;
    }

    // Inner Classes for Batch Operations

    public static class BatchCommentRequest {
        private String issueKey;
        private String comment;

        public BatchCommentRequest(String issueKey, String comment) {
            this.issueKey = issueKey;
            this.comment = comment;
        }

        public String getIssueKey() { return issueKey; }
        public String getComment() { return comment; }
    }

    public static class BatchCommentResult {
        private String issueKey;
        private boolean success;
        private String errorMessage;

        public BatchCommentResult(String issueKey, boolean success, String errorMessage) {
            this.issueKey = issueKey;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public String getIssueKey() { return issueKey; }
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
    }

    public static class BatchProjectResult {
        private String userId;
        private boolean success;
        private List<JiraConfigDto.JiraProjectDto> projects;
        private String errorMessage;

        public BatchProjectResult(String userId, boolean success, List<JiraConfigDto.JiraProjectDto> projects, String errorMessage) {
            this.userId = userId;
            this.success = success;
            this.projects = projects;
            this.errorMessage = errorMessage;
        }

        public String getUserId() { return userId; }
        public boolean isSuccess() { return success; }
        public List<JiraConfigDto.JiraProjectDto> getProjects() { return projects; }
        public String getErrorMessage() { return errorMessage; }
    }

    public static class BatchConnectionTestResult {
        private String configId;
        private boolean success;
        private JiraConfigDto.ConnectionStatusDto status;

        public BatchConnectionTestResult(String configId, boolean success, JiraConfigDto.ConnectionStatusDto status) {
            this.configId = configId;
            this.success = success;
            this.status = status;
        }

        public String getConfigId() { return configId; }
        public boolean isSuccess() { return success; }
        public JiraConfigDto.ConnectionStatusDto getStatus() { return status; }
    }

    public static class BatchOperationResult {
        private String operationId;
        private boolean success;
        private Object results;
        private int successCount;
        private int failureCount;
        private String errorMessage;

        private BatchOperationResult(String operationId, boolean success, Object results, 
                                   int successCount, int failureCount, String errorMessage) {
            this.operationId = operationId;
            this.success = success;
            this.results = results;
            this.successCount = successCount;
            this.failureCount = failureCount;
            this.errorMessage = errorMessage;
        }

        public static BatchOperationResult success(String operationId, Object results, int successCount, int failureCount) {
            return new BatchOperationResult(operationId, true, results, successCount, failureCount, null);
        }

        public static BatchOperationResult failure(String operationId, String errorMessage) {
            return new BatchOperationResult(operationId, false, null, 0, 0, errorMessage);
        }

        // Getters
        public String getOperationId() { return operationId; }
        public boolean isSuccess() { return success; }
        public Object getResults() { return results; }
        public int getSuccessCount() { return successCount; }
        public int getFailureCount() { return failureCount; }
        public String getErrorMessage() { return errorMessage; }
    }

    public static class BatchOperationStats {
        private String operationId;
        private int totalItems;
        private int successCount = 0;
        private int errorCount = 0;
        private int timeoutCount = 0;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean completed = false;

        public BatchOperationStats(String operationId, int totalItems) {
            this.operationId = operationId;
            this.totalItems = totalItems;
            this.startTime = LocalDateTime.now();
        }

        public synchronized void recordSuccess() { successCount++; }
        public synchronized void recordError() { errorCount++; }
        public synchronized void recordTimeout() { timeoutCount++; }

        public synchronized void completeOperation() {
            this.endTime = LocalDateTime.now();
            this.completed = true;
        }

        public long getExecutionTime() {
            LocalDateTime end = endTime != null ? endTime : LocalDateTime.now();
            return java.time.Duration.between(startTime, end).toMillis();
        }

        // Getters
        public String getOperationId() { return operationId; }
        public int getTotalItems() { return totalItems; }
        public int getSuccessCount() { return successCount; }
        public int getErrorCount() { return errorCount; }
        public int getTimeoutCount() { return timeoutCount; }
        public LocalDateTime getStartTime() { return startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public boolean isCompleted() { return completed; }
    }
}