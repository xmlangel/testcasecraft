// src/main/java/com/testcase/testcasemanagement/controller/SchedulerInfoController.java

package com.testcase.testcasemanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 스케줄러 정보 조회 API
 */
@RestController
@RequestMapping("/api/admin/scheduler")
@Tag(name = "Admin - Scheduler", description = "스케줄러 정보 조회 API")
public class SchedulerInfoController {

    @GetMapping("/tasks")
    @Operation(summary = "스케줄된 작업 목록", description = "현재 등록된 스케줄 작업 목록을 조회합니다.")
    public ResponseEntity<Map<String, Object>> getScheduledTasks() {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> tasks = new ArrayList<>();

        // RAG 고아 문서 정리
        Map<String, Object> ragCleanup = new HashMap<>();
        ragCleanup.put("name", "RAG 고아 문서 정리");
        ragCleanup.put("method", "SchedulingConfig.cleanupOrphanedRagDocuments()");
        ragCleanup.put("schedule", "매일 새벽 1시 (0 0 1 * * *)");
        ragCleanup.put("type", "CRON");
        ragCleanup.put("description", "DB에 존재하지 않는 테스트케이스 ID를 가진 RAG 문서 삭제");
        tasks.add(ragCleanup);

        // 미사용 첨부파일 정리
        Map<String, Object> attachmentCleanup = new HashMap<>();
        attachmentCleanup.put("name", "미사용 첨부파일 정리");
        attachmentCleanup.put("method", "SchedulingConfig.cleanupUnusedAttachments()");
        attachmentCleanup.put("schedule", "매일 새벽 2시 (0 0 2 * * *)");
        attachmentCleanup.put("type", "CRON");
        attachmentCleanup.put("description", "7일 이상 사용되지 않은 첨부파일 삭제");
        tasks.add(attachmentCleanup);

        // 성능 메트릭 로깅
        Map<String, Object> perfMetrics = new HashMap<>();
        perfMetrics.put("name", "성능 메트릭 로깅");
        perfMetrics.put("method", "SchedulingConfig.logPerformanceMetrics()");
        perfMetrics.put("schedule", "매 5분마다 (fixedRate = 300000ms)");
        perfMetrics.put("type", "FIXED_RATE");
        perfMetrics.put("description", "시스템 성능 메트릭 로깅");
        tasks.add(perfMetrics);

        response.put("totalTasks", tasks.size());
        response.put("tasks", tasks);
        response.put("note", "스케줄된 작업은 서버 시간대를 기준으로 실행됩니다.");

        return ResponseEntity.ok(response);
    }
}
