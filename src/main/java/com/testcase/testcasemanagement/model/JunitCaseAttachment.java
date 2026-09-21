// src/main/java/com/testcase/testcasemanagement/model/JunitCaseAttachment.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 자동화 결과 케이스에 붙는 첨부. 스크린샷처럼 실행 당시를 남기는 파일이 여기 들어간다.
 *
 * <p>테스트 결과 첨부(TestResultAttachment)와 표를 따로 두는 이유는 그쪽이 test_result_id 를 필수로 요구하기 때문이다. 자동화 결과는
 * 테스트실행을 거치지 않고 올라올 수 있어 그 열을 채울 수 없다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "junit_case_attachments",
    indexes = {
      @Index(name = "idx_junit_attachment_case", columnList = "junit_test_case_id"),
      @Index(name = "idx_junit_attachment_created_at", columnList = "created_at")
    })
public class JunitCaseAttachment {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "junit_test_case_id", nullable = false)
  private JunitTestCase junitTestCase;

  /** 올린 사람이 준 파일명. 화면에 그대로 보여 준다 */
  @Column(name = "original_file_name", nullable = false, length = 255)
  private String originalFileName;

  /** 저장소에 넣을 때 쓴 이름. 원본과 충돌하지 않게 새로 만든다 */
  @Column(name = "stored_file_name", nullable = false, length = 255)
  private String storedFileName;

  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  @Column(name = "mime_type", length = 100)
  private String mimeType;

  /** 오브젝트 저장소의 키 */
  @Column(name = "file_path", nullable = false)
  private String filePath;

  /** 이 첨부가 무엇인지 한 줄. 스크린샷이면 몇 번째 스텝인지 적는다 */
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "uploaded_by")
  private User uploadedBy;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 20)
  private AttachmentStatus status = AttachmentStatus.ACTIVE;

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    if (status == null) {
      status = AttachmentStatus.ACTIVE;
    }
  }

  /** 지운 첨부는 목록에서 빼되 기록은 남긴다 */
  public enum AttachmentStatus {
    ACTIVE,
    DELETED
  }

  /** 화면이 미리보기를 그릴지 정하는 기준 */
  public boolean isImage() {
    return mimeType != null && mimeType.startsWith("image/");
  }
}
