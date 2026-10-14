// src/main/java/com/testcase/testcasemanagement/model/TestCaseAttachment.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/** ICT-386: 테스트케이스 첨부파일 엔티티 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 케이스 첨부: 테스트 케이스에 올린 파일 | Test Case Attachment: file uploaded to a test case")
@Table(
    name = "test_case_attachments",
    indexes = {
      @Index(name = "idx_attachment_test_case", columnList = "test_case_id"),
      @Index(name = "idx_attachment_created_at", columnList = "created_at"),
      @Index(name = "idx_attachment_file_name", columnList = "original_file_name")
    })
public class TestCaseAttachment {
  @Comment("식별자: 이 첨부를 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies this attachment (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  /**
   * 이 첨부를 올린 테스트케이스. 케이스가 지워지면 null 이 된다.
   *
   * <p>결과 노트에 붙여넣은 이미지도 테스트케이스에 매달려 올라간다. 케이스를 지울 때 이 기록까지 지우면, 케이스와 달리 그대로 남는 실행 결과의 노트에서 이미지가
   * 사라진다. 소유만 비우고 기록은 남겨, 공개 토큰으로 내려받는 이미지가 계속 보이게 한다.
   */
  @Comment("테스트 케이스 식별자: 이 첨부가 올려진 테스트 케이스 (값 영역: testcases.id 참조, 케이스 삭제 시 null) | Test Case Identifier: test case to which this attachment was uploaded (Value domain: references testcases.id, null when the case is deleted)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "test_case_id")
  private TestCase testCase;

  /** 원본 파일명 */
  @Comment("원본 파일명: 업로드 시 사용자가 제공한 파일 이름 (값 영역: 255자 이하) | Original File Name: file name provided by the user at upload time (Value domain: up to 255 characters)")
  @Column(name = "original_file_name", nullable = false, length = 255)
  private String originalFileName;

  /** 저장된 파일명 (UUID 기반) */
  @Comment("저장된 파일명: 저장소에 저장할 때 사용한 충돌 없는 새 파일 이름 (값 영역: 255자 이하) | Stored File Name: new collision-free file name used when saving the file to storage (Value domain: up to 255 characters)")
  @Column(name = "stored_file_name", nullable = false, length = 255)
  private String storedFileName;

  /** 파일 크기 (bytes) */
  @Comment("파일 크기: 첨부 파일의 바이트 수 (값 영역: 0 이상의 정수) | File Size: number of bytes in the attached file (Value domain: integer of 0 or greater)")
  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  /** 파일 MIME 타입 */
  @Comment("MIME 유형: 파일의 미디어 유형 (값 영역: 100자 이하, 예: image/png) | MIME Type: media type of the file (Value domain: up to 100 characters, e.g. image/png)")
  @Column(name = "mime_type", length = 100)
  private String mimeType;

  /** 파일 저장 경로 */
  @Comment("파일 경로: 오브젝트 저장소에 저장된 파일의 경로 또는 키 | File Path: path or key of the file stored in object storage")
  @Column(name = "file_path", nullable = false)
  private String filePath;

  /** 공개 링크 접근을 위한 토큰 (UUID 기반) */
  @Comment("공개 접근 토큰: 로그인하지 않고 이 파일에 접근할 수 있는 일회용 토큰 (값 영역: 64자 이하) | Public Access Token: one-time token that allows access to this file without logging in (Value domain: up to 64 characters)")
  @Column(name = "public_access_token", length = 64, unique = true)
  private String publicAccessToken;

  /** 파일 업로드 시간 */
  @Comment("생성 일시: 이 첨부가 업로드된 일시 | Created Date Time: date and time this attachment was uploaded")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  /** 업로드한 사용자 */
  @Comment("업로드자 식별자: 이 첨부를 업로드한 사용자 (값 영역: users.id 참조) | Uploader Identifier: user who uploaded this attachment (Value domain: references users.id)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by")
  private User uploadedBy;

  /** 파일 설명 (선택사항) */
  @Comment("설명: 첨부 파일에 대한 설명 | Description: description of the attached file")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** 파일 상태 (ACTIVE, DELETED) */
  @Comment("상태: 이 첨부가 활성인지 삭제 표기되었는지 (값 영역: ACTIVE, DELETED) | Status: whether this attachment is active or marked as deleted (Value domain: ACTIVE, DELETED)")
  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 20)
  private AttachmentStatus status = AttachmentStatus.ACTIVE;

  /** 본문에 실제로 사용되었는지 여부 (인라인 이미지 추적용) */
  @Comment("본문 사용 여부: 이 파일이 케이스 본문에 실제로 인라인 포함되었는지 (값 영역: true, false) | Used In Content Indicator: whether this file is actually included inline in the test case body (Value domain: true, false)")
  @Column(name = "is_used_in_content")
  private Boolean isUsedInContent = false;

  /** 본문에 삽입된 시간 (사용 여부 추적용) */
  @Comment("본문 삽입 일시: 이 파일이 본문에 처음 포함된 일시 | Content Insertion Date Time: date and time this file was first included in the body")
  @Column(name = "used_at")
  private LocalDateTime usedAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    if (status == null) {
      status = AttachmentStatus.ACTIVE;
    }
    if (publicAccessToken == null || publicAccessToken.isBlank()) {
      publicAccessToken = java.util.UUID.randomUUID().toString().replace("-", "");
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

  // 브라우저·업로드 클라이언트가 content-type 을 못 잡으면 application/octet-stream(또는 null)로
  // 올라온다. 그러면 아래 판정이 전부 false 가 되어 텍스트·이미지·PDF 인데도 미리보기가 막힌다.
  // MIME 으로 먼저 판정하고, 판정이 안 되면 확장자로 한 번 더 본다.
  private static final Set<String> TEXT_EXTENSIONS =
      Set.of("txt", "csv", "json", "md", "log", "xml", "yml", "yaml");
  private static final Set<String> IMAGE_EXTENSIONS =
      Set.of("png", "jpg", "jpeg", "gif", "bmp", "webp");

  /** 파일이 텍스트 파일인지 확인 */
  public boolean isTextFile() {
    if (mimeType != null
        && (mimeType.startsWith("text/")
            || mimeType.equals("application/json")
            || mimeType.equals("application/xml"))) {
      return true;
    }
    return TEXT_EXTENSIONS.contains(getFileExtension());
  }

  /** 이미지 파일인지 확인 */
  public boolean isImageFile() {
    if (mimeType != null && mimeType.startsWith("image/")) {
      return true;
    }
    return IMAGE_EXTENSIONS.contains(getFileExtension());
  }

  /** PDF 파일인지 확인 */
  public boolean isPdfFile() {
    if ("application/pdf".equals(mimeType)) {
      return true;
    }
    return "pdf".equals(getFileExtension());
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
