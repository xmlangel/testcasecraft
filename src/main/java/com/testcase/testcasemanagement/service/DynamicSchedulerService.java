package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.config.SchedulingConfig;
import com.testcase.testcasemanagement.model.SchedulerConfig;
import com.testcase.testcasemanagement.repository.SchedulerConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

/**
 * 동적 스케줄링 서비스
 * 런타임에 스케줄 작업을 등록, 변경, 취소할 수 있는 핵심 서비스
 */
@Service
public class DynamicSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(DynamicSchedulerService.class);

    private final TaskScheduler taskScheduler;
    private final SchedulerConfigRepository schedulerConfigRepository;
    private final SchedulingConfig schedulingConfig;

    // 현재 실행 중인 스케줄 작업들
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    @Autowired
    public DynamicSchedulerService(
            TaskScheduler taskScheduler,
            SchedulerConfigRepository schedulerConfigRepository,
            SchedulingConfig schedulingConfig) {
        this.taskScheduler = taskScheduler;
        this.schedulerConfigRepository = schedulerConfigRepository;
        this.schedulingConfig = schedulingConfig;
    }

    /**
     * 애플리케이션 시작 시 DB에서 스케줄 설정을 로드하여 초기화
     */
    @PostConstruct
    public void initializeSchedules() {
        logger.info("=== 동적 스케줄러 초기화 시작 ===");

        var configs = schedulerConfigRepository.findAllByEnabledTrue();
        logger.info("활성화된 스케줄 설정 {}개 로드", configs.size());

        for (SchedulerConfig config : configs) {
            try {
                scheduleTask(config);
                logger.info("스케줄 등록 완료: taskKey={}, type={}, expression={}",
                        config.getTaskKey(),
                        config.getScheduleType(),
                        getScheduleExpression(config));
            } catch (Exception e) {
                logger.error("스케줄 등록 실패: taskKey={}, error={}",
                        config.getTaskKey(), e.getMessage(), e);
            }
        }

        logger.info("=== 동적 스케줄러 초기화 완료 ===");
    }

    /**
     * 스케줄 작업 등록 또는 변경
     */
    public void scheduleTask(SchedulerConfig config) {
        if (!config.getEnabled()) {
            logger.debug("비활성화된 스케줄은 등록하지 않음: taskKey={}", config.getTaskKey());
            cancelTask(config.getTaskKey());
            return;
        }

        // 기존 스케줄이 있으면 취소
        cancelTask(config.getTaskKey());

        ScheduledFuture<?> future;
        try {
            switch (config.getScheduleType()) {
                case CRON:
                    if (config.getCronExpression() == null || config.getCronExpression().isBlank()) {
                        throw new IllegalArgumentException("Cron expression is required for CRON type");
                    }
                    future = taskScheduler.schedule(
                            () -> executeTask(config.getTaskKey()),
                            new CronTrigger(config.getCronExpression()));
                    break;

                case FIXED_RATE:
                    if (config.getFixedRateMs() == null || config.getFixedRateMs() <= 0) {
                        throw new IllegalArgumentException("Fixed rate must be > 0 for FIXED_RATE type");
                    }
                    future = taskScheduler.scheduleAtFixedRate(
                            () -> executeTask(config.getTaskKey()),
                            Duration.ofMillis(config.getFixedRateMs()));
                    break;

                case FIXED_DELAY:
                    if (config.getFixedDelayMs() == null || config.getFixedDelayMs() <= 0) {
                        throw new IllegalArgumentException("Fixed delay must be > 0 for FIXED_DELAY type");
                    }
                    future = taskScheduler.scheduleWithFixedDelay(
                            () -> executeTask(config.getTaskKey()),
                            Duration.ofMillis(config.getFixedDelayMs()));
                    break;

                default:
                    throw new IllegalArgumentException("Unknown schedule type: " + config.getScheduleType());
            }

            scheduledTasks.put(config.getTaskKey(), future);
            logger.info("스케줄 작업 등록 완료: taskKey={}, type={}, expression={}",
                    config.getTaskKey(),
                    config.getScheduleType(),
                    getScheduleExpression(config));

        } catch (Exception e) {
            logger.error("스케줄 작업 등록 실패: taskKey={}, error={}",
                    config.getTaskKey(), e.getMessage());
            throw new RuntimeException("Failed to schedule task: " + e.getMessage(), e);
        }
    }

    /**
     * 스케줄 작업 취소
     */
    public void cancelTask(String taskKey) {
        ScheduledFuture<?> future = scheduledTasks.remove(taskKey);
        if (future != null) {
            future.cancel(false);
            logger.info("스케줄 작업 취소 완료: taskKey={}", taskKey);
        }
    }

    /**
     * 스케줄 재등록 (설정 변경 시)
     */
    public void rescheduleTask(String taskKey) {
        var configOpt = schedulerConfigRepository.findByTaskKey(taskKey);
        if (configOpt.isEmpty()) {
            logger.warn("스케줄 설정을 찾을 수 없음: taskKey={}", taskKey);
            return;
        }

        scheduleTask(configOpt.get());
    }

    /**
     * 실제 작업 실행 (델리게이트 패턴)
     */
    private void executeTask(String taskKey) {
        logger.debug("스케줄 작업 실행 시작: taskKey={}", taskKey);
        LocalDateTime startTime = LocalDateTime.now();
        String status = "SUCCESS";

        try {
            // SchedulingConfig의 메서드를 taskKey에 따라 호출
            switch (taskKey) {
                case "performance-metrics":
                    schedulingConfig.logPerformanceMetrics();
                    break;
                case "system-health-check":
                    schedulingConfig.checkSystemHealthThresholds();
                    break;
                case "cache-monitoring":
                    schedulingConfig.monitorCacheHealth();
                    break;
                case "daily-performance-report":
                    schedulingConfig.generateDailyPerformanceReport();
                    break;
                case "weekly-performance-report":
                    schedulingConfig.generateWeeklyPerformanceReport();
                    break;
                case "rag-cleanup":
                    schedulingConfig.cleanupOrphanedRagDocuments();
                    break;
                case "attachment-cleanup":
                    schedulingConfig.cleanupUnusedAttachments();
                    break;
                case "rag-auto-analysis":
                    schedulingConfig.autoAnalyzeRagDocumentsWithLlm();
                    break;
                default:
                    logger.warn("알 수 없는 작업 키: taskKey={}", taskKey);
                    status = "UNKNOWN_TASK";
            }

        } catch (Exception e) {
            logger.error("스케줄 작업 실행 중 오류 발생: taskKey={}, error={}", taskKey, e.getMessage(), e);
            status = "FAILED";
        } finally {
            // 실행 결과를 DB에 기록
            updateExecutionStatus(taskKey, startTime, status);
        }

        logger.debug("스케줄 작업 실행 완료: taskKey={}, status={}", taskKey, status);
    }

    /**
     * 스케줄 즉시 실행
     */
    public void executeTaskNow(String taskKey) {
        logger.info("즉시 실행 요청: taskKey={}", taskKey);
        executeTask(taskKey);
    }

    /**
     * 실행 상태를 DB에 업데이트
     */
    private void updateExecutionStatus(String taskKey, LocalDateTime executionTime, String status) {
        try {
            var configOpt = schedulerConfigRepository.findByTaskKey(taskKey);
            if (configOpt.isPresent()) {
                SchedulerConfig config = configOpt.get();
                config.setLastExecutionTime(executionTime);
                config.setLastExecutionStatus(status);
                schedulerConfigRepository.save(config);
            }
        } catch (Exception e) {
            logger.error("실행 상태 업데이트 실패: taskKey={}, error={}", taskKey, e.getMessage());
        }
    }

    /**
     * 스케줄 표현식 문자열 반환
     */
    private String getScheduleExpression(SchedulerConfig config) {
        switch (config.getScheduleType()) {
            case CRON:
                return config.getCronExpression();
            case FIXED_RATE:
                return config.getFixedRateMs() + "ms (fixed rate)";
            case FIXED_DELAY:
                return config.getFixedDelayMs() + "ms (fixed delay)";
            default:
                return "Unknown";
        }
    }

    /**
     * 현재 등록된 스케줄 작업 수 반환
     */
    public int getActiveTaskCount() {
        return scheduledTasks.size();
    }

    /**
     * 특정 작업의 실행 여부 확인
     */
    public boolean isTaskScheduled(String taskKey) {
        return scheduledTasks.containsKey(taskKey);
    }
}
