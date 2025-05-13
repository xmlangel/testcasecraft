package com.testcase.testcasemanagement.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDto {
    @NotBlank(message = "결과 값은 필수입니다")
    @Pattern(regexp = "^(PASS|FAIL|BLOCKED|NOT_RUN)$",
            message = "유효하지 않은 결과 값입니다")
    private String result; // 문자열만 허용

    // id 필드 제거 (자동 생성)
    private String testCaseId;

    @Size(max = 2000, message = "기대 결과는 2000자 이내로 입력해주세요")
    private String notes;

    @Override
    public String toString() {
        return "TestResultDto{" +
                "result='" + result + '\'' +
                ", testCaseId='" + testCaseId + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}
