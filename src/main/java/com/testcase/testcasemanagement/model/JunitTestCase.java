// src/main/java/com/testcase/testcasemanagement/model/JunitTestCase.java

package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-203: JUnit XML 개별 테스트 케이스 엔티티
 * JUnit XML의 <testcase> 요소에 해당
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "junit_test_cases", indexes = {
    @Index(name = "idx_junit_case_suite", columnList = "junitTestSuiteId"),
    @Index(name = "idx_junit_case_name", columnList = "name"),
    @Index(name = "idx_junit_case_status", columnList = "junitTestSuiteId, status"),
    @Index(name = "idx_junit_case_classname", columnList = "className")
})
public class JunitTestCase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;
    
    /**
     * 상위 테스트 스위트
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "junit_test_suite_id", nullable = false)
    @JsonBackReference
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private JunitTestSuite junitTestSuite;
    
    /**
     * 테스트 메소드 이름
     */
    @Column(nullable = false, length = 255)
    private String name;
    
    /**
     * 클래스명 (풀패키지명 포함)
     */
    @Column(nullable = false, length = 500)
    private String className;
    
    /**
     * 실행 시간 (초)
     */
    @Column(nullable = false)
    private Double time = 0.0;
    
    /**
     * 테스트 상태 (PASSED, FAILED, ERROR, SKIPPED)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JunitTestStatus status = JunitTestStatus.PASSED;
    
    /**
     * 실패/에러 메시지
     */
    @Column(columnDefinition = "TEXT")
    private String failureMessage;
    
    /**
     * 실패/에러 타입
     */
    @Column(length = 255)
    private String failureType;
    
    /**
     * 스택 트레이스
     */
    @Column(columnDefinition = "TEXT")
    private String stackTrace;
    
    /**
     * 스킵 메시지
     */
    @Column(columnDefinition = "TEXT")
    private String skipMessage;
    
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
     * 사용자가 편집한 제목
     */
    @Column(length = 500)
    private String userTitle;
    
    /**
     * 사용자가 편집한 설명
     */
    @Column(columnDefinition = "TEXT")
    private String userDescription;
    
    /**
     * 사용자가 편집한 메모
     */
    @Column(columnDefinition = "TEXT")
    private String userNotes;
    
    /**
     * 태그 (콤마로 구분)
     */
    @Column(length = 500)
    private String tags;
    
    /**
     * 우선순위 (사용자 설정)
     */
    @Column(length = 20)
    private String priority;
    
    /**
     * 사용자가 변경한 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JunitTestStatus userStatus;
    
    /**
     * 첨부파일 경로들 (JSON 배열 형태로 저장)
     */
    @Column(columnDefinition = "TEXT")
    private String attachments;
    
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
    
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
    
    /**
     * 실제 표시할 제목 반환 (사용자 편집 제목이 있으면 그것을, 없으면 원본 이름)
     */
    public String getDisplayTitle() {
        return userTitle != null && !userTitle.trim().isEmpty() ? userTitle : name;
    }
    
    /**
     * 실제 표시할 상태 반환 (사용자가 변경한 상태가 있으면 그것을, 없으면 원본 상태)
     */
    public JunitTestStatus getDisplayStatus() {
        return userStatus != null ? userStatus : status;
    }
    
    /**
     * 사용자가 편집한 내용이 있는지 확인
     */
    public boolean hasUserEdits() {
        return (userTitle != null && !userTitle.trim().isEmpty()) ||
               (userDescription != null && !userDescription.trim().isEmpty()) ||
               (userNotes != null && !userNotes.trim().isEmpty()) ||
               (userStatus != null) ||
               (tags != null && !tags.trim().isEmpty()) ||
               (priority != null && !priority.trim().isEmpty());
    }
    
    /**
     * 테스트가 성공했는지 확인
     */
    public boolean isSuccess() {
        return getDisplayStatus() == JunitTestStatus.PASSED;
    }
    
    /**
     * 테스트가 실패했는지 확인
     */
    public boolean isFailure() {
        JunitTestStatus displayStatus = getDisplayStatus();
        return displayStatus == JunitTestStatus.FAILED || displayStatus == JunitTestStatus.ERROR;
    }
    
    /**
     * 테스트가 스킵되었는지 확인
     */
    public boolean isSkipped() {
        return getDisplayStatus() == JunitTestStatus.SKIPPED;
    }
}