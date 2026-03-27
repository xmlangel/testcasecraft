// src/main/java/com/testcase/testcasemanagement/config/DefaultConfigurationWarning.java
package com.testcase.testcasemanagement.config;

import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** 기본 설정값 사용에 대한 경고를 표시하는 컴포넌트 운영환경에서 기본값 사용 시 보안 위험을 사용자에게 알립니다. */
@Component
@Slf4j
public class DefaultConfigurationWarning {

  private final Environment environment;

  @Value("${spring.datasource.password}")
  private String databasePassword;

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Value("${jira.security.encryption.key}")
  private String jiraEncryptionKey;

  @Value("${spring.profiles.active:}")
  private String activeProfiles;

  public DefaultConfigurationWarning(Environment environment) {
    this.environment = environment;
  }

  @EventListener(ContextRefreshedEvent.class)
  public void checkDefaultConfigurations() {
    // 개발 환경에서는 경고하지 않음
    if (activeProfiles.contains("dev")) {
      log.debug("개발 환경에서는 기본값 사용 경고를 표시하지 않습니다.");
      return;
    }

    List<String> warnings = new ArrayList<>();
    List<String> criticalWarnings = new ArrayList<>();

    // 데이터베이스 비밀번호 확인
    if ("testcase_default_password".equals(databasePassword)) {
      criticalWarnings.add("데이터베이스 비밀번호가 기본값으로 설정되어 있습니다! (DATABASE_PASSWORD)");
    }

    // JWT 시크릿 확인
    if (jwtSecret.contains("default_jwt_secret_key_for_development")) {
      criticalWarnings.add("JWT 시크릿이 기본값으로 설정되어 있습니다! (JWT_SECRET)");
    }

    // JIRA 암호화 키 확인
    if ("5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=".equals(jiraEncryptionKey)) {
      warnings.add("JIRA 암호화 키가 기본값으로 설정되어 있습니다. (JIRA_ENCRYPTION_KEY)");
    }

    // 경고 메시지 출력
    if (!criticalWarnings.isEmpty() || !warnings.isEmpty()) {
      log.warn("================================================================================");
      log.warn("⚠️  기본 설정값 사용 경고 - 보안 위험이 있을 수 있습니다!");
      log.warn("================================================================================");

      if (!criticalWarnings.isEmpty()) {
        log.error("🚨 중요: 다음 설정은 반드시 변경해야 합니다:");
        criticalWarnings.forEach(warning -> log.error("   - {}", warning));
        log.error("");
      }

      if (!warnings.isEmpty()) {
        log.warn("⚠️  권장: 다음 설정을 변경하는 것을 권장합니다:");
        warnings.forEach(warning -> log.warn("   - {}", warning));
        log.warn("");
      }

      log.warn("💡 해결 방법:");
      log.warn("   1. 환경변수를 설정하세요:");
      log.warn("      export DATABASE_PASSWORD=\"your_secure_password\"");
      log.warn("      export JWT_SECRET=\"your_very_long_jwt_secret_key\"");
      log.warn("      export JIRA_ENCRYPTION_KEY=\"your_base64_encryption_key\"");
      log.warn("");
      log.warn("   2. 또는 .env.prod 파일에 설정하세요:");
      log.warn("      DATABASE_PASSWORD=your_secure_password");
      log.warn("      JWT_SECRET=your_very_long_jwt_secret_key");
      log.warn("      JIRA_ENCRYPTION_KEY=your_base64_encryption_key");
      log.warn("");
      log.warn("   3. 키 생성 방법:");
      log.warn("      JWT 시크릿: openssl rand -base64 64");
      log.warn("      JIRA 암호화 키: openssl rand -base64 32");
      log.warn("================================================================================");

      // 운영환경에서 중요한 설정이 기본값인 경우 추가 경고
      if (!criticalWarnings.isEmpty()
          && (activeProfiles.contains("prod") || activeProfiles.isEmpty())) {
        log.error("");
        log.error("🔴 운영환경에서 중요한 보안 설정이 기본값으로 설정되어 있습니다!");
        log.error("🔴 즉시 환경변수를 설정하고 애플리케이션을 재시작하세요!");
        log.error("");
      }
    } else {
      log.info("✅ 모든 중요 설정이 환경변수로 올바르게 설정되었습니다.");
    }
  }

  /** 런타임에 기본값 사용 여부를 확인할 수 있는 메서드 */
  public boolean isUsingDefaultConfiguration() {
    return "testcase_default_password".equals(databasePassword)
        || jwtSecret.contains("default_jwt_secret_key_for_development")
        || "5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=".equals(jiraEncryptionKey);
  }

  /** 중요한 보안 설정이 기본값인지 확인 */
  public boolean isUsingCriticalDefaultConfiguration() {
    return "testcase_default_password".equals(databasePassword)
        || jwtSecret.contains("default_jwt_secret_key_for_development");
  }
}
