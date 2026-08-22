package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.UpdateSchedulerDto;
import com.testcase.testcasemanagement.exception.RagVectorWriteDisabledException;
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

  /** 벡터 쓰기(색인·임베딩 생성)만 따로 끄는 설정. 질의는 이 값과 무관하게 계속 된다. */
  public static final String RAG_VECTOR_WRITE_ENABLED_KEY =
      RagVectorWriteDisabledException.SETTING_KEY;

  /** RAG 관련 스케줄러 taskKey 목록 */
  private static final List<String> RAG_SCHEDULER_KEYS =
      List.of("rag-cleanup", "rag-auto-analysis");

  /** 새 벡터를 만드는 스케줄러. 정리(rag-cleanup)는 벡터를 만들지 않으므로 여기 포함하지 않는다. */
  private static final String RAG_AUTO_ANALYSIS_TASK_KEY = "rag-auto-analysis";

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
    boolean vectorWriteEnabled =
        systemSettingService.getBooleanSetting(RAG_VECTOR_WRITE_ENABLED_KEY, true);
    return ResponseEntity.ok(
        Map.of("enabled", isEnabled, "vectorWriteEnabled", vectorWriteEnabled));
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

    // 벡터 쓰기를 끄면 새 벡터를 만드는 스케줄러도 함께 내린다.
    // 설정만 끄고 스케줄러를 두면 다음 주기에 다시 색인을 시도한다.
    if (RAG_VECTOR_WRITE_ENABLED_KEY.equals(key) && "false".equalsIgnoreCase(value)) {
      try {
        UpdateSchedulerDto dto = new UpdateSchedulerDto();
        dto.setEnabled(false);
        schedulerConfigService.updateConfig(RAG_AUTO_ANALYSIS_TASK_KEY, dto);
        log.info("벡터 색인 중지로 스케줄러를 내립니다: taskKey={}", RAG_AUTO_ANALYSIS_TASK_KEY);
      } catch (Exception e) {
        log.warn(
            "스케줄러 중지 실패 (설정 없을 수 있음): taskKey={}, error={}",
            RAG_AUTO_ANALYSIS_TASK_KEY,
            e.getMessage());
      }
    }

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
