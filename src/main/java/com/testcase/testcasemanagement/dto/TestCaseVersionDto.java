// src/main/java/com/testcase/testcasemanagement/dto/TestCaseVersionDto.java

package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.testcase.testcasemanagement.model.TestStep;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ICT-349: 테스트케이스 버전 관리 시스템 - DTO
 * 
 * TestCaseVersion 엔티티의 데이터 전송 객체
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestCaseVersionDto {

    // ============ 기본 정보 ============
    
    private String id;
    private String testCaseId;
    private String projectId;
    private Integer versionNumber;
    private String versionLabel;
    private String versionDescription;
    private Boolean isCurrentVersion;

    // ============ 테스트케이스 데이터 스냅샷 ============

    private String name;
    private String type;
    private String description;
    private String preCondition;
    private String postCondition;
    private Boolean isAutomated;
    private String executionType;
    private String testTechnique;
    private String parentId;
    private List<TestStep> steps;
    private String expectedResults;
    private Integer displayOrder;
    private String priority;
    private Integer sequentialId;
    private String displayId;

    // ============ 버전 메타데이터 ============

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    private String createdBy;
    private String createdByName;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime originalUpdatedAt;
    
    private String changeType;
    private String changeSummary;
    private String versionTag;
    private Integer usageCount;

    // ============ 계산된 필드들 (읽기 전용) ============

    /**
     * 버전 요약 정보 (예: "v3 (Bug Fix) [현재]")
     */
    private String versionSummary;

    /**
     * 이전 버전과의 변경점 개수
     */
    private Integer changeCount;

    /**
     * 버전 생성 후 경과 시간 (상대 시간)
     */
    private String relativeTime;

    /**
     * 현재 활성 버전 여부를 문자열로 표현
     */
    private String currentVersionStatus;

    // ============ 비교 관련 필드들 ============

    /**
     * 다른 버전과 비교할 때 사용되는 필드들
     */
    private VersionComparisonDto comparison;

    // ============ 헬퍼 메소드들 ============

    /**
     * 현재 버전 여부를 문자열로 반환
     */
    public String getCurrentVersionStatus() {
        return Boolean.TRUE.equals(isCurrentVersion) ? "현재 버전" : "이전 버전";
    }

    /**
     * 버전 요약 정보 생성
     */
    public String getVersionSummary() {
        if (versionSummary != null) return versionSummary;
        
        StringBuilder summary = new StringBuilder();
        summary.append("v").append(versionNumber != null ? versionNumber : "?");
        
        if (versionLabel != null && !versionLabel.trim().isEmpty()) {
            summary.append(" (").append(versionLabel).append(")");
        }
        
        if (Boolean.TRUE.equals(isCurrentVersion)) {
            summary.append(" [현재]");
        }
        
        return summary.toString();
    }

    /**
     * 변경 유형을 한국어로 반환
     */
    public String getChangeTypeKorean() {
        if (changeType == null) return "알 수 없음";
        
        return switch (changeType) {
            case "CREATE" -> "생성";
            case "UPDATE" -> "수정";
            case "MANUAL_SAVE" -> "수동 저장";
            case "RESTORE" -> "복원";
            default -> changeType;
        };
    }

    /**
     * 버전 태그를 한국어로 반환
     */
    public String getVersionTagKorean() {
        if (versionTag == null) return "안정";
        
        return switch (versionTag) {
            case "STABLE" -> "안정";
            case "DRAFT" -> "임시";
            case "ARCHIVED" -> "보관";
            case "DEPRECATED" -> "폐기";
            default -> versionTag;
        };
    }

    // ============ 내부 클래스: 버전 비교 DTO ============

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VersionComparisonDto {
        private String compareWithVersionId;
        private Integer compareWithVersionNumber;
        private List<String> changedFields;
        private String diffSummary;
        private Boolean hasSignificantChanges;
    }

    // ============ 빌더 패턴 지원 ============

    /**
     * 현재 버전으로 설정하는 편의 메소드
     */
    public TestCaseVersionDto markAsCurrent() {
        this.isCurrentVersion = true;
        this.versionTag = "STABLE";
        return this;
    }

    /**
     * 임시 버전으로 설정하는 편의 메소드
     */
    public TestCaseVersionDto markAsDraft() {
        this.isCurrentVersion = false;
        this.versionTag = "DRAFT";
        return this;
    }

    @Override
    public String toString() {
        return "TestCaseVersionDto{" +
                "id='" + id + '\'' +
                ", testCaseId='" + testCaseId + '\'' +
                ", versionNumber=" + versionNumber +
                ", isCurrentVersion=" + isCurrentVersion +
                ", name='" + name + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
