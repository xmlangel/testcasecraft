package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "test_session_attachments",
    indexes = {
      @Index(name = "idx_session_attachment_session", columnList = "session_id"),
      @Index(name = "idx_session_attachment_status", columnList = "status")
    })
public class TestSessionAttachment {

  public enum AttachmentStatus {
    ACTIVE,
    DELETED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private TestSession session;

  @Column(name = "original_file_name", nullable = false, length = 255)
  private String originalFileName;

  @Column(name = "stored_file_name", nullable = false, length = 255)
  private String storedFileName;

  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  @Column(name = "mime_type", length = 100)
  private String mimeType;

  @Column(name = "file_path", nullable = false, length = 500)
  private String filePath;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by")
  private User uploadedBy;

  @Column(name = "description", length = 500)
  private String description;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AttachmentStatus status;

  @Column(name = "public_access_token", length = 100)
  private String publicAccessToken;

  @Column(name = "is_used_in_content")
  private Boolean isUsedInContent = false;

  @Column(name = "used_at")
  private LocalDateTime usedAt;

  public boolean isDownloadable() {
    return status == AttachmentStatus.ACTIVE;
  }

  public String getFormattedFileSize() {
    if (fileSize == null) return "0 B";
    if (fileSize < 1024) return fileSize + " B";
    if (fileSize < 1024 * 1024) return String.format("%.1f KB", fileSize / 1024.0);
    return String.format("%.1f MB", fileSize / (1024.0 * 1024.0));
  }
}
