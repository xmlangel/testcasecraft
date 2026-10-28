package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 프로젝트 강제 삭제에서 프로젝트에 딸린 데이터를 모두 지운다.
 *
 * <p>프로젝트 행을 지우기 전에, 프로젝트·테스트케이스·테스트결과를 외래 키로 참조하는 행을 자식부터 지워야 한다. 하나라도 남으면 프로젝트 삭제가 외래 키 위반(409)으로
 * 실패한다. 외래 키 없이 ID 만 저장하는 테이블(요구사항 연결·관계, JUnit 결과, 케이스 버전 등)은 삭제를 막지는 않지만 지우지 않으면 고아 행으로 남으므로 함께
 * 지운다.
 *
 * <p>새 기능이 프로젝트에 딸린 테이블을 추가하면 이 목록에도 넣어야 한다. {@code ProjectDataPurgerTest} 가 프로젝트를 참조하는 외래 키를 DB 에서
 * 읽어 이 목록과 대조하므로, 넣지 않으면 그 테스트가 실패한다.
 */
@Component
public class ProjectDataPurger {

  private static final Logger log = LoggerFactory.getLogger(ProjectDataPurger.class);

  private static final String EXECUTIONS =
      "SELECT id FROM test_executions WHERE project_id = :projectId";
  private static final String RESULTS =
      "SELECT tr.id FROM test_results tr JOIN test_executions te ON tr.test_execution_id = te.id"
          + " WHERE te.project_id = :projectId";
  private static final String CASES = "SELECT id FROM testcases WHERE project_id = :projectId";
  private static final String REQUIREMENTS =
      "SELECT id FROM requirements WHERE project_id = :projectId";
  private static final String SESSIONS =
      "SELECT id FROM test_sessions WHERE project_id = :projectId";
  private static final String JUNIT_RESULTS =
      "SELECT id FROM junit_test_results WHERE project_id = :projectId";
  private static final String JUNIT_SUITES =
      "SELECT id FROM junit_test_suites WHERE junit_test_result_id IN (" + JUNIT_RESULTS + ")";
  private static final String JUNIT_CASES =
      "SELECT id FROM junit_test_cases WHERE junit_test_suite_id IN (" + JUNIT_SUITES + ")";
  private static final String RAG_THREADS =
      "SELECT id FROM rag_chat_threads WHERE project_id = :projectId";

