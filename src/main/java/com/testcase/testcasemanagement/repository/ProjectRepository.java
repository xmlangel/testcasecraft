// src/main/java/com/testcase/testcasemanagement/repository/ProjectRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

       // 모든 프로젝트 조회 (조직 정보 포함) - 생성일 역순 정렬
       @Query("SELECT p FROM Project p LEFT JOIN FETCH p.organization ORDER BY p.createdAt DESC")
       List<Project> findAllWithOrganization();

       // 기존 메서드들
       boolean existsByCode(String code);

       Optional<Project> findByCode(String code);

       // 조직별 프로젝트 조회 (조직 정보 포함)
       @Query("SELECT p FROM Project p LEFT JOIN FETCH p.organization WHERE p.organization.id = :organizationId")
       List<Project> findByOrganizationId(@Param("organizationId") String organizationId);

       // 조직에 속하지 않은 독립 프로젝트들 조회
       List<Project> findByOrganizationIsNull();

       // 프로젝트명으로 검색
       List<Project> findByNameContainingIgnoreCase(String name);

       // 정확한 프로젝트명으로 조회 (CSV 서비스에서 사용)
       Optional<Project> findByName(String name);

       // 조직 내에서 프로젝트명으로 검색
       @Query("SELECT p FROM Project p WHERE p.organization.id = :organizationId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       List<Project> findByOrganizationIdAndNameContaining(@Param("organizationId") String organizationId,
                     @Param("name") String name);

       // 프로젝트 코드로 조직 내 검색
       @Query("SELECT p FROM Project p WHERE p.organization.id = :organizationId AND p.code = :code")
       Optional<Project> findByOrganizationIdAndCode(@Param("organizationId") String organizationId,
                     @Param("code") String code);

       // 프로젝트의 멤버 수 조회
       @Query("SELECT COUNT(pu) FROM ProjectUser pu WHERE pu.project.id = :projectId")
       long countMembersByProjectId(@Param("projectId") String projectId);

       // 프로젝트의 테스트케이스 수 조회
       @Query("SELECT COUNT(tc) FROM TestCase tc WHERE tc.project.id = :projectId")
       long countTestCasesByProjectId(@Param("projectId") String projectId);

       // 사용자가 참여한 프로젝트들 조회
       @Query("SELECT DISTINCT pu.project FROM ProjectUser pu WHERE pu.user.id = :userId")
       List<Project> findProjectsByUserId(@Param("userId") String userId);

       // 사용자가 접근 가능한 프로젝트들 조회 (직접 멤버 + 조직 멤버십) - 조직 정보 포함 - 생성일 역순 정렬
       @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.organization " +
                     "LEFT JOIN ProjectUser pu ON p.id = pu.project.id " +
                     "LEFT JOIN OrganizationUser ou ON p.organization.id = ou.organization.id " +
                     "WHERE pu.user.id = :userId OR ou.user.id = :userId " +
                     "ORDER BY p.createdAt DESC")
       List<Project> findAccessibleProjectsByUserId(@Param("userId") String userId);

       // 사용자가 특정 역할로 참여한 프로젝트들 조회
       @Query("SELECT DISTINCT pu.project FROM ProjectUser pu WHERE pu.user.id = :userId AND pu.roleInProject = :role")
       List<Project> findProjectsByUserIdAndRole(@Param("userId") String userId,
                     @Param("role") com.testcase.testcasemanagement.model.ProjectUser.ProjectRole role);

       // 사용자가 관리하는 프로젝트들 조회
       @Query("SELECT DISTINCT pu.project FROM ProjectUser pu WHERE pu.user.id = :userId AND pu.roleInProject IN ('PROJECT_MANAGER', 'LEAD_DEVELOPER')")
       List<Project> findManagedProjectsByUserId(@Param("userId") String userId);

       // 조직의 프로젝트 수 조회
       long countByOrganizationId(String organizationId);

       // 독립 프로젝트 수 조회
       long countByOrganizationIsNull();

       // 조직별 프로젝트 수 조회
       @Query("SELECT COUNT(p) FROM Project p WHERE p.organization IS NOT NULL")
       long countByOrganizationIsNotNull();

       // 프로젝트 검색 (이름, 설명, 코드로)
       @Query("SELECT p FROM Project p WHERE " +
                     "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
       List<Project> searchByKeyword(@Param("keyword") String keyword);

       // 조직 내 프로젝트 검색
       @Query("SELECT p FROM Project p WHERE p.organization.id = :organizationId AND " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       List<Project> searchByKeywordInOrganization(@Param("organizationId") String organizationId,
                     @Param("keyword") String keyword);

       // 최근 생성된 프로젝트들 조회
       @Query("SELECT p FROM Project p ORDER BY p.createdAt DESC")
       List<Project> findRecentProjects(org.springframework.data.domain.Pageable pageable);

       // 조직의 최근 프로젝트들 조회
       @Query("SELECT p FROM Project p WHERE p.organization.id = :organizationId ORDER BY p.createdAt DESC")
       List<Project> findRecentProjectsByOrganization(@Param("organizationId") String organizationId,
                     org.springframework.data.domain.Pageable pageable);
}
