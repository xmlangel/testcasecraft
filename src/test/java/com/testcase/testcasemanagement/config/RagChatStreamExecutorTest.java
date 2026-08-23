package com.testcase.testcasemanagement.config;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertThrows;
import static org.testng.Assert.assertTrue;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.TimeUnit;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 채팅 스트리밍 스레드 풀의 성질을 고정한다.
 *
 * <p>예전에는 요청마다 {@code new Thread(...).start()} 로 스레드를 직접 만들어 상한이 없었다. 풀로 바꾼 뒤 무엇이 달라졌는지를 시험으로 남긴다.
 * 특히 <b>가득 찼을 때 즉시 거부한다</b>는 성질이 중요하다. 대기열을 두면 이미 화면을 떠난 요청을 붙들고 있게 된다.
 */
public class RagChatStreamExecutorTest {

  private ThreadPoolTaskExecutor executor;

  @BeforeMethod
  public void setUp() {
    executor = new AsyncConfig().ragChatStreamExecutor();
  }

  @AfterMethod
  public void tearDown() {
    // 풀을 닫지 않으면 시험마다 스레드가 쌓인다.
    executor.shutdown();
  }

  @Test(description = "스레드 이름으로 어느 요청의 것인지 되짚을 수 있다")
  public void namesThreadsForTracing() throws Exception {
    CountDownLatch done = new CountDownLatch(1);
    String[] name = new String[1];

    executor.execute(
        () -> {
          name[0] = Thread.currentThread().getName();
          done.countDown();
        });

    assertTrue(done.await(5, TimeUnit.SECONDS), "작업이 실행된다");
    assertTrue(name[0].startsWith("RAGChatStream-"), "이름이 붙는다 (실측 " + name[0] + ")");
  }

  @Test(description = "대기열을 두지 않아 상한을 넘으면 즉시 거부한다")
  public void rejectsInsteadOfQueueing() throws Exception {
    // 최대 스레드 수만큼 붙잡아 둔다. 놓아 줄 때까지 풀이 가득 찬 상태다.
    CountDownLatch hold = new CountDownLatch(1);
    CountDownLatch started = new CountDownLatch(executor.getMaxPoolSize());

    for (int i = 0; i < executor.getMaxPoolSize(); i++) {
      executor.execute(
          () -> {
            started.countDown();
            try {
              hold.await(10, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            }
          });
    }
    assertTrue(started.await(5, TimeUnit.SECONDS), "상한까지 채워진다");

    try {
      // 대기열이 있으면 여기서 조용히 받아들이고 나중에 처리한다. 그러면 사용자는 답을 기다리며
      // 멈춘 화면을 본다. 즉시 거부해야 그 사실을 알릴 수 있다.
      assertThrows(RejectedExecutionException.class, () -> executor.execute(() -> {}));
    } finally {
      hold.countDown();
    }
  }

  @Test(description = "동시 대화 수를 상한으로 제한한다")
  public void capsConcurrentStreams() {
    assertEquals(executor.getCorePoolSize(), 4, "평소 유지하는 스레드 수");
    assertEquals(executor.getMaxPoolSize(), 16, "동시 대화 상한");
  }
}
