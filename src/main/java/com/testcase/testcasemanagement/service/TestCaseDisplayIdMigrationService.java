// src/main/java/com/testcase/testcasemanagement/service/TestCaseDisplayIdMigrationService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** ICT-341: 기존 테스트 케이스들에 Display ID를 자동으로 생성하는 마이그레이션 서비스 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestCaseDisplayIdMigrationService {

  private final TestCaseRepository testCaseRepository;
  private final TestCaseDisplayIdService displayIdService;

  /**
   * 애플리케이션 시작 시 자동으로 실행되는 마이그레이션. displayId가 null인 테스트 케이스에 Display ID를 생성합니다.
   *
   * <p>대상에서 폴더는 뺀다. 폴더는 순차 ID를 받지 않아 Display ID를 만들 수 없고, 그래도 시도하면 기동마다 같은 폴더가 다시 실패해 경고만 쌓인다(실측:
   * 폴더 24건이 매번 "성공 0, 실패 24"). 순차 ID를 이미 가진 폴더는 부여 대상에 남는다 — 프로젝트 간 복사와 같은 기준이다.
   */
  @EventListener(ApplicationReadyEvent.class)
  @Transactional
  public void migrateExistingTestCases() {
    log.info("기존 테스트 케이스 Display ID 마이그레이션 시작");

    try {
      List<TestCase> targets = testCaseRepository.findMigratableWithoutDisplayId();

      if (targets.isEmpty()) {
        log.info("Display ID 마이그레이션이 필요한 테스트 케이스가 없습니다.");
        logSkippedFolders();
        return;
      }

      log.info("Display ID 마이그레이션 대상: {} 개 테스트 케이스", targets.size());

      MigrationResult result = assignDisplayIds(targets);

      log.info("Display ID 마이그레이션 완료 - 성공: {}, 실패: {}", result.success(), result.failure());

      if (result.failure() > 0) {
        log.warn("일부 테스트 케이스의 Display ID 마이그레이션이 실패했습니다. 로그를 확인하세요.");
      }
      logSkippedFolders();

    } catch (Exception e) {
      log.error("Display ID 마이그레이션 중 예상치 못한 오류가 발생했습니다.", e);
    }
  }

  /** 마이그레이션 결과 집계. */
  private record MigrationResult(int success, int failure) {}

  /**
   * 대상 노드에 Display ID를 부여한다. 순차 ID가 없는 테스트 케이스에는 프로젝트별 다음 번호를 먼저 채운다.
   *
   * <p>번호는 프로젝트별로 메모리에서 이어 붙인다. 노드마다 MAX를 다시 조회하면 같은 트랜잭션 안에서 아직 flush 되지 않은 앞 번호를 못 보고 중복이 난다.
   */
  private MigrationResult assignDisplayIds(List<TestCase> targets) {
    Map<String, Integer> lastSequentialIdByProject = new HashMap<>();
    int successCount = 0;
    int failCount = 0;

    for (TestCase testCase : targets) {
      try {
        ensureSequentialId(testCase, lastSequentialIdByProject);

        String generatedDisplayId = displayIdService.generateDisplayId(testCase);

        if (generatedDisplayId != null) {
          testCase.setDisplayId(generatedDisplayId);
          testCaseRepository.save(testCase);
          successCount++;

          log.debug(
              "Display ID 생성 성공 - TestCase ID: {}, Display ID: {}",
              testCase.getId(),
              generatedDisplayId);
        } else {
          failCount++;
          log.warn("Display ID 생성 실패 - TestCase ID: {} (프로젝트 또는 순차 ID 누락)", testCase.getId());
        }
      } catch (Exception e) {
        failCount++;
        log.error("Display ID 생성 중 오류 - TestCase ID: {}", testCase.getId(), e);
      }
    }

    return new MigrationResult(successCount, failCount);
  }

  /** 순차 ID가 없는 테스트 케이스에 프로젝트별 다음 번호를 채운다. 프로젝트가 없으면 손대지 않는다(Display ID 생성 단계에서 실패로 잡힌다). */
  private void ensureSequentialId(
      TestCase testCase, Map<String, Integer> lastSequentialIdByProject) {
    if (testCase.getSequentialId() != null || testCase.getProject() == null) {
      return;
    }

    String projectId = testCase.getProject().getId();
    int last =
        lastSequentialIdByProject.computeIfAbsent(
            projectId,
            id -> {
              Integer max = testCaseRepository.findMaxSequentialIdByProjectId(id);
              return max == null ? 0 : max;
            });

    int next = last + 1;
    lastSequentialIdByProject.put(projectId, next);
    testCase.setSequentialId(next);

    log.info("순차 ID 보정 - TestCase ID: {}, 순차 ID: {}", testCase.getId(), next);
  }

  /** Display ID 없이 남는 폴더 수를 알린다. 정상이라 기동 로그를 채우지 않도록 debug 로만 남긴다. */
  private void logSkippedFolders() {
    if (!log.isDebugEnabled()) {
      return;
    }
    long skipped =
        testCaseRepository.countByDisplayIdIsNull()
            - testCaseRepository.countMigratableWithoutDisplayId();
    if (skipped > 0) {
      log.debug("Display ID 없이 남는 폴더: {} 개 (폴더는 순차 ID를 받지 않아 대상이 아니다)", skipped);
    }
  }

  /**
   * 수동으로 마이그레이션을 실행할 수 있는 메소드 관리자가 필요에 따라 호출할 수 있습니다.
   *
   * @return 마이그레이션된 테스트 케이스 수
   */
  @Transactional
  public int manualMigration() {
    log.info("ICT-341: 수동 Display ID 마이그레이션 시작");

    int migrationCount =
        assignDisplayIds(testCaseRepository.findMigratableWithoutDisplayId()).success();

    log.info("ICT-341: 수동 Display ID 마이그레이션 완료 - {} 개 테스트 케이스 업데이트", migrationCount);
    return migrationCount;
  }

  /**
   * 특정 프로젝트의 테스트 케이스들에 대해서만 Display ID를 생성합니다.
   *
   * @param projectId 프로젝트 ID
   * @return 마이그레이션된 테스트 케이스 수
   */
  @Transactional
  public int migrateByProject(String projectId) {
    log.info("ICT-341: 프로젝트별 Display ID 마이그레이션 시작 - 프로젝트 ID: {}", projectId);

    int migrationCount =
        assignDisplayIds(testCaseRepository.findMigratableWithoutDisplayIdByProjectId(projectId))
            .success();

    log.info("프로젝트별 Display ID 마이그레이션 완료 - {} 개 테스트 케이스 업데이트", migrationCount);
    return migrationCount;
  }

  /**
   * Display ID 마이그레이션 상태를 확인합니다.
   *
   * @return 마이그레이션이 필요한 테스트 케이스 수
   */
  @Transactional(readOnly = true)
  public long checkMigrationStatus() {
    // 부여할 수 있는 노드만 센다. 전체 null 개수를 세면 폴더 때문에 "필요 24개"가 영구히 남는다.
    long countWithoutDisplayId = testCaseRepository.countMigratableWithoutDisplayId();
    log.info("Display ID 마이그레이션 상태 확인 - 마이그레이션 필요: {} 개", countWithoutDisplayId);
    return countWithoutDisplayId;
  }
}
