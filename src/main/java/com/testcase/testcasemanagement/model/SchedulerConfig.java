package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** 스케줄러 설정 Entity 스케줄 작업의 실행 시간을 동적으로 관리하기 위한 설정 정보 */
@Entity
@Comment("스케줄러 설정: 백그라운드 작업별 실행 주기와 최근 실행 상태 | Scheduler Configuration: execution interval and most recent execution status of each background job")
@Table(name = "scheduler_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SchedulerConfig {

  @Comment("식별자: 스케줄러 설정을 구분하는 일련번호 | Identifier: serial number that distinguishes a scheduler configuration")
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** 작업 이름 (사용자에게 표시되는 이름) 예: "RAG 고아 문서 정리" */
  @Comment("작업 명: 사용자에게 표시되는 스케줄 작업의 이름 (값 영역: 200자 이하) | Task Name: name of the scheduled task displayed to users (Value domain: up to 200 characters)")
  @Column(nullable = false, length = 200)
  private String taskName;

  /** 작업 키 (코드에서 참조하는 고유 키) 예: "rag-cleanup" */
  @Comment("작업 키: 코드에서 참조하는 작업의 고유 식별자 (값 영역: 100자 이하, 프로젝트 내 유일) | Task Key: unique identifier of the task referenced from code (Value domain: up to 100 characters, unique within a project)")
  @Column(nullable = false, unique = true, length = 100)
  private String taskKey;

  /** Cron 표현식 예: "0 0 1 * * *" (매일 새벽 1시) */
  @Comment("Cron 표현식: 작업 실행 일정을 정의하는 Cron 형식 문자열, scheduleType이 CRON일 때 사용 (값 영역: 100자 이하) | Cron Expression: Cron-format string that defines the job execution schedule, used when scheduleType is CRON (Value domain: up to 100 characters)")
  @Column(length = 100)
  private String cronExpression;

  /** 스케줄 타입 */
  @Comment("스케줄 유형: 작업 실행 방식 (값 영역: CRON, FIXED_RATE, FIXED_DELAY) | Schedule Type: method by which the job is run (Value domain: CRON, FIXED_RATE, FIXED_DELAY)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ScheduleType scheduleType;

  /** Fixed Rate 값 (밀리초) scheduleType이 FIXED_RATE인 경우 사용 */
  @Comment("고정 주기: scheduleType이 FIXED_RATE일 때 이전 시작 시간으로부터의 간격 (값 영역: 밀리초) | Fixed Rate: interval from the previous start time when scheduleType is FIXED_RATE (Value domain: milliseconds)")
  private Long fixedRateMs;

  /** Fixed Delay 값 (밀리초) scheduleType이 FIXED_DELAY인 경우 사용 */
  @Comment("고정 지연: scheduleType이 FIXED_DELAY일 때 이전 완료 시간으로부터의 지연 시간 (값 영역: 밀리초) | Fixed Delay: delay from the previous completion time when scheduleType is FIXED_DELAY (Value domain: milliseconds)")
  private Long fixedDelayMs;

  /** 활성화 여부 */
  @Comment("활성화 여부: 이 작업의 실행 여부 (값 영역: true, false) | Enabled Indicator: indicator of whether this job is executed (Value domain: true, false)")
  @Builder.Default
  @Column(nullable = false)
  private Boolean enabled = true;

  /** 작업 설명 */
  @Comment("설명: 이 작업의 목적과 동작에 대한 상세 설명 | Description: detailed description of the purpose and behavior of this job")
  @Column(length = 500)
  private String description;

  /** 마지막 실행 시간 */
  @Comment("마지막 실행 일시: 이 작업이 마지막으로 실행된 일시 | Last Execution Date Time: date and time this job was last executed")
  private LocalDateTime lastExecutionTime;

  /** 마지막 실행 상태 */
  @Comment("마지막 실행 상태: 최근 실행의 성공 또는 실패 여부 | Last Execution Status: whether the most recent execution succeeded or failed")
  @Column(length = 50)
  private String lastExecutionStatus;

  /** 생성자 */
  @Comment("생성자: 이 행을 처음 저장한 사용자 | Creator: user who first saved this row")
  @CreatedBy
  @Column(updatable = false, length = 100)
  private String createdBy;

  /** 생성 시간 */
  @Comment("생성 일시: 이 행이 처음 저장된 일시 | Created Date Time: date and time this row was first saved")
  @CreatedDate
  @Column(updatable = false)
  private LocalDateTime createdDate;

  /** 마지막 수정자 */
  @Comment("마지막 수정자: 이 행을 마지막으로 변경한 사용자 | Last Modifier: user who last changed this row")
  @LastModifiedBy
  @Column(length = 100)
  private String lastModifiedBy;

  /** 마지막 수정 시간 */
  @Comment("마지막 수정 일시: 이 행이 마지막으로 변경된 일시 | Last Modified Date Time: date and time this row was last changed")
  @LastModifiedDate private LocalDateTime lastModifiedDate;

  /** 스케줄 타입 Enum */
  public enum ScheduleType {
    CRON, // Cron 표현식 기반
    FIXED_RATE, // 고정 주기 (이전 시작 시간 기준)
    FIXED_DELAY // 고정 지연 (이전 완료 시간 기준)
  }
}
