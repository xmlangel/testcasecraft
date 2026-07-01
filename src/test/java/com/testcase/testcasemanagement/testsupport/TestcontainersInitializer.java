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
        // create-drop 은 컨텍스트가 새로 뜰 때마다 48-엔티티 스키마를 drop+재생성한다.
        // 컨테이너는 포크(JVM)별 싱글턴이라 첫 컨텍스트만 스키마를 만들면 되므로 update 로 낮춘다.
        // (테스트 격리는 @Transactional 롤백 / 명시적 정리로 유지되며, 컨테이너는 JVM 종료 시 Ryuk 이 폐기한다.)
        "spring.jpa.hibernate.ddl-auto=update");
  }
}
