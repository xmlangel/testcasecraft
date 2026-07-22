package com.testcase.testcasemanagement.service.graph;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

/**
 * AgensGraph 전용 접속 클라이언트.
 *
 * <p>중요: 그래프 DB 커넥션 풀을 이 컴포넌트가 자체 보유한다. Spring 컨테이너에 DataSource/JdbcTemplate 빈을 추가로 등록하면 기존 JPA
 * 자동구성·JdbcTemplate 주입처(DatabaseInitializer, RagSqlExecutor)와 충돌하므로 (P0 감사 HIGH 리스크), 어느 쪽도 빈으로
 * 노출하지 않는다.
 *
 * <p>features.graph.enabled=false(기본)면 이 컴포넌트 자체가 생성되지 않아 1.0.x 와 완전히 동일하게 동작한다.
 */
@Component
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
public class GraphDbClient {

  private static final Logger logger = LoggerFactory.getLogger(GraphDbClient.class);

  @Value("${graph.datasource.url}")
  private String url;

  @Value("${graph.datasource.username}")
  private String username;

  @Value("${graph.datasource.password}")
  private String password;

  @Value("${graph.datasource.graph-path:tc_graph}")
  private String graphPath;

  @Value("${graph.datasource.maximum-pool-size:5}")
  private int maximumPoolSize;

  private HikariDataSource dataSource;
  private JdbcTemplate jdbcTemplate;

  @PostConstruct
  void init() {
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl(url);
    config.setUsername(username);
    config.setPassword(password);
    config.setMaximumPoolSize(maximumPoolSize);
    config.setPoolName("agensgraph-pool");
    // graph_path 는 세션 단위 설정 — 풀에서 나오는 모든 커넥션에 적용
    config.setConnectionInitSql("SET graph_path = " + sanitizeIdentifier(graphPath));
    // 그래프 DB 미기동 시 앱 기동을 막지 않도록 초기화 실패를 지연 (graceful degradation)
    config.setInitializationFailTimeout(-1);

    this.dataSource = new HikariDataSource(config);
    this.jdbcTemplate = new JdbcTemplate(dataSource);
    // initializationFailTimeout(-1) 은 앱 기동을 막지 않는 대신 실패를 숨긴다 — 기동 직후 probe 로 상태를 드러낸다
    if (isAvailable()) {
      logger.info("AgensGraph 클라이언트 초기화 — url={}, graph_path={}", url, graphPath);
    } else {
      logger.warn(
          "AgensGraph 에 연결할 수 없습니다 — url={}. 그래프 API 는 연결 복구 시까지 오류를 반환합니다. "
              + "(앱 기동은 계속합니다 / graceful degradation)",
          url);
    }
  }

  @PreDestroy
  void shutdown() {
    if (dataSource != null) {
      dataSource.close();
    }
  }

  /** Cypher(또는 SQL) 조회 실행. 호출부는 검증된 쿼리만 넘겨야 한다 (GraphQueryService 참조). */
  public <T> List<T> query(String cypher, RowMapper<T> rowMapper) {
    return jdbcTemplate.query(cypher, rowMapper);
  }

  /** DML 성 Cypher (MERGE/SET/DELETE) 실행. */
  public void execute(String cypher) {
    jdbcTemplate.execute(cypher);
  }

  /** 그래프 DB 연결 상태 확인 — 컨트롤러/헬스 표시에 사용. */
  public boolean isAvailable() {
    try {
      jdbcTemplate.queryForObject("SELECT 1", Integer.class);
      return true;
    } catch (Exception e) {
      logger.debug("그래프 DB 연결 불가: {}", e.getMessage());
      return false;
    }
  }

  /**
   * Cypher 단일 인용 문자열 리터럴로 감싼다 — 역슬래시·작은따옴표 이스케이프, null 은 빈 문자열. AgensGraph Cypher 는 파라미터 바인딩이 제한적이라
   * 값은 리터럴로 넣되, 식별자성 입력은 호출부에서 별도 화이트리스트 검증(GraphQueryService.validateId)을 거친다.
   */
  public static String quote(String text) {
    if (text == null) {
      return "''";
    }
    // AgensGraph 는 속성을 jsonb 로 저장한다 — 리터럴 개행/제어문자(0x0a 등)가 그대로 들어가면
    // "invalid input syntax for type json" 으로 깨진다. 역슬래시·작은따옴표에 더해 개행·CR·탭을
    // 이스케이프 시퀀스로 바꾸고, 그 외 제어문자(0x00-0x1F)는 공백으로 치환한다.
    String safe =
        text.replace("\\", "\\\\")
            .replace("'", "''")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
            .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", " ");
    return "'" + safe + "'";
  }

  /** graph_path 식별자 검증 — 영문/숫자/언더스코어만 허용 (SET 구문 인젝션 방지). */
  private static String sanitizeIdentifier(String identifier) {
    if (identifier == null || !identifier.matches("[a-zA-Z_][a-zA-Z0-9_]*")) {
      throw new IllegalArgumentException("잘못된 graph_path: " + identifier);
    }
    return identifier;
  }
}
