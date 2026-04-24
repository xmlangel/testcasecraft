package com.testcase.testcasemanagement.service.rag;

import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.mockito.Mockito.*;

import java.util.UUID;

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
        // For simplicity, we'll test the logic by calling the public method and expecting it not to throw 
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
}
