// src/main/java/com/testcase/testcasemanagement/model/GroupMember.java
//Group, GroupMember: 조직/프로젝트 내 그룹 및 멤버 관리.
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "group_members", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_group_member_role", columnList = "group_id, role_in_group"),
        @Index(name = "idx_user_group", columnList = "user_id, group_id")
    }
)
public class GroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_group", nullable = false, length = 20)
    private GroupRole roleInGroup; // LEADER, MEMBER
    
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
    
    // 그룹 내 역할 정의
    public enum GroupRole {
        LEADER("그룹 리더"),
        CO_LEADER("부 리더"),
        MEMBER("멤버");
        
        private final String description;
        
        GroupRole(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // 편의 메서드들
    public boolean isLeader() {
        return GroupRole.LEADER.equals(this.roleInGroup);
    }
    
    public boolean isCoLeader() {
        return GroupRole.CO_LEADER.equals(this.roleInGroup);
    }
    
    public boolean isMember() {
        return GroupRole.MEMBER.equals(this.roleInGroup);
    }
    
    public boolean hasLeadershipRole() {
        return isLeader() || isCoLeader();
    }
    
    public boolean canManageGroup() {
        return isLeader();
    }
    
    public boolean canAssistManagement() {
        return hasLeadershipRole();
    }
    
    public String getGroupName() {
        return group != null ? group.getName() : null;
    }
    
    public String getUserName() {
        return user != null ? user.getName() : null;
    }
    
    public String getOrganizationName() {
        return group != null && group.getOrganization() != null ? 
               group.getOrganization().getName() : null;
    }
    
    public String getProjectName() {
        return group != null && group.getProject() != null ? 
               group.getProject().getName() : null;
    }
}
