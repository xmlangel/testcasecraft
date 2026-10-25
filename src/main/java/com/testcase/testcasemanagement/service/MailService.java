// src/main/java/com/testcase/testcasemanagement/service/MailService.java
package com.testcase.testcasemanagement.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
  private final JavaMailSender mailSender;

  // 기본 발신자 주소 사용 (application.properties에 설정된 주소)
  public void sendMail(String to, String subject, String text) throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
    helper.setTo(to);
    helper.setSubject(subject);
    helper.setText(text, false);
    mailSender.send(message);
  }

  // ICT-443: 발신자를 호출자가 정하는 메서드(sendMailWithCustomSender·sendHtmlMail)는 제거했다.
  // 쓰던 곳이 POST /api/mail/send 하나였고, 발신자 사칭 메일을 보내는 통로였다.
}
