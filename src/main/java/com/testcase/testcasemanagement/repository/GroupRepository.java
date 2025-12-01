// src/main/java/com/testcase/testcasemanagement/repository/GroupRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, String> {

       // 기본 검색 메서드
       List<Group> findByName(String name);

       List<Group> findByNameContainingIgnoreCase(String name);

       // 조직의 그룹들 조회
       List<Group> findByOrganizationId(String organizationId);

       // 프로젝트의 그룹들 조회
       List<Group> findByProjectId(String projectId);

       // 조직과 프로젝트 모두에 속한 그룹들 조회
       List<Group> findByOrganizationIdAndProjectId(String organizationId, String projectId);

       // 조직에만 속한 그룹들 조회 (프로젝트 없음)
       List<Group> findByOrganizationIdAndProjectIsNull(String organizationId);

       // 프로젝트에만 속한 그룹들 조회 (조직 없음)
       List<Group> findByProjectIdAndOrganizationIsNull(String projectId);

       // 독립 그룹들 조회 (조직, 프로젝트 모두 없음)
       List<Group> findByOrganizationIsNullAndProjectIsNull();

       // 조직과 프로젝트 중 하나라도 가진 그룹들 조회
       @Query("SELECT g FROM Group g WHERE g.organization.id = :organizationId OR g.project.id = :projectId")
       List<Group> findByOrganizationIdOrProjectId(@Param("organizationId") String organizationId,
                     @Param("projectId") String projectId);

       // 그룹명으로 조직 내 검색
       @Query("SELECT g FROM Group g WHERE g.organization.id = :organizationId AND LOWER(g.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       List<Group> findByOrganizationIdAndNameContaining(@Param("organizationId") String organizationId,
                     @Param("name") String name);

       // 그룹명으로 프로젝트 내 검색
       @Query("SELECT g FROM Group g WHERE g.project.id = :projectId AND LOWER(g.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       List<Group> findByProjectIdAndNameContaining(@Param("projectId") String projectId, @Param("name") String name);

       // 그룹의 멤버 수 조회
       @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId")
       long countMembersByGroupId(@Param("groupId") String groupId);

       // 특정 역할을 가진 그룹 멤버 수 조회
       @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.roleInGroup = :role")
       long countMembersByGroupIdAndRole(@Param("groupId") String groupId,
                     @Param("role") com.testcase.testcasemanagement.model.GroupMember.GroupRole role);

       // 사용자가 속한 그룹들 조회
       @Query("SELECT DISTINCT gm.group FROM GroupMember gm WHERE gm.user.id = :userId")
       List<Group> findGroupsByUserId(@Param("userId") String userId);

       // 사용자가 접근 가능한 그룹들 조회 (직접 멤버 + 조직/프로젝트 멤버십)
       @Query("SELECT DISTINCT g FROM Group g " +
                     "LEFT JOIN GroupMember gm ON g.id = gm.group.id " +
                     "LEFT JOIN OrganizationUser ou ON g.organization.id = ou.organization.id " +
                     "LEFT JOIN ProjectUser pu ON g.project.id = pu.project.id " +
                     "WHERE gm.user.id = :userId OR ou.user.id = :userId OR pu.user.id = :userId")
       List<Group> findAccessibleGroupsByUserId(@Param("userId") String userId);

       // 사용자가 특정 역할로 속한 그룹들 조회
       @Query("SELECT DISTINCT gm.group FROM GroupMember gm WHERE gm.user.id = :userId AND gm.roleInGroup = :role")
       List<Group> findGroupsByUserIdAndRole(@Param("userId") String userId,
                     @Param("role") com.testcase.testcasemanagement.model.GroupMember.GroupRole role);

       // 사용자가 리더인 그룹들 조회
       @Query("SELECT DISTINCT gm.group FROM GroupMember gm WHERE gm.user.id = :userId AND gm.roleInGroup = 'LEADER'")
       List<Group> findLeaderGroupsByUserId(@Param("userId") String userId);

       // 조직 내에서 사용자가 속한 그룹들 조회
       @Query("SELECT DISTINCT gm.group FROM GroupMember gm WHERE gm.user.id = :userId AND gm.group.organization.id = :organizationId")
       List<Group> findGroupsByUserIdAndOrganizationId(@Param("userId") String userId,
                     @Param("organizationId") String organizationId);

       // 프로젝트 내에서 사용자가 속한 그룹들 조회
       @Query("SELECT DISTINCT gm.group FROM GroupMember gm WHERE gm.user.id = :userId AND gm.group.project.id = :projectId")
       List<Group> findGroupsByUserIdAndProjectId(@Param("userId") String userId, @Param("projectId") String projectId);

       // 그룹 검색 (이름 또는 설명으로)
       @Query("SELECT g FROM Group g WHERE " +
                     "LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
       List<Group> searchByKeyword(@Param("keyword") String keyword);

       // 조직 내 그룹 검색
       @Query("SELECT g FROM Group g WHERE g.organization.id = :organizationId AND " +
                     "(LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       List<Group> searchByKeywordInOrganization(@Param("organizationId") String organizationId,
                     @Param("keyword") String keyword);

       // 프로젝트 내 그룹 검색
       @Query("SELECT g FROM Group g WHERE g.project.id = :projectId AND " +
                     "(LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       List<Group> searchByKeywordInProject(@Param("projectId") String projectId, @Param("keyword") String keyword);

       // 조직의 그룹 수 조회
       long countByOrganizationId(String organizationId);

       // 프로젝트의 그룹 수 조회
       long countByProjectId(String projectId);

       // 생성일 기준 최근 그룹들 조회
       @Query("SELECT g FROM Group g ORDER BY g.createdAt DESC")
       List<Group> findRecentGroups(org.springframework.data.domain.Pageable pageable);
}