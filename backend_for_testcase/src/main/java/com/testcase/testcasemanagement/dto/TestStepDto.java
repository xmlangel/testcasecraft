// src/main/java/com/testcase/testcasemanagement/dto/TestCaseController.java

package com.testcase.testcasemanagement.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TestStep DTO 정의
@Getter
@Setter
@ToString
public class TestStepDto {
    private int stepNumber;
    private String description;
    private String expectedResult;
}

