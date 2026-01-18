package com.testcase.testcasemanagement.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * JIRA 통합 시스템 모니터링 서비스
 * ICT-165: 포괄적인 모니터링 및 메트릭 수집
 */
@Service
@Slf4j
public class JiraMonitoringService implements HealthIndicator {

    private final JiraBatchProcessingService jiraBatchProcessingService;
    private final JiraConnectionManager jiraConnectionManager;

    public JiraMonitoringService(
            @Lazy Optional<JiraBatchProcessingService> jiraBatchProcessingService,
            @Lazy Optional<JiraConnectionManager> jiraConnectionManager) {
        this.jiraBatchProcessingService = jiraBatchProcessingService.orElse(null);
        this.jiraConnectionManager = jiraConnectionManager.orElse(null);
    }

    @Value("${jira.monitoring.enabled:true}")
    private boolean monitoringEnabled;

    @Value("${jira.monitoring.metric-retention-hours:72}")
    private int metricRetentionHours;

    // 시스템 메트릭 수집
    private final AtomicLong totalApiCalls = new AtomicLong(0);
    private final AtomicLong successfulApiCalls = new AtomicLong(0);
    private final AtomicLong failedApiCalls = new AtomicLong(0);
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    private final AtomicLong totalResponseTime = new AtomicLong(0);

    // 시간별 메트릭 저장
    private final Map<String, HourlyMetrics> hourlyMetrics = new ConcurrentHashMap<>();
    private volatile LocalDateTime lastHealthCheck = LocalDateTime.now();
    private volatile boolean systemHealthy = true;
    private volatile String lastErrorMessage = null;

    @PostConstruct
    public void init() {
        if (monitoringEnabled) {
            log.info("JIRA 모니터링 서비스 초기화 완료 - 메트릭 보존: {}시간", metricRetentionHours);
        } else {
            log.info("JIRA 모니터링 서비스 비활성화됨");
        }
    }

