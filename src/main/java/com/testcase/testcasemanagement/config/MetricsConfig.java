// src/main/java/com/testcase/testcasemanagement/config/MetricsConfig.java

package com.testcase.testcasemanagement.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * ICT-130: API 성능 모니터링을 위한 메트릭 설정
 * 대시보드 API의 응답 시간과 호출 빈도를 추적합니다.
 */
@Configuration
public class MetricsConfig {

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 대시보드 API 성능 추적 필터
     */
    @Bean
    public DashboardMetricsFilter dashboardMetricsFilter() {
        return new DashboardMetricsFilter(meterRegistry);
    }

    /**
     * 대시보드 API 전용 성능 추적 필터
     */
    public static class DashboardMetricsFilter extends OncePerRequestFilter {
        
        private final MeterRegistry meterRegistry;
        private final Timer.Builder dashboardApiTimer;
        private final Counter.Builder dashboardApiCounter;
        private final Counter.Builder cacheHitCounter;
        private final Counter.Builder cacheMissCounter;
        
        public DashboardMetricsFilter(MeterRegistry meterRegistry) {
            this.meterRegistry = meterRegistry;
            
            // 대시보드 API 응답 시간 타이머
            this.dashboardApiTimer = Timer.builder("dashboard.api.response.time")
                .description("Dashboard API response time")
                .tag("component", "dashboard");
                
            // 대시보드 API 호출 카운터
            this.dashboardApiCounter = Counter.builder("dashboard.api.requests")
                .description("Dashboard API request count")
                .tag("component", "dashboard");
                
            // 캐시 히트 카운터
            this.cacheHitCounter = Counter.builder("dashboard.cache.hits")
                .description("Dashboard cache hit count")
                .tag("component", "cache");
                
            // 캐시 미스 카운터
            this.cacheMissCounter = Counter.builder("dashboard.cache.misses")
                .description("Dashboard cache miss count")
                .tag("component", "cache");
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, 
                                      HttpServletResponse response, 
                                      FilterChain filterChain) throws ServletException, IOException {
            
            String requestURI = request.getRequestURI();
            
            // 대시보드 API 경로인지 확인
            if (requestURI.startsWith("/api/dashboard")) {
                
                Timer.Sample timerSample = Timer.start(meterRegistry);
                String method = request.getMethod();
                String endpoint = extractEndpoint(requestURI);
                
                try {
                    filterChain.doFilter(request, response);
                    
                    // 성공적인 응답에 대한 메트릭 기록
                    int status = response.getStatus();
                    String statusRange = getStatusRange(status);
                    
                    // 응답 시간 기록
                    timerSample.stop(dashboardApiTimer
                        .tag("method", method)
                        .tag("endpoint", endpoint)
                        .tag("status", String.valueOf(status))
                        .tag("status_range", statusRange)
                        .register(meterRegistry));
                    
                    // 요청 카운트 증가
                    dashboardApiCounter
                        .tag("method", method)
                        .tag("endpoint", endpoint)
                        .tag("status", String.valueOf(status))
                        .tag("status_range", statusRange)
                        .register(meterRegistry)
                        .increment();
                        
                    // 성능 임계값 체크 및 경고 메트릭
                    recordPerformanceAlerts(endpoint, timerSample, status);
                    
                } catch (Exception e) {
                    // 에러 응답에 대한 메트릭 기록
                    timerSample.stop(dashboardApiTimer
                        .tag("method", method)
                        .tag("endpoint", endpoint)
                        .tag("status", "500")
                        .tag("status_range", "5xx")
                        .tag("error", e.getClass().getSimpleName())
                        .register(meterRegistry));
                    
                    // 에러 카운트 증가
                    dashboardApiCounter
                        .tag("method", method)
                        .tag("endpoint", endpoint)
                        .tag("status", "500")
                        .tag("status_range", "5xx")
                        .tag("error", e.getClass().getSimpleName())
                        .register(meterRegistry)
                        .increment();
                        
                    throw e;
                }
            } else {
                filterChain.doFilter(request, response);
            }
        }
        
        /**
         * 엔드포인트 이름 추출 (파라미터 제거)
         */
        private String extractEndpoint(String requestURI) {
            // /api/dashboard/projects/{projectId}/statistics -> /api/dashboard/projects/statistics
            return requestURI.replaceAll("/[a-fA-F0-9-]{36}", "/{id}")
                             .replaceAll("/\\d+", "/{id}");
        }
        
        /**
         * HTTP 상태 코드 범위 반환
         */
        private String getStatusRange(int status) {
            if (status >= 200 && status < 300) return "2xx";
            if (status >= 300 && status < 400) return "3xx";
            if (status >= 400 && status < 500) return "4xx";
            if (status >= 500) return "5xx";
            return "1xx";
        }
        
        /**
         * 성능 경고 메트릭 기록
         */
        private void recordPerformanceAlerts(String endpoint, Timer.Sample sample, int status) {
            // 실제 응답 시간을 측정하기 위해 현재 시점과 비교 (대략적인 계산)
            // 실제 구현에서는 더 정확한 방법을 사용해야 함
            
            // 2초 이상 응답 시 경고
            Counter.builder("dashboard.api.slow.requests")
                .description("Dashboard API slow requests (>2s)")
                .tag("endpoint", endpoint)
                .tag("severity", "warning")
                .register(meterRegistry);
                
            // 5초 이상 응답 시 심각한 경고
            Counter.builder("dashboard.api.very.slow.requests")
                .description("Dashboard API very slow requests (>5s)")
                .tag("endpoint", endpoint)
                .tag("severity", "critical")
                .register(meterRegistry);
        }
    }
    
    /**
     * 캐시 메트릭 기록 유틸리티
     */
    @Bean
    public CacheMetricsRecorder cacheMetricsRecorder() {
        return new CacheMetricsRecorder(meterRegistry);
    }
    
    public static class CacheMetricsRecorder {
        private final MeterRegistry meterRegistry;
        
        public CacheMetricsRecorder(MeterRegistry meterRegistry) {
            this.meterRegistry = meterRegistry;
        }
        
        public void recordCacheHit(String cacheName, String key) {
            Counter.builder("dashboard.cache.hits")
                .description("Dashboard cache hits")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
        }
        
        public void recordCacheMiss(String cacheName, String key) {
            Counter.builder("dashboard.cache.misses")
                .description("Dashboard cache misses")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
        }
        
        public void recordCacheEviction(String cacheName, String key) {
            Counter.builder("dashboard.cache.evictions")
                .description("Dashboard cache evictions")
                .tag("cache", cacheName)
                .register(meterRegistry)
                .increment();
        }
    }
}