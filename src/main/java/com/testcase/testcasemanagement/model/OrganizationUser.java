// src/main/java/com/testcase/testcasemanagement/model/OrganizationUser.java
//OrganizationUser: 조직-사용자 매핑 및 역할 관리.
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "organization_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "organization_id", "user_id" })
}, indexes = {
        @Index(name = "idx_org_user_role", columnList = "organization_id, role_in_organization"),
        @Index(name = "idx_user_org", columnList = "user_id, organization_id")
})
public class OrganizationUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonBackReference("organization-members")
    @ManyToOne(optional = false)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_organization", nullable = false, length = 20)
    private OrganizationRole roleInOrganization; // OWNER, ADMIN, MEMBER

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

    // 조직 내 역할 정의
    public enum OrganizationRole {
        OWNER("소유자"),
        ADMIN("관리자"),
        MEMBER("멤버");

        private final String description;

        OrganizationRole(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // 편의 메서드들
    public boolean isOwner() {
        return OrganizationRole.OWNER.equals(this.roleInOrganization);
    }

    public boolean isAdmin() {
        return OrganizationRole.ADMIN.equals(this.roleInOrganization);
    }

    public boolean isMember() {
        return OrganizationRole.MEMBER.equals(this.roleInOrganization);
    }

    public boolean hasAdminPrivileges() {
        return isOwner() || isAdmin();
    }

    public String getOrganizationName() {
        return organization != null ? organization.getName() : null;
    }

    public String getUserName() {
        return user != null ? user.getName() : null;
    }
}