    /**
     * Spring Boot Actuator Health Check 구현
     */
    @Override
    public Health health() {
        if (!monitoringEnabled) {
            return Health.up()
                    .withDetail("monitoring", "disabled")
                    .build();
        }

        try {
            // 전체 시스템 상태 평가
            Health.Builder healthBuilder = systemHealthy ? Health.up() : Health.down();

            // 기본 통계 추가
            healthBuilder
                    .withDetail("lastHealthCheck", lastHealthCheck.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .withDetail("totalApiCalls", totalApiCalls.get())
                    .withDetail("successfulApiCalls", successfulApiCalls.get())
                    .withDetail("failedApiCalls", failedApiCalls.get())
                    .withDetail("successRate", calculateSuccessRate())
                    .withDetail("averageResponseTime", calculateAverageResponseTime());

            // 캐시 제거됨 - 직접 데이터베이스 조회로 변경

            // 연결 풀 상태
            if (jiraConnectionManager != null) {
                var poolStats = jiraConnectionManager.getConnectionPoolStats();
                healthBuilder
                        .withDetail("connectionPoolActive", poolStats.getActiveConnections())
                        .withDetail("connectionPoolMax", poolStats.getMaxConnections())
                        .withDetail("connectionReuseRate", String.format("%.2f%%", poolStats.getReuseRate()));
            }

            // 배치 처리 상태
            if (jiraBatchProcessingService != null) {
                var batchStats = jiraBatchProcessingService.getBatchOperationStats();
                healthBuilder
                        .withDetail("activeBatchOperations", batchStats.size())
                        .withDetail("completedBatchOperations",
                                batchStats.values().stream().mapToLong(s -> s.isCompleted() ? 1 : 0).sum());
            }

            // 에러 정보 (있는 경우)
            if (lastErrorMessage != null) {
                healthBuilder.withDetail("lastError", lastErrorMessage);
            }

            return healthBuilder.build();

        } catch (Exception e) {
            log.error("Health check 수행 중 오류 발생", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("lastHealthCheck", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
        }
    }

    /**
     * API 호출 메트릭 기록
     */
    public void recordApiCall(boolean success, long responseTimeMs) {
        if (!monitoringEnabled)
            return;

        totalApiCalls.incrementAndGet();
        totalResponseTime.addAndGet(responseTimeMs);

        if (success) {
            successfulApiCalls.incrementAndGet();
        } else {
            failedApiCalls.incrementAndGet();
        }

        // 시간별 메트릭 업데이트
        updateHourlyMetrics(success, responseTimeMs);

        // 시스템 상태 업데이트
        updateSystemHealth();
    }

    /**
     * 에러 발생 기록
     */
    public void recordError(String errorMessage, Exception exception) {
        if (!monitoringEnabled)
            return;

        this.lastErrorMessage = errorMessage;
        this.systemHealthy = false;

        log.error("JIRA 시스템 에러 기록: {}", errorMessage, exception);

        // 시간별 에러 통계 업데이트
        String hourKey = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));
        HourlyMetrics metrics = hourlyMetrics.computeIfAbsent(hourKey, k -> new HourlyMetrics());
        metrics.incrementErrors();
    }

    /**
     * 연결 상태 변경 기록
     */
    public void recordConnectionChange(int activeConnections) {
        if (!monitoringEnabled)
            return;

        this.activeConnections.set(activeConnections);
    }

    /**
     * 시스템 메트릭 조회
     */
    public SystemMetrics getSystemMetrics() {
        if (!monitoringEnabled) {
            return SystemMetrics.disabled();
        }

        return SystemMetrics.builder()
                .monitoringEnabled(monitoringEnabled)
                .lastHealthCheck(lastHealthCheck)
                .systemHealthy(systemHealthy)
                .totalApiCalls(totalApiCalls.get())
                .successfulApiCalls(successfulApiCalls.get())
                .failedApiCalls(failedApiCalls.get())
                .successRate(calculateSuccessRate())
                .averageResponseTime(calculateAverageResponseTime())
                .activeConnections(activeConnections.get())
                .lastErrorMessage(lastErrorMessage)
                .hourlyMetricsCount(hourlyMetrics.size())
                .build();
    }

    /**
     * 시간별 메트릭 조회
     */
    public Map<String, HourlyMetrics> getHourlyMetrics() {
        cleanupOldMetrics();
        return new ConcurrentHashMap<>(hourlyMetrics);
    }

    /**
     * 메트릭 리셋 (관리자용)
     */
    public void resetMetrics() {
        if (!monitoringEnabled)
            return;

        totalApiCalls.set(0);
        successfulApiCalls.set(0);
        failedApiCalls.set(0);
        totalResponseTime.set(0);
        activeConnections.set(0);
        hourlyMetrics.clear();
        lastErrorMessage = null;
        systemHealthy = true;

        log.info("JIRA 모니터링 메트릭이 리셋되었습니다.");
    }

    /**
     * 상세 시스템 리포트 생성
     */
    public String generateSystemReport() {
        if (!monitoringEnabled) {
            return "JIRA 모니터링이 비활성화되어 있습니다.";
        }

        StringBuilder report = new StringBuilder();
        SystemMetrics metrics = getSystemMetrics();

        report.append("=== JIRA 시스템 모니터링 리포트 ===\n");
        report.append(String.format("생성 시간: %s\n", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
        report.append(String.format("시스템 상태: %s\n", metrics.isSystemHealthy() ? "정상" : "경고"));
        report.append(String.format("총 API 호출: %,d회\n", metrics.getTotalApiCalls()));
        report.append(String.format("성공률: %.2f%%\n", metrics.getSuccessRate()));
        report.append(String.format("평균 응답시간: %,d ms\n", metrics.getAverageResponseTime()));
        report.append(String.format("활성 연결 수: %d개\n", metrics.getActiveConnections()));

        if (metrics.getLastErrorMessage() != null) {
            report.append(String.format("마지막 에러: %s\n", metrics.getLastErrorMessage()));
        }

        // 시간별 통계
        Map<String, HourlyMetrics> hourlyStats = getHourlyMetrics();
        if (!hourlyStats.isEmpty()) {
            report.append("\n=== 시간별 통계 (최근 24시간) ===\n");
            hourlyStats.entrySet().stream()
                    .sorted(Map.Entry.<String, HourlyMetrics>comparingByKey().reversed())
                    .limit(24)
                    .forEach(entry -> {
                        HourlyMetrics hour = entry.getValue();
                        report.append(String.format("%s: 호출 %d회, 성공률 %.1f%%, 평균응답 %dms\n",
                                entry.getKey(),
                                hour.getTotalCalls(),
                                hour.getSuccessRate(),
                                hour.getAverageResponseTime()));
                    });
        }

        report.append("=================================");
        return report.toString();
    }

    // Private Helper Methods

    private double calculateSuccessRate() {
        long total = totalApiCalls.get();
        return total > 0 ? (double) successfulApiCalls.get() / total * 100 : 0.0;
    }

    private long calculateAverageResponseTime() {
        long total = totalApiCalls.get();
        return total > 0 ? totalResponseTime.get() / total : 0;
    }

    private void updateHourlyMetrics(boolean success, long responseTimeMs) {
        String hourKey = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));
        HourlyMetrics metrics = hourlyMetrics.computeIfAbsent(hourKey, k -> new HourlyMetrics());

        metrics.addCall(success, responseTimeMs);
    }

    private void updateSystemHealth() {
        lastHealthCheck = LocalDateTime.now();

        // 성공률이 90% 이상이면 시스템을 건강한 상태로 복구
        if (calculateSuccessRate() >= 90.0 && totalApiCalls.get() > 10) {
            systemHealthy = true;
            lastErrorMessage = null;
        }

        // 성공률이 70% 미만이면 경고 상태
        if (calculateSuccessRate() < 70.0 && totalApiCalls.get() > 20) {
            systemHealthy = false;
        }
    }

    private void cleanupOldMetrics() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(metricRetentionHours);
        String cutoffKey = cutoff.format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));

        hourlyMetrics.entrySet().removeIf(entry -> entry.getKey().compareTo(cutoffKey) < 0);
    }

    // Inner Classes

    public static class HourlyMetrics {
        private final AtomicLong totalCalls = new AtomicLong(0);
        private final AtomicLong successfulCalls = new AtomicLong(0);
        private final AtomicLong totalResponseTime = new AtomicLong(0);
        private final AtomicLong errorCount = new AtomicLong(0);

        public void addCall(boolean success, long responseTimeMs) {
            totalCalls.incrementAndGet();
            totalResponseTime.addAndGet(responseTimeMs);
            if (success) {
                successfulCalls.incrementAndGet();
            }
        }

        public void incrementErrors() {
            errorCount.incrementAndGet();
        }

        public long getTotalCalls() {
            return totalCalls.get();
        }

        public long getSuccessfulCalls() {
            return successfulCalls.get();
        }

        public long getErrorCount() {
            return errorCount.get();
        }

        public double getSuccessRate() {
            long total = totalCalls.get();
            return total > 0 ? (double) successfulCalls.get() / total * 100 : 0.0;
        }

        public long getAverageResponseTime() {
            long total = totalCalls.get();
            return total > 0 ? totalResponseTime.get() / total : 0;
        }
    }

    public static class SystemMetrics {
        private boolean monitoringEnabled;
        private LocalDateTime lastHealthCheck;
        private boolean systemHealthy;
        private long totalApiCalls;
        private long successfulApiCalls;
        private long failedApiCalls;
        private double successRate;
        private long averageResponseTime;
        private int activeConnections;
        private String lastErrorMessage;
        private int hourlyMetricsCount;

        public static SystemMetrics disabled() {
            SystemMetrics metrics = new SystemMetrics();
            metrics.monitoringEnabled = false;
            return metrics;
        }

        public static SystemMetricsBuilder builder() {
            return new SystemMetricsBuilder();
        }

        // Getters
        public boolean isMonitoringEnabled() {
            return monitoringEnabled;
        }

        public LocalDateTime getLastHealthCheck() {
            return lastHealthCheck;
        }

        public boolean isSystemHealthy() {
            return systemHealthy;
        }

        public long getTotalApiCalls() {
            return totalApiCalls;
        }

        public long getSuccessfulApiCalls() {
            return successfulApiCalls;
        }

        public long getFailedApiCalls() {
            return failedApiCalls;
        }

        public double getSuccessRate() {
            return successRate;
        }

        public long getAverageResponseTime() {
            return averageResponseTime;
        }

        public int getActiveConnections() {
            return activeConnections;
        }

        public String getLastErrorMessage() {
            return lastErrorMessage;
        }

        public int getHourlyMetricsCount() {
            return hourlyMetricsCount;
        }

        public static class SystemMetricsBuilder {
            private SystemMetrics metrics = new SystemMetrics();

            public SystemMetricsBuilder monitoringEnabled(boolean enabled) {
                metrics.monitoringEnabled = enabled;
                return this;
            }

            public SystemMetricsBuilder lastHealthCheck(LocalDateTime lastHealthCheck) {
                metrics.lastHealthCheck = lastHealthCheck;
                return this;
            }

            public SystemMetricsBuilder systemHealthy(boolean systemHealthy) {
                metrics.systemHealthy = systemHealthy;
                return this;
            }

            public SystemMetricsBuilder totalApiCalls(long totalApiCalls) {
                metrics.totalApiCalls = totalApiCalls;
                return this;
            }

            public SystemMetricsBuilder successfulApiCalls(long successfulApiCalls) {
                metrics.successfulApiCalls = successfulApiCalls;
                return this;
            }

            public SystemMetricsBuilder failedApiCalls(long failedApiCalls) {
                metrics.failedApiCalls = failedApiCalls;
                return this;
            }

            public SystemMetricsBuilder successRate(double successRate) {
                metrics.successRate = successRate;
                return this;
            }

            public SystemMetricsBuilder averageResponseTime(long averageResponseTime) {
                metrics.averageResponseTime = averageResponseTime;
                return this;
            }

            public SystemMetricsBuilder activeConnections(int activeConnections) {
                metrics.activeConnections = activeConnections;
                return this;
            }

            public SystemMetricsBuilder lastErrorMessage(String lastErrorMessage) {
                metrics.lastErrorMessage = lastErrorMessage;
                return this;
            }

            public SystemMetricsBuilder hourlyMetricsCount(int hourlyMetricsCount) {
                metrics.hourlyMetricsCount = hourlyMetricsCount;
                return this;
            }

            public SystemMetrics build() {
                return metrics;
            }
        }
    }
}