// src/main/java/com/testcase/testcasemanagement/model/OrganizationUser.java
// OrganizationUser: 조직-사용자 매핑 및 역할 관리.
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("조직 구성원: 조직에 속한 사용자와 그 조직 안에서의 역할")
@Table(
    name = "organization_users",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"organization_id", "user_id"})},
    indexes = {
      @Index(name = "idx_org_user_role", columnList = "organization_id, role_in_organization"),
      @Index(name = "idx_user_org", columnList = "user_id, organization_id")
    })
public class OrganizationUser {
  @Comment("조직 사용자 식별자: 이 조직 멤버십 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment(value = "조직 식별자: 이 멤버가 속한 조직을 가리키는 값 (값 영역: organizations.id 참조, UUID 36자)", on = "organization_id")
  @JsonBackReference("organization-members")
  @ManyToOne(optional = false)
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Comment(value = "사용자 식별자: 조직의 멤버인 사용자를 가리키는 값 (값 영역: users.id 참조, UUID 36자)", on = "user_id")
  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @Comment(value = "조직 역할 코드: 이 멤버가 조직에서 맡는 역할을 나타내는 코드 (값 영역: OWNER, ADMIN, MEMBER)", on = "role_in_organization")
  @Enumerated(EnumType.STRING)
  @Column(name = "role_in_organization", nullable = false, length = 20)
  private OrganizationRole roleInOrganization; // OWNER, ADMIN, MEMBER

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시", on = "created_at")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시", on = "updated_at")
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
