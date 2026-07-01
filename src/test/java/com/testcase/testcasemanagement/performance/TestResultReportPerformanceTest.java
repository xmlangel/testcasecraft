// ICT-191: 테스트 결과 리포트 성능 테스트
package com.testcase.testcasemanagement.performance;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStatisticsDto;
import com.testcase.testcasemanagement.service.TestResultReportService;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.transaction.annotation.Transactional;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * ICT-191: 테스트 결과 리포트 성능 테스트
 *
 * <p>목적: 대용량 데이터와 동시 사용자 환경에서의 성능 검증 기준: 응답시간 < 500ms, 동시 사용자 지원, 메모리 효율성
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(
    username = "test_admin",
    roles = {"USER", "ADMIN"})
public class TestResultReportPerformanceTest extends AbstractTestNGSpringContextTests {

  @Autowired private TestResultReportService testResultReportService;

  private static final int CONCURRENT_USERS = 10;
  private static final int ITERATIONS_PER_USER = 5;
  private static final long PERFORMANCE_THRESHOLD_MS = 500;
  private static final long MAX_ACCEPTABLE_TIME_MS = 2000;

  @BeforeClass
  public void setUp() {
    System.out.println("=== ICT-191 테스트 결과 리포트 성능 테스트 시작 ===");
    System.out.println("🎯 성능 기준:");
    System.out.println("   - 응답시간 < " + PERFORMANCE_THRESHOLD_MS + "ms (목표)");
    System.out.println("   - 응답시간 < " + MAX_ACCEPTABLE_TIME_MS + "ms (허용)");
    System.out.println("   - 동시 사용자: " + CONCURRENT_USERS + "명");
    System.out.println("   - 사용자당 요청: " + ITERATIONS_PER_USER + "회");
  }

  @Test(priority = 1)
  public void testSingleUserResponseTime() {
    System.out.println("⚡ 1. 단일 사용자 응답시간 테스트");

    // 통계 조회 성능 테스트
    long statsTime =
        measureExecutionTime(
            () -> {
              TestResultStatisticsDto stats =
                  testResultReportService.getTestResultStatistics(null, null, null);
              assertNotNull(stats);
            });

    // 상세 리포트 조회 성능 테스트
    long reportTime =
        measureExecutionTime(
            () -> {
              TestResultFilterDto filter = createDefaultFilter(0, 50);
              Page<TestResultReportDto> report =
                  testResultReportService.getDetailedTestResultReport(filter);
              assertNotNull(report);
            });

    System.out.println("📊 통계 조회 시간: " + statsTime + "ms");
    System.out.println("📊 리포트 조회 시간: " + reportTime + "ms");

    // 성능 기준 검증
    if (statsTime < PERFORMANCE_THRESHOLD_MS && reportTime < PERFORMANCE_THRESHOLD_MS) {
      System.out.println("🚀 우수한 성능 (목표 기준 충족)");
    } else if (statsTime < MAX_ACCEPTABLE_TIME_MS && reportTime < MAX_ACCEPTABLE_TIME_MS) {
      System.out.println("✅ 허용 가능한 성능");
    } else {
      fail("성능 기준 미달: 통계=" + statsTime + "ms, 리포트=" + reportTime + "ms");
    }
  }

  @Test(priority = 2)
  public void testLargeDatasetPerformance() {
    System.out.println("📊 2. 대용량 데이터셋 성능 테스트");

    // 큰 페이지 사이즈로 테스트
    int[] pageSizes = {100, 500, 1000};

    for (int pageSize : pageSizes) {
      long executionTime =
          measureExecutionTime(
              () -> {
                TestResultFilterDto filter = createDefaultFilter(0, pageSize);
                Page<TestResultReportDto> report =
                    testResultReportService.getDetailedTestResultReport(filter);
                assertNotNull(report);
              });

      System.out.println("📊 페이지 크기 " + pageSize + " 조회 시간: " + executionTime + "ms");

      // 페이지 크기에 비례한 성능 기준 적용
      long threshold = PERFORMANCE_THRESHOLD_MS + (pageSize * 2); // 2ms per item
      if (executionTime > threshold) {
        System.out.println("⚠️ 성능 주의: " + pageSize + "건 조회에 " + executionTime + "ms");
      }
    }
  }

