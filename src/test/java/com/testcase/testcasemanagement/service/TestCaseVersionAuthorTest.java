package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.event.TestCaseVersionEvent;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseVersion;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestCaseVersionRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-451: 버전 기록의 작성자가 System User 가 아니라 실제로 저장한 사용자로 남는지. */
public class TestCaseVersionAuthorTest {

  private TestCaseVersionRepository versionRepository;
  private UserRepository userRepository;
  private TestCaseVersionService service;

  @BeforeMethod
  public void setUp() {
    versionRepository = Mockito.mock(TestCaseVersionRepository.class);
    TestCaseRepository testCaseRepository = Mockito.mock(TestCaseRepository.class);
    userRepository = Mockito.mock(UserRepository.class);
    service =
        new TestCaseVersionService(
            versionRepository, testCaseRepository, new ObjectMapper(), userRepository);

    Project project = new Project();
    project.setId("p1");
    TestCase testCase = new TestCase();
    testCase.setId("tc1");
    testCase.setProject(project);
    when(testCaseRepository.findById("tc1")).thenReturn(Optional.of(testCase));
    when(versionRepository.findMaxVersionNumberByTestCaseId("tc1")).thenReturn(0);
    when(versionRepository.save(any(TestCaseVersion.class))).thenAnswer(i -> i.getArgument(0));
  }

  @AfterMethod
  public void clearContext() {
    SecurityContextHolder.clearContext();
  }

  private void login(String username) {
    SecurityContextHolder.getContext()
        .setAuthentication(new UsernamePasswordAuthenticationToken(username, "x", List.of()));
  }

  private TestCaseVersion savedVersion() {
    ArgumentCaptor<TestCaseVersion> captor = ArgumentCaptor.forClass(TestCaseVersion.class);
    Mockito.verify(versionRepository).save(captor.capture());
    return captor.getValue();
  }

  @Test
  public void 이벤트는_발행한_스레드의_로그인_사용자를_담는다() throws Exception {
    login("dicky");
    TestCaseVersionEvent event = new TestCaseVersionEvent(this, "tc1", "UPDATE", "s");
    SecurityContextHolder.clearContext();

    Assert.assertEquals(event.getActorUsername(), "dicky");
  }

  @Test
  public void 로그인_정보가_없는_스레드에서도_이벤트의_작성자로_기록한다() throws Exception {
    login("dicky");
    TestCaseVersionEvent event = new TestCaseVersionEvent(this, "tc1", "UPDATE", "s");
    User user = new User();
    user.setUsername("dicky");
    user.setName("김광명");
    when(userRepository.findByUsername("dicky")).thenReturn(Optional.of(user));

    // 비동기 리스너처럼 로그인 정보가 없는 다른 스레드에서 버전을 만든다
    CompletableFuture.runAsync(
            () ->
                service.createVersionFromTestCase(
                    event.getTestCaseId(),
                    event.getChangeType(),
                    event.getChangeSummary(),
                    event.getActorUsername()))
        .get();

    TestCaseVersion version = savedVersion();
    Assert.assertEquals(version.getCreatedBy(), "dicky");
    Assert.assertEquals(version.getCreatedByName(), "김광명");
  }

  @Test
  public void 표시_이름이_없으면_username_을_이름으로_쓴다() {
    when(userRepository.findByUsername("dicky")).thenReturn(Optional.empty());

    service.createVersionFromTestCase("tc1", "UPDATE", "s", "dicky");

    Assert.assertEquals(savedVersion().getCreatedByName(), "dicky");
  }

  @Test
  public void 수동_저장은_현재_로그인_사용자의_표시_이름으로_기록한다() {
    login("dicky");
    User user = new User();
    user.setUsername("dicky");
    user.setName("김광명");
    when(userRepository.findByUsername("dicky")).thenReturn(Optional.of(user));

    service.createManualVersion("tc1", null, null);

    Assert.assertEquals(savedVersion().getCreatedByName(), "김광명");
  }

  @Test
  public void 로그인_없이_발행된_변경만_System_User_로_남긴다() {
    TestCaseVersionEvent event = new TestCaseVersionEvent(this, "tc1", "UPDATE", "s");

    service.createVersionFromTestCase("tc1", "UPDATE", "s", event.getActorUsername());

    TestCaseVersion version = savedVersion();
    Assert.assertEquals(version.getCreatedBy(), "system");
    Assert.assertEquals(version.getCreatedByName(), "System User");
  }
}
