// src/main/java/com/testcase/testcasemanagement/model/TestStep.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TestStep {
    private int stepNumber;
    private String description;
    private String expectedResult;
}
