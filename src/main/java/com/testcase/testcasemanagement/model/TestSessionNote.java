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
public class TestSessionNote {
  @Comment("메모 제목: 메모의 주제 또는 카테고리 (값 영역: 255자 이하) | Note Title: subject or category of the note (Value domain: up to 255 characters)")
  @Column(name = "title", length = 255)
  private String title;

  @Comment("메모 내용: 테스터가 세션 중 기록한 자유 형식의 텍스트 | Note Text: free-form text recorded by the tester during the session")
  @Column(name = "content", columnDefinition = "TEXT")
  private String content;
}
