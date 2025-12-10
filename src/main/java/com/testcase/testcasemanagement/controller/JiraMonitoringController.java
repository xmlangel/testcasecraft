package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.service.JiraMonitoringService;
import com.testcase.testcasemanagement.service.JiraMonitoringService.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * JIRA 모니터링 시스템 REST API 컨트롤러
 * ICT-165: 모니터링 데이터 조회 및 관리
 */
@Tag(name = "JIRA - Monitoring", description = "JIRA 모니터링 API")
@RestController
@RequestMapping("/api/jira/monitoring")
@RequiredArgsConstructor
@Slf4j
public class JiraMonitoringController {

    private final JiraMonitoringService jiraMonitoringService;

    /**
     * 전체 시스템 헬스 체크
     */
    @Operation(summary = "시스템 헬스 체크", description = "JIRA 모니터링 시스템의 전체 헬스 상태를 조회합니다. (관리자 전용)")
    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemHealth() {
        try {
            Health health = jiraMonitoringService.health();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    "health", health,
                    "status", health.getStatus().getCode()));

        } catch (Exception e) {
            log.error("시스템 헬스 체크 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "헬스 체크 중 서버 오류가 발생했습니다.",
                    "error", e.getMessage()));
        }
    }

    /**
     * 시스템 메트릭 조회
     */
    @Operation(summary = "시스템 메트릭 조회", description = "JIRA 시스템의 주요 성과 지표(성공률, 응답시간 등)를 조회합니다. (관리자 전용)")
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemMetrics() {
        try {
            SystemMetrics metrics = jiraMonitoringService.getSystemMetrics();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    "metrics", metrics));

        } catch (Exception e) {
            log.error("시스템 메트릭 조회 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "메트릭 조회 중 서버 오류가 발생했습니다.",
                    "error", e.getMessage()));
        }
    }

    /**
     * 시간별 메트릭 조회
     */
    @Operation(summary = "시간별 메트릭 조회", description = "최근 24시간 동안의 시간별 성과 지표를 조회합니다. (관리자 전용)")
    @GetMapping("/metrics/hourly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getHourlyMetrics() {
        try {
            Map<String, HourlyMetrics> hourlyMetrics = jiraMonitoringService.getHourlyMetrics();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    "hourlyMetrics", hourlyMetrics,
                    "totalHours", hourlyMetrics.size()));

        } catch (Exception e) {
            log.error("시간별 메트릭 조회 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "시간별 메트릭 조회 중 서버 오류가 발생했습니다.",
                    "error", e.getMessage()));
        }
    }

    /**
     * 상세 시스템 리포트 생성
     */
    @Operation(summary = "시스템 리포트 생성", description = "JIRA 시스템 상태에 대한 상세 텍스트 리포트를 생성하여 다운로드합니다. (관리자 전용)")
    @GetMapping(value = "/report", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> generateSystemReport() {
        try {
            String report = jiraMonitoringService.generateSystemReport();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"jira-system-report-"
                            + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".txt\"")
                    .body(report);

        } catch (Exception e) {
            log.error("시스템 리포트 생성 API 오류", e);
            return ResponseEntity.internalServerError()
                    .body("시스템 리포트 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * JSON 형식 시스템 리포트
     */
    @Operation(summary = "시스템 리포트 조회 (JSON)", description = "JIRA 시스템 상태에 대한 상세 리포트를 JSON 형식으로 조회합니다. (관리자 전용)")
    @GetMapping("/report/json")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemReportJson() {
        try {
            SystemMetrics systemMetrics = jiraMonitoringService.getSystemMetrics();
            Map<String, HourlyMetrics> hourlyMetrics = jiraMonitoringService.getHourlyMetrics();
            Health health = jiraMonitoringService.health();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    "systemMetrics", systemMetrics,
                    "hourlyMetrics", hourlyMetrics,
                    "healthCheck", health,
                    "summary", Map.of(
                            "totalApiCalls", systemMetrics.getTotalApiCalls(),
                            "successRate", String.format("%.2f%%", systemMetrics.getSuccessRate()),
                            "averageResponseTime", systemMetrics.getAverageResponseTime() + "ms",
                            "systemStatus", systemMetrics.isSystemHealthy() ? "정상" : "경고",
                            "monitoringEnabled", systemMetrics.isMonitoringEnabled())));

        } catch (Exception e) {
            log.error("JSON 시스템 리포트 생성 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "JSON 리포트 생성 중 서버 오류가 발생했습니다.",
                    "error", e.getMessage()));
        }
    }

    /**
     * 메트릭 리셋 (관리자용)
     */
    @Operation(summary = "메트릭 초기화", description = "모든 모니터링 메트릭 데이터를 초기화합니다. (관리자 전용)")
    @DeleteMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetMetrics() {
        try {
            jiraMonitoringService.resetMetrics();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "모든 JIRA 모니터링 메트릭이 성공적으로 리셋되었습니다.",
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));

        } catch (Exception e) {
            log.error("메트릭 리셋 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "메트릭 리셋 중 서버 오류가 발생했습니다.",
                    "error", e.getMessage()));
        }
    }

    /**
     * 모니터링 통계 요약
     */
    @Operation(summary = "모니터링 요약 조회", description = "일반 사용자를 위한 JIRA 모니터링 시스템 요약 정보를 조회합니다.")
    @GetMapping("/summary")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMonitoringSummary() {
        try {
            SystemMetrics metrics = jiraMonitoringService.getSystemMetrics();
            Health health = jiraMonitoringService.health();

            // 사용자에게는 요약된 정보만 제공
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    "summary", Map.of(
                            "systemStatus", metrics.isSystemHealthy() ? "정상" : "점검 중",
                            "healthStatus", health.getStatus().getCode(),
                            "totalApiCalls", metrics.getTotalApiCalls(),
                            "successRate", String.format("%.1f%%", metrics.getSuccessRate()),
                            "averageResponseTime", metrics.getAverageResponseTime(),
                            "monitoringEnabled", metrics.isMonitoringEnabled(),
                            "lastHealthCheck",
                            metrics.getLastHealthCheck() != null
                                    ? metrics.getLastHealthCheck().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                    : "N/A")));

        } catch (Exception e) {
            log.error("모니터링 요약 조회 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "모니터링 요약 조회 중 서버 오류가 발생했습니다."));
        }
    }

    /**
     * 실시간 시스템 상태 (간단한 핑)
     */
    @Operation(summary = "시스템 상태 확인 (Ping)", description = "JIRA 모니터링 시스템의 가동 상태를 간단히 확인합니다.")
    @GetMapping("/ping")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> ping() {
        try {
            SystemMetrics metrics = jiraMonitoringService.getSystemMetrics();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                    "status", metrics.isSystemHealthy() ? "UP" : "WARNING",
                    "monitoringEnabled", metrics.isMonitoringEnabled()));

        } catch (Exception e) {
            log.error("시스템 핑 API 오류", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "status", "DOWN",
                    "message", "시스템 응답 중 오류가 발생했습니다."));
        }
    }
}