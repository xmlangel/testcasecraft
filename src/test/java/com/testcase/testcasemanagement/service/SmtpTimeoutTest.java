package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.expectThrows;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.CommonResponse;
import com.testcase.testcasemanagement.model.EmailVerificationToken;
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
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-439: 메일 서버가 연결만 받고 응답하지 않을 때 발송 요청이 시간 제한(5초) 안에 오류로 끝나는지 확인한다.
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

  private AutoCloseable mocks;
  private ServerSocket silentServer;
  private final List<Socket> accepted = new ArrayList<>();

  @BeforeMethod
  public void setUp() throws Exception {
    mocks = MockitoAnnotations.openMocks(this);
    emailVerificationService =
        new EmailVerificationService(
            emailVerificationRepository, userRepository, mailSettingsRepository, encryptionUtil);
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
    when(mailSettingsRepository.findFirstByOrderByCreatedAtDesc()).thenReturn(Optional.of(settings));
    when(encryptionUtil.decrypt(anyString())).thenReturn("pw");
  }

  @AfterMethod
  public void tearDown() throws Exception {
    silentServer.close();
    for (Socket s : accepted) {
      s.close();
    }
    mocks.close();
  }

  @Test(timeOut = 30_000)
  public void verificationMail_failsWithinTimeout_whenSmtpServerIsSilent() {
    User user = new User();
    user.setId("u1");
    user.setName("tester");
    when(userRepository.findById("u1")).thenReturn(Optional.of(user));

    long start = System.currentTimeMillis();
    CommonResponse response =
        emailVerificationService.createVerificationToken(
            "u1", "user@example.com", "http://localhost:8080");
    long elapsed = System.currentTimeMillis() - start;

    assertFalse(response.isSuccess(), response.getMessage());
    assertTrue(elapsed >= MIN_WAIT_MS && elapsed < LIMIT_MS, "elapsed=" + elapsed + "ms");
    verify(emailVerificationRepository).save(any(EmailVerificationToken.class));
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
