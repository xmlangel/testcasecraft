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
            mailService.sendMail(mailDto.getTo(), mailDto.getSubject(), mailDto.getText());
            return ResponseEntity.ok().body("메일이 성공적으로 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("메일 발송 실패: " + e.getMessage());
        }
    }
}
