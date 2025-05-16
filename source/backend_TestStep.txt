// src/main/java/com/testcase/testcasemanagement/model/TestStep.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.PrePersist;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TestStep {
    private int stepNumber = 1;
    private String description;
    private String expectedResult;

    @PrePersist
    protected void onCreate() {
        if (this.stepNumber == 0) {  // 기본값 처리
            this.stepNumber = 1;
        }
    }
}
