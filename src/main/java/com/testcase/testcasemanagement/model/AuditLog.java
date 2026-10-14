// src/main/java/com/testcase/testcasemanagement/model/AuditLog.java
// AuditLog: 주요 엔티티의 변경 이력 기록.
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
@Comment("감사 로그: 사용자·프로젝트·조직 같은 주요 대상에 대한 생성·수정·삭제 기록")
@Table(name = "audit_logs")
public class AuditLog {
  @Comment("식별자: 이 감사 로그 기록을 유일하게 가리키는 값 (값 영역: UUID)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("엔티티 유형: 변경된 엔티티의 종류 (값 영역: USER, PROJECT, ORGANIZATION, TESTCASE 등)")
  @Column(nullable = false, length = 50)
  private String entityType; // USER, PROJECT, ORGANIZATION 등

  @Comment("엔티티 식별자: 변경된 엔티티의 식별자값")
  @Column(nullable = false)
  private String entityId;

  @Comment("작업 코드: 수행된 작업의 종류 (값 영역: CREATE, UPDATE, DELETE, ARCHIVE)")
  @Column(nullable = false, length = 50)
  private String action; // CREATE, UPDATE, DELETE 등

  @Comment("수행자 식별자: 이 작업을 수행한 사용자 (값 영역: users.id 참조)")
  @ManyToOne
  @JoinColumn(name = "performed_by")
  private User performedBy;

  @Comment("기록 일시: 이 작업이 수행된 일시")
  private LocalDateTime timestamp;

  @Comment("작업 상세: 변경된 필드와 값, 또는 작업 상세 정보")
  @Column(columnDefinition = "TEXT")
  private String details;

  @PrePersist
  protected void onCreate() {
    timestamp = LocalDateTime.now();
  }
}
