// src/main/java/com/testcase/testcasemanagement/config/ClockConfig.java

package com.testcase.testcasemanagement.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Clock 추상화를 위한 설정.
 *
 * <p>Service 계층에서 {@code LocalDateTime.now()} 대신 주입된 {@link Clock}을 사용하여
 * 결정론적 테스트가 가능하도록 한다. 테스트에서는 {@code Clock.fixed(...)}로 교체한다.
 */
@Configuration
public class ClockConfig {

  @Bean
  public Clock systemClock() {
    return Clock.systemDefaultZone();
  }
}
