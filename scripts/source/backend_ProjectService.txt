package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.exception.AccessDeniedException;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.OrganizationSecurityService;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

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

        // 프로젝트 생성
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setOrganization(organization);
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
     * 사용자가 접근 가능한 프로젝트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Project> getAccessibleProjects() {
        String currentUsername = securityContextUtil.getCurrentUsername();
        if (currentUsername == null) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        // 시스템 관리자는 모든 프로젝트 조회 가능
        if (securityContextUtil.isSystemAdmin()) {
            return projectRepository.findAll();
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
        
        return createProject(project.getName(), project.getDescription(), null);
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
        return updateProject(id, dto.getName(), dto.getDescription());
    }
    
    /**
     * 프로젝트 삭제 (기존 deleteProject 호환)
     */
    public Project deleteProject(String id, boolean force) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
        
        deleteProject(id);
        return project;
    }
}
