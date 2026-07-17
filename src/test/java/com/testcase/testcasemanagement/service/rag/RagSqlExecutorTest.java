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
}
