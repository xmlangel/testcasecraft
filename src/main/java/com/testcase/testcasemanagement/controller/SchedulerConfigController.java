package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.SchedulerConfigDto;
import com.testcase.testcasemanagement.dto.UpdateSchedulerDto;
import com.testcase.testcasemanagement.service.SchedulerConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 스케줄러 설정 관리 API
 */
@RestController
@RequestMapping("/api/admin/scheduler")
@Tag(name = "Admin - Scheduler Config", description = "스케줄러 설정 관리 API")
public class SchedulerConfigController {

    private final SchedulerConfigService schedulerConfigService;

    @Autowired
    public SchedulerConfigController(SchedulerConfigService schedulerConfigService) {
        this.schedulerConfigService = schedulerConfigService;
    }

    /**
     * 모든 스케줄 설정 조회
     */
    @GetMapping("/configs")
    @Operation(summary = "스케줄 설정 목록", description = "모든 스케줄 설정을 조회합니다.")
    public ResponseEntity<List<SchedulerConfigDto>> getAllConfigs() {
        List<SchedulerConfigDto> configs = schedulerConfigService.getAllConfigs();
        return ResponseEntity.ok(configs);
    }

    /**
     * 특정 스케줄 설정 조회
     */
    @GetMapping("/configs/{taskKey}")
    @Operation(summary = "스케줄 설정 조회", description = "특정 스케줄 설정을 조회합니다.")
    public ResponseEntity<SchedulerConfigDto> getConfig(@PathVariable String taskKey) {
        SchedulerConfigDto config = schedulerConfigService.getConfigByTaskKey(taskKey);
        return ResponseEntity.ok(config);
    }

    /**
     * 스케줄 설정 업데이트
     */
    @PutMapping("/configs/{taskKey}")
    @Operation(summary = "스케줄 설정 업데이트", description = "스케줄 설정을 업데이트합니다. (Cron 표현식, 활성화 여부 등)")
    public ResponseEntity<SchedulerConfigDto> updateConfig(
            @PathVariable String taskKey,
            @Valid @RequestBody UpdateSchedulerDto dto) {
        SchedulerConfigDto updated = schedulerConfigService.updateConfig(taskKey, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * 스케줄 활성화/비활성화 토글
     */
    @PostMapping("/configs/{taskKey}/toggle")
    @Operation(summary = "스케줄 활성화/비활성화", description = "스케줄을 활성화 또는 비활성화합니다.")
    public ResponseEntity<SchedulerConfigDto> toggleEnabled(@PathVariable String taskKey) {
        SchedulerConfigDto updated = schedulerConfigService.toggleEnabled(taskKey);
        return ResponseEntity.ok(updated);
    }

    /**
     * 스케줄 즉시 실행
     */
    @PostMapping("/configs/{taskKey}/execute")
    @Operation(summary = "스케줄 즉시 실행", description = "스케줄 작업을 즉시 실행합니다.")
    public ResponseEntity<Map<String, String>> executeNow(@PathVariable String taskKey) {
        schedulerConfigService.executeNow(taskKey);
        return ResponseEntity.ok(Map.of(
                "message", "스케줄 작업이 즉시 실행되었습니다.",
                "taskKey", taskKey));
    }
}
