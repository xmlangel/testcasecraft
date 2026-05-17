// src/test/java/com/testcase/testcasemanagement/testsupport/TestcontainersInitializer.java

package com.testcase.testcasemanagement.testsupport;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.support.TestPropertySourceUtils;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * 모든 Spring 테스트 컨텍스트에 PostgreSQL Testcontainer 연결 정보를 주입한다.
 *
 * <p>{@code META-INF/spring.factories} 에 {@link ApplicationContextInitializer} 로 등록되어
 * {@code @SpringBootTest}, {@code @DataJpaTest} 등 모든 Spring 테스트 컨텍스트 초기화 시 자동으로 호출된다. 결과적으로 기존
 * {@code application-test.yml} 의 하드코딩된 {@code localhost:5434} 가 컨테이너 매핑 주소로 덮어써진다.
 */
public class TestcontainersInitializer
    implements ApplicationContextInitializer<ConfigurableApplicationContext> {

  @Override
  public void initialize(ConfigurableApplicationContext applicationContext) {
    PostgreSQLContainer<?> pg = PostgresTestContainer.getInstance();
    TestPropertySourceUtils.addInlinedPropertiesToEnvironment(
        applicationContext,
        "spring.datasource.url=" + pg.getJdbcUrl(),
        "spring.datasource.username=" + pg.getUsername(),
        "spring.datasource.password=" + pg.getPassword(),
        "spring.datasource.driver-class-name=org.postgresql.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
        "spring.jpa.hibernate.ddl-auto=create-drop");
  }
}
