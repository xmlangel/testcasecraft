package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 조직 관리 컨트롤러
 * Spring Security @PreAuthorize를 통한 메서드 레벨 보안 적용
 */
@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    /**
     * 새 조직 생성
     * 권한: 인증된 사용자만 가능
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Organization> createOrganization(@RequestParam String name, 
                                                         @RequestParam(required = false) String description) {
        Organization organization = organizationService.createOrganization(name, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(organization);
    }

    /**
     * 사용자가 접근 가능한 조직 목록 조회
     * 권한: 인증된 사용자만 가능
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Organization>> getAccessibleOrganizations() {
        List<Organization> organizations = organizationService.getAccessibleOrganizations();
        return ResponseEntity.ok(organizations);
    }

    /**
     * 조직 상세 정보 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @GetMapping("/{organizationId}")
    @PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
    public ResponseEntity<Organization> getOrganization(@PathVariable String organizationId) {
        Organization organization = organizationService.getOrganization(organizationId);
        return ResponseEntity.ok(organization);
    }

    /**
     * 조직 정보 수정
     * 권한: 조직 관리자 이상 또는 시스템 관리자
     */
    @PutMapping("/{organizationId}")
    @PreAuthorize("@organizationSecurityService.hasManagementRole(#organizationId, authentication.name)")
    public ResponseEntity<Organization> updateOrganization(@PathVariable String organizationId,
                                                         @RequestParam String name,
                                                         @RequestParam(required = false) String description) {
        Organization organization = organizationService.updateOrganization(organizationId, name, description);
        return ResponseEntity.ok(organization);
    }

    /**
     * 조직 삭제
     * 권한: 조직 소유자 또는 시스템 관리자
     */
    @DeleteMapping("/{organizationId}")
    @PreAuthorize("@organizationSecurityService.hasOwnerRole(#organizationId, authentication.name)")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String organizationId) {
        organizationService.deleteOrganization(organizationId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 조직에 멤버 초대
     * 권한: 조직 관리자 이상 또는 시스템 관리자
     */
    @PostMapping("/{organizationId}/members")
    @PreAuthorize("@organizationSecurityService.hasManagementRole(#organizationId, authentication.name)")
    public ResponseEntity<OrganizationUser> inviteMember(@PathVariable String organizationId,
                                                       @RequestParam String username,
                                                       @RequestParam OrganizationUser.OrganizationRole role) {
        OrganizationUser member = organizationService.inviteMember(organizationId, username, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    /**
     * 조직에서 멤버 제거
     * 권한: 조직 관리자 이상 또는 시스템 관리자 (자기 자신은 항상 가능)
     */
    @DeleteMapping("/{organizationId}/members/{userId}")
    @PreAuthorize("@organizationSecurityService.hasManagementRole(#organizationId, authentication.name) or authentication.name == #userId")
    public ResponseEntity<Void> removeMember(@PathVariable String organizationId,
                                           @PathVariable String userId) {
        organizationService.removeMember(organizationId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 멤버 역할 변경
     * 권한: 조직 관리자 이상 또는 시스템 관리자
     */
    @PutMapping("/{organizationId}/members/{userId}/role")
    @PreAuthorize("@organizationSecurityService.hasManagementRole(#organizationId, authentication.name)")
    public ResponseEntity<OrganizationUser> updateMemberRole(@PathVariable String organizationId,
                                                           @PathVariable String userId,
                                                           @RequestParam OrganizationUser.OrganizationRole role) {
        OrganizationUser member = organizationService.updateMemberRole(organizationId, userId, role);
        return ResponseEntity.ok(member);
    }

    /**
     * 조직 멤버 목록 조회
     * 권한: 조직 멤버 또는 시스템 관리자
     */
    @GetMapping("/{organizationId}/members")
    @PreAuthorize("@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
    public ResponseEntity<List<OrganizationUser>> getOrganizationMembers(@PathVariable String organizationId) {
        List<OrganizationUser> members = organizationService.getOrganizationMembers(organizationId);
        return ResponseEntity.ok(members);
    }
}