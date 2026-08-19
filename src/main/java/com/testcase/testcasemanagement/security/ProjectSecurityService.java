// src/main/java/com/testcase/testcasemanagement/security/ProjectSecurityService.java
package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.dto.rag.RagDocumentResponse;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.repository.JunitTestCaseRepository;
import com.testcase.testcasemanagement.repository.JunitTestResultRepository;
import com.testcase.testcasemanagement.repository.JunitTestSuiteRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.RagChatCategoryRepository;
import com.testcase.testcasemanagement.repository.RagChatMessageRepository;
import com.testcase.testcasemanagement.repository.RagChatThreadRepository;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestCaseVersionRepository;
import com.testcase.testcasemanagement.repository.TestResultAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestResultEditRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.TestSessionAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestSessionRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
public class ProjectSecurityService {

  @Autowired private ProjectUserRepository projectUserRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private SecurityContextUtil securityContextUtil;

  @Autowired private OrganizationSecurityService organizationSecurityService;

  @Autowired private TestCaseAttachmentRepository testCaseAttachmentRepository;

  @Autowired private TestCaseRepository testCaseRepository;

  @Autowired private TestResultAttachmentRepository testResultAttachmentRepository;

  @Autowired private JunitTestResultRepository junitTestResultRepository;

  @Autowired private JunitTestSuiteRepository junitTestSuiteRepository;

  @Autowired private JunitTestCaseRepository junitTestCaseRepository;

  @Autowired private TestSessionRepository testSessionRepository;

  @Autowired private TestCaseVersionRepository testCaseVersionRepository;

  @Autowired private TestResultRepository testResultRepository;

  @Autowired private TestResultEditRepository testResultEditRepository;

  @Autowired private TestSessionAttachmentRepository testSessionAttachmentRepository;

  @Autowired private RagChatThreadRepository ragChatThreadRepository;

  @Autowired private RagChatMessageRepository ragChatMessageRepository;

  @Autowired private RagChatCategoryRepository ragChatCategoryRepository;

  @Autowired @Lazy private RagService ragService;

  /** 현재 사용자가 시스템 관리자인지 확인 (프로젝트 스코프가 없는 전역 조회를 제한할 때 사용) */
  public boolean isSystemAdmin() {
    return securityContextUtil.isSystemAdmin();
  }

  /** 사용자가 프로젝트의 멤버인지 확인 */
  public boolean isProjectMember(String projectId, String username) {
    return userRepository
        .findByUsername(username)
        .map(user -> projectUserRepository.existsByProjectIdAndUserId(projectId, user.getId()))
        .orElse(false);
  }

  /** 현재 사용자가 프로젝트의 멤버인지 확인 */
  public boolean isProjectMember(String projectId) {
    String currentUserId = securityContextUtil.getCurrentUserId();
    return currentUserId != null
        && projectUserRepository.existsByProjectIdAndUserId(projectId, currentUserId);
  }

  /** 사용자가 프로젝트의 관리자(PM, LEAD_DEVELOPER)인지 확인 */
  public boolean hasManagementRole(String projectId, String username) {
    return userRepository
        .findByUsername(username)
        .map(user -> projectUserRepository.hasManagementRole(projectId, user.getId()))
        .orElse(false);
  }

  /** 현재 사용자가 프로젝트의 관리자인지 확인 */
  public boolean hasManagementRole(String projectId) {
    String currentUserId = securityContextUtil.getCurrentUserId();
    return currentUserId != null
        && projectUserRepository.hasManagementRole(projectId, currentUserId);
  }

  /**
   * 프로젝트 멤버를 관리(초대·역할 변경·제거)할 수 있는지 확인. 프로젝트 관리 역할(PROJECT_MANAGER·LEAD_DEVELOPER)과 시스템 관리자만 통과한다.
   * canManageProject 와 달리 조직 관리자는 포함하지 않는다 — 멤버 구성은 프로젝트 안에서 정한다.
   */
  public boolean canManageMembers(String projectId, String username) {
    return userRepository
            .findByUsername(username)
            .map(user -> "ADMIN".equals(user.getRole()))
            .orElse(false)
        || hasManagementRole(projectId, username);
  }

