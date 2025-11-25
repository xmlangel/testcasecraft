package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.SchedulerConfig;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 스케줄러 설정 업데이트 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSchedulerDto {

    /**
     * Cron 표현식
     * scheduleType이 CRON인 경우 필수
     */
    private String cronExpression;

    /**
     * Fixed Rate 값 (밀리초)
     * scheduleType이 FIXED_RATE인 경우 필수
     */
    private Long fixedRateMs;

    /**
     * Fixed Delay 값 (밀리초)
     * scheduleType이 FIXED_DELAY인 경우 필수
     */
    private Long fixedDelayMs;

    /**
     * 스케줄 타입
     */
    private SchedulerConfig.ScheduleType scheduleType;

    /**
     * 활성화 여부
     */
    @NotNull(message = "Enabled status is required")
    private Boolean enabled;

    /**
     * 작업 설명 (선택)
     */
    private String description;
}
