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

  @Bean
  @Order(0) // DataInitializer보다 먼저 실행하여 제약 조건을 수정
  public CommandLineRunner fixTestSessionStatusConstraint() {
    return args -> {
      try {
        processConstraintFix();
      } catch (Exception e) {
        System.err.println(
            "Failed to fix test_sessions_status_check constraint: " + e.getMessage());
        // 제약 조건이 이미 올바르거나 테이블이 없을 수 있음 (H2 등)
      }
    };
  }

  @Transactional
  protected void processConstraintFix() {
    // PostgreSQL에서 체크 제약 조건 유무 확인 및 수정
    // Hibernate의 ddl-auto: update는 기존 체크 제약 조건을 자동으로 업데이트하지 않음.

    System.out.println("🔧 Checking and fixing test_sessions_status_check constraint...");

    // 1. 기존 제약 조건 삭제 (존재하는 경우)
    entityManager
        .createNativeQuery(
            "ALTER TABLE test_sessions DROP CONSTRAINT IF EXISTS test_sessions_status_check")
        .executeUpdate();

    // 2. 새로운 Enum 값을 포함한 제약 조건 생성
    // SessionStatus: DRAFT, RUNNING, PAUSED, COMPLETED, SUBMITTED, NEEDS_UPDATE, APPROVED, ARCHIVED
    entityManager
        .createNativeQuery(
            "ALTER TABLE test_sessions ADD CONSTRAINT test_sessions_status_check "
                + "CHECK (status >= 0 AND status <= 7)")
        .executeUpdate();

    System.out.println("✅ Successfully updated test_sessions_status_check constraint.");
  }
}