  /** 현재 사용자가 프로젝트 멤버를 관리할 수 있는지 확인 */
  public boolean canManageMembers(String projectId) {
    return securityContextUtil.isSystemAdmin() || hasManagementRole(projectId);
  }

  /**
   * 프로젝트 설정(이름·설명·정렬 순서)을 바꿀 수 있는지 확인. 사용자 매뉴얼 18-4 의 역할표대로 PROJECT_MANAGER 와 시스템 관리자만 통과한다.
   * canManageProject 보다 좁다 — LEAD_DEVELOPER 와 조직 관리자는 멤버는 다뤄도 프로젝트 자체의 설정은 바꾸지 못한다.
   */
  public boolean canUpdateProjectSettings(String projectId, String username) {
    return userRepository
            .findByUsername(username)
            .map(user -> "ADMIN".equals(user.getRole()))
            .orElse(false)
        || isProjectManager(projectId, username);
  }

  /** 현재 사용자가 프로젝트 설정을 바꿀 수 있는지 확인 */
  public boolean canUpdateProjectSettings(String projectId) {
    return securityContextUtil.isSystemAdmin() || isProjectManager(projectId);
  }

  /** 사용자가 프로젝트를 편집할 수 있는지 확인 */
  public boolean hasEditRole(String projectId, String username) {
    return userRepository
        .findByUsername(username)
        .map(user -> projectUserRepository.hasEditRole(projectId, user.getId()))
        .orElse(false);
  }

  /** 현재 사용자가 프로젝트를 편집할 수 있는지 확인 */
  public boolean hasEditRole(String projectId) {
    String currentUserId = securityContextUtil.getCurrentUserId();
    return currentUserId != null && projectUserRepository.hasEditRole(projectId, currentUserId);
  }

  /**
   * 현재 사용자가 프로젝트 데이터를 변경(생성/수정/삭제)할 수 있는지. 시스템 ADMIN 이거나 프로젝트 편집 롤(PM/LEAD/DEVELOPER/CONTRIBUTOR)을
   * 가진 경우 허용. 테스트케이스/플랜/실행 CRUD 인가의 표준 검사로 사용한다.
   */
  public boolean canEditProject(String projectId) {
    return securityContextUtil.isSystemAdmin() || hasEditRole(projectId);
  }

  /**
   * 현재 사용자가 테스트 실행 결과를 기록(PASS/FAIL 등)할 수 있는지. 시스템 ADMIN, 프로젝트 편집 롤에 더해 TESTER도 허용한다 — TESTER는
   * 테스트케이스/플랜 자체를 편집할 권한은 없지만 결과 기록은 본연의 업무이기 때문이다.
   */
  public boolean canRecordTestResult(String projectId) {
    String currentUserId = securityContextUtil.getCurrentUserId();
    return securityContextUtil.isSystemAdmin()
        || (currentUserId != null
            && projectUserRepository.hasResultEntryRole(projectId, currentUserId));
  }

  /**
   * 리소스 → 프로젝트 투영 후 권한 판정의 공통 형태. 17개 리소스별 can* 메서드가 동일하게 "리소스ID로 projectId 조회 → 권한 술어 적용, 미존재 시
   * fail-closed(false)"를 반복하던 것을 한 곳으로 모은다. 새 리소스 메서드를 추가할 때 이 한 줄 형태를 따르면 미묘한 실수(예: orElse(true)
   * 오타)를 줄인다.
   */
  private boolean projectPermission(Optional<String> projectId, Predicate<String> permission) {
    return projectId.map(permission::test).orElse(false);
  }

  /** 테스트케이스가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 (미존재 시 fail-closed) */
  public boolean canAccessTestCase(String testCaseId) {
    return projectPermission(
        testCaseRepository.findProjectIdById(testCaseId), this::canAccessProject);
  }

  /**
   * 테스트케이스에 첨부를 더할 수 있는지. 케이스에 파일을 붙이는 것은 케이스를 바꾸는 일이라 편집 권한을 요구한다(이전에는 업로드 권한을 썼고 그 정의가 읽기 권한이었다).
   */
  public boolean canUploadTestCase(String testCaseId) {
    return projectPermission(
        testCaseRepository.findProjectIdById(testCaseId), this::canEditProject);
  }

