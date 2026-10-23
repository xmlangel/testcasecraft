package com.testcase.testcasemanagement.security;

import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.testng.annotations.Test;

/**
 * 프로젝트 데이터를 돌려주는 컨트롤러의 조회 엔드포인트가 프로젝트 접근을 검사하는지 소스에서 확인한다(ICT-442).
 *
 * <p>조회 API 다수에 프로젝트 소속 검사가 빠져 있어, 테스터 역할만 있으면 어느 프로젝트의 결과·버전·차터든 조회됐다. 같은 형태가 다시 생기지 않도록
 * "조회 엔드포인트에 projectSecurityService 술어나 관리자 전용 역할이 없으면 실패" 라는 규칙 하나로 대상 컨트롤러 전체를 덮는다. 쓰기 쪽 짝은
 * {@link WriteEndpointAuthorizationTest} 다.
 *
 * <p>예외는 {@link #ALLOWED} 에 사유와 함께 적는다. 사유를 적을 수 없으면 그것은 예외가 아니라 결함이다.
 */
public class ReadEndpointAuthorizationTest {

  private static final Path CONTROLLERS =
      Path.of("src/main/java/com/testcase/testcasemanagement/controller");

  /** 프로젝트 데이터를 조회해 돌려주는 컨트롤러. */
  private static final Set<String> IN_SCOPE =
      Set.of(
          "TestCaseVersionController.java",
          "TestResultReportController.java",
          "TestResultApiController.java",
          "TestResultEditController.java",
          "TestResultAttachmentController.java",
          "DashboardController.java",
          "JunitResultController.java",
          "TestCharterController.java",
          "RagController.java");

  /** GET 이 아니지만 조회인 엔드포인트. 조건이 길어 POST 를 쓴다. */
  private static final Set<String> READ_POSTS =
      Set.of(
          "TestResultReportController.java POST /report",
          "TestResultReportController.java POST /export",
          "TestResultReportController.java POST /detailed-report",
          "TestResultReportController.java POST /export-hierarchical",
          "TestResultApiController.java POST /search",
          "TestResultApiController.java POST /statistics/comprehensive",
          "TestResultApiController.java POST /export",
          "JunitResultController.java POST /projects/batch-summary",
          "RagController.java POST /search/similar",
          "RagController.java POST /search/advanced");

  /** 프로젝트 범위 없이 관리자만 여는 표현. 전체 조회에 쓴다. */
  private static final Set<String> ADMIN_ONLY =
      Set.of("hasRole('ADMIN')", "hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')");

  /** 프로젝트 접근 검사 없이 남겨 둔 조회 엔드포인트. 키는 `파일 VERB 경로`, 값은 왜 남겨 두는지다. */
  private static final Map<String, String> ALLOWED = new LinkedHashMap<>();

  static {
    ALLOWED.put("TestCaseVersionController.java GET /health", "서비스 상태 응답이다. 프로젝트 데이터가 없다");
    ALLOWED.put("TestResultApiController.java GET /health", "서비스 상태 응답이다. 프로젝트 데이터가 없다");
    ALLOWED.put(
        "TestResultReportController.java GET /filter-presets",
        "프리셋 저장소가 아직 없어 빈 목록만 돌려준다(TestResultReportService.getUserFilterPresets)");
    ALLOWED.put(
        "TestResultApiController.java GET /filter/test-plans",
        "서비스 계층에서 검사한다 — TestPlanService.getTestPlansByProject 가 canAccessProject 를 확인한다");
    ALLOWED.put(
        "TestResultApiController.java GET /filter/test-executions",
        "서비스 계층에서 검사한다 — TestExecutionService 의 실행 목록 조회가 canAccessProject 를 확인한다");
    ALLOWED.put(
        "TestResultEditController.java GET /statistics",
        "편집 건수 집계만 돌려준다. 편집 내용은 담지 않는다");
    ALLOWED.put(
        "TestResultEditController.java GET /pending-approvals",
        "승인·적용 엔드포인트와 같은 시스템 역할(ADMIN·MANAGER)로 막는다. 승인 권한이 프로젝트 단위가 아니다");
    ALLOWED.put("TestResultEditController.java GET /my-edits", "본인이 쓴 편집본만 조회한다");
    ALLOWED.put("TestResultEditController.java GET /status-info", "상태 코드 설명 상수다. 프로젝트 데이터가 없다");
    ALLOWED.put(
        "TestResultAttachmentController.java GET /user/my", "본인이 올린 첨부만 조회한다");
    ALLOWED.put(
        "TestResultAttachmentController.java GET /admin/storage-info",
        "스토리지 전체 용량 정보다. 프로젝트 데이터가 없다");
    ALLOWED.put(
        "DashboardController.java GET /open-test-runs/assignee-results",
        "서비스 계층에서 좁힌다 — DashboardService 가 관리자가 아니면 접근 가능한 프로젝트의 결과만 남긴다");
    ALLOWED.put(
        "JunitResultController.java GET /active-processing",
        "업로드 처리 진행률(단계·건수)만 담는다. 결과 내용은 없다. 프로젝트로 좁히는 일은 후속 과제");
    ALLOWED.put("RagController.java GET /global-documents", "모든 프로젝트가 함께 쓰는 공통 문서 목록이다");
  }

