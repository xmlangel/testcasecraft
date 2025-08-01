// src/main/java/com/testcase/testcasemanagement/controller/ProjectController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.dto.ProjectWithTestCaseCountDto;
import com.testcase.testcasemanagement.mapper.ProjectMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.service.ProjectService;
import com.testcase.testcasemanagement.service.OrganizationService;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.model.ProjectUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid; // 올바른 위치에 있는 import 문

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private TestCaseRepository testCaseRepository;


    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<List<ProjectWithTestCaseCountDto>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        List<ProjectWithTestCaseCountDto> dtos = projects.stream()
                .map(project -> {
                    long testCaseCount = testCaseRepository.countByProjectId(project.getId());
                    return new ProjectWithTestCaseCountDto(project, testCaseCount);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping(value = "")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectDto projectDto) { // @Valid 추가
        System.out.println("createProject 메서드 호출됨: " + projectDto.getName()); // 디버그 로그 유지
        System.out.println("DTO code: " + projectDto.getCode()); // 디버그 로그 추가
        System.out.println("DTO id: " + projectDto.getId()); // 디버그 로그 추가
        System.out.println("DTO description: " + projectDto.getDescription()); // 디버그 로그 추가
        // 기존 수동 코드 필드 검증 로직 제거

        Project project = ProjectMapper.toEntity(projectDto);
        System.out.println("Entity code: " + project.getCode()); // 디버그 로그 추가
        System.out.println("DTO organizationId: " + projectDto.getOrganizationId()); // 디버그 로그 추가
        
        // organizationId가 있으면 Organization 객체 설정
        if (projectDto.getOrganizationId() != null && !projectDto.getOrganizationId().trim().isEmpty()) {
            try {
                // OrganizationService를 통해 조직 존재 여부 확인 및 조직 객체 설정
                Organization organization = organizationService.getOrganization(projectDto.getOrganizationId());
                project.setOrganization(organization);
                System.out.println("Organization 설정 완료: " + organization.getName()); // 디버그 로그
            } catch (Exception e) {
                System.out.println("Organization 설정 실패: " + e.getMessage()); // 디버그 로그
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "유효하지 않은 조직 ID입니다: " + projectDto.getOrganizationId()));
            }
        }
        
        Project savedProject = projectService.saveProject(project);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProjectMapper.toDto(savedProject));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@projectSecurityService.canAccessProject(#id, authentication.name)")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable String id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(value -> ResponseEntity.ok(ProjectMapper.toDto(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#id, authentication.name)")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable String id,
            @RequestBody ProjectDto projectDto) { // ✅ ProjectDto로 받아야 함

        Project updatedProject = projectService.updateProject(id, projectDto);
        return ResponseEntity.ok(ProjectMapper.toDto(updatedProject));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#id, authentication.name)")
    public ResponseEntity<ProjectDto> deleteProject(
            @PathVariable String id,
            @RequestParam(value = "force", defaultValue = "false") boolean force) {
        Project deletedProject = projectService.deleteProject(id, force);
        return ResponseEntity.ok(ProjectMapper.toDto(deletedProject));
    }

    // ===== 조직-프로젝트 관리 API =====

    /**
     * 조직별 프로젝트 목록 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
    public ResponseEntity<List<ProjectWithTestCaseCountDto>> getOrganizationProjects(@PathVariable String organizationId) {
        List<Project> projects = projectService.getOrganizationProjects(organizationId);
        List<ProjectWithTestCaseCountDto> dtos = projects.stream()
                .map(project -> {
                    long testCaseCount = testCaseRepository.countByProjectId(project.getId());
                    return new ProjectWithTestCaseCountDto(project, testCaseCount);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * 조직에 새 프로젝트 생성
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @PostMapping("/organization/{organizationId}")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#organizationId, authentication.name)")
    public ResponseEntity<ProjectDto> createOrganizationProject(@PathVariable String organizationId,
                                                              @RequestParam String name,
                                                              @RequestParam(required = false) String description) {
        Project project = projectService.createProject(name, description, organizationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProjectMapper.toDto(project));
    }

    /**
     * 프로젝트에 멤버 초대
     * 권한: 프로젝트 관리자 이상 또는 시스템 관리자
     */
    @PostMapping("/{projectId}/members")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
    public ResponseEntity<ProjectUser> inviteProjectMember(@PathVariable String projectId,
                                                         @RequestParam String username,
                                                         @RequestParam ProjectUser.ProjectRole role) {
        ProjectUser member = projectService.inviteMember(projectId, username, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    /**
     * 프로젝트에서 멤버 제거
     * 권한: 프로젝트 관리자 이상 또는 시스템 관리자 (자기 자신은 항상 가능)
     */
    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name) or authentication.name == #userId")
    public ResponseEntity<Void> removeProjectMember(@PathVariable String projectId,
                                                   @PathVariable String userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 프로젝트 멤버 역할 변경
     * 권한: 프로젝트 관리자 이상 또는 시스템 관리자
     */
    @PutMapping("/{projectId}/members/{userId}/role")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
    public ResponseEntity<ProjectUser> updateProjectMemberRole(@PathVariable String projectId,
                                                             @PathVariable String userId,
                                                             @RequestParam ProjectUser.ProjectRole role) {
        ProjectUser member = projectService.updateMemberRole(projectId, userId, role);
        return ResponseEntity.ok(member);
    }

    /**
     * 프로젝트 멤버 목록 조회
     * 권한: 프로젝트 멤버 또는 시스템 관리자
     */
    @GetMapping("/{projectId}/members")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<List<ProjectUser>> getProjectMembers(@PathVariable String projectId) {
        List<ProjectUser> members = projectService.getProjectMembers(projectId);
        return ResponseEntity.ok(members);
    }

    /**
     * 프로젝트를 다른 조직으로 이전
     * 권한: 프로젝트 매니저 또는 시스템 관리자
     */
    @PutMapping("/{projectId}/transfer")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
    public ResponseEntity<ProjectDto> transferProject(@PathVariable String projectId,
                                                    @RequestParam(required = false) String newOrganizationId) {
        Project project = projectService.transferProject(projectId, newOrganizationId);
        return ResponseEntity.ok(ProjectMapper.toDto(project));
    }
}
