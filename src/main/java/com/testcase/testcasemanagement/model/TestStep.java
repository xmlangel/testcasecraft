// src/main/java/com/testcase/testcasemanagement/model/TestStep.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.PrePersist;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TestStep {
    private int stepNumber = 1;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String expectedResult;

    @PrePersist
    protected void onCreate() {
        if (this.stepNumber == 0) { // 기본값 처리
            this.stepNumber = 1;
        }
    }
}
