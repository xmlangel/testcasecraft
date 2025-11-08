// src/main/java/com/testcase/testcasemanagement/dto/MailDto.java
package com.testcase.testcasemanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "메일 발송 요청 정보")
public class MailDto {
    
    @Schema(
            description = "발신자 이메일 주소 (선택사항, 지정하지 않으면 기본 발신자 주소 사용)",
            example = "sender@example.com"
    )
    private String from;
    
    @Schema(
            description = "수신자 이메일 주소",
            example = "recipient@example.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String to;

    @Schema(
            description = "메일 제목",
            example = "테스트 결과 알림",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String subject;

    @Schema(
            description = "메일 내용",
            example = "테스트가 완료되었습니다. 결과를 확인해주세요.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String text;
    
    @Schema(
            description = "HTML 형식 여부 (true: HTML 메일, false: 일반 텍스트 메일)",
            example = "false"
    )
    private boolean isHtml;
}
