package com.testcase.testcasemanagement.service.graph;

import static com.testcase.testcasemanagement.service.graph.GraphDbClient.quote;

import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseVersion;
import com.testcase.testcasemanagement.model.TestCharter;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestSession;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestCaseVersionRepository;
import com.testcase.testcasemanagement.repository.TestCharterRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestSessionRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 온톨로지 인스턴스 그래프 동기화 — 메인 DB 의 프로젝트 데이터를 코어 온톨로지(testcasecraft.rdf)의 노드 11종 · 간선 15종으로 AgensGraph 에
 * 프로젝션한다. 노드는 실제 개별 인스턴스(케이스·실행·결과…)이며 레이블은 온톨로지 타입, 간선 이름은 온톨로지 관계명이다.
 *
 * <p>모든 쓰기는 MERGE 멱등. 재동기화 시 프로젝트 서브그래프(projectId 태깅된 정점)를 먼저 DETACH DELETE 해 삭제된 엔티티가 남지 않도록 재구성한다
 * — 관계 그래프는 read-model 이라 최종 일관성으로 충분하다.
 *
 * <p>트리거: 관리자 수동(POST /api/graph/sync) 기본. 스케줄은 graph.sync.scheduled-enabled 로 opt-in.
 */
@Service
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
public class GraphSyncService {

  private static final Logger logger = LoggerFactory.getLogger(GraphSyncService.class);

  private final GraphDbClient graphDbClient;
  private final ProjectRepository projectRepository;
  private final TestCaseRepository testCaseRepository;
  private final TestCaseVersionRepository testCaseVersionRepository;
  private final TestPlanRepository testPlanRepository;
  private final TestExecutionRepository testExecutionRepository;
  private final TestCharterRepository testCharterRepository;
  private final TestSessionRepository testSessionRepository;

  public GraphSyncService(
      GraphDbClient graphDbClient,
      ProjectRepository projectRepository,
      TestCaseRepository testCaseRepository,
      TestCaseVersionRepository testCaseVersionRepository,
      TestPlanRepository testPlanRepository,
      TestExecutionRepository testExecutionRepository,
      TestCharterRepository testCharterRepository,
      TestSessionRepository testSessionRepository) {
    this.graphDbClient = graphDbClient;
    this.projectRepository = projectRepository;
    this.testCaseRepository = testCaseRepository;
    this.testCaseVersionRepository = testCaseVersionRepository;
    this.testPlanRepository = testPlanRepository;
    this.testExecutionRepository = testExecutionRepository;
    this.testCharterRepository = testCharterRepository;
    this.testSessionRepository = testSessionRepository;
  }

