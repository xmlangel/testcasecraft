package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.UpdateSchedulerDto;
import com.testcase.testcasemanagement.service.SchedulerConfigService;
import com.testcase.testcasemanagement.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/system-settings")
@RequiredArgsConstructor
@Tag(name = "System Setting", description = "전역 시스템 설정 관리 API")
public class SystemSettingController {

  private final SystemSettingService systemSettingService;
  private final SchedulerConfigService schedulerConfigService;

  public static final String RAG_ENABLED_KEY = "RAG_ENABLED";

  /** RAG 관련 스케줄러 taskKey 목록 */
  private static final List<String> RAG_SCHEDULER_KEYS =
      List.of("rag-cleanup", "rag-auto-analysis");

  @GetMapping("/{key}")
  @Operation(summary = "설정 조회", description = "특정 키의 설정값을 조회합니다.")
  public ResponseEntity<String> getSetting(@PathVariable String key) {
    String value = systemSettingService.getSetting(key, null);
    if (value == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(value);
  }

  @GetMapping("/rag/status")
  @Operation(summary = "RAG 기능 활성화 상태 조회", description = "현재 RAG 기능이 켜져있는지 확인합니다.")
  public ResponseEntity<Map<String, Boolean>> getRagStatus() {
    boolean isEnabled = systemSettingService.getBooleanSetting(RAG_ENABLED_KEY, true);
    return ResponseEntity.ok(Map.of("enabled", isEnabled));
  }

  @PutMapping("/{key}")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "설정 업데이트", description = "관리자만 시스템 설정값을 변경할 수 있습니다.")
  public ResponseEntity<Void> updateSetting(
      @PathVariable String key, @RequestBody Map<String, String> payload) {
    String value = payload.get("value");
    String description = payload.get("description");

    if (value == null) {
      return ResponseEntity.badRequest().build();
    }

    systemSettingService.updateSetting(key, value, description);

    // RAG_ENABLED=false 시 RAG 관련 스케줄러를 DB에서 비활성화 (자동 재시작 방지)
    if (RAG_ENABLED_KEY.equals(key) && "false".equalsIgnoreCase(value)) {
      for (String taskKey : RAG_SCHEDULER_KEYS) {
        try {
          UpdateSchedulerDto dto = new UpdateSchedulerDto();
          dto.setEnabled(false);
          schedulerConfigService.updateConfig(taskKey, dto);
          log.info("RAG 비활성화로 인해 스케줄러 중지: taskKey={}", taskKey);
        } catch (Exception e) {
          // 스케줄러 설정이 없을 수도 있으므로 오류는 로그로만 처리
          log.warn("RAG 스케줄러 중지 실패 (설정 없을 수 있음): taskKey={}, error={}", taskKey, e.getMessage());
        }
      }
    }

    return ResponseEntity.ok().build();
  }
}
