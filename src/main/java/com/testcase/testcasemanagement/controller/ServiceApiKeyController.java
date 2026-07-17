package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ServiceApiKeyResponse;
import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import com.testcase.testcasemanagement.service.RedirectTokenStore;
import com.testcase.testcasemanagement.util.ApiKeyHasher;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Service API Keys", description = "서비스 API 키 관리")
public class ServiceApiKeyController {

  private final ServiceApiKeyRepository serviceApiKeyRepository;
  private final RedirectTokenStore redirectTokenStore;
  private final JwtTokenUtil jwtTokenUtil;

  // ===================== 관리자 전용 API =====================

  @GetMapping("/api/admin/service-api-keys")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "모든 서비스 API 키 조회 (관리자, 키 값 제외 메타데이터만)")
  public ResponseEntity<List<ServiceApiKeyResponse>> getAllKeys() {
    List<ServiceApiKeyResponse> keys =
        serviceApiKeyRepository.findAll().stream().map(ServiceApiKeyResponse::from).toList();
    return ResponseEntity.ok(keys);
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
  public ResponseEntity<List<ServiceApiKeyResponse>> getMyKeys(
      @AuthenticationPrincipal UserDetails userDetails) {
    String username = userDetails.getUsername();
    // 키 값은 DB에 해시로만 저장되며 재조회 불가 — 메타데이터만 DTO로 반환한다.
    // (이전엔 관리 엔티티에 setApiKey 로 in-place 마스킹 → OSIV flush 시 DB 값 오염 위험)
    List<ServiceApiKeyResponse> keys =
        serviceApiKeyRepository.findByCreatedByOrderByCreatedAtDesc(username).stream()
            .map(ServiceApiKeyResponse::from)
            .toList();
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
    long activeCount =
        serviceApiKeyRepository.findByCreatedByOrderByCreatedAtDesc(username).stream()
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
      @PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
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

  // ===================== 보안 리다이렉트 토큰 API =====================

  /**
   * Forge 앱이 X-API-KEY 헤더로 인증하여 단기 임시 토큰(5분)을 발급받습니다. 이 토큰은 URL에 안전하게 포함될 수 있으며, 1회 사용 후 자동 폐기됩니다.
   * 쿼리 파라미터 방식(?apiKey=) 대신 이 흐름을 사용합니다.
   */
  @PostMapping("/api/service-api-keys/redirect-token")
  @Operation(summary = "임시 리다이렉트 토큰 발급 (X-API-KEY 헤더 필수)")
  public ResponseEntity<Map<String, Object>> issueRedirectToken(HttpServletRequest request) {
    String apiKey = request.getHeader("X-API-KEY");
    if (apiKey == null || apiKey.isBlank()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "X-API-KEY 헤더가 누락되었습니다."));
    }

    String apiKeyHash = ApiKeyHasher.sha256Hex(apiKey);
    Optional<ServiceApiKey> keyOpt =
        serviceApiKeyRepository.findByApiKeyAndIsActiveTrue(apiKeyHash);
    if (keyOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "유효하지 않은 API 키입니다."));
    }

    ServiceApiKey serviceApiKey = keyOpt.get();
    if (serviceApiKey.getExpiresAt().isBefore(LocalDateTime.now())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "만료된 API 키입니다."));
    }

    // 임시 토큰 저장소에도 원본 키 대신 해시를 담는다 (인메모리 노출 표면 축소).
    String redirectToken = redirectTokenStore.generateToken(apiKeyHash);
    return ResponseEntity.ok(Map.of("token", redirectToken, "expiresInSeconds", 300));
  }

  /** 임시 토큰을 JWT 액세스 토큰으로 교환합니다. 1회성: 호출 즉시 임시 토큰이 폐기됩니다. */
  @PostMapping("/api/service-api-keys/exchange-token")
  @Operation(summary = "임시 토큰 → JWT 액세스 토큰 교환 (1회성)")
  public ResponseEntity<Map<String, Object>> exchangeRedirectToken(
      @RequestBody Map<String, String> body) {
    String token = body.get("token");
    if (token == null || token.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", "token 필드가 누락되었습니다."));
    }

    // 저장소에는 API 키 해시가 담겨 있다 (issueRedirectToken 참조).
    String apiKeyHash = redirectTokenStore.consumeToken(token);
    if (apiKeyHash == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "임시 토큰이 유효하지 않거나 만료되었습니다."));
    }

    Optional<ServiceApiKey> keyOpt =
        serviceApiKeyRepository.findByApiKeyAndIsActiveTrue(apiKeyHash);
    if (keyOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "API 키가 비활성화되었습니다."));
    }

    ServiceApiKey serviceApiKey = keyOpt.get();
    // service-account 용 UserDetails 생성 후 JWT 발급
    UserDetails serviceUser =
        User.builder()
            .username("service-account:" + serviceApiKey.getName())
            .password("")
            .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_TESTER")))
            .build();

    String accessToken = jwtTokenUtil.generateAccessToken(serviceUser);
    return ResponseEntity.ok(
        Map.of(
            "accessToken",
            accessToken,
            "tokenType",
            "Bearer",
            "expiresIn",
            jwtTokenUtil.getAccessTokenExpirationTime() / 1000));
  }

  // ===================== 공통 헬퍼 =====================

  private ResponseEntity<Map<String, Object>> generateApiKey(String name, String owner) {
    SecureRandom secureRandom = new SecureRandom();
    byte[] keyBytes = new byte[32];
    secureRandom.nextBytes(keyBytes);
    String apiKey = Base64.getUrlEncoder().withoutPadding().encodeToString(keyBytes);

    // DB에는 원본 키가 아닌 SHA-256 해시를 저장한다 (평문 미저장). 원본은 이 응답에서 1회만 노출.
    ServiceApiKey newKey =
        ServiceApiKey.builder()
            .name(name)
            .apiKey(ApiKeyHasher.sha256Hex(apiKey))
            .createdBy(owner)
            .expiresAt(LocalDateTime.now().plusYears(1))
            .isActive(true)
            .build();

    serviceApiKeyRepository.save(newKey);

    return ResponseEntity.ok(
        Map.of(
            "success",
            true,
            "message",
            "API 키가 발급되었습니다. 다시 확인할 수 없으니 안전한 곳에 보관하세요.",
            "apiKey",
            apiKey,
            "keyId",
            newKey.getId(),
            "name",
            name,
            "expiresAt",
            newKey.getExpiresAt().toString()));
  }
}