  /** 프로젝트 전체를 온톨로지 인스턴스 그래프로 풀 동기화한다. 반환: 노드 타입별 적재 건수. */
  @Transactional(readOnly = true)
  public Map<String, Integer> syncProject(String projectId) {
    GraphQueryService.validateId(projectId);
    long startedAt = System.currentTimeMillis();
    String pid = quote(projectId);

    Project project =
        projectRepository
            .findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId));

    // 스테일 정리 — 이 프로젝트의 기존 서브그래프 제거 후 재구성 (삭제된 엔티티 잔존 방지)
    graphDbClient.execute("MATCH (n) WHERE n.\"projectId\" = " + pid + " DETACH DELETE n");

    Map<String, Integer> counts = new LinkedHashMap<>();
    counts.put("organizations", syncProjectAndOrg(project, pid));
    counts.put("testCases", syncTestCases(projectId, pid));
    counts.put("testCaseVersions", syncVersions(projectId, pid));
    counts.put("testPlans", syncPlans(projectId, pid));
    counts.put("testExecutions", syncExecutions(projectId, pid));
    counts.put("testCharters", syncCharters(projectId, pid));
    counts.put("testSessions", syncSessions(projectId, pid));

    logger.info(
        "온톨로지 그래프 동기화 완료 — project={}, {}, {}ms",
        projectId,
        counts,
        System.currentTimeMillis() - startedAt);
    return counts;
  }

  // ---------- 노드 타입별 적재 ----------

  /** Project 노드 + Organization(contains). */
  private int syncProjectAndOrg(Project project, String pid) {
    graphDbClient.execute(
        "MERGE (p:\"Project\" {id: "
            + pid
            + "}) SET p.name = "
            + q(project.getName())
            + ", p.code = "
            + q(project.getCode())
            + ", p.description = "
            + q(project.getDescription())
            + ", p.\"projectId\" = "
            + pid);

    Organization org = project.getOrganization();
    if (org == null) {
      return 0;
    }
    String orgId = quote(org.getId());
    graphDbClient.execute(
        "MERGE (o:\"Organization\" {id: "
            + orgId
            + "}) SET o.name = "
            + q(org.getName())
            + ", o.\"projectId\" = "
            + pid);
    graphDbClient.execute(
        "MATCH (o:\"Organization\" {id: "
            + orgId
            + "}), (p:\"Project\" {id: "
            + pid
            + "}) MERGE (o)-[:\"contains\"]->(p)");
    return 1;
  }

  /** TestCase 인스턴스 + has(루트)/parentOf(트리) + TestStep(hasStep). */
  private int syncTestCases(String projectId, String pid) {
    List<TestCase> all = testCaseRepository.findAllByProjectIdWithHierarchy(projectId);
    for (TestCase tc : all) {
      String id = quote(tc.getId());
      graphDbClient.execute(
          "MERGE (tc:\"TestCase\" {id: "
              + id
              + "}) SET tc.name = "
              + q(tc.getName())
              + ", tc.type = "
              + q(tc.getType())
              + ", tc.priority = "
              + q(tc.getPriority())
              + ", tc.\"displayId\" = "
              + q(tc.getDisplayId())
              + ", tc.\"projectId\" = "
              + pid);

      if (tc.getParentId() == null || tc.getParentId().isBlank()) {
        graphDbClient.execute(
            "MATCH (p:\"Project\" {id: "
                + pid
                + "}), (tc:\"TestCase\" {id: "
                + id
                + "}) MERGE (p)-[:\"has\"]->(tc)");
      } else {
        graphDbClient.execute(
            "MATCH (pa:\"TestCase\" {id: "
                + quote(tc.getParentId())
                + "}), (tc:\"TestCase\" {id: "
                + id
                + "}) MERGE (pa)-[:\"parentOf\"]->(tc)");
      }

      List<TestStep> steps = tc.getSteps();
      if (steps != null) {
        for (TestStep step : steps) {
          String stepId = quote(tc.getId() + "-s" + step.getStepNumber());
          graphDbClient.execute(
              "MERGE (s:\"TestStep\" {id: "
                  + stepId
                  + "}) SET s.\"stepNumber\" = "
                  + step.getStepNumber()
                  + ", s.description = "
                  + q(step.getDescription())
                  + ", s.\"expectedResult\" = "
                  + q(step.getExpectedResult())
                  + ", s.\"projectId\" = "
                  + pid);
          graphDbClient.execute(
              "MATCH (tc:\"TestCase\" {id: "
                  + id
                  + "}), (s:\"TestStep\" {id: "
                  + stepId
                  + "}) MERGE (tc)-[:\"hasStep\"]->(s)");
        }
      }
    }
    return all.size();
  }

  /** TestCaseVersion 인스턴스 + hasVersion. */
  private int syncVersions(String projectId, String pid) {
    List<TestCaseVersion> versions =
        testCaseVersionRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    for (TestCaseVersion v : versions) {
      String vid = quote(v.getId());
      graphDbClient.execute(
          "MERGE (v:\"TestCaseVersion\" {id: "
              + vid
              + "}) SET v.\"versionNumber\" = "
              + (v.getVersionNumber() != null ? v.getVersionNumber() : 0)
              + ", v.\"versionLabel\" = "
              + q(v.getVersionLabel())
              + ", v.\"isCurrentVersion\" = "
              + (Boolean.TRUE.equals(v.getIsCurrentVersion()))
              + ", v.\"projectId\" = "
              + pid);
      if (v.getTestCaseId() != null) {
        graphDbClient.execute(
            "MATCH (tc:\"TestCase\" {id: "
                + quote(v.getTestCaseId())
                + "}), (v:\"TestCaseVersion\" {id: "
                + vid
                + "}) MERGE (tc)-[:\"hasVersion\"]->(v)");
      }
    }
    return versions.size();
  }

  /** TestPlan 인스턴스 + hasPlan + references. */
  private int syncPlans(String projectId, String pid) {
    List<TestPlan> plans = testPlanRepository.findByProjectId(projectId);
    for (TestPlan plan : plans) {
      String planId = quote(plan.getId());
      graphDbClient.execute(
          "MERGE (tp:\"TestPlan\" {id: "
              + planId
              + "}) SET tp.name = "
              + q(plan.getName())
              + ", tp.\"projectId\" = "
              + pid);
      graphDbClient.execute(
          "MATCH (p:\"Project\" {id: "
              + pid
              + "}), (tp:\"TestPlan\" {id: "
              + planId
              + "}) MERGE (p)-[:\"hasPlan\"]->(tp)");
      if (plan.getTestCaseIds() != null) {
        for (String caseId : plan.getTestCaseIds()) {
          graphDbClient.execute(
              "MATCH (tp:\"TestPlan\" {id: "
                  + planId
                  + "}), (tc:\"TestCase\" {id: "
                  + quote(caseId)
                  + "}) MERGE (tp)-[:\"references\"]->(tc)");
        }
      }
    }
    return plans.size();
  }

  /** TestExecution + hasExecution + basedOn, TestResult(produces) + targets + executedBy(User). */
  private int syncExecutions(String projectId, String pid) {
    List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
    for (TestExecution ex : executions) {
      String exId = quote(ex.getId());
      graphDbClient.execute(
          "MERGE (te:\"TestExecution\" {id: "
              + exId
              + "}) SET te.name = "
              + q(ex.getName())
              + ", te.status = "
              + q(ex.getStatus())
              + ", te.\"projectId\" = "
              + pid);
      graphDbClient.execute(
          "MATCH (p:\"Project\" {id: "
              + pid
              + "}), (te:\"TestExecution\" {id: "
              + exId
              + "}) MERGE (p)-[:\"hasExecution\"]->(te)");
      if (ex.getTestPlanId() != null) {
        graphDbClient.execute(
            "MATCH (te:\"TestExecution\" {id: "
                + exId
                + "}), (tp:\"TestPlan\" {id: "
                + quote(ex.getTestPlanId())
                + "}) MERGE (te)-[:\"basedOn\"]->(tp)");
      }
      if (ex.getResults() == null) {
        continue;
      }
      for (TestResult r : ex.getResults()) {
        String rid = quote(r.getId());
        graphDbClient.execute(
            "MERGE (r:\"TestResult\" {id: "
                + rid
                + "}) SET r.result = "
                + q(r.getResult())
                + ", r.\"projectId\" = "
                + pid);
        graphDbClient.execute(
            "MATCH (te:\"TestExecution\" {id: "
                + exId
                + "}), (r:\"TestResult\" {id: "
                + rid
                + "}) MERGE (te)-[:\"produces\"]->(r)");
        if (r.getTestCaseId() != null) {
          graphDbClient.execute(
              "MATCH (r:\"TestResult\" {id: "
                  + rid
                  + "}), (tc:\"TestCase\" {id: "
                  + quote(r.getTestCaseId())
                  + "}) MERGE (r)-[:\"targets\"]->(tc)");
        }
        User u = r.getExecutedBy();
        if (u != null && u.getId() != null) {
          String uid = quote(u.getId());
          graphDbClient.execute(
              "MERGE (u:\"User\" {id: "
                  + uid
                  + "}) SET u.name = "
                  + q(u.getName() != null ? u.getName() : u.getUsername())
                  + ", u.\"projectId\" = "
                  + pid);
          graphDbClient.execute(
              "MATCH (r:\"TestResult\" {id: "
                  + rid
                  + "}), (u:\"User\" {id: "
                  + uid
                  + "}) MERGE (r)-[:\"executedBy\"]->(u)");
        }
      }
    }
    return executions.size();
  }

  /** TestCharter 인스턴스 + hasCharter. */
  private int syncCharters(String projectId, String pid) {
    List<TestCharter> charters =
        testCharterRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    for (TestCharter c : charters) {
      String cid = quote(c.getId());
      graphDbClient.execute(
          "MERGE (c:\"TestCharter\" {id: "
              + cid
              + "}) SET c.title = "
              + q(c.getTitle())
              + ", c.mission = "
              + q(c.getMission())
              + ", c.status = "
              + q(c.getStatus())
              + ", c.\"projectId\" = "
              + pid);
      graphDbClient.execute(
          "MATCH (p:\"Project\" {id: "
              + pid
              + "}), (c:\"TestCharter\" {id: "
              + cid
              + "}) MERGE (p)-[:\"hasCharter\"]->(c)");
    }
    return charters.size();
  }

  /** TestSession 인스턴스 + hasSession + runs(→TestCharter). */
  private int syncSessions(String projectId, String pid) {
    List<TestSession> sessions =
        testSessionRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    for (TestSession s : sessions) {
      String sid = quote(s.getId());
      graphDbClient.execute(
          "MERGE (s:\"TestSession\" {id: "
              + sid
              + "}) SET s.title = "
              + q(s.getTitle())
              + ", s.status = "
              + q(s.getStatus())
              + ", s.achievement = "
              + (s.getAchievement() != null ? s.getAchievement() : 0)
              + ", s.\"projectId\" = "
              + pid);
      graphDbClient.execute(
          "MATCH (p:\"Project\" {id: "
              + pid
              + "}), (s:\"TestSession\" {id: "
              + sid
              + "}) MERGE (p)-[:\"hasSession\"]->(s)");
      if (s.getCharter() != null && s.getCharter().getId() != null) {
        graphDbClient.execute(
            "MATCH (s:\"TestSession\" {id: "
                + sid
                + "}), (c:\"TestCharter\" {id: "
                + quote(s.getCharter().getId())
                + "}) MERGE (s)-[:\"runs\"]->(c)");
      }
    }
    return sessions.size();
  }

  /** null 안전 Cypher 리터럴 — 문자열·enum·숫자 모두 문자열 리터럴로. */
  private static String q(Object o) {
    return o == null ? quote(null) : quote(String.valueOf(o));
  }
}
