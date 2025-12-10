package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.CreateOrganizationRequest;
import com.testcase.testcasemanagement.dto.UpdateOrganizationRequest;
import com.testcase.testcasemanagement.dto.InviteMemberRequest;
import com.testcase.testcasemanagement.dto.UpdateMemberRoleRequest;
import com.testcase.testcasemanagement.dto.TransferOwnershipRequest;
import com.testcase.testcasemanagement.dto.ProjectWithTestCaseCountDto;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.service.OrganizationService;
import com.testcase.testcasemanagement.service.ProjectService;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

/**
 * 조직 관리 컨트롤러
 * Spring Security @PreAuthorize를 통한 메서드 레벨 보안 적용
 */
@Tag(name = "User - Organization Management", description = "조직 관리 API")
@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TestCaseRepository testCaseRepository;

    /**
     * 새 조직 생성
     * 권한: 시스템 관리자만 가능
     */
    @Operation(summary = "조직 생성", description = "새로운 조직을 생성합니다. (시스템 관리자 전용)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Organization> createOrganization(@RequestBody CreateOrganizationRequest request) {
        Organization organization = organizationService.createOrganization(request.getName(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(organization);
    }

    /**
     * 사용자가 접근 가능한 조직 목록 조회
     * 권한: 인증된 사용자만 가능
     */
    @Operation(summary = "접근 가능한 조직 조회", description = "사용자가 속하거나 접근 가능한 모든 조직 목록을 조회합니다.")
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('TESTER') or hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TESTER')")
    public ResponseEntity<List<Organization>> getAccessibleOrganizations() {
        List<Organization> organizations = organizationService.getAccessibleOrganizations();
        return ResponseEntity.ok(organizations);
    }

    /**
     * 조직 상세 정보 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @Operation(summary = "조직 상세 조회", description = "특정 조직의 상세 정보를 조회합니다.")
    @GetMapping("/{organizationId}")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#organizationId, authentication.name)")
    public ResponseEntity<Organization> getOrganization(@PathVariable String organizationId) {
        Organization organization = organizationService.getOrganization(organizationId);
        return ResponseEntity.ok(organization);
    }

    /**
     * 조직 정보 수정
     * 권한: 조직 관리자 이상 또는 시스템 관리자
     */
    @Operation(summary = "조직 정보 수정", description = "조직의 이름 및 설명을 수정합니다.")
    @PutMapping("/{organizationId}")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#organizationId, authentication.name)")
    public ResponseEntity<Organization> updateOrganization(@PathVariable String organizationId,
            @RequestBody UpdateOrganizationRequest request) {
        Organization organization = organizationService.updateOrganization(organizationId, request.getName(),
                request.getDescription());
        return ResponseEntity.ok(organization);
    }

    /**
     * 조직 삭제
     * 권한: 조직 소유자 또는 시스템 관리자
     * 
     * @param organizationId 삭제할 조직 ID
     * @param force          강제 삭제 여부 (true: 프로젝트 포함 강제 삭제, false: 일반 삭제)
     */
    @Operation(summary = "조직 삭제", description = "특정 조직을 삭제합니다. (강제 삭제 옵션 지원)")
    @DeleteMapping("/{organizationId}")
    @PreAuthorize("@organizationSecurityService.canDeleteOrganization(#organizationId, authentication.name)")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String organizationId,
            @RequestParam(value = "force", defaultValue = "false") boolean force) {
        organizationService.deleteOrganization(organizationId, force);
        return ResponseEntity.noContent().build();
    }

    /**
     * 조직에 멤버 초대
     * 권한: 조직 관리자 이상 또는 시스템 관리자
     */
    @Operation(summary = "조직 멤버 초대", description = "조직에 새로운 멤버를 초대합니다.")
    @PostMapping("/{organizationId}/members")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#organizationId, authentication.name)")
    public ResponseEntity<OrganizationUser> inviteMember(@PathVariable String organizationId,
            @RequestBody InviteMemberRequest request) {
        OrganizationUser member = organizationService.inviteMember(organizationId, request.getUsername(),
                request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    /**
     * 조직에서 멤버 제거
     * 권한: 조직 관리자 이상 또는 시스템 관리자 (자기 자신은 항상 가능)
     */
    @Operation(summary = "조직 멤버 제거", description = "조직에서 멤버를 제거합니다.")
    @DeleteMapping("/{organizationId}/members/{userId}")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#organizationId, authentication.name) or authentication.name == #userId")
    public ResponseEntity<Void> removeMember(@PathVariable String organizationId,
            @PathVariable String userId) {
        organizationService.removeMember(organizationId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 멤버 역할 변경
     * 권한: 조직 관리자 이상 또는 시스템 관리자
     */
    @Operation(summary = "조직 멤버 역할 변경", description = "조직 멤버의 역할을 변경합니다.")
    @PutMapping("/{organizationId}/members/{userId}/role")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#organizationId, authentication.name)")
    public ResponseEntity<OrganizationUser> updateMemberRole(@PathVariable String organizationId,
            @PathVariable String userId,
            @RequestBody UpdateMemberRoleRequest request) {
        OrganizationUser member = organizationService.updateMemberRole(organizationId, userId, request.getRole());
        return ResponseEntity.ok(member);
    }

    /**
     * 조직 소유권 이전
     * 권한: 조직 소유자 또는 시스템 관리자
     */
    @Operation(summary = "조직 소유권 이전", description = "조직의 소유권을 다른 사용자에게 이전합니다.")
    @PostMapping("/{organizationId}/transfer-ownership")
    @PreAuthorize("@organizationSecurityService.isOrganizationOwner(#organizationId, authentication.name) or hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Organization> transferOwnership(@PathVariable String organizationId,
            @RequestBody TransferOwnershipRequest request) {
        Organization organization = organizationService.transferOwnership(organizationId, request.getNewOwnerUserId());
        return ResponseEntity.ok(organization);
    }

    /**
     * 조직 멤버 목록 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @Operation(summary = "조직 멤버 조회", description = "조직에 속한 모든 멤버 목록을 조회합니다.")
    @GetMapping("/{organizationId}/members")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#organizationId, authentication.name)")
    public ResponseEntity<List<OrganizationUser>> getOrganizationMembers(@PathVariable String organizationId) {
        List<OrganizationUser> members = organizationService.getOrganizationMembers(organizationId);
        return ResponseEntity.ok(members);
    }

    /**
     * 조직의 프로젝트 목록 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @Operation(summary = "조직 프로젝트 조회", description = "조직에 속한 프로젝트 목록과 테스트 케이스 수를 조회합니다.")
    @GetMapping("/{organizationId}/projects")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#organizationId, authentication.name)")
    public ResponseEntity<List<ProjectWithTestCaseCountDto>> getOrganizationProjects(
            @PathVariable String organizationId) {
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
     * 조직의 그룹 목록 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @Operation(summary = "조직 그룹 조회", description = "조직에 속한 그룹 목록을 조회합니다. (미구현)")
    @GetMapping("/{organizationId}/groups")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#organizationId, authentication.name)")
    public ResponseEntity<List<Object>> getOrganizationGroups(@PathVariable String organizationId) {
        // 현재는 빈 배열 반환 (향후 구현 예정)
        return ResponseEntity.ok(List.of());
    }
}