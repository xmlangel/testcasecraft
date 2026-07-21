package com.testcase.testcasemanagement.scheduler;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.service.graph.GraphDbClient;
import com.testcase.testcasemanagement.service.graph.GraphSyncService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 관계 그래프 주기 동기화 스케줄러 (계획 §7-A "주기 배치" 트리거).
 *
 * <p>빈 생성 조건은 {@code features.graph.enabled=true} 로, {@link GraphSyncService}·{@link GraphDbClient}
 * 와 생명주기를 맞춘다 (그래프 비활성 시 이 스케줄러도 미생성 → 주입 실패 없음). 실제 실행 여부는 런타임 플래그 {@code
 * graph.sync.scheduled-enabled} 로 별도 게이트한다. 두 값을 분리해 두면 그래프는 켜되 주기 동기화만 끄는 운영이 가능하고, 오설정으로 기동이
 * 깨지지 않는다.
 *
 * <p>동기화는 read-model 재구성(멱등)이라 프로젝트별로 독립 실행하며, 한 프로젝트가 실패해도 나머지는 계속한다. 수동 동기화(POST
 * /api/graph/sync)와 동일한 {@link GraphSyncService#syncProject(String)} 를 재사용한다.
 */
@Component
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
public class GraphSyncScheduler {

  private static final Logger logger = LoggerFactory.getLogger(GraphSyncScheduler.class);

  private final GraphSyncService graphSyncService;
  private final GraphDbClient graphDbClient;
  private final ProjectRepository projectRepository;
  private final boolean scheduledEnabled;

  public GraphSyncScheduler(
      GraphSyncService graphSyncService,
      GraphDbClient graphDbClient,
      ProjectRepository projectRepository,
      @Value("${graph.sync.scheduled-enabled:false}") boolean scheduledEnabled) {
    this.graphSyncService = graphSyncService;
    this.graphDbClient = graphDbClient;
    this.projectRepository = projectRepository;
    this.scheduledEnabled = scheduledEnabled;
  }

  /** 전 프로젝트 주기 동기화. 기본 매일 04:00, {@code graph.sync.cron} 으로 조정. */
  @Scheduled(cron = "${graph.sync.cron:0 0 4 * * *}")
  public void syncAllProjects() {
    if (!scheduledEnabled) {
      return; // 런타임 게이트 — 빈은 있어도 실행하지 않는다
    }
    if (!graphDbClient.isAvailable()) {
      logger.warn("그래프 주기 동기화 건너뜀 — AgensGraph 연결 불가");
      return;
    }

    long startedAt = System.currentTimeMillis();
    List<Project> projects = projectRepository.findAll();
    int ok = 0;
    int failed = 0;
    for (Project project : projects) {
      try {
        graphSyncService.syncProject(project.getId());
        ok++;
      } catch (Exception e) {
        failed++;
        logger.error("그래프 주기 동기화 실패 — project={}: {}", project.getId(), e.getMessage(), e);
      }
    }
    logger.info(
        "그래프 주기 동기화 완료 — 프로젝트 {}개(성공 {}, 실패 {}), {}ms",
        projects.size(),
        ok,
        failed,
        System.currentTimeMillis() - startedAt);
  }
}
