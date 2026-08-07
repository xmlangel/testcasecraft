package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.UpdateSchedulerDto;
import com.testcase.testcasemanagement.model.SchedulerConfig;
import com.testcase.testcasemanagement.repository.SchedulerConfigRepository;
import java.util.Optional;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 자동 실행이 막힌 작업을 켜려는 요청이 거절되는지 확인한다.
 *
 * <p>화면 토글만 막으면 REST 로 직접 부를 수 있다. 그러면 설정은 켜졌는데 일정은 걸리지 않아, 정리가 돌아가는 줄 아는 상태가 그대로 생긴다. 반대로 끄는 것과,
 * 이미 켜진 행의 다른 필드를 고치는 것은 막지 않아야 한다.
 */
public class SchedulerConfigServiceBlockedTaskTest {

  private static final String BLOCKED = "attachment-cleanup";
  private static final String NORMAL = "rag-cleanup";

  @Mock private SchedulerConfigRepository schedulerConfigRepository;
  @Mock private DynamicSchedulerService dynamicSchedulerService;
  @Mock private SystemSettingService systemSettingService;

  private SchedulerConfigService service;

  private static SchedulerConfig config(String taskKey, Boolean enabled) {
    SchedulerConfig config = new SchedulerConfig();
    config.setTaskKey(taskKey);
    config.setTaskName(taskKey);
    config.setCronExpression("0 0 2 * * *");
    config.setScheduleType(SchedulerConfig.ScheduleType.CRON);
    config.setEnabled(enabled);
    return config;
  }

  private void given(SchedulerConfig existing) {
    when(schedulerConfigRepository.findByTaskKey(existing.getTaskKey()))
        .thenReturn(Optional.of(existing));
    when(schedulerConfigRepository.save(any(SchedulerConfig.class)))
        .thenAnswer(i -> i.getArguments()[0]);
  }

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    service =
        new SchedulerConfigService(
            schedulerConfigRepository, dynamicSchedulerService, systemSettingService);
    when(systemSettingService.getBooleanSetting(anyString(), anyBoolean())).thenReturn(true);
  }

  /** 꺼진 차단 작업을 토글로 켜려 하면 거절한다. */
  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testToggleRejectsEnablingBlockedTask() {
    given(config(BLOCKED, false));

    service.toggleEnabled(BLOCKED);
  }

  /** 켜져 있는 차단 작업을 끄는 것은 막지 않는다 — 옛 서버에서 넘어온 행을 되돌릴 유일한 길이다. */
  @Test
  public void testToggleAllowsDisablingBlockedTask() {
    SchedulerConfig existing = config(BLOCKED, true);
    given(existing);

    service.toggleEnabled(BLOCKED);

    assertFalse(existing.getEnabled());
  }

  /** 꺼짐→켜짐 전이만 막는다. 이미 켜진 행의 다른 필드를 고치는 요청은 통과해야 한다. */
  @Test
  public void testUpdateAllowsEditingAlreadyEnabledBlockedTask() {
    SchedulerConfig existing = config(BLOCKED, true);
    given(existing);

    UpdateSchedulerDto dto = new UpdateSchedulerDto();
    dto.setEnabled(true);
    dto.setCronExpression("0 30 3 * * *");

    service.updateConfig(BLOCKED, dto);

    assertEquals(existing.getCronExpression(), "0 30 3 * * *");
  }

  /** 꺼진 차단 작업을 편집으로 켜려 하면 거절한다. */
  @Test(expectedExceptions = IllegalArgumentException.class)
  public void testUpdateRejectsEnablingBlockedTask() {
    given(config(BLOCKED, false));

    UpdateSchedulerDto dto = new UpdateSchedulerDto();
    dto.setEnabled(true);

    service.updateConfig(BLOCKED, dto);
  }

  /** 막히지 않은 작업은 종전대로 켤 수 있다 — 이 규칙이 스케줄러 전체를 잠그지 않는다. */
  @Test
  public void testNormalTaskCanStillBeEnabled() {
    SchedulerConfig existing = config(NORMAL, false);
    given(existing);

    service.toggleEnabled(NORMAL);

    assertTrue(existing.getEnabled());
  }
}
