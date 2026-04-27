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
public class TestSessionNote {
  @Column(name = "title", length = 255)
  private String title;

  @Column(name = "content", columnDefinition = "TEXT")
  private String content;
}
