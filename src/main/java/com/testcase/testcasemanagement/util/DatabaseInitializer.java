package com.testcase.testcasemanagement.util;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** ICT-278: 데이터베이스 초기화 유틸리티 */
@Component
public class DatabaseInitializer {

  @Autowired private JdbcTemplate jdbcTemplate;

  public void executeUnifiedInit() {
    System.out.println("🚀 ICT-278: 통합 데이터베이스 초기화 시작");

    try {
      // Step 0: TestCase version null 초기화 (ICT-373)
      initTestCaseVersions();

      // Step 1: 사용자 데이터 초기화
      initUsers();

      // Step 2: 조직 데이터 초기화
      initOrganizations();

      // Step 3: 프로젝트 데이터 초기화
      initProjects();

      // Step 4: 테스트케이스 데이터 초기화
      initTestCases();

      // Step 5: 테스트플랜 데이터 초기화
      initTestPlans();

      // Step 6: 테스트실행 데이터 초기화
      initTestExecutions();

      // Step 7: 테스트결과 데이터 초기화
      initTestResults();

      // 최종 상태 확인
      printFinalStatus();

      System.out.println("🎉 데이터베이스 초기화 완료!");

    } catch (Exception e) {
      System.err.println("❌ 데이터베이스 초기화 실패: " + e.getMessage());
      e.printStackTrace();
    }
  }

  private void initTestCaseVersions() {
    System.out.println("📋 Step 0: TestCase version null 초기화 (ICT-373)");

    int updated = jdbcTemplate.update("UPDATE testcases SET version = 0 WHERE version IS NULL");

    if (updated > 0) {
      System.out.println("   🔧 version null인 " + updated + "개 TestCase 초기화 완료");
    } else {
      System.out.println("   ✅ 모든 TestCase가 유효한 version을 가지고 있습니다");
    }
  }

