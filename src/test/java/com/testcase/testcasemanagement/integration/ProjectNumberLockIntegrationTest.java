package com.testcase.testcasemanagement.integration;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 다음 번호(테스트케이스 순번, 요구사항 ID)를 정할 때 쓰는 프로젝트 잠금이 실제 DB 에서 두 번째 트랜잭션을 첫 번째가 끝날 때까지 기다리게 하는지 확인한다. 잠금이
 * 없으면 두 트랜잭션이 같은 최댓값을 읽어 같은 번호를 받는다.
 */
@SpringBootTest
@ActiveProfiles("test")
public class ProjectNumberLockIntegrationTest extends AbstractTestNGSpringContextTests {

  private static final long HOLD_MILLIS = 1500;

  @Autowired private ProjectRepository projectRepository;
  @Autowired private PlatformTransactionManager transactionManager;

  private Project project;

  @BeforeMethod
  void setUp() {
    String code = "LK" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    Project p = new Project();
    p.setCode(code);
    p.setName("Lock " + code);
    project = projectRepository.save(p);
  }

  @AfterMethod(alwaysRun = true)
  void tearDown() {
    projectRepository.deleteById(project.getId());
  }

  @Test
  public void secondTransactionWaitsUntilFirstCommits() throws Exception {
    TransactionTemplate tx = new TransactionTemplate(transactionManager);
    CountDownLatch firstLocked = new CountDownLatch(1);
    ExecutorService pool = Executors.newFixedThreadPool(2);
    try {
      Future<?> first =
          pool.submit(
              () ->
                  tx.executeWithoutResult(
                      status -> {
                        projectRepository.findByIdForUpdate(project.getId());
                        firstLocked.countDown();
                        sleep(HOLD_MILLIS);
                      }));
      Assert.assertTrue(firstLocked.await(10, TimeUnit.SECONDS));

      long start = System.nanoTime();
      Future<?> second =
          pool.submit(
              () ->
                  tx.executeWithoutResult(
                      status -> projectRepository.findByIdForUpdate(project.getId())));
      second.get(30, TimeUnit.SECONDS);
      long waitedMillis = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
      first.get(30, TimeUnit.SECONDS);

      Assert.assertTrue(
          waitedMillis >= HOLD_MILLIS - 300, "두 번째 트랜잭션이 잠금을 기다리지 않았다: " + waitedMillis + "ms");
    } finally {
      pool.shutdownNow();
    }
  }

  private static void sleep(long millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }
}
