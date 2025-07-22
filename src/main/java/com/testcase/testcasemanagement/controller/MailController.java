// src/main/java/com/testcase/testcasemanagement/controller/MailController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.MailDto;
import com.testcase.testcasemanagement.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {
    private final MailService mailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMail(@RequestBody MailDto mailDto) {
        try {
            // 발신자 주소가 지정되었는지 확인
            if (mailDto.getFrom() != null && !mailDto.getFrom().isEmpty()) {
                // HTML 형식 여부 확인
                if (mailDto.isHtml()) {
                    mailService.sendHtmlMail(
                            mailDto.getFrom(),
                            mailDto.getTo(),
                            mailDto.getSubject(),
                            mailDto.getText()
                    );
                } else {
                    mailService.sendMailWithCustomSender(
                            mailDto.getFrom(),
                            mailDto.getTo(),
                            mailDto.getSubject(),
                            mailDto.getText()
                    );
                }
            } else {
                // 기본 발신자 주소 사용
                mailService.sendMail(
                        mailDto.getTo(),
                        mailDto.getSubject(),
                        mailDto.getText()
                );
            }
            return ResponseEntity.ok().body("메일이 성공적으로 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("메일 발송 실패: " + e.getMessage());
        }
    }
}
