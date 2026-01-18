// src/main/java/com/testcase/testcasemanagement/config/MonitoringConfig.java

package com.testcase.testcasemanagement.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicLong;

/**
 * ICT-134: 대시보드 API 모니터링을 위한 메트릭 설정
 * 응답 시간, 에러율, 캐시 히트율, 동시 사용자 수 등의 메트릭을 제공합니다.
 */
@Configuration
public class MonitoringConfig {

    /**
     * 대시보드 API 응답 시간 메트릭
     */
    @Bean
    public Timer dashboardApiTimer(MeterRegistry meterRegistry) {
        return Timer.builder("dashboard.api.response.time")
                .description("Dashboard API response times")
                .tag("component", "dashboard")
                .register(meterRegistry);
    }

    /**
     * 대시보드 API 호출 횟수 카운터
     */
    @Bean
    public Counter dashboardApiCallCounter(MeterRegistry meterRegistry) {
        return Counter.builder("dashboard.api.calls.total")
                .description("Total dashboard API calls")
                .tag("component", "dashboard")
                .register(meterRegistry);
    }

    /**
     * 대시보드 캐시 히트율 메트릭
     */
    @Bean
    public Counter dashboardCacheHitCounter(MeterRegistry meterRegistry) {
        return Counter.builder("dashboard.cache.hits")
                .description("Dashboard cache hits")
                .tag("type", "hit")
                .register(meterRegistry);
    }

    @Bean
    public Counter dashboardCacheMissCounter(MeterRegistry meterRegistry) {
        return Counter.builder("dashboard.cache.misses")
                .description("Dashboard cache misses")
                .tag("type", "miss")
                .register(meterRegistry);
    }

    /**
     * 동시 사용자 수 추적을 위한 게이지
     */
    @Bean
    public AtomicLong concurrentUsersCounter() {
        return new AtomicLong(0);
    }

    @Bean
    public Gauge concurrentUsersGauge(MeterRegistry meterRegistry, AtomicLong concurrentUsersCounter) {
        return Gauge.builder("dashboard.concurrent.users", concurrentUsersCounter, AtomicLong::get)
                .description("Current number of concurrent users")
                .tag("component", "dashboard")
                .register(meterRegistry);
    }

    /**
     * 대시보드 데이터 조회 성공률 메트릭
     */
    @Bean
    public Counter dashboardDataSuccessCounter(MeterRegistry meterRegistry) {
        return Counter.builder("dashboard.data.retrieval.success")
                .description("Successful dashboard data retrievals")
                .tag("result", "success")
                .register(meterRegistry);
    }

    @Bean
    public Counter dashboardDataFailureCounter(MeterRegistry meterRegistry) {
        return Counter.builder("dashboard.data.retrieval.failure")
                .description("Failed dashboard data retrievals")
                .tag("result", "failure")
                .register(meterRegistry);
    }

    /**
     * 대시보드 통계 계산 시간 메트릭
     */
    @Bean
    public Timer dashboardStatisticsTimer(MeterRegistry meterRegistry) {
        return Timer.builder("dashboard.statistics.calculation.time")
                .description("Time taken to calculate dashboard statistics")
                .tag("component", "statistics")
                .register(meterRegistry);
    }

    /**
     * 대시보드 쿼리 성능 메트릭
     */
    @Bean
    public Timer dashboardQueryTimer(MeterRegistry meterRegistry) {
        return Timer.builder("dashboard.query.execution.time")
                .description("Database query execution time for dashboard")
                .tag("component", "query")
                .register(meterRegistry);
    }

    /**
     * JVM 메모리 사용량 게이지 (대시보드 성능 모니터링용)
     */
    @Bean
    public Gauge jvmMemoryUsageGauge(MeterRegistry meterRegistry) {
        return Gauge.builder("jvm.memory.usage.dashboard", this, value -> {
                    Runtime runtime = Runtime.getRuntime();
                    long totalMemory = runtime.totalMemory();
                    long freeMemory = runtime.freeMemory();
                    return (double) (totalMemory - freeMemory) / totalMemory * 100;
                })
                .description("JVM memory usage for dashboard monitoring")
                .tag("type", "heap")
                .register(meterRegistry);
    }
}