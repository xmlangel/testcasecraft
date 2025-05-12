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
@Table(name = "test_results")
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

    // getter/setter 생략
}
