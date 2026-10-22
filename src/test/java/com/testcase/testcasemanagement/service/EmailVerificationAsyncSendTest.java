package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.CommonResponse;
import com.testcase.testcasemanagement.model.EmailVerificationToken;
import com.testcase.testcasemanagement.model.EmailVerificationToken.SendErrorCode;
import com.testcase.testcasemanagement.model.EmailVerificationToken.SendStatus;
import com.testcase.testcasemanagement.model.MailSettings;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.EmailVerificationRepository;
import com.testcase.testcasemanagement.repository.MailSettingsRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import java.net.ConnectException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-439: 인증 메일 비동기 발송의 결과 기록과 조회 권한을 확인한다. */
public class EmailVerificationAsyncSendTest {

  private EmailVerificationRepository tokenRepository;
  private UserRepository userRepository;
  private MailSettingsRepository mailSettingsRepository;
  private VerificationMailSender mailSender;
  private final AtomicReference<EmailVerificationToken> saved = new AtomicReference<>();

  @BeforeMethod
  public void setUp() {
    tokenRepository = mock(EmailVerificationRepository.class);
    userRepository = mock(UserRepository.class);
    mailSettingsRepository = mock(MailSettingsRepository.class);
    mailSender = mock(VerificationMailSender.class);
    saved.set(null);

    MailSettings settings = new MailSettings();
    settings.setMailEnabled(true);
    when(mailSettingsRepository.findFirstByOrderByCreatedAtDesc()).thenReturn(Optional.of(settings));
    User user = new User();
    user.setId("u1");
    user.setName("tester");
    when(userRepository.findById("u1")).thenReturn(Optional.of(user));
    when(tokenRepository.save(any(EmailVerificationToken.class)))
        .thenAnswer(
            invocation -> {
              EmailVerificationToken token = invocation.getArgument(0);
              if (token.getId() == null) {
                token.setId("req-1");
              }
              saved.set(token);
              return token;
            });
    when(tokenRepository.findById("req-1")).thenAnswer(invocation -> Optional.ofNullable(saved.get()));
  }

  private EmailVerificationService service(Executor executor) {
    return new EmailVerificationService(
        tokenRepository, userRepository, mailSettingsRepository, mailSender, executor);
  }

  @Test
  public void 발송에_성공하면_SENT_로_기록한다() {
    CommonResponse response = service(Runnable::run).createVerificationToken("u1", "a@example.com", null);

    assertTrue(response.isSuccess());
    assertEquals(response.getRequestId(), "req-1");
    assertEquals(saved.get().getSendStatus(), SendStatus.SENT);
    assertNull(saved.get().getSendErrorCode());
    assertTrue(saved.get().getSendFinishedAt() != null);
  }

  @Test
  public void 발송에_실패하면_FAILED_와_원인_분류를_기록한다() throws Exception {
    doThrow(new MailAuthenticationException("535 bad credentials"))
        .when(mailSender)
        .send(any(), anyString(), anyString(), anyString(), any());

    CommonResponse response = service(Runnable::run).createVerificationToken("u1", "a@example.com", null);

    // 접수는 성공이고, 실패는 조회 결과로 전달된다
    assertTrue(response.isSuccess());
    assertEquals(saved.get().getSendStatus(), SendStatus.FAILED);
    assertEquals(saved.get().getSendErrorCode(), SendErrorCode.AUTH_FAILED);
    var status = service(Runnable::run).getSendStatus("req-1", "u1", false).orElseThrow();
    assertEquals(status.getStatus(), "FAILED");
    assertEquals(status.getErrorCode(), "AUTH_FAILED");
  }

  @Test
  public void 발송_대기열이_가득_차면_즉시_실패로_응답하고_REJECTED_로_기록한다() {
    Executor full =
        command -> {
          throw new TaskRejectedException("queue full");
        };

    CommonResponse response = service(full).createVerificationToken("u1", "a@example.com", null);

    assertFalse(response.isSuccess());
    assertEquals(saved.get().getSendStatus(), SendStatus.FAILED);
    assertEquals(saved.get().getSendErrorCode(), SendErrorCode.REJECTED);
  }

  @Test
  public void 다른_사용자의_발송_결과는_보이지_않고_관리자에게는_보인다() {
    service(Runnable::run).createVerificationToken("u1", "a@example.com", null);

    assertTrue(service(Runnable::run).getSendStatus("req-1", "other", false).isEmpty());
    assertTrue(service(Runnable::run).getSendStatus("req-1", "admin", true).isPresent());
    assertTrue(service(Runnable::run).getSendStatus("unknown", "u1", false).isEmpty());
  }

  @Test
  public void 상태_기록_이전에_발급된_토큰은_SENT_로_본다() {
    User user = new User();
    user.setId("u1");
    EmailVerificationToken legacy = new EmailVerificationToken();
    legacy.setId("old");
    legacy.setUser(user);
    when(tokenRepository.findById("old")).thenReturn(Optional.of(legacy));

    var status = service(Runnable::run).getSendStatus("old", "u1", false).orElseThrow();

    assertEquals(status.getStatus(), "SENT");
    assertNull(status.getErrorCode());
  }

  @Test
  public void 실패_원인을_예외_사슬에서_분류한다() {
    assertEquals(
        EmailVerificationService.classify(
            new MailSendException("connect failed", new MessagingException("x", new ConnectException()))),
        SendErrorCode.CONNECT_FAILED);
    assertEquals(
        EmailVerificationService.classify(new AuthenticationFailedException("535")),
        SendErrorCode.AUTH_FAILED);
    assertEquals(
        EmailVerificationService.classify(
            new MailSendException(Map.<Object, Exception>of(new Object(), new MessagingException("x", new ConnectException())))),
        SendErrorCode.CONNECT_FAILED);
    assertEquals(
        EmailVerificationService.classify(new MailSendException("550 rejected")),
        SendErrorCode.SEND_FAILED);
  }
}