  /**
   * 테스트케이스가 속한 프로젝트를 현재 사용자가 편집할 수 있는지 (미존재 시 fail-closed).
   *
   * <p>canAccessTestCase 는 읽기 판정이라 VIEWER 가 통과한다. 케이스를 바꾸는 동작에는 이것을 쓴다.
   */
  public boolean canEditTestCase(String testCaseId) {
    return projectPermission(
        testCaseRepository.findProjectIdById(testCaseId), this::canEditProject);
  }

  /**
   * 테스트케이스 버전이 속한 프로젝트를 현재 사용자가 편집할 수 있는지 (미존재 시 fail-closed).
   *
   * <p>버전 복원은 케이스 본문을 그 버전으로 덮어쓰므로 케이스 수정과 같은 권한을 요구한다.
   */
  public boolean canEditTestCaseVersion(String versionId) {
    return projectPermission(
        testCaseVersionRepository.findProjectIdById(versionId), this::canEditProject);
  }

  /** 테스트케이스 첨부파일이 속한 프로젝트에 현재 사용자가 접근(조회/다운로드)할 수 있는지 */
  public boolean canAccessTestCaseAttachment(String attachmentId) {
    return projectPermission(
        testCaseAttachmentRepository.findProjectIdByAttachmentId(attachmentId),
        this::canAccessProject);
  }

  /** 테스트케이스 첨부파일이 속한 프로젝트를 현재 사용자가 편집(삭제/사용표시)할 수 있는지 */
  public boolean canEditTestCaseAttachment(String attachmentId) {
    return projectPermission(
        testCaseAttachmentRepository.findProjectIdByAttachmentId(attachmentId),
        this::canEditProject);
  }

  /** 테스트 결과 첨부파일이 속한 프로젝트에 현재 사용자가 접근(조회/다운로드/미리보기)할 수 있는지 */
  public boolean canAccessTestResultAttachment(String attachmentId) {
    return projectPermission(
        testResultAttachmentRepository.findProjectIdByAttachmentId(attachmentId),
        this::canAccessProject);
  }

  /** 테스트 결과 첨부파일이 속한 프로젝트를 현재 사용자가 편집(삭제)할 수 있는지 */
  public boolean canEditTestResultAttachment(String attachmentId) {
    return projectPermission(
        testResultAttachmentRepository.findProjectIdByAttachmentId(attachmentId),
        this::canEditProject);
  }

  /** 테스트 결과가 속한 프로젝트에 현재 사용자가 결과를 기록할 수 있는지 (결과 → 실행 → 프로젝트 투영). */
  public boolean canRecordTestResultById(String testResultId) {
    return projectPermission(
        testResultRepository.findProjectIdById(testResultId), this::canRecordTestResult);
  }

  /** 결과 편집본이 속한 프로젝트에 현재 사용자가 결과를 기록할 수 있는지 (편집본 → 원본 결과 → 실행 → 프로젝트). */
  public boolean canEditTestResultEdit(String editId) {
    return projectPermission(
        testResultEditRepository.findProjectIdByEditId(editId), this::canRecordTestResult);
  }

  /** JUnit 결과가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessJunitResult(String testResultId) {
    return projectPermission(
        junitTestResultRepository.findProjectIdById(testResultId), this::canAccessProject);
  }

  /** JUnit 결과가 속한 프로젝트를 현재 사용자가 변경(수정/삭제/플랜연결)할 수 있는지 (업로드 권한과 동일 기준) */
  public boolean canModifyJunitResult(String testResultId) {
    return projectPermission(
        junitTestResultRepository.findProjectIdById(testResultId), this::canUploadToProject);
  }

  /** JUnit 스위트가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessJunitSuite(String suiteId) {
    return projectPermission(
        junitTestSuiteRepository.findProjectIdBySuiteId(suiteId), this::canAccessProject);
  }

  /** JUnit 케이스가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessJunitCase(String caseId) {
    return projectPermission(
        junitTestCaseRepository.findProjectIdByCaseId(caseId), this::canAccessProject);
  }

  /** JUnit 케이스가 속한 프로젝트를 현재 사용자가 변경(수정)할 수 있는지 (업로드 권한과 동일 기준) */
  public boolean canModifyJunitCase(String caseId) {
    return projectPermission(
        junitTestCaseRepository.findProjectIdByCaseId(caseId), this::canUploadToProject);
  }

