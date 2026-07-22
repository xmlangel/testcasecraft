package com.testcase.testcasemanagement.scheduler;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.service.graph.GraphDbClient;
import com.testcase.testcasemanagement.service.graph.GraphSyncService;
import java.util.List;
import org.testng.annotations.Test;

/**
 * GraphSyncScheduler 단위 테스트 — 런타임 게이트, DB 가용성 체크, 전 프로젝트 순회, 부분 실패 격리를 검증한다. 스케줄 트리거 자체(cron)는
 * Spring 이 담당하므로 여기서는 {@link GraphSyncScheduler#syncAllProjects()} 의 동작만 본다.
 */
public class GraphSyncSchedulerTest {

  private Project project(String id) {
    Project p = new Project();
    p.setId(id);
    return p;
  }

  @Test(description = "scheduled-enabled=false 면 동기화를 아예 시도하지 않는다")
  public void skipsWhenDisabled() {
    GraphSyncService svc = mock(GraphSyncService.class);
    GraphDbClient client = mock(GraphDbClient.class);
    ProjectRepository repo = mock(ProjectRepository.class);
    GraphSyncScheduler scheduler = new GraphSyncScheduler(svc, client, repo, false);

    scheduler.syncAllProjects();

    verifyNoInteractions(svc, client, repo);
  }

  @Test(description = "활성화됐어도 그래프 DB 연결이 없으면 동기화하지 않는다")
  public void skipsWhenGraphUnavailable() {
    GraphSyncService svc = mock(GraphSyncService.class);
    GraphDbClient client = mock(GraphDbClient.class);
    ProjectRepository repo = mock(ProjectRepository.class);
    when(client.isAvailable()).thenReturn(false);
    GraphSyncScheduler scheduler = new GraphSyncScheduler(svc, client, repo, true);

    scheduler.syncAllProjects();

    verify(client).isAvailable();
    verify(repo, never()).findAll();
    verifyNoInteractions(svc);
  }

  @Test(description = "활성화 + 연결 정상이면 모든 프로젝트를 동기화한다")
  public void syncsAllProjectsWhenEnabled() {
    GraphSyncService svc = mock(GraphSyncService.class);
    GraphDbClient client = mock(GraphDbClient.class);
    ProjectRepository repo = mock(ProjectRepository.class);
    when(client.isAvailable()).thenReturn(true);
    when(repo.findAll()).thenReturn(List.of(project("p1"), project("p2")));
    GraphSyncScheduler scheduler = new GraphSyncScheduler(svc, client, repo, true);

    scheduler.syncAllProjects();

    verify(svc).syncProject("p1");
    verify(svc).syncProject("p2");
  }

  @Test(description = "한 프로젝트가 실패해도 예외를 삼키고 나머지를 계속 동기화한다")
  public void continuesAfterOneProjectFails() {
    GraphSyncService svc = mock(GraphSyncService.class);
    GraphDbClient client = mock(GraphDbClient.class);
    ProjectRepository repo = mock(ProjectRepository.class);
    when(client.isAvailable()).thenReturn(true);
    when(repo.findAll()).thenReturn(List.of(project("bad"), project("good")));
    when(svc.syncProject("bad")).thenThrow(new RuntimeException("boom"));
    GraphSyncScheduler scheduler = new GraphSyncScheduler(svc, client, repo, true);

    scheduler.syncAllProjects(); // 예외가 전파되지 않아야 한다

    verify(svc).syncProject("bad");
    verify(svc).syncProject("good");
  }
}
