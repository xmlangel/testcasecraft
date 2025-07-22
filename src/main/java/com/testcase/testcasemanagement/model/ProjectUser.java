// src/main/java/com/testcase/testcasemanagement/model/ProjectUser.java
//ProjectUser: 프로젝트-사용자 매핑 및 역할 관리.
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "project_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
public class ProjectUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String role; // PROJECT_MANAGER, CONTRIBUTOR 등
}
