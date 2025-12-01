// src/main/java/com/testcase/testcasemanagement/service/MonitoringService.java

package com.testcase.testcasemanagement.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

/**
 * ICT-134: 대시보드 모니터링 서비스
 * 메트릭 수집, 성능 측정, 사용자 세션 추적 등의 기능을 제공합니다.
 */
@Service
public class MonitoringService {

    private static final Logger logger = LoggerFactory.getLogger(MonitoringService.class);

    @Autowired
    private Timer dashboardApiTimer;

    @Autowired
    private Counter dashboardApiCallCounter;

    @Autowired
    private Counter dashboardCacheHitCounter;

    @Autowired
    private Counter dashboardCacheMissCounter;

    @Autowired
    private AtomicLong concurrentUsersCounter;

    @Autowired
    private Counter dashboardDataSuccessCounter;

    @Autowired
    private Counter dashboardDataFailureCounter;

    @Autowired
    private Timer dashboardStatisticsTimer;

    @Autowired
    private Timer dashboardQueryTimer;

    /**
     * 대시보드 API 호출 시간을 측정하고 기록합니다.
     * 
     * @param apiName   API 이름
     * @param operation 실행할 작업
     * @return 작업 결과
     */
    public <T> T measureDashboardApiTime(String apiName, Supplier<T> operation) {
        dashboardApiCallCounter.increment();

        Timer.Sample sample = Timer.start();
        try {
            T result = operation.get();
            sample.stop(dashboardApiTimer);

            dashboardDataSuccessCounter.increment();
            logger.debug("Dashboard API [{}] 성공적으로 실행됨", apiName);
            return result;

        } catch (Exception e) {
            sample.stop(dashboardApiTimer);

            dashboardDataFailureCounter.increment();
            logger.error("Dashboard API [{}] 실행 중 오류 발생: {}", apiName, e.getMessage());
            throw e;
        }
    }

    /**
     * 대시보드 통계 계산 시간을 측정하고 기록합니다.
     * 
     * @param statisticsType 통계 타입
     * @param operation      통계 계산 작업
     * @return 통계 결과
     */
    public <T> T measureStatisticsCalculationTime(String statisticsType, Supplier<T> operation) {
        try {
            return dashboardStatisticsTimer.recordCallable(() -> {
                logger.debug("Dashboard 통계 [{}] 계산 시작", statisticsType);
                T result = operation.get();
                logger.debug("Dashboard 통계 [{}] 계산 완료", statisticsType);
                return result;
            });
        } catch (Exception e) {
            logger.error("Dashboard 통계 [{}] 계산 중 오류 발생: {}", statisticsType, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 데이터베이스 쿼리 실행 시간을 측정하고 기록합니다.
     * 
     * @param queryType 쿼리 타입
     * @param operation 쿼리 실행 작업
     * @return 쿼리 결과
     */
    public <T> T measureQueryTime(String queryType, Supplier<T> operation) {
        try {
            return dashboardQueryTimer.recordCallable(() -> {
                logger.debug("Dashboard 쿼리 [{}] 실행 시작", queryType);
                T result = operation.get();
                logger.debug("Dashboard 쿼리 [{}] 실행 완료", queryType);
                return result;
            });
        } catch (Exception e) {
            logger.error("Dashboard 쿼리 [{}] 실행 중 오류 발생: {}", queryType, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 캐시 히트를 기록합니다.
     * 
     * @param cacheType 캐시 타입
     */
    public void recordCacheHit(String cacheType) {
        dashboardCacheHitCounter.increment();
        logger.debug("Cache hit recorded for type: {}", cacheType);
    }

    /**
     * 캐시 미스를 기록합니다.
     * 
     * @param cacheType 캐시 타입
     */
    public void recordCacheMiss(String cacheType) {
        dashboardCacheMissCounter.increment();
        logger.debug("Cache miss recorded for type: {}", cacheType);
    }

    /**
     * 사용자 세션 시작을 기록합니다.
     */
    public void recordUserSessionStart() {
        long currentUsers = concurrentUsersCounter.incrementAndGet();
        logger.debug("User session started. Current concurrent users: {}", currentUsers);
    }

    /**
     * 사용자 세션 종료를 기록합니다.
     */
    public void recordUserSessionEnd() {
        long currentUsers = concurrentUsersCounter.decrementAndGet();
        if (currentUsers < 0) {
            concurrentUsersCounter.set(0);
            currentUsers = 0;
        }
        logger.debug("User session ended. Current concurrent users: {}", currentUsers);
    }

    /**
     * 현재 동시 사용자 수를 반환합니다.
     * 
     * @return 동시 사용자 수
     */
    public long getCurrentConcurrentUsers() {
        return concurrentUsersCounter.get();
    }

    /**
     * 캐시 히트율을 계산합니다.
     * 
     * @param cacheType 캐시 타입
     * @return 캐시 히트율 (0.0 ~ 1.0)
     */
    public double calculateCacheHitRate(String cacheType) {
        try {
            double hits = dashboardCacheHitCounter.count();
            double misses = dashboardCacheMissCounter.count();
            double total = hits + misses;

            if (total == 0) {
                return 0.0;
            }

            return hits / total;
        } catch (Exception e) {
            logger.error("캐시 히트율 계산 중 오류 발생: {}", e.getMessage());
            return 0.0;
        }
    }

    /**
     * 대시보드 성능 메트릭 요약을 로그로 출력합니다.
     */
    public void logPerformanceMetrics() {
        try {
            double cacheHitRate = calculateCacheHitRate("dashboard");
            long concurrentUsers = getCurrentConcurrentUsers();
            long totalApiCalls = (long) dashboardApiCallCounter.count();
            long successfulCalls = (long) dashboardDataSuccessCounter.count();
            long failedCalls = (long) dashboardDataFailureCounter.count();

            double successRate = totalApiCalls > 0 ? (double) successfulCalls / totalApiCalls * 100 : 0.0;

            logger.info("=== Dashboard Performance Metrics ===");
            logger.info("Cache Hit Rate: {:.2f}%", cacheHitRate * 100);
            logger.info("Concurrent Users: {}", concurrentUsers);
            logger.info("Total API Calls: {}", totalApiCalls);
            logger.info("API Success Rate: {:.2f}%", successRate);
            logger.info("Failed API Calls: {}", failedCalls);
            logger.info("=====================================");

        } catch (Exception e) {
            logger.error("성능 메트릭 로그 출력 중 오류 발생: {}", e.getMessage());
        }
    }
}