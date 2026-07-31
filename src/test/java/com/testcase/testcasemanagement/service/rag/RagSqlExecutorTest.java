package com.testcase.testcasemanagement.service.rag;

import static org.mockito.Mockito.*;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class RagSqlExecutorTest {

  private RagSqlExecutor sqlExecutor;
  private JdbcTemplate jdbcTemplate;
  private String projectId = UUID.randomUUID().toString();

  @BeforeMethod
  public void setUp() {
    jdbcTemplate = mock(JdbcTemplate.class);
    sqlExecutor = new RagSqlExecutor(jdbcTemplate);
  }

  @Test
  public void testSafeSelect() {
    String sql = "SELECT * FROM testcases WHERE project_id = '" + projectId + "'";
    // We can't easily test private methods, but we can test the public one
    // if we mock jdbcTemplate properly.
    // For simplicity, we'll test the logic by calling the public method and expecting it not to
    // throw
    // IllegalArgumentException before calling jdbcTemplate.

    try {
      sqlExecutor.executeSelect(sql, projectId);
    } catch (Exception e) {
      // It might fail on jdbcTemplate.queryForList but it shouldn't throw IllegalArgumentException
      Assert.assertNotEquals(e.getClass(), IllegalArgumentException.class);
    }
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testUnsafeInsert() {
    String sql = "INSERT INTO testcases (name) VALUES ('hacked')";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testUnsafeDelete() {
    String sql = "DELETE FROM testcases WHERE id = 'some-id'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testCommentBypass() {
    String sql = "SELECT * FROM testcases -- " + projectId;
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testMissingProjectId() {
    String sql = "SELECT * FROM testcases";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testWrongProjectId() {
    String sql = "SELECT * FROM testcases WHERE project_id = 'other-project-id'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  // ===== dev-review P0: LLM-SQL 경계 강화 회귀 가드 =====

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksUnionExfiltration() {
    String sql =
        "SELECT id FROM testcases WHERE project_id = '"
            + projectId
            + "' UNION SELECT name FROM testcases";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksUsersTable() {
    String sql = "SELECT username FROM users WHERE project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksLlmConfigApiKey() {
    String sql = "SELECT encrypted_api_key FROM llm_config WHERE project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksServiceApiKeys() {
    String sql = "SELECT api_key FROM service_api_keys WHERE project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksMultipleStatements() {
    String sql = "SELECT id FROM testcases WHERE project_id = '" + projectId + "'; SELECT 1 AS x";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test
  public void testAllowsProjectScopedSelect_doesNotThrowIllegalArgument() {
    when(jdbcTemplate.queryForList(anyString())).thenReturn(java.util.List.of());
    String sql = "SELECT id, name FROM testcases WHERE project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
    verify(jdbcTemplate).queryForList(anyString());
  }

  // ===== dev-review R2: 시스템 카탈로그 콤마 크로스조인 우회 회귀 가드 =====

  /**
   * 핵심 익스플로잇: pg_authid 를 project_id 있는 testcases 와 콤마 크로스조인하면 프로젝트 필터·denylist·집합연산자 검사를 전부 통과하면서
   * rolpassword(시스템 비밀번호 해시)를 유출한다. 시스템 카탈로그 차단으로 봉쇄돼야 한다.
   */
  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksPgAuthidCrossJoin() {
    String sql =
        "SELECT a.rolpassword FROM pg_authid a, testcases t WHERE t.project_id = '"
            + projectId
            + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksPgCatalogAccess() {
    String sql =
        "SELECT relname FROM pg_class, testcases WHERE testcases.project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksInformationSchema() {
    String sql =
        "SELECT table_name FROM information_schema.tables, testcases t WHERE t.project_id = '"
            + projectId
            + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksFileReadFunction() {
    String sql =
        "SELECT pg_read_file('/etc/passwd') FROM testcases WHERE project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testBlocksCurrentSetting() {
    String sql =
        "SELECT current_setting('is_superuser') FROM testcases WHERE project_id = '"
            + projectId
            + "'";
    sqlExecutor.executeSelect(sql, projectId);
  }

  /** 정상 프로젝트 스코프 쿼리는 시스템 카탈로그 차단 추가 후에도 계속 통과해야 한다(과도차단 방지). */
  @Test
  public void testLegitimateQueryStillAllowed_afterSystemCatalogBlock() {
    when(jdbcTemplate.queryForList(anyString())).thenReturn(java.util.List.of());
    String sql = "SELECT id, title, status FROM testcases WHERE project_id = '" + projectId + "'";
    sqlExecutor.executeSelect(sql, projectId);
    verify(jdbcTemplate).queryForList(anyString());
  }
}
