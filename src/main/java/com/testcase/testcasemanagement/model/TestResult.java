// src/main/java/com/testcase/testcasemanagement/model/TestResult.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "test_results", indexes = {
    // ICT-130: 대시보드 API 성능 최적화를 위한 인덱스
    @Index(name = "idx_test_result_executed_at", columnList = "executedAt"),
    @Index(name = "idx_test_result_case_executed", columnList = "testCaseId, executedAt"),
    @Index(name = "idx_test_result_execution_time", columnList = "test_execution_id, executedAt"),
    @Index(name = "idx_test_result_result_time", columnList = "result, executedAt"),
    @Index(name = "idx_test_result_executed_by", columnList = "executed_by"),
    
    // ICT-133: 대시보드 쿼리 성능을 위한 DB 인덱스 최적화
    @Index(name = "idx_test_result_execution_result", columnList = "test_execution_id, result")
})
public class TestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_execution_id")
    private TestExecution testExecution;

    private String testCaseId;
    private String result; // NOT_RUN, PASS, FAIL, BLOCKED

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime executedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "executed_by")
    private User executedBy;
}
