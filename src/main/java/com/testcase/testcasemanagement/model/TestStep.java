// src/main/java/com/testcase/testcasemanagement/model/TestStep.java
package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.PrePersist;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TestStep {
  @Comment("스텝 번호: 이 스텝의 순서 번호 (값 영역: 1 이상의 정수) | Step Number: order number of this step (Value domain: integer of 1 or greater)")
  private int stepNumber = 1;

  @Comment("스텝 설명: 이 스텝에서 수행할 작업 설명 | Step Description: description of the action to perform in this step")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment("기대 결과: 이 스텝 실행 후 기대하는 결과 | Expected Result: result expected after this step is executed")
  @Column(columnDefinition = "TEXT")
  private String expectedResult;

  @PrePersist
  protected void onCreate() {
    if (this.stepNumber == 0) { // 기본값 처리
      this.stepNumber = 1;
    }
  }
}
