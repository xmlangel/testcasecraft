package com.testcase.testcasemanagement.service.llm;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeJob;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 확인 작업 저장소의 성질을 고정한다.
 *
 * <p>진행 알림은 여러 스레드에서 동시에 들어온다(확인이 동시 실행되므로). 그래서 세는 것이 어긋나지 않는지가 이 저장소의 핵심 성질이다.
 */
public class LlmModelProbeJobStoreTest {

  private LlmModelProbeJobStore store;

  @BeforeMethod
  public void setUp() {
    store = new LlmModelProbeJobStore();
  }

  @Test(description = "작업을 시작하면 진행률 0 으로 조회된다")
  public void startsWithZeroProgress() {
    String jobId = store.start(40);

    LlmModelProbeJob job = store.find(jobId).orElseThrow();
    assertEquals(job.getStatus(), LlmModelProbeJob.Status.RUNNING);
    assertEquals(job.getTotal(), 40, "대상 개수를 기억한다");
    assertEquals(job.getDone(), 0);
  }

  @Test(description = "없는 작업을 물어보면 비어 있다")
  public void returnsEmptyForUnknownJob() {
    assertTrue(store.find("없는-아이디").isEmpty());
  }

  @Test(description = "여러 스레드가 동시에 알려도 세는 것이 어긋나지 않는다")
  public void countsProgressAccuratelyUnderConcurrency() throws Exception {
    // 확인은 동시 실행되므로 진행 알림이 여러 스레드에서 함께 들어온다. 이것이 어긋나면
    // 진행률이 총 개수를 넘거나 끝까지 차지 않는다.
    String jobId = store.start(200);
    int threads = 8;
    int perThread = 25;
    ExecutorService pool = Executors.newFixedThreadPool(threads);
    CountDownLatch ready = new CountDownLatch(threads);
    CountDownLatch go = new CountDownLatch(1);

    for (int t = 0; t < threads; t++) {
      pool.execute(
          () -> {
            ready.countDown();
            try {
              go.await(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
              return;
            }
            for (int i = 0; i < perThread; i++) {
              store.advance(jobId);
            }
          });
    }
    assertTrue(ready.await(5, TimeUnit.SECONDS), "모든 스레드가 준비된다");
    go.countDown();
    pool.shutdown();
    assertTrue(pool.awaitTermination(10, TimeUnit.SECONDS), "모든 알림이 끝난다");

    assertEquals(store.find(jobId).orElseThrow().getDone(), threads * perThread);
  }

  @Test(description = "없는 작업에 진행을 알려도 터지지 않는다")
  public void ignoresProgressForUnknownJob() {
    // 정리된 작업이나 늦게 도착한 알림이다. 예외를 올리면 확인 흐름이 깨진다.
    store.advance("없는-아이디");
  }

  @Test(description = "완료하면 결과를 담고 진행률을 실제 확인 개수로 맞춘다")
  public void completesWithResult() {
    String jobId = store.start(45);
    // 상한에 걸려 40개만 확인된 상황이다.
    LlmModelProbeResponse result =
        LlmModelProbeResponse.builder()
            .models(models(40))
            .skippedByLimit(5)
            .probeLimit(40)
            .requestsSent(40)
            .build();

    store.complete(jobId, result);

    LlmModelProbeJob job = store.find(jobId).orElseThrow();
    assertEquals(job.getStatus(), LlmModelProbeJob.Status.DONE);
    assertEquals(job.getDone(), 40, "실제 확인한 개수로 맞춘다");
    assertEquals(job.getResult().getSkippedByLimit().intValue(), 5, "결과를 그대로 담는다");
  }

  @Test(description = "실패하면 사유를 담는다")
  public void failsWithReason() {
    String jobId = store.start(10);

    store.fail(jobId, "API Key 가 거부되었습니다");

    LlmModelProbeJob job = store.find(jobId).orElseThrow();
    assertEquals(job.getStatus(), LlmModelProbeJob.Status.FAILED);
    assertEquals(job.getErrorMessage(), "API Key 가 거부되었습니다");
  }

  @Test(description = "동시 작업 상한을 넘으면 거부한다")
  public void rejectsBeyondConcurrentLimit() {
    // 확인 하나가 제공자 동시 요청을 최대 열 개 쓴다. 상한 없이 받으면 제공자 한도를 넘긴다.
    for (int i = 0; i < 8; i++) {
      store.start(1);
    }

    try {
      store.start(1);
      throw new AssertionError("상한을 넘겼는데 받아들였다");
    } catch (IllegalStateException expected) {
      assertTrue(expected.getMessage().contains("8"), "몇 개가 돌고 있는지 알린다");
    }
  }

  @Test(description = "끝난 작업은 상한을 차지하지 않는다")
  public void finishedJobsFreeTheLimit() {
    List<String> ids = new ArrayList<>();
    for (int i = 0; i < 8; i++) {
      ids.add(store.start(1));
    }
    store.complete(ids.get(0), LlmModelProbeResponse.builder().models(List.of()).build());

    // 하나가 끝났으니 새 작업을 받아야 한다.
    store.start(1);
    assertEquals(store.runningCount(), 8, "돌고 있는 것은 여전히 여덟이다");
  }

  /** 시험용 판정 목록. 개수만 맞추면 된다. */
  private List<LlmModelDTO> models(int count) {
    List<LlmModelDTO> models = new ArrayList<>(count);
    for (int i = 0; i < count; i++) {
      models.add(LlmModelDTO.builder().id("vendor/model-" + i).build());
    }
    return models;
  }
}
