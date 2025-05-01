// src/main/java/com/testcase/testcasemanagement/dto/TestCaseController.java

package com.testcase.testcasemanagement.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestStepDto {
    private int stepNumber;
    private String description;
    private String expectedResult;
}