  /** 탐색적 세션이 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessTestSession(String sessionId) {
    return projectPermission(
        testSessionRepository.findProjectIdById(sessionId), this::canAccessProject);
  }

  /** 탐색적 세션에 첨부를 더할 수 있는지. 세션을 진행할 수 있는 사람과 같은 기준이다. */
  public boolean canUploadToTestSession(String sessionId) {
    return projectPermission(
        testSessionRepository.findProjectIdById(sessionId), this::canRunTestSession);
  }

  /**
   * 탐색적 세션을 진행(생성·수정·상태전환)할 수 있는지. 사용자 매뉴얼 18-4 가 TESTER 에게 "탐색 세션 진행" 을 주므로 결과 기록과 같은 기준을 쓴다 — 편집
   * 롤 + TESTER + 시스템 관리자. VIEWER 는 빠진다.
   */
  public boolean canRunTestSession(String projectId) {
    return canRecordTestResult(projectId);
  }

  /** 세션 ID 로 진행 권한을 판정한다. 세션이 없으면 fail-closed. */
  public boolean canRunTestSessionById(String sessionId) {
    return projectPermission(
        testSessionRepository.findProjectIdById(sessionId), this::canRunTestSession);
  }

  /**
   * 탐색적 세션을 승인·보완요청할 수 있는지. 세션이 속한 프로젝트의 관리 역할(PROJECT_MANAGER·LEAD_DEVELOPER)과 시스템 관리자만 통과한다.
   *
   * <p>이전에는 시스템 역할(ADMIN·MANAGER)만 봐서, 그 프로젝트의 VIEWER 인 시스템 MANAGER 도 승인할 수 있었다.
   */
  public boolean canApproveTestSession(String sessionId) {
    return projectPermission(
        testSessionRepository.findProjectIdById(sessionId), this::canManageMembers);
  }

  /** 세션 첨부파일이 속한 프로젝트에 현재 사용자가 접근(조회/다운로드)할 수 있는지 */
  public boolean canAccessTestSessionAttachment(String attachmentId) {
    return projectPermission(
        testSessionAttachmentRepository.findProjectIdByAttachmentId(attachmentId),
        this::canAccessProject);
  }

  /** 세션 첨부파일이 속한 프로젝트를 현재 사용자가 편집(수정/삭제)할 수 있는지 */
  public boolean canEditTestSessionAttachment(String attachmentId) {
    return projectPermission(
        testSessionAttachmentRepository.findProjectIdByAttachmentId(attachmentId),
        this::canEditProject);
  }

  /** RAG 채팅 스레드가 속한 프로젝트에 현재 사용자가 접근할 수 있는지 (조회/생성/수정/삭제 공통 — 프로젝트 멤버 협업) */
  public boolean canAccessRagChatThread(String threadId) {
    return projectPermission(
        ragChatThreadRepository.findProjectIdById(threadId), this::canAccessProject);
  }

  /** RAG 채팅 메시지가 속한(스레드→) 프로젝트에 현재 사용자가 접근할 수 있는지 */
  public boolean canAccessRagChatMessage(String messageId) {
    return projectPermission(
        ragChatMessageRepository.findProjectIdByMessageId(messageId), this::canAccessProject);
  }

  /** RAG 채팅 카테고리가 속한 프로젝트에 현재 사용자가 접근할 수 있는지 */
  public boolean canAccessRagChatCategory(String categoryId) {
    return projectPermission(
        ragChatCategoryRepository.findProjectIdById(categoryId), this::canAccessProject);
  }

  /** 사용자가 프로젝트 매니저인지 확인 */
  public boolean isProjectManager(String projectId, String username) {
    return userRepository
        .findByUsername(username)
        .flatMap(
            user -> projectUserRepository.findRoleByProjectIdAndUserId(projectId, user.getId()))
        .map(role -> role == ProjectRole.PROJECT_MANAGER)
        .orElse(false);
  }

