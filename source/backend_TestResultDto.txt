package com.testcase.testcasemanagement.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TestResultDto {
    @NotBlank(message = "결과 값은 필수입니다")
    @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOTRUN)$",
            message = "유효하지 않은 결과 값입니다")
    private String result; // 문자열만 허용

    // id 필드 제거 (자동 생성)
    private String testCaseId;
    private String notes;
}
