package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.ServiceApiKey;
import com.testcase.testcasemanagement.repository.ServiceApiKeyRepository;
import com.testcase.testcasemanagement.util.ApiKeyHasher;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 기존 평문 서비스 API 키를 SHA-256 해시로 1회 백필한다.
 *
 * <p>기존 행의 {@code apiKey} 컬럼에는 원본 키가 평문으로 들어 있다. 그 값을 해시로 치환하면 클라이언트가 보유한 원본 키는 그대로 유효하다(같은 해시로
 * 매칭). 이미 해시된 행({@code ^[0-9a-f]{64}$})은 건너뛰므로 매 부팅 실행돼도 멱등하다.
 */
@Component
@Order(10)
public class ApiKeyHashMigrationRunner implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(ApiKeyHashMigrationRunner.class);

  private final ServiceApiKeyRepository repository;

  public ApiKeyHashMigrationRunner(ServiceApiKeyRepository repository) {
    this.repository = repository;
  }

  @Override
  public void run(String... args) {
    List<ServiceApiKey> all = repository.findAll();
    int migrated = 0;
    for (ServiceApiKey key : all) {
      String stored = key.getApiKey();
      if (stored == null || ApiKeyHasher.isHashed(stored)) {
        continue; // 이미 해시됨 → 멱등 skip
      }
      key.setApiKey(ApiKeyHasher.sha256Hex(stored));
      repository.save(key);
      migrated++;
    }
    if (migrated > 0) {
      log.warn("서비스 API 키 {}건을 평문 → SHA-256 해시로 마이그레이션했습니다.", migrated);
    }
  }
}
