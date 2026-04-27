package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.TestSessionAttachment;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TestSessionAttachmentDto {
  private String id;
  private String sessionId;
  private String originalFileName;
  private String storedFileName;
  private Long fileSize;
  private String formattedFileSize;
  private String mimeType;
  private String filePath;
  private String uploadedBy;
  private String description;
  private LocalDateTime createdAt;
  private String publicAccessToken;
  private Boolean isUsedInContent;

  public static TestSessionAttachmentDto fromEntity(TestSessionAttachment entity) {
    return TestSessionAttachmentDto.builder()
        .id(entity.getId())
        .sessionId(entity.getSession().getId())
        .originalFileName(entity.getOriginalFileName())
        .storedFileName(entity.getStoredFileName())
        .fileSize(entity.getFileSize())
        .formattedFileSize(entity.getFormattedFileSize())
        .mimeType(entity.getMimeType())
        .filePath(entity.getFilePath())
        .uploadedBy(entity.getUploadedBy() != null ? entity.getUploadedBy().getUsername() : null)
        .description(entity.getDescription())
        .createdAt(entity.getCreatedAt())
        .publicAccessToken(entity.getPublicAccessToken())
        .isUsedInContent(entity.getIsUsedInContent())
        .build();
  }
}
