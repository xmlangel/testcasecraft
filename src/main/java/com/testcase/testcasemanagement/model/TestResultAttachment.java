// src/main/java/com/testcase/testcasemanagement/model/TestResultAttachment.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * ICT-361: 테스트 결과 첨부파일 엔티티
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "test_result_attachments", indexes = {
        @Index(name = "idx_result_attachment_test_result", columnList = "test_result_id"),
        @Index(name = "idx_result_attachment_created_at", columnList = "created_at"),
        @Index(name = "idx_result_attachment_file_name", columnList = "original_file_name")
})
public class TestResultAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_result_id", nullable = false)
    private TestResult testResult;

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

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = AttachmentStatus.ACTIVE;
        }
    }

    /**
     * 파일 확장자 추출
     */
    public String getFileExtension() {
        if (originalFileName == null)
            return "";
        int lastDot = originalFileName.lastIndexOf('.');
        return lastDot > 0 ? originalFileName.substring(lastDot + 1).toLowerCase() : "";
    }

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     */
    public String getFormattedFileSize() {
        if (fileSize == null)
            return "0 B";

        long size = fileSize;
        if (size < 1024)
            return size + " B";
        if (size < 1024 * 1024)
            return String.format("%.1f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024)
            return String.format("%.1f MB", size / (1024.0 * 1024.0));
        return String.format("%.1f GB", size / (1024.0 * 1024.0 * 1024.0));
    }

    /**
     * 파일이 텍스트 파일인지 확인
     */
    public boolean isTextFile() {
        if (mimeType == null)
            return false;
        return mimeType.startsWith("text/") ||
                mimeType.equals("application/json") ||
                mimeType.equals("application/xml");
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