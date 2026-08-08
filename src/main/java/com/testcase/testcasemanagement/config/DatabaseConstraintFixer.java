package com.testcase.testcasemanagement.config;

import jakarta.persistence.EntityManager;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DatabaseConstraintFixer {

  @Autowired private EntityManager entityManager;

  @Autowired private DataSource dataSource;

  /**
   * 첨부의 소유 컬럼이 비워질 수 있게 NOT NULL 을 해제한다.
   *
   * <p>테스트케이스를 지워도 첨부 기록을 남기려면 test_case_id 가 NULL 을 받아야 한다. 엔티티에서 nullable 을 열어도 ddl-auto: update
   * 는 이미 만들어진 컬럼의 NOT NULL 을 해제하지 않고 Flyway 도 꺼져 있어, 시작할 때 한 번 직접 처리한다.
   *
   * <p>DDL 이라 트랜잭션이 필요 없어 커넥션에서 바로 실행한다. 먼저 information_schema 로 이미 해제됐는지 보고, 그때는 아무 일도 하지 않는다 —
   * 벤더마다 다른 ALTER 문법을 불필요하게 태우지 않기 위해서다.
   */
  @Bean
  @Order(0)
  public CommandLineRunner relaxTestCaseAttachmentOwnerConstraint() {
    return args -> {
      try (Connection connection = dataSource.getConnection()) {
        // 판정에 실패하면 해제를 시도한다. 조회가 안 되는 DB 에서 ALTER 를 건너뛰면
        // 컬럼이 NOT NULL 로 남아 케이스 삭제 시 첨부 기록이 사라진다.
        boolean notNull;
        try {
          notNull = isOwnerColumnNotNull(connection);
        } catch (SQLException e) {
          System.err.println(
              "test_case_attachments.test_case_id 의 NULL 허용 여부를 확인하지 못해 해제를 시도합니다: "
                  + e.getMessage());
          notNull = true;
        }
        if (!notNull) {
          return;
        }
        try (Statement statement = connection.createStatement()) {
          statement.executeUpdate(
              "ALTER TABLE test_case_attachments ALTER COLUMN test_case_id DROP NOT NULL");
        }
        System.out.println("🔧 test_case_attachments.test_case_id: NOT NULL 해제 완료");
      } catch (Exception e) {
        System.err.println(
            "test_case_attachments.test_case_id 의 NOT NULL 을 해제하지 못했습니다. "
                + "테스트케이스를 지울 때 첨부 기록이 남지 않을 수 있습니다: "
                + e.getMessage());
      }
    };
  }

  /**
   * 소유 컬럼이 아직 NOT NULL 인지.
   *
   * <p>같은 이름의 표가 여러 스키마에 있을 수 있어 현재 스키마로 좁힌다. 표를 못 찾으면 해제할 것이 없다고 본다.
   */
  private boolean isOwnerColumnNotNull(Connection connection) throws SQLException {
    String schema = connection.getSchema();
    String sql =
        "SELECT is_nullable FROM information_schema.columns "
            + "WHERE lower(table_name) = 'test_case_attachments' "
            + "AND lower(column_name) = 'test_case_id'"
            + (schema != null ? " AND table_schema = ?" : "");
    try (PreparedStatement statement = connection.prepareStatement(sql)) {
      if (schema != null) {
        statement.setString(1, schema);
      }
      try (ResultSet rs = statement.executeQuery()) {
        return rs.next() && "NO".equalsIgnoreCase(rs.getString("is_nullable"));
      }
    }
  }

  @Bean
  @Order(0) // DataInitializer보다 먼저 실행하여 제약 조건을 수정
  public CommandLineRunner fixTestSessionStatusConstraint() {
    return args -> {
      try {
        processConstraintFix();
      } catch (Exception e) {
        System.err.println(
            "Failed to fix test_sessions_status_check constraint: " + e.getMessage());
        // 제약 조건이 이미 올바르거나 테이블이 없을 수 있음
      }
    };
  }

  @Transactional
  protected void processConstraintFix() {
    // PostgreSQL에서 체크 제약 조건 유무 확인 및 수정
    // Hibernate의 ddl-auto: update는 기존 체크 제약 조건을 자동으로 업데이트하지 않음.

    System.out.println("🔧 Checking and fixing test_sessions_status_check constraint...");

    // 1. 컬럼 추가 (PostgreSQL 9.6+ 문법 사용)
    // ddl-auto: update가 놓칠 수 있는 컬럼 추가를 보장함
    entityManager
        .createNativeQuery(
            "ALTER TABLE test_sessions ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT ''")
        .executeUpdate();

    // 2. NOT NULL 제약 조건 보장
    entityManager
        .createNativeQuery("ALTER TABLE test_sessions ALTER COLUMN title SET NOT NULL")
        .executeUpdate();

    // 3. 기존 제약 조건 삭제 (존재하는 경우)
    entityManager
        .createNativeQuery(
            "ALTER TABLE test_sessions DROP CONSTRAINT IF EXISTS test_sessions_status_check")
        .executeUpdate();

    // 4. 새로운 Enum 값을 포함한 제약 조건 생성
    // SessionStatus: DRAFT, RUNNING, PAUSED, COMPLETED, SUBMITTED, NEEDS_UPDATE, APPROVED, ARCHIVED
    entityManager
        .createNativeQuery(
            "ALTER TABLE test_sessions ADD CONSTRAINT test_sessions_status_check "
                + "CHECK (status >= 0 AND status <= 7)")
        .executeUpdate();

    System.out.println("✅ Successfully updated test_sessions schema and constraints.");
  }
}
