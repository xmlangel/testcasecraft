package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.SchedulerConfig;
import com.testcase.testcasemanagement.repository.SchedulerConfigRepository;
import com.testcase.testcasemanagement.service.DynamicSchedulerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** 스케줄러 설정 초기화 애플리케이션 시작 시 기본 스케줄 설정을 DB에 저장 */
@Component
public class SchedulerInitializer implements CommandLineRunner {

  private static final Logger logger = LoggerFactory.getLogger(SchedulerInitializer.class);

  private static final String NO_AUTO_SCHEDULE_DESCRIPTION =
      "7일 이상 사용되지 않은 첨부파일 삭제 (자동 실행 없음 — 관리자가 직접 실행)";

  private final SchedulerConfigRepository schedulerConfigRepository;

  @Autowired
  public SchedulerInitializer(SchedulerConfigRepository schedulerConfigRepository) {
    this.schedulerConfigRepository = schedulerConfigRepository;
  }

  @Override
  public void run(String... args) {
    logger.info("=== 스케줄러 설정 초기화 시작 ===");

    createSchedulerConfigIfNotExists(
        "performance-metrics",
        "성능 메트릭 로깅",
        "0 */5 * * * *",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        true,
        "매 5분마다 대시보드 성능 메트릭을 로그에 기록");

    createSchedulerConfigIfNotExists(
        "system-health-check",
        "시스템 헬스 체크",
        "0 */10 * * * *",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        true,
        "매 10분마다 시스템 헬스 임계값 확인");

    createSchedulerConfigIfNotExists(
        "cache-monitoring",
        "캐시 모니터링",
        null,
        SchedulerConfig.ScheduleType.FIXED_RATE,
        1800000L, // 30분
        null,
        true,
        "매 30분마다 전체 캐시 상태를 확인하고 필요시 경고");

    createSchedulerConfigIfNotExists(
        "daily-performance-report",
        "일일 성능 리포트",
        "0 0 0 * * *",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        true,
        "매일 자정에 일일 성능 리포트 생성");

    createSchedulerConfigIfNotExists(
        "weekly-performance-report",
        "주간 성능 리포트",
        "0 0 9 * * 1",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        true,
        "매주 월요일 오전 9시에 주간 성능 요약 리포트 생성");

    createSchedulerConfigIfNotExists(
        "rag-cleanup",
        "RAG 고아 문서 정리",
        "0 0 1 * * *",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        true,
        "매일 새벽 1시에 DB에 존재하지 않는 테스트케이스 ID를 가진 RAG 문서 삭제");

    // 자동 실행하지 않는다. 사용자가 지우라고 한 적 없는 파일이 시간이 지났다는 이유로 사라지고
    // 되돌릴 수 없어, 일정으로 도는 것을 막았다(DynamicSchedulerService.NO_AUTO_SCHEDULE).
    // 기능은 남아 있어 관리자가 필요할 때 직접 실행할 수 있다.
    createSchedulerConfigIfNotExists(
        "attachment-cleanup",
        "첨부파일 정리",
        "0 0 2 * * *",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        false,
        NO_AUTO_SCHEDULE_DESCRIPTION);

    createSchedulerConfigIfNotExists(
        "rag-auto-analysis",
        "RAG 문서 자동 LLM 분석",
        "0 0 23 * * *",
        SchedulerConfig.ScheduleType.CRON,
        null,
        null,
        true,
        "매일 저녁 11시에 등록된 RAG 문서를 날짜순으로 자동 LLM 청크 분석 (기본 LLM Config 사용, 완료된 문서는 Skip)");

    // 예전부터 돌던 서버의 설정을 꺼진 상태로 맞춘다 (신규 생성만으로는 기존 행이 그대로 남는다)
    forceDisableAutoSchedules();

    logger.info("=== 스케줄러 설정 초기화 완료 ===");
  }

  /**
   * 자동 실행하지 않는 작업의 기존 설정을 꺼진 상태로 맞춘다.
   *
   * <p>{@code createSchedulerConfigIfNotExists} 는 이미 있는 행을 건드리지 않으므로, 예전부터 돌던 서버는 화면에 「활성·매일 새벽
   * 2시」로 보인다. 코드가 일정을 걸지 않으니 화면과 실제가 반대로 읽혀, 운영자가 정리가 도는 줄 알고 저장소를 방치하게 된다. 그래서 이 작업만 값을 맞춰 준다.
   *
   * <p>시각·타입은 그대로 남긴다 — 관리자가 직접 실행할 때 참고하는 값이다.
   */
  private void forceDisableAutoSchedules() {
    for (String taskKey : DynamicSchedulerService.NO_AUTO_SCHEDULE) {
      schedulerConfigRepository
          .findByTaskKey(taskKey)
          .filter(config -> Boolean.TRUE.equals(config.getEnabled()))
          .ifPresent(
              config -> {
                config.setEnabled(false);
                config.setDescription(NO_AUTO_SCHEDULE_DESCRIPTION);
                schedulerConfigRepository.save(config);
                logger.info("자동 실행하지 않는 작업이라 설정을 꺼진 상태로 맞췄다: taskKey={}", taskKey);
              });
    }
  }

  /** 스케줄 설정이 존재하지 않으면 생성 */
  private void createSchedulerConfigIfNotExists(
      String taskKey,
      String taskName,
      String cronExpression,
      SchedulerConfig.ScheduleType scheduleType,
      Long fixedRateMs,
      Long fixedDelayMs,
      Boolean enabled,
      String description) {

    if (schedulerConfigRepository.existsByTaskKey(taskKey)) {
      logger.debug("스케줄 설정 이미 존재: taskKey={}", taskKey);
      return;
    }

    SchedulerConfig config =
        SchedulerConfig.builder()
            .taskKey(taskKey)
            .taskName(taskName)
            .cronExpression(cronExpression)
            .scheduleType(scheduleType)
            .fixedRateMs(fixedRateMs)
            .fixedDelayMs(fixedDelayMs)
            .enabled(enabled)
            .description(description)
            .createdBy("system")
            .build();

    schedulerConfigRepository.save(config);
    logger.info("스케줄 설정 생성 완료: taskKey={}, taskName={}", taskKey, taskName);
  }
}