  /** 현재 사용자가 프로젝트 매니저인지 확인 */
  public boolean isProjectManager(String projectId) {
    String currentUserId = securityContextUtil.getCurrentUserId();
    return currentUserId != null
        && projectUserRepository
            .findRoleByProjectIdAndUserId(projectId, currentUserId)
            .map(role -> role == ProjectRole.PROJECT_MANAGER)
            .orElse(false);
  }

  /** 사용자가 프로젝트에 접근할 수 있는지 확인 (프로젝트 멤버이거나, 조직 멤버이거나, 시스템 관리자) */
  public boolean canAccessProject(String projectId, String username) {
    // 시스템 관리자는 모든 프로젝트에 접근 가능
    if (userRepository
        .findByUsername(username)
        .map(user -> "ADMIN".equals(user.getRole()))
        .orElse(false)) {
      return true;
    }

    // 프로젝트 멤버인지 확인
    if (isProjectMember(projectId, username)) {
      return true;
    }

    // 프로젝트가 조직에 속한 경우, 조직 멤버도 접근 가능
    Optional<Project> project = projectRepository.findById(projectId);
    if (project.isPresent() && project.get().getOrganization() != null) {
      String organizationId = project.get().getOrganization().getId();
      return organizationSecurityService.isOrganizationMember(organizationId, username);
    }

    return false;
  }

  /** 현재 사용자가 프로젝트에 접근할 수 있는지 확인 */
  public boolean canAccessProject(String projectId) {
    // 시스템 관리자는 모든 프로젝트에 접근 가능
    if (securityContextUtil.isSystemAdmin()) {
      return true;
    }

    // 프로젝트 멤버인지 확인
    if (isProjectMember(projectId)) {
      return true;
    }

    // 프로젝트가 조직에 속한 경우, 조직 멤버도 접근 가능
    Optional<Project> project = projectRepository.findById(projectId);
    if (project.isPresent() && project.get().getOrganization() != null) {
      String organizationId = project.get().getOrganization().getId();
      return organizationSecurityService.isOrganizationMember(organizationId);
    }

    return false;
  }

  /** 사용자가 프로젝트를 관리할 수 있는지 확인 (프로젝트 관리자이거나, 조직 관리자이거나, 시스템 관리자) */
  public boolean canManageProject(String projectId, String username) {
    // 시스템 관리자는 모든 프로젝트를 관리 가능
    if (userRepository
        .findByUsername(username)
        .map(user -> "ADMIN".equals(user.getRole()))
        .orElse(false)) {
      return true;
    }

    // 프로젝트 관리자인지 확인
    if (hasManagementRole(projectId, username)) {
      return true;
    }

    // 프로젝트가 조직에 속한 경우, 조직 관리자도 관리 가능
    Optional<Project> project = projectRepository.findById(projectId);
    if (project.isPresent() && project.get().getOrganization() != null) {
      String organizationId = project.get().getOrganization().getId();
      return organizationSecurityService.hasOrganizationAdminRole(organizationId, username);
    }

    return false;
  }

  /** 현재 사용자가 프로젝트를 관리할 수 있는지 확인 */
  public boolean canManageProject(String projectId) {
    // 시스템 관리자는 모든 프로젝트를 관리 가능
    if (securityContextUtil.isSystemAdmin()) {
      return true;
    }

    // 프로젝트 관리자인지 확인
    if (hasManagementRole(projectId)) {
      return true;
    }

    // 프로젝트가 조직에 속한 경우, 조직 관리자도 관리 가능
    Optional<Project> project = projectRepository.findById(projectId);
    if (project.isPresent() && project.get().getOrganization() != null) {
      String organizationId = project.get().getOrganization().getId();
      return organizationSecurityService.hasOrganizationAdminRole(organizationId);
    }

    return false;
  }

  /** 사용자가 프로젝트 멤버를 초대할 수 있는지 확인 */
  public boolean canInviteMembers(String projectId, String username) {
    return canManageProject(projectId, username);
  }

  /** 현재 사용자가 프로젝트 멤버를 초대할 수 있는지 확인 */
  public boolean canInviteMembers(String projectId) {
    return canManageProject(projectId);
  }

