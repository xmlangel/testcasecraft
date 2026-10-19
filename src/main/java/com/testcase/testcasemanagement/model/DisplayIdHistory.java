// src/main/java/com/testcase/testcasemanagement/model/DisplayIdHistory.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** DisplayID 변경 이력을 저장하는 엔티티 프로젝트 코드 변경 시 이전 DisplayID로도 테스트 케이스에 접근할 수 있도록 리다이렉트를 제공 */
@Entity
@Comment("표시 ID 변경 이력: 테스트 케이스의 표시 ID 가 바뀔 때마다 남기는 이전 값과 새 값의 기록")
@Table(
    name = "display_id_history",
    indexes = {
      @Index(name = "idx_old_display_id", columnList = "old_display_id"),
      @Index(name = "idx_test_case_id", columnList = "test_case_id")
    })
@Getter
@Setter
public class DisplayIdHistory {

  @Comment("식별자: 이 변경 기록을 유일하게 가리키는 값 (값 영역: dih- 접두어 + UUID)")
  @Id
  @Column(length = 50) // "dih-" (4자) + UUID (36자) = 40자를 수용하기 위해 50으로 설정
  private String id;

  @Comment("테스트 케이스 식별자: 표시 ID가 변경된 테스트 케이스 (값 영역: testcases.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "test_case_id", nullable = false)
  private TestCase testCase;

  @Comment("이전 표시 ID: 변경 전 테스트 케이스의 표시 식별자 (값 영역: 50자 이하)")
  @Column(name = "old_display_id", length = 50, nullable = false)
  private String oldDisplayId;

  @Comment("새 표시 ID: 변경 후 테스트 케이스의 표시 식별자 (값 영역: 50자 이하)")
  @Column(name = "new_display_id", length = 50, nullable = false)
  private String newDisplayId;

  @Comment("변경 일시: 이 표시 ID 변경이 일어난 일시")
  @Column(name = "changed_at", nullable = false)
  private LocalDateTime changedAt;

  @Comment("변경 사유: 이 표시 ID를 변경한 이유 또는 배경 설명 (값 영역: 255자 이하)")
  @Column(name = "changed_reason", length = 255)
  private String changedReason;

  @PrePersist
  public void generateId() {
    if (this.id == null) {
      this.id = "dih-" + java.util.UUID.randomUUID().toString();
    }
    if (this.changedAt == null) {
      this.changedAt = LocalDateTime.now();
    }
  }
}
