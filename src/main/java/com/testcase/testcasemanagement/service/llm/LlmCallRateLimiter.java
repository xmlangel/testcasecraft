package com.testcase.testcasemanagement.service.llm;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 외부 LLM·reranker 를 부르는 API 의 사용자별 호출 빈도 제한 (ICT-444).
 *
 * <p>RateLimiterFilter 와 같은 Resilience4j RateLimiter 를 쓴다. 그 필터는 IP 기준이고 /api/ 를 제외하므로 API 키 하나로
 * LLM 을 반복 호출하는 것을 막지 못한다. 여기서는 인증 주체(username)와 동작 이름을 묶어 따로 센다. 한 화면에서 모델 목록을 여러 번 불러도 메타 생성 한도가
 * 줄지 않게 하기 위해서다.
 *
 * <p>한도를 넘으면 {@link RequestNotPermitted} 를 던지고 GlobalExceptionHandler 가 429 로 내려준다. 추적 대상은 사용자 수 ×
 * 동작 수로 묶여 있어 IP 처럼 무한히 늘지 않는다.
 */
@Component
public class LlmCallRateLimiter {

  private final RateLimiterConfig config;

  private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

  public LlmCallRateLimiter(@Value("${app.ratelimit.llm.limit-per-minute:20}") int limitPerMinute) {
    this.config =
        RateLimiterConfig.custom()
            .limitForPeriod(limitPerMinute)
            .limitRefreshPeriod(Duration.ofMinutes(1))
            .timeoutDuration(Duration.ZERO)
            .build();
  }

  /**
   * 호출 한 번을 허가받는다. 한도를 넘었으면 {@link RequestNotPermitted} 를 던진다.
   *
   * @param action 동작 이름 (예: generate-meta)
   * @param username 인증 주체. 없으면 익명 한 묶음으로 센다
   */
  public void acquire(String action, String username) {
    String key = action + ":" + (username == null ? "anonymous" : username);
    RateLimiter limiter = limiters.computeIfAbsent(key, name -> RateLimiter.of(name, config));
    if (!limiter.acquirePermission()) {
      throw RequestNotPermitted.createRequestNotPermitted(limiter);
    }
  }
}