  /** 사용자가 프로젝트에서 특정 멤버를 제거할 수 있는지 확인 */
  public boolean canRemoveMember(String projectId, String targetUserId, String username) {
    // 시스템 관리자는 모든 멤버 제거 가능
    if (userRepository
        .findByUsername(username)
        .map(user -> "ADMIN".equals(user.getRole()))
        .orElse(false)) {
      return true;
    }

    // 자기 자신은 항상 탈퇴 가능
    if (userRepository
        .findByUsername(username)
        .map(user -> user.getId().equals(targetUserId))
        .orElse(false)) {
      return true;
    }

    // 프로젝트 관리자는 다른 멤버 제거 가능 (단, PM은 다른 PM 제거 불가)
    if (canManageProject(projectId, username)) {
      // 대상이 PM인지 확인
      Optional<ProjectRole> targetRole =
          projectUserRepository.findRoleByProjectIdAndUserId(projectId, targetUserId);

      if (targetRole.isPresent() && targetRole.get() == ProjectRole.PROJECT_MANAGER) {
        // PM은 다른 PM만 제거 가능
        return isProjectManager(projectId, username);
      }

      return true;
    }

    return false;
  }

  /** 현재 사용자가 프로젝트에서 특정 멤버를 제거할 수 있는지 확인 */
  public boolean canRemoveMember(String projectId, String targetUserId) {
    String currentUsername = securityContextUtil.getCurrentUsername();
    return currentUsername != null && canRemoveMember(projectId, targetUserId, currentUsername);
  }

  /** 사용자가 프로젝트를 생성할 수 있는지 확인 (조직에 속한 프로젝트의 경우 조직 관리자, 독립 프로젝트의 경우 인증된 사용자) */
  public boolean canCreateProject(String organizationId, String username) {
    if (organizationId != null) {
      // 조직 프로젝트인 경우 조직 관리자만 가능
      return organizationSecurityService.canManageOrganization(organizationId, username);
    } else {
      // 독립 프로젝트인 경우 인증된 사용자는 누구나 가능
      return userRepository.existsByUsername(username);
    }
  }

  /** 현재 사용자가 프로젝트를 생성할 수 있는지 확인 */
  public boolean canCreateProject(String organizationId) {
    if (organizationId != null) {
      // 조직 프로젝트인 경우 조직 관리자만 가능
      return organizationSecurityService.canManageOrganization(organizationId);
    } else {
      // 독립 프로젝트인 경우 인증된 사용자는 누구나 가능
      return securityContextUtil.isAuthenticated();
    }
  }

  /** ICT-203: 사용자가 프로젝트에 JUnit XML 파일을 업로드할 수 있는지 확인 (프로젝트 멤버이거나 시스템 관리자) */
  public boolean canUploadToProject(String projectId, String username) {
    // 시스템 관리자는 모든 프로젝트에 업로드 가능
    if (userRepository
        .findByUsername(username)
        .map(user -> "ADMIN".equals(user.getRole()))
        .orElse(false)) {
      return true;
    }

    // 결과 기록 권한(편집 롤 + TESTER)이 있어야 올릴 수 있다.
    // 이전에는 canAccessProject(읽기)였어서 VIEWER 도 업로드할 수 있었다.
    return userRepository
        .findByUsername(username)
        .map(user -> projectUserRepository.hasResultEntryRole(projectId, user.getId()))
        .orElse(false);
  }

  /**
   * ICT-203: 현재 사용자가 프로젝트에 JUnit XML 파일 등을 업로드할 수 있는지 확인.
   *
   * <p>업로드는 결과를 남기는 동작이므로 결과 기록 권한과 같은 기준을 쓴다 — 편집 롤 + TESTER + 시스템 관리자. 이름만 보면 쓰기 권한처럼 보이지만 정의가
   * canAccessProject 였어서 VIEWER 도 통과했다.
   */
  public boolean canUploadToProject(String projectId) {
    return canRecordTestResult(projectId);
  }

