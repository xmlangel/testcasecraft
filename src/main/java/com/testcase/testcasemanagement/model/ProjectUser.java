// src/main/java/com/testcase/testcasemanagement/model/ProjectUser.java
//ProjectUser: 프로젝트-사용자 매핑 및 역할 관리.
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "project_users", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_project_user_role", columnList = "project_id, role_in_project"),
        @Index(name = "idx_user_project", columnList = "user_id, project_id")
    }
)
public class ProjectUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    @JsonBackReference("project-users")
    private Project project;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_project", nullable = false, length = 30)
    private ProjectRole roleInProject; // PROJECT_MANAGER, CONTRIBUTOR, VIEWER
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 프로젝트 내 역할 정의
    public enum ProjectRole {
        PROJECT_MANAGER("프로젝트 매니저"),
        LEAD_DEVELOPER("리드 개발자"),
        DEVELOPER("개발자"),
        TESTER("테스터"),
        CONTRIBUTOR("기여자"),
        VIEWER("뷰어");
        
        private final String description;
        
        ProjectRole(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // 편의 메서드들
    public boolean isProjectManager() {
        return ProjectRole.PROJECT_MANAGER.equals(this.roleInProject);
    }
    
    public boolean isLeadDeveloper() {
        return ProjectRole.LEAD_DEVELOPER.equals(this.roleInProject);
    }
    
    public boolean isDeveloper() {
        return ProjectRole.DEVELOPER.equals(this.roleInProject);
    }
    
    public boolean isTester() {
        return ProjectRole.TESTER.equals(this.roleInProject);
    }
    
    public boolean isContributor() {
        return ProjectRole.CONTRIBUTOR.equals(this.roleInProject);
    }
    
    public boolean isViewer() {
        return ProjectRole.VIEWER.equals(this.roleInProject);
    }
    
    public boolean hasManagementPrivileges() {
        return isProjectManager() || isLeadDeveloper();
    }
    
    public boolean canEdit() {
        return hasManagementPrivileges() || isDeveloper() || isContributor();
    }
    
    public boolean canOnlyView() {
        return isViewer();
    }
    
    public String getProjectName() {
        return project != null ? project.getName() : null;
    }
    
    public String getUserName() {
        return user != null ? user.getName() : null;
    }
}
