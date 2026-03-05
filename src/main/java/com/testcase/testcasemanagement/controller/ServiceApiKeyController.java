package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@Tag(name = "Service API Keys", description = "서비스 API 키 관리")
public class ServiceApiKeyController {

    private final ServiceApiKeyRepository serviceApiKeyRepository;

    // ===================== 관리자 전용 API =====================

    @GetMapping("/api/admin/service-api-keys")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "모든 서비스 API 키 조회 (관리자)")
    public ResponseEntity<List<ServiceApiKey>> getAllKeys() {
        return ResponseEntity.ok(serviceApiKeyRepository.findAll());
    }

    @PostMapping("/api/admin/service-api-keys/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "새로운 서비스 API 키 발급 (관리자, 기본 1년 유효)")
    public ResponseEntity<Map<String, Object>> generateKeyAdmin(
            @RequestParam(defaultValue = "Jira Integration Key") String name) {
        return generateApiKey(name, "admin");
    }

    @DeleteMapping("/api/admin/service-api-keys/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "서비스 API 키 삭제(비활성화) (관리자)")
    public ResponseEntity<Map<String, Object>> deleteKeyAdmin(@PathVariable String id) {
        Optional<ServiceApiKey> keyOpt = serviceApiKeyRepository.findById(id);
        if (keyOpt.isPresent()) {
            ServiceApiKey key = keyOpt.get();
            key.setActive(false);
            serviceApiKeyRepository.save(key);
            return ResponseEntity.ok(Map.of("success", true, "message", "API 키가 비활성화되었습니다."));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ===================== 일반 사용자 API =====================

    @GetMapping("/api/users/me/service-api-keys")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "내 서비스 API 키 목록 조회")
    public ResponseEntity<List<ServiceApiKey>> getMyKeys(
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        List<ServiceApiKey> keys = serviceApiKeyRepository.findByCreatedByOrderByCreatedAtDesc(username);
        // 보안: apiKey 값을 마스킹하여 반환 (앞 8자만 표시)
        keys.forEach(key -> {
            String masked = key.getApiKey();
            if (masked != null && masked.length() > 8) {
                key.setApiKey(masked.substring(0, 8) + "...(hidden)");
            }
        });
        return ResponseEntity.ok(keys);
    }

    @PostMapping("/api/users/me/service-api-keys/generate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "내 서비스 API 키 발급 (기본 1년 유효)")
    public ResponseEntity<Map<String, Object>> generateMyKey(
            @RequestParam(defaultValue = "My API Key") String name,
            @AuthenticationPrincipal UserDetails userDetails) {
        // 키 이름 중복/초과 방지: 사용자당 최대 10개
        String username = userDetails.getUsername();
        long activeCount = serviceApiKeyRepository
                .findByCreatedByOrderByCreatedAtDesc(username)
                .stream()
                .filter(ServiceApiKey::isActive)
                .count();
        if (activeCount >= 10) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "API 키는 최대 10개까지 발급할 수 있습니다."));
        }
        return generateApiKey(name, username);
    }

    @DeleteMapping("/api/users/me/service-api-keys/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "내 서비스 API 키 삭제(비활성화)")
    public ResponseEntity<Map<String, Object>> deleteMyKey(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        Optional<ServiceApiKey> keyOpt = serviceApiKeyRepository.findByIdAndCreatedBy(id, username);
        if (keyOpt.isPresent()) {
            ServiceApiKey key = keyOpt.get();
            key.setActive(false);
            serviceApiKeyRepository.save(key);
            return ResponseEntity.ok(Map.of("success", true, "message", "API 키가 비활성화되었습니다."));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ===================== 공통 헬퍼 =====================

    private ResponseEntity<Map<String, Object>> generateApiKey(String name, String owner) {
        SecureRandom secureRandom = new SecureRandom();
        byte[] keyBytes = new byte[32];
        secureRandom.nextBytes(keyBytes);
        String apiKey = Base64.getUrlEncoder().withoutPadding().encodeToString(keyBytes);

        ServiceApiKey newKey = ServiceApiKey.builder()
                .name(name)
                .apiKey(apiKey)
                .expiresAt(LocalDateTime.now().plusYears(1))
                .isActive(true)
                .build();

        serviceApiKeyRepository.save(newKey);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API 키가 발급되었습니다. 다시 확인할 수 없으니 안전한 곳에 보관하세요.",
                "apiKey", apiKey,
                "keyId", newKey.getId(),
                "name", name,
                "expiresAt", newKey.getExpiresAt().toString()));
    }
}
