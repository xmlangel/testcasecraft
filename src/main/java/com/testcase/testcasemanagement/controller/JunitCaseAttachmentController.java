package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.JunitCaseAttachmentDto;
import com.testcase.testcasemanagement.model.JunitCaseAttachment;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.service.JunitCaseAttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 자동화 결과 케이스에 붙는 첨부. 자동화 대시보드가 실행 당시 화면을 함께 보여 주기 위한 것이다.
 *
 * <p>내려받기는 조회 권한, 붙이기와 지우기는 결과를 올릴 수 있는 권한을 요구한다.
 */
@Slf4j
@RestController
@RequestMapping("/api/junit-results")
@RequiredArgsConstructor
@Tag(name = "자동화 결과 첨부", description = "자동화 결과 케이스에 스크린샷 등을 붙인다")
public class JunitCaseAttachmentController {

  private final JunitCaseAttachmentService attachmentService;
  private final UserRepository userRepository;

  @PostMapping("/cases/{caseId}/attachments")
  @PreAuthorize("@projectSecurityService.canModifyJunitCase(#caseId)")
  @Operation(summary = "자동화 케이스에 첨부 올리기")
  public ResponseEntity<Map<String, Object>> upload(
      @PathVariable String caseId,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description,
      @AuthenticationPrincipal UserDetails userDetails) {

    Map<String, Object> body = new HashMap<>();
    try {
      User uploader =
          userDetails == null
              ? null
              : userRepository.findByUsername(userDetails.getUsername()).orElse(null);
      if (uploader == null) {
        body.put("success", false);
        body.put("error", "로그인 정보를 확인할 수 없습니다.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
      }

      JunitCaseAttachmentDto dto = attachmentService.upload(caseId, file, uploader, description);
      body.put("success", true);
      body.put("attachment", dto);
      return ResponseEntity.ok(body);

    } catch (IllegalArgumentException | IllegalStateException e) {
      body.put("success", false);
      body.put("error", e.getMessage());
      return ResponseEntity.badRequest().body(body);
    } catch (Exception e) {
      log.error("자동화 케이스 첨부 실패 (케이스 {}): {}", caseId, e.getMessage(), e);
      body.put("success", false);
      body.put("error", "첨부를 저장할 수 없습니다.");
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
  }

  @GetMapping("/cases/{caseId}/attachments")
  @PreAuthorize("@projectSecurityService.canAccessJunitCase(#caseId)")
  @Operation(summary = "자동화 케이스 첨부 목록")
  public ResponseEntity<Map<String, Object>> list(@PathVariable String caseId) {
    Map<String, Object> body = new HashMap<>();
    body.put("success", true);
    body.put("attachments", attachmentService.list(caseId));
    return ResponseEntity.ok(body);
  }

  @GetMapping("/attachments/{attachmentId}/download")
  @PreAuthorize("@projectSecurityService.canAccessJunitCaseAttachment(#attachmentId)")
  @Operation(summary = "자동화 케이스 첨부 내려받기")
  public ResponseEntity<Resource> download(@PathVariable String attachmentId) {
    try {
      JunitCaseAttachment attachment = attachmentService.get(attachmentId);
      Resource resource = attachmentService.load(attachmentId);

      MediaType mediaType =
          attachment.getMimeType() == null
              ? MediaType.APPLICATION_OCTET_STREAM
              : MediaType.parseMediaType(attachment.getMimeType());

      // 이미지는 화면에 그대로 그려야 하므로 inline, 그 밖은 내려받기로 넘긴다
      String disposition = attachment.isImage() ? "inline" : "attachment";
      String encoded =
          URLEncoder.encode(attachment.getOriginalFileName(), StandardCharsets.UTF_8)
              .replace("+", "%20");

      return ResponseEntity.ok()
          .contentType(mediaType)
          .header(
              HttpHeaders.CONTENT_DISPOSITION,
              disposition + "; filename*=UTF-8''" + encoded)
          .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
          .body(resource);

    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("자동화 케이스 첨부 내려받기 실패 ({}): {}", attachmentId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @DeleteMapping("/attachments/{attachmentId}")
  @PreAuthorize("@projectSecurityService.canDeleteJunitCaseAttachment(#attachmentId)")
  @Operation(summary = "자동화 케이스 첨부 지우기")
  public ResponseEntity<Map<String, Object>> delete(@PathVariable String attachmentId) {
    Map<String, Object> body = new HashMap<>();
    try {
      attachmentService.delete(attachmentId);
      body.put("success", true);
      return ResponseEntity.ok(body);
    } catch (IllegalArgumentException e) {
      body.put("success", false);
      body.put("error", e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }
  }
}
