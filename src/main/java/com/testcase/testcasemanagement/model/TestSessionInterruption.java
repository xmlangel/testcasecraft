package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 세션 중단: 세션 실행 중 발생한 중단 기록 | Test Session Interruption: record of an interruption that occurred while a session was running")
@Table(
    name = "test_session_interruptions",
    indexes = {@Index(name = "idx_test_session_interruption_session", columnList = "session_id")})
public class TestSessionInterruption {

  @Comment("식별자: 중단 기록을 유일하게 가리키는 값 (값 영역: UUID 36자) | Identifier: value that uniquely identifies an interruption record (Value domain: UUID, 36 characters)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment("테스트 세션: 이 중단이 발생한 세션 (값 영역: test_sessions.id 참조) | Test Session: session in which this interruption occurred (Value domain: references test_sessions.id)")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private TestSession session;

  @Comment("중단 시작 일시: 중단이 시작된 일시 | Interruption Start Date Time: date and time the interruption started")
  @Column(name = "started_at", nullable = false)
  private LocalDateTime startedAt;

  @Comment("중단 종료 일시: 중단이 해제되고 테스트를 재개한 일시 | Interruption End Date Time: date and time the interruption ended and testing resumed")
  @Column(name = "ended_at")
  private LocalDateTime endedAt;

  @Comment("중단 사유: 중단의 원인(예: 환경 오류, 미팅, 대기) | Interruption Reason Text: cause of the interruption (for example, environment error, meeting, waiting)")
  @Column(name = "reason", columnDefinition = "TEXT")
  private String reason;
}
