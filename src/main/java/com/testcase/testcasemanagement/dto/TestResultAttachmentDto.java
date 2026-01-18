// src/main/java/com/testcase/testcasemanagement/dto/TestResultAttachmentDto.java

package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.TestResultAttachment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-361: 테스트 결과 첨부파일 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResultAttachmentDto {

    private String id;
    private String testResultId;
    private String originalFileName;
    private String storedFileName;
    private Long fileSize;
    private String formattedFileSize;
    private String mimeType;
    private String fileExtension;
    private LocalDateTime createdAt;
    private String uploadedBy;
    private String uploadedByName;
    private String description;
    private String status;
    private boolean isTextFile;
    private boolean isDownloadable;
    private String downloadUrl;

    /**
     * Entity를 DTO로 변환하는 정적 팩토리 메서드
     */
    public static TestResultAttachmentDto fromEntity(TestResultAttachment entity) {
        if (entity == null) return null;

        TestResultAttachmentDto dto = new TestResultAttachmentDto();
        dto.setId(entity.getId());
        dto.setTestResultId(entity.getTestResult() != null ? entity.getTestResult().getId() : null);
        dto.setOriginalFileName(entity.getOriginalFileName());
        dto.setStoredFileName(entity.getStoredFileName());
        dto.setFileSize(entity.getFileSize());
        dto.setFormattedFileSize(entity.getFormattedFileSize());
        dto.setMimeType(entity.getMimeType());
        dto.setFileExtension(entity.getFileExtension());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUploadedBy(entity.getUploadedBy() != null ? entity.getUploadedBy().getId() : null);
        dto.setUploadedByName(entity.getUploadedBy() != null ? entity.getUploadedBy().getName() : "알 수 없음");
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setTextFile(entity.isTextFile());
        dto.setDownloadable(entity.isDownloadable());
        dto.setDownloadUrl(entity.isDownloadable() ? "/api/attachments/" + entity.getId() + "/download" : null);

        return dto;
    }

    /**
     * 파일이 이미지인지 확인
     */
    public boolean isImageFile() {
        return mimeType != null && mimeType.startsWith("image/");
    }

    /**
     * 파일이 PDF인지 확인
     */
    public boolean isPdfFile() {
        return "application/pdf".equals(mimeType);
    }

    /**
     * 파일 크기가 1MB 이상인지 확인
     */
    public boolean isLargeFile() {
        return fileSize != null && fileSize > 1024 * 1024; // 1MB
    }

    /**
     * 업로드 시간 기준으로 최근 파일인지 확인 (24시간 이내)
     */
    public boolean isRecentFile() {
        return createdAt != null && createdAt.isAfter(LocalDateTime.now().minusHours(24));
    }
}