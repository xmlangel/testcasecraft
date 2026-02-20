package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system-settings")
@RequiredArgsConstructor
@Tag(name = "System Setting", description = "전역 시스템 설정 관리 API")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    public static final String RAG_ENABLED_KEY = "RAG_ENABLED";

    @GetMapping("/{key}")
    @Operation(summary = "설정 조회", description = "특정 키의 설정값을 조회합니다.")
    public ResponseEntity<String> getSetting(@PathVariable String key) {
        // 기본적으로 접근 누구나 가능하도록 (특히 RAG_ENABLED 같은 상태는 조회 필요)
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
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        String value = payload.get("value");
        String description = payload.get("description");

        if (value == null) {
            return ResponseEntity.badRequest().build();
        }

        systemSettingService.updateSetting(key, value, description);
        return ResponseEntity.ok().build();
    }
}
