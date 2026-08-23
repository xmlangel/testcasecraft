package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import jakarta.persistence.EntityManager;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@code llm_config.provider} 의 CHECK 제약을 현재 enum 값과 맞춘다.
 *
 * <p>Hibernate 는 {@code @Enumerated(EnumType.STRING)} 컬럼에 값 목록 CHECK 제약을 만든다. 그런데 {@code ddl-auto:
 * update} 는 <b>기존 제약을 갱신하지 않는다</b>. 그래서 enum 에 제공자를 추가하면 새로 만든 DB 에서는 되고, 이미 테이블이 있는 DB 에서는 저장이
 * 제약 위반으로 실패한다. 화면에는 새 제공자가 보이는데 저장만 안 되는 상태가 된다.
 *
 * <p>제공자를 더할 때마다 사람이 SQL 을 돌리게 하면 잊기 마련이므로, 부팅할 때 제약과 enum 을 대조해 어긋나면 다시 만든다. 값이 이미 맞으면 아무것도 하지
 * 않으므로 매 부팅 실행돼도 멱등하다.
 *
 * <p>Postgres 를 전제로 한 SQL 이다. 다른 DB 로 옮기면 이 러너를 손봐야 한다.
 */
@Component
@Order(5)
public class LlmProviderConstraintRunner implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(LlmProviderConstraintRunner.class);

  private static final String CONSTRAINT_NAME = "llm_config_provider_check";

  private final EntityManager entityManager;

  public LlmProviderConstraintRunner(EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  @Override
  @Transactional
  public void run(String... args) {
    try {
      String existing = currentDefinition();
      if (existing == null) {
        log.debug("provider CHECK 제약이 없다. Hibernate 가 만들 것이므로 손대지 않는다.");
        return;
      }

      if (coversAllProviders(existing)) {
        log.debug("provider CHECK 제약이 enum 과 일치한다. 그대로 둔다.");
        return;
      }

      log.warn("⚠️ provider CHECK 제약이 enum 과 어긋난다. 다시 만든다. 기존={}", existing);
      recreateConstraint();
      log.info("✅ provider CHECK 제약 갱신 완료: {}", providerNames());

    } catch (Exception e) {
      // 제약 갱신에 실패해도 부팅은 계속한다. 기존 제공자는 그대로 쓸 수 있고, 새 제공자만 저장이
      // 막힌다. 부팅을 멈추면 그것이 더 큰 장애다.
      log.error("❌ provider CHECK 제약 갱신 실패. 새 제공자 저장이 막힐 수 있다.", e);
    }
  }

  private String currentDefinition() {
    Object result =
        entityManager
            .createNativeQuery(
                "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = :name")
            .setParameter("name", CONSTRAINT_NAME)
            .getResultStream()
            .findFirst()
            .orElse(null);
    return result == null ? null : String.valueOf(result);
  }

  /** 제약 정의에 모든 enum 값이 들어 있는지 본다. 문자열 포함으로 보는 것으로 충분하다. */
  private boolean coversAllProviders(String definition) {
    return Arrays.stream(LlmProvider.values())
        .allMatch(provider -> definition.contains("'" + provider.name() + "'"));
  }

  private void recreateConstraint() {
    String values =
        Arrays.stream(LlmProvider.values())
            .map(provider -> "'" + provider.name() + "'")
            .collect(Collectors.joining(", "));

    entityManager
        .createNativeQuery(
            "ALTER TABLE llm_config DROP CONSTRAINT IF EXISTS " + CONSTRAINT_NAME)
        .executeUpdate();
    entityManager
        .createNativeQuery(
            "ALTER TABLE llm_config ADD CONSTRAINT "
                + CONSTRAINT_NAME
                + " CHECK (provider IN ("
                + values
                + "))")
        .executeUpdate();
  }

  private String providerNames() {
    return Arrays.stream(LlmProvider.values())
        .map(LlmProvider::name)
        .collect(Collectors.joining(", "));
  }
}
