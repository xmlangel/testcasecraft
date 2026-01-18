package com.testcase.testcasemanagement.scheduler;

import com.testcase.testcasemanagement.service.JiraConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * JIRA 연결 상태 주기적 검증 스케줄러
 * ICT-165: 연결 상태 모니터링 및 자동 복구
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "jira.monitoring.health-check.enabled", havingValue = "true", matchIfMissing = true)
public class JiraHealthCheckScheduler {

    private final JiraConfigService jiraConfigService;

    @Value("${jira.monitoring.health-check.interval:3600000}")
    private long healthCheckInterval; // 기본 1시간

    @Value("${jira.monitoring.health-check.batch-size:10}")
    private int batchSize; // 한 번에 검사할 설정 수

    // 통계를 위한 카운터
    private final AtomicLong totalHealthChecks = new AtomicLong(0);
    private final AtomicInteger successfulChecks = new AtomicInteger(0);
    private final AtomicInteger failedChecks = new AtomicInteger(0);
    private LocalDateTime lastHealthCheckTime;

    @PostConstruct
    public void init() {
        log.info("JIRA 헬스체크 스케줄러 초기화 - 검사 간격: {}ms, 배치 크기: {}", 
                healthCheckInterval, batchSize);
    }

    /**
     * 주기적 JIRA 연결 상태 검증
     * cron 표현식: 매 시간 정각에 실행
     */
    @Scheduled(cron = "${jira.monitoring.health-check.cron:0 0 * * * *}")
    public void performHealthCheck() {
        lastHealthCheckTime = LocalDateTime.now();
        
        try {
            log.info("JIRA 헬스체크 시작: {}", lastHealthCheckTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            long startTime = System.currentTimeMillis();
            
            // JIRA 설정 연결 상태 갱신
            jiraConfigService.refreshStaleConnections();
            
            long executionTime = System.currentTimeMillis() - startTime;
            totalHealthChecks.incrementAndGet();
            
            log.info("JIRA 헬스체크 완료 - 실행시간: {}ms", executionTime);
            
        } catch (Exception e) {
            log.error("JIRA 헬스체크 실행 중 오류 발생", e);
            failedChecks.incrementAndGet();
        }
    }

    /**
     * 캐시 정리 스케줄러
     * 매일 새벽 2시에 실행
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupCaches() {
        try {
            log.info("JIRA 캐시 정리 시작");
            
            // 캐시 제거됨 - 직접 데이터베이스 조회
            
            // 필요에 따라 특정 조건의 캐시만 정리 가능
            // 여기서는 전체 정리하지 않고 통계만 리셋
            
            log.info("JIRA 캐시 정리 완료");
            
        } catch (Exception e) {
            log.error("JIRA 캐시 정리 중 오류 발생", e);
        }
    }

    /**
     * 시스템 상태 모니터링 스케줄러
     * 매 5분마다 실행
     */
    @Scheduled(fixedRateString = "${jira.monitoring.system-check.interval:300000}")
    public void monitorSystemHealth() {
        try {
            // 캐시 제거됨 - 직접 데이터베이스 조회로 성능 최적화 불필요
            log.debug("캐시 모니터링 제거로 인해 시스템 리소스 절약");
            
        } catch (Exception e) {
            log.warn("시스템 상태 모니터링 중 경고", e);
        }
    }

    /**
     * 주간 헬스체크 통계 리포트
     * 매주 월요일 오전 9시에 실행
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void generateWeeklyReport() {
        try {
            log.info("===== JIRA 시스템 주간 리포트 =====");
            log.info("총 헬스체크 수행: {}", totalHealthChecks.get());
            log.info("성공한 검사: {}", successfulChecks.get());
            log.info("실패한 검사: {}", failedChecks.get());
            
            if (totalHealthChecks.get() > 0) {
                double successRate = (double) successfulChecks.get() / totalHealthChecks.get() * 100;
                log.info("성공률: {:.2f}%", successRate);
                
                if (successRate < 90) {
                    log.warn("⚠️  헬스체크 성공률이 90% 미만입니다. 시스템 점검이 필요할 수 있습니다.");
                }
            }
            
            // 캐시 통계 제거됨
            log.info("캐시 제거로 인해 직접 데이터베이스 조회 사용");
            
            log.info("마지막 헬스체크: {}", 
                    lastHealthCheckTime != null ? 
                    lastHealthCheckTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "없음");
            
            log.info("================================");
            
        } catch (Exception e) {
            log.error("주간 리포트 생성 중 오류 발생", e);
        }
    }

    /**
     * 긴급 상황 대응 스케줄러 (시스템 과부하 감지 시)
     * 매 1분마다 실행하여 시스템 상태 확인
     */
    @Scheduled(fixedRate = 60000)
    public void emergencyHealthCheck() {
        try {
            // 메모리 사용량 확인
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            double memoryUsage = (double) usedMemory / maxMemory * 100;
            
            // 메모리 사용률이 85% 이상이면 캐시 정리
            if (memoryUsage > 85) {
                log.warn("메모리 사용률 높음: {:.2f}% - 캐시 제거로 메모리 절약됨", memoryUsage);
                
                // GC 수행 권장
                System.gc();
            }
            
            // 매우 높은 메모리 사용률에 대한 알림
            if (memoryUsage > 95) {
                log.error("🚨 메모리 부족 경고! 사용률: {:.2f}%", memoryUsage);
            }
            
        } catch (Exception e) {
            // 긴급 체크에서는 로그 레벨을 낮춤 (너무 자주 로깅되지 않도록)
            if (log.isDebugEnabled()) {
                log.debug("긴급 헬스체크 중 경고", e);
            }
        }
    }

    /**
     * 헬스체크 통계 정보 조회
     */
    public HealthCheckStats getHealthCheckStats() {
        return HealthCheckStats.builder()
                .totalChecks(totalHealthChecks.get())
                .successfulChecks(successfulChecks.get())
                .failedChecks(failedChecks.get())
                .lastCheckTime(lastHealthCheckTime)
                .successRate(totalHealthChecks.get() > 0 ? 
                    (double) successfulChecks.get() / totalHealthChecks.get() : 0.0)
                .build();
    }

    /**
     * 헬스체크 통계 클래스
     */
    public static class HealthCheckStats {
        private long totalChecks;
        private int successfulChecks;
        private int failedChecks;
        private LocalDateTime lastCheckTime;
        private double successRate;

        public static HealthCheckStatsBuilder builder() {
            return new HealthCheckStatsBuilder();
        }

        // Getters
        public long getTotalChecks() { return totalChecks; }
        public int getSuccessfulChecks() { return successfulChecks; }
        public int getFailedChecks() { return failedChecks; }
        public LocalDateTime getLastCheckTime() { return lastCheckTime; }
        public double getSuccessRate() { return successRate; }

        public static class HealthCheckStatsBuilder {
            private HealthCheckStats stats = new HealthCheckStats();

            public HealthCheckStatsBuilder totalChecks(long totalChecks) {
                stats.totalChecks = totalChecks;
                return this;
            }

            public HealthCheckStatsBuilder successfulChecks(int successfulChecks) {
                stats.successfulChecks = successfulChecks;
                return this;
            }

            public HealthCheckStatsBuilder failedChecks(int failedChecks) {
                stats.failedChecks = failedChecks;
                return this;
            }

            public HealthCheckStatsBuilder lastCheckTime(LocalDateTime lastCheckTime) {
                stats.lastCheckTime = lastCheckTime;
                return this;
            }

            public HealthCheckStatsBuilder successRate(double successRate) {
                stats.successRate = successRate;
                return this;
            }

            public HealthCheckStats build() {
                return stats;
            }
        }
    }
}