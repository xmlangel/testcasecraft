// src/main/java/com/testcase/testcasemanagement/dto/TestCaseAttachmentDto.java

package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.TestCaseAttachment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-386: 테스트케이스 첨부파일 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseAttachmentDto {

    private String id;
    private String testCaseId;
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
    private boolean isImageFile;
    private boolean isPdfFile;
    private boolean isDownloadable;
    private String downloadUrl;
    private String publicUrl;
    private Boolean isUsedInContent;
    private LocalDateTime usedAt;

    /**
     * Entity를 DTO로 변환하는 정적 팩토리 메서드
     */
    public static TestCaseAttachmentDto fromEntity(TestCaseAttachment entity) {
        if (entity == null) return null;

        TestCaseAttachmentDto dto = new TestCaseAttachmentDto();
        dto.setId(entity.getId());
        dto.setTestCaseId(entity.getTestCase() != null ? entity.getTestCase().getId() : null);
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
        dto.setImageFile(entity.isImageFile());
        dto.setPdfFile(entity.isPdfFile());
        dto.setDownloadable(entity.isDownloadable());
        dto.setDownloadUrl(entity.isDownloadable() ? "/api/testcase-attachments/" + entity.getId() + "/download" : null);
        if (entity.getPublicAccessToken() != null && !entity.getPublicAccessToken().isBlank()) {
            dto.setPublicUrl("/api/testcase-attachments/public/" + entity.getId() + "?token=" + entity.getPublicAccessToken());
        }
        dto.setIsUsedInContent(entity.getIsUsedInContent());
        dto.setUsedAt(entity.getUsedAt());

        return dto;
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
