// src/main/java/com/testcase/testcasemanagement/dto/GroupDto.java
package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.GroupMember;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * 그룹 관리 관련 DTO 클래스들
 */
public class GroupDto {

    /**
     * 그룹 생성 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CreateRequest {
        private String name;
        private String description;
        private String organizationId; // nullable - 조직 그룹인 경우
        private String projectId;     // nullable - 프로젝트 그룹인 경우

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOrganizationId() { return organizationId; }
        public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
        
        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
    }

    /**
     * 그룹 수정 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateRequest {
        private String name;
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    /**
     * 그룹 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private String id;
        private String name;
        private String description;
        
        // 소속 정보
        private String organizationId;
        private String organizationName;
        private String projectId;
        private String projectName;
        
        // 통계 정보
        private Integer memberCount;
        private Integer leaderCount;
        
        // 내 역할
        private GroupMember.GroupRole myRole;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOrganizationId() { return organizationId; }
        public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
        
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
        
        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        
        public Integer getMemberCount() { return memberCount; }
        public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
        
        public Integer getLeaderCount() { return leaderCount; }
        public void setLeaderCount(Integer leaderCount) { this.leaderCount = leaderCount; }
        
        public GroupMember.GroupRole getMyRole() { return myRole; }
        public void setMyRole(GroupMember.GroupRole myRole) { this.myRole = myRole; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    /**
     * 그룹 멤버 초대 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InviteMemberRequest {
        private String username;
        private GroupMember.GroupRole role;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public GroupMember.GroupRole getRole() { return role; }
        public void setRole(GroupMember.GroupRole role) { this.role = role; }
    }

    /**
     * 그룹 멤버 역할 변경 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateMemberRoleRequest {
        private GroupMember.GroupRole role;

        public GroupMember.GroupRole getRole() { return role; }
        public void setRole(GroupMember.GroupRole role) { this.role = role; }
    }

    /**
     * 그룹 멤버 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MemberResponse {
        private String id;
        private String userId;
        private String username;
        private String userEmail;
        private String userDisplayName;
        private GroupMember.GroupRole roleInGroup;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime joinedAt;
        
        // 활동 통계
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastActivity;
        private Integer contributionCount;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        
        public String getUserDisplayName() { return userDisplayName; }
        public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
        
        public GroupMember.GroupRole getRoleInGroup() { return roleInGroup; }
        public void setRoleInGroup(GroupMember.GroupRole roleInGroup) { 
            this.roleInGroup = roleInGroup; 
        }
        
        public LocalDateTime getJoinedAt() { return joinedAt; }
        public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        
        public Integer getContributionCount() { return contributionCount; }
        public void setContributionCount(Integer contributionCount) { this.contributionCount = contributionCount; }
    }

    /**
     * 그룹 목록 응답 DTO (간소화된 버전)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ListResponse {
        private String id;
        private String name;
        private String description;
        private String organizationId;
        private String organizationName;
        private String projectId;
        private String projectName;
        private Integer memberCount;
        private GroupMember.GroupRole myRole;
        private String groupType; // "ORGANIZATION", "PROJECT", "INDEPENDENT"
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastActivity;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOrganizationId() { return organizationId; }
        public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
        
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
        
        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        
        public Integer getMemberCount() { return memberCount; }
        public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
        
        public GroupMember.GroupRole getMyRole() { return myRole; }
        public void setMyRole(GroupMember.GroupRole myRole) { this.myRole = myRole; }
        
        public String getGroupType() { return groupType; }
        public void setGroupType(String groupType) { this.groupType = groupType; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    }

    /**
     * 그룹 이전 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TransferRequest {
        private String newOrganizationId; // null이면 독립 그룹으로 이전
        private String newProjectId;     // null이면 프로젝트 그룹에서 해제

        public String getNewOrganizationId() { return newOrganizationId; }
        public void setNewOrganizationId(String newOrganizationId) { this.newOrganizationId = newOrganizationId; }
        
        public String getNewProjectId() { return newProjectId; }
        public void setNewProjectId(String newProjectId) { this.newProjectId = newProjectId; }
    }

    /**
     * 그룹 통계 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StatisticsResponse {
        private String groupId;
        private String groupName;
        private String groupType;
        private Integer totalMembers;
        private Integer leadersCount;
        private Integer activeMembers;
        private Integer totalContributions;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastActivity;
        
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        // Getters and Setters
        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
        
        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }
        
        public String getGroupType() { return groupType; }
        public void setGroupType(String groupType) { this.groupType = groupType; }
        
        public Integer getTotalMembers() { return totalMembers; }
        public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }
        
        public Integer getLeadersCount() { return leadersCount; }
        public void setLeadersCount(Integer leadersCount) { this.leadersCount = leadersCount; }
        
        public Integer getActiveMembers() { return activeMembers; }
        public void setActiveMembers(Integer activeMembers) { this.activeMembers = activeMembers; }
        
        public Integer getTotalContributions() { return totalContributions; }
        public void setTotalContributions(Integer totalContributions) { this.totalContributions = totalContributions; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    /**
     * 그룹 멤버 일괄 초대 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BulkInviteRequest {
        private String[] usernames;
        private GroupMember.GroupRole role;

        public String[] getUsernames() { return usernames; }
        public void setUsernames(String[] usernames) { this.usernames = usernames; }
        
        public GroupMember.GroupRole getRole() { return role; }
        public void setRole(GroupMember.GroupRole role) { this.role = role; }
    }

    /**
     * 그룹 멤버 일괄 초대 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class BulkInviteResponse {
        private Integer successCount;
        private Integer failureCount;
        private String[] successUsers;
        private String[] failureUsers;
        private String[] failureReasons;

        public Integer getSuccessCount() { return successCount; }
        public void setSuccessCount(Integer successCount) { this.successCount = successCount; }
        
        public Integer getFailureCount() { return failureCount; }
        public void setFailureCount(Integer failureCount) { this.failureCount = failureCount; }
        
        public String[] getSuccessUsers() { return successUsers; }
        public void setSuccessUsers(String[] successUsers) { this.successUsers = successUsers; }
        
        public String[] getFailureUsers() { return failureUsers; }
        public void setFailureUsers(String[] failureUsers) { this.failureUsers = failureUsers; }
        
        public String[] getFailureReasons() { return failureReasons; }
        public void setFailureReasons(String[] failureReasons) { this.failureReasons = failureReasons; }
    }
}