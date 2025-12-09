// src/main/java/com/testcase/testcasemanagement/model/DisplayIdHistory.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DisplayID 변경 이력을 저장하는 엔티티
 * 프로젝트 코드 변경 시 이전 DisplayID로도 테스트 케이스에 접근할 수 있도록 리다이렉트를 제공
 */
@Entity
@Table(name = "display_id_history", indexes = {
        @Index(name = "idx_old_display_id", columnList = "old_display_id"),
        @Index(name = "idx_test_case_id", columnList = "test_case_id")
})
@Getter
@Setter
public class DisplayIdHistory {

    @Id
    @Column(length = 50) // "dih-" (4자) + UUID (36자) = 40자를 수용하기 위해 50으로 설정
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @Column(name = "old_display_id", length = 50, nullable = false)
    private String oldDisplayId;

    @Column(name = "new_display_id", length = 50, nullable = false)
    private String newDisplayId;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

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
