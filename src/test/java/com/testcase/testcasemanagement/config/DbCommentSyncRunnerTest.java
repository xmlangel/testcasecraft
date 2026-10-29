package com.testcase.testcasemanagement.config;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** DbCommentSyncRunner 단위 테스트: 다른 설명만 적용하고, 없는 대상은 건너뛰고, 다시 실행해도 결과가 같은지 본다. */
public class DbCommentSyncRunnerTest {

  private static final String SCRIPT =
      String.join(
          "\n",
          "-- 머리 주석은 무시한다",
          "",
          "COMMENT ON TABLE widgets IS '위젯: 시험용 테이블';",
          "COMMENT ON COLUMN widgets.name IS '위젯 명: 사용자의 ''별칭'' (값 영역: 50자 이하)';",
          "COMMENT ON COLUMN widgets.code IS '위젯 코드: 이미 같은 설명';",
          "COMMENT ON COLUMN widgets.removed_column IS '없는 컬럼: 건너뛴다';",
          "COMMENT ON TABLE missing_table IS '없는 테이블: 건너뛴다';",
          "");

  private SingleConnectionDataSource dataSource;
  private DbCommentSyncRunner runner;

  @BeforeMethod
  public void setUp() throws SQLException {
    String url = "jdbc:h2:mem:" + UUID.randomUUID() + ";DATABASE_TO_LOWER=TRUE";
    dataSource = new SingleConnectionDataSource(DriverManager.getConnection(url), true);
    try (Statement statement = dataSource.getConnection().createStatement()) {
      statement.execute(
          "CREATE TABLE widgets (id INT PRIMARY KEY, name VARCHAR(50), code VARCHAR(10))");
      statement.execute("COMMENT ON COLUMN widgets.code IS '위젯 코드: 이미 같은 설명'");
      statement.execute("COMMENT ON COLUMN widgets.id IS '스크립트에 없는 설명'");
    }
    runner = new DbCommentSyncRunner(dataSource);
  }

  @AfterMethod
  public void tearDown() {
    dataSource.destroy();
  }

  @Test
  public void 다른_설명만_적용하고_없는_대상은_건너뛴다() throws SQLException {
    DbCommentSyncRunner.Result result = runner.sync(SCRIPT);

    assertEquals(result, new DbCommentSyncRunner.Result(2, 1, 2, 0));
    assertEquals(tableComment(), "위젯: 시험용 테이블");
    assertEquals(columnComment("name"), "위젯 명: 사용자의 '별칭' (값 영역: 50자 이하)");
    assertEquals(columnComment("code"), "위젯 코드: 이미 같은 설명");
    // 스크립트에 없는 대상은 손대지 않는다
    assertEquals(columnComment("id"), "스크립트에 없는 설명");
  }

  @Test
  public void 다시_실행하면_바꾸는_것이_없다() throws SQLException {
    runner.sync(SCRIPT);

    DbCommentSyncRunner.Result second = runner.sync(SCRIPT);

    assertEquals(second, new DbCommentSyncRunner.Result(0, 3, 2, 0));
  }

  @Test
  public void 예전_설명은_새_설명으로_바뀐다() throws SQLException {
    runner.sync(SCRIPT);

    runner.sync(SCRIPT.replace("시험용 테이블", "고친 정의"));

    assertEquals(tableComment(), "위젯: 고친 정의");
  }

  @Test
  public void DB_에_연결할_수_없어도_부팅을_막지_않는다() {
    DataSource broken =
        new SingleConnectionDataSource("jdbc:h2:tcp://127.0.0.1:1/none", "", "", true);

    new DbCommentSyncRunner(broken).run();
  }

  @Test
  public void 실제_스크립트를_모두_해석한다() throws Exception {
    String script =
        new String(
            new ClassPathResource(DbCommentSyncRunner.SCRIPT_LOCATION)
                .getInputStream()
                .readAllBytes(),
            StandardCharsets.UTF_8);
    long statements = script.lines().filter(line -> line.startsWith("COMMENT ON ")).count();

    assertTrue(statements > 0);
    assertEquals(DbCommentSyncRunner.parse(script).size(), (int) statements);
  }

  private String tableComment() throws SQLException {
    return query("SELECT remarks FROM information_schema.tables WHERE table_name = 'widgets'");
  }

  private String columnComment(String column) throws SQLException {
    return query(
        "SELECT remarks FROM information_schema.columns WHERE table_name = 'widgets' AND"
            + " column_name = '"
            + column
            + "'");
  }

  private String query(String sql) throws SQLException {
    Connection connection = dataSource.getConnection();
    try (Statement statement = connection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql)) {
      assertTrue(resultSet.next());
      String value = resultSet.getString(1);
      return value == null || value.isEmpty() ? null : value;
    }
  }
}
