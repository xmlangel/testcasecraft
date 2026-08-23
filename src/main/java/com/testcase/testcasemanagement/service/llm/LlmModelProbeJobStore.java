package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.LlmModelProbeJob;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 가용성 확인 작업을 담아 두는 곳.
 *
 * <p>메모리에 둔다. 이 앱은 단일 인스턴스로 뜨고 기존 캐시도 인스턴스 로컬이라 DB 테이블을 만들 이유가 없다. 대신 <b>재시작하면 진행 중인 작업이
 * 사라진다.</b> 확인은 다시 누르면 되는 일이라 감당할 수 있다고 판단했다. 인스턴스를 늘릴 때는 저장소를 옮겨야 한다.
 *
 * <p>완료된 작업을 지우지 않으면 메모리가 계속 늘어난다. 새 작업을 시작할 때 낡은 것을 함께 정리한다. 별도 스케줄러를 두지 않은 이유는 작업 수가 적어(동시
 * 여덟까지) 정리 비용이 무시할 만하기 때문이다.
 */
@Component
@Slf4j
public class LlmModelProbeJobStore {

  /**
   * 동시에 돌 수 있는 작업 수.
   *
   * <p>확인 하나가 제공자 동시 요청을 최대 열 개 쓴다. 여덟이 함께 돌면 여든 개가 되어 제공자 한도를 넘길 수 있으므로 그 이상은 받지 않는다.
   */
  private static final int MAX_RUNNING_JOBS = 8;

  /**
   * 끝난 작업을 남겨 두는 시간.
   *
   * <p>사용자가 화면을 떠났다 돌아와 결과를 볼 만한 시간으로 잡았다. 근거가 있는 값은 아니다.
   */
  private static final Duration RETENTION = Duration.ofMinutes(10);

  private final Map<String, Entry> jobs = new ConcurrentHashMap<>();

  /**
   * 작업을 시작한다.
   *
   * @param total 확인 대상 개수
   * @return 새 작업 ID
   * @throws IllegalStateException 동시 작업 상한을 넘었을 때
   */
  public String start(int total) {
    purgeExpired();

    long running = jobs.values().stream().filter(e -> e.job.getStatus() == LlmModelProbeJob.Status.RUNNING).count();
    if (running >= MAX_RUNNING_JOBS) {
      throw new IllegalStateException(
          "확인 작업이 " + running + "개 돌고 있습니다. 하나가 끝난 뒤 다시 시도해 주세요.");
    }

    String jobId = UUID.randomUUID().toString();
    LlmModelProbeJob job =
        LlmModelProbeJob.builder()
            .jobId(jobId)
            .status(LlmModelProbeJob.Status.RUNNING)
            .total(total)
            .done(0)
            .build();
    jobs.put(jobId, new Entry(job, new AtomicInteger()));
    log.info("🆕 가용성 확인 작업 시작: jobId={}, 대상 {}개", jobId, total);
    return jobId;
  }

  /** 모델 하나가 끝났음을 기록한다. 여러 스레드에서 동시에 불린다. */
  public void advance(String jobId) {
    Entry entry = jobs.get(jobId);
    if (entry == null) {
      // 결과를 다 받은 뒤 늦게 도착한 알림이거나 정리된 작업이다. 무시해도 된다.
      return;
    }
    entry.job.setDone(entry.done.incrementAndGet());
  }

  /** 작업을 성공으로 끝낸다. */
  public void complete(String jobId, LlmModelProbeResponse result) {
    Entry entry = jobs.get(jobId);
    if (entry == null) {
      log.warn("완료 처리할 작업을 찾지 못했다: jobId={}", jobId);
      return;
    }
    entry.job.setStatus(LlmModelProbeJob.Status.DONE);
    entry.job.setResult(result);
    // 실제로 확인한 개수로 맞춘다. 상한에 걸려 빠진 것이 있으면 total 보다 적다.
    entry.job.setDone(result.getModels() != null ? result.getModels().size() : entry.done.get());
    entry.finishedAt = Instant.now();
    log.info("✅ 가용성 확인 작업 완료: jobId={}", jobId);
  }

  /** 작업을 실패로 끝낸다. */
  public void fail(String jobId, String errorMessage) {
    Entry entry = jobs.get(jobId);
    if (entry == null) {
      log.warn("실패 처리할 작업을 찾지 못했다: jobId={}", jobId);
      return;
    }
    entry.job.setStatus(LlmModelProbeJob.Status.FAILED);
    entry.job.setErrorMessage(errorMessage);
    entry.finishedAt = Instant.now();
    log.warn("❌ 가용성 확인 작업 실패: jobId={}, 사유={}", jobId, errorMessage);
  }

  /** 작업 상태를 본다. 없으면 비어 있다. */
  public Optional<LlmModelProbeJob> find(String jobId) {
    Entry entry = jobs.get(jobId);
    return entry == null ? Optional.empty() : Optional.of(entry.job);
  }

  /** 지금 돌고 있는 작업 수. */
  public long runningCount() {
    return jobs.values().stream().filter(e -> e.job.getStatus() == LlmModelProbeJob.Status.RUNNING).count();
  }

  /** 보관 기간이 지난 작업을 지운다. */
  private void purgeExpired() {
    Instant cutoff = Instant.now().minus(RETENTION);
    jobs.entrySet()
        .removeIf(e -> e.getValue().finishedAt != null && e.getValue().finishedAt.isBefore(cutoff));
  }

  /** 작업 하나와 그 진행 카운터. */
  private static final class Entry {
    private final LlmModelProbeJob job;
    private final AtomicInteger done;
    private volatile Instant finishedAt;

    private Entry(LlmModelProbeJob job, AtomicInteger done) {
      this.job = job;
      this.done = done;
    }
  }

}
