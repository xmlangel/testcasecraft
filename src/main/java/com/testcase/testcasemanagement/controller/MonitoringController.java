// src/main/java/com/testcase/testcasemanagement/controller/MonitoringController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.PageVisitMetricsDto;
import com.testcase.testcasemanagement.dto.PageVisitRecordRequest;
import com.testcase.testcasemanagement.service.MonitoringService;
import com.testcase.testcasemanagement.service.PageVisitMetricsService;
import io.micrometer.core.instrument.MeterRegistry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.concurrent.TimeUnit;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * ICT-134: 대시보드 모니터링 및 헬스체크 컨트롤러
 * 시스템 상태, 성능 메트릭, 헬스체크 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/monitoring")
@Tag(name = "Monitoring", description = "시스템 모니터링 및 헬스체크 API")
public class MonitoringController implements HealthIndicator {

    @Autowired
    private MonitoringService monitoringService;

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private PageVisitMetricsService pageVisitMetricsService;

    /**
     * 대시보드 헬스체크 엔드포인트
     * 대시보드 관련 시스템 상태를 종합적으로 확인합니다.
     */
    @GetMapping("/health/dashboard")
    @Operation(summary = "대시보드 헬스체크", description = "대시보드 시스템의 전반적인 상태를 확인합니다.")
    public ResponseEntity<Map<String, Object>> dashboardHealthCheck() {
        Map<String, Object> healthStatus = new HashMap<>();
        
        try {
            // 기본 시스템 상태
            healthStatus.put("status", "UP");
            healthStatus.put("timestamp", LocalDateTime.now());
            
            // 성능 메트릭
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("concurrentUsers", monitoringService.getCurrentConcurrentUsers());
            metrics.put("cacheHitRate", monitoringService.calculateCacheHitRate("dashboard"));
            
            // JVM 메모리 상태
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            Map<String, Object> memoryInfo = new HashMap<>();
            memoryInfo.put("maxMemory", maxMemory / (1024 * 1024) + "MB");
            memoryInfo.put("totalMemory", totalMemory / (1024 * 1024) + "MB");
            memoryInfo.put("usedMemory", usedMemory / (1024 * 1024) + "MB");
            memoryInfo.put("freeMemory", freeMemory / (1024 * 1024) + "MB");
            memoryInfo.put("memoryUsagePercentage", String.format("%.1f%%", (double) usedMemory / maxMemory * 100));
            
            healthStatus.put("metrics", metrics);
            healthStatus.put("memory", memoryInfo);
            
            // 시스템 경고 상태 확인
            Map<String, String> warnings = new HashMap<>();
            
            // 메모리 사용률 경고
            double memoryUsage = (double) usedMemory / maxMemory;
            if (memoryUsage > 0.8) {
                warnings.put("memory", "High memory usage: " + String.format("%.1f%%", memoryUsage * 100));
            }
            
            // 동시 사용자 수 경고
            long concurrentUsers = monitoringService.getCurrentConcurrentUsers();
            if (concurrentUsers > 100) {
                warnings.put("concurrentUsers", "High concurrent user count: " + concurrentUsers);
            }
            
            // 캐시 히트율 경고
            double cacheHitRate = monitoringService.calculateCacheHitRate("dashboard");
            if (cacheHitRate < 0.7) {
                warnings.put("cacheHitRate", "Low cache hit rate: " + String.format("%.1f%%", cacheHitRate * 100));
            }
            
            if (!warnings.isEmpty()) {
                healthStatus.put("warnings", warnings);
                healthStatus.put("status", "WARNING");
            }
            
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            healthStatus.put("status", "DOWN");
            healthStatus.put("error", e.getMessage());
            healthStatus.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(503).body(healthStatus);
        }
    }

