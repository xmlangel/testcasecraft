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
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Comment("테스트 세션 첨부: 테스트 세션 실행 중 수집한 파일")
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

  @Comment("식별자: 이 첨부를 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("테스트 세션 식별자: 이 첨부가 수집된 테스트 세션 (값 영역: test_sessions.id 참조)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private TestSession session;

  @Comment("원본 파일명: 업로드 시 사용자가 제공한 파일 이름 (값 영역: 255자 이하)")
  @Column(name = "original_file_name", nullable = false, length = 255)
  private String originalFileName;

  @Comment("저장된 파일명: 저장소에 저장할 때 사용한 충돌 없는 새 파일 이름 (값 영역: 255자 이하)")
  @Column(name = "stored_file_name", nullable = false, length = 255)
  private String storedFileName;

  @Comment("파일 크기: 첨부 파일의 바이트 수 (값 영역: 0 이상의 정수)")
  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  @Comment("MIME 유형: 파일의 미디어 유형 (값 영역: 100자 이하, 예: image/png)")
  @Column(name = "mime_type", length = 100)
  private String mimeType;

  @Comment("파일 경로: 오브젝트 저장소에 저장된 파일의 경로 또는 키 (값 영역: 500자 이하)")
  @Column(name = "file_path", nullable = false, length = 500)
  private String filePath;

  @Comment("업로드자 식별자: 이 첨부를 업로드한 사용자 (값 영역: users.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by")
  private User uploadedBy;

  @Comment("설명: 첨부 파일에 대한 설명 (값 영역: 500자 이하)")
  @Column(name = "description", length = 500)
  private String description;

  @Comment("생성 일시: 이 첨부가 수집된 일시")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Comment("상태: 이 첨부가 활성인지 삭제 표기되었는지 (값 영역: ACTIVE, DELETED)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AttachmentStatus status;

  @Comment("공개 접근 토큰: 로그인하지 않고 이 파일에 접근할 수 있는 일회용 토큰 (값 영역: 100자 이하)")
  @Column(name = "public_access_token", length = 100)
  private String publicAccessToken;

  @Comment("본문 사용 여부: 이 파일이 세션 노트에 실제로 인라인 포함되었는지 (값 영역: true, false)")
  @Column(name = "is_used_in_content")
  private Boolean isUsedInContent = false;

  @Comment("본문 삽입 일시: 이 파일이 본문에 처음 포함된 일시")
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
