// src/main/java/com/testcase/testcasemanagement/repository/GroupMemberRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.GroupMember;
import com.testcase.testcasemanagement.model.GroupMember.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, String> {
    
    // 기본 관계 검색
    Optional<GroupMember> findByGroupIdAndUserId(String groupId, String userId);
    boolean existsByGroupIdAndUserId(String groupId, String userId);
    
    // 그룹의 모든 멤버 조회
    List<GroupMember> findByGroupId(String groupId);
    
    // 사용자가 속한 모든 그룹 조회
    List<GroupMember> findByUserId(String userId);
    
    // 특정 역할로 그룹 멤버 조회
    List<GroupMember> findByGroupIdAndRoleInGroup(String groupId, GroupRole role);
    
    // 사용자가 특정 역할로 속한 그룹들 조회
    List<GroupMember> findByUserIdAndRoleInGroup(String userId, GroupRole role);
    
    // 그룹의 리더들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.roleInGroup = 'LEADER'")
    List<GroupMember> findLeadersByGroupId(@Param("groupId") String groupId);
    
    // 그룹의 리더십 역할 멤버들 조회 (리더 + 부리더)
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.roleInGroup IN ('LEADER', 'CO_LEADER')")
    List<GroupMember> findLeadershipByGroupId(@Param("groupId") String groupId);
    
    // 사용자가 리더십 역할을 가진 그룹들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.user.id = :userId AND gm.roleInGroup IN ('LEADER', 'CO_LEADER')")
    List<GroupMember> findLeadershipGroupsByUserId(@Param("userId") String userId);
    
    // 사용자의 그룹별 역할 조회
    @Query("SELECT gm.roleInGroup FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    Optional<GroupRole> findRoleByGroupIdAndUserId(@Param("groupId") String groupId, @Param("userId") String userId);
    
    // 그룹에서 사용자 제거
    void deleteByGroupIdAndUserId(String groupId, String userId);
    
    // 그룹의 모든 멤버 제거
    void deleteByGroupId(String groupId);
    
    // 사용자의 모든 그룹 관계 제거
    void deleteByUserId(String userId);
    
    // 역할별 멤버 수 조회
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.roleInGroup = :role")
    long countByGroupIdAndRole(@Param("groupId") String groupId, @Param("role") GroupRole role);
    
    // 그룹의 총 멤버 수 조회
    long countByGroupId(String groupId);
    
    // 사용자가 속한 그룹 수 조회
    long countByUserId(String userId);
    
    // 최근 가입한 멤버들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId ORDER BY gm.createdAt DESC")
    List<GroupMember> findRecentMembersByGroupId(@Param("groupId") String groupId, 
                                               org.springframework.data.domain.Pageable pageable);
    
    // 사용자가 특정 그룹에서 리더십 역할을 가지는지 확인
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId AND gm.roleInGroup IN ('LEADER', 'CO_LEADER')")
    boolean hasLeadershipRole(@Param("groupId") String groupId, @Param("userId") String userId);
    
    // 사용자가 특정 그룹의 리더인지 확인
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId AND gm.roleInGroup = 'LEADER'")
    boolean isLeader(@Param("groupId") String groupId, @Param("userId") String userId);
    
    // 조직의 모든 그룹 멤버들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.organization.id = :organizationId")
    List<GroupMember> findByOrganizationId(@Param("organizationId") String organizationId);
    
    // 프로젝트의 모든 그룹 멤버들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.project.id = :projectId")
    List<GroupMember> findByProjectId(@Param("projectId") String projectId);
    
    // 조직 내에서 사용자가 속한 그룹 멤버십들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.user.id = :userId AND gm.group.organization.id = :organizationId")
    List<GroupMember> findByUserIdAndOrganizationId(@Param("userId") String userId, @Param("organizationId") String organizationId);
    
    // 프로젝트 내에서 사용자가 속한 그룹 멤버십들 조회
    @Query("SELECT gm FROM GroupMember gm WHERE gm.user.id = :userId AND gm.group.project.id = :projectId")
    List<GroupMember> findByUserIdAndProjectId(@Param("userId") String userId, @Param("projectId") String projectId);
    
    // 사용자가 조직의 어떤 그룹에라도 속해있는지 확인
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm WHERE gm.user.id = :userId AND gm.group.organization.id = :organizationId")
    boolean existsByUserIdAndOrganizationId(@Param("userId") String userId, @Param("organizationId") String organizationId);
    
    // 사용자가 프로젝트의 어떤 그룹에라도 속해있는지 확인
    @Query("SELECT COUNT(gm) > 0 FROM GroupMember gm WHERE gm.user.id = :userId AND gm.group.project.id = :projectId")
    boolean existsByUserIdAndProjectId(@Param("userId") String userId, @Param("projectId") String projectId);
}