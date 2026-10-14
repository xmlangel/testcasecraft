// src/main/java/com/testcase/testcasemanagement/model/TestResultAttachment.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** ICT-361: 테스트 결과 첨부파일 엔티티 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 결과 첨부: 테스트 결과에 올린 스크린샷, 로그 등의 파일 | Test Result Attachment: file such as a screenshot or log uploaded to a test result")
@Table(
    name = "test_result_attachments",
    indexes = {
      @Index(name = "idx_result_attachment_test_result", columnList = "test_result_id"),
      @Index(name = "idx_result_attachment_created_at", columnList = "created_at"),
      @Index(name = "idx_result_attachment_file_name", columnList = "original_file_name")
    })
public class TestResultAttachment {
  @Comment("식별자: 첨부 파일을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies an attached file (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("테스트 결과: 이 파일이 첨부된 테스트 결과 (값 영역: test_results.id 참조) | Test Result: test result this file is attached to (Value domain: references test_results.id)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "test_result_id", nullable = false)
  private TestResult testResult;

  /** 원본 파일명 */
  @Comment("원본 파일명: 사용자가 업로드한 파일의 원래 이름 (값 영역: 255자 이하) | Original File Name: original name of the file uploaded by the user (Value domain: up to 255 characters)")
  @Column(name = "original_file_name", nullable = false, length = 255)
  private String originalFileName;

  /** 저장된 파일명 (UUID 기반) */
  @Comment("저장 파일명: UUID 기반으로 생성되어 서버에 저장된 파일명 (값 영역: 255자 이하) | Stored File Name: file name generated from a UUID and stored on the server (Value domain: up to 255 characters)")
  @Column(name = "stored_file_name", nullable = false, length = 255)
  private String storedFileName;

  /** 파일 크기 (bytes) */
  @Comment("파일 크기: 업로드된 파일의 크기 (값 영역: 바이트) | File Size: size of the uploaded file (Value domain: bytes)")
  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  /** 파일 MIME 타입 */
  @Comment("MIME 유형: 파일의 MIME 유형 (값 영역: 100자 이하, 예: image/png) | MIME Type: MIME type of the file (Value domain: up to 100 characters, e.g. image/png)")
  @Column(name = "mime_type", length = 100)
  private String mimeType;

  /** 파일 저장 경로 */
  @Comment("파일 경로: 서버에서 파일이 저장된 절대 경로 | File Path: absolute path where the file is stored on the server")
  @Column(name = "file_path", nullable = false)
  private String filePath;

  /** 파일 업로드 시간 */
  @Comment("생성 일시: 파일이 업로드된 일시 | Created Date Time: date and time the file was uploaded")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  /** 업로드한 사용자 */
  @Comment("업로드자: 이 파일을 업로드한 사용자 (값 영역: users.id 참조) | Uploader: user who uploaded this file (Value domain: references users.id)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by")
  private User uploadedBy;

  /** 파일 설명 (선택사항) */
  @Comment("설명: 파일에 대한 추가 설명 | Description: additional description of the file")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** 파일 상태 (ACTIVE, DELETED) */
  @Comment("상태: 파일의 상태 (값 영역: ACTIVE, DELETED) | Status: status of the file (Value domain: ACTIVE, DELETED)")
  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 20)
  private AttachmentStatus status = AttachmentStatus.ACTIVE;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    if (status == null) {
      status = AttachmentStatus.ACTIVE;
    }
  }

  /** 파일 확장자 추출 */
  public String getFileExtension() {
    if (originalFileName == null) return "";
    int lastDot = originalFileName.lastIndexOf('.');
    return lastDot > 0 ? originalFileName.substring(lastDot + 1).toLowerCase() : "";
  }

  /** 파일 크기를 사람이 읽기 쉬운 형태로 변환 */
  public String getFormattedFileSize() {
    if (fileSize == null) return "0 B";

    long size = fileSize;
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return String.format("%.1f KB", size / 1024.0);
    if (size < 1024 * 1024 * 1024) return String.format("%.1f MB", size / (1024.0 * 1024.0));
    return String.format("%.1f GB", size / (1024.0 * 1024.0 * 1024.0));
  }

  /** 파일이 텍스트 파일인지 확인 */
  public boolean isTextFile() {
    if (mimeType == null) return false;
    return mimeType.startsWith("text/")
        || mimeType.equals("application/json")
        || mimeType.equals("application/xml");
  }

  /** 다운로드 가능한 파일인지 확인 */
  public boolean isDownloadable() {
    return status == AttachmentStatus.ACTIVE && storedFileName != null;
  }

  public enum AttachmentStatus {
    ACTIVE,
    DELETED
  }
}
