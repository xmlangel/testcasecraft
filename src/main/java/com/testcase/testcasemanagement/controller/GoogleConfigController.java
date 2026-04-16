// src/main/java/com/testcase/testcasemanagement/controller/GoogleConfigController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.GoogleConfig;
import com.testcase.testcasemanagement.service.GoogleConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Google Config", description = "사용자별 Google 서비스 계정 설정 API")
@RestController
@RequestMapping("/api/google-configs")
@RequiredArgsConstructor
@Slf4j
public class GoogleConfigController {
  private final GoogleConfigService googleConfigService;

  @Operation(summary = "내 Google 설정 조회")
  @GetMapping("/my")
  public ResponseEntity<?> getMyConfig(Authentication authentication) {
    String userId = authentication.getName();
    return googleConfigService
        .getConfigByUserId(userId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Google 설정 저장/업데이트")
  @PostMapping
  public ResponseEntity<?> saveConfig(
      Authentication authentication, @RequestBody Map<String, String> request) {
    String userId = authentication.getName();
    String jsonKeyContent = request.get("jsonKeyContent");

    if (jsonKeyContent == null || jsonKeyContent.trim().isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("message", "JSON 키 내용은 필수입니다."));
    }

    try {
      GoogleConfig saved = googleConfigService.saveConfig(userId, jsonKeyContent);
      return ResponseEntity.ok(saved);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    } catch (Exception e) {
      log.error("Google 설정 저장 실패: ", e);
      return ResponseEntity.internalServerError().body(Map.of("message", "설정 저장 중 서버 오류가 발생했습니다."));
    }
  }

  @Operation(summary = "Google 설정 삭제 (연동 해제)")
  @DeleteMapping("/my")
  public ResponseEntity<?> deleteMyConfig(Authentication authentication) {
    String userId = authentication.getName();
    googleConfigService.deleteConfig(userId);
    return ResponseEntity.ok(Map.of("message", "Google 설정이 삭제되었습니다."));
  }
}
