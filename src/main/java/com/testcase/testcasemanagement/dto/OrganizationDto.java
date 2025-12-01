// src/main/java/com/testcase/testcasemanagement/dto/OrganizationDto.java
package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.OrganizationUser;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * 조직 관련 DTO 클래스들
 */
public class OrganizationDto {

    /**
     * 조직 생성 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CreateRequest {
        private String name;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    /**
     * 조직 수정 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateRequest {
        private String name;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    /**
     * 조직 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private String id;
        private String name;
        private String description;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;

        private Integer memberCount;
        private Integer projectCount;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }

        public Integer getMemberCount() {
            return memberCount;
        }

        public void setMemberCount(Integer memberCount) {
            this.memberCount = memberCount;
        }

        public Integer getProjectCount() {
            return projectCount;
        }

        public void setProjectCount(Integer projectCount) {
            this.projectCount = projectCount;
        }
    }

    /**
     * 조직 멤버 초대 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class InviteMemberRequest {
        private String username;
        private OrganizationUser.OrganizationRole role;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public OrganizationUser.OrganizationRole getRole() {
            return role;
        }

        public void setRole(OrganizationUser.OrganizationRole role) {
            this.role = role;
        }
    }

    /**
     * 조직 멤버 역할 변경 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateMemberRoleRequest {
        private OrganizationUser.OrganizationRole role;

        public OrganizationUser.OrganizationRole getRole() {
            return role;
        }

        public void setRole(OrganizationUser.OrganizationRole role) {
            this.role = role;
        }
    }

    /**
     * 조직 멤버 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MemberResponse {
        private String id;
        private String userId;
        private String username;
        private String userEmail;
        private String userDisplayName;
        private OrganizationUser.OrganizationRole roleInOrganization;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime joinedAt;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getUserEmail() {
            return userEmail;
        }

        public void setUserEmail(String userEmail) {
            this.userEmail = userEmail;
        }

        public String getUserDisplayName() {
            return userDisplayName;
        }

        public void setUserDisplayName(String userDisplayName) {
            this.userDisplayName = userDisplayName;
        }

        public OrganizationUser.OrganizationRole getRoleInOrganization() {
            return roleInOrganization;
        }

        public void setRoleInOrganization(OrganizationUser.OrganizationRole roleInOrganization) {
            this.roleInOrganization = roleInOrganization;
        }

        public LocalDateTime getJoinedAt() {
            return joinedAt;
        }

        public void setJoinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
        }
    }

    /**
     * 조직 목록 응답 DTO (간소화된 버전)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ListResponse {
        private String id;
        private String name;
        private String description;
        private Integer memberCount;
        private Integer projectCount;
        private OrganizationUser.OrganizationRole myRole;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Integer getMemberCount() {
            return memberCount;
        }

        public void setMemberCount(Integer memberCount) {
            this.memberCount = memberCount;
        }

        public Integer getProjectCount() {
            return projectCount;
        }

        public void setProjectCount(Integer projectCount) {
            this.projectCount = projectCount;
        }

        public OrganizationUser.OrganizationRole getMyRole() {
            return myRole;
        }

        public void setMyRole(OrganizationUser.OrganizationRole myRole) {
            this.myRole = myRole;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

    /**
     * 조직 통계 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StatisticsResponse {
        private String organizationId;
        private String organizationName;
        private Integer totalMembers;
        private Integer totalProjects;
        private Integer totalGroups;
        private Integer activeProjects;
        private Integer completedTestCases;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastActivity;

        // Getters and Setters
        public String getOrganizationId() {
            return organizationId;
        }

        public void setOrganizationId(String organizationId) {
            this.organizationId = organizationId;
        }

        public String getOrganizationName() {
            return organizationName;
        }

        public void setOrganizationName(String organizationName) {
            this.organizationName = organizationName;
        }

        public Integer getTotalMembers() {
            return totalMembers;
        }

        public void setTotalMembers(Integer totalMembers) {
            this.totalMembers = totalMembers;
        }

        public Integer getTotalProjects() {
            return totalProjects;
        }

        public void setTotalProjects(Integer totalProjects) {
            this.totalProjects = totalProjects;
        }

        public Integer getTotalGroups() {
            return totalGroups;
        }

        public void setTotalGroups(Integer totalGroups) {
            this.totalGroups = totalGroups;
        }

        public Integer getActiveProjects() {
            return activeProjects;
        }

        public void setActiveProjects(Integer activeProjects) {
            this.activeProjects = activeProjects;
        }

        public Integer getCompletedTestCases() {
            return completedTestCases;
        }

        public void setCompletedTestCases(Integer completedTestCases) {
            this.completedTestCases = completedTestCases;
        }

        public LocalDateTime getLastActivity() {
            return lastActivity;
        }

        public void setLastActivity(LocalDateTime lastActivity) {
            this.lastActivity = lastActivity;
        }
    }
}