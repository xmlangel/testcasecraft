package com.testcase.testcasemanagement.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.model.rag.RagChatThread;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.RagChatThreadRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.JwtTokenUtil;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-review R2(C): RAG 채팅 스레드 객체수준 인가(IDOR, PR #68)를 <b>실데이터 시딩</b>으로 HTTP end-to-end 검증한다.
 *
 * <p>기존 RagChatIdorAuthzTest 는 mock 배선만 검증했다 — 정작 원래 버그(BOLA/IDOR)는 "A 프로젝트 멤버가 B 프로젝트 리소스에 실제로
 * 접근되는가" 클래스인데, 실제 프로젝트·멤버십·스레드를 시딩해 비멤버가 403 을 받는지 확인하는 테스트가 없었다. 이 테스트는
 * ProjectRoleAuthorizationIntegrationTest 의 시딩·정리 전략을 따라 그 갭을 메운다.
 *
 * <p>검증: 프로젝트 P 에 스레드 1개를 두고, (1) 멤버는 GET 스레드/메시지 200, (2) 비멤버(OUTSIDER)는 403, (3) 비멤버 DELETE 도 403
 * 이며 스레드가 실제로 삭제되지 않는다. PATCH 는 본문검증(@NotNull) 이슈와 얽혀 별도 PR(#84)에서 다루므로 여기서는 제외.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RagChatThreadCrossProjectAuthzIntegrationTest
    extends AbstractTestNGSpringContextTests {

  @Autowired private MockMvc mockMvc;
  @Autowired private JwtTokenUtil jwtTokenUtil;
  @Autowired private UserDetailsService userDetailsService;
  @Autowired private PasswordEncoder passwordEncoder;
  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private ProjectUserRepository projectUserRepository;
  @Autowired private RagChatThreadRepository ragChatThreadRepository;
  @Autowired private PlatformTransactionManager txManager;

  private static final String MEMBER = "ragidor_it_member";
  private static final String OUTSIDER = "ragidor_it_outsider";

  private final Set<String> createdUserIds = new HashSet<>();
  private String memberToken;
  private String outsiderToken;
  private Project project;
  private String threadId;

  @BeforeMethod
  void setUp() {
    memberToken = ensureUser(MEMBER);
    outsiderToken = ensureUser(OUTSIDER);

    String uid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    project = new Project();
    project.setCode("RI" + uid);
    project.setName("RagIdorProject " + uid);
    project = projectRepository.save(project);

    // MEMBER 만 프로젝트 멤버로 초대(OUTSIDER 는 비멤버).
    ProjectUser pu = new ProjectUser();
    pu.setUser(userRepository.findByUsername(MEMBER).orElseThrow());
    pu.setProject(project);
    pu.setRoleInProject(ProjectRole.DEVELOPER);
    projectUserRepository.save(pu);

    RagChatThread thread = new RagChatThread();
    thread.setProject(project);
    thread.setTitle("cross-project secret thread");
    thread.setCreatedBy(MEMBER);
    threadId = ragChatThreadRepository.save(thread).getId();
  }

  @AfterMethod
  void tearDown() {
    if (project != null) {
      String pid = project.getId();
      new TransactionTemplate(txManager)
          .executeWithoutResult(
              status -> {
                if (threadId != null && ragChatThreadRepository.existsById(threadId)) {
                  ragChatThreadRepository.deleteById(threadId);
                }
                projectUserRepository.deleteByProjectId(pid);
                projectRepository.deleteById(pid);
              });
      project = null;
      threadId = null;
    }
  }

  @AfterClass(alwaysRun = true)
  void tearDownClass() {
    if (createdUserIds.isEmpty()) {
      return;
    }
    new TransactionTemplate(txManager)
        .executeWithoutResult(
            status ->
                createdUserIds.forEach(
                    id -> {
                      if (userRepository.existsById(id)) {
                        userRepository.deleteById(id);
                      }
                    }));
    createdUserIds.clear();
  }

  private String ensureUser(String username) {
    User u =
        userRepository
            .findByUsername(username)
            .orElseGet(
                () -> {
                  User created = new User();
                  created.setUsername(username);
                  created.setEmail(username + "@ragidor-it.local");
                  created.setName(username);
                  created.setPassword(passwordEncoder.encode("pw123456"));
                  created.setRole("TESTER");
                  User saved = userRepository.save(created);
                  createdUserIds.add(saved.getId());
                  return saved;
                });
    UserDetails details = userDetailsService.loadUserByUsername(username);
    return "Bearer " + jwtTokenUtil.generateAccessToken(details);
  }

  private int status(org.springframework.test.web.servlet.RequestBuilder rb) throws Exception {
    return mockMvc.perform(rb).andReturn().getResponse().getStatus();
  }

  @Test
  void getThread_member200_outsider403() throws Exception {
    Assert.assertEquals(
        status(
            get("/api/rag/chat/conversations/threads/" + threadId)
                .header("Authorization", memberToken)),
        200,
        "프로젝트 멤버는 스레드 조회 가능");
    Assert.assertEquals(
        status(
            get("/api/rag/chat/conversations/threads/" + threadId)
                .header("Authorization", outsiderToken)),
        403,
        "비멤버는 타 프로젝트 스레드 조회 불가(IDOR 차단)");
  }

  @Test
  void getMessages_member200_outsider403() throws Exception {
    Assert.assertEquals(
        status(
            get("/api/rag/chat/conversations/threads/" + threadId + "/messages")
                .header("Authorization", memberToken)),
        200,
        "프로젝트 멤버는 메시지 조회 가능");
    Assert.assertEquals(
        status(
            get("/api/rag/chat/conversations/threads/" + threadId + "/messages")
                .header("Authorization", outsiderToken)),
        403,
        "비멤버는 타 프로젝트 메시지 조회 불가(IDOR 차단)");
  }

  @Test
  void deleteThread_outsider403_threadSurvives() throws Exception {
    Assert.assertEquals(
        status(
            delete("/api/rag/chat/conversations/threads/" + threadId)
                .header("Authorization", outsiderToken)),
        403,
        "비멤버는 타 프로젝트 스레드 삭제 불가(IDOR 차단)");
    Assert.assertTrue(ragChatThreadRepository.existsById(threadId), "차단됐으므로 스레드는 실제로 삭제되지 않아야 함");
  }

  @Test
  void unauthenticated_isRejected() throws Exception {
    int st = status(get("/api/rag/chat/conversations/threads/" + threadId));
    Assert.assertTrue(st == 401 || st == 403, "비인증 접근은 401/403 이어야 함, 실제=" + st);
  }
}