  private void initUsers() {
    System.out.println("📋 Step 1: 사용자 데이터 초기화");

    // 사용자 MERGE
    jdbcTemplate.execute(
        "MERGE INTO users (id, username, password, name, email, role, created_at, updated_at)"
            + " KEY(username) VALUES ('admin-user-id-2025', 'admin',"
            + " '$2a$10$N.DpplxV2.MMjfLDdyBdSOHzhqjkn.2Z0FJi2AeN/ACrEhZFbtk.2', '관리자',"
            + " 'admin@testcase.com', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('tester-user-id-2025', 'tester',"
            + " '$2a$10$Tqbh/b7LGdA6iGXa6bpMce4IqkG6pJz4k.PnMq7yV8DMZX0sjr6vO', '테스터',"
            + " 'tester@testcase.com', 'TESTER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('developer-user-id-2025', 'developer',"
            + " '$2a$10$Y.HHb9Z9D0g4PdkSbCn5qOqBgFOuY9aI8YdPsj1.I4Pj9xKkJ7S4G', '개발자',"
            + " 'developer@testcase.com', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    System.out.println("✅ 사용자 데이터 초기화 완료");
  }

  private void initOrganizations() {
    System.out.println("📋 Step 2: 조직 데이터 초기화");

    // 조직 MERGE
    jdbcTemplate.execute(
        "MERGE INTO organizations (id, name, description, created_at, updated_at) KEY(name) VALUES"
            + " ('qa-org-id-2025', 'QA팀', '품질 보증 및 테스트 전담 조직', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('dev-org-id-2025', '개발팀', '제품 개발 및 기술 혁신 조직',"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('devops-org-id-2025', '데브옵스팀', 'CI/CD 및 인프라"
            + " 운영 조직', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    // 조직-사용자 연결 초기화
    jdbcTemplate.execute(
        "DELETE FROM organization_users WHERE organization_id IN ('qa-org-id-2025',"
            + " 'dev-org-id-2025', 'devops-org-id-2025')");

    jdbcTemplate.execute(
        "INSERT INTO organization_users (id, organization_id, user_id, role_in_organization,"
            + " created_at, updated_at) VALUES ('qa-admin-membership-2025', 'qa-org-id-2025',"
            + " 'admin-user-id-2025', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('qa-tester-membership-2025', 'qa-org-id-2025', 'tester-user-id-2025', 'OWNER',"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('dev-admin-membership-2025',"
            + " 'dev-org-id-2025', 'admin-user-id-2025', 'ADMIN', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('dev-developer-membership-2025', 'dev-org-id-2025',"
            + " 'developer-user-id-2025', 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('devops-admin-membership-2025', 'devops-org-id-2025', 'admin-user-id-2025',"
            + " 'OWNER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    System.out.println("✅ 조직 데이터 초기화 완료");
  }

  private void initProjects() {
    System.out.println("📋 Step 3: 프로젝트 데이터 초기화");

    // 프로젝트 MERGE
    jdbcTemplate.execute(
        "MERGE INTO projects (id, name, code, description, organization_id, display_order,"
            + " created_at, updated_at) KEY(name) VALUES ('main-project-id-2025', '테스트 관리 시스템',"
            + " 'TMS', '테스트케이스 관리 시스템 메인 프로젝트', 'qa-org-id-2025', 1, CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('qa-auto-project-id-2025', 'QA 자동화', 'QA-AUTO', 'QA 자동화 도구 개발"
            + " 프로젝트', 'qa-org-id-2025', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('api-project-id-2025', 'API 서버 개발', 'API-DEV', 'RESTful API 서버 개발 프로젝트',"
            + " 'dev-org-id-2025', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    // 프로젝트-사용자 권한 초기화
    jdbcTemplate.execute(
        "DELETE FROM project_users WHERE project_id IN ('main-project-id-2025',"
            + " 'qa-auto-project-id-2025', 'api-project-id-2025')");

    jdbcTemplate.execute(
        "INSERT INTO project_users (id, project_id, user_id, role_in_project, created_at,"
            + " updated_at) VALUES ('main-admin-pm-2025', 'main-project-id-2025',"
            + " 'admin-user-id-2025', 'PROJECT_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('main-tester-role-2025', 'main-project-id-2025', 'tester-user-id-2025', 'TESTER',"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('qa-tester-pm-2025',"
            + " 'qa-auto-project-id-2025', 'tester-user-id-2025', 'PROJECT_MANAGER',"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('qa-admin-role-2025',"
            + " 'qa-auto-project-id-2025', 'admin-user-id-2025', 'TESTER', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('api-dev-pm-2025', 'api-project-id-2025',"
            + " 'developer-user-id-2025', 'PROJECT_MANAGER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('api-admin-role-2025', 'api-project-id-2025', 'admin-user-id-2025',"
            + " 'LEAD_DEVELOPER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    System.out.println("✅ 프로젝트 데이터 초기화 완료");
  }

  private void initTestCases() {
    System.out.println("📋 Step 4: 테스트케이스 데이터 초기화");

    // 기존 테스트케이스 삭제
    jdbcTemplate.execute("DELETE FROM testcases WHERE id LIKE '%2025'");

    // QA팀 - 메인 프로젝트 테스트케이스 (10개)
    jdbcTemplate.execute(
        "INSERT INTO testcases (id, name, type, description, priority, status, project_id,"
            + " created_at, updated_at, display_order, execution_time) VALUES ('tc-login-2025',"
            + " '로그인 기능 테스트', 'FUNCTIONAL', '사용자 로그인 기능의 정상 동작 검증', 'HIGH', 'ACTIVE',"
            + " 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 30),"
            + " ('tc-auth-2025', '사용자 인증 테스트', 'SECURITY', 'JWT 토큰 기반 인증 시스템 검증', 'HIGH', 'ACTIVE',"
            + " 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 45),"
            + " ('tc-dashboard-2025', '대시보드 기능 테스트', 'UI', '대시보드 화면 렌더링 및 데이터 표시 검증', 'MEDIUM',"
            + " 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 60),"
            + " ('tc-project-mgmt-2025', '프로젝트 관리 테스트', 'FUNCTIONAL', '프로젝트 생성, 수정, 삭제 기능 검증',"
            + " 'MEDIUM', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,"
            + " 4, 90), ('tc-testcase-crud-2025', '테스트케이스 CRUD 테스트', 'FUNCTIONAL', '테스트케이스 생성, 읽기,"
            + " 수정, 삭제 기능 검증', 'HIGH', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, 5, 120)");

    // QA팀 - 자동화 프로젝트 테스트케이스 (10개)
    jdbcTemplate.execute(
        "INSERT INTO testcases (id, name, type, description, priority, status, project_id,"
            + " created_at, updated_at, display_order, execution_time) VALUES ('tc-api-test-2025',"
            + " 'API 엔드포인트 테스트', 'API', 'REST API 엔드포인트의 응답 및 성능 검증', 'HIGH', 'ACTIVE',"
            + " 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 75),"
            + " ('tc-e2e-test-2025', 'E2E 자동화 테스트', 'AUTOMATION', '브라우저 기반 End-to-End 테스트 시나리오 검증',"
            + " 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, 2, 180), ('tc-perf-test-2025', '성능 테스트', 'PERFORMANCE', '시스템 부하"
            + " 테스트 및 성능 지표 측정', 'HIGH', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, 3, 240), ('tc-mobile-responsive-2025', '모바일 반응형 테스트', 'UI', '다양한"
            + " 디바이스에서의 반응형 UI 검증', 'MEDIUM', 'ACTIVE', 'qa-auto-project-id-2025',"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 150), ('tc-browser-compat-2025', '브라우저 호환성"
            + " 테스트', 'COMPATIBILITY', 'Chrome, Firefox, Safari, Edge 브라우저 호환성 검증', 'MEDIUM',"
            + " 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5,"
            + " 200)");

    // 개발팀 - API 프로젝트 테스트케이스 (10개)
    jdbcTemplate.execute(
        "INSERT INTO testcases (id, name, type, description, priority, status, project_id,"
            + " created_at, updated_at, display_order, execution_time) VALUES ('tc-unit-test-2025',"
            + " '단위 테스트', 'UNIT', 'Java 단위 테스트 실행 및 커버리지 검증', 'HIGH', 'ACTIVE',"
            + " 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 45),"
            + " ('tc-integration-2025', '통합 테스트', 'INTEGRATION', '서비스 간 통합 테스트 및 데이터 일관성 검증',"
            + " 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2,"
            + " 90), ('tc-api-auth-2025', 'API 인증 테스트', 'SECURITY', 'API 엔드포인트 인증 및 권한 검증', 'HIGH',"
            + " 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 60),"
            + " ('tc-api-validation-2025', 'API 입력 검증 테스트', 'FUNCTIONAL', '입력 데이터 유효성 검사 및 오류 처리"
            + " 검증', 'HIGH', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,"
            + " 4, 75), ('tc-database-2025', '데이터베이스 연동 테스트', 'INTEGRATION', 'JPA, Hibernate를 통한"
            + " 데이터베이스 CRUD 검증', 'MEDIUM', 'ACTIVE', 'api-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, 5, 100)");

    System.out.println("✅ 테스트케이스 데이터 초기화 완료");
  }

  private void initTestPlans() {
    System.out.println("📋 Step 5: 테스트플랜 데이터 초기화");

    // 기존 테스트플랜 삭제
    jdbcTemplate.execute("DELETE FROM testplans WHERE id LIKE '%2025'");

    // 각 프로젝트별 테스트플랜 생성
    jdbcTemplate.execute(
        "INSERT INTO testplans (id, name, description, status, project_id, created_at, updated_at,"
            + " start_date, end_date, created_by) VALUES ('tp-main-weekly-2025', '메인 프로젝트 주간 테스트',"
            + " '메인 시스템의 주간 정기 테스트 플랜', 'ACTIVE', 'main-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, DATEADD('DAY', -7, CURRENT_DATE), CURRENT_DATE,"
            + " 'admin-user-id-2025'), ('tp-qa-auto-sprint-2025', 'QA 자동화 스프린트 테스트', 'QA 자동화 도구"
            + " 스프린트별 테스트 플랜', 'ACTIVE', 'qa-auto-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, DATEADD('DAY', -14, CURRENT_DATE), DATEADD('DAY', -7,"
            + " CURRENT_DATE), 'tester-user-id-2025'), ('tp-api-regression-2025', 'API 회귀 테스트',"
            + " 'API 서버 회귀 테스트 플랜', 'COMPLETED', 'api-project-id-2025', CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP, DATEADD('DAY', -21, CURRENT_DATE), DATEADD('DAY', -14,"
            + " CURRENT_DATE), 'developer-user-id-2025')");

    // 테스트플랜-테스트케이스 연결
    jdbcTemplate.execute("DELETE FROM testplan_testcases WHERE testplan_id LIKE '%2025'");

    // 메인 프로젝트 테스트플랜에 테스트케이스 연결
    jdbcTemplate.execute(
        "INSERT INTO testplan_testcases (id, testplan_id, testcase_id, execution_order, created_at,"
            + " updated_at) VALUES ('tptc-main-1-2025', 'tp-main-weekly-2025', 'tc-login-2025', 1,"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('tptc-main-2-2025', 'tp-main-weekly-2025',"
            + " 'tc-auth-2025', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('tptc-main-3-2025',"
            + " 'tp-main-weekly-2025', 'tc-dashboard-2025', 3, CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('tptc-main-4-2025', 'tp-main-weekly-2025',"
            + " 'tc-project-mgmt-2025', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),"
            + " ('tptc-main-5-2025', 'tp-main-weekly-2025', 'tc-testcase-crud-2025', 5,"
            + " CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    // QA 자동화 테스트플랜에 테스트케이스 연결
    jdbcTemplate.execute(
        "INSERT INTO testplan_testcases (id, testplan_id, testcase_id, execution_order, created_at,"
            + " updated_at) VALUES ('tptc-qa-1-2025', 'tp-qa-auto-sprint-2025', 'tc-api-test-2025',"
            + " 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('tptc-qa-2-2025',"
            + " 'tp-qa-auto-sprint-2025', 'tc-e2e-test-2025', 2, CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('tptc-qa-3-2025', 'tp-qa-auto-sprint-2025',"
            + " 'tc-perf-test-2025', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('tptc-qa-4-2025',"
            + " 'tp-qa-auto-sprint-2025', 'tc-mobile-responsive-2025', 4, CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('tptc-qa-5-2025', 'tp-qa-auto-sprint-2025',"
            + " 'tc-browser-compat-2025', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    // API 프로젝트 테스트플랜에 테스트케이스 연결
    jdbcTemplate.execute(
        "INSERT INTO testplan_testcases (id, testplan_id, testcase_id, execution_order, created_at,"
            + " updated_at) VALUES ('tptc-api-1-2025', 'tp-api-regression-2025',"
            + " 'tc-unit-test-2025', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('tptc-api-2-2025',"
            + " 'tp-api-regression-2025', 'tc-integration-2025', 2, CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('tptc-api-3-2025', 'tp-api-regression-2025',"
            + " 'tc-api-auth-2025', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), ('tptc-api-4-2025',"
            + " 'tp-api-regression-2025', 'tc-api-validation-2025', 4, CURRENT_TIMESTAMP,"
            + " CURRENT_TIMESTAMP), ('tptc-api-5-2025', 'tp-api-regression-2025',"
            + " 'tc-database-2025', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");

    System.out.println("✅ 테스트플랜 데이터 초기화 완료");
  }

  private void initTestExecutions() {
    System.out.println("📋 Step 6: 테스트실행 데이터 초기화");

    // 기존 테스트실행 삭제
    jdbcTemplate.execute("DELETE FROM test_executions WHERE id LIKE '%2025'");

    // 각 테스트플랜별 테스트실행 생성 (최근 2주간)
    jdbcTemplate.execute(
        "INSERT INTO test_executions (id, testplan_id, name, description, status, executed_by,"
            + " started_at, completed_at, created_at, updated_at) VALUES "
            +
            // 메인 프로젝트 실행 이력
            "('te-main-week1-2025', 'tp-main-weekly-2025', '메인 시스템 1주차 실행', '메인 시스템 주간 테스트 1주차 실행',"
          + " 'COMPLETED', 'admin-user-id-2025', DATEADD('DAY', -7, CURRENT_TIMESTAMP),"
          + " DATEADD('DAY', -6, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP),"
          + " DATEADD('DAY', -6, CURRENT_TIMESTAMP)), ('te-main-week2-2025', 'tp-main-weekly-2025',"
          + " '메인 시스템 2주차 실행', '메인 시스템 주간 테스트 2주차 실행', 'COMPLETED', 'tester-user-id-2025',"
          + " DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP),"
          + " DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP)),"
          + " ('te-main-current-2025', 'tp-main-weekly-2025', '메인 시스템 현재 실행', '메인 시스템 주간 테스트 현재"
          + " 실행', 'IN_PROGRESS', 'admin-user-id-2025', DATEADD('HOUR', -2, CURRENT_TIMESTAMP),"
          + " NULL, DATEADD('HOUR', -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP), "
            +
            // QA 자동화 실행 이력
            "('te-qa-sprint1-2025', 'tp-qa-auto-sprint-2025', 'QA 자동화 스프린트 1차', 'QA 자동화 도구 스프린트 1차"
            + " 실행', 'COMPLETED', 'tester-user-id-2025', DATEADD('DAY', -10, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -9, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -9, CURRENT_TIMESTAMP)), ('te-qa-sprint2-2025',"
            + " 'tp-qa-auto-sprint-2025', 'QA 자동화 스프린트 2차', 'QA 자동화 도구 스프린트 2차 실행', 'COMPLETED',"
            + " 'admin-user-id-2025', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4,"
            + " CURRENT_TIMESTAMP)), "
            +
            // API 프로젝트 실행 이력
            "('te-api-regression1-2025', 'tp-api-regression-2025', 'API 회귀 테스트 1차', 'API 서버 회귀 테스트"
          + " 1차 실행', 'COMPLETED', 'developer-user-id-2025', DATEADD('DAY', -14,"
          + " CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), DATEADD('DAY', -14,"
          + " CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP)),"
          + " ('te-api-regression2-2025', 'tp-api-regression-2025', 'API 회귀 테스트 2차', 'API 서버 회귀 테스트"
          + " 2차 실행', 'COMPLETED', 'admin-user-id-2025', DATEADD('DAY', -8, CURRENT_TIMESTAMP),"
          + " DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP),"
          + " DATEADD('DAY', -7, CURRENT_TIMESTAMP))");

    System.out.println("✅ 테스트실행 데이터 초기화 완료");
  }

  private void initTestResults() {
    System.out.println("📋 Step 7: 테스트결과 데이터 초기화");

    // 기존 테스트결과 삭제
    jdbcTemplate.execute("DELETE FROM test_results WHERE id LIKE '%2025'");

    // 완료된 테스트실행에 대한 테스트결과 생성
    // 메인 프로젝트 1주차 실행 결과 (5개 테스트케이스)
    jdbcTemplate.execute(
        "INSERT INTO test_results (id, test_execution_id, testcase_id, status, notes, executed_by,"
            + " executed_at, created_at, updated_at, execution_duration, failure_reason) VALUES"
            + " ('tr-main-w1-login-2025', 'te-main-week1-2025', 'tc-login-2025', 'PASSED', '로그인 기능"
            + " 정상 동작 확인', 'admin-user-id-2025', DATEADD('DAY', -7, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), 28,"
            + " NULL), ('tr-main-w1-auth-2025', 'te-main-week1-2025', 'tc-auth-2025', 'PASSED',"
            + " 'JWT 토큰 인증 정상', 'admin-user-id-2025', DATEADD('DAY', -7, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), 42,"
            + " NULL), ('tr-main-w1-dash-2025', 'te-main-week1-2025', 'tc-dashboard-2025',"
            + " 'FAILED', '대시보드 차트 로딩 지연', 'admin-user-id-2025', DATEADD('DAY', -7,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6,"
            + " CURRENT_TIMESTAMP), 75, '차트 데이터 로딩 시간 초과'), ('tr-main-w1-proj-2025',"
            + " 'te-main-week1-2025', 'tc-project-mgmt-2025', 'PASSED', '프로젝트 CRUD 정상',"
            + " 'admin-user-id-2025', DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -7,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), 85, NULL),"
            + " ('tr-main-w1-tc-2025', 'te-main-week1-2025', 'tc-testcase-crud-2025', 'PASSED',"
            + " '테스트케이스 관리 정상', 'admin-user-id-2025', DATEADD('DAY', -7, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -7, CURRENT_TIMESTAMP), DATEADD('DAY', -6, CURRENT_TIMESTAMP), 115,"
            + " NULL)");

    // 메인 프로젝트 2주차 실행 결과
    jdbcTemplate.execute(
        "INSERT INTO test_results (id, test_execution_id, testcase_id, status, notes, executed_by,"
            + " executed_at, created_at, updated_at, execution_duration, failure_reason) VALUES"
            + " ('tr-main-w2-login-2025', 'te-main-week2-2025', 'tc-login-2025', 'PASSED', '로그인 성능"
            + " 개선 확인', 'tester-user-id-2025', DATEADD('DAY', -3, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), 25,"
            + " NULL), ('tr-main-w2-auth-2025', 'te-main-week2-2025', 'tc-auth-2025', 'PASSED',"
            + " 'JWT 갱신 로직 정상', 'tester-user-id-2025', DATEADD('DAY', -3, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), 38,"
            + " NULL), ('tr-main-w2-dash-2025', 'te-main-week2-2025', 'tc-dashboard-2025',"
            + " 'PASSED', '대시보드 성능 개선 적용', 'tester-user-id-2025', DATEADD('DAY', -3,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -2,"
            + " CURRENT_TIMESTAMP), 55, NULL), ('tr-main-w2-proj-2025', 'te-main-week2-2025',"
            + " 'tc-project-mgmt-2025', 'PASSED', '프로젝트 권한 관리 정상', 'tester-user-id-2025',"
            + " DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -2, CURRENT_TIMESTAMP), 82, NULL), ('tr-main-w2-tc-2025',"
            + " 'te-main-week2-2025', 'tc-testcase-crud-2025', 'SKIPPED', '중복 테스트로 생략',"
            + " 'tester-user-id-2025', DATEADD('DAY', -3, CURRENT_TIMESTAMP), DATEADD('DAY', -3,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -2, CURRENT_TIMESTAMP), 0, NULL)");

    // QA 자동화 스프린트 1차 결과
    jdbcTemplate.execute(
        "INSERT INTO test_results (id, test_execution_id, testcase_id, status, notes, executed_by,"
            + " executed_at, created_at, updated_at, execution_duration, failure_reason) VALUES"
            + " ('tr-qa-s1-api-2025', 'te-qa-sprint1-2025', 'tc-api-test-2025', 'PASSED', 'API 응답시간"
            + " 기준 충족', 'tester-user-id-2025', DATEADD('DAY', -10, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), 72,"
            + " NULL), ('tr-qa-s1-e2e-2025', 'te-qa-sprint1-2025', 'tc-e2e-test-2025', 'FAILED',"
            + " 'Firefox 호환성 이슈', 'tester-user-id-2025', DATEADD('DAY', -10, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), 195,"
            + " 'Firefox에서 로그인 버튼 인식 실패'), ('tr-qa-s1-perf-2025', 'te-qa-sprint1-2025',"
            + " 'tc-perf-test-2025', 'PASSED', '성능 기준 만족', 'tester-user-id-2025', DATEADD('DAY',"
            + " -10, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -9,"
            + " CURRENT_TIMESTAMP), 235, NULL), ('tr-qa-s1-mobile-2025', 'te-qa-sprint1-2025',"
            + " 'tc-mobile-responsive-2025', 'PASSED', '모바일 반응형 정상', 'tester-user-id-2025',"
            + " DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -10, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -9, CURRENT_TIMESTAMP), 145, NULL), ('tr-qa-s1-browser-2025',"
            + " 'te-qa-sprint1-2025', 'tc-browser-compat-2025', 'PASSED', '브라우저 호환성 양호',"
            + " 'tester-user-id-2025', DATEADD('DAY', -10, CURRENT_TIMESTAMP), DATEADD('DAY', -10,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -9, CURRENT_TIMESTAMP), 185, NULL)");

    // QA 자동화 스프린트 2차 결과
    jdbcTemplate.execute(
        "INSERT INTO test_results (id, test_execution_id, testcase_id, status, notes, executed_by,"
            + " executed_at, created_at, updated_at, execution_duration, failure_reason) VALUES"
            + " ('tr-qa-s2-api-2025', 'te-qa-sprint2-2025', 'tc-api-test-2025', 'PASSED', 'API 성능"
            + " 추가 개선', 'admin-user-id-2025', DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY',"
            + " -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), 68, NULL),"
            + " ('tr-qa-s2-e2e-2025', 'te-qa-sprint2-2025', 'tc-e2e-test-2025', 'PASSED', 'Firefox"
            + " 이슈 해결 확인', 'admin-user-id-2025', DATEADD('DAY', -5, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), 175,"
            + " NULL), ('tr-qa-s2-perf-2025', 'te-qa-sprint2-2025', 'tc-perf-test-2025', 'PASSED',"
            + " '부하테스트 안정성 향상', 'admin-user-id-2025', DATEADD('DAY', -5, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4, CURRENT_TIMESTAMP), 225,"
            + " NULL), ('tr-qa-s2-mobile-2025', 'te-qa-sprint2-2025', 'tc-mobile-responsive-2025',"
            + " 'PASSED', '태블릿 최적화 완료', 'admin-user-id-2025', DATEADD('DAY', -5,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -4,"
            + " CURRENT_TIMESTAMP), 140, NULL), ('tr-qa-s2-browser-2025', 'te-qa-sprint2-2025',"
            + " 'tc-browser-compat-2025', 'PASSED', '모든 브라우저 정상', 'admin-user-id-2025',"
            + " DATEADD('DAY', -5, CURRENT_TIMESTAMP), DATEADD('DAY', -5, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -4, CURRENT_TIMESTAMP), 190, NULL)");

    // API 회귀 테스트 1차, 2차 결과
    jdbcTemplate.execute(
        "INSERT INTO test_results (id, test_execution_id, testcase_id, status, notes, executed_by,"
            + " executed_at, created_at, updated_at, execution_duration, failure_reason) VALUES"
            + " ('tr-api-r1-unit-2025', 'te-api-regression1-2025', 'tc-unit-test-2025', 'PASSED',"
            + " '단위테스트 커버리지 95%', 'developer-user-id-2025', DATEADD('DAY', -14, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), 42,"
            + " NULL), ('tr-api-r1-integ-2025', 'te-api-regression1-2025', 'tc-integration-2025',"
            + " 'PASSED', '서비스 통합 정상', 'developer-user-id-2025', DATEADD('DAY', -14,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13,"
            + " CURRENT_TIMESTAMP), 88, NULL), ('tr-api-r1-apiauth-2025',"
            + " 'te-api-regression1-2025', 'tc-api-auth-2025', 'PASSED', 'API 권한 체계 정상',"
            + " 'developer-user-id-2025', DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY',"
            + " -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), 58, NULL),"
            + " ('tr-api-r1-valid-2025', 'te-api-regression1-2025', 'tc-api-validation-2025',"
            + " 'FAILED', '입력 검증 로직 누락', 'developer-user-id-2025', DATEADD('DAY', -14,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13,"
            + " CURRENT_TIMESTAMP), 72, '특수문자 입력값에 대한 검증 누락'), ('tr-api-r1-db-2025',"
            + " 'te-api-regression1-2025', 'tc-database-2025', 'PASSED', '데이터베이스 연동 안정',"
            + " 'developer-user-id-2025', DATEADD('DAY', -14, CURRENT_TIMESTAMP), DATEADD('DAY',"
            + " -14, CURRENT_TIMESTAMP), DATEADD('DAY', -13, CURRENT_TIMESTAMP), 95, NULL),"
            + " ('tr-api-r2-unit-2025', 'te-api-regression2-2025', 'tc-unit-test-2025', 'PASSED',"
            + " '커버리지 97% 달성', 'admin-user-id-2025', DATEADD('DAY', -8, CURRENT_TIMESTAMP),"
            + " DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), 40,"
            + " NULL), ('tr-api-r2-integ-2025', 'te-api-regression2-2025', 'tc-integration-2025',"
            + " 'PASSED', '통합 테스트 안정화', 'admin-user-id-2025', DATEADD('DAY', -8,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -7,"
            + " CURRENT_TIMESTAMP), 85, NULL), ('tr-api-r2-apiauth-2025',"
            + " 'te-api-regression2-2025', 'tc-api-auth-2025', 'PASSED', 'OAuth2 통합 완료',"
            + " 'admin-user-id-2025', DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -8,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -7, CURRENT_TIMESTAMP), 55, NULL),"
            + " ('tr-api-r2-valid-2025', 'te-api-regression2-2025', 'tc-api-validation-2025',"
            + " 'PASSED', '입력 검증 이슈 해결', 'admin-user-id-2025', DATEADD('DAY', -8,"
            + " CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -7,"
            + " CURRENT_TIMESTAMP), 70, NULL), ('tr-api-r2-db-2025', 'te-api-regression2-2025',"
            + " 'tc-database-2025', 'PASSED', '트랜잭션 최적화 적용', 'admin-user-id-2025', DATEADD('DAY',"
            + " -8, CURRENT_TIMESTAMP), DATEADD('DAY', -8, CURRENT_TIMESTAMP), DATEADD('DAY', -7,"
            + " CURRENT_TIMESTAMP), 92, NULL)");

    System.out.println("✅ 테스트결과 데이터 초기화 완료");
  }

  private void printFinalStatus() {
    System.out.println("\n📊 최종 데이터 상태:");

    List<Map<String, Object>> counts =
        jdbcTemplate.queryForList(
            "SELECT 'Users' as table_name, COUNT(*) as count FROM users "
                + "UNION ALL SELECT 'Organizations', COUNT(*) FROM organizations "
                + "UNION ALL SELECT 'Projects', COUNT(*) FROM projects "
                + "UNION ALL SELECT 'TestCases', COUNT(*) FROM testcases "
                + "UNION ALL SELECT 'TestPlans', COUNT(*) FROM testplans "
                + "UNION ALL SELECT 'TestExecutions', COUNT(*) FROM test_executions "
                + "UNION ALL SELECT 'TestResults', COUNT(*) FROM test_results "
                + "UNION ALL SELECT 'OrganizationUsers', COUNT(*) FROM organization_users "
                + "UNION ALL SELECT 'ProjectUsers', COUNT(*) FROM project_users "
                + "UNION ALL SELECT 'TestPlanTestCases', COUNT(*) FROM testplan_testcases");

    for (Map<String, Object> row : counts) {
      System.out.println("   - " + row.get("TABLE_NAME") + ": " + row.get("COUNT") + "개");
    }
  }
}
