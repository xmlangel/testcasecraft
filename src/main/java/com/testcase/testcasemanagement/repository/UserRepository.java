// src/main/java/com/testcase/testcasemanagement/repository/UserRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    // 기존 메서드들
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    
    // 추가 검색 메서드들
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // 이름으로 사용자 검색
    List<User> findByNameContainingIgnoreCase(String name);
    
    // 역할별 사용자 조회
    List<User> findByRole(String role);
    
    // 사용자 검색 (이름, 사용자명, 이메일로 - password 필드 제외)
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchByKeyword(@Param("keyword") String keyword);
    
    // 조직의 멤버들 조회
    @Query("SELECT DISTINCT ou.user FROM OrganizationUser ou WHERE ou.organization.id = :organizationId")
    List<User> findUsersByOrganizationId(@Param("organizationId") String organizationId);
    
    // 조직의 특정 역할 멤버들 조회
    @Query("SELECT DISTINCT ou.user FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.roleInOrganization = :role")
    List<User> findUsersByOrganizationIdAndRole(@Param("organizationId") String organizationId, 
                                              @Param("role") com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole role);
    
    // 프로젝트의 멤버들 조회
    @Query("SELECT DISTINCT pu.user FROM ProjectUser pu WHERE pu.project.id = :projectId")
    List<User> findUsersByProjectId(@Param("projectId") String projectId);
    
    // 프로젝트의 특정 역할 멤버들 조회
    @Query("SELECT DISTINCT pu.user FROM ProjectUser pu WHERE pu.project.id = :projectId AND pu.roleInProject = :role")
    List<User> findUsersByProjectIdAndRole(@Param("projectId") String projectId, 
                                         @Param("role") com.testcase.testcasemanagement.model.ProjectUser.ProjectRole role);
    
    // 그룹의 멤버들 조회
    @Query("SELECT DISTINCT gm.user FROM GroupMember gm WHERE gm.group.id = :groupId")
    List<User> findUsersByGroupId(@Param("groupId") String groupId);
    
    // 그룹의 특정 역할 멤버들 조회
    @Query("SELECT DISTINCT gm.user FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.roleInGroup = :role")
    List<User> findUsersByGroupIdAndRole(@Param("groupId") String groupId, 
                                       @Param("role") com.testcase.testcasemanagement.model.GroupMember.GroupRole role);
    
    // 조직에 속하지 않은 사용자들 조회
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT DISTINCT ou.user.id FROM OrganizationUser ou)")
    List<User> findUsersNotInAnyOrganization();
    
    // 프로젝트에 참여하지 않은 사용자들 조회
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT DISTINCT pu.user.id FROM ProjectUser pu)")
    List<User> findUsersNotInAnyProject();
    
    // 그룹에 속하지 않은 사용자들 조회
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT DISTINCT gm.user.id FROM GroupMember gm)")
    List<User> findUsersNotInAnyGroup();
    
    // 특정 조직에 속하지 않은 사용자들 조회
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT ou.user.id FROM OrganizationUser ou WHERE ou.organization.id = :organizationId)")
    List<User> findUsersNotInOrganization(@Param("organizationId") String organizationId);
    
    // 특정 프로젝트에 참여하지 않은 사용자들 조회
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT pu.user.id FROM ProjectUser pu WHERE pu.project.id = :projectId)")
    List<User> findUsersNotInProject(@Param("projectId") String projectId);
    
    // 특정 그룹에 속하지 않은 사용자들 조회
    @Query("SELECT u FROM User u WHERE u.id NOT IN (SELECT gm.user.id FROM GroupMember gm WHERE gm.group.id = :groupId)")
    List<User> findUsersNotInGroup(@Param("groupId") String groupId);
    
    // 최근 가입한 사용자들 조회
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(org.springframework.data.domain.Pageable pageable);
    
    // 활동적인 사용자들 조회 (감사로그 기반)
    @Query("SELECT DISTINCT al.performedBy FROM AuditLog al WHERE al.timestamp >= :since ORDER BY al.timestamp DESC")
    List<User> findActiveUsers(@Param("since") java.time.LocalDateTime since);
    
    // 활성 상태별 사용자 조회
    List<User> findByIsActive(Boolean isActive);
    
    // 역할과 활성 상태로 사용자 조회
    List<User> findByRoleAndIsActive(String role, Boolean isActive);
    
    // 키워드와 활성 상태로 사용자 검색 (password 필드 제외)
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive)")
    List<User> searchByKeywordAndActiveStatus(@Param("keyword") String keyword, @Param("isActive") Boolean isActive);
    
    // PostgreSQL 전용 Native Query - ORDER BY 제거 (Pageable이 처리)
    @Query(value = "SELECT * FROM users u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(CAST(u.name AS text)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(u.username AS text)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(u.email AS text)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:isActive IS NULL OR u.is_active = :isActive)",
           countQuery = "SELECT COUNT(*) FROM users u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(CAST(u.name AS text)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(u.username AS text)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(u.email AS text)) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:isActive IS NULL OR u.is_active = :isActive)",
           nativeQuery = true)
    org.springframework.data.domain.Page<User> findUsersWithFilters(
        @Param("keyword") String keyword,
        @Param("role") String role,
        @Param("isActive") Boolean isActive,
        org.springframework.data.domain.Pageable pageable
    );
    
    // 사용자 통계 - 역할별 사용자 수
    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> getUserCountByRole();
    
    // 사용자 통계 - 활성 상태별 사용자 수
    @Query("SELECT u.isActive, COUNT(u) FROM User u GROUP BY u.isActive")
    List<Object[]> getUserCountByActiveStatus();
}
