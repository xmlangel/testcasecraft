// src/main/java/com/testcase/testcasemanagement/model/Project.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"code"})
})
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder = 0; // 기본값 할당

    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code; // ✅ NOT NULL + 유니크 제약조건

    // 조직과의 관계 - nullable (조직에 속하지 않은 프로젝트 허용)
    @JsonIgnoreProperties({"projects", "organizationUsers", "groups"}) // 순환 참조 방지를 위해 특정 필드만 제외
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(name = "createdat", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("project-testcases")
    @JsonIgnore  // StackOverflowError 방지: 배치 저장 시 순환 참조 방지
    private List<TestCase> testCases;
    
    // 프로젝트 멤버 관계 (양방향)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("project-users")
    private List<ProjectUser> projectUsers = new ArrayList<>();
    
    // 프로젝트에 속한 그룹들
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Group> groups = new ArrayList<>();


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
