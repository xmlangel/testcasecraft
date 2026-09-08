package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.JunitCaseAttachment;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 자동화 결과 케이스 첨부를 화면에 넘길 형태. 저장소 키는 내보내지 않는다 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JunitCaseAttachmentDto {
  private String id;
  private String junitTestCaseId;
  private String originalFileName;
  private Long fileSize;
  private String mimeType;
  private String description;
  private LocalDateTime createdAt;
  private String uploadedBy;
  private boolean image;
  /** 내려받기·미리보기에 쓸 주소 */
  private String downloadUrl;

  public static JunitCaseAttachmentDto from(JunitCaseAttachment a) {
    return JunitCaseAttachmentDto.builder()
        .id(a.getId())
        .junitTestCaseId(a.getJunitTestCase() != null ? a.getJunitTestCase().getId() : null)
        .originalFileName(a.getOriginalFileName())
        .fileSize(a.getFileSize())
        .mimeType(a.getMimeType())
        .description(a.getDescription())
        .createdAt(a.getCreatedAt())
        .uploadedBy(a.getUploadedBy() != null ? a.getUploadedBy().getUsername() : null)
        .image(a.isImage())
        .downloadUrl("/api/junit-results/attachments/" + a.getId() + "/download")
        .build();
  }
}
