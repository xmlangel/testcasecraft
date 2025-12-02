// src/main/java/com/testcase/testcasemanagement/dto/JunitTestResultDto.java

package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.JunitProcessStatus;
import com.testcase.testcasemanagement.model.JunitTestResult;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-203: JUnit 테스트 결과 DTO (JSON 직렬화 최적화)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JunitTestResultDto {

    private String id;
    private String fileName;
    private Long fileSize;
    private String fileChecksum;
    private String projectId;
    private String testExecutionName;
    private String description;

    // 테스트 플랜 정보
    private String testPlanId;
    private String testPlanName;

    // 통계 정보
    private Integer totalTests;
    private Integer failures;
    private Integer errors;
    private Integer skipped;
    private Double totalTime;
    private Double successRate;

    // 상태 정보
    private JunitProcessStatus status;
    private LocalDateTime uploadedAt;
    private LocalDateTime parsedAt;
    private String errorMessage;

    // 사용자 정보
    private String uploadedByUsername;
    private String uploadedByDisplayName;

    /**
     * Entity to DTO 변환
     */
    public static JunitTestResultDto fromEntity(JunitTestResult entity) {
        if (entity == null)
            return null;

        JunitTestResultDto dto = new JunitTestResultDto();
        dto.setId(entity.getId());
        dto.setFileName(entity.getFileName());
        dto.setFileSize(entity.getFileSize());
        dto.setFileChecksum(entity.getFileChecksum());
        dto.setProjectId(entity.getProjectId());
        dto.setTestExecutionName(entity.getTestExecutionName());
        dto.setDescription(entity.getDescription());

        dto.setTestPlanId(entity.getTestPlanId());
        // testPlanName은 Service 계층에서 별도로 설정해야 함 (Entity에 연관관계가 없으므로)

        dto.setTotalTests(entity.getTotalTests());
        dto.setFailures(entity.getFailures());
        dto.setErrors(entity.getErrors());
        dto.setSkipped(entity.getSkipped());
        dto.setTotalTime(entity.getTotalTime());
        dto.setSuccessRate(entity.getSuccessRate());

        dto.setStatus(entity.getStatus());
        dto.setUploadedAt(entity.getUploadedAt());
        dto.setParsedAt(entity.getParsedAt());
        dto.setErrorMessage(entity.getErrorMessage());

        // 사용자 정보 (Lazy Loading 방지)
        if (entity.getUploadedBy() != null) {
            dto.setUploadedByUsername(entity.getUploadedBy().getUsername());
            dto.setUploadedByDisplayName(entity.getUploadedBy().getName());
        }

        return dto;
    }
}