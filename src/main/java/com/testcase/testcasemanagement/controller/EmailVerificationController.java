// src/main/java/com/testcase/testcasemanagement/controller/EmailVerificationController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.*;
import com.testcase.testcasemanagement.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/email-verification")
@RequiredArgsConstructor
@Tag(name = "Email Verification", description = "이메일 인증 API")
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    /**
     * 인증 이메일 발송
     */
    @PostMapping("/send")
    @Operation(summary = "인증 이메일 발송", description = "사용자에게 이메일 인증 링크를 발송합니다.")
    public ResponseEntity<CommonResponse> sendVerificationEmail(
            @RequestBody SendVerificationRequest request) {
        log.info("Sending verification email - userId: {}, email: {}", request.getUserId(), request.getEmail());
        CommonResponse response = emailVerificationService.createVerificationToken(
                request.getUserId(),
                request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * 토큰 검증
     */
    @GetMapping("/verify")
    @Operation(summary = "토큰 검증", description = "이메일 인증 토큰을 검증하고 사용 처리합니다.")
    public ResponseEntity<VerifyTokenResponse> verifyToken(
            @Parameter(description = "인증 토큰", required = true) @RequestParam String token) {
        log.info("Verifying token: {}", token);
        VerifyTokenResponse response = emailVerificationService.verifyToken(token);
        return ResponseEntity.ok(response);
    }

    /**
     * 인증 이메일 재발송
     */
    @PostMapping("/resend")
    @Operation(summary = "인증 이메일 재발송", description = "사용자에게 새로운 인증 이메일을 재발송합니다.")
    public ResponseEntity<CommonResponse> resendVerificationEmail(
            @RequestBody ResendVerificationRequest request) {
        log.info("Resending verification email - userId: {}", request.getUserId());
        CommonResponse response = emailVerificationService.resendVerificationEmail(request.getUserId());
        return ResponseEntity.ok(response);
    }
}
