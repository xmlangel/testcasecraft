// src/main/java/com/testcase/testcasemanagement/model/JunitTestSuite.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ICT-203: JUnit XML 테스트 스위트 엔티티
 * JUnit XML의 <testsuite> 요소에 해당
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "junit_test_suites", indexes = {
    @Index(name = "idx_junit_suite_result", columnList = "junitTestResultId"),
    @Index(name = "idx_junit_suite_name", columnList = "name"),
    @Index(name = "idx_junit_suite_status", columnList = "junitTestResultId, failures, errors")
})
public class JunitTestSuite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;
    
    /**
     * 상위 JUnit 테스트 결과
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "junit_test_result_id", nullable = false)
    @JsonBackReference
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private JunitTestResult junitTestResult;
    
    /**
     * 테스트 스위트 이름
     */
    @Column(nullable = false, length = 255)
    private String name;
    
    /**
     * 패키지 이름
     */
    @Column(length = 255)
    private String packageName;
    
    /**
     * 전체 테스트 수
     */
    @Column(nullable = false)
    private Integer tests = 0;
    
    /**
     * 실패한 테스트 수
     */
    @Column(nullable = false)
    private Integer failures = 0;
    
    /**
     * 에러가 발생한 테스트 수
     */
    @Column(nullable = false)
    private Integer errors = 0;
    
    /**
     * 스킵된 테스트 수
     */
    @Column(nullable = false)
    private Integer skipped = 0;
    
    /**
     * 실행 시간 (초)
     */
    @Column(nullable = false)
    private Double time = 0.0;
    
    /**
     * 타임스탬프
     */
    private LocalDateTime timestamp;
    
    /**
     * 호스트명
     */
    @Column(length = 100)
    private String hostname;
    
    /**
     * 시스템 아웃 로그
     */
    @Column(columnDefinition = "TEXT")
    private String systemOut;
    
    /**
     * 시스템 에러 로그
     */
    @Column(columnDefinition = "TEXT")
    private String systemErr;
    
    /**
     * 연관된 테스트 케이스 목록
     */
    @OneToMany(mappedBy = "junitTestSuite", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<JunitTestCase> testCases;
    
    /**
     * 사용자 편집 가능 메모
     */
    @Column(columnDefinition = "TEXT")
    private String userNotes;
    
    /**
     * 태그 (콤마로 구분)
     */
    @Column(length = 500)
    private String tags;
    
    /**
     * 최종 수정 시간
     */
    private LocalDateTime lastModifiedAt;
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
    
    /**
     * 성공률 계산 (스킵된 테스트 제외)
     */
    public Double getSuccessRate() {
        if (tests == 0) return 0.0;
        int successCount = tests - failures - errors - skipped;
        return (double) successCount / tests * 100;
    }
    
    /**
     * 전체 실패 수 (failures + errors)
     */
    public Integer getTotalFailures() {
        return failures + errors;
    }
    
    /**
     * 성공한 테스트 수
     */
    public Integer getSuccessCount() {
        return tests - failures - errors;
    }
    
    /**
     * 스위트 상태 확인
     */
    public String getStatus() {
        if (getTotalFailures() > 0) return "FAILED";
        if (skipped > 0 && skipped == tests) return "SKIPPED";
        if (tests > 0) return "PASSED";
        return "UNKNOWN";
    }
}