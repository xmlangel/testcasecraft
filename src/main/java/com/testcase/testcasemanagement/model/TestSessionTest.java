package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TestSessionTest {
  @Comment("테스트 제목: 수행한 테스트의 이름 (값 영역: 255자 이하) | Test Title: name of the test performed (Value domain: up to 255 characters)")
  @Column(name = "title", length = 255)
  private String title;

  @Comment("테스트 스텝: 테스트 수행 절차 | Test Step: procedure for performing the test")
  @Column(name = "steps", columnDefinition = "TEXT")
  private String steps;

  @Comment("기대 결과: 각 스텝에서 예상되는 시스템 동작 | Expected Result: system behavior expected at each step")
  @Column(name = "expected_result", columnDefinition = "TEXT")
  private String expectedResult;

  @Comment("테스트 결과: 테스트 수행 결과 (값 영역: PASS, FAIL, BLOCK, UNTESTED) | Test Result: result of performing the test (Value domain: PASS, FAIL, BLOCK, UNTESTED)")
  @Column(name = "status", length = 50)
  private String status; // PASS, FAIL, BLOCK, UNTESTED
}
