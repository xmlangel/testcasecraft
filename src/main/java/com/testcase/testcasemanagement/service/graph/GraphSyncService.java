package com.testcase.testcasemanagement.service.graph;

import static com.testcase.testcasemanagement.service.graph.TestCaseGraphService.quote;

import com.testcase.testcasemanagement.model.JunitTestCase;
import com.testcase.testcasemanagement.model.JunitTestStatus;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.JunitTestCaseRepository;
import com.testcase.testcasemanagement.repository.JunitTestResultRepository;
import com.testcase.testcasemanagement.repository.JunitTestSuiteRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관계 그래프(1-A) 동기화 — 메인 DB 의 케이스·계획·실행·결과·JUnit 실패를 AgensGraph 로 프로젝션한다.
 *
 * <p>모든 쓰기는 MERGE 기반 멱등이라 몇 번을 다시 돌려도 결과가 같다. 관계 그래프는 read-model 이므로 최종 일관성으로 충분하고, 깨지면 이 동기화를 다시
 * 돌려 재구성하면 된다 (계획 §7).
 *
 * <p>트리거: 관리자 수동(POST /api/graph/sync) 이 기본. 스케줄 동기화는 graph.sync.scheduled-enabled 로 별도 opt-in.
 */
@Service
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
public class GraphSyncService {

  private static final Logger logger = LoggerFactory.getLogger(GraphSyncService.class);
  private static final int RECENT_JUNIT_UPLOADS = 20; // 최근 업로드 N건만 오류 클러스터에 반영
  private static final int FAILURE_SIGNATURE_MSG_LEN = 80;

  private final GraphDbClient graphDbClient;
  private final TestCaseRepository testCaseRepository;
  private final TestPlanRepository testPlanRepository;
  private final TestExecutionRepository testExecutionRepository;
  private final TestResultRepository testResultRepository;
  private final JunitTestResultRepository junitTestResultRepository;
  private final JunitTestSuiteRepository junitTestSuiteRepository;
  private final JunitTestCaseRepository junitTestCaseRepository;

  public GraphSyncService(
      GraphDbClient graphDbClient,
      TestCaseRepository testCaseRepository,
      TestPlanRepository testPlanRepository,
      TestExecutionRepository testExecutionRepository,
      TestResultRepository testResultRepository,
      JunitTestResultRepository junitTestResultRepository,
      JunitTestSuiteRepository junitTestSuiteRepository,
      JunitTestCaseRepository junitTestCaseRepository) {
    this.graphDbClient = graphDbClient;
    this.testCaseRepository = testCaseRepository;
    this.testPlanRepository = testPlanRepository;
    this.testExecutionRepository = testExecutionRepository;
    this.testResultRepository = testResultRepository;
    this.junitTestResultRepository = junitTestResultRepository;
    this.junitTestSuiteRepository = junitTestSuiteRepository;
    this.junitTestCaseRepository = junitTestCaseRepository;
  }

  /** 프로젝트 전체를 그래프로 풀 동기화한다. 반환: 라벨별 적재 건수. */
  @Transactional(readOnly = true)
  public Map<String, Integer> syncProject(String projectId) {
    GraphQueryService.validateId(projectId);
    long startedAt = System.currentTimeMillis();

    int cases = syncTestCases(projectId);
    int plans = syncTestPlans(projectId);
    int executions = syncExecutionsAndResults(projectId);
    int junitFailures = syncJunitFailures(projectId);

    logger.info(
        "그래프 동기화 완료 — project={}, cases={}, plans={}, executions(results 포함)={}, junitFailures={},"
            + " {}ms",
        projectId,
        cases,
        plans,
        executions,
        junitFailures,
        System.currentTimeMillis() - startedAt);
    return Map.of(
        "testCases", cases,
        "testPlans", plans,
        "executions", executions,
        "junitFailures", junitFailures);
  }

  // ---------- 라벨별 적재 ----------

