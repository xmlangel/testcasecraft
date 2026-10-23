package com.testcase.testcasemanagement.service.llm;

import static org.testng.Assert.assertThrows;

import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.testng.annotations.Test;

/** ICT-444: LLM 호출 API 의 사용자별 호출 빈도 제한. */
public class LlmCallRateLimiterTest {

  @Test(description = "한도까지는 허가하고 그다음 호출은 RequestNotPermitted 로 거부한다")
  public void rejectsCallsBeyondLimit() {
    LlmCallRateLimiter limiter = new LlmCallRateLimiter(2);

    limiter.acquire("generate-meta", "alice");
    limiter.acquire("generate-meta", "alice");

    assertThrows(RequestNotPermitted.class, () -> limiter.acquire("generate-meta", "alice"));
  }

  @Test(description = "다른 사용자의 호출은 따로 센다")
  public void countsUsersSeparately() {
    LlmCallRateLimiter limiter = new LlmCallRateLimiter(1);

    limiter.acquire("generate-meta", "alice");
    limiter.acquire("generate-meta", "bob");

    assertThrows(RequestNotPermitted.class, () -> limiter.acquire("generate-meta", "alice"));
  }

  @Test(description = "같은 사용자라도 동작이 다르면 따로 센다")
  public void countsActionsSeparately() {
    LlmCallRateLimiter limiter = new LlmCallRateLimiter(1);

    limiter.acquire("models-for-chat", "alice");
    limiter.acquire("generate-meta", "alice");

    assertThrows(RequestNotPermitted.class, () -> limiter.acquire("models-for-chat", "alice"));
  }

  @Test(description = "인증 주체가 없는 호출도 한 묶음으로 제한한다")
  public void limitsAnonymousCallsTogether() {
    LlmCallRateLimiter limiter = new LlmCallRateLimiter(1);

    limiter.acquire("generate-meta", null);

    assertThrows(RequestNotPermitted.class, () -> limiter.acquire("generate-meta", null));
  }
}