    /**
     * 대시보드 성능 메트릭 조회
     */
    @GetMapping("/metrics/dashboard")
    @Operation(summary = "대시보드 성능 메트릭", description = "대시보드의 상세 성능 지표를 조회합니다.")
    public ResponseEntity<Map<String, Object>> getDashboardMetrics() {
        Map<String, Object> dashboardMetrics = new HashMap<>();
        
        try {
            // API 호출 통계
            Map<String, Object> apiMetrics = new HashMap<>();
            apiMetrics.put("totalCalls", meterRegistry.counter("dashboard.api.calls.total").count());
            apiMetrics.put("successfulCalls", meterRegistry.counter("dashboard.data.retrieval.success").count());
            apiMetrics.put("failedCalls", meterRegistry.counter("dashboard.data.retrieval.failure").count());
            
            // 응답 시간 통계
            Map<String, Object> responseTimeMetrics = new HashMap<>();
            try {
                var timer = meterRegistry.timer("dashboard.api.response.time");
                responseTimeMetrics.put("count", timer.count());
                responseTimeMetrics.put("meanTime", String.format("%.2fms", timer.mean(TimeUnit.MILLISECONDS)));
                responseTimeMetrics.put("maxTime", String.format("%.2fms", timer.max(TimeUnit.MILLISECONDS)));
            } catch (Exception e) {
                responseTimeMetrics.put("error", "Timer metrics not available yet");
            }
            
            // 캐시 통계
            Map<String, Object> cacheMetrics = new HashMap<>();
            cacheMetrics.put("hits", meterRegistry.counter("dashboard.cache.hits").count());
            cacheMetrics.put("misses", meterRegistry.counter("dashboard.cache.misses").count());
            cacheMetrics.put("hitRate", String.format("%.2f%%", monitoringService.calculateCacheHitRate("dashboard") * 100));
            
            // 사용자 통계
            Map<String, Object> userMetrics = new HashMap<>();
            userMetrics.put("concurrentUsers", monitoringService.getCurrentConcurrentUsers());
            
            dashboardMetrics.put("timestamp", LocalDateTime.now());
            dashboardMetrics.put("api", apiMetrics);
            dashboardMetrics.put("responseTime", responseTimeMetrics);
            dashboardMetrics.put("cache", cacheMetrics);
            dashboardMetrics.put("users", userMetrics);
            
            return ResponseEntity.ok(dashboardMetrics);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve dashboard metrics: " + e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 시스템 리소스 상태 조회
     */
    @GetMapping("/health/resources")
    @Operation(summary = "시스템 리소스 상태", description = "CPU, 메모리, 디스크 등 시스템 리소스 상태를 확인합니다.")
    public ResponseEntity<Map<String, Object>> getSystemResources() {
        Map<String, Object> resources = new HashMap<>();
        
        try {
            // JVM 메모리 정보
            Runtime runtime = Runtime.getRuntime();
            Map<String, Object> memory = new HashMap<>();
            memory.put("maxMemoryMB", runtime.maxMemory() / (1024 * 1024));
            memory.put("totalMemoryMB", runtime.totalMemory() / (1024 * 1024));
            memory.put("freeMemoryMB", runtime.freeMemory() / (1024 * 1024));
            memory.put("usedMemoryMB", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024));
            
            // 프로세서 정보
            Map<String, Object> processor = new HashMap<>();
            processor.put("availableProcessors", runtime.availableProcessors());
            
            // 시스템 프로퍼티
            Map<String, Object> systemInfo = new HashMap<>();
            systemInfo.put("javaVersion", System.getProperty("java.version"));
            systemInfo.put("osName", System.getProperty("os.name"));
            systemInfo.put("osVersion", System.getProperty("os.version"));
            
            resources.put("timestamp", LocalDateTime.now());
            resources.put("memory", memory);
            resources.put("processor", processor);
            resources.put("system", systemInfo);
            resources.put("status", "UP");
            
            return ResponseEntity.ok(resources);
            
        } catch (Exception e) {
            resources.put("status", "ERROR");
            resources.put("error", e.getMessage());
            resources.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(500).body(resources);
        }
    }

    /**
     * 서버 현재 시간 조회 (시간대 정보 포함)
     */
    @GetMapping("/server-time")
    @Operation(summary = "서버 현재 시간 조회", description = "서버의 현재 시간과 시간대 정보를 반환합니다.")
    public ResponseEntity<Map<String, Object>> getServerTime() {
        try {
            Map<String, Object> timeInfo = new HashMap<>();
            
            // 서버 시간대 정보
            ZoneId systemZone = ZoneId.systemDefault();
            ZonedDateTime zonedDateTime = ZonedDateTime.now(systemZone);
            LocalDateTime localDateTime = LocalDateTime.now();
            
            // UTC 시간
            ZonedDateTime utcDateTime = ZonedDateTime.now(ZoneId.of("UTC"));
            
            // 포맷터
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
            
            timeInfo.put("serverTime", localDateTime.format(formatter));
            timeInfo.put("serverTimeISO", zonedDateTime.format(isoFormatter));
            timeInfo.put("utcTime", utcDateTime.format(formatter));
            timeInfo.put("utcTimeISO", utcDateTime.format(isoFormatter));
            timeInfo.put("timezone", systemZone.getId());
            timeInfo.put("timezoneOffset", zonedDateTime.getOffset().toString());
            timeInfo.put("isUTC", systemZone.getId().equals("UTC") || systemZone.getId().equals("Z"));
            timeInfo.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(timeInfo);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "ERROR");
            error.put("error", e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 서버 현재 시간 조회 (ISO 8601 형식)
     */
    @GetMapping("/server-time-iso")
    @Operation(summary = "서버 현재 시간 조회 (ISO)", description = "서버의 현재 시간을 ISO 8601 형식으로 반환합니다.")
    public ResponseEntity<Map<String, Object>> getServerTimeIso() {
        try {
            Map<String, Object> timeInfo = new HashMap<>();
            ZonedDateTime utcDateTime = ZonedDateTime.now(ZoneId.of("UTC"));
            
            timeInfo.put("serverTime", utcDateTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
            
            return ResponseEntity.ok(timeInfo);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "ERROR");
            error.put("error", e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 페이지 방문을 기록합니다.
     */
    @PostMapping("/usage/page-visits")
    @Operation(summary = "페이지 방문 기록", description = "페이지 방문 시 호출하여 방문 수를 수집합니다.")
    public ResponseEntity<Void> recordPageVisit(@Valid @RequestBody PageVisitRecordRequest request,
                                                HttpServletRequest httpServletRequest) {
        String clientIp = extractClientIp(httpServletRequest);
        boolean recorded = pageVisitMetricsService.recordVisit(request.getPagePath(), request.getVisitorId(), clientIp);
        return recorded ? ResponseEntity.accepted().build() : ResponseEntity.noContent().build();
    }

    /**
     * 현재 페이지 방문 메트릭을 조회합니다.
     */
    @GetMapping("/usage/page-visits")
    @Operation(summary = "페이지 방문 메트릭", description = "수집된 페이지 방문 지표를 조회합니다.")
    public ResponseEntity<PageVisitMetricsDto> getPageVisitMetrics() {
        PageVisitMetricsDto metrics = pageVisitMetricsService.getCurrentMetrics();
        return ResponseEntity.ok(metrics);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            int commaIndex = xForwardedFor.indexOf(',');
            return commaIndex > 0 ? xForwardedFor.substring(0, commaIndex).trim() : xForwardedFor.trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Spring Boot Actuator HealthIndicator 구현
     */
    @Override
    public Health health() {
        try {
            // 기본 헬스체크 로직
            long concurrentUsers = monitoringService.getCurrentConcurrentUsers();
            double cacheHitRate = monitoringService.calculateCacheHitRate("dashboard");
            
            // 메모리 사용률 확인
            Runtime runtime = Runtime.getRuntime();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            double memoryUsage = (double) usedMemory / runtime.maxMemory();
            
            Health.Builder builder = Health.up()
                    .withDetail("concurrentUsers", concurrentUsers)
                    .withDetail("cacheHitRate", String.format("%.2f%%", cacheHitRate * 100))
                    .withDetail("memoryUsage", String.format("%.1f%%", memoryUsage * 100));
            
            // 경고 상태 확인
            if (memoryUsage > 0.8 || cacheHitRate < 0.5) {
                return builder.status("WARNING").build();
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
