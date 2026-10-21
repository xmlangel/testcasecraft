// src/main/java/com/testcase/testcasemanagement/service/VerificationMailSender.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.MailSettings;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * 인증 메일 한 통을 SMTP 로 보낸다. 호출한 스레드에서 끝까지 보내고, 실패하면 예외를 던진다.
 *
 * <p>ICT-439: {@link EmailVerificationService} 가 이 클래스를 발송 전용 스레드 풀에서 부른다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VerificationMailSender {

  private final EncryptionUtil encryptionUtil;

  @Value("${app.frontend.url:http://localhost:8080}")
  private String frontendUrl;

  /** 인증 이메일 발송 (MailSettings 사용) */
  public void send(
      MailSettings mailSettings, String toEmail, String token, String userName, String baseUrl)
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

  /** MailSettings로부터 JavaMailSender 동적 생성 */
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
    // ICT-439: 메일 서버가 응답하지 않을 때 요청이 끝나지 않는 것을 막는다
    props.put("mail.smtp.connectiontimeout", "5000");
    props.put("mail.smtp.timeout", "5000");
    props.put("mail.smtp.writetimeout", "5000");

    return mailSender;
  }

  /** HTML 이메일 템플릿 생성 */
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
