// src/main/java/com/testcase/testcasemanagement/model/GroupMember.java
// Group, GroupMember: 조직/프로젝트 내 그룹 및 멤버 관리.
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("그룹 구성원: 그룹에 속한 사용자와 그 그룹 안에서의 역할 | Group Member: user who belongs to a group, together with that user's role within the group")
@Table(
    name = "group_members",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"group_id", "user_id"})},
    indexes = {
      @Index(name = "idx_group_member_role", columnList = "group_id, role_in_group"),
      @Index(name = "idx_user_group", columnList = "user_id, group_id")
    })
public class GroupMember {
  @Comment("그룹 멤버 식별자: 이 그룹 멤버십 행을 유일하게 가리키는 값 (값 영역: UUID 36자) | Group Member Identifier: value that uniquely identifies this group membership row (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment(value = "그룹 식별자: 이 멤버가 속한 그룹을 가리키는 값 (값 영역: groups.id 참조, UUID 36자) | Group Identifier: value that points to the group to which this member belongs (Value domain: references groups.id, UUID, 36 characters)", on = "group_id")
  @ManyToOne(optional = false)
  @JoinColumn(name = "group_id")
  private Group group;

  @Comment(value = "사용자 식별자: 그룹의 멤버인 사용자를 가리키는 값 (값 영역: users.id 참조, UUID 36자) | User Identifier: value that points to the user who is a member of the group (Value domain: references users.id, UUID, 36 characters)", on = "user_id")
  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @Comment(value = "그룹 역할 코드: 이 멤버가 그룹에서 맡는 역할을 나타내는 코드 (값 영역: LEADER, CO_LEADER, MEMBER) | Group Role Code: code that indicates the role this member holds in the group (Value domain: LEADER, CO_LEADER, MEMBER)", on = "role_in_group")
  @Enumerated(EnumType.STRING)
  @Column(name = "role_in_group", nullable = false, length = 20)
  private GroupRole roleInGroup; // LEADER, MEMBER

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved", on = "created_at")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시 | Updated Date Time: date and time this row was last changed", on = "updated_at")
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
    return group != null && group.getOrganization() != null
        ? group.getOrganization().getName()
        : null;
  }

  public String getProjectName() {
    return group != null && group.getProject() != null ? group.getProject().getName() : null;
  }
}