  @Test(priority = 3)
  public void testConcurrentUserLoad() {
    System.out.println("👥 3. 동시 사용자 부하 테스트");

    ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_USERS);
    List<Future<UserTestResult>> futures = new ArrayList<>();

    // 동시 사용자 시뮬레이션
    for (int i = 0; i < CONCURRENT_USERS; i++) {
      final int userId = i;
      futures.add(executor.submit(() -> simulateUserActivity(userId)));
    }

    // 결과 수집
    List<UserTestResult> results = new ArrayList<>();
    for (Future<UserTestResult> future : futures) {
      try {
        results.add(future.get(30, TimeUnit.SECONDS));
      } catch (Exception e) {
        fail("동시 사용자 테스트 실패: " + e.getMessage());
      }
    }

    executor.shutdown();

    // 성능 분석
    analyzeUserTestResults(results);
  }

  @Test(priority = 4)
  public void testMemoryEfficiency() {
    System.out.println("💾 4. 메모리 효율성 테스트");

    Runtime runtime = Runtime.getRuntime();

    // 가비지 컬렉션 실행
    System.gc();
    Thread.yield();

    long memoryBefore = runtime.totalMemory() - runtime.freeMemory();

    // 대량 데이터 조회
    TestResultFilterDto filter = createDefaultFilter(0, 1000);
    Page<TestResultReportDto> report = testResultReportService.getDetailedTestResultReport(filter);

    long memoryAfter = runtime.totalMemory() - runtime.freeMemory();
    long memoryUsed = memoryAfter - memoryBefore;

    System.out.println("📊 메모리 사용량: " + formatBytes(memoryUsed));
    System.out.println("📊 조회된 데이터: " + report.getNumberOfElements() + "건");

    if (report.getNumberOfElements() > 0) {
      long memoryPerRecord = memoryUsed / report.getNumberOfElements();
      System.out.println("📊 레코드당 메모리: " + formatBytes(memoryPerRecord));

      // 메모리 효율성 기준: 레코드당 10KB 미만
      if (memoryPerRecord < 10 * 1024) {
        System.out.println("✅ 메모리 효율성 양호");
      } else {
        System.out.println("⚠️ 메모리 사용량 주의: " + formatBytes(memoryPerRecord) + "/record");
      }
    }
  }

  @Test(priority = 5)
  public void testExportPerformance() {
    System.out.println("📄 5. 내보내기 기능 성능 테스트");

    String[] formats = {"CSV", "EXCEL", "PDF"};

    for (String format : formats) {
      long exportTime =
          measureExecutionTime(
              () -> {
                try {
                  TestResultFilterDto filter = createDefaultFilter(0, 100);
                  filter.setExportFormat(format);
                  filter.setIncludeStatistics(true);

                  byte[] exportData = testResultReportService.exportTestResultReport(filter);
                  assertNotNull(exportData);
                  assertTrue(exportData.length > 0);

                  System.out.println("📊 " + format + " 파일 크기: " + exportData.length + " bytes");
                } catch (Exception e) {
                  System.err.println("내보내기 오류 (" + format + "): " + e.getMessage());
                  throw new RuntimeException(e);
                }
              });

      System.out.println("📊 " + format + " 내보내기 시간: " + exportTime + "ms");

      // 내보내기는 더 긴 응답시간 허용
      if (exportTime > 5000) {
        System.out.println("⚠️ " + format + " 내보내기 성능 주의: " + exportTime + "ms");
      }
    }
  }

  @Test(priority = 6)
  public void testStressTest() {
    System.out.println("🔥 6. 스트레스 테스트");

    int totalRequests = 100;
    AtomicInteger successCount = new AtomicInteger(0);
    AtomicInteger errorCount = new AtomicInteger(0);

    ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_USERS);

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    for (int i = 0; i < totalRequests; i++) {
      executor.submit(
          () -> {
            if (auth != null) {
              SecurityContextHolder.getContext().setAuthentication(auth);
            }
            try {
              TestResultStatisticsDto stats =
                  testResultReportService.getTestResultStatistics(null, null, null);
              if (stats != null) {
                successCount.incrementAndGet();
              }
            } catch (Exception e) {
              errorCount.incrementAndGet();
              System.err.println("스트레스 테스트 오류: " + e.getMessage());
              e.printStackTrace();
            } finally {
              SecurityContextHolder.clearContext();
            }
          });
    }

    executor.shutdown();
    try {
      executor.awaitTermination(60, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }

    System.out.println("📊 총 요청: " + totalRequests);
    System.out.println("📊 성공: " + successCount.get());
    System.out.println("📊 실패: " + errorCount.get());
    System.out.println("📊 성공률: " + (successCount.get() * 100.0 / totalRequests) + "%");

    // 성공률 90% 이상이어야 함
    double successRate = successCount.get() * 100.0 / totalRequests;
    assertTrue(successRate >= 90.0, "성공률 너무 낮음: " + successRate + "%");
  }

  // Helper Methods
  private long measureExecutionTime(Runnable operation) {
    long startTime = System.currentTimeMillis();
    operation.run();
    long endTime = System.currentTimeMillis();
    return endTime - startTime;
  }

  private TestResultFilterDto createDefaultFilter(int page, int size) {
    TestResultFilterDto filter = TestResultFilterDto.builder().page(page).size(size).build();
    filter.setDefaultDisplayColumns();
    filter.setDefaultSort();
    return filter;
  }

  private UserTestResult simulateUserActivity(int userId) {
    List<Long> responseTimes = new ArrayList<>();
    int errorCount = 0;

    for (int i = 0; i < ITERATIONS_PER_USER; i++) {
      final int iteration = i; // final 변수로 복사
      try {
        long responseTime =
            measureExecutionTime(
                () -> {
                  // 다양한 API 호출 시뮬레이션
                  if (iteration % 3 == 0) {
                    testResultReportService.getTestResultStatistics(null, null, null);
                  } else {
                    TestResultFilterDto filter = createDefaultFilter(iteration % 5, 20);
                    testResultReportService.getDetailedTestResultReport(filter);
                  }
                });
        responseTimes.add(responseTime);

        // 사용자 간 랜덤 지연
        Thread.sleep(100 + (int) (Math.random() * 200));
      } catch (Exception e) {
        errorCount++;
      }
    }

    return new UserTestResult(userId, responseTimes, errorCount);
  }

  private void analyzeUserTestResults(List<UserTestResult> results) {
    System.out.println("📊 동시 사용자 테스트 결과 분석:");

    List<Long> allResponseTimes = new ArrayList<>();
    int totalErrors = 0;

    for (UserTestResult result : results) {
      allResponseTimes.addAll(result.responseTimes);
      totalErrors += result.errorCount;
    }

    if (!allResponseTimes.isEmpty()) {
      double avgResponseTime =
          allResponseTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
      long maxResponseTime = allResponseTimes.stream().mapToLong(Long::longValue).max().orElse(0L);
      long minResponseTime = allResponseTimes.stream().mapToLong(Long::longValue).min().orElse(0L);

      System.out.println("   - 평균 응답시간: " + String.format("%.2f", avgResponseTime) + "ms");
      System.out.println("   - 최대 응답시간: " + maxResponseTime + "ms");
      System.out.println("   - 최소 응답시간: " + minResponseTime + "ms");
      System.out.println("   - 총 에러: " + totalErrors + "건");

      // 성능 기준 검증
      if (avgResponseTime < PERFORMANCE_THRESHOLD_MS) {
        System.out.println("🚀 동시 사용자 성능 우수");
      } else if (avgResponseTime < MAX_ACCEPTABLE_TIME_MS) {
        System.out.println("✅ 동시 사용자 성능 허용");
      } else {
        fail("동시 사용자 성능 기준 미달: 평균 " + avgResponseTime + "ms");
      }
    }
  }

  private String formatBytes(long bytes) {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
    return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
  }

  // Inner Classes
  private static class UserTestResult {
    final int userId;
    final List<Long> responseTimes;
    final int errorCount;

    UserTestResult(int userId, List<Long> responseTimes, int errorCount) {
      this.userId = userId;
      this.responseTimes = responseTimes;
      this.errorCount = errorCount;
    }
  }
}
