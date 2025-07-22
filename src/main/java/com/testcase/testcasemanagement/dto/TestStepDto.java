// src/main/java/com/testcase/testcasemanagement/dto/TestStepDto.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestStepDto {
    private int stepNumber;

    @NotBlank(message = "단계 설명은 필수 항목입니다")
    @Size(max = 10000, message = "단계 설명은 10,000자 이내로 입력해주세요")
    private String description; //✅ 필수 필드

    @Size(max = 10000, message = "기대 결과는 10,000자 이내로 입력해주세요")
    private String expectedResult;
}
