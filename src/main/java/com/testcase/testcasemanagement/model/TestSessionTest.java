package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
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
public class TestSessionTest {
  @Column(name = "title", length = 255)
  private String title;

  @Column(name = "steps", columnDefinition = "TEXT")
  private String steps;

  @Column(name = "expected_result", columnDefinition = "TEXT")
  private String expectedResult;

  @Column(name = "status", length = 50)
  private String status; // PASS, FAIL, BLOCK, UNTESTED
}
