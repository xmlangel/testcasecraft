package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestResultAttachmentDto;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestResultAttachment;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestResultAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
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
 * ICT-361: 테스트 결과 첨부파일 저장 및 관리 서비스 (MinIO 기반)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FileStorageService {

    private final TestResultAttachmentRepository attachmentRepository;
    private final TestResultRepository testResultRepository;
    private final MinIOService minioService;

    @Value("${app.file.max.size:10485760}") // 10MB
    private long maxFileSize;

    // 허용된 파일 타입
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "text/plain",           // .txt
            "text/csv",            // .csv
            "application/json",     // .json
            "text/markdown",       // .md
            "application/pdf",     // .pdf
            "text/plain",           // .log (보통 text/plain으로 인식)
            "image/png",           // .png
            "image/jpeg",          // .jpg, .jpeg
            "image/gif"            // .gif
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "txt", "csv", "json", "md", "pdf", "log", "png", "jpg", "jpeg", "gif"
    );

    /**
     * 테스트 결과에 파일 첨부 (MinIO에 저장)
     */
    public TestResultAttachmentDto uploadFile(String testResultId, MultipartFile file, User uploadedBy, String description) throws IOException {
        // 입력 검증
        validateFile(file);

        TestResult testResult = testResultRepository.findById(testResultId)
                .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + testResultId));

        // MinIO에 파일 저장
        String storedFileName = generateUniqueFileName(file.getOriginalFilename());
        String objectKey = "testresult/" + testResultId + "/" + storedFileName; // testResultId별로 폴더 구조 생성

        Map<String, Object> uploadMetadata = minioService.uploadFile(file, objectKey);

        // 엔티티 생성 및 저장
        TestResultAttachment attachment = new TestResultAttachment();
        attachment.setTestResult(testResult);
        attachment.setOriginalFileName(StringUtils.cleanPath(file.getOriginalFilename()));
        attachment.setStoredFileName(storedFileName);
        attachment.setFileSize(file.getSize());
        attachment.setMimeType(file.getContentType());
        attachment.setFilePath(objectKey); // MinIO objectKey 저장
        attachment.setUploadedBy(uploadedBy);
        attachment.setDescription(description);
        attachment.setCreatedAt(LocalDateTime.now());
        attachment.setStatus(TestResultAttachment.AttachmentStatus.ACTIVE);

        TestResultAttachment savedAttachment = attachmentRepository.save(attachment);

        log.info("테스트 결과 파일 업로드 완료 (MinIO): {} -> {} (테스트 결과 ID: {})",
                file.getOriginalFilename(), objectKey, testResultId);
        return TestResultAttachmentDto.fromEntity(savedAttachment);
    }

    /**
     * 테스트 결과의 첨부파일 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TestResultAttachmentDto> getAttachmentsByTestResultId(String testResultId) {
        List<TestResultAttachment> attachments = attachmentRepository.findActiveByTestResultId(testResultId);
        return attachments.stream()
                .map(TestResultAttachmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 첨부파일 다운로드 (MinIO에서 가져오기)
     */
    @Transactional(readOnly = true)
    public Resource loadFileAsResource(String attachmentId) throws IOException {
        TestResultAttachment attachment = attachmentRepository.findById(attachmentId)
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
    public TestResultAttachmentDto getAttachmentInfo(String attachmentId) {
        TestResultAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        return TestResultAttachmentDto.fromEntity(attachment);
    }

    /**
     * 첨부파일 삭제 (논리적 삭제 + MinIO에서 삭제)
     */
    public void deleteAttachment(String attachmentId, User deletedBy) {
        TestResultAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

        // 논리적 삭제
        attachment.setStatus(TestResultAttachment.AttachmentStatus.DELETED);
        attachmentRepository.save(attachment);

        // MinIO에서 실제 파일 삭제
        try {
            String objectKey = attachment.getFilePath();
            minioService.deleteFile(objectKey);
            log.info("테스트 결과 첨부파일 삭제 (MinIO): {} by {}", attachment.getOriginalFileName(), deletedBy.getName());
        } catch (Exception e) {
            log.warn("MinIO 파일 삭제 실패 (논리적 삭제는 완료됨): {}", e.getMessage());
        }
    }

    /**
     * 사용자별 첨부파일 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TestResultAttachmentDto> getAttachmentsByUser(String userId) {
        List<TestResultAttachment> attachments = attachmentRepository.findActiveByUploadedById(userId);
        return attachments.stream()
                .map(TestResultAttachmentDto::fromEntity)
                .collect(Collectors.toList());
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
        long activeFiles = attachmentRepository.countActiveByTestResultId(""); // 전체 활성 파일
        List<TestResultAttachment> largeFiles = attachmentRepository.findLargeFiles(10 * 1024 * 1024L); // 10MB 이상

        return StorageInfo.builder()
                .totalFiles(totalFiles)
                .activeFiles(activeFiles)
                .largeFilesCount(largeFiles.size())
                .uploadDirectory("MinIO Storage (Test Results)") // MinIO 사용 표시
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

        private StorageInfo(long totalFiles, long activeFiles, int largeFilesCount, String uploadDirectory, long maxFileSize, List<String> allowedExtensions) {
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
        public long getTotalFiles() { return totalFiles; }
        public long getActiveFiles() { return activeFiles; }
        public int getLargeFilesCount() { return largeFilesCount; }
        public String getUploadDirectory() { return uploadDirectory; }
        public long getMaxFileSize() { return maxFileSize; }
        public List<String> getAllowedExtensions() { return allowedExtensions; }

        public static class StorageInfoBuilder {
            private long totalFiles;
            private long activeFiles;
            private int largeFilesCount;
            private String uploadDirectory;
            private long maxFileSize;
            private List<String> allowedExtensions;

            public StorageInfoBuilder totalFiles(long totalFiles) { this.totalFiles = totalFiles; return this; }
            public StorageInfoBuilder activeFiles(long activeFiles) { this.activeFiles = activeFiles; return this; }
            public StorageInfoBuilder largeFilesCount(int largeFilesCount) { this.largeFilesCount = largeFilesCount; return this; }
            public StorageInfoBuilder uploadDirectory(String uploadDirectory) { this.uploadDirectory = uploadDirectory; return this; }
            public StorageInfoBuilder maxFileSize(long maxFileSize) { this.maxFileSize = maxFileSize; return this; }
            public StorageInfoBuilder allowedExtensions(List<String> allowedExtensions) { this.allowedExtensions = allowedExtensions; return this; }

            public StorageInfo build() {
                return new StorageInfo(totalFiles, activeFiles, largeFilesCount, uploadDirectory, maxFileSize, allowedExtensions);
            }
        }
    }
}