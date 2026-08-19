package com.testcase.testcasemanagement.security;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.testng.annotations.Test;

/**
 * 여섯 프로젝트 역할이 사용자 매뉴얼 18-4 의 규정대로 갈리는지 확인한다.
 *
 * <p>인가 판정의 뿌리는 {@code ProjectUserRepository} 의 세 JPQL 이다. 술어 이름이 어떻든 결국 이 목록이 누가 통과하는지를 정한다. 그래서
 * 여기서는 목록 자체를 규정과 대조한다 — 누가 VIEWER 를 편집 목록에 끼워 넣으면 이 테스트가 먼저 깨진다.
 *
 * <p>VIEWER 만 보지 않고 여섯 역할을 모두 본다. 한쪽으로만 검사하면 반대 방향의 결함(프로젝트 매니저에게 기능이 보이지 않는 것)을 놓친다.
 */
public class ProjectRoleMatrixTest {

  private static final Path REPOSITORY =
      Path.of(
          "src/main/java/com/testcase/testcasemanagement/repository/ProjectUserRepository.java");

  /** 매뉴얼 18-4 의 여섯 역할. 값 집합이 늘거나 줄면 이 테스트부터 고쳐야 한다. */
  private static final List<String> ALL_ROLES =
      List.of("PROJECT_MANAGER", "LEAD_DEVELOPER", "DEVELOPER", "CONTRIBUTOR", "TESTER", "VIEWER");

  /** 멤버 관리·프로젝트 설정 — 매니저와 리드만 */
  private static final Set<String> MANAGEMENT =
      new LinkedHashSet<>(List.of("PROJECT_MANAGER", "LEAD_DEVELOPER"));

  /** 케이스·폴더·플랜·실행 편집 — 매니저·리드·개발자·기여자 */
  private static final Set<String> EDIT =
      new LinkedHashSet<>(List.of("PROJECT_MANAGER", "LEAD_DEVELOPER", "DEVELOPER", "CONTRIBUTOR"));

  /** 결과 기록·탐색 세션 진행 — 편집 롤 + 테스터 */
  private static final Set<String> RESULT_ENTRY =
      new LinkedHashSet<>(
          List.of("PROJECT_MANAGER", "LEAD_DEVELOPER", "DEVELOPER", "CONTRIBUTOR", "TESTER"));

  @Test(description = "관리 역할 목록은 프로젝트 매니저와 리드 개발자뿐이다")
  public void managementRoleListMatchesTheManual() throws IOException {
    assertEquals(rolesIn("hasManagementRole"), MANAGEMENT, "hasManagementRole 목록이 규정과 다르다");
  }

  @Test(description = "편집 역할 목록에 테스터와 뷰어가 없다")
  public void editRoleListMatchesTheManual() throws IOException {
    assertEquals(rolesIn("hasEditRole"), EDIT, "hasEditRole 목록이 규정과 다르다");
  }

  @Test(description = "결과 기록 역할 목록은 편집 역할에 테스터를 더한 것이다")
  public void resultEntryRoleListMatchesTheManual() throws IOException {
    assertEquals(rolesIn("hasResultEntryRole"), RESULT_ENTRY, "hasResultEntryRole 목록이 규정과 다르다");
  }

  @Test(description = "VIEWER 는 어떤 쓰기 목록에도 없다")
  public void viewerAppearsInNoWriteList() throws IOException {
    for (String method : List.of("hasManagementRole", "hasEditRole", "hasResultEntryRole")) {
      assertTrue(!rolesIn(method).contains("VIEWER"), method + " 목록에 VIEWER 가 들어 있다");
    }
  }

  @Test(description = "역할 목록이 여섯 역할 밖의 값을 쓰지 않는다")
  public void roleListsUseKnownRolesOnly() throws IOException {
    for (String method : List.of("hasManagementRole", "hasEditRole", "hasResultEntryRole")) {
      List<String> unknown =
          rolesIn(method).stream().filter(role -> !ALL_ROLES.contains(role)).toList();
      assertTrue(unknown.isEmpty(), method + " 목록에 모르는 역할이 있다: " + unknown);
    }
  }

  @Test(description = "권한 단계가 포함 관계를 지킨다 — 관리 ⊂ 편집 ⊂ 결과기록")
  public void permissionTiersNest() throws IOException {
    Set<String> management = rolesIn("hasManagementRole");
    Set<String> edit = rolesIn("hasEditRole");
    Set<String> entry = rolesIn("hasResultEntryRole");

    assertTrue(edit.containsAll(management), "편집 목록이 관리 역할을 담지 않는다");
    assertTrue(entry.containsAll(edit), "결과 기록 목록이 편집 역할을 담지 않는다");
    // 단계가 실제로 넓어져야 한다. 세 목록이 같으면 단계를 나눈 의미가 없다.
    assertTrue(edit.size() > management.size(), "편집 단계가 관리 단계보다 넓지 않다");
    assertTrue(entry.size() > edit.size(), "결과 기록 단계가 편집 단계보다 넓지 않다");
  }

  @Test(description = "여섯 역할이 각 단계에서 통과·차단으로 갈린다")
  public void everyRoleIsClassifiedInEveryTier() throws IOException {
    Set<String> management = rolesIn("hasManagementRole");
    Set<String> edit = rolesIn("hasEditRole");
    Set<String> entry = rolesIn("hasResultEntryRole");

    List<String> mismatches = new ArrayList<>();
    for (String role : ALL_ROLES) {
      check(mismatches, role, "관리", management.contains(role), MANAGEMENT.contains(role));
      check(mismatches, role, "편집", edit.contains(role), EDIT.contains(role));
      check(mismatches, role, "결과기록", entry.contains(role), RESULT_ENTRY.contains(role));
    }
    assertTrue(mismatches.isEmpty(), "규정과 다른 조합:\n  " + String.join("\n  ", mismatches));
  }

  private static void check(
      List<String> mismatches, String role, String tier, boolean actual, boolean expected) {
    if (actual != expected) {
      mismatches.add(
          role
              + " × "
              + tier
              + " → 실제 "
              + (actual ? "통과" : "차단")
              + ", 규정 "
              + (expected ? "통과" : "차단"));
    }
  }

  /** JPQL 의 IN 목록에 적힌 역할 이름을 뽑는다. 인가가 실제로 무엇을 보는지는 이 문자열이 정한다. */
  private static Set<String> rolesIn(String methodName) throws IOException {
    String src = Files.readString(REPOSITORY, StandardCharsets.UTF_8);
    int declaration = src.indexOf("boolean " + methodName + "(");
    assertTrue(declaration >= 0, "메서드를 찾지 못했다: " + methodName);

    // 선언 앞의 @Query 블록을 찾는다
    int queryStart = src.lastIndexOf("@Query(", declaration);
    assertTrue(queryStart >= 0, methodName + " 앞에 @Query 가 없다");
    String query = src.substring(queryStart, declaration);

    Set<String> roles = new LinkedHashSet<>();
    Matcher m = Pattern.compile("'([A-Z_]+)'").matcher(query);
    while (m.find()) {
      roles.add(m.group(1));
    }
    assertTrue(!roles.isEmpty(), methodName + " 의 역할 목록이 비어 있다");
    return roles;
  }
}
