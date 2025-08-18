// src/main/java/com/testcase/testcasemanagement/health/JiraEncryptionHealthIndicator.java
package com.testcase.testcasemanagement.health;

import com.testcase.testcasemanagement.config.DefaultConfigurationWarning;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * JIRA 암호화 키 설정 상태를 확인하는 헬스 인디케이터
 * 운영환경에서 JIRA 설정 저장 가능 여부를 사전에 확인할 수 있도록 합니다.
 */
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
                    return Health.down()
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
                return Health.down()
                    .withDetail("jira.encryption.key", "설정되지 않음")
                    .withDetail("jira.encryption.status", "비활성화")
                    .withDetail("jira.config.saveable", false)
                    .withDetail("error", "JIRA_ENCRYPTION_KEY 환경변수가 설정되지 않았습니다")
                    .withDetail("solution", "환경변수 JIRA_ENCRYPTION_KEY를 설정해주세요")
                    .withDetail("example", "JIRA_ENCRYPTION_KEY=5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=")
                    .build();
            } else {
                return Health.down()
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