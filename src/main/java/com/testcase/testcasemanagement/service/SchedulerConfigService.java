package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.SchedulerConfigDto;
import com.testcase.testcasemanagement.dto.UpdateSchedulerDto;
import com.testcase.testcasemanagement.model.SchedulerConfig;
import com.testcase.testcasemanagement.repository.SchedulerConfigRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 스케줄러 설정 CRUD 서비스 */
@Service
public class SchedulerConfigService {

  private static final Logger logger = LoggerFactory.getLogger(SchedulerConfigService.class);

  /** RAG 비활성화 시 활성화가 차단되는 스케줄러 목록 */
  private static final Set<String> RAG_SCHEDULER_KEYS = Set.of("rag-cleanup", "rag-auto-analysis");

  private final SchedulerConfigRepository schedulerConfigRepository;
  private final DynamicSchedulerService dynamicSchedulerService;
  private final SystemSettingService systemSettingService;

  @Autowired
  public SchedulerConfigService(
      SchedulerConfigRepository schedulerConfigRepository,
      DynamicSchedulerService dynamicSchedulerService,
      SystemSettingService systemSettingService) {
    this.schedulerConfigRepository = schedulerConfigRepository;
    this.dynamicSchedulerService = dynamicSchedulerService;
    this.systemSettingService = systemSettingService;
  }

