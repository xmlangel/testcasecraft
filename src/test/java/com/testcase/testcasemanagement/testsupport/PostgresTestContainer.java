// src/test/java/com/testcase/testcasemanagement/testsupport/PostgresTestContainer.java

package com.testcase.testcasemanagement.testsupport;

import org.testcontainers.containers.PostgreSQLContainer;

/**
 * JVM 전역 단일 PostgreSQL 컨테이너.
 *
 * <p>모든 {@code @SpringBootTest}, {@code @DataJpaTest} 실행 전에 한 번만 기동되어 컨테이너 시작 비용을 분산한다. 종료는 Ryuk이
 * JVM 종료 시 자동 처리한다.
 */
public final class PostgresTestContainer {

  private static final PostgreSQLContainer<?> CONTAINER;

  static {
    CONTAINER =
        new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testcase_management")
            .withUsername("testcase_user")
            .withPassword("testcase_password")
            .withReuse(false);
    CONTAINER.start();
  }

  public static PostgreSQLContainer<?> getInstance() {
    return CONTAINER;
  }

  private PostgresTestContainer() {
    // singleton
  }
}
