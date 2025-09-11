// src/main/java/com/testcase/testcasemanagement/model/Organization.java
//Organization: 조직 정보 테이블.
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "organizations")
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 조직 멤버 관계 (양방향)
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("organization-members")
    private List<OrganizationUser> organizationUsers = new ArrayList<>();
    
    // 조직에 속한 프로젝트들
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @JsonManagedReference("organization-projects")
    private List<Project> projects = new ArrayList<>();
    
    // 조직에 속한 그룹들
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @JsonManagedReference("organization-groups")
    private List<Group> groups = new ArrayList<>();
    
    // 현재 사용자의 조직 내 역할 (데이터베이스에 저장되지 않음)
    @Transient
    private String userRole;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
