// src/main/java/com/testcase/testcasemanagement/model/TestCaseAttachment.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-386: 테스트케이스 첨부파일 엔티티
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "test_case_attachments", indexes = {
    @Index(name = "idx_attachment_test_case", columnList = "test_case_id"),
    @Index(name = "idx_attachment_created_at", columnList = "created_at"),
    @Index(name = "idx_attachment_file_name", columnList = "original_file_name")
})
public class TestCaseAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    /**
     * 원본 파일명
     */
    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    /**
     * 저장된 파일명 (UUID 기반)
     */
    @Column(name = "stored_file_name", nullable = false, length = 255)
    private String storedFileName;

    /**
     * 파일 크기 (bytes)
     */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /**
     * 파일 MIME 타입
     */
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    /**
     * 파일 저장 경로
     */
    @Column(name = "file_path", nullable = false)
    private String filePath;

    /**
     * 공개 링크 접근을 위한 토큰 (UUID 기반)
     */
    @Column(name = "public_access_token", length = 64, unique = true)
    private String publicAccessToken;

    /**
     * 파일 업로드 시간
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 업로드한 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    /**
     * 파일 설명 (선택사항)
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 파일 상태 (ACTIVE, DELETED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private AttachmentStatus status = AttachmentStatus.ACTIVE;

    /**
     * 본문에 실제로 사용되었는지 여부 (인라인 이미지 추적용)
     */
    @Column(name = "is_used_in_content")
    private Boolean isUsedInContent = false;

    /**
     * 본문에 삽입된 시간 (사용 여부 추적용)
     */
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

    /**
     * 파일 확장자 추출
     */
    public String getFileExtension() {
        if (originalFileName == null) return "";
        int lastDot = originalFileName.lastIndexOf('.');
        return lastDot > 0 ? originalFileName.substring(lastDot + 1).toLowerCase() : "";
    }

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     */
    public String getFormattedFileSize() {
        if (fileSize == null) return "0 B";

        long size = fileSize;
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.1f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024) return String.format("%.1f MB", size / (1024.0 * 1024.0));
        return String.format("%.1f GB", size / (1024.0 * 1024.0 * 1024.0));
    }

    /**
     * 파일이 텍스트 파일인지 확인
     */
    public boolean isTextFile() {
        if (mimeType == null) return false;
        return mimeType.startsWith("text/") ||
               mimeType.equals("application/json") ||
               mimeType.equals("application/xml");
    }

    /**
     * 이미지 파일인지 확인
     */
    public boolean isImageFile() {
        if (mimeType == null) return false;
        return mimeType.startsWith("image/");
    }

    /**
     * PDF 파일인지 확인
     */
    public boolean isPdfFile() {
        if (mimeType == null) return false;
        return "application/pdf".equals(mimeType);
    }

    /**
     * 다운로드 가능한 파일인지 확인
     */
    public boolean isDownloadable() {
        return status == AttachmentStatus.ACTIVE && storedFileName != null;
    }

    public enum AttachmentStatus {
        ACTIVE,
        DELETED
    }
}
