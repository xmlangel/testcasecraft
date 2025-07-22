// src/main/java/com/testcase/testcasemanagement/model/OrganizationUser.java
//OrganizationUser: 조직-사용자 매핑 및 역할 관리.
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "organization_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"organization_id", "user_id"})
})
public class OrganizationUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String role; // OWNER, ADMIN, MEMBER 등
}