  private int syncTestCases(String projectId) {
    List<TestCase> all = testCaseRepository.findAllByProjectIdWithHierarchy(projectId);
    String pid = quote(projectId);

    graphDbClient.execute("MERGE (p:\"Project\" {id: " + pid + "}) SET p.\"projectId\" = " + pid);

    for (TestCase tc : all) {
      boolean isFolder = "folder".equalsIgnoreCase(tc.getType());
      String label = isFolder ? "Folder" : "TestCase";
      String id = quote(tc.getId());
      graphDbClient.execute(
          "MERGE (n:\""
              + label
              + "\" {id: "
              + id
              + "}) SET n.name = "
              + quote(tc.getName())
              + ", n.\"displayId\" = "
              + quote(tc.getDisplayId())
              + ", n.priority = "
              + quote(tc.getPriority())
              + ", n.\"representationMode\" = "
              + quote(tc.getRepresentationMode())
              + ", n.\"projectId\" = "
              + pid);
      if (tc.getParentId() == null || tc.getParentId().isBlank()) {
        graphDbClient.execute(
            "MATCH (p:\"Project\" {id: "
                + pid
                + "}), (n:\""
                + label
                + "\" {id: "
                + id
                + "}) MERGE (p)-[:\"CONTAINS\"]->(n)");
      } else {
        graphDbClient.execute(
            "MATCH (f:\"Folder\" {id: "
                + quote(tc.getParentId())
                + "}), (n:\""
                + label
                + "\" {id: "
                + id
                + "}) MERGE (f)-[:\"PARENT_OF\"]->(n)");
      }
    }
    return all.size();
  }

  private int syncTestPlans(String projectId) {
    List<TestPlan> plans = testPlanRepository.findByProjectId(projectId);
    String pid = quote(projectId);
    for (TestPlan plan : plans) {
      String planId = quote(plan.getId());
      graphDbClient.execute(
          "MERGE (tp:\"TestPlan\" {id: "
              + planId
              + "}) SET tp.name = "
              + quote(plan.getName())
              + ", tp.\"projectId\" = "
              + pid);
      graphDbClient.execute(
          "MATCH (p:\"Project\" {id: "
              + pid
              + "}), (tp:\"TestPlan\" {id: "
              + planId
              + "}) MERGE (p)-[:\"HAS_PLAN\"]->(tp)");
      if (plan.getTestCaseIds() != null) {
        for (String caseId : plan.getTestCaseIds()) {
          graphDbClient.execute(
              "MATCH (tp:\"TestPlan\" {id: "
                  + planId
                  + "}), (tc:\"TestCase\" {id: "
                  + quote(caseId)
                  + "}) MERGE (tp)-[:\"INCLUDES\"]->(tc)");
        }
      }
    }
    return plans.size();
  }

  private int syncExecutionsAndResults(String projectId) {
    List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
    String pid = quote(projectId);
    for (TestExecution execution : executions) {
      String exId = quote(execution.getId());
      graphDbClient.execute(
          "MERGE (te:\"TestExecution\" {id: "
              + exId
              + "}) SET te.name = "
              + quote(execution.getName())
              + ", te.status = "
              + quote(execution.getStatus())
              + ", te.\"projectId\" = "
              + pid);
      if (execution.getTestPlanId() != null) {
        graphDbClient.execute(
            "MATCH (te:\"TestExecution\" {id: "
                + exId
                + "}), (tp:\"TestPlan\" {id: "
                + quote(execution.getTestPlanId())
                + "}) MERGE (te)-[:\"FROM_PLAN\"]->(tp)");
      }
      if (execution.getResults() == null) {
        continue;
      }
      for (TestResult result : execution.getResults()) {
        String resultId = quote(result.getId());
        graphDbClient.execute(
            "MERGE (r:\"TestResult\" {id: "
                + resultId
                + "}) SET r.result = "
                + quote(result.getResult())
                + ", r.\"projectId\" = "
                + pid);
        graphDbClient.execute(
            "MATCH (r:\"TestResult\" {id: "
                + resultId
                + "}), (te:\"TestExecution\" {id: "
                + exId
                + "}) MERGE (r)-[:\"IN_EXECUTION\"]->(te)");
        if (result.getTestCaseId() != null) {
          graphDbClient.execute(
              "MATCH (r:\"TestResult\" {id: "
                  + resultId
                  + "}), (tc:\"TestCase\" {id: "
                  + quote(result.getTestCaseId())
                  + "}) MERGE (r)-[:\"OF_CASE\"]->(tc)");
        }
        if (result.getJiraIssueKey() != null && !result.getJiraIssueKey().isBlank()) {
          String jiraKey = quote(result.getJiraIssueKey());
          graphDbClient.execute(
              "MERGE (j:\"JiraIssue\" {id: "
                  + jiraKey
                  + "}) SET j.key = "
                  + jiraKey
                  + ", j.\"projectId\" = "
                  + pid);
          graphDbClient.execute(
              "MATCH (r:\"TestResult\" {id: "
                  + resultId
                  + "}), (j:\"JiraIssue\" {id: "
                  + jiraKey
                  + "}) MERGE (r)-[:\"LINKED_TO\"]->(j)");
        }
      }
    }
    return executions.size();
  }

