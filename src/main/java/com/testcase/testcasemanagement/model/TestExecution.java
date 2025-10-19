// src/main/java/com/testcase/testcasemanagement/model/TestExecution.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "test_executions", indexes = {
    // ICT-130: 대시보드 API 성능 최적화를 위한 인덱스
    @Index(name = "idx_test_execution_status", columnList = "status"),
    @Index(name = "idx_test_execution_project_status", columnList = "project_id, status"),
    @Index(name = "idx_test_execution_start_date", columnList = "startDate"),
    @Index(name = "idx_test_execution_test_plan", columnList = "test_plan_id"),
    
    // ICT-133: 대시보드 쿼리 성능을 위한 DB 인덱스 최적화
    @Index(name = "idx_test_execution_project_status_updated", columnList = "project_id, status, updatedAt"),
    @Index(name = "idx_test_execution_status_updated_at", columnList = "status, updatedAt"),
    @Index(name = "idx_test_execution_project_testplan_status", columnList = "project_id, test_plan_id, status")
})
public class TestExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(name = "test_plan_id")
    private String testPlanId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;


    private String description;

    private String status; // NOTSTARTED, INPROGRESS, COMPLETED

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "testExecution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TestResult> results = new ArrayList<>();

    // 태그 목록
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "test_execution_tags", joinColumns = @JoinColumn(name = "test_execution_id"))
    @Column(name = "tag", length = 100)
    private List<String> tags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
