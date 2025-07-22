// src/main/java/com/testcase/testcasemanagement/dto/MailDto.java
package com.testcase.testcasemanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MailDto {
    private String from; // 발신자 주소 필드 추가
    private String to;
    private String subject;
    private String text;
    private boolean isHtml; // HTML 형식 여부
}
