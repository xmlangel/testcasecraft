package com.testcase.testcasemanagement.dto;

import com.testcase.testcasemanagement.model.SchedulerConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 스케줄러 설정 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchedulerConfigDto {

    private Long id;
    private String taskName;
    private String taskKey;
    private String cronExpression;
    private SchedulerConfig.ScheduleType scheduleType;
    private Long fixedRateMs;
    private Long fixedDelayMs;
    private Boolean enabled;
    private String description;
    private LocalDateTime lastExecutionTime;
    private String lastExecutionStatus;
    private LocalDateTime lastModifiedDate;
    private String lastModifiedBy;

    /**
     * 다음 실행 예정 시간 (계산된 값)
     */
    private LocalDateTime nextExecutionTime;

    /**
     * 스케줄 표현식 (사용자 친화적 문자열)
     */
    private String scheduleExpression;

    /**
     * Entity를 DTO로 변환
     */
    public static SchedulerConfigDto from(SchedulerConfig entity) {
        return SchedulerConfigDto.builder()
                .id(entity.getId())
                .taskName(entity.getTaskName())
                .taskKey(entity.getTaskKey())
                .cronExpression(entity.getCronExpression())
                .scheduleType(entity.getScheduleType())
                .fixedRateMs(entity.getFixedRateMs())
                .fixedDelayMs(entity.getFixedDelayMs())
                .enabled(entity.getEnabled())
                .description(entity.getDescription())
                .lastExecutionTime(entity.getLastExecutionTime())
                .lastExecutionStatus(entity.getLastExecutionStatus())
                .lastModifiedDate(entity.getLastModifiedDate())
                .lastModifiedBy(entity.getLastModifiedBy())
                .build();
    }
}
