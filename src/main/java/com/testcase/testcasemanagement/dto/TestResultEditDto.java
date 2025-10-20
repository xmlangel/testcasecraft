// src/main/java/com/testcase/testcasemanagement/dto/TestResultEditDto.java

package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.TestResultEdit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ICT-209: 테스트 결과 편집 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultEditDto {
    
    private String id;
    private String originalTestResultId;
    
    // 편집 가능한 필드들
    private String editedTestCaseName;
    private String editedResult;
    private String editedNotes;
    private String editedJiraIssueKey;
    private String editedJiraIssueUrl;
    private List<String> addedTags;
    private String editReason;
    
    // 편집 메타데이터
    private TestResultEdit.EditStatus editStatus;
    private Boolean isActive;
    private Integer editVersion;
    private LocalDateTime createdAt;
    private LocalDateTime appliedAt;
    
    // 편집자 정보
    private String editedByUserId;
    private String editedByUserName;
    private String approvedByUserId;
    private String approvedByUserName;
    
    // 원본 데이터 참조 (비교용)
    private OriginalTestResultDto originalData;
    
    /**
     * 원본 테스트 결과 정보 (편집 비교용)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OriginalTestResultDto {
        private String id;
        private String testCaseId;
        private String testCaseName;
        private String result;
        private String notes;
        private String jiraIssueKey;
        private String jiraIssueUrl;
        private LocalDateTime executedAt;
        private String executorName;
        private String folderPath;
    }
    
    /**
     * 편집 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateEditRequestDto {
        private String originalTestResultId;
        private String editedTestCaseName;
        private String editedResult;
        private String editedNotes;
        private String editedJiraIssueKey;
        private String editedJiraIssueUrl;
        private List<String> addedTags;
        private String editReason;
        private Boolean saveAsDraft; // true면 임시저장, false면 승인요청
    }
    
    /**
     * 편집 승인/거부 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditApprovalRequestDto {
        private String editId;
        private Boolean approved; // true: 승인, false: 거부
        private String approvalComment;
    }
    
    /**
     * 편집 목록 필터 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditFilterDto {
        private String projectId;
        private String testExecutionId;
        private String editedByUserId;
        private TestResultEdit.EditStatus editStatus;
        private Boolean activeOnly;
        private LocalDateTime fromDate;
        private LocalDateTime toDate;
        @Builder.Default
        private int page = 0;
        @Builder.Default
        private int size = 20;
        @Builder.Default
        private String sortBy = "createdAt";
        @Builder.Default
        private String sortDirection = "DESC";
    }
    
    /**
     * 편집 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditStatisticsDto {
        private long totalEdits;
        private long draftEdits;
        private long pendingEdits;
        private long approvedEdits;
        private long appliedEdits;
        private long rejectedEdits;
        private long revertedEdits;
        private double approvalRate;
        private long totalEditsByCurrentUser;
        private long pendingApprovalsForCurrentUser;
    }
    
    /**
     * 편집 이력 비교 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditComparisonDto {
        private String fieldName;
        private String originalValue;
        private String editedValue;
        private Boolean hasChange;
        private String changeType; // ADDED, MODIFIED, REMOVED
    }
    
    /**
     * 편집본 적용 결과 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditApplicationResultDto {
        private String editId;
        private String originalTestResultId;
        private Boolean success;
        private String message;
        private List<EditComparisonDto> appliedChanges;
        private LocalDateTime appliedAt;
        private String appliedByUserId;
        private String appliedByUserName;
    }
}