// src/main/java/com/testcase/testcasemanagement/service/EmailVerificationService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.*;
import com.testcase.testcasemanagement.model.EmailVerificationToken;
import com.testcase.testcasemanagement.model.MailSettings;
import com.testcase.testcasemanagement.model.User;

import com.testcase.testcasemanagement.repository.EmailVerificationRepository;
import com.testcase.testcasemanagement.repository.MailSettingsRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private final MailSettingsRepository mailSettingsRepository;
    private final EncryptionUtil encryptionUtil;

    @Value("${app.frontend.url:http://localhost:8080}")
    private String frontendUrl;

    /**
     * 인증 토큰 생성 및 이메일 발송
     */
    @Transactional
    public CommonResponse createVerificationToken(String userId, String email) {
        return createVerificationToken(userId, email, null);
    }

    /**
     * 인증 토큰 생성 및 이메일 발송 (Base URL 지정)
     */
    @Transactional
    public CommonResponse createVerificationToken(String userId, String email, String baseUrl) {
        try {
            // ⚠️ 메일 설정 활성화 여부 확인
            Optional<MailSettings> mailSettingsOpt = mailSettingsRepository.findFirstByOrderByCreatedAtDesc();
            if (mailSettingsOpt.isEmpty()) {
                log.warn("Mail settings not configured");
                return CommonResponse.failure("메일 설정이 구성되지 않았습니다. 관리자에게 문의하세요.");
            }

            MailSettings mailSettings = mailSettingsOpt.get();
            if (!mailSettings.getMailEnabled()) {
                log.warn("Mail feature is disabled");
                return CommonResponse.failure("메일 기능이 비활성화되어 있습니다. 관리자에게 문의하세요.");
            }

            // 사용자 조회
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

            // 기존 미사용 토큰 삭제 (새로운 토큰으로 대체)
            emailVerificationRepository.findByUserIdAndEmailAndIsUsedFalse(userId, email)
                    .ifPresent(emailVerificationRepository::delete);

            // 새 토큰 생성
            EmailVerificationToken token = new EmailVerificationToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setEmail(email);
            token.setIsUsed(false);
            token.setExpiresAt(LocalDateTime.now().plusHours(24));

            emailVerificationRepository.save(token);

            // 메일 설정을 사용하여 이메일 발송
            sendVerificationEmail(mailSettings, email, token.getToken(), user.getName(), baseUrl);

            log.info("Email verification token created for user: {} (email: {})", userId, email);
            return CommonResponse.success("인증 이메일이 발송되었습니다.");

        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID: {}", userId, e);
            return CommonResponse.failure(e.getMessage());
        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", email, e);
            return CommonResponse.failure("이메일 발송에 실패했습니다.");
        } catch (Exception e) {
            log.error("Unexpected error creating verification token", e);
            return CommonResponse.failure("인증 토큰 생성 중 오류가 발생했습니다.");
        }
    }

    /**
     * 토큰 검증 및 사용 처리
     */
    @Transactional
    public VerifyTokenResponse verifyToken(String tokenString) {
        try {
            // 토큰 조회
            Optional<EmailVerificationToken> tokenOpt = emailVerificationRepository.findByToken(tokenString);

            if (tokenOpt.isEmpty()) {
                log.warn("Invalid verification token: {}", tokenString);
                return VerifyTokenResponse.failure("유효하지 않은 인증 링크입니다.", "INVALID");
            }

            EmailVerificationToken token = tokenOpt.get();

            // 이미 사용된 토큰 확인
            if (token.getIsUsed()) {
                // 이미 인증된 사용자라면 성공으로 처리 (프리뷰어/스캐너 등에 의한 중복 호출 대응)
                if (token.getUser().getEmailVerified()) {
                    log.info("Token already used but user already verified: {}", tokenString);
                    return VerifyTokenResponse.success("이미 인증이 완료되었습니다.");
                }
                log.warn("Token already used: {}", tokenString);
                return VerifyTokenResponse.failure("이미 사용된 인증 링크입니다.", "USED");
            }

            // 만료된 토큰 확인
            if (token.isExpired()) {
                log.warn("Token expired: {}", tokenString);
                return VerifyTokenResponse.failure("인증 링크가 만료되었습니다.", "EXPIRED");
            }

            // 토큰 사용 처리
            token.setIsUsed(true);
            token.setUsedAt(LocalDateTime.now());
            emailVerificationRepository.save(token);

            // 사용자 이메일 업데이트 (필요 시)
            User user = token.getUser();
            if (!user.getEmail().equals(token.getEmail())) {
                user.setEmail(token.getEmail());
            }

            // 이메일 인증 완료 처리
            user.setEmailVerified(true);
            userRepository.save(user);
            log.info("User email verified: {} -> {}", user.getId(), token.getEmail());

            log.info("Email verification successful for user: {}", user.getId());
            return VerifyTokenResponse.success("이메일 인증이 완료되었습니다.");

        } catch (Exception e) {
            log.error("Unexpected error verifying token", e);
            return VerifyTokenResponse.failure("인증 처리 중 오류가 발생했습니다.", "ERROR");
        }
    }

    /**
     * 인증 이메일 재발송
     */
    @Transactional
    public CommonResponse resendVerificationEmail(String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

            // 사용자의 현재 이메일로 새 토큰 생성
            return createVerificationToken(userId, user.getEmail(), null);

        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID: {}", userId, e);
            return CommonResponse.failure(e.getMessage());
        }
    }

    /**
     * 인증 이메일 발송 (MailSettings 사용)
     */
    private void sendVerificationEmail(MailSettings mailSettings, String toEmail, String token, String userName,
            String baseUrl)
            throws MessagingException {
        String base = (baseUrl != null && !baseUrl.isEmpty()) ? baseUrl : frontendUrl;
        // Remove trailing slash if present
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        String verificationLink = base + "/verify-email?token=" + token;

        // 다이나믹 JavaMailSender 생성
        JavaMailSender mailSender = createMailSender(mailSettings);

        String htmlContent = buildEmailTemplate(userName, verificationLink);
        String subject = "[TestCaseCraft] 이메일 인증을 완료해주세요";
        String fromEmail = mailSettings.getFromName() + " <" + mailSettings.getUsername() + ">";

        // 이메일 발송
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
        log.info("Verification email sent to: {} using mail settings", toEmail);
    }

    /**
     * MailSettings로부터 JavaMailSender 동적 생성
     */
    private JavaMailSender createMailSender(MailSettings settings) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(settings.getSmtpHost());
        mailSender.setPort(settings.getSmtpPort());
        mailSender.setUsername(settings.getUsername());

        // 비밀번호 복호화
        String decryptedPassword = encryptionUtil.decrypt(settings.getPassword());
        mailSender.setPassword(decryptedPassword);

        // SMTP 속성 설정
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", settings.getUseAuth() ? "true" : "false");
        props.put("mail.smtp.starttls.enable", settings.getUseTLS() ? "true" : "false");
        props.put("mail.debug", "false");

        return mailSender;
    }

    /**
     * HTML 이메일 템플릿 생성
     */
    private String buildEmailTemplate(String userName, String verificationLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background-color: #f9f9f9;
                            border-radius: 8px;
                            padding: 30px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header h1 {
                            color: #1976d2;
                            margin: 0;
                        }
                        .content {
                            background-color: white;
                            padding: 25px;
                            border-radius: 6px;
                            margin-bottom: 20px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background-color: #1976d2;
                            color: white !important;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: 500;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .button:hover {
                            background-color: #1565c0;
                        }
                        .footer {
                            text-align: center;
                            color: #666;
                            font-size: 0.9em;
                            margin-top: 20px;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin-top: 20px;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>TestCaseCraft</h1>
                            <p>이메일 인증</p>
                        </div>
                        <div class="content">
                            <p>안녕하세요, <strong>%s</strong>님!</p>
                            <p>TestCaseCraft의 이메일 인증을 완료하기 위해 아래 버튼을 클릭해주세요.</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">이메일 인증하기</a>
                            </div>
                            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣어주세요:</p>
                            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 0.9em;">
                                %s
                            </p>
                            <div class="warning">
                                <strong>⚠️ 중요 안내</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>이 인증 링크는 <strong>24시간 동안만</strong> 유효합니다.</li>
                                    <li>인증 링크는 <strong>1회만</strong> 사용 가능합니다.</li>
                                    <li>본인이 요청하지 않은 경우, 이 이메일을 무시해주세요.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>본 메일은 발신 전용이므로 회신되지 않습니다.</p>
                            <p>&copy; 2025 TestCaseCraft. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(userName, verificationLink, verificationLink);
    }
}
