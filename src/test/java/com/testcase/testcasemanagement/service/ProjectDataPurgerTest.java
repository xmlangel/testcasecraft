package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.sql.Timestamp;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.transaction.annotation.Transactional;
import org.testng.annotations.Test;

/**
 * 프로젝트 강제 삭제 회귀 테스트.
 *
 * <p>요구사항·탐색 세션·북마크·그룹·케이스 첨부·결과 수정 이력이 있는 프로젝트를 강제 삭제하면 외래 키 위반(409)으로 실패하던 결함을 막는다. 삭제 대상이 native
 * SQL 의 테이블 이름 목록이라 실제 Postgres 로만 검증할 수 있다.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import(ProjectDataPurger.class)
@Transactional
public class ProjectDataPurgerTest extends AbstractTestNGSpringContextTests {

  /** JPQL 일괄 삭제가 지우는 테이블. 루트 엔티티와 그 요소 컬렉션이다. */
  private static final Set<String> DELETED_BY_JPQL =
      Set.of(
          "test_executions",
          "test_plans",
          "test_plan_cases",
          "testcases",
          "testcasesteps",
          "testcase_tags",
          "testcase_linked_documents",
          "testcase_linked_junit_cases",
          "testcase_linked_test_cases");

  /** 호출하는 쪽(ProjectService)이 지우는 테이블. */
  private static final Set<String> DELETED_BY_CALLER = Set.of("projects", "project_users");

  private static final Pattern FIRST_CHECK_LITERAL = Pattern.compile("'([^']*)'");

  @Autowired private JdbcTemplate jdbc;
  @Autowired private TestEntityManager entityManager;
  @Autowired private ProjectDataPurger purger;

  private String userId;

  /** projects 에 외래 키로 이어진 테이블이 모두 삭제 목록에 있어야 한다. 새 테이블을 목록에 넣지 않으면 여기서 실패한다. */
  @Test
  public void everyTableReferencingProjectIsPurged() {
    Map<String, Set<String>> referencedBy = new HashMap<>();
    jdbc.query(
        "SELECT tc.table_name AS child, ccu.table_name AS parent"
            + " FROM information_schema.table_constraints tc"
            + " JOIN information_schema.constraint_column_usage ccu"
            + "   ON tc.constraint_name = ccu.constraint_name"
            + " WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'",
        rs -> {
          referencedBy
              .computeIfAbsent(rs.getString("parent"), k -> new HashSet<>())
              .add(rs.getString("child"));
        });

    Set<String> reachable = new TreeSet<>();
    Deque<String> queue = new ArrayDeque<>(List.of("projects"));
    while (!queue.isEmpty()) {
      for (String child : referencedBy.getOrDefault(queue.poll(), Set.of())) {
        if (reachable.add(child)) {
          queue.add(child);
        }
      }
    }

    Set<String> purged =
        ProjectDataPurger.NATIVE_STEPS.stream()
            .map(ProjectDataPurger.Step::table)
            .collect(Collectors.toSet());
    purged.addAll(DELETED_BY_JPQL);
    purged.addAll(DELETED_BY_CALLER);

    Set<String> missing = new TreeSet<>(reachable);
    missing.removeAll(purged);
    assertTrue(missing.isEmpty(), "프로젝트 강제 삭제가 지우지 않는 테이블: " + missing);
  }

  /** 각 기능의 데이터를 하나씩 넣은 프로젝트를 지우면 외래 키 위반 없이 지워지고, 프로젝트에 딸린 행이 남지 않는다. */
  @Test
  public void purgeThenDeleteProjectLeavesNoRows() {
    String user = insert("users", Map.of("username", "purge-" + System.nanoTime()));
    userId = user;
    String project = insert("projects", Map.of("code", "PURGE-" + System.nanoTime()));
    String other = insert("projects", Map.of("code", "KEEP-" + System.nanoTime()));
    Map<String, Object> p = Map.of("project_id", project);

    insert("project_users", Map.of("project_id", project, "user_id", user));
    String tc = insert("testcases", p);
    String otherTc = insert("testcases", Map.of("project_id", other));
    insert("testcasesteps", Map.of("testcase_id", tc));
    insert("test_case_attachments", Map.of("test_case_id", tc));
    insert("display_id_history", Map.of("test_case_id", tc));
    insert("testcase_versions", Map.of("project_id", project, "testcase_id", tc));
    insert("tc_move_audit_log", Map.of("project_id", project, "testcase_id", tc));

    String plan = insert("test_plans", p);
    insert("test_plan_cases", Map.of("test_plan_id", plan, "test_case_id", tc));
    String exec = insert("test_executions", Map.of("project_id", project, "test_plan_id", plan));
    insert("test_execution_tags", Map.of("test_execution_id", exec));
    String result = insert("test_results", Map.of("test_execution_id", exec, "test_case_id", tc));
    insert("test_result_tags", Map.of("test_result_id", result));
    insert("test_result_steps", Map.of("test_result_id", result));
    insert("test_result_attachments", Map.of("test_result_id", result));
    insert("test_result_edits", Map.of("original_test_result_id", result));

    String junit = insert("junit_test_results", p);
    String suite = insert("junit_test_suites", Map.of("junit_test_result_id", junit));
    String jcase = insert("junit_test_cases", Map.of("junit_test_suite_id", suite));
    insert("junit_case_attachments", Map.of("junit_test_case_id", jcase));

    String spec = insert("requirement_specs", p);
    String req1 = insert("requirements", Map.of("project_id", project, "spec_id", spec));
    String req2 = insert("requirements", Map.of("project_id", project, "spec_id", spec));
    insert("requirement_relations", Map.of("source_id", req1, "target_id", req2));
    insert("requirement_test_case_links", Map.of("requirement_id", req1, "test_case_id", tc));

    String charter = insert("test_charters", p);
    String session = insert("test_sessions", Map.of("project_id", project, "charter_id", charter));
    for (String t :
        List.of(
            "test_session_approvals",
            "test_session_attachments",
            "test_session_interruptions",
            "test_session_area_tags",
            "test_session_strategy_tags",
            "test_session_notes",
            "test_session_tests",
            "test_session_bugs")) {
      insert(t, Map.of("session_id", session));
    }

    String collection = insert("bookmark_collections", p);
    insert("bookmark_items", Map.of("collection_id", collection, "testcase_id", tc));
    String otherCollection = insert("bookmark_collections", Map.of("project_id", other));
    insert("bookmark_items", Map.of("collection_id", otherCollection, "testcase_id", tc));
    insert("bookmark_items", Map.of("collection_id", otherCollection, "testcase_id", otherTc));

    String group = insert("groups", p);
    insert("group_members", Map.of("group_id", group, "user_id", user));

    String category = insert("rag_chat_categories", p);
    String thread = insert("rag_chat_threads", p);
    insert("rag_chat_messages", Map.of("thread_id", thread));
    insert("rag_chat_thread_categories", Map.of("thread_id", thread, "category_id", category));
    insert("agent_connections", p);

    purger.purge(project);
    jdbc.update("DELETE FROM project_users WHERE project_id = ?", project);
    jdbc.update("DELETE FROM projects WHERE id = ?", project);
    entityManager.flush();

    assertEquals(count("projects", "id", project), 0);
    for (String t :
        List.of(
            "testcases",
            "test_plans",
            "test_executions",
            "junit_test_results",
            "requirement_specs",
            "requirements",
            "test_charters",
            "test_sessions",
            "bookmark_collections",
            "groups",
            "rag_chat_categories",
            "rag_chat_threads",
            "agent_connections",
            "testcase_versions",
            "tc_move_audit_log")) {
      assertEquals(count(t, "project_id", project), 0, t + " 에 행이 남았습니다");
    }
    assertEquals(count("requirement_relations", "source_id", req1), 0);
    assertEquals(count("requirement_test_case_links", "test_case_id", tc), 0);
    assertEquals(count("junit_test_suites", "junit_test_result_id", junit), 0);
    assertEquals(count("test_result_edits", "original_test_result_id", result), 0);
    assertEquals(count("bookmark_items", "testcase_id", tc), 0, "다른 프로젝트 모음에 담긴 케이스도 지워야 합니다");

    // 다른 프로젝트의 데이터는 그대로 남는다.
    assertEquals(count("projects", "id", other), 1);
    assertEquals(count("testcases", "id", otherTc), 1);
    assertEquals(count("bookmark_items", "testcase_id", otherTc), 1);
  }

  private int count(String table, String column, String value) {
    Integer n =
        jdbc.queryForObject(
            "SELECT count(*) FROM " + table + " WHERE " + column + " = ?", Integer.class, value);
    return n == null ? 0 : n;
  }

  /**
   * 한 행을 넣고 id 를 돌려준다. 지정하지 않은 NOT NULL 컬럼은 타입에 맞는 값으로 채운다. 각 테이블의 필수 컬럼을 테스트에 적어 두면 엔티티가 바뀔 때마다
   * 테스트가 깨지므로, 스키마를 읽어 채운다.
   */
  private String insert(String table, Map<String, Object> overrides) {
    Map<String, Object> row = new LinkedHashMap<>(overrides);
    String id = UUID.randomUUID().toString();
    List<Map<String, Object>> columns =
        jdbc.queryForList(
            "SELECT column_name, data_type, is_nullable, column_default, character_maximum_length"
                + " FROM information_schema.columns"
                + " WHERE table_schema = 'public' AND table_name = ?",
            table);
    assertTrue(!columns.isEmpty(), "테이블이 없습니다: " + table);
    boolean hasId = false;
    for (Map<String, Object> c : columns) {
      String name = (String) c.get("column_name");
      if ("id".equals(name)) {
        hasId = true;
        if (c.get("column_default") == null) {
          row.putIfAbsent("id", id);
        }
        continue;
      }
      if (row.containsKey(name)
          || !"NO".equals(c.get("is_nullable"))
          || c.get("column_default") != null) {
        continue;
      }
      row.put(
          name,
          filler(
              table,
              name,
              (String) c.get("data_type"),
              (Number) c.get("character_maximum_length")));
    }

    String cols = String.join(", ", row.keySet());
    String marks = row.keySet().stream().map(k -> "?").collect(Collectors.joining(", "));
    if (hasId && !row.containsKey("id")) {
      return String.valueOf(
          jdbc.queryForObject(
              "INSERT INTO " + table + " (" + cols + ") VALUES (" + marks + ") RETURNING id",
              Object.class,
              row.values().toArray()));
    }
    jdbc.update(
        "INSERT INTO " + table + " (" + cols + ") VALUES (" + marks + ")", row.values().toArray());
    return (String) row.get("id");
  }

  private Object filler(String table, String column, String dataType, Number maxLength) {
    String target = foreignKeyTarget(table, column);
    if ("users".equals(target)) {
      return userId;
    }
    if (target != null) {
      throw new AssertionError(table + "." + column + " 는 " + target + " 를 가리키므로 값을 지정해야 합니다");
    }
    String allowed = firstAllowedValue(table, column);
    if (allowed != null) {
      return allowed;
    }
    return switch (dataType) {
      case "boolean" -> false;
      case "integer", "smallint", "bigint", "numeric", "double precision", "real" -> 0;
      case "timestamp without time zone", "timestamp with time zone", "date" -> new Timestamp(
          System.currentTimeMillis());
      default -> {
        String v = column + "-" + UUID.randomUUID().toString().substring(0, 8);
        yield maxLength == null ? v : v.substring(0, Math.min(v.length(), maxLength.intValue()));
      }
    };
  }

  private String foreignKeyTarget(String table, String column) {
    List<String> targets =
        jdbc.queryForList(
            "SELECT ccu.table_name FROM information_schema.table_constraints tc"
                + " JOIN information_schema.key_column_usage kcu"
                + "   ON tc.constraint_name = kcu.constraint_name"
                + " JOIN information_schema.constraint_column_usage ccu"
                + "   ON tc.constraint_name = ccu.constraint_name"
                + " WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = ?"
                + "   AND kcu.column_name = ?",
            String.class,
            table,
            column);
    return targets.isEmpty() ? null : targets.get(0);
  }

  /** enum 컬럼에 Hibernate 가 건 CHECK 제약이 있으면 허용값 중 첫 값을 쓴다. */
  private String firstAllowedValue(String table, String column) {
    List<String> defs =
        jdbc.queryForList(
            "SELECT pg_get_constraintdef(c.oid) FROM pg_constraint c"
                + " JOIN pg_class t ON t.oid = c.conrelid"
                + " WHERE c.contype = 'c' AND t.relname = ?",
            String.class,
            table);
    for (String def : defs) {
      if (def.contains("(" + column + ")") || def.contains("((" + column + ")")) {
        Matcher m = FIRST_CHECK_LITERAL.matcher(def);
        if (m.find()) {
          return m.group(1);
        }
      }
    }
    return null;
  }
}
