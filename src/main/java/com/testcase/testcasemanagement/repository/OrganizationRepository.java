// src/main/java/com/testcase/testcasemanagement/repository/OrganizationRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
    
    // 기본 검색 메서드
    Optional<Organization> findByName(String name);
    boolean existsByName(String name);
    
    // 이름으로 조직 검색 (대소문자 무시)
    Optional<Organization> findByNameIgnoreCase(String name);
    
    // 이름 패턴으로 조직 검색
    List<Organization> findByNameContainingIgnoreCase(String name);
    
    // 설명 패턴으로 조직 검색
    List<Organization> findByDescriptionContainingIgnoreCase(String description);
    
    // 조직의 프로젝트 개수 조회
    @Query("SELECT COUNT(p) FROM Project p WHERE p.organization.id = :organizationId")
    long countProjectsByOrganizationId(@Param("organizationId") String organizationId);
    
    // 조직의 멤버 수 조회
    @Query("SELECT COUNT(ou) FROM OrganizationUser ou WHERE ou.organization.id = :organizationId")
    long countMembersByOrganizationId(@Param("organizationId") String organizationId);
    
    // 특정 역할을 가진 조직 멤버 수 조회
    @Query("SELECT COUNT(ou) FROM OrganizationUser ou WHERE ou.organization.id = :organizationId AND ou.roleInOrganization = :role")
    long countMembersByOrganizationIdAndRole(@Param("organizationId") String organizationId, 
                                           @Param("role") com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole role);
    
    // 사용자가 속한 조직들 조회
    @Query("SELECT DISTINCT ou.organization FROM OrganizationUser ou WHERE ou.user.id = :userId")
    List<Organization> findOrganizationsByUserId(@Param("userId") String userId);
    
    // 사용자가 속한 조직들 조회 (OrganizationService에서 사용)
    @Query("SELECT DISTINCT ou.organization FROM OrganizationUser ou WHERE ou.user.id = :userId")
    List<Organization> findByUserId(@Param("userId") String userId);
    
    // 사용자가 특정 역할로 속한 조직들 조회
    @Query("SELECT DISTINCT ou.organization FROM OrganizationUser ou WHERE ou.user.id = :userId AND ou.roleInOrganization = :role")
    List<Organization> findOrganizationsByUserIdAndRole(@Param("userId") String userId, 
                                                       @Param("role") com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole role);
    
    // 조직 검색 (이름 또는 설명으로)
    @Query("SELECT o FROM Organization o WHERE " +
           "LOWER(o.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(o.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Organization> searchByKeyword(@Param("keyword") String keyword);
    
    // 생성일 범위로 조직 검색
    @Query("SELECT o FROM Organization o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Organization> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                            @Param("endDate") java.time.LocalDateTime endDate);
    
    // 조직과 멤버 정보를 함께 조회 (fetch join)
    @Query("SELECT o FROM Organization o LEFT JOIN FETCH o.organizationUsers ou LEFT JOIN FETCH ou.user WHERE o.id = :organizationId")
    Optional<Organization> findByIdWithMembers(@Param("organizationId") String organizationId);
    
    // 모든 조직과 멤버 정보를 함께 조회 (fetch join) - 시스템 관리자용
    @Query("SELECT DISTINCT o FROM Organization o LEFT JOIN FETCH o.organizationUsers ou LEFT JOIN FETCH ou.user ORDER BY o.createdAt DESC")
    List<Organization> findAllWithMembers();
    
    // 사용자가 속한 조직들과 멤버 정보를 함께 조회 (fetch join)
    @Query("SELECT DISTINCT o FROM Organization o LEFT JOIN FETCH o.organizationUsers ou LEFT JOIN FETCH ou.user WHERE o.id IN (SELECT ou2.organization.id FROM OrganizationUser ou2 WHERE ou2.user.id = :userId) ORDER BY o.createdAt DESC")
    List<Organization> findByUserIdWithMembers(@Param("userId") String userId);
}