  /**
   * RAG 문서가 속한 프로젝트에 사용자가 접근할 수 있는지 확인
   *
   * @param documentId RAG 문서 ID
   * @param username 사용자명
   * @return 접근 가능 여부
   */
  public boolean canAccessDocumentProject(UUID documentId, String username) {
    try {
      // RAG Service에서 문서 정보 조회
      RagDocumentResponse document = ragService.getDocument(documentId);

      if (document == null || document.getProjectId() == null) {
        return false;
      }

      // 글로벌 문서(공통 문서)는 모든 인증된 사용자가 접근 가능
      if (RagService.GLOBAL_PROJECT_ID.equals(document.getProjectId())) {
        return userRepository.existsByUsername(username);
      }

      // 문서의 프로젝트에 대한 접근 권한 확인
      return canAccessProject(document.getProjectId().toString(), username);
    } catch (Exception e) {
      // 문서 조회 실패 시 접근 거부
      return false;
    }
  }

  /**
   * RAG 문서가 속한 프로젝트에 현재 사용자가 접근할 수 있는지 확인
   *
   * @param documentId RAG 문서 ID
   * @return 접근 가능 여부
   */
  public boolean canAccessDocumentProject(UUID documentId) {
    // 글로벌 문서(공통 문서)는 모든 인증된 사용자가 접근 가능
    try {
      RagDocumentResponse document = ragService.getDocument(documentId);
      if (document != null && RagService.GLOBAL_PROJECT_ID.equals(document.getProjectId())) {
        return securityContextUtil.isAuthenticated();
      }
    } catch (Exception e) {
      // 문서 조회 실패 시 username 기반 검증으로 진행
    }

    String currentUsername = securityContextUtil.getCurrentUsername();
    return currentUsername != null && canAccessDocumentProject(documentId, currentUsername);
  }

  /**
   * RAG 문서가 속한 프로젝트를 현재 사용자가 편집할 수 있는지. 문서 업로드·삭제·분석 실행처럼 상태를 바꾸는 동작에 쓴다.
   *
   * <p>공통(글로벌) 문서는 프로젝트가 없으므로 시스템 관리자만 바꿀 수 있다. 조회 판정(canAccessDocumentProject)은 인증만 요구하지만 변경은 그럴 수
   * 없다.
   */
  public boolean canEditDocumentProject(UUID documentId) {
    try {
      RagDocumentResponse document = ragService.getDocument(documentId);
      if (document == null || document.getProjectId() == null) {
        return false;
      }
      if (RagService.GLOBAL_PROJECT_ID.equals(document.getProjectId())) {
        return securityContextUtil.isSystemAdmin();
      }
      return canEditProject(document.getProjectId().toString());
    } catch (Exception e) {
      // 문서 조회 실패 시 fail-closed
      return false;
    }
  }

  /** RAG 분석요약이 속한 프로젝트를 현재 사용자가 편집할 수 있는지 (요약 → 문서 → 프로젝트). */
  public boolean canEditRagAnalysisSummary(java.util.UUID summaryId) {
    try {
      com.testcase.testcasemanagement.dto.rag.RagAnalysisSummaryResponse summary =
          ragService.getAnalysisSummary(summaryId);
      if (summary == null || summary.getDocumentId() == null) {
        return false;
      }
      return canEditDocumentProject(summary.getDocumentId());
    } catch (Exception e) {
      return false;
    }
  }

  /**
   * RAG 분석요약이 속한(요약→document→) 프로젝트에 현재 사용자가 접근할 수 있는지. 요약은 외부 RAG 서비스에 저장되므로 요약을 조회해 소속 documentId
   * 를 얻은 뒤 문서-프로젝트 접근 권한으로 판정한다(canAccessDocumentProject 가 외부 getDocument 를 쓰는 것과 동일 패턴). 조회 실패·미존재
   * 시 fail-closed.
   */
  public boolean canAccessRagAnalysisSummary(java.util.UUID summaryId) {
    try {
      com.testcase.testcasemanagement.dto.rag.RagAnalysisSummaryResponse summary =
          ragService.getAnalysisSummary(summaryId);
      if (summary == null || summary.getDocumentId() == null) {
        return false;
      }
      return canAccessDocumentProject(summary.getDocumentId());
    } catch (Exception e) {
      return false;
    }
  }
}
