// src/main/java/com/testcase/testcasemanagement/health/JiraEncryptionHealthIndicator.java
package com.testcase.testcasemanagement.health;

import com.testcase.testcasemanagement.config.DefaultConfigurationWarning;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/** JIRA 암호화 키 설정 상태를 확인하는 헬스 인디케이터 운영환경에서 JIRA 설정 저장 가능 여부를 사전에 확인할 수 있도록 합니다. */
@Component
@RequiredArgsConstructor
@Slf4j
public class JiraEncryptionHealthIndicator implements HealthIndicator {

  private final EncryptionUtil encryptionUtil;
  private final DefaultConfigurationWarning defaultConfigWarning;

  @Override
  public Health health() {
    try {
      boolean isKeyConfigured = encryptionUtil.isEncryptionKeyConfigured();
      boolean isEncryptionEnabled = encryptionUtil.isEncryptionEnabled();
      boolean isUsingDefaults = defaultConfigWarning.isUsingDefaultConfiguration();
      boolean isUsingCriticalDefaults = defaultConfigWarning.isUsingCriticalDefaultConfiguration();

      if (isKeyConfigured && isEncryptionEnabled) {
        if (isUsingCriticalDefaults) {
          // 보안상 반드시 고쳐야 할 상태지만, 이 하나 때문에 /actuator/health 전체를 DOWN(503)으로
          // 만들면 Docker HEALTHCHECK 가 컨테이너를 unhealthy 로 몰아 로그인·접속 등 무관한 기능까지
          // 영향을 준다. → 비치명적 WARN 으로 표출(로그+상세)하되 앱 자체는 살아있게 둔다.
          log.error(
              "보안 경고: 운영에서 저장소에 커밋된 기본 암호화 키가 사용 중입니다. 즉시 JIRA_ENCRYPTION_KEY 를 고유 키로 설정하세요.");
          return Health.status("WARN")
              .withDetail("jira.encryption.key", "설정됨 (기본값)")
              .withDetail("jira.encryption.status", "활성화")
              .withDetail("jira.config.saveable", true)
              .withDetail("security.warning", "중요한 보안 설정이 기본값으로 설정되어 있습니다")
              .withDetail("security.risk", "HIGH")
              .withDetail("action.required", "즉시 환경변수를 설정하세요")
              .build();
        } else if (isUsingDefaults) {
          return Health.up()
              .withDetail("jira.encryption.key", "설정됨 (일부 기본값)")
              .withDetail("jira.encryption.status", "활성화")
              .withDetail("jira.config.saveable", true)
              .withDetail("security.warning", "일부 설정이 기본값으로 설정되어 있습니다")
              .withDetail("security.risk", "MEDIUM")
              .withDetail("recommendation", "환경변수 설정을 권장합니다")
              .build();
        } else {
          return Health.up()
              .withDetail("jira.encryption.key", "설정됨")
              .withDetail("jira.encryption.status", "활성화")
              .withDetail("jira.config.saveable", true)
              .withDetail("security.status", "OK")
              .withDetail("message", "JIRA 설정 저장이 가능합니다")
              .build();
        }
      } else if (!isKeyConfigured) {
        // 키 미설정은 Jira/LLM 설정 저장만 막을 뿐 앱의 나머지 기능(로그인·조회 등)과는 무관하다.
        // 따라서 여기서 DOWN 을 반환해 /actuator/health 를 503 으로 만들지 않는다(컨테이너 unhealthy 방지).
        // 오류는 로그와 상세로 표출하되, 애플리케이션은 계속 서비스되게 둔다.
        log.error(
            "JIRA_ENCRYPTION_KEY 환경변수가 설정되지 않았습니다 — Jira/LLM 설정 저장이 비활성화됩니다. "
                + "나머지 기능은 정상 동작합니다. 저장 기능이 필요하면 JIRA_ENCRYPTION_KEY 를 설정하세요.");
        return Health.status("WARN")
            .withDetail("jira.encryption.key", "설정되지 않음")
            .withDetail("jira.encryption.status", "비활성화")
            .withDetail("jira.config.saveable", false)
            .withDetail("error", "JIRA_ENCRYPTION_KEY 환경변수가 설정되지 않았습니다")
            .withDetail("impact", "Jira/LLM 설정 저장만 비활성화 — 로그인·조회 등 나머지 기능은 정상")
            .withDetail("solution", "환경변수 JIRA_ENCRYPTION_KEY를 설정해주세요")
            .build();
      } else {
        log.warn("암호화는 설정되었으나 활성화되지 않았습니다 — Jira/LLM 설정 저장이 비활성화됩니다.");
        return Health.status("WARN")
            .withDetail("jira.encryption.key", "설정됨")
            .withDetail("jira.encryption.status", "비활성화")
            .withDetail("jira.config.saveable", false)
            .withDetail("error", "암호화는 설정되었으나 활성화되지 않았습니다")
            .build();
      }

    } catch (Exception e) {
      log.error("JIRA 암호화 헬스체크 실패", e);
      return Health.down()
          .withDetail("jira.encryption.key", "확인 실패")
          .withDetail("jira.encryption.status", "확인 실패")
          .withDetail("jira.config.saveable", false)
          .withDetail("error", "헬스체크 실행 중 오류 발생: " + e.getMessage())
          .build();
    }
  }
}
