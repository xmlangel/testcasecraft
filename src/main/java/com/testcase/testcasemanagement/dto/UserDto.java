// src/main/java/com/testcase/testcasemanagement/dto/UserDto.java
package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자 관리 관련 DTO 클래스들
 */
public class UserDto {

    /**
     * 사용자 생성 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CreateRequest {
        private String username;
        private String email;
        private String name;
        private String password;
        private String role; // USER, ADMIN
        private String timezone; // 사용자 시간대

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }
    }

    /**
     * 사용자 수정 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpdateRequest {
        private String email;
        private String name;
        private String role;
        private Boolean isActive;
        private String timezone; // 사용자 시간대

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }
    }

    /**
     * 패스워드 변경 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    /**
     * 사용자 응답 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private String id;
        private String username;
        private String email;
        private String name;
        private String role;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastLoginAt;

        // 활동 통계
        private Integer organizationCount;
        private Integer projectCount;
        private Integer groupCount;
        private Integer completedTestCases;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getLastLoginAt() {
            return lastLoginAt;
        }

        public void setLastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }

        public Integer getOrganizationCount() {
            return organizationCount;
        }

        public void setOrganizationCount(Integer organizationCount) {
            this.organizationCount = organizationCount;
        }

        public Integer getProjectCount() {
            return projectCount;
        }

        public void setProjectCount(Integer projectCount) {
            this.projectCount = projectCount;
        }

        public Integer getGroupCount() {
            return groupCount;
        }

        public void setGroupCount(Integer groupCount) {
            this.groupCount = groupCount;
        }

        public Integer getCompletedTestCases() {
            return completedTestCases;
        }

        public void setCompletedTestCases(Integer completedTestCases) {
            this.completedTestCases = completedTestCases;
        }
    }

    /**
     * 사용자 목록 응답 DTO (간소화된 버전)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ListResponse {
        private String id;
        private String username;
        private String email;
        private String name;
        private String role;
        private Boolean isActive;
        private Boolean emailVerified; // 이메일 인증 여부

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastLoginAt;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }

        public Boolean getEmailVerified() {
            return emailVerified;
        }

        public void setEmailVerified(Boolean emailVerified) {
            this.emailVerified = emailVerified;
        }

        public LocalDateTime getLastLoginAt() {
            return lastLoginAt;
        }

        public void setLastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

    /**
     * 사용자 프로필 응답 DTO (현재 사용자용)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ProfileResponse {
        private String id;
        private String username;
        private String email;
        private String name;
        private String role;
        private String timezone; // 사용자 시간대
        private Boolean emailVerified; // 이메일 인증 여부

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastLoginAt;

        // 소속 정보
        private List<MembershipInfo> organizations;
        private List<MembershipInfo> projects;
        private List<MembershipInfo> groups;

        // 활동 통계
        private ActivityStatistics activityStatistics;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }

        public Boolean getEmailVerified() {
            return emailVerified;
        }

        public void setEmailVerified(Boolean emailVerified) {
            this.emailVerified = emailVerified;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getLastLoginAt() {
            return lastLoginAt;
        }

        public void setLastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }

        public List<MembershipInfo> getOrganizations() {
            return organizations;
        }

        public void setOrganizations(List<MembershipInfo> organizations) {
            this.organizations = organizations;
        }

        public List<MembershipInfo> getProjects() {
            return projects;
        }

        public void setProjects(List<MembershipInfo> projects) {
            this.projects = projects;
        }

        public List<MembershipInfo> getGroups() {
            return groups;
        }

        public void setGroups(List<MembershipInfo> groups) {
            this.groups = groups;
        }

        public ActivityStatistics getActivityStatistics() {
            return activityStatistics;
        }

        public void setActivityStatistics(ActivityStatistics activityStatistics) {
            this.activityStatistics = activityStatistics;
        }
    }

    /**
     * 멤버십 정보 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MembershipInfo {
        private String id;
        private String name;
        private String role;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime joinedAt;

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

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public LocalDateTime getJoinedAt() {
            return joinedAt;
        }

        public void setJoinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
        }
    }

    /**
     * 활동 통계 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ActivityStatistics {
        private Integer totalTestCasesCreated;
        private Integer totalTestCasesExecuted;
        private Integer totalTestCasesCompleted;
        private Integer organizationsCreated;
        private Integer projectsCreated;
        private Integer groupsCreated;
        private Double averageTestPassRate;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastActivity;

        public Integer getTotalTestCasesCreated() {
            return totalTestCasesCreated;
        }

        public void setTotalTestCasesCreated(Integer totalTestCasesCreated) {
            this.totalTestCasesCreated = totalTestCasesCreated;
        }

        public Integer getTotalTestCasesExecuted() {
            return totalTestCasesExecuted;
        }

        public void setTotalTestCasesExecuted(Integer totalTestCasesExecuted) {
            this.totalTestCasesExecuted = totalTestCasesExecuted;
        }

        public Integer getTotalTestCasesCompleted() {
            return totalTestCasesCompleted;
        }

        public void setTotalTestCasesCompleted(Integer totalTestCasesCompleted) {
            this.totalTestCasesCompleted = totalTestCasesCompleted;
        }

        public Integer getOrganizationsCreated() {
            return organizationsCreated;
        }

        public void setOrganizationsCreated(Integer organizationsCreated) {
            this.organizationsCreated = organizationsCreated;
        }

        public Integer getProjectsCreated() {
            return projectsCreated;
        }

        public void setProjectsCreated(Integer projectsCreated) {
            this.projectsCreated = projectsCreated;
        }

        public Integer getGroupsCreated() {
            return groupsCreated;
        }

        public void setGroupsCreated(Integer groupsCreated) {
            this.groupsCreated = groupsCreated;
        }

        public Double getAverageTestPassRate() {
            return averageTestPassRate;
        }

        public void setAverageTestPassRate(Double averageTestPassRate) {
            this.averageTestPassRate = averageTestPassRate;
        }

        public LocalDateTime getLastActivity() {
            return lastActivity;
        }

        public void setLastActivity(LocalDateTime lastActivity) {
            this.lastActivity = lastActivity;
        }
    }

    /**
     * 사용자 검색 요청 DTO
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SearchRequest {
        private String keyword;
        private String role;
        private Boolean isActive;
        private Integer page;
        private Integer size;

        public String getKeyword() {
            return keyword;
        }

        public void setKeyword(String keyword) {
            this.keyword = keyword;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }

        public Integer getPage() {
            return page;
        }

        public void setPage(Integer page) {
            this.page = page;
        }

        public Integer getSize() {
            return size;
        }

        public void setSize(Integer size) {
            this.size = size;
        }
    }

    /**
     * 사용자 역할 변경 요청 DTO (관리자용)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChangeRoleRequest {
        private String role; // USER, ADMIN

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    /**
     * 사용자 활성화/비활성화 요청 DTO (관리자용)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ActivationRequest {
        private Boolean isActive;
        private String reason;

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    /**
     * 사용자 통계 응답 DTO (관리자용)
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StatisticsResponse {
        private Integer totalUsers;
        private Integer activeUsers;
        private Integer inactiveUsers;
        private Integer adminUsers;
        private Integer regularUsers;
        private Integer newUsersThisMonth;
        private Double averageLoginFrequency;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastRegistration;

        public Integer getTotalUsers() {
            return totalUsers;
        }

        public void setTotalUsers(Integer totalUsers) {
            this.totalUsers = totalUsers;
        }

        public Integer getActiveUsers() {
            return activeUsers;
        }

        public void setActiveUsers(Integer activeUsers) {
            this.activeUsers = activeUsers;
        }

        public Integer getInactiveUsers() {
            return inactiveUsers;
        }

        public void setInactiveUsers(Integer inactiveUsers) {
            this.inactiveUsers = inactiveUsers;
        }

        public Integer getAdminUsers() {
            return adminUsers;
        }

        public void setAdminUsers(Integer adminUsers) {
            this.adminUsers = adminUsers;
        }

        public Integer getRegularUsers() {
            return regularUsers;
        }

        public void setRegularUsers(Integer regularUsers) {
            this.regularUsers = regularUsers;
        }

        public Integer getNewUsersThisMonth() {
            return newUsersThisMonth;
        }

        public void setNewUsersThisMonth(Integer newUsersThisMonth) {
            this.newUsersThisMonth = newUsersThisMonth;
        }

        public Double getAverageLoginFrequency() {
            return averageLoginFrequency;
        }

        public void setAverageLoginFrequency(Double averageLoginFrequency) {
            this.averageLoginFrequency = averageLoginFrequency;
        }

        public LocalDateTime getLastRegistration() {
            return lastRegistration;
        }

        public void setLastRegistration(LocalDateTime lastRegistration) {
            this.lastRegistration = lastRegistration;
        }
    }
}