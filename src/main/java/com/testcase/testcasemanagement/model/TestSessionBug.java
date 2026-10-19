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
public class TestSessionBug {
  @Comment("결함 제목: 발견한 결함의 간단한 설명 (값 영역: 255자 이하)")
  @Column(name = "title", length = 255)
  private String title;

  @Comment("결함 설명: 결함의 상세 내용, 재현 방법, 영향범위")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Comment("심각도: 결함의 심각도 레벨")
  @Column(name = "severity", length = 50)
  private String severity;

  @Comment("Jira 이슈 키: 이 결함에 해당하는 Jira 이슈의 식별자")
  @Column(name = "jira_issue_key", length = 100)
  private String jiraIssueKey;
}
