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
  @Comment("결함 제목: 발견한 결함의 간단한 설명 (값 영역: 255자 이하) | Defect Title: brief description of the defect found (Value domain: up to 255 characters)")
  @Column(name = "title", length = 255)
  private String title;

  @Comment("결함 설명: 결함의 상세 내용, 재현 방법, 영향범위 | Defect Description: detailed content of the defect, including reproduction steps and scope of impact")
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Comment("심각도: 결함의 심각도 레벨 | Severity: severity level of the defect")
  @Column(name = "severity", length = 50)
  private String severity;

  @Comment("Jira 이슈 키: 이 결함에 해당하는 Jira 이슈의 식별자 | Jira Issue Key: identifier of the Jira issue that corresponds to this defect")
  @Column(name = "jira_issue_key", length = 100)
  private String jiraIssueKey;
}
