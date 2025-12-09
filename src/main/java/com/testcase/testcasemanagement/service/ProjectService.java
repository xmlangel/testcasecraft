package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.exception.AccessDeniedException;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectUserRepository projectUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectSecurityService projectSecurityService;

    @Autowired
    private OrganizationSecurityService organizationSecurityService;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private TestPlanRepository testPlanRepository;

    @Autowired
    private TestExecutionRepository testExecutionRepository;

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private com.testcase.testcasemanagement.repository.RagChatThreadRepository ragChatThreadRepository;

    @Autowired
    private com.testcase.testcasemanagement.repository.DisplayIdHistoryRepository displayIdHistoryRepository;

    /**
     * 새 프로젝트 생성
     */
    public Project createProject(String name, String description, String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 조직에 속한 프로젝트인 경우 조직 생성 권한 확인
        Organization organization = null;
        if (organizationId != null) {
            if (!projectSecurityService.canCreateProject(organizationId, currentUsername)) {
                throw new AccessDeniedException("해당 조직에 프로젝트를 생성할 권한이 없습니다.");
            }
            organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));
        }

        // 프로젝트 코드 자동 생성
        String code = generateUniqueProjectCode(name);

        // 프로젝트 생성
        Project project = new Project();
        project.setName(name);
        project.setCode(code);
        project.setDescription(description);
        project.setOrganization(organization);
        project.setDisplayOrder(0);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project = projectRepository.save(project);

        // 생성자를 프로젝트 매니저로 추가
        ProjectUser projectUser = new ProjectUser();
        projectUser.setProject(project);
        projectUser.setUser(currentUser);
        projectUser.setRoleInProject(ProjectUser.ProjectRole.PROJECT_MANAGER);
        projectUser.setCreatedAt(LocalDateTime.now());
        projectUser.setUpdatedAt(LocalDateTime.now());
        projectUserRepository.save(projectUser);

        return project;
    }

    /**
     * 프로젝트 이름을 기반으로 고유한 코드 생성
     */
    private String generateUniqueProjectCode(String name) {
        // 이름을 기반으로 기본 코드 생성 (영문자, 숫자, 하이픈만 허용)
        String baseCode = name.trim()
                .replaceAll("[^a-zA-Z0-9가-힣\\s]", "") // 특수문자 제거 (한글 포함)
                .replaceAll("\\s+", "-") // 공백을 하이픈으로 변경
                .toUpperCase();

        // 한글이 포함된 경우 영문으로 변환
        if (baseCode.matches(".*[가-힣].*")) {
            baseCode = convertKoreanToEnglish(baseCode);
        }

        // 코드 길이 제한 (최대 20자)
        if (baseCode.length() > 20) {
            baseCode = baseCode.substring(0, 20);
        }

        // 빈 코드인 경우 기본값 사용
        if (baseCode.isEmpty()) {
            baseCode = "PROJECT";
        }

        // 중복 검사 및 고유 코드 생성
        String uniqueCode = baseCode;
        int counter = 1;
        while (projectRepository.existsByCode(uniqueCode)) {
            uniqueCode = baseCode + "-" + counter;
            counter++;
            // 무한루프 방지
            if (counter > 999) {
                uniqueCode = baseCode + "-" + System.currentTimeMillis();
                break;
            }
        }

        return uniqueCode;
    }

    /**
     * 한글을 영문으로 간단 변환 (기본적인 매핑)
     */
    private String convertKoreanToEnglish(String korean) {
        return korean
                .replace("테스트", "TEST")
                .replace("프로젝트", "PROJECT")
                .replace("개발", "DEV")
                .replace("시스템", "SYSTEM")
                .replace("관리", "MGMT")
                .replace("서비스", "SERVICE")
                .replace("웹", "WEB")
                .replace("모바일", "MOBILE")
                .replace("앱", "APP")
                .replace("API", "API")
                .replace("버그", "BUG")
                .replace("추적", "TRACK")
                .replace("품질", "QA")
                .replace("보증", "ASSURANCE")
                .replaceAll("[가-힣]", ""); // 매핑되지 않은 한글 제거
    }

    /**
     * 사용자가 접근 가능한 프로젝트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Project> getAccessibleProjects() {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 시스템 관리자는 모든 프로젝트 조회 가능 (조직 정보 포함)
        if (securityContextUtil.isSystemAdmin()) {
            return projectRepository.findAllWithOrganization();
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 사용자가 접근 가능한 프로젝트 목록 조회 (직접 멤버 + 조직 멤버십을 통한 접근)
        return projectRepository.findAccessibleProjectsByUserId(currentUser.getId());
    }

    /**
     * 조직별 프로젝트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Project> getOrganizationProjects(String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 조직 접근 권한 확인
        if (!organizationSecurityService.canAccessOrganization(organizationId, currentUsername)) {
            throw new AccessDeniedException("조직의 프로젝트 목록을 조회할 권한이 없습니다.");
        }

        return projectRepository.findByOrganizationId(organizationId);
    }

    /**
     * 프로젝트 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public Project getProject(String projectId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 접근 권한 확인
        if (!projectSecurityService.canAccessProject(projectId, currentUsername)) {
            throw new AccessDeniedException("프로젝트에 접근할 권한이 없습니다.");
        }

        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
    }

    /**
     * 프로젝트 정보 수정
     */
    public Project updateProject(String projectId, String name, String description) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 관리 권한 확인
        if (!projectSecurityService.canManageProject(projectId, currentUsername)) {
            throw new AccessDeniedException("프로젝트를 수정할 권한이 없습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        project.setName(name);
        project.setDescription(description);
        project.setUpdatedAt(LocalDateTime.now());

        return projectRepository.save(project);
    }

    /**
     * 프로젝트 삭제
     */
    public void deleteProject(String projectId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 프로젝트 매니저 권한 또는 시스템 관리자 권한 확인
        if (!projectSecurityService.isProjectManager(projectId, currentUsername)
                && !securityContextUtil.isSystemAdmin()) {
            throw new AccessDeniedException("프로젝트를 삭제할 권한이 없습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        // 연관된 멤버 관계 먼저 삭제
        projectUserRepository.deleteByProjectId(projectId);

        // 프로젝트 삭제
        projectRepository.delete(project);
    }

    /**
     * 프로젝트에 멤버 초대
     */
    public ProjectUser inviteMember(String projectId, String username, ProjectUser.ProjectRole role) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 멤버 초대 권한 확인
        if (!projectSecurityService.canInviteMembers(projectId, currentUsername)) {
            throw new AccessDeniedException("멤버를 초대할 권한이 없습니다.");
        }

        // 초대할 사용자 존재 확인
        User invitedUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("초대할 사용자를 찾을 수 없습니다."));

        // 프로젝트 존재 확인
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        // 이미 멤버인지 확인
        Optional<ProjectUser> existingMember = projectUserRepository
                .findByProjectIdAndUserId(projectId, invitedUser.getId());
        if (existingMember.isPresent()) {
            throw new IllegalArgumentException("이미 프로젝트의 멤버입니다.");
        }

        // 프로젝트 매니저 역할은 현재 프로젝트 매니저만 부여 가능
        if (role == ProjectUser.ProjectRole.PROJECT_MANAGER) {
            if (!projectSecurityService.isProjectManager(projectId, currentUsername)) {
                throw new AccessDeniedException("프로젝트 매니저 권한을 부여할 수 없습니다.");
            }
        }

        // 멤버 추가
        ProjectUser projectUser = new ProjectUser();
        projectUser.setProject(project);
        projectUser.setUser(invitedUser);
        projectUser.setRoleInProject(role);
        projectUser.setCreatedAt(LocalDateTime.now());
        projectUser.setUpdatedAt(LocalDateTime.now());

        return projectUserRepository.save(projectUser);
    }

    /**
     * 프로젝트에서 멤버 제거
     */
    public void removeMember(String projectId, String targetUserId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 멤버 제거 권한 확인
        if (!projectSecurityService.canRemoveMember(projectId, targetUserId, currentUsername)) {
            throw new AccessDeniedException("멤버를 제거할 권한이 없습니다.");
        }

        ProjectUser projectUser = projectUserRepository
                .findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트 멤버를 찾을 수 없습니다."));

        projectUserRepository.delete(projectUser);
    }

    /**
     * 멤버 역할 변경
     */
    public ProjectUser updateMemberRole(String projectId, String targetUserId, ProjectUser.ProjectRole newRole) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 관리 권한 확인
        if (!projectSecurityService.canManageProject(projectId, currentUsername)) {
            throw new AccessDeniedException("멤버 역할을 변경할 권한이 없습니다.");
        }

        ProjectUser projectUser = projectUserRepository
                .findByProjectIdAndUserId(projectId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트 멤버를 찾을 수 없습니다."));

        // 프로젝트 매니저 역할 변경은 현재 프로젝트 매니저만 가능
        if (newRole == ProjectUser.ProjectRole.PROJECT_MANAGER ||
                projectUser.getRoleInProject() == ProjectUser.ProjectRole.PROJECT_MANAGER) {
            if (!projectSecurityService.isProjectManager(projectId, currentUsername)) {
                throw new AccessDeniedException("프로젝트 매니저 권한과 관련된 변경을 할 수 없습니다.");
            }
        }

        projectUser.setRoleInProject(newRole);
        projectUser.setUpdatedAt(LocalDateTime.now());

        return projectUserRepository.save(projectUser);
    }

    /**
     * 프로젝트를 다른 조직으로 이전
     */
    public Project transferProject(String projectId, String newOrganizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 프로젝트 매니저 권한 또는 시스템 관리자 권한 확인
        if (!projectSecurityService.isProjectManager(projectId, currentUsername)
                && !securityContextUtil.isSystemAdmin()) {
            throw new AccessDeniedException("프로젝트를 이전할 권한이 없습니다.");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        // 새 조직에 프로젝트 생성 권한 확인
        if (newOrganizationId != null) {
            if (!projectSecurityService.canCreateProject(newOrganizationId, currentUsername)) {
                throw new AccessDeniedException("대상 조직에 프로젝트를 생성할 권한이 없습니다.");
            }

            Organization newOrganization = organizationRepository.findById(newOrganizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("대상 조직을 찾을 수 없습니다."));

            project.setOrganization(newOrganization);
        } else {
            // 조직에서 독립 프로젝트로 변경
            project.setOrganization(null);
        }

        project.setUpdatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }

    /**
     * 프로젝트 멤버 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ProjectUser> getProjectMembers(String projectId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 접근 권한 확인
        if (!projectSecurityService.canAccessProject(projectId, currentUsername)) {
            throw new AccessDeniedException("프로젝트 멤버 목록을 조회할 권한이 없습니다.");
        }

        return projectUserRepository.findByProjectId(projectId);
    }

    // ===== 기존 코드와의 호환성을 위한 메서드들 =====

    /**
     * 모든 프로젝트 조회 (기존 getAllProjects 호환)
     */
    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return getAccessibleProjects();
    }

    /**
     * 프로젝트 저장 (기존 saveProject 호환)
     */
    public Project saveProject(Project project) {
        if (project.getName() == null || project.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("프로젝트 이름이 필요합니다.");
        }

        if (project.getCode() == null || project.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("프로젝트 코드가 필요합니다.");
        }

        // 새 프로젝트 생성 (ID가 없는 경우)
        if (project.getId() == null || project.getId().trim().isEmpty()) {
            String organizationId = project.getOrganization() != null ? project.getOrganization().getId() : null;
            return createProjectWithCode(project.getName(), project.getCode(), project.getDescription(),
                    organizationId);
        } else {
            // 기존 프로젝트 업데이트
            return updateProjectEntity(project);
        }
    }

    /**
     * 코드를 포함한 프로젝트 생성
     */
    public Project createProjectWithCode(String name, String code, String description, String organizationId) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 코드 중복 검사
        if (projectRepository.existsByCode(code)) {
            throw new DataIntegrityViolationException("이미 사용 중인 프로젝트 코드입니다: " + code);
        }

        // 조직에 속한 프로젝트인 경우 조직 생성 권한 확인
        Organization organization = null;
        if (organizationId != null) {
            if (!projectSecurityService.canCreateProject(organizationId, currentUsername)) {
                throw new AccessDeniedException("해당 조직에 프로젝트를 생성할 권한이 없습니다.");
            }
            organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));
        }

        // 새 프로젝트 생성
        Project project = new Project();
        project.setName(name);
        project.setCode(code);
        project.setDescription(description);
        project.setOrganization(organization);
        project.setDisplayOrder(0);

        Project savedProject = projectRepository.save(project);

        // 현재 사용자를 프로젝트 매니저로 자동 등록
        ProjectUser projectUser = new ProjectUser();
        projectUser.setProject(savedProject);
        projectUser.setUser(currentUser);
        projectUser.setRoleInProject(ProjectUser.ProjectRole.PROJECT_MANAGER);
        projectUserRepository.save(projectUser);

        return savedProject;
    }

    /**
     * 기존 프로젝트 엔티티 업데이트
     */
    private Project updateProjectEntity(Project project) {
        // 기존 프로젝트 조회
        Project existingProject = projectRepository.findById(project.getId())
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        // 필드 업데이트
        existingProject.setName(project.getName());
        existingProject.setCode(project.getCode());
        existingProject.setDescription(project.getDescription());
        existingProject.setDisplayOrder(project.getDisplayOrder());

        return projectRepository.save(existingProject);
    }

    /**
     * 프로젝트 ID로 조회 (기존 getProjectById 호환)
     */
    @Transactional(readOnly = true)
    public Optional<Project> getProjectById(String id) {
        try {
            Project project = getProject(id);
            return Optional.of(project);
        } catch (AccessDeniedException | ResourceNotFoundException e) {
            return Optional.empty();
        }
    }

    /**
     * 프로젝트 업데이트 (기존 updateProject 호환)
     */
    public Project updateProject(String id, com.testcase.testcasemanagement.dto.ProjectDto dto) {
        // 기존 프로젝트 조회
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        // 코드 변경 시 중복 검증 및 DisplayID 업데이트
        if (dto.getCode() != null && !dto.getCode().equals(existingProject.getCode())) {
            // 중복 검증
            if (projectRepository.existsByCode(dto.getCode())) {
                throw new DataIntegrityViolationException("이미 사용 중인 프로젝트 코드입니다: " + dto.getCode());
            }

            String oldCode = existingProject.getCode();
            String newCode = dto.getCode();

            // 코드 변경 로그
            System.out.println("🔄 프로젝트 코드 변경: " + oldCode + " -> " + newCode + " (프로젝트 ID: " + id + ")");

            // 프로젝트 코드 업데이트
            existingProject.setCode(newCode);

            // 모든 테스트 케이스의 DisplayID 자동 업데이트 (히스토리 저장 포함)
            updateAllTestCaseDisplayIds(id, oldCode, newCode);
        }

        // 필드 업데이트
        existingProject.setName(dto.getName());
        existingProject.setDescription(dto.getDescription());

        // 조직 변경 처리
        if (dto.getOrganizationId() != null && !dto.getOrganizationId().trim().isEmpty()) {
            // 새로운 조직으로 이전
            Organization newOrganization = organizationRepository.findById(dto.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다."));
            existingProject.setOrganization(newOrganization);
        } else {
            // 독립 프로젝트로 변경
            existingProject.setOrganization(null);
        }

        return projectRepository.save(existingProject);
    }

    /**
     * 프로젝트 삭제 (force 파라미터 활용)
     */
    public Project deleteProject(String id, boolean force) {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 프로젝트 매니저 권한 또는 시스템 관리자 권한 확인
        if (!projectSecurityService.isProjectManager(id, currentUsername)
                && !securityContextUtil.isSystemAdmin()) {
            throw new AccessDeniedException("프로젝트를 삭제할 권한이 없습니다.");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        if (force) {
            // 강제 삭제: 모든 연관 데이터와 함께 삭제
            System.out.println("🚨 강제 삭제 시작: " + project.getName() + " (ID: " + id + ")");

            try {
                // 0. RAG 관련 데이터 삭제 (가장 먼저 삭제)
                // rag_chat_thread_categories 조인 테이블 삭제
                int ragThreadCategoriesDeleted = entityManager.createNativeQuery(
                        "DELETE FROM rag_chat_thread_categories WHERE thread_id IN " +
                                "(SELECT id FROM rag_chat_threads WHERE project_id = :projectId)")
                        .setParameter("projectId", id)
                        .executeUpdate();
                System.out.println("   ✅ RAG 채팅 스레드 카테고리 " + ragThreadCategoriesDeleted + "개 삭제 완료");

                // rag_chat_messages 삭제 (채팅 스레드의 메시지)
                int ragMessagesDeleted = entityManager.createNativeQuery(
                        "DELETE FROM rag_chat_messages WHERE thread_id IN " +
                                "(SELECT id FROM rag_chat_threads WHERE project_id = :projectId)")
                        .setParameter("projectId", id)
                        .executeUpdate();
                System.out.println("   ✅ RAG 채팅 메시지 " + ragMessagesDeleted + "개 삭제 완료");

                // rag_chat_threads 삭제
                ragChatThreadRepository.deleteByProject_Id(id);
                System.out.println("   ✅ RAG 채팅 스레드 삭제 완료");

                // 1. @ElementCollection 태그 테이블 먼저 삭제
                // test_result_tags 삭제
                int resultTagsDeleted = entityManager.createNativeQuery(
                        "DELETE FROM test_result_tags WHERE test_result_id IN " +
                                "(SELECT tr.id FROM test_results tr " +
                                "JOIN test_executions te ON tr.test_execution_id = te.id " +
                                "WHERE te.project_id = :projectId)")
                        .setParameter("projectId", id)
                        .executeUpdate();
                System.out.println("   ✅ 테스트 결과 태그 " + resultTagsDeleted + "개 삭제 완료");

                // test_execution_tags 삭제
                int executionTagsDeleted = entityManager.createNativeQuery(
                        "DELETE FROM test_execution_tags WHERE test_execution_id IN " +
                                "(SELECT id FROM test_executions WHERE project_id = :projectId)")
                        .setParameter("projectId", id)
                        .executeUpdate();
                System.out.println("   ✅ 테스트 실행 태그 " + executionTagsDeleted + "개 삭제 완료");

                // 2. 테스트 결과 첨부파일 삭제 (test_results보다 먼저 삭제 필요)
                int attachmentsDeleted = entityManager.createNativeQuery(
                        "DELETE FROM test_result_attachments WHERE test_result_id IN " +
                                "(SELECT tr.id FROM test_results tr " +
                                "JOIN test_executions te ON tr.test_execution_id = te.id " +
                                "WHERE te.project_id = :projectId)")
                        .setParameter("projectId", id)
                        .executeUpdate();
                System.out.println("   ✅ 테스트 결과 첨부파일 " + attachmentsDeleted + "개 삭제 완료");

                // 3. 테스트 결과 삭제
                testResultRepository.deleteByProjectId(id);
                System.out.println("   ✅ 테스트 결과 삭제 완료");

                // 4. 테스트 실행 삭제
                long executionCount = testExecutionRepository.countByProjectId(id);
                if (executionCount > 0) {
                    testExecutionRepository.deleteByProjectId(id);
                    System.out.println("   ✅ 테스트 실행 " + executionCount + "개 삭제됨");
                }

                // 5. 테스트 플랜 삭제
                long planCount = testPlanRepository.countByProjectId(id);
                if (planCount > 0) {
                    testPlanRepository.deleteByProjectId(id);
                    System.out.println("   ✅ 테스트 플랜 " + planCount + "개 삭제됨");
                }

                // 6. 테스트 케이스 삭제
                long caseCount = testCaseRepository.countByProjectId(id);
                if (caseCount > 0) {
                    testCaseRepository.deleteByProjectId(id);
                    System.out.println("   ✅ 테스트 케이스 " + caseCount + "개 삭제됨");
                }

                // 7. 프로젝트 멤버 관계 삭제
                projectUserRepository.deleteByProjectId(id);

                // 8. 프로젝트 삭제
                projectRepository.delete(project);
                System.out.println("🎉 강제 삭제 완료: " + project.getName());

            } catch (Exception e) {
                System.err.println("❌ 강제 삭제 실패: " + e.getMessage());
                throw new RuntimeException("프로젝트 강제 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
            }
        } else {
            // 일반 삭제: 연관 데이터 있으면 실패
            long testCaseCount = testCaseRepository.countByProjectId(id);
            long testPlanCount = testPlanRepository.countByProjectId(id);
            long testExecutionCount = testExecutionRepository.countByProjectId(id);

            if (testCaseCount > 0 || testPlanCount > 0 || testExecutionCount > 0) {
                throw new DataIntegrityViolationException(
                        String.format("프로젝트에 연관 데이터가 존재합니다. (테스트케이스: %d개, 테스트플랜: %d개, 테스트실행: %d개) 강제 삭제를 사용하세요.",
                                testCaseCount, testPlanCount, testExecutionCount));
            }

            // 연관된 멤버 관계 삭제 후 프로젝트 삭제
            projectUserRepository.deleteByProjectId(id);
            projectRepository.delete(project);
        }

        return project;
    }

    /**
     * 프로젝트 코드 변경 시 모든 테스트 케이스의 DisplayID를 업데이트하고 히스토리를 저장합니다.
     * 
     * @param projectId 프로젝트 ID
     * @param oldCode   이전 프로젝트 코드
     * @param newCode   새 프로젝트 코드
     */
    private void updateAllTestCaseDisplayIds(String projectId, String oldCode, String newCode) {
        List<com.testcase.testcasemanagement.model.TestCase> testCases = testCaseRepository.findByProjectId(projectId);

        if (testCases.isEmpty()) {
            System.out.println("   ℹ️  업데이트할 테스트 케이스가 없습니다.");
            return;
        }

        List<com.testcase.testcasemanagement.model.DisplayIdHistory> histories = new ArrayList<>();
        List<com.testcase.testcasemanagement.model.TestCase> updatedTestCases = new ArrayList<>();
        int updateCount = 0;

        // 1단계: DisplayID 업데이트 및 히스토리 객체 생성
        for (com.testcase.testcasemanagement.model.TestCase testCase : testCases) {
            if (testCase.getDisplayId() != null && testCase.getDisplayId().startsWith(oldCode + "-")) {
                String oldDisplayId = testCase.getDisplayId();
                // OLD-CODE-001 -> NEW-CODE-001
                String newDisplayId = oldDisplayId.replaceFirst("^" + java.util.regex.Pattern.quote(oldCode), newCode);

                // DisplayID 업데이트
                testCase.setDisplayId(newDisplayId);

                // ICT-373: version이 null인 경우 0으로 초기화 (Hibernate Versioning 오류 방지)
                if (testCase.getVersion() == null) {
                    testCase.setVersion(0L);
                }

                // 변경된 테스트 케이스만 별도 리스트에 추가
                updatedTestCases.add(testCase);

                // 히스토리 객체 생성 (아직 저장하지 않음)
                com.testcase.testcasemanagement.model.DisplayIdHistory history = new com.testcase.testcasemanagement.model.DisplayIdHistory();
                history.setTestCase(testCase);
                history.setOldDisplayId(oldDisplayId);
                history.setNewDisplayId(newDisplayId);
                history.setChangedReason("프로젝트 코드 변경: " + oldCode + " -> " + newCode);
                histories.add(history);

                updateCount++;
            }
        }

        if (updateCount > 0) {
            // 2단계: 변경된 TestCase만 저장하여 영속화
            testCaseRepository.saveAll(updatedTestCases);

            // 3단계: 영속화된 TestCase를 참조하는 히스토리 저장
            displayIdHistoryRepository.saveAll(histories);

            System.out.println("   ✅ 프로젝트 " + projectId + " - " + updateCount +
                    " 개의 테스트 케이스 DisplayID 업데이트 및 히스토리 저장 완료");
        } else {
            System.out.println("   ℹ️  DisplayID 업데이트가 필요한 테스트 케이스가 없습니다.");
        }
    }
}
