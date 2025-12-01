// src/main/java/com/testcase/testcasemanagement/model/TestCaseVersion.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ICT-349: 테스트케이스 버전 관리 시스템 - TestCaseVersion 엔티티
 * 
 * 테스트케이스의 모든 버전을 저장하고 관리하는 엔티티입니다.
 * 테스트케이스가 수정될 때마다 자동으로 새로운 버전이 생성됩니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "testcase_versions", indexes = {
        @Index(name = "idx_version_testcase_id", columnList = "testcase_id"),
        @Index(name = "idx_version_number", columnList = "version_number"),
        @Index(name = "idx_version_testcase_version", columnList = "testcase_id, version_number"),
        @Index(name = "idx_version_created_at", columnList = "created_at"),
        @Index(name = "idx_version_is_current", columnList = "is_current_version"),
        @Index(name = "idx_version_project_id", columnList = "project_id")
})
public class TestCaseVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    /**
     * 연관된 테스트케이스 ID (원본 테스트케이스)
     */
    @Column(name = "testcase_id", nullable = false)
    private String testCaseId;

    /**
     * 프로젝트 ID (성능 최적화를 위한 중복 저장)
     */
    @Column(name = "project_id", nullable = false)
    private String projectId;

    /**
     * 버전 번호 (1부터 시작하는 순차 번호)
     */
    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    /**
     * 버전 제목/라벨 (사용자가 지정 가능, 예: "v1.0", "Initial Version", "Bug Fix")
     */
    @Column(name = "version_label", length = 100)
    private String versionLabel;

    /**
     * 버전 설명/변경 사항 요약
     */
    @Column(name = "version_description", columnDefinition = "TEXT")
    private String versionDescription;

    /**
     * 현재 활성 버전 여부 (테스트 실행 시 사용되는 버전)
     * 각 테스트케이스마다 하나의 버전만 true
     */
    @Column(name = "is_current_version", nullable = false)
    private Boolean isCurrentVersion = false;

    // ============ 테스트케이스 데이터 스냅샷 (버전별 저장) ============

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String preCondition;

    @Column(columnDefinition = "TEXT", name = "post_condition")
    private String postCondition;

    @Column(name = "is_automated")
    private Boolean isAutomated = Boolean.FALSE;

    @Column(name = "execution_type", length = 50)
    private String executionType = "Manual";

    @Column(columnDefinition = "TEXT", name = "test_technique")
    private String testTechnique;

    @Column(name = "parent_id")
    private String parentId;

    /**
     * 테스트 스텝 (JSON 형태로 저장)
     * TestStep 리스트를 JSON으로 직렬화하여 저장
     */
    @Column(name = "steps_json", columnDefinition = "TEXT")
    private String stepsJson;

    @Column(columnDefinition = "TEXT", name = "expected_results")
    private String expectedResults;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "priority")
    private String priority;

    @Column(name = "sequential_id")
    private Integer sequentialId;

    @Column(name = "display_id", length = 50)
    private String displayId;

    // ============ 버전 메타데이터 ============

    /**
     * 버전 생성 시점
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 버전 생성자 (사용자 ID)
     */
    @Column(name = "created_by", length = 36)
    private String createdBy;

    /**
     * 버전 생성자 이름 (성능 최적화를 위한 중복 저장)
     */
    @Column(name = "created_by_name", length = 100)
    private String createdByName;

    /**
     * 원본 테스트케이스의 해당 시점 updatedAt
     */
    @Column(name = "original_updated_at")
    private LocalDateTime originalUpdatedAt;

    /**
     * 변경 유형 (CREATE, UPDATE, MANUAL_SAVE)
     */
    @Column(name = "change_type", length = 20)
    private String changeType = "UPDATE";

    /**
     * 이전 버전과의 주요 차이점 (자동 감지 또는 사용자 입력)
     */
    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;

    /**
     * 버전 태그 (STABLE, DRAFT, ARCHIVED 등)
     */
    @Column(name = "version_tag", length = 20)
    private String versionTag = "STABLE";

    /**
     * 복원/선택된 횟수 (사용 빈도 추적)
     */
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null)
            this.createdAt = LocalDateTime.now();
        if (this.isCurrentVersion == null)
            this.isCurrentVersion = false;
        if (this.usageCount == null)
            this.usageCount = 0;
        if (this.changeType == null)
            this.changeType = "UPDATE";
        if (this.versionTag == null)
            this.versionTag = "STABLE";
    }

    /**
     * 현재 버전으로 설정 (다른 버전들은 자동으로 false가 됨)
     */
    public void setAsCurrentVersion() {
        this.isCurrentVersion = true;
        this.usageCount = this.usageCount != null ? this.usageCount + 1 : 1;
    }

    /**
     * 버전 사용 횟수 증가
     */
    public void incrementUsageCount() {
        this.usageCount = this.usageCount != null ? this.usageCount + 1 : 1;
    }

    /**
     * 버전 요약 정보 생성
     */
    public String getVersionSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("v").append(versionNumber);

        if (versionLabel != null && !versionLabel.trim().isEmpty()) {
            summary.append(" (").append(versionLabel).append(")");
        }

        if (isCurrentVersion) {
            summary.append(" [현재]");
        }

        return summary.toString();
    }

    @Override
    public String toString() {
        return "TestCaseVersion{" +
                "id='" + id + '\'' +
                ", testCaseId='" + testCaseId + '\'' +
                ", versionNumber=" + versionNumber +
                ", isCurrentVersion=" + isCurrentVersion +
                ", name='" + name + '\'' +
                '}';
    }
}
