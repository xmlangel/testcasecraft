// src/main/java/com/testcase/testcasemanagement/controller/MailController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.MailDto;
import com.testcase.testcasemanagement.service.MailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@Tag(name = "System - Mail", description = "메일 발송 관련 API")
@SecurityRequirement(name = "bearerAuth")
public class MailController {
    private final MailService mailService;

    @Operation(
            summary = "메일 발송",
            description = "지정된 수신자에게 메일을 발송합니다. HTML 형식과 일반 텍스트 형식을 모두 지원하며, 발신자 주소를 지정할 수 있습니다."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "메일 발송 성공",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(
                                    value = "메일이 성공적으로 발송되었습니다."
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "메일 발송 실패",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(
                                    value = "메일 발송 실패: [오류 메시지]"
                            )
                    )
            )
    })
    @PostMapping("/send")
    public ResponseEntity<?> sendMail(
            @Parameter(
                    description = "메일 발송 정보",
                    required = true,
                    schema = @Schema(implementation = MailDto.class)
            )
            @RequestBody MailDto mailDto) {
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
