package com.testcase.testcasemanagement.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * 테이블·컬럼 설명(COMMENT)을 엔티티의 {@code @Comment} 와 맞춘다.
 *
 * <p>{@code ddl-auto: update} 는 테이블을 새로 만들 때만 설명을 넣고, 이미 있는 테이블·컬럼의 설명은 추가하거나 바꾸지 않는다. 그래서
 * 운영 중인 DB 는 버전을 올려도 설명이 비어 있거나 예전 문구로 남는다. 부팅할 때 엔티티에서 생성한 {@code db/comments/db-comments.sql}
 * 을 읽어, 현재 설명과 다른 대상에만 {@code COMMENT ON} 을 실행한다. 이미 같으면 아무것도 하지 않으므로 매 부팅 실행돼도 멱등하다.
 *
 * <p>DB 에 없는 테이블·컬럼은 건너뛴다. 설명은 앱 동작과 무관하므로, 실패해도 경고만 남기고 부팅은 계속한다. {@code
 * app.db-comments.sync.enabled=false} 로 끌 수 있다.
 */
@Component
@Order(20)
@ConditionalOnProperty(
    name = "app.db-comments.sync.enabled",
    havingValue = "true",
    matchIfMissing = true)
public class DbCommentSyncRunner implements CommandLineRunner {

  static final String SCRIPT_LOCATION = "db/comments/db-comments.sql";

  private static final Logger log = LoggerFactory.getLogger(DbCommentSyncRunner.class);
  private static final Pattern STATEMENT =
      Pattern.compile("^COMMENT ON (TABLE|COLUMN) ([a-z0-9_]+)(?:\\.([a-z0-9_]+))? IS '((?:[^']|'')*)';$");

  private final DataSource dataSource;

  public DbCommentSyncRunner(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @Override
  public void run(String... args) {
    try {
      Result result = sync(loadScript());
      if (result.applied() > 0 || result.failed() > 0) {
        log.info(
            "DB 설명 동기화: 갱신 {}건, 변경 없음 {}건, DB 에 없음 {}건, 실패 {}건",
            result.applied(),
            result.unchanged(),
            result.missing(),
            result.failed());
      } else {
        log.debug("DB 설명 동기화: 모두 최신이다 ({}건)", result.unchanged());
      }
    } catch (Exception e) {
      log.warn("DB 설명 동기화를 건너뛴다. 앱 동작에는 영향이 없다.", e);
    }
  }

  /** 스크립트의 설명과 DB 의 현재 설명을 비교해 다른 것만 적용한다. */
  Result sync(String script) throws SQLException {
    List<Target> targets = parse(script);
    int applied = 0;
    int unchanged = 0;
    int missing = 0;
    int failed = 0;
    try (Connection connection = dataSource.getConnection()) {
      Map<String, String> current = currentComments(connection);
      try (Statement statement = connection.createStatement()) {
        for (Target target : targets) {
          if (!current.containsKey(target.key())) {
            missing++;
          } else if (Objects.equals(current.get(target.key()), target.comment())) {
            unchanged++;
          } else {
            try {
              statement.execute(target.sql());
              applied++;
            } catch (SQLException e) {
              failed++;
              log.warn("DB 설명 적용 실패: {} ({})", target.key(), e.getMessage());
            }
          }
        }
      }
    }
    return new Result(applied, unchanged, missing, failed);
  }

  static List<Target> parse(String script) {
    List<Target> targets = new ArrayList<>();
    for (String line : script.split("\n")) {
      Matcher matcher = STATEMENT.matcher(line.strip());
      if (!matcher.matches()) {
        continue;
      }
      String key = matcher.group(3) == null ? matcher.group(2) : matcher.group(2) + "." + matcher.group(3);
      targets.add(new Target(key, matcher.group(4).replace("''", "'"), line.strip()));
    }
    return targets;
  }

  /** 현재 스키마의 테이블·컬럼 설명. 설명이 없는 대상도 키는 넣어 DB 에 있다는 것을 표시한다. */
  private static Map<String, String> currentComments(Connection connection) throws SQLException {
    DatabaseMetaData metaData = connection.getMetaData();
    String catalog = connection.getCatalog();
    String schema = connection.getSchema();
    Map<String, String> comments = new HashMap<>();
    try (ResultSet tables = metaData.getTables(catalog, schema, "%", new String[] {"TABLE"})) {
      while (tables.next()) {
        comments.put(lower(tables.getString("TABLE_NAME")), blankToNull(tables.getString("REMARKS")));
      }
    }
    try (ResultSet columns = metaData.getColumns(catalog, schema, "%", "%")) {
      while (columns.next()) {
        String table = lower(columns.getString("TABLE_NAME"));
        if (comments.containsKey(table)) {
          comments.put(
              table + "." + lower(columns.getString("COLUMN_NAME")),
              blankToNull(columns.getString("REMARKS")));
        }
      }
    }
    return comments;
  }

  private static String loadScript() throws IOException {
    try (InputStream input = new ClassPathResource(SCRIPT_LOCATION).getInputStream()) {
      return new String(input.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  private static String lower(String value) {
    return value.toLowerCase(Locale.ROOT);
  }

  private static String blankToNull(String value) {
    return value == null || value.isEmpty() ? null : value;
  }

  record Target(String key, String comment, String sql) {}

  record Result(int applied, int unchanged, int missing, int failed) {}
}
