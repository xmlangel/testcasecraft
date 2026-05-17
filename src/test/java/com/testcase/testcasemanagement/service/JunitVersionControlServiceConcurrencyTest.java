// src/test/java/com/testcase/testcasemanagement/service/JunitVersionControlServiceConcurrencyTest.java

package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Clock;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * JunitVersionControlService 동시성 검증 테스트.
 *
 * <p>리뷰 보고서 docs/plan/refactoring-2026-05/05_JunitVersionControlService.md §3 에서 식별된
 * getNextVersionNumber() 의 read-modify-write 레이스 컨디션이 해소되었는지 검증한다.
 */
public class JunitVersionControlServiceConcurrencyTest {

  private JunitVersionControlService service;
  private Path tempVersionDir;
  private Path tempBackupDir;
  private Path tempOriginalFile;

  @BeforeMethod
  public void setUp() throws Exception {
    service = new JunitVersionControlService();

    // 외부 의존성을 리플렉션으로 주입 (@Autowired 필드)
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    inject(service, "objectMapper", objectMapper);
    inject(service, "clock", Clock.fixed(java.time.Instant.parse("2026-05-16T00:00:00Z"), ZoneOffset.UTC));

    tempVersionDir = Files.createTempDirectory("junit-version-test-");
    tempBackupDir = Files.createTempDirectory("junit-backup-test-");
    inject(service, "versionStorageDir", tempVersionDir.toString());
    inject(service, "backupStorageDir", tempBackupDir.toString());
    inject(service, "maxVersionsPerFile", 1000);
    inject(service, "autoBackupEnabled", false);
    inject(service, "compressionEnabled", false);

    tempOriginalFile = Files.createTempFile("junit-original-", ".xml");
    Files.write(
        tempOriginalFile,
        "<testsuite><testcase name=\"sample\"/></testsuite>".getBytes(),
        StandardOpenOption.WRITE);
  }

  @AfterMethod
  public void tearDown() throws IOException {
    deleteRecursively(tempVersionDir);
    deleteRecursively(tempBackupDir);
    Files.deleteIfExists(tempOriginalFile);
  }

  /**
   * 동일 testResultId 에 10개 스레드가 동시 createVersion 호출 시, 모든 버전 번호가 1~10으로 중복 없이 발급되어야 한다.
   */
  @Test
  public void createVersion_concurrentCalls_yieldsUniqueVersionNumbers() throws Exception {
    final int threadCount = 10;
    final String testResultId = "concurrent-test-result-1";
    Set<Integer> assignedNumbers = java.util.Collections.synchronizedSet(new HashSet<>());
    AtomicInteger failureCount = new AtomicInteger();
    java.util.List<Throwable> failures = java.util.Collections.synchronizedList(new java.util.ArrayList<>());

    ExecutorService pool = Executors.newFixedThreadPool(threadCount);
    CountDownLatch ready = new CountDownLatch(threadCount);
    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(threadCount);

    for (int i = 0; i < threadCount; i++) {
      final int idx = i;
      pool.submit(
          () -> {
            try {
              ready.countDown();
              start.await();
              JunitVersionControlService.FileVersion v =
                  service.createVersion(
                      testResultId, tempOriginalFile.toString(), "edit " + idx, "user" + idx);
              assignedNumbers.add(v.getVersionNumber());
            } catch (Throwable e) {
              failureCount.incrementAndGet();
              failures.add(e);
            } finally {
              done.countDown();
            }
          });
    }

    ready.await();
    start.countDown(); // 동시에 출발
    boolean finished = done.await(30, TimeUnit.SECONDS);
    pool.shutdownNow();

    assertTrue(finished, "Concurrent createVersion calls should complete within 30s");
    if (failureCount.get() > 0) {
      Throwable first = failures.get(0);
      throw new AssertionError(
          "No createVersion call should fail but " + failureCount.get() + " failed; first cause: ",
          first);
    }
    assertEquals(
        assignedNumbers.size(),
        threadCount,
        "Each concurrent call must receive a UNIQUE version number; collisions indicate the"
            + " getNextVersionNumber race is still present");
  }

  /**
   * 서로 다른 testResultId 호출은 락이 분리되어 병렬 처리되어야 한다 (락 분리 검증).
   */
  @Test
  public void createVersion_differentIds_areIndependent() throws Exception {
    final int idCount = 5;
    final int versionsPerId = 3;
    ExecutorService pool = Executors.newFixedThreadPool(idCount);
    CountDownLatch done = new CountDownLatch(idCount * versionsPerId);

    for (int i = 0; i < idCount; i++) {
      final String testResultId = "independent-result-" + i;
      for (int v = 0; v < versionsPerId; v++) {
        pool.submit(
            () -> {
              try {
                service.createVersion(
                    testResultId, tempOriginalFile.toString(), "edit", "user");
              } catch (Exception ignored) {
                // 실패는 다음 assertion 에서 잡힌다
              } finally {
                done.countDown();
              }
            });
      }
    }

    boolean finished = done.await(30, TimeUnit.SECONDS);
    pool.shutdownNow();
    assertTrue(finished);

    for (int i = 0; i < idCount; i++) {
      JunitVersionControlService.FileVersionHistory history =
          service.getVersionHistory("independent-result-" + i);
      List<JunitVersionControlService.FileVersion> versions = history.getVersions();
      assertEquals(
          versions.size(),
          versionsPerId,
          "Each independent testResultId should have all its versions persisted");
      Set<Integer> numbers = new HashSet<>();
      for (JunitVersionControlService.FileVersion v : versions) {
        numbers.add(v.getVersionNumber());
      }
      assertEquals(numbers.size(), versionsPerId, "Version numbers within an id must be unique");
    }
  }

  private static void inject(Object target, String fieldName, Object value) throws Exception {
    Field field = target.getClass().getDeclaredField(fieldName);
    field.setAccessible(true);
    field.set(target, value);
  }

  private static void deleteRecursively(Path root) throws IOException {
    if (!Files.exists(root)) return;
    Files.walk(root)
        .sorted(java.util.Comparator.reverseOrder())
        .forEach(
            p -> {
              try {
                Files.deleteIfExists(p);
              } catch (IOException ignored) {
              }
            });
  }
}
