package com.testcase.testcasemanagement.config;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DatabaseConstraintFixer {

  @Autowired private EntityManager entityManager;

  /**
   * 첨부의 소유 컬럼이 비워질 수 있게 NOT NULL 을 푼다.
   *
   * <p>테스트케이스를 지워도 첨부 기록을 남기려면 test_case_id 가 NULL 을 받아야 한다. 엔티티에서 nullable 을 열어도 ddl-auto: update
   * 는 이미 만들어진 컬럼의 NOT NULL 을 풀어 주지 않고 Flyway 도 꺼져 있어, 시작할 때 한 번 직접 푼다. 이미 풀려 있으면 아무 일도 하지 않는다.
   */
  @Bean
  @Order(0)
  public CommandLineRunner relaxTestCaseAttachmentOwnerConstraint() {
    return args -> {
      try {
        entityManager
            .createNativeQuery(
                "ALTER TABLE test_case_attachments ALTER COLUMN test_case_id DROP NOT NULL")
            .executeUpdate();
        System.out.println("🔧 test_case_attachments.test_case_id: NOT NULL 해제 확인");
      } catch (Exception e) {
        System.err.println(
            "test_case_attachments.test_case_id 의 NOT NULL 을 풀지 못했습니다. "
                + "테스트케이스를 지울 때 첨부 기록이 남지 않을 수 있습니다: "
                + e.getMessage());
      }
    };
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