  /** 실행 순서가 곧 삭제 순서다. 참조하는 쪽이 참조되는 쪽보다 앞에 와야 한다. */
  static final List<Step> NATIVE_STEPS =
      List.of(
          // RAG
          step("rag_chat_thread_categories", "thread_id IN (" + RAG_THREADS + ")"),
          step("rag_chat_messages", "thread_id IN (" + RAG_THREADS + ")"),
          step("rag_chat_threads", "project_id = :projectId"),
          step("rag_chat_categories", "project_id = :projectId"),
          // 테스트 결과
          step("test_result_tags", "test_result_id IN (" + RESULTS + ")"),
          step("test_result_steps", "test_result_id IN (" + RESULTS + ")"),
          step("test_result_attachments", "test_result_id IN (" + RESULTS + ")"),
          step("test_result_edits", "original_test_result_id IN (" + RESULTS + ")"),
          step("test_results", "test_execution_id IN (" + EXECUTIONS + ")"),
          step("test_execution_tags", "test_execution_id IN (" + EXECUTIONS + ")"),
          // JUnit 자동화 결과
          step("junit_case_attachments", "junit_test_case_id IN (" + JUNIT_CASES + ")"),
          step("junit_test_cases", "junit_test_suite_id IN (" + JUNIT_SUITES + ")"),
          step("junit_test_suites", "junit_test_result_id IN (" + JUNIT_RESULTS + ")"),
          step("junit_test_results", "project_id = :projectId"),
          // 요구사항. 연결은 이 프로젝트 케이스를 가리키는 것까지 지운다.
          step(
              "requirement_relations",
              "source_id IN (" + REQUIREMENTS + ") OR target_id IN (" + REQUIREMENTS + ")"),
          step(
              "requirement_test_case_links",
              "requirement_id IN (" + REQUIREMENTS + ") OR test_case_id IN (" + CASES + ")"),
          step("requirements", "project_id = :projectId"),
          step("requirement_specs", "project_id = :projectId"),
          // 탐색적 테스트 세션·차터
          step("test_session_approvals", "session_id IN (" + SESSIONS + ")"),
          step("test_session_attachments", "session_id IN (" + SESSIONS + ")"),
          step("test_session_interruptions", "session_id IN (" + SESSIONS + ")"),
          step("test_session_area_tags", "session_id IN (" + SESSIONS + ")"),
          step("test_session_strategy_tags", "session_id IN (" + SESSIONS + ")"),
          step("test_session_notes", "session_id IN (" + SESSIONS + ")"),
          step("test_session_tests", "session_id IN (" + SESSIONS + ")"),
          step("test_session_bugs", "session_id IN (" + SESSIONS + ")"),
          step("test_sessions", "project_id = :projectId"),
          step("test_charters", "project_id = :projectId"),
          // 북마크. 다른 프로젝트 모음에 담긴 이 프로젝트 케이스도 지운다.
          step(
              "bookmark_items",
              "collection_id IN (SELECT id FROM bookmark_collections WHERE project_id = :projectId)"
                  + " OR testcase_id IN ("
                  + CASES
                  + ")"),
          step("bookmark_collections", "project_id = :projectId"),
          // 그룹
          step(
              "group_members", "group_id IN (SELECT id FROM groups WHERE project_id = :projectId)"),
          step("groups", "project_id = :projectId"),
          // 테스트케이스에 딸린 엔티티. 케이스 자체는 JPQL 로 지워 요소 컬렉션까지 정리한다.
          step("test_case_attachments", "test_case_id IN (" + CASES + ")"),
          step("display_id_history", "test_case_id IN (" + CASES + ")"),
          step("testcase_versions", "project_id = :projectId"),
          step("tc_move_audit_log", "project_id = :projectId"),
          // 에이전트 연결
          step("agent_connections", "project_id = :projectId"));

  @PersistenceContext private EntityManager entityManager;

  private final TestExecutionRepository testExecutionRepository;
  private final TestPlanRepository testPlanRepository;
  private final TestCaseRepository testCaseRepository;

  public ProjectDataPurger(
      TestExecutionRepository testExecutionRepository,
      TestPlanRepository testPlanRepository,
      TestCaseRepository testCaseRepository) {
    this.testExecutionRepository = testExecutionRepository;
    this.testPlanRepository = testPlanRepository;
    this.testCaseRepository = testCaseRepository;
  }

  /**
   * 프로젝트에 딸린 데이터를 지운다. 프로젝트 행과 멤버 관계는 호출하는 쪽이 지운다.
   *
   * @return 테이블별 삭제 건수 (삭제 순서대로)
   */
  @Transactional
  public Map<String, Integer> purge(String projectId) {
    Map<String, Integer> deleted = new LinkedHashMap<>();
    for (Step s : NATIVE_STEPS) {
      int n =
          entityManager
              .createNativeQuery("DELETE FROM " + s.table() + " WHERE " + s.where())
              .setParameter("projectId", projectId)
              .executeUpdate();
      deleted.put(s.table(), n);
    }

    // JPQL 일괄 삭제는 요소 컬렉션(test_plan_cases·testcasesteps·testcase_tags 등)을 함께 지운다.
    deleted.put("test_executions", (int) testExecutionRepository.countByProjectId(projectId));
    testExecutionRepository.deleteByProjectId(projectId);
    deleted.put("test_plans", (int) testPlanRepository.countByProjectId(projectId));
    testPlanRepository.deleteByProjectId(projectId);
    deleted.put("testcases", (int) testCaseRepository.countByProjectId(projectId));
    testCaseRepository.deleteByProjectId(projectId);

    log.info("프로젝트 {} 연관 데이터 삭제: {}", projectId, deleted);
    return deleted;
  }

  private static Step step(String table, String where) {
    return new Step(table, where);
  }

  /** 삭제 단계 하나. 테이블 이름과 조건은 이 클래스 안의 상수로만 만들어진다. */
  record Step(String table, String where) {}
}
