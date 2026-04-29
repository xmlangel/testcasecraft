package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.TestSessionAttachmentDto;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.I18nService;
import com.testcase.testcasemanagement.service.TestSessionFileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/session-attachments")
@RequiredArgsConstructor
@Tag(name = "Test Session - Attachments", description = "탐색적 세션 첨부파일 관리 API")
public class TestSessionAttachmentController {

  private final TestSessionFileStorageService fileStorageService;
  private final UserRepository userRepository;
  private final I18nService i18nService;

  @PostMapping("/upload/{sessionId}")
  @Operation(summary = "파일 업로드")
  public ResponseEntity<?> uploadFile(
      @PathVariable String sessionId,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description,
      @AuthenticationPrincipal UserDetails userDetails) {

    try {
      User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증이 필요합니다."));
      }

      TestSessionAttachmentDto attachmentDto =
          fileStorageService.uploadFile(sessionId, file, currentUser, description);

      return ResponseEntity.ok(Map.of("success", true, "attachment", attachmentDto));

    } catch (Exception e) {
      log.error("파일 업로드 오류: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @GetMapping("/session/{sessionId}")
  @Operation(summary = "세션별 첨부파일 목록 조회")
  public ResponseEntity<?> getAttachmentsBySession(@PathVariable String sessionId) {
    try {
      List<TestSessionAttachmentDto> attachments =
          fileStorageService.getAttachmentsBySessionId(sessionId);
      return ResponseEntity.ok(Map.of("success", true, "attachments", attachments));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @GetMapping("/{attachmentId}/download")
  @Operation(summary = "파일 다운로드")
  public ResponseEntity<Resource> downloadFile(
      @PathVariable String attachmentId, @AuthenticationPrincipal UserDetails userDetails) {

    try {
      TestSessionAttachmentDto attachmentInfo = fileStorageService.getAttachmentInfo(attachmentId);
      Resource resource = fileStorageService.loadFileAsResource(attachmentId);

      return ResponseEntity.ok()
          .header(
              HttpHeaders.CONTENT_DISPOSITION,
              "attachment; filename=\"" + attachmentInfo.getOriginalFileName() + "\"")
          .contentType(
              attachmentInfo.getMimeType() != null
                  ? MediaType.parseMediaType(attachmentInfo.getMimeType())
                  : MediaType.APPLICATION_OCTET_STREAM)
          .body(resource);

    } catch (Exception e) {
      log.error("파일 다운로드 오류: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @PatchMapping("/{attachmentId}")
  @Operation(summary = "첨부파일 정보 수정")
  public ResponseEntity<?> updateAttachment(
      @PathVariable String attachmentId,
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal UserDetails userDetails) {
    try {
      String description = body.get("description");
      TestSessionAttachmentDto updated =
          fileStorageService.updateAttachmentDescription(attachmentId, description);
      return ResponseEntity.ok(Map.of("success", true, "attachment", updated));
    } catch (Exception e) {
      log.error("파일 정보 수정 오류: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }

  @DeleteMapping("/{attachmentId}")
  @Operation(summary = "첨부파일 삭제")
  public ResponseEntity<?> deleteAttachment(
      @PathVariable String attachmentId, @AuthenticationPrincipal UserDetails userDetails) {

    try {
      User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
      if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }

      fileStorageService.deleteAttachment(attachmentId, currentUser);
      return ResponseEntity.ok(Map.of("success", true));

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }
}
