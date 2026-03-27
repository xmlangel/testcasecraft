package com.testcase.testcasemanagement.service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 단기 임시 리다이렉트 토큰을 인메모리에 저장하는 컴포넌트. Forge 앱이 API 키를 직접 URL에 노출하는 대신, 이 토큰을 통해 안전하게 인증합니다.
 *
 * <p>토큰 특성: - TTL: 5분 (짧은 유효기간) - 1회성: 사용(소비) 후 즉시 삭제 - UUID 기반으로 API 키를 추측 불가
 */
@Component
public class RedirectTokenStore {

  private static final long TTL_MILLIS = 5 * 60 * 1000L; // 5분

  private record TokenEntry(String apiKey, Instant expiresAt) {}

  private final ConcurrentHashMap<String, TokenEntry> store = new ConcurrentHashMap<>();

  /**
   * 새 임시 토큰을 생성하고 저장한 후 반환합니다.
   *
   * @param apiKey 연결할 서비스 API 키
   * @return 생성된 임시 토큰 (UUID 형식)
   */
  public String generateToken(String apiKey) {
    String token = UUID.randomUUID().toString();
    store.put(token, new TokenEntry(apiKey, Instant.now().plusMillis(TTL_MILLIS)));
    return token;
  }

  /**
   * 임시 토큰을 소비하여 대응되는 API 키를 반환합니다. 1회성 - 호출 즉시 토큰이 삭제됩니다.
   *
   * @param token 임시 토큰
   * @return 대응 API 키, 없거나 만료 시 null
   */
  public String consumeToken(String token) {
    if (token == null || token.isBlank()) return null;
    TokenEntry entry = store.remove(token);
    if (entry == null) return null;
    if (Instant.now().isAfter(entry.expiresAt())) return null;
    return entry.apiKey();
  }

  /** 만료된 토큰을 주기적으로 정리합니다. (1분마다 실행) */
  @Scheduled(fixedDelay = 60_000)
  public void evictExpiredTokens() {
    Instant now = Instant.now();
    store.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt()));
  }
}