  /** 모든 스케줄 설정 조회 */
  public List<SchedulerConfigDto> getAllConfigs() {
    return schedulerConfigRepository.findAll().stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  /** 특정 스케줄 설정 조회 */
  public SchedulerConfigDto getConfigByTaskKey(String taskKey) {
    SchedulerConfig config =
        schedulerConfigRepository
            .findByTaskKey(taskKey)
            .orElseThrow(
                () -> new IllegalArgumentException("Scheduler config not found: " + taskKey));
    return convertToDto(config);
  }

  /** 스케줄 설정 업데이트 */
  @Transactional
  public SchedulerConfigDto updateConfig(String taskKey, UpdateSchedulerDto dto) {
    SchedulerConfig config =
        schedulerConfigRepository
            .findByTaskKey(taskKey)
            .orElseThrow(
                () -> new IllegalArgumentException("Scheduler config not found: " + taskKey));

    // RAG 비활성화 시 RAG 관련 스케줄러 활성화 시도 차단
    if (Boolean.TRUE.equals(dto.getEnabled()) && RAG_SCHEDULER_KEYS.contains(taskKey)) {
      checkRagEnabledForScheduler(taskKey);
    }

    // 스케줄 타입이 변경된 경우
    if (dto.getScheduleType() != null && dto.getScheduleType() != config.getScheduleType()) {
      config.setScheduleType(dto.getScheduleType());
    }

    // 스케줄 타입에 따라 적절한 값 설정
    switch (config.getScheduleType()) {
      case CRON:
        if (dto.getCronExpression() != null) {
          validateCronExpression(dto.getCronExpression());
          config.setCronExpression(dto.getCronExpression());
        }
        break;
      case FIXED_RATE:
        if (dto.getFixedRateMs() != null) {
          validateFixedValue(dto.getFixedRateMs());
          config.setFixedRateMs(dto.getFixedRateMs());
        }
        break;
      case FIXED_DELAY:
        if (dto.getFixedDelayMs() != null) {
          validateFixedValue(dto.getFixedDelayMs());
          config.setFixedDelayMs(dto.getFixedDelayMs());
        }
        break;
    }

    if (dto.getEnabled() != null) {
      config.setEnabled(dto.getEnabled());
    }

    if (dto.getDescription() != null) {
      config.setDescription(dto.getDescription());
    }

    SchedulerConfig savedConfig = schedulerConfigRepository.save(config);
    logger.info("스케줄 설정 업데이트: taskKey={}, enabled={}", taskKey, savedConfig.getEnabled());

    // 동적 스케줄러에 변경사항 반영
    dynamicSchedulerService.rescheduleTask(taskKey);

    return convertToDto(savedConfig);
  }

  /** 스케줄 활성화/비활성화 토글 */
  @Transactional
  public SchedulerConfigDto toggleEnabled(String taskKey) {
    SchedulerConfig config =
        schedulerConfigRepository
            .findByTaskKey(taskKey)
            .orElseThrow(
                () -> new IllegalArgumentException("Scheduler config not found: " + taskKey));

    // RAG 비활성화 시 RAG 관련 스케줄러 toggle을 활성화하려 할 때 차단
    boolean willBeEnabled = !config.getEnabled();
    if (willBeEnabled && RAG_SCHEDULER_KEYS.contains(taskKey)) {
      checkRagEnabledForScheduler(taskKey);
    }

    config.setEnabled(!config.getEnabled());
    SchedulerConfig savedConfig = schedulerConfigRepository.save(config);
    logger.info("스케줄 활성화 상태 변경: taskKey={}, enabled={}", taskKey, savedConfig.getEnabled());

    // 동적 스케줄러에 변경사항 반영
    dynamicSchedulerService.rescheduleTask(taskKey);

    return convertToDto(savedConfig);
  }

  /** 스케줄 즉시 실행 */
  public void executeNow(String taskKey) {
    // 설정 존재 여부 확인
    if (!schedulerConfigRepository.existsByTaskKey(taskKey)) {
      throw new IllegalArgumentException("Scheduler config not found: " + taskKey);
    }

    logger.info("스케줄 즉시 실행 요청: taskKey={}", taskKey);
    dynamicSchedulerService.executeTaskNow(taskKey);
  }

  /** RAG 스케줄러 활성화 전 RAG 상태 확인 */
  private void checkRagEnabledForScheduler(String taskKey) {
    if (!systemSettingService.getBooleanSetting("RAG_ENABLED", true)) {
      throw new IllegalStateException(
          "RAG 기능이 비활성화되어 있어 '"
              + taskKey
              + "' 스케줄러를 활성화할 수 없습니다. "
              + "RAG 시스템 설정에서 RAG를 먼저 활성화해주세요.");
    }
  }

  /** Entity를 DTO로 변환 */
  private SchedulerConfigDto convertToDto(SchedulerConfig config) {
    SchedulerConfigDto dto = SchedulerConfigDto.from(config);

    // 다음 실행 시간 계산 (CRON인 경우만)
    if (config.getScheduleType() == SchedulerConfig.ScheduleType.CRON
        && config.getCronExpression() != null
        && config.getEnabled()) {
      try {
        CronExpression cronExpression = CronExpression.parse(config.getCronExpression());
        LocalDateTime nextExecution = cronExpression.next(LocalDateTime.now());
        dto.setNextExecutionTime(nextExecution);
      } catch (Exception e) {
        logger.warn(
            "다음 실행 시간 계산 실패: taskKey={}, cron={}", config.getTaskKey(), config.getCronExpression());
      }
    }

    // 스케줄 표현식 문자열 생성
    dto.setScheduleExpression(getScheduleExpression(config));

    return dto;
  }

  /** 스케줄 표현식 문자열 생성 */
  private String getScheduleExpression(SchedulerConfig config) {
    switch (config.getScheduleType()) {
      case CRON:
        return config.getCronExpression();
      case FIXED_RATE:
        return formatMilliseconds(config.getFixedRateMs()) + " (Fixed Rate)";
      case FIXED_DELAY:
        return formatMilliseconds(config.getFixedDelayMs()) + " (Fixed Delay)";
      default:
        return "Unknown";
    }
  }

  /** 밀리초를 사람이 읽기 쉬운 형태로 변환 */
  private String formatMilliseconds(Long ms) {
    if (ms == null) return "N/A";

    long seconds = ms / 1000;
    if (seconds < 60) return seconds + "초";

    long minutes = seconds / 60;
    if (minutes < 60) return minutes + "분";

    long hours = minutes / 60;
    if (hours < 24) return hours + "시간";

    long days = hours / 24;
    return days + "일";
  }

  /** Cron 표현식 유효성 검증 */
  private void validateCronExpression(String cronExpression) {
    try {
      CronExpression.parse(cronExpression);
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid cron expression: " + cronExpression, e);
    }
  }

  /** Fixed Rate/Delay 값 유효성 검증 */
  private void validateFixedValue(Long value) {
    if (value == null || value <= 0) {
      throw new IllegalArgumentException("Fixed rate/delay must be greater than 0");
    }
  }
}
