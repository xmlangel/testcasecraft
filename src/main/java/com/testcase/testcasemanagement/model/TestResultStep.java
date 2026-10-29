package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * ICT-469: 테스트 결과 하나 안의 스텝별 결과.
 *
 * <p>스텝 설명과 기대 결과는 저장할 때 케이스에서 복사한 사본이다. 실행 뒤에 케이스 스텝을 고쳐도 지난 결과는 실행 당시 내용을 보여 준다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class TestResultStep {
  @Comment("스텝 번호: 케이스 스텝의 순서 번호 (값 영역: 1 이상의 정수)")
  @Column(name = "step_number", nullable = false)
  private int stepNumber;

  @Comment("스텝 설명 사본: 실행 당시 케이스 스텝의 설명")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Comment("기대 결과 사본: 실행 당시 케이스 스텝의 기대 결과")
  @Column(name = "expected_result", columnDefinition = "TEXT")
  private String expectedResult;

  @Comment("스텝 결과: 이 스텝의 실행 결과 (값 영역: NOT_RUN, PASS, FAIL, BLOCKED)")
  @Column(name = "result", length = 20, nullable = false)
  private String result;

  @Comment("실제 결과: 이 스텝에서 관찰한 내용이나 메모")
  @Column(name = "actual_result", columnDefinition = "TEXT")
  private String actualResult;
}
