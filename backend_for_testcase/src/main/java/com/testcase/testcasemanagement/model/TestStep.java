// src/main/java/com/testcase/testcasemanagement/model/TestStep.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class TestStep {
    private int stepNumber;
    private String description;
    private String expectedResult;

    public TestStep() {}

    public int getStepNumber() { return stepNumber; }
    public void setStepNumber(int stepNumber) { this.stepNumber = stepNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getExpectedResult() { return expectedResult; }
    public void setExpectedResult(String expectedResult) { this.expectedResult = expectedResult; }
}
