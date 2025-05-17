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
@Table(name = "test_executions")
public class TestExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @Column(name = "test_plan_id")
    private String testPlanId;

    @Column(name = "projectid")
    private String projectId;

    private String description;

    private String status; // NOTSTARTED, INPROGRESS, COMPLETED

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "testExecution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TestResult> results = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
