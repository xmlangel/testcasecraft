package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.expectThrows;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.CommonResponse;
import com.testcase.testcasemanagement.dto.EmailVerificationDto.SendStatusResponse;
import com.testcase.testcasemanagement.model.EmailVerificationToken;
import com.testcase.testcasemanagement.model.EmailVerificationToken.SendErrorCode;
import com.testcase.testcasemanagement.model.EmailVerificationToken.SendStatus;
import com.testcase.testcasemanagement.model.MailSettings;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.EmailVerificationRepository;
import com.testcase.testcasemanagement.repository.MailSettingsRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-439: 메일 서버가 연결만 받고 응답하지 않을 때, 인증 메일 요청은 곧바로 응답하고 발송 실패가 기록되는지, 관리자 시험 발송은 시간 제한(5초) 안에 오류로
 * 끝나는지 확인한다.
 *
 * <p>시간 제한이 없으면 SMTP 인사말을 기다리며 요청이 끝나지 않는다.
 */
public class SmtpTimeoutTest {

  private static final long LIMIT_MS = 10_000;
  // SMTP 인사말을 기다리다 시간 제한에 걸렸는지(다른 이유로 일찍 실패하지 않았는지) 가르는 하한
  private static final long MIN_WAIT_MS = 4_000;

  @Mock private EmailVerificationRepository emailVerificationRepository;
  @Mock private UserRepository userRepository;
  @Mock private MailSettingsRepository mailSettingsRepository;
  @Mock private EncryptionUtil encryptionUtil;

  private EmailVerificationService emailVerificationService;
  private MailSettingsService mailSettingsService;

  private ExecutorService sendExecutor;
  private AutoCloseable mocks;
  private ServerSocket silentServer;
  private final List<Socket> accepted = new ArrayList<>();

  @BeforeMethod
  public void setUp() throws Exception {
    mocks = MockitoAnnotations.openMocks(this);
    sendExecutor = Executors.newSingleThreadExecutor();
    emailVerificationService =
        new EmailVerificationService(
            emailVerificationRepository,
            userRepository,
            mailSettingsRepository,
            new VerificationMailSender(encryptionUtil),
            sendExecutor);
    mailSettingsService = new MailSettingsService(mailSettingsRepository, encryptionUtil);
    silentServer = new ServerSocket(0);
    Thread acceptor =
        new Thread(
            () -> {
              try {
                while (!silentServer.isClosed()) {
                  accepted.add(silentServer.accept());
                }
              } catch (Exception ignored) {
                // 서버 종료
              }
            });
    acceptor.setDaemon(true);
    acceptor.start();

    MailSettings settings = new MailSettings();
    settings.setMailEnabled(true);
    settings.setSmtpHost("127.0.0.1");
    settings.setSmtpPort(silentServer.getLocalPort());
    settings.setUsername("noreply@example.com");
    settings.setPassword("encrypted");
    settings.setUseAuth(false);
    settings.setUseTLS(false);
    when(mailSettingsRepository.findFirstByOrderByCreatedAtDesc())
        .thenReturn(Optional.of(settings));
    when(encryptionUtil.decrypt(anyString())).thenReturn("pw");
  }

  @AfterMethod
  public void tearDown() throws Exception {
    silentServer.close();
    for (Socket s : accepted) {
      s.close();
    }
    mocks.close();
    sendExecutor.shutdownNow();
  }

  @Test(timeOut = 30_000)
  public void verificationMail_respondsImmediately_andRecordsTimeout_whenSmtpServerIsSilent()
      throws Exception {
    User user = new User();
    user.setId("u1");
    user.setName("tester");
    when(userRepository.findById("u1")).thenReturn(Optional.of(user));
    AtomicReference<EmailVerificationToken> saved = new AtomicReference<>();
    when(emailVerificationRepository.save(any(EmailVerificationToken.class)))
        .thenAnswer(
            invocation -> {
              EmailVerificationToken token = invocation.getArgument(0);
              if (token.getId() == null) {
                token.setId("req-1");
              }
              saved.set(token);
              return token;
            });
    when(emailVerificationRepository.findById("req-1"))
        .thenAnswer(invocation -> Optional.ofNullable(saved.get()));

    long start = System.currentTimeMillis();
    CommonResponse response =
        emailVerificationService.createVerificationToken(
            "u1", "user@example.com", "http://localhost:8080");
    long elapsed = System.currentTimeMillis() - start;

    // 요청은 메일 서버를 기다리지 않고 접수만 하고 끝난다
    assertTrue(response.isSuccess(), response.getMessage());
    assertEquals(response.getRequestId(), "req-1");
    assertTrue(elapsed < 1_000, "elapsed=" + elapsed + "ms");
    assertEquals(saved.get().getSendStatus(), SendStatus.PENDING);

    // 발송 스레드가 시간 제한에 걸려 실패를 기록한다
    long sendStart = System.currentTimeMillis();
    while (saved.get().getSendStatus() == SendStatus.PENDING
        && System.currentTimeMillis() - sendStart < LIMIT_MS) {
      Thread.sleep(50);
    }
    long sendElapsed = System.currentTimeMillis() - sendStart;
    assertEquals(saved.get().getSendStatus(), SendStatus.FAILED);
    assertEquals(saved.get().getSendErrorCode(), SendErrorCode.TIMEOUT);
    assertTrue(sendElapsed >= MIN_WAIT_MS - 1_000, "sendElapsed=" + sendElapsed + "ms");

    // 화면이 조회하는 결과에도 실패가 보인다
    SendStatusResponse status =
        emailVerificationService.getSendStatus("req-1", "u1", false).orElseThrow();
    assertEquals(status.getStatus(), "FAILED");
    assertEquals(status.getErrorCode(), "TIMEOUT");
  }

  @Test(timeOut = 30_000)
  public void adminTestMail_failsWithinTimeout_whenSmtpServerIsSilent() {
    long start = System.currentTimeMillis();
    expectThrows(
        RuntimeException.class,
        () -> mailSettingsService.testMailSettings("user@example.com", "admin"));
    long elapsed = System.currentTimeMillis() - start;

    assertTrue(elapsed >= MIN_WAIT_MS && elapsed < LIMIT_MS, "elapsed=" + elapsed + "ms");
  }
}
