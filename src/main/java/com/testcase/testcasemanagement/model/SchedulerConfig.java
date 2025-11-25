package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 스케줄러 설정 Entity
 * 스케줄 작업의 실행 시간을 동적으로 관리하기 위한 설정 정보
 */
@Entity
@Table(name = "scheduler_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SchedulerConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 작업 이름 (사용자에게 표시되는 이름)
     * 예: "RAG 고아 문서 정리"
     */
    @Column(nullable = false, length = 200)
    private String taskName;

    /**
     * 작업 키 (코드에서 참조하는 고유 키)
     * 예: "rag-cleanup"
     */
    @Column(nullable = false, unique = true, length = 100)
    private String taskKey;

    /**
     * Cron 표현식
     * 예: "0 0 1 * * *" (매일 새벽 1시)
     */
    @Column(length = 100)
    private String cronExpression;

    /**
     * 스케줄 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleType scheduleType;

    /**
     * Fixed Rate 값 (밀리초)
     * scheduleType이 FIXED_RATE인 경우 사용
     */
    private Long fixedRateMs;

    /**
     * Fixed Delay 값 (밀리초)
     * scheduleType이 FIXED_DELAY인 경우 사용
     */
    private Long fixedDelayMs;

    /**
     * 활성화 여부
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    /**
     * 작업 설명
     */
    @Column(length = 500)
    private String description;

    /**
     * 마지막 실행 시간
     */
    private LocalDateTime lastExecutionTime;

    /**
     * 마지막 실행 상태
     */
    @Column(length = 50)
    private String lastExecutionStatus;

    /**
     * 생성자
     */
    @CreatedBy
    @Column(updatable = false, length = 100)
    private String createdBy;

    /**
     * 생성 시간
     */
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    /**
     * 마지막 수정자
     */
    @LastModifiedBy
    @Column(length = 100)
    private String lastModifiedBy;

    /**
     * 마지막 수정 시간
     */
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    /**
     * 스케줄 타입 Enum
     */
    public enum ScheduleType {
        CRON, // Cron 표현식 기반
        FIXED_RATE, // 고정 주기 (이전 시작 시간 기준)
        FIXED_DELAY // 고정 지연 (이전 완료 시간 기준)
    }
}
