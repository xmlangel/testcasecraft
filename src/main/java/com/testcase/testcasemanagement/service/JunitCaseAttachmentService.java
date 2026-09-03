package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JunitCaseAttachmentDto;
import com.testcase.testcasemanagement.model.JunitCaseAttachment;
import com.testcase.testcasemanagement.model.JunitTestCase;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.JunitCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.JunitTestCaseRepository;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * 자동화 결과 케이스에 붙는 첨부를 다룬다. 스크린샷을 남기려는 것이 주 용도다.
 *
 * <p>파일 본문은 오브젝트 저장소에 두고 표에는 키만 남긴다. 화면에는 저장소 키를 내보내지 않고 내려받기 주소만 준다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class JunitCaseAttachmentService {

  /** 한 케이스에 붙일 수 있는 개수. 넘으면 거절한다 */
  private static final int MAX_PER_CASE = 30;

  /** 한 파일의 크기 상한 */
  private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

  private static final List<String> ALLOWED_EXTENSIONS =
      List.of("png", "jpg", "jpeg", "gif", "webp", "txt", "log", "json", "html", "pdf");

  private final JunitCaseAttachmentRepository attachmentRepository;
  private final JunitTestCaseRepository junitTestCaseRepository;
  private final MinIOService minioService;

  /**
   * 케이스에 파일을 붙인다.
   *
   * <p>같은 이름이 이미 붙어 있으면 그것을 그대로 되돌려 준다. 실행을 다시 돌려도 같은 파일이 여러 벌 쌓이지 않게 하기 위한 것이고, 내용을 갈려면 지운 뒤 다시
   * 올린다.
   */
  public JunitCaseAttachmentDto upload(
      String caseId, MultipartFile file, User uploadedBy, String description) throws IOException {
    validate(file);

    JunitTestCase testCase =
        junitTestCaseRepository
            .findById(caseId)
            .orElseThrow(
                () -> new IllegalArgumentException("자동화 결과 케이스를 찾을 수 없습니다: " + caseId));

    String cleanName = StringUtils.cleanPath(file.getOriginalFilename());
    var existing = attachmentRepository.findActiveByCaseIdAndName(caseId, cleanName);
    if (existing.isPresent()) {
      log.info("같은 이름이 이미 붙어 있어 그대로 둔다: {} (케이스 {})", cleanName, caseId);
      return JunitCaseAttachmentDto.from(existing.get());
    }

    if (attachmentRepository.findActiveByCaseId(caseId).size() >= MAX_PER_CASE) {
      throw new IllegalStateException(
          "한 케이스에 붙일 수 있는 첨부는 " + MAX_PER_CASE + "개까지입니다.");
    }

    String storedFileName = uniqueName(cleanName);
    String objectKey = "junitcase/" + caseId + "/" + storedFileName;
    minioService.uploadFile(file, objectKey);

    JunitCaseAttachment attachment = new JunitCaseAttachment();
    attachment.setJunitTestCase(testCase);
    attachment.setOriginalFileName(cleanName);
    attachment.setStoredFileName(storedFileName);
    attachment.setFileSize(file.getSize());
    attachment.setMimeType(file.getContentType());
    attachment.setFilePath(objectKey);
    attachment.setUploadedBy(uploadedBy);
    attachment.setDescription(description);
    attachment.setCreatedAt(LocalDateTime.now());
    attachment.setStatus(JunitCaseAttachment.AttachmentStatus.ACTIVE);

    JunitCaseAttachment saved = attachmentRepository.save(attachment);
    log.info("자동화 케이스 첨부 완료: {} -> {} (케이스 {})", cleanName, objectKey, caseId);
    return JunitCaseAttachmentDto.from(saved);
  }

  @Transactional(readOnly = true)
  public List<JunitCaseAttachmentDto> list(String caseId) {
    return attachmentRepository.findActiveByCaseId(caseId).stream()
        .map(JunitCaseAttachmentDto::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public JunitCaseAttachment get(String attachmentId) {
    return attachmentRepository
        .findActiveById(attachmentId)
        .orElseThrow(() -> new IllegalArgumentException("첨부를 찾을 수 없습니다: " + attachmentId));
  }

  @Transactional(readOnly = true)
  public Resource load(String attachmentId) throws IOException {
    JunitCaseAttachment attachment = get(attachmentId);
    InputStream stream = minioService.downloadFile(attachment.getFilePath());
    return new InputStreamResource(stream);
  }

  /** 표에서는 지운 상태로 남기고 저장소에서는 실제로 뺀다 */
  public void delete(String attachmentId) {
    JunitCaseAttachment attachment = get(attachmentId);
    attachment.setStatus(JunitCaseAttachment.AttachmentStatus.DELETED);
    attachmentRepository.save(attachment);
    try {
      minioService.deleteFile(attachment.getFilePath());
    } catch (Exception e) {
      log.warn("저장소에서 첨부를 지우지 못했다: {} — {}", attachment.getFilePath(), e.getMessage());
    }
  }

  private void validate(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("빈 파일은 붙일 수 없습니다.");
    }
    if (file.getSize() > MAX_FILE_SIZE) {
      throw new IllegalArgumentException(
          "파일이 너무 큽니다. " + (MAX_FILE_SIZE / 1024 / 1024) + "MB 까지 붙일 수 있습니다.");
    }
    String name = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
    if (name.isBlank() || name.contains("..")) {
      throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
    }
    String ext = StringUtils.getFilenameExtension(name);
    if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
      throw new IllegalArgumentException(
          "지원하지 않는 파일 형식입니다. 허용된 형식: " + String.join(", ", ALLOWED_EXTENSIONS));
    }
  }

  private String uniqueName(String originalName) {
    String ext = StringUtils.getFilenameExtension(originalName);
    return UUID.randomUUID().toString().replace("-", "") + (ext == null ? "" : "." + ext);
  }
}
