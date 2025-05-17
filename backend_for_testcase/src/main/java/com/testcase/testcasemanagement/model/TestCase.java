// src/main/java/com/testcase/testcasemanagement/model/TestCase.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "testcases")
public class TestCase {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    // 프로젝트에 반드시 종속
    @ManyToOne(optional = false)
    @JoinColumn(name = "project_id")
    @JsonBackReference
    private Project project;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String type; // "folder" 또는 "testcase"만 허용

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String preCondition;

    @Column(name = "parent_id")
    private String parentId;

    // Lazy Initialization 문제 해결을 위한 FetchType 명시
    @ElementCollection
    @CollectionTable(name = "testcasesteps", joinColumns = @JoinColumn(name = "testcase_id"))
    @OrderColumn(name = "step_order")
    private List<TestStep> steps;

    @Column(columnDefinition = "TEXT", name = "expectedresults")
    private String expectedResults;

    @Column(name = "displayorder")
    private Integer displayOrder = 1;  // 기본값 0 설정

    @Column(name = "createdat", nullable = false, updatable = false)
    private LocalDateTime createdAt; //✅ 필수 필드

    @Column(name = "updatedat")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();

        if (this.displayOrder == null) {  // displayOrder 기본값 처리
            this.displayOrder = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 로깅용 toString() 오버라이드
    @Override
    public String toString() {
        return "TestCase{" +
                "expectedResults(length)=" + (expectedResults != null ? expectedResults.length() : 0) +
                "...}";
    }
}
