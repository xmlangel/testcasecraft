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
 * 프로젝트 범위 컨트롤러의 쓰기 엔드포인트가 프로젝트 역할로 인가되는지 소스에서 확인한다.
 *
 * <p>왜 소스를 읽는가 — 인가 누락은 실행해 봐야 드러나는 종류가 아니고, 엔드포인트마다 통합 테스트를 붙이면 200개가 넘는다. 여기서는 "쓰기 동작에 읽기 권한
 * 술어(canAccess*·canUpload*)나 시스템 역할만 걸려 있으면 실패"라는 규칙 하나로 전체를 덮는다.
 *
 * <p>읽기 권한과 쓰기 권한의 차이가 이 검사의 핵심이다. `canAccessProject` 는 프로젝트 VIEWER 도 통과하므로 그것으로 막은 쓰기 동작은 막힌 것이
 * 아니다. `canUploadToProject` 는 이름과 달리 정의가 `canAccessProject` 와 같아 같은 함정이다.
 *
 * <p>예외는 {@link #ALLOWED} 에 사유와 함께 적는다. 사유 없이 목록에 넣지 않는다 — 사유를 적을 수 없으면 그것은 예외가 아니라 결함이다.
 */
public class WriteEndpointAuthorizationTest {

  private static final Path CONTROLLERS =
      Path.of("src/main/java/com/testcase/testcasemanagement/controller");

  /** 프로젝트 자원을 다루는 컨트롤러. 관리자 전용·개인 자원 컨트롤러는 대상이 아니다. */
  private static final Set<String> IN_SCOPE =
      Set.of(
          "TestCaseController.java",
          "TestCaseVersionController.java",
          "TestCaseAttachmentController.java",
          "TestPlanController.java",
          "TestExecutionController.java",
          "TestResultEditController.java",
          "TestResultAttachmentController.java",
          "JunitResultController.java",
          "RagController.java",
          "TestSessionController.java",
          "TestSessionAttachmentController.java",
          "ProjectController.java");

  /** 쓰기 동작에 쓸 수 있는 인가 술어. 프로젝트 역할을 실제로 가리는 것만 넣는다. */
  private static final List<String> WRITE_PREDICATES =
      List.of(
          "canEditProject",
          "canEditTestCase",
          "canEditTestCaseVersion",
          "canEditTestCaseAttachment",
          "canEditTestResultAttachment",
          "canEditTestSessionAttachment",
          "canRecordTestResult",
          "canRecordTestResultById",
          "canEditTestResultEdit",
          "canEditDocumentProject",
          "canEditRagAnalysisSummary",
          // 이름은 업로드지만 정의를 결과 기록·편집 권한으로 조였다. 정의가 풀리면
          // predicateDefinitionsStayTightened 가 잡는다.
          "canUploadToProject",
          "canUploadTestCase",
          "canUploadToTestSession",
          "canModifyJunitResult",
          "canModifyJunitCase",
          "canRunTestSession",
          "canApproveTestSession",
          "canManageMembers",
          "canUpdateProjectSettings",
          "canManageProject",
          "hasManagementRole",
          "canRemoveMember",
          "hasRole('ADMIN')");

  /**
   * 아직 프로젝트 쓰기 권한으로 막지 못한 엔드포인트. 키는 `파일 VERB 경로`, 값은 왜 남겨 두는지다.
   *
   * <p>하나를 고치면 여기서 지운다. 목록이 빌 때까지가 남은 일이다. 사유 없이 넣지 않는다.
   */
  private static final Map<String, String> ALLOWED = new LinkedHashMap<>();

  static {
    // 컨트롤러에 표현이 없지만 서비스 계층이 검사하는 것들
    ALLOWED.put(
        "TestCaseController.java",
        "서비스 계층에서 검사한다 — TestCaseService 가 canEditProject 를 확인한다(118·244·434줄)");
    ALLOWED.put(
        "TestPlanController.java",
        "서비스 계층에서 검사한다 — TestPlanService 가 canEditProject 를 확인한다(38·61·95줄)");
    ALLOWED.put(
        "TestExecutionController.java",
        "서비스 계층에서 검사한다 — TestExecutionService 가 canEditProject·canRecordTestResult 를 확인한다");

    // POST 를 쓰지만 실제로는 읽기인 것들
    ALLOWED.put("RagController.java POST /search/similar", "검색 조회다. 조건이 길어 POST 를 쓴다");
    ALLOWED.put("RagController.java POST /search/advanced", "검색 조회다. 조건이 길어 POST 를 쓴다");
  }

  @Test(description = "프로젝트 쓰기 엔드포인트는 읽기 권한이나 시스템 역할만으로 열려 있지 않다")
  public void writeEndpointsRequireProjectWritePermission() throws IOException {
    List<String> violations = new ArrayList<>();

    try (var files = Files.list(CONTROLLERS)) {
      for (Path file : files.filter(f -> IN_SCOPE.contains(f.getFileName().toString())).toList()) {
        String name = file.getFileName().toString();
        if (ALLOWED.containsKey(name)) {
          continue;
        }
        String src = Files.readString(file, StandardCharsets.UTF_8);
        for (Endpoint endpoint : writeEndpoints(src)) {
          String key = name + " " + endpoint.describe();
          if (ALLOWED.containsKey(key)) {
            continue;
          }
          String expression = endpoint.authorization();
          if (expression == null) {
            violations.add(key + " → 인가 표현 없음");
            continue;
          }
          if (WRITE_PREDICATES.stream().noneMatch(expression::contains)) {
            violations.add(key + " → 쓰기 권한 술어가 없다: " + expression);
          }
        }
      }
    }

    assertTrue(
        violations.isEmpty(),
        "프로젝트 역할로 막히지 않는 쓰기 엔드포인트가 있다:\n  " + String.join("\n  ", violations));
  }

  /**
   * 이름이 업로드·수정인 술어들이 읽기 권한으로 되돌아가지 않았는지 정의에서 확인한다.
   *
   * <p>`canUploadToProject` 는 이름과 달리 정의가 `canAccessProject` 여서 프로젝트 VIEWER 가 JUnit 결과를 올리고 지울 수
   * 있었다. 이름을 바꾸지 않고 정의만 조였으므로, 정의가 다시 풀리면 엔드포인트 검사만으로는 드러나지 않는다. 그래서 정의를 따로 못 박는다.
   */
  @Test(description = "업로드·수정 술어의 정의가 읽기 권한으로 되돌아가지 않았다")
  public void predicateDefinitionsStayTightened() throws IOException {
    String src =
        Files.readString(
            Path.of(
                "src/main/java/com/testcase/testcasemanagement/security/ProjectSecurityService.java"),
            StandardCharsets.UTF_8);

    assertTrue(
        body(src, "public boolean canUploadToProject(String projectId) {")
            .contains("canRecordTestResult"),
        "canUploadToProject 가 결과 기록 권한을 쓰지 않는다");
    assertTrue(
        body(src, "public boolean canUploadTestCase(String testCaseId) {")
            .contains("canEditProject"),
        "canUploadTestCase 가 편집 권한을 쓰지 않는다");
    assertTrue(
        body(src, "public boolean canUploadToTestSession(String sessionId) {")
            .contains("canRunTestSession"),
        "canUploadToTestSession 이 세션 진행 권한을 쓰지 않는다");
    // 주석에 옛 이름이 남아 있어도 걸리지 않게, 무엇을 부르는지로 확인한다.
    assertTrue(
        body(src, "public boolean canUploadToProject(String projectId, String username) {")
            .contains("hasResultEntryRole"),
        "canUploadToProject(username) 가 결과 기록 롤을 확인하지 않는다");
  }

  /** 메서드 선언부터 다음 빈 줄까지의 본문. 정의가 무엇을 부르는지 보기에 충분하다. */
  private static String body(String src, String declaration) {
    int start = src.indexOf(declaration);
    assertTrue(start >= 0, "선언을 찾지 못했다: " + declaration);
    int end = src.indexOf("\n  }", start);
    return src.substring(start, end < 0 ? src.length() : end);
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
  // 매핑은 따로 열거하고, 그 매핑이 붙은 메서드의 어노테이션 구간만 인가 표현으로 인정한다.
  // 구간은 "앞 메서드 선언 ~ 이 메서드 선언" 이다. @PreAuthorize 가 매핑 앞에 오는 파일과
  // 뒤에 오는 파일이 섞여 있어, 매핑 사이를 구간으로 잡으면 옆 메서드의 표현을 잘못 가져온다
  // (실측: JunitResultController 에서 파라미터가 어긋난 표현이 붙었다).

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

  private static List<Endpoint> writeEndpoints(String src) {
    List<Integer> decls = new ArrayList<>();
    Matcher d = METHOD_DECL.matcher(src);
    while (d.find()) {
      decls.add(d.start());
    }

    List<Endpoint> out = new ArrayList<>();
    Matcher m = MAPPING.matcher(src);
    while (m.find()) {
      String verb = m.group(1).toUpperCase();
      if ("GET".equals(verb)) {
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
      String path = m.group(2) == null ? "" : m.group(2);
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
    for (int i = m.end() - 1; i < chunk.length(); i++) {
      char c = chunk.charAt(i);
      if (c == '(') {
        depth++;
      } else if (c == ')') {
        depth--;
        if (depth == 0) {
          break;
        }
      }
      expression.append(c);
    }
    return expression.toString().replaceAll("[\\s\"+]+", " ").trim();
  }
}
