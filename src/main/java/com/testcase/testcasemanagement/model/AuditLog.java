// src/main/java/com/testcase/testcasemanagement/model/AuditLog.java
//AuditLog: 주요 엔티티의 변경 이력 기록.
package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 50)
    private String entityType; // USER, PROJECT, ORGANIZATION 등

    @Column(nullable = false)
    private String entityId;

    @Column(nullable = false, length = 50)
    private String action; // CREATE, UPDATE, DELETE 등

    @ManyToOne
    @JoinColumn(name = "performed_by")
    private User performedBy;

    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String details;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
