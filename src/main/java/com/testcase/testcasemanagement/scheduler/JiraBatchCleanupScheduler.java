package com.testcase.testcasemanagement.scheduler;

import com.testcase.testcasemanagement.service.JiraBatchProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * JIRA 배치 처리 정리 스케줄러
 * ICT-165: 배치 처리 통계 및 리소스 정리
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "jira.batch-processing.enabled", havingValue = "true", matchIfMissing = false)
public class JiraBatchCleanupScheduler {

    private final JiraBatchProcessingService batchProcessingService;

    @PostConstruct
    public void init() {
        log.info("JIRA 배치 정리 스케줄러 초기화 완료");
    }

    /**
     * 오래된 배치 작업 통계 정리 스케줄러
     * 매일 새벽 3시에 실행
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldBatchStats() {
        try {
            log.info("배치 작업 통계 정리 시작");
            
            batchProcessingService.cleanupOldStats();
            
            log.info("배치 작업 통계 정리 완료");
            
        } catch (Exception e) {
            log.error("배치 작업 통계 정리 중 오류 발생", e);
        }
    }

    /**
     * 배치 처리 시스템 상태 모니터링
     * 매 30분마다 실행
     */
    @Scheduled(fixedRateString = "1800000") // 30분
    public void monitorBatchProcessingHealth() {
        try {
            var stats = batchProcessingService.getBatchOperationStats();
            
            if (!stats.isEmpty()) {
                int totalOperations = stats.size();
                long completedOperations = stats.values().stream()
                        .mapToLong(stat -> stat.isCompleted() ? 1 : 0)
                        .sum();
                
                long runningOperations = totalOperations - completedOperations;
                
                if (runningOperations > 10) {
                    log.warn("⚠️  많은 수의 배치 작업이 실행 중입니다: 실행중={}, 총작업={}", 
                            runningOperations, totalOperations);
                }
                
                // DEBUG 레벨로 상세 통계 출력
                if (log.isDebugEnabled()) {
                    log.debug("배치 처리 상태 - 총작업: {}, 완료: {}, 실행중: {}", 
                            totalOperations, completedOperations, runningOperations);
                }
            }
            
        } catch (Exception e) {
            log.warn("배치 처리 상태 모니터링 중 경고", e);
        }
    }

    /**
     * 메모리 사용량 기반 긴급 정리
     * 매 10분마다 실행하여 메모리 상태 확인
     */
    @Scheduled(fixedRate = 600000) // 10분
    public void emergencyMemoryCleanup() {
        try {
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            double memoryUsage = (double) usedMemory / maxMemory * 100;
            
            // 메모리 사용률이 80% 이상이면 오래된 배치 통계 정리
            if (memoryUsage > 80) {
                log.warn("메모리 사용률 높음: {:.2f}% - 배치 통계 정리 수행", memoryUsage);
                batchProcessingService.cleanupOldStats();
                
                // GC 수행 권장
                System.gc();
                
                // 정리 후 메모리 사용률 재확인
                runtime = Runtime.getRuntime();
                totalMemory = runtime.totalMemory();
                freeMemory = runtime.freeMemory();
                usedMemory = totalMemory - freeMemory;
                double newMemoryUsage = (double) usedMemory / maxMemory * 100;
                
                log.info("배치 통계 정리 후 메모리 사용률: {:.2f}% → {:.2f}%", 
                        memoryUsage, newMemoryUsage);
            }
            
            // 매우 높은 메모리 사용률에 대한 알림
            if (memoryUsage > 90) {
                log.error("🚨 배치 처리 시스템 메모리 부족 경고! 사용률: {:.2f}%", memoryUsage);
            }
            
        } catch (Exception e) {
            // 긴급 정리에서는 로그 레벨을 낮춤
            if (log.isDebugEnabled()) {
                log.debug("긴급 메모리 정리 중 경고", e);
            }
        }
    }
}