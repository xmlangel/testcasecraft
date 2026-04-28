package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestSessionAttachmentDto;
import com.testcase.testcasemanagement.model.TestSession;
import com.testcase.testcasemanagement.model.TestSessionAttachment;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestSessionAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestSessionRepository;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TestSessionFileStorageService {

  private final TestSessionAttachmentRepository attachmentRepository;
  private final TestSessionRepository sessionRepository;
  private final MinIOService minioService;

  @Value("${app.file.max.size:10485760}") // 10MB
  private long maxFileSize;

  private static final List<String> ALLOWED_EXTENSIONS =
      List.of(
          "txt", "csv", "json", "md", "pdf", "log", "png", "jpg", "jpeg", "gif", "xls", "xlsx",
          "doc", "docx");

  public TestSessionAttachmentDto uploadFile(
      String sessionId, MultipartFile file, User uploadedBy, String description)
      throws IOException {
    validateFile(file);

    TestSession session =
        sessionRepository
            .findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다: " + sessionId));

    String storedFileName = generateUniqueFileName(file.getOriginalFilename());
    String objectKey = "sessions/" + sessionId + "/" + storedFileName;

    minioService.uploadFile(file, objectKey);

    TestSessionAttachment attachment = new TestSessionAttachment();
    attachment.setSession(session);
    attachment.setOriginalFileName(StringUtils.cleanPath(file.getOriginalFilename()));
    attachment.setStoredFileName(storedFileName);
    attachment.setFileSize(file.getSize());
    attachment.setMimeType(file.getContentType());
    attachment.setFilePath(objectKey);
    attachment.setUploadedBy(uploadedBy);
    attachment.setDescription(description);
    attachment.setCreatedAt(LocalDateTime.now());
    attachment.setStatus(TestSessionAttachment.AttachmentStatus.ACTIVE);

    TestSessionAttachment savedAttachment = attachmentRepository.save(attachment);

    // 공개 액세스 토큰 생성
    if (savedAttachment.getPublicAccessToken() == null
        || savedAttachment.getPublicAccessToken().isBlank()) {
      savedAttachment.setPublicAccessToken(UUID.randomUUID().toString().replace("-", ""));
      savedAttachment = attachmentRepository.save(savedAttachment);
    }

    log.info(
        "탐색적 세션 파일 업로드 완료 (MinIO): {} -> {} (세션 ID: {})",
        file.getOriginalFilename(),
        objectKey,
        sessionId);
    return toDto(savedAttachment);
  }

  @Transactional(readOnly = true)
  public List<TestSessionAttachmentDto> getAttachmentsBySessionId(String sessionId) {
    List<TestSessionAttachment> attachments = attachmentRepository.findActiveBySessionId(sessionId);
    return attachments.stream().map(this::toDto).collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public Resource loadFileAsResource(String attachmentId) throws IOException {
    TestSessionAttachment attachment =
        attachmentRepository
            .findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

    if (!attachment.isDownloadable()) {
      throw new IllegalStateException("다운로드할 수 없는 파일입니다: " + attachmentId);
    }

    InputStream inputStream = minioService.downloadFile(attachment.getFilePath());
    return new InputStreamResource(inputStream);
  }

  @Transactional(readOnly = true)
  public TestSessionAttachmentDto getAttachmentInfo(String attachmentId) {
    TestSessionAttachment attachment =
        attachmentRepository
            .findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

    return toDto(attachment);
  }

  public void deleteAttachment(String attachmentId, User deletedBy) {
    TestSessionAttachment attachment =
        attachmentRepository
            .findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("첨부파일을 찾을 수 없습니다: " + attachmentId));

    attachment.setStatus(TestSessionAttachment.AttachmentStatus.DELETED);
    attachmentRepository.save(attachment);

    try {
      minioService.deleteFile(attachment.getFilePath());
    } catch (Exception e) {
      log.warn("MinIO 파일 삭제 실패: {}", e.getMessage());
    }
  }

  private TestSessionAttachmentDto toDto(TestSessionAttachment attachment) {
    return TestSessionAttachmentDto.fromEntity(attachment);
  }

  private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
    }

    if (file.getSize() > maxFileSize) {
      throw new IllegalArgumentException(
          "파일 크기가 제한을 초과했습니다. 최대: " + (maxFileSize / 1024 / 1024) + "MB");
    }

    String originalFileName = file.getOriginalFilename();
    if (originalFileName == null || originalFileName.trim().isEmpty()) {
      throw new IllegalArgumentException("파일명이 유효하지 않습니다.");
    }

    String extension = getFileExtension(originalFileName);
    if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
      throw new IllegalArgumentException(
          "지원하지 않는 파일 형식입니다. 허용된 형식: " + String.join(", ", ALLOWED_EXTENSIONS));
    }
  }

  private String generateUniqueFileName(String originalFileName) {
    String extension = getFileExtension(originalFileName);
    return UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
  }

  private String getFileExtension(String fileName) {
    if (fileName == null || fileName.trim().isEmpty()) {
      return "";
    }
    int lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
  }
}
