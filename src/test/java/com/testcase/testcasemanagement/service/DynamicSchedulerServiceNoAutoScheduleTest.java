package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.config.SchedulingConfig;
import com.testcase.testcasemanagement.model.SchedulerConfig;
import com.testcase.testcasemanagement.repository.SchedulerConfigRepository;
import java.util.Optional;
import java.util.concurrent.ScheduledFuture;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 첨부 정리가 시간이 지났다는 이유로 저절로 돌지 않는지 확인한다.
 *
 * <p>사용자가 지우라고 한 적 없는 파일이 사라지고 되돌릴 수 없어 자동 실행을 막았다. 기능 자체는 남아, 관리자가 직접 실행하면 동작해야 한다.
 */
public class DynamicSchedulerServiceNoAutoScheduleTest {

  private static final String BLOCKED = "attachment-cleanup";

  @Mock private TaskScheduler taskScheduler;
  @Mock private SchedulerConfigRepository schedulerConfigRepository;
  @Mock private SchedulingConfig schedulingConfig;

  private DynamicSchedulerService service;

  private static SchedulerConfig cronConfig(String taskKey, boolean enabled) {
    SchedulerConfig config = new SchedulerConfig();
    config.setTaskKey(taskKey);
    config.setTaskName(taskKey);
    config.setCronExpression("0 0 2 * * *");
    config.setScheduleType(SchedulerConfig.ScheduleType.CRON);
    config.setEnabled(enabled);
    return config;
  }

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    // 서비스가 반환값을 보관하므로 목이 null 을 주면 등록 자체가 실패한다
    when(taskScheduler.schedule(any(Runnable.class), any(Trigger.class)))
        .thenReturn(mock(ScheduledFuture.class));
    service =
        new DynamicSchedulerService(taskScheduler, schedulerConfigRepository, schedulingConfig);
  }

  /** 설정이 켜져 있어도 일정을 걸지 않는다 — 이미 켠 채로 돌던 서버도 코드를 올리면 멈춘다. */
  @Test
  public void testDoesNotScheduleAttachmentCleanupEvenWhenEnabled() {
    service.scheduleTask(cronConfig(BLOCKED, true));

    verify(taskScheduler, never()).schedule(any(Runnable.class), any(Trigger.class));
    assertFalse(service.isTaskScheduled(BLOCKED));
  }

  /** 다른 작업은 종전대로 일정이 걸린다 — 이 차단이 스케줄러 전체를 멈추지 않는다. */
  @Test
  public void testStillSchedulesOtherTasks() {
    service.scheduleTask(cronConfig("rag-cleanup", true));

    verify(taskScheduler, times(1)).schedule(any(Runnable.class), any(Trigger.class));
  }

  /** 관리자가 직접 실행하면 첨부 정리는 그대로 동작한다 — 삭제 기능을 없앤 것이 아니다. */
  @Test
  public void testManualExecutionStillRunsAttachmentCleanup() {
    when(schedulerConfigRepository.findByTaskKey(BLOCKED))
        .thenReturn(Optional.of(cronConfig(BLOCKED, false)));

    service.executeTaskNow(BLOCKED);

    verify(schedulingConfig, times(1)).cleanupUnusedAttachments();
  }

  /** 자동 실행이 막힌 작업은 어떤 스케줄 타입이어도 등록되지 않는다. */
  @Test
  public void testBlocksRegardlessOfScheduleType() {
    for (SchedulerConfig.ScheduleType type : SchedulerConfig.ScheduleType.values()) {
      SchedulerConfig config = cronConfig(BLOCKED, true);
      config.setScheduleType(type);
      config.setFixedRateMs(60000L);
      config.setFixedDelayMs(60000L);

      service.scheduleTask(config);
    }

    verify(taskScheduler, never()).schedule(any(Runnable.class), any(Trigger.class));
    assertFalse(service.isTaskScheduled(BLOCKED));
  }
}