  @Test(description = "프로젝트 데이터 조회 엔드포인트는 프로젝트 접근 검사나 관리자 전용 역할로 막혀 있다")
  public void readEndpointsRequireProjectAccess() throws IOException {
    List<String> violations = new ArrayList<>();

    try (var files = Files.list(CONTROLLERS)) {
      for (Path file : files.filter(f -> IN_SCOPE.contains(f.getFileName().toString())).toList()) {
        String name = file.getFileName().toString();
        String src = Files.readString(file, StandardCharsets.UTF_8);
        for (Endpoint endpoint : readEndpoints(name, src)) {
          String key = name + " " + endpoint.describe();
          if (ALLOWED.containsKey(key)) {
            continue;
          }
          String expression = endpoint.authorization();
          if (expression == null) {
            violations.add(key + " → 인가 표현 없음");
            continue;
          }
          if (!expression.contains("@projectSecurityService.")
              && !ADMIN_ONLY.contains(expression)) {
            violations.add(key + " → 프로젝트 접근 검사가 없다: " + expression);
          }
        }
      }
    }

    assertTrue(
        violations.isEmpty(),
        "프로젝트 접근 검사가 빠진 조회 엔드포인트가 있다:\n  " + String.join("\n  ", violations));
  }

  @Test(description = "예외 목록의 모든 항목에 사유가 붙어 있다")
  public void allowlistEntriesCarryAReason() {
    List<String> missing =
        ALLOWED.entrySet().stream()
            .filter(entry -> entry.getValue() == null || entry.getValue().isBlank())
            .map(Map.Entry::getKey)
            .toList();
    assertTrue(missing.isEmpty(), "사유 없는 예외: " + missing);
  }

  // ── 소스 파싱 ────────────────────────────────────────────────────────────
  // WriteEndpointAuthorizationTest 와 같은 방식이다. 매핑이 붙은 메서드의 어노테이션 구간
  // ("앞 메서드 선언 ~ 이 메서드 선언")만 인가 표현으로 인정한다.

  private static final Pattern MAPPING =
      Pattern.compile(
          "@(Get|Post|Put|Patch|Delete)Mapping(?:\\(\\s*(?:value\\s*=\\s*)?\"([^\"]*)\")?");
  private static final Pattern METHOD_DECL = Pattern.compile("\\n  (?:public|protected)\\s");
  private static final Pattern PRE_AUTHORIZE = Pattern.compile("@PreAuthorize\\(");

  private record Endpoint(String verb, String path, String authorization) {
    String describe() {
      return verb + " " + (path == null || path.isEmpty() ? "(기본 경로)" : path);
    }
  }

  private static List<Endpoint> readEndpoints(String fileName, String src) {
    List<Integer> decls = new ArrayList<>();
    Matcher d = METHOD_DECL.matcher(src);
    while (d.find()) {
      decls.add(d.start());
    }

    List<Endpoint> out = new ArrayList<>();
    Matcher m = MAPPING.matcher(src);
    while (m.find()) {
      String verb = m.group(1).toUpperCase();
      String path = m.group(2) == null ? "" : m.group(2);
      boolean read =
          "GET".equals(verb) || READ_POSTS.contains(fileName + " " + verb + " " + path);
      if (!read) {
        continue;
      }
      int from = 0;
      int to = src.length();
      for (int pos : decls) {
        if (pos < m.start()) {
          from = pos;
        } else {
          to = pos;
          break;
        }
      }
      out.add(new Endpoint(verb, path, authorizationIn(src.substring(from, to))));
    }
    return out;
  }

  /** 구간 안의 @PreAuthorize 표현식을 한 줄로 모아 돌려준다. 없으면 null. */
  private static String authorizationIn(String chunk) {
    Matcher m = PRE_AUTHORIZE.matcher(chunk);
    if (!m.find()) {
      return null;
    }
    int depth = 0;
    StringBuilder expression = new StringBuilder();
    for (int i = m.end(); i < chunk.length(); i++) {
      char c = chunk.charAt(i);
      if (c == '(') {
        depth++;
      } else if (c == ')') {
        if (depth == 0) {
          break;
        }
        depth--;
      }
      expression.append(c);
    }
    return expression.toString().replaceAll("[\\s\"+]+", " ").trim();
  }
}