  /** 최근 JUnit 업로드의 실패 케이스를 FailureType 허브로 묶는다 — 오류 클러스터 화면의 원천. */
  private int syncJunitFailures(String projectId) {
    var recentUploads =
        junitTestResultRepository.findByProjectIdOrderByUploadedAtDesc(
            projectId, PageRequest.of(0, RECENT_JUNIT_UPLOADS));
    String pid = quote(projectId);
    int count = 0;
    for (var upload : recentUploads.getContent()) {
      for (var suite :
          junitTestSuiteRepository.findByJunitTestResult_IdOrderByName(upload.getId())) {
        for (JunitTestStatus status : List.of(JunitTestStatus.FAILED, JunitTestStatus.ERROR)) {
          for (JunitTestCase failed :
              junitTestCaseRepository.findByJunitTestSuite_IdAndStatus(suite.getId(), status)) {
            String jcId = quote(failed.getId());
            String signature = quote(failureSignature(failed));
            graphDbClient.execute(
                "MERGE (jc:\"JunitCase\" {id: "
                    + jcId
                    + "}) SET jc.name = "
                    + quote(failed.getName())
                    + ", jc.\"className\" = "
                    + quote(failed.getClassName())
                    + ", jc.status = "
                    + quote(failed.getStatus().name())
                    + ", jc.\"projectId\" = "
                    + pid);
            graphDbClient.execute(
                "MERGE (ft:\"FailureType\" {signature: "
                    + signature
                    + "}) SET ft.message = "
                    + quote(firstLine(failed.getFailureMessage()))
                    + ", ft.\"projectId\" = "
                    + pid);
            graphDbClient.execute(
                "MATCH (jc:\"JunitCase\" {id: "
                    + jcId
                    + "}), (ft:\"FailureType\" {signature: "
                    + signature
                    + "}) MERGE (jc)-[:\"FAILED_WITH\"]->(ft)");
            count++;
          }
        }
      }
    }
    return count;
  }

  /** 실패 시그니처 — failureType + 메시지 첫 줄 앞부분. 같은 근본원인이 하나의 허브로 모이게 한다. */
  static String failureSignature(JunitTestCase failed) {
    String type = failed.getFailureType() != null ? failed.getFailureType() : "UNKNOWN";
    String message = firstLine(failed.getFailureMessage());
    if (message.length() > FAILURE_SIGNATURE_MSG_LEN) {
      message = message.substring(0, FAILURE_SIGNATURE_MSG_LEN);
    }
    return type + "::" + message;
  }

  private static String firstLine(String text) {
    if (text == null || text.isBlank()) {
      return "";
    }
    int newline = text.indexOf('\n');
    return (newline >= 0 ? text.substring(0, newline) : text).trim();
  }
}
