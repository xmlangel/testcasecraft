// src/main/java/com/testcase/testcasemanagement/controller/EmailVerificationController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.*;
import com.testcase.testcasemanagement.service.EmailVerificationService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/email-verification")
@RequiredArgsConstructor
@Tag(name = "Email Verification", description = "이메일 인증 API")
public class EmailVerificationController {

  private final EmailVerificationService emailVerificationService;
  private final SecurityContextUtil securityContextUtil;

  /** 인증 이메일 발송 (인증 사용자 본인 계정 전용) */
  @PostMapping("/send")
  @PreAuthorize("isAuthenticated()")
  @Operation(summary = "인증 이메일 발송", description = "현재 로그인한 사용자 본인 계정의 이메일 인증 링크를 발송합니다.")
  public ResponseEntity<CommonResponse> sendVerificationEmail(
      @RequestBody SendVerificationRequest request) {
    // 보안: userId 는 요청 본문이 아니라 인증 주체에서 파생한다. 과거엔 비인증 요청이 임의 userId+email 로
    // 타인 계정의 이메일을 공격자 주소로 교체(계정 탈취)할 수 있었다.
    String userId = securityContextUtil.getCurrentUserId();
    log.info(
        "Sending verification email - userId(self): {}, email: {}", userId, request.getEmail());
    CommonResponse response =
        emailVerificationService.createVerificationToken(userId, request.getEmail());
    return ResponseEntity.ok(response);
  }

  /** 토큰 검증 */
  @GetMapping("/verify")
  @Operation(summary = "토큰 검증", description = "이메일 인증 토큰을 검증하고 사용 처리합니다.")
  public ResponseEntity<VerifyTokenResponse> verifyToken(
      @Parameter(description = "인증 토큰", required = true) @RequestParam String token) {
    log.info("Verifying token: {}", token);
    VerifyTokenResponse response = emailVerificationService.verifyToken(token);
    return ResponseEntity.ok(response);
  }

  /** 인증 이메일 재발송 (인증 사용자 본인 계정 전용) */
  @PostMapping("/resend")
  @PreAuthorize("isAuthenticated()")
  @Operation(summary = "인증 이메일 재발송", description = "현재 로그인한 사용자 본인 계정에 새로운 인증 이메일을 재발송합니다.")
  public ResponseEntity<CommonResponse> resendVerificationEmail(
      @RequestBody ResendVerificationRequest request) {
    // 보안: userId 는 인증 주체에서 파생 (요청 본문 무시).
    String userId = securityContextUtil.getCurrentUserId();
    log.info("Resending verification email - userId(self): {}", userId);
    CommonResponse response = emailVerificationService.resendVerificationEmail(userId);
    return ResponseEntity.ok(response);
  }
}
