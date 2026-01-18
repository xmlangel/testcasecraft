// src/main/java/com/testcase/testcasemanagement/model/JunitTestResult.java

package com.testcase.testcasemanagement.model;

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
 * ICT-203: JUnit XML 테스트 결과 파일의 최상위 엔티티
 * JUnit XML에서 파싱된 전체 테스트 실행 결과를 저장
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "junit_test_results", indexes = {
        @Index(name = "idx_junit_result_uploaded_at", columnList = "uploadedAt"),
        @Index(name = "idx_junit_result_project", columnList = "projectId"),
        @Index(name = "idx_junit_result_status", columnList = "status"),
        @Index(name = "idx_junit_result_project_status", columnList = "projectId, status"),
        @Index(name = "idx_junit_result_test_plan", columnList = "test_plan_id")
})
public class JunitTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    /**
     * 연관된 테스트 플랜 ID
     */
    @Column(name = "test_plan_id")
    private String testPlanId;

    /**
     * 업로드된 파일명
     */
    @Column(nullable = false, length = 255)
    private String fileName;

    /**
     * 원본 파일 크기 (bytes)
     */
    @Column(nullable = false)
    private Long fileSize;

    /**
     * 파일 체크섬 (SHA-256)
     */
    @Column(length = 64)
    private String fileChecksum;

    /**
     * 연관된 프로젝트 ID
     */
    @Column(name = "project_id", nullable = false)
    private String projectId;

    /**
     * 테스트 실행 이름/제목
     */
    @Column(nullable = false, length = 200)
    private String testExecutionName;

    /**
     * 테스트 실행 설명
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 전체 테스트 수
     */
    @Column(nullable = false)
    private Integer totalTests = 0;

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
     * 전체 실행 시간 (초)
     */
    @Column(nullable = false)
    private Double totalTime = 0.0;

    /**
     * 처리 상태 (UPLOADING, PARSING, COMPLETED, FAILED)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JunitProcessStatus status = JunitProcessStatus.UPLOADING;

    /**
     * 업로드한 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    /**
     * 업로드 시간
     */
    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    /**
     * 파싱 완료 시간
     */
    private LocalDateTime parsedAt;

    /**
     * 원본 XML 파일 저장 경로
     */
    @Column(length = 500)
    private String originalFilePath;

    /**
     * 에러 메시지 (파싱 실패 시)
     */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * 연관된 테스트 스위트 목록
     */
    @OneToMany(mappedBy = "junitTestResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private List<JunitTestSuite> testSuites;

    /**
     * 편집 가능 여부
     */
    @Column(nullable = false)
    private Boolean isEditable = true;

    /**
     * 최종 수정 시간
     */
    private LocalDateTime lastModifiedAt;

    /**
     * 최종 수정자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_modified_by")
    private User lastModifiedBy;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }

    /**
     * 성공률 계산 (스킵된 테스트 제외)
     */
    public Double getSuccessRate() {
        if (totalTests == 0)
            return 0.0;
        int successCount = totalTests - failures - errors - skipped;
        return (double) successCount / totalTests * 100;
    }

    /**
     * 완료 여부 확인
     */
    public boolean isCompleted() {
        return status == JunitProcessStatus.COMPLETED;
    }

    /**
     * 실패 여부 확인
     */
    public boolean isFailed() {
        return status == JunitProcessStatus.FAILED;
    }

    /**
     * 편집 가능 여부 확인
     */
    public boolean canEdit() {
        return isEditable != null && isEditable && isCompleted();
    }
}