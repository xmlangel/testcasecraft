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
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestResultAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestSessionAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestSessionRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.Optional;
import java.util.UUID;
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

  @Autowired private TestResultAttachmentRepository testResultAttachmentRepository;

  @Autowired private JunitTestResultRepository junitTestResultRepository;

  @Autowired private JunitTestSuiteRepository junitTestSuiteRepository;

  @Autowired private JunitTestCaseRepository junitTestCaseRepository;

  @Autowired private TestSessionRepository testSessionRepository;

  @Autowired private TestSessionAttachmentRepository testSessionAttachmentRepository;

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

  /** 테스트케이스 첨부파일이 속한 프로젝트에 현재 사용자가 접근(조회/다운로드)할 수 있는지 */
  public boolean canAccessTestCaseAttachment(String attachmentId) {
    return testCaseAttachmentRepository
        .findProjectIdByAttachmentId(attachmentId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** 테스트케이스 첨부파일이 속한 프로젝트를 현재 사용자가 편집(삭제/사용표시)할 수 있는지 */
  public boolean canEditTestCaseAttachment(String attachmentId) {
    return testCaseAttachmentRepository
        .findProjectIdByAttachmentId(attachmentId)
        .map(this::canEditProject)
        .orElse(false);
  }

  /** 테스트 결과 첨부파일이 속한 프로젝트에 현재 사용자가 접근(조회/다운로드/미리보기)할 수 있는지 */
  public boolean canAccessTestResultAttachment(String attachmentId) {
    return testResultAttachmentRepository
        .findProjectIdByAttachmentId(attachmentId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** 테스트 결과 첨부파일이 속한 프로젝트를 현재 사용자가 편집(삭제)할 수 있는지 */
  public boolean canEditTestResultAttachment(String attachmentId) {
    return testResultAttachmentRepository
        .findProjectIdByAttachmentId(attachmentId)
        .map(this::canEditProject)
        .orElse(false);
  }

  /** JUnit 결과가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessJunitResult(String testResultId) {
    return junitTestResultRepository
        .findProjectIdById(testResultId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** JUnit 결과가 속한 프로젝트를 현재 사용자가 변경(수정/삭제/플랜연결)할 수 있는지 (업로드 권한과 동일 기준) */
  public boolean canModifyJunitResult(String testResultId) {
    return junitTestResultRepository
        .findProjectIdById(testResultId)
        .map(this::canUploadToProject)
        .orElse(false);
  }

  /** JUnit 스위트가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessJunitSuite(String suiteId) {
    return junitTestSuiteRepository
        .findProjectIdBySuiteId(suiteId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** JUnit 케이스가 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessJunitCase(String caseId) {
    return junitTestCaseRepository
        .findProjectIdByCaseId(caseId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** JUnit 케이스가 속한 프로젝트를 현재 사용자가 변경(수정)할 수 있는지 (업로드 권한과 동일 기준) */
  public boolean canModifyJunitCase(String caseId) {
    return junitTestCaseRepository
        .findProjectIdByCaseId(caseId)
        .map(this::canUploadToProject)
        .orElse(false);
  }

  /** 탐색적 세션이 속한 프로젝트에 현재 사용자가 접근(조회)할 수 있는지 */
  public boolean canAccessTestSession(String sessionId) {
    return testSessionRepository
        .findProjectIdById(sessionId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** 탐색적 세션이 속한 프로젝트에 현재 사용자가 업로드(첨부 추가)할 수 있는지 */
  public boolean canUploadToTestSession(String sessionId) {
    return testSessionRepository
        .findProjectIdById(sessionId)
        .map(this::canUploadToProject)
        .orElse(false);
  }

  /** 세션 첨부파일이 속한 프로젝트에 현재 사용자가 접근(조회/다운로드)할 수 있는지 */
  public boolean canAccessTestSessionAttachment(String attachmentId) {
    return testSessionAttachmentRepository
        .findProjectIdByAttachmentId(attachmentId)
        .map(this::canAccessProject)
        .orElse(false);
  }

  /** 세션 첨부파일이 속한 프로젝트를 현재 사용자가 편집(수정/삭제)할 수 있는지 */
  public boolean canEditTestSessionAttachment(String attachmentId) {
    return testSessionAttachmentRepository
        .findProjectIdByAttachmentId(attachmentId)
        .map(this::canEditProject)
        .orElse(false);
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

    // 프로젝트에 접근할 수 있으면 업로드도 가능
    return canAccessProject(projectId, username);
  }

  /** ICT-203: 현재 사용자가 프로젝트에 JUnit XML 파일을 업로드할 수 있는지 확인 */
  public boolean canUploadToProject(String projectId) {
    // 시스템 관리자는 모든 프로젝트에 업로드 가능
    if (securityContextUtil.isSystemAdmin()) {
      return true;
    }

    // 프로젝트에 접근할 수 있으면 업로드도 가능
    return canAccessProject(projectId);
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
}
