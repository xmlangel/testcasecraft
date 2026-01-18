package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCaseAttachmentDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseAttachment;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * ICT-386: 테스트케이스 첨부파일 저장 및 관리 서비스 (MinIO 기반)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TestCaseFileStorageService {

    private final TestCaseAttachmentRepository attachmentRepository;
    private final TestCaseRepository testCaseRepository;
    private final MinIOService minioService;

    @Value("${app.file.max.size:10485760}") // 10MB
    private long maxFileSize;

    // 허용된 파일 타입
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "text/plain", // .txt
            "text/csv", // .csv
            "application/json", // .json
            "text/markdown", // .md
            "application/pdf", // .pdf
            "text/plain", // .log (보통 text/plain으로 인식)
            "image/png", // .png
            "image/jpeg", // .jpg, .jpeg
            "image/gif", // .gif
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "txt", "csv", "json", "md", "pdf", "log",
            "png", "jpg", "jpeg", "gif",
            "xls", "xlsx", "doc", "docx");

    /**
     * 테스트케이스에 파일 첨부 (MinIO에 저장)
     */
    public TestCaseAttachmentDto uploadFile(String testCaseId, MultipartFile file, User uploadedBy, String description)
            throws IOException {
        // 입력 검증
        validateFile(file);

        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new IllegalArgumentException("테스트케이스를 찾을 수 없습니다: " + testCaseId));

        // MinIO에 파일 저장
        String storedFileName = generateUniqueFileName(file.getOriginalFilename());
        String objectKey = testCaseId + "/" + storedFileName; // testCaseId별로 폴더 구조 생성

        Map<String, Object> uploadMetadata = minioService.uploadFile(file, objectKey);

        // MinIO 메타데이터 태그 설정 (초기 태그)
        try {
            java.util.Map<String, String> tags = new java.util.HashMap<>();
            tags.put("isUsed", "false");
            tags.put("testCaseId", testCaseId);
            tags.put("originalFileName", file.getOriginalFilename());
            if (uploadedBy != null) {
                tags.put("uploadedBy", uploadedBy.getUsername());
            }

            minioService.setObjectTags(objectKey, tags);
        } catch (Exception e) {
            log.warn("MinIO 초기 태그 설정 실패: {}", e.getMessage());
        }

        // 엔티티 생성 및 저장
        TestCaseAttachment attachment = new TestCaseAttachment();
        attachment.setTestCase(testCase);
        attachment.setOriginalFileName(StringUtils.cleanPath(file.getOriginalFilename()));
        attachment.setStoredFileName(storedFileName);
        attachment.setFileSize(file.getSize());
        attachment.setMimeType(file.getContentType());
        attachment.setFilePath(objectKey); // MinIO objectKey 저장
        attachment.setUploadedBy(uploadedBy);
        attachment.setDescription(description);
        attachment.setCreatedAt(LocalDateTime.now());
        attachment.setStatus(TestCaseAttachment.AttachmentStatus.ACTIVE);

        TestCaseAttachment savedAttachment = attachmentRepository.save(attachment);

        log.info("테스트케이스 파일 업로드 완료 (MinIO): {} -> {} (테스트케이스 ID: {})",
                file.getOriginalFilename(), objectKey, testCaseId);
        return toDto(savedAttachment);
    }

    /**
     * 전체 첨부파일 목록 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public List<TestCaseAttachmentDto> getAllAttachments() {
        List<TestCaseAttachment> attachments = attachmentRepository.findAll();
        return attachments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 활성 첨부파일 목록만 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    public List<TestCaseAttachmentDto> getAllActiveAttachments() {
        List<TestCaseAttachment> attachments = attachmentRepository.findAll();
        return attachments.stream()
                .filter(a -> a.getStatus() == TestCaseAttachment.AttachmentStatus.ACTIVE)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 테스트케이스의 첨부파일 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TestCaseAttachmentDto> getAttachmentsByTestCaseId(String testCaseId) {
        List<TestCaseAttachment> attachments = attachmentRepository.findActiveByTestCaseId(testCaseId);
        return attachments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 첨부파일 다운로드 (MinIO에서 가져오기)
     */
    @Transactional(readOnly = true)
    public Resource loadFileAsResource(String attachmentId) throws IOException {
        TestCaseAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        if (!attachment.isDownloadable()) {
            throw new IllegalStateException("다운로드할 수 없는 파일입니다: " + attachmentId);
        }

        // MinIO에서 파일 다운로드
        String objectKey = attachment.getFilePath(); // objectKey
        InputStream inputStream = minioService.downloadFile(objectKey);

        return new InputStreamResource(inputStream);
    }

    /**
     * 첨부파일 정보 조회
     */
    @Transactional(readOnly = true)
    public TestCaseAttachmentDto getAttachmentInfo(String attachmentId) {
        TestCaseAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        return toDto(attachment);
    }

    /**
     * 첨부파일 삭제 (논리적 삭제 + MinIO에서 삭제)
     */
    public void deleteAttachment(String attachmentId, User deletedBy) {
        TestCaseAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        // 논리적 삭제
        attachment.setStatus(TestCaseAttachment.AttachmentStatus.DELETED);
        attachmentRepository.save(attachment);

        // MinIO에서 실제 파일 삭제
        try {
            String objectKey = attachment.getFilePath();
            minioService.deleteFile(objectKey);
            log.info("테스트케이스 첨부파일 삭제 (MinIO): {} by {}", attachment.getOriginalFileName(), deletedBy.getName());
        } catch (Exception e) {
            log.warn("MinIO 파일 삭제 실패 (논리적 삭제는 완료됨): {}", e.getMessage());
        }
    }

    /**
     * 사용자별 첨부파일 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TestCaseAttachmentDto> getAttachmentsByUser(String userId) {
        List<TestCaseAttachment> attachments = attachmentRepository.findActiveByUploadedById(userId);
        return attachments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 공개 토큰으로 첨부파일 조회 (비인증 다운로드용)
     */
    @Transactional(readOnly = true)
    public TestCaseAttachment getAttachmentByPublicToken(String attachmentId, String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("다운로드 토큰이 필요합니다.");
        }

        TestCaseAttachment attachment = attachmentRepository.findByIdAndPublicAccessToken(attachmentId, token)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 다운로드 토큰입니다."));

        if (attachment.getStatus() != TestCaseAttachment.AttachmentStatus.ACTIVE) {
            throw new IllegalStateException("비활성화된 첨부파일입니다.");
        }

        return attachment;
    }

    /**
     * 이미 로드된 첨부파일 엔티티로부터 Resource 생성
     */
    @Transactional(readOnly = true)
    public Resource loadFileAsResource(TestCaseAttachment attachment) throws IOException {
        InputStream inputStream = minioService.downloadFile(attachment.getFilePath());
        return new InputStreamResource(inputStream);
    }

    private TestCaseAttachmentDto toDto(TestCaseAttachment attachment) {
        ensurePublicAccessToken(attachment);
        return TestCaseAttachmentDto.fromEntity(attachment);
    }

    private void ensurePublicAccessToken(TestCaseAttachment attachment) {
        if (attachment.getPublicAccessToken() == null || attachment.getPublicAccessToken().isBlank()) {
            attachment.setPublicAccessToken(generatePublicAccessToken());
            attachmentRepository.save(attachment);
        }
    }

    private String generatePublicAccessToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 파일 유효성 검증
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("파일 크기가 제한을 초과했습니다. 최대: " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 유효하지 않습니다.");
        }

        // 파일 확장자 검증
        String extension = getFileExtension(originalFileName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. 허용된 형식: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // MIME 타입 검증 (추가적인 보안)
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType)) {
            log.warn("MIME 타입 경고 - 파일: {}, MIME: {}", originalFileName, contentType);
            // 경고만 로깅하고 확장자로 판단 (일부 브라우저에서 MIME 타입이 다르게 전송될 수 있음)
        }
    }

    /**
     * 고유한 파일명 생성
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        String uuid = UUID.randomUUID().toString();
        return uuid + (extension.isEmpty() ? "" : "." + extension);
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return "";
        }
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
    }

    /**
     * 스토리지 정보 조회 (관리용 - MinIO 기반)
     */
    @Transactional(readOnly = true)
    public StorageInfo getStorageInfo() {
        long totalFiles = attachmentRepository.count();
        long activeFiles = attachmentRepository.findActiveByTestCaseId("").size(); // 전체 활성 파일
        List<TestCaseAttachment> largeFiles = attachmentRepository.findLargeFiles(10 * 1024 * 1024L); // 10MB 이상

        return StorageInfo.builder()
                .totalFiles(totalFiles)
                .activeFiles(activeFiles)
                .largeFilesCount(largeFiles.size())
                .uploadDirectory("MinIO Storage") // MinIO 사용 표시
                .maxFileSize(maxFileSize)
                .allowedExtensions(ALLOWED_EXTENSIONS)
                .build();
    }

    /**
     * 스토리지 정보 DTO
     */
    public static class StorageInfo {
        private final long totalFiles;
        private final long activeFiles;
        private final int largeFilesCount;
        private final String uploadDirectory;
        private final long maxFileSize;
        private final List<String> allowedExtensions;

        private StorageInfo(long totalFiles, long activeFiles, int largeFilesCount, String uploadDirectory,
                long maxFileSize, List<String> allowedExtensions) {
            this.totalFiles = totalFiles;
            this.activeFiles = activeFiles;
            this.largeFilesCount = largeFilesCount;
            this.uploadDirectory = uploadDirectory;
            this.maxFileSize = maxFileSize;
            this.allowedExtensions = allowedExtensions;
        }

        public static StorageInfoBuilder builder() {
            return new StorageInfoBuilder();
        }

        // Getters
        public long getTotalFiles() {
            return totalFiles;
        }

        public long getActiveFiles() {
            return activeFiles;
        }

        public int getLargeFilesCount() {
            return largeFilesCount;
        }

        public String getUploadDirectory() {
            return uploadDirectory;
        }

        public long getMaxFileSize() {
            return maxFileSize;
        }

        public List<String> getAllowedExtensions() {
            return allowedExtensions;
        }

        public static class StorageInfoBuilder {
            private long totalFiles;
            private long activeFiles;
            private int largeFilesCount;
            private String uploadDirectory;
            private long maxFileSize;
            private List<String> allowedExtensions;

            public StorageInfoBuilder totalFiles(long totalFiles) {
                this.totalFiles = totalFiles;
                return this;
            }

            public StorageInfoBuilder activeFiles(long activeFiles) {
                this.activeFiles = activeFiles;
                return this;
            }

            public StorageInfoBuilder largeFilesCount(int largeFilesCount) {
                this.largeFilesCount = largeFilesCount;
                return this;
            }

            public StorageInfoBuilder uploadDirectory(String uploadDirectory) {
                this.uploadDirectory = uploadDirectory;
                return this;
            }

            public StorageInfoBuilder maxFileSize(long maxFileSize) {
                this.maxFileSize = maxFileSize;
                return this;
            }

            public StorageInfoBuilder allowedExtensions(List<String> allowedExtensions) {
                this.allowedExtensions = allowedExtensions;
                return this;
            }

            public StorageInfo build() {
                return new StorageInfo(totalFiles, activeFiles, largeFilesCount, uploadDirectory, maxFileSize,
                        allowedExtensions);
            }
        }
    }

    /**
     * 첨부파일을 본문에 사용됨으로 표시 (인라인 이미지 추적용)
     */
    public TestCaseAttachmentDto markAsUsed(String attachmentId) {
        TestCaseAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        attachment.setIsUsedInContent(true);
        attachment.setUsedAt(LocalDateTime.now());

        TestCaseAttachment updatedAttachment = attachmentRepository.save(attachment);
        log.info("첨부파일 사용 상태 업데이트: {} (isUsedInContent=true)", attachmentId);

        // MinIO 메타데이터 태그 업데이트
        try {
            java.util.Map<String, String> tags = new java.util.HashMap<>();
            tags.put("isUsed", "true");
            tags.put("usedAt", attachment.getUsedAt().toString());
            tags.put("testCaseId", attachment.getTestCase().getId());
            tags.put("originalFileName", attachment.getOriginalFileName());

            if (attachment.getUploadedBy() != null) {
                tags.put("uploadedBy", attachment.getUploadedBy().getUsername());
            }

            minioService.setObjectTags(attachment.getFilePath(), tags);
        } catch (Exception e) {
            log.warn("MinIO 태그 업데이트 실패 (DB 업데이트는 성공): {}", e.getMessage());
        }

        return toDto(updatedAttachment);
    }

    /**
     * 미사용 첨부파일 자동 정리
     * 
     * @param daysOld 생성일 기준 일수 (기본값: 7일)
     * @return 정리 결과 정보
     */
    public CleanupResult cleanupUnusedAttachments(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<TestCaseAttachment> unusedAttachments = attachmentRepository.findUnusedFilesBeforeDate(cutoffDate);

        int deletedCount = 0;
        int failedCount = 0;
        long freedSpace = 0L;

        for (TestCaseAttachment attachment : unusedAttachments) {
            try {
                // MinIO에서 파일 삭제
                minioService.deleteFile(attachment.getFilePath());

                // 논리적 삭제
                attachment.setStatus(TestCaseAttachment.AttachmentStatus.DELETED);
                attachmentRepository.save(attachment);

                freedSpace += attachment.getFileSize();
                deletedCount++;

                log.info("미사용 첨부파일 정리 완료: {} (생성일: {}, 크기: {})",
                        attachment.getOriginalFileName(),
                        attachment.getCreatedAt(),
                        attachment.getFormattedFileSize());

            } catch (Exception e) {
                failedCount++;
                log.error("첨부파일 삭제 실패: {} - {}", attachment.getId(), e.getMessage());
            }
        }

        log.info("미사용 첨부파일 정리 완료 - 삭제: {}, 실패: {}, 확보 공간: {} MB",
                deletedCount, failedCount, freedSpace / 1024 / 1024);

        return new CleanupResult(deletedCount, failedCount, freedSpace, cutoffDate);
    }

    /**
     * 정리 결과 DTO
     */
    public static class CleanupResult {
        private final int deletedCount;
        private final int failedCount;
        private final long freedSpaceBytes;
        private final LocalDateTime cutoffDate;

        public CleanupResult(int deletedCount, int failedCount, long freedSpaceBytes, LocalDateTime cutoffDate) {
            this.deletedCount = deletedCount;
            this.failedCount = failedCount;
            this.freedSpaceBytes = freedSpaceBytes;
            this.cutoffDate = cutoffDate;
        }

        public int getDeletedCount() {
            return deletedCount;
        }

        public int getFailedCount() {
            return failedCount;
        }

        public long getFreedSpaceBytes() {
            return freedSpaceBytes;
        }

        public LocalDateTime getCutoffDate() {
            return cutoffDate;
        }

        public String getFreedSpaceFormatted() {
            if (freedSpaceBytes < 1024)
                return freedSpaceBytes + " B";
            if (freedSpaceBytes < 1024 * 1024)
                return String.format("%.1f KB", freedSpaceBytes / 1024.0);
            if (freedSpaceBytes < 1024 * 1024 * 1024)
                return String.format("%.1f MB", freedSpaceBytes / (1024.0 * 1024.0));
            return String.format("%.1f GB", freedSpaceBytes / (1024.0 * 1024.0 * 1024.0));
        }
    }
}
