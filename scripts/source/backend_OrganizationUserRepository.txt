// src/main/java/com/testcase/testcasemanagement/repository/OrganizationUserRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.OrganizationUser;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, String> {
    
    // 기본 관계 검색
    Optional<OrganizationUser> findByOrganizationIdAndUserId(String organizationId, String userId);
    boolean existsByOrganizationIdAndUserId(String organizationId, String userId);
    
    // 조직의 모든 멤버 조회
    List<OrganizationUser> findByOrganizationId(String organizationId);
    
    // 사용자가 속한 모든 조직 조회
    List<OrganizationUser> findByUserId(String userId);
    
    // 특정 역할로 조직 멤버 조회
    List<OrganizationUser> findByOrganizationIdAndRoleInOrganization(String organizationId, OrganizationRole role);
    
    // 사용자가 특정 역할로 속한 조직들 조회
    List<OrganizationUser> findByUserIdAndRoleInOrganization(String userId, OrganizationRole role);
    
    // 조직의 소유자들 조회
    @Query("SELECT ou FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.roleInOrganization = 'OWNER'")
    List<OrganizationUser> findOwnersByOrganizationId(@Param("organizationId") String organizationId);
    
    // 조직의 관리자들 조회 (소유자 + 관리자)
    @Query("SELECT ou FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.roleInOrganization IN ('OWNER', 'ADMIN')")
    List<OrganizationUser> findAdminsByOrganizationId(@Param("organizationId") String organizationId);
    
    // 사용자가 관리 권한을 가진 조직들 조회
    @Query("SELECT ou FROM OrganizationUser ou WHERE ou.user.id = :userId AND ou.roleInOrganization IN ('OWNER', 'ADMIN')")
    List<OrganizationUser> findAdminOrganizationsByUserId(@Param("userId") String userId);
    
    // 사용자의 조직별 역할 조회
    @Query("SELECT ou.roleInOrganization FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.user.id = :userId")
    Optional<OrganizationRole> findRoleByOrganizationIdAndUserId(@Param("organizationId") String organizationId, @Param("userId") String userId);
    
    // 조직에서 사용자 제거
    void deleteByOrganizationIdAndUserId(String organizationId, String userId);
    
    // 조직의 모든 멤버 제거
    void deleteByOrganizationId(String organizationId);
    
    // 사용자의 모든 조직 관계 제거
    void deleteByUserId(String userId);
    
    // 역할별 멤버 수 조회
    @Query("SELECT COUNT(ou) FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.roleInOrganization = :role")
    long countByOrganizationIdAndRole(@Param("organizationId") String organizationId, @Param("role") OrganizationRole role);
    
    // 조직의 총 멤버 수 조회
    long countByOrganizationId(String organizationId);
    
    // 사용자가 속한 조직 수 조회
    long countByUserId(String userId);
    
    // 최근 가입한 멤버들 조회
    @Query("SELECT ou FROM OrganizationUser ou WHERE ou.organization.id = :organizationId ORDER BY ou.createdAt DESC")
    List<OrganizationUser> findRecentMembersByOrganizationId(@Param("organizationId") String organizationId, 
                                                            org.springframework.data.domain.Pageable pageable);
    
    // 사용자가 특정 조직에서 관리 권한을 가지는지 확인
    @Query("SELECT COUNT(ou) > 0 FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.user.id = :userId AND ou.roleInOrganization IN ('OWNER', 'ADMIN')")
    boolean hasAdminRole(@Param("organizationId") String organizationId, @Param("userId") String userId);
}