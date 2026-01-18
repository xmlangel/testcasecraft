// src/main/java/com/testcase/testcasemanagement/repository/ProjectUserRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectUserRepository extends JpaRepository<ProjectUser, String> {
    
    // 기본 관계 검색
    Optional<ProjectUser> findByProjectIdAndUserId(String projectId, String userId);
    boolean existsByProjectIdAndUserId(String projectId, String userId);
    
    // 프로젝트의 모든 멤버 조회
    List<ProjectUser> findByProjectId(String projectId);
    
    // 사용자가 참여한 모든 프로젝트 조회
    List<ProjectUser> findByUserId(String userId);
    
    // 특정 역할로 프로젝트 멤버 조회
    List<ProjectUser> findByProjectIdAndRoleInProject(String projectId, ProjectRole role);
    
    // 사용자가 특정 역할로 참여한 프로젝트들 조회
    List<ProjectUser> findByUserIdAndRoleInProject(String userId, ProjectRole role);
    
    // 프로젝트 매니저들 조회
    @Query("SELECT pu FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.roleInProject = 'PROJECT_MANAGER'")
    List<ProjectUser> findManagersByProjectId(@Param("projectId") String projectId);
    
    // 프로젝트의 관리 권한을 가진 멤버들 조회 (PM + 리드)
    @Query("SELECT pu FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.roleInProject IN ('PROJECT_MANAGER', 'LEAD_DEVELOPER')")
    List<ProjectUser> findManagersAndLeadsByProjectId(@Param("projectId") String projectId);
    
    // 사용자가 관리 권한을 가진 프로젝트들 조회
    @Query("SELECT pu FROM ProjectUser pu WHERE pu.user.id = :userId AND pu.roleInProject IN ('PROJECT_MANAGER', 'LEAD_DEVELOPER')")
    List<ProjectUser> findManagedProjectsByUserId(@Param("userId") String userId);
    
    // 사용자의 프로젝트별 역할 조회
    @Query("SELECT pu.roleInProject FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.user.id = :userId")
    Optional<ProjectRole> findRoleByProjectIdAndUserId(@Param("projectId") String projectId, @Param("userId") String userId);
    
    // 프로젝트에서 사용자 제거
    void deleteByProjectIdAndUserId(String projectId, String userId);
    
    // 프로젝트의 모든 멤버 제거
    void deleteByProjectId(String projectId);
    
    // 사용자의 모든 프로젝트 관계 제거
    void deleteByUserId(String userId);
    
    // 역할별 멤버 수 조회
    @Query("SELECT COUNT(pu) FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.roleInProject = :role")
    long countByProjectIdAndRole(@Param("projectId") String projectId, @Param("role") ProjectRole role);
    
    // 프로젝트의 총 멤버 수 조회
    long countByProjectId(String projectId);
    
    // 사용자가 참여한 프로젝트 수 조회
    long countByUserId(String userId);
    
    // 최근 참여한 멤버들 조회
    @Query("SELECT pu FROM ProjectUser pu WHERE pu.project.id = :projectId ORDER BY pu.createdAt DESC")
    List<ProjectUser> findRecentMembersByProjectId(@Param("projectId") String projectId, 
                                                  org.springframework.data.domain.Pageable pageable);
    
    // 사용자가 특정 프로젝트에서 관리 권한을 가지는지 확인
    @Query("SELECT COUNT(pu) > 0 FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.user.id = :userId AND pu.roleInProject IN ('PROJECT_MANAGER', 'LEAD_DEVELOPER')")
    boolean hasManagementRole(@Param("projectId") String projectId, @Param("userId") String userId);
    
    // 사용자가 특정 프로젝트에서 편집 권한을 가지는지 확인
    @Query("SELECT COUNT(pu) > 0 FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.user.id = :userId AND pu.roleInProject IN ('PROJECT_MANAGER', 'LEAD_DEVELOPER', 'DEVELOPER', 'CONTRIBUTOR')")
    boolean hasEditRole(@Param("projectId") String projectId, @Param("userId") String userId);
    
    // 조직의 프로젝트들에 참여한 사용자들 조회
    @Query("SELECT DISTINCT pu FROM ProjectUser pu WHERE pu.project.organization.id = :organizationId")
    List<ProjectUser> findByOrganizationId(@Param("organizationId") String organizationId);
    
    // 조직 없는 프로젝트들에 참여한 사용자들 조회
    @Query("SELECT pu FROM ProjectUser pu WHERE pu.project.organization IS NULL")
    List<ProjectUser> findByIndependentProjects();
}