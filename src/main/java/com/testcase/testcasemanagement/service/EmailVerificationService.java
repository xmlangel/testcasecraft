// src/main/java/com/testcase/testcasemanagement/service/EmailVerificationService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.EmailVerificationDto.*;
import com.testcase.testcasemanagement.model.EmailVerificationToken;
import com.testcase.testcasemanagement.model.EmailVerificationToken.SendErrorCode;
import com.testcase.testcasemanagement.model.EmailVerificationToken.SendStatus;
import com.testcase.testcasemanagement.model.MailSettings;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.EmailVerificationRepository;
import com.testcase.testcasemanagement.repository.MailSettingsRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import jakarta.mail.AuthenticationFailedException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class EmailVerificationService {

  private final EmailVerificationRepository emailVerificationRepository;
  private final UserRepository userRepository;
  private final MailSettingsRepository mailSettingsRepository;
  private final VerificationMailSender verificationMailSender;
  private final Executor mailSendExecutor;

  public EmailVerificationService(
      EmailVerificationRepository emailVerificationRepository,
      UserRepository userRepository,
      MailSettingsRepository mailSettingsRepository,
      VerificationMailSender verificationMailSender,
      @Qualifier("mailSendExecutor") Executor mailSendExecutor) {
    this.emailVerificationRepository = emailVerificationRepository;
    this.userRepository = userRepository;
    this.mailSettingsRepository = mailSettingsRepository;
    this.verificationMailSender = verificationMailSender;
    this.mailSendExecutor = mailSendExecutor;
  }

  /** 인증 토큰 생성 및 이메일 발송 */
  public CommonResponse createVerificationToken(String userId, String email) {
    return createVerificationToken(userId, email, null);
  }

  /**
   * 인증 토큰 생성 및 이메일 발송 (Base URL 지정)
   *
   * <p>ICT-439: 트랜잭션을 걸지 않는다. 토큰을 발송 대기(PENDING) 상태로 먼저 커밋하고, SMTP 발송은 발송 전용 스레드 풀에
   * 넘긴 뒤 곧바로 응답한다. 요청 스레드가 메일 서버를 기다리지 않으므로 DB 연결과 요청 스레드를 붙잡지 않는다. 발송 결과는 토큰에
   * 기록하고 화면은 {@link #getSendStatus} 로 조회해 실패를 보여 준다.
   */
  public CommonResponse createVerificationToken(String userId, String email, String baseUrl) {
    try {
      // ⚠️ 메일 설정 활성화 여부 확인
      Optional<MailSettings> mailSettingsOpt =
          mailSettingsRepository.findFirstByOrderByCreatedAtDesc();
      if (mailSettingsOpt.isEmpty()) {
        log.warn("Mail settings not configured");
        return CommonResponse.failure("Mail settings are not configured. Please contact the administrator.");
      }

      MailSettings mailSettings = mailSettingsOpt.get();
      if (!mailSettings.getMailEnabled()) {
        log.warn("Mail feature is disabled");
        return CommonResponse.failure("Mail feature is disabled. Please contact the administrator.");
      }

      // 사용자 조회
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("User not found."));

      // 기존 미사용 토큰 삭제 (새로운 토큰으로 대체)
      emailVerificationRepository
          .findByUserIdAndEmailAndIsUsedFalse(userId, email)
          .ifPresent(emailVerificationRepository::delete);

      // 새 토큰 생성
      EmailVerificationToken token = new EmailVerificationToken();
      token.setToken(UUID.randomUUID().toString());
      token.setUser(user);
      token.setEmail(email);
      token.setIsUsed(false);
      token.setExpiresAt(LocalDateTime.now().plusHours(24));
      token.setSendStatus(SendStatus.PENDING);

      emailVerificationRepository.save(token);
      String requestId = token.getId();
      String tokenValue = token.getToken();
      String userName = user.getName();

      try {
        mailSendExecutor.execute(
            () -> sendAndRecord(requestId, mailSettings, email, tokenValue, userName, baseUrl));
      } catch (RejectedExecutionException e) {
        log.error("Verification email rejected, send queue is full: {} (request: {})", email, requestId, e);
        recordResult(requestId, SendStatus.FAILED, SendErrorCode.REJECTED);
        return CommonResponse.failure("Too many emails are being sent. Please try again later.");
      }

      log.info(
          "Email verification token created and send queued for user: {} (email: {}, request: {})",
          userId,
          email,
          requestId);
      return CommonResponse.accepted("인증 이메일 발송을 요청했습니다.", requestId);

    } catch (IllegalArgumentException e) {
      log.error("Invalid user ID: {}", userId, e);
      return CommonResponse.failure(e.getMessage());
    } catch (Exception e) {
      log.error("Unexpected error creating verification token", e);
      return CommonResponse.failure("An error occurred while generating the verification token.");
    }
  }

  /** 토큰 검증 및 사용 처리 */
  @Transactional
  public VerifyTokenResponse verifyToken(String tokenString) {
    try {
      // 토큰 조회
      Optional<EmailVerificationToken> tokenOpt =
          emailVerificationRepository.findByToken(tokenString);

      if (tokenOpt.isEmpty()) {
        log.warn("Invalid verification token: {}", tokenString);
        return VerifyTokenResponse.failure("Invalid verification link.", "INVALID");
      }

      EmailVerificationToken token = tokenOpt.get();

      // 이미 사용된 토큰 확인
      if (token.getIsUsed()) {
        // 이미 인증된 사용자라면 성공으로 처리 (프리뷰어/스캐너 등에 의한 중복 호출 대응)
        if (token.getUser().getEmailVerified()) {
          log.info("Token already used but user already verified: {}", tokenString);
          return VerifyTokenResponse.success("이미 인증이 완료되었습니다.");
        }
        log.warn("Token already used: {}", tokenString);
        return VerifyTokenResponse.failure("This verification link has already been used.", "USED");
      }

      // 만료된 토큰 확인
      if (token.isExpired()) {
        log.warn("Token expired: {}", tokenString);
        return VerifyTokenResponse.failure("The verification link has expired.", "EXPIRED");
      }

      // 토큰 사용 처리
      token.setIsUsed(true);
      token.setUsedAt(LocalDateTime.now());
      emailVerificationRepository.save(token);

      // 사용자 이메일 업데이트 (필요 시)
      User user = token.getUser();
      if (!user.getEmail().equals(token.getEmail())) {
        user.setEmail(token.getEmail());
      }

      // 이메일 인증 완료 처리
      user.setEmailVerified(true);
      userRepository.save(user);
      log.info("User email verified: {} -> {}", user.getId(), token.getEmail());

      log.info("Email verification successful for user: {}", user.getId());
      return VerifyTokenResponse.success("이메일 인증이 완료되었습니다.");

    } catch (Exception e) {
      log.error("Unexpected error verifying token", e);
      return VerifyTokenResponse.failure("An error occurred during verification.", "ERROR");
    }
  }

  /** 인증 이메일 재발송 */
  public CommonResponse resendVerificationEmail(String userId) {
    try {
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("User not found."));

      // 사용자의 현재 이메일로 새 토큰 생성
      return createVerificationToken(userId, user.getEmail(), null);

    } catch (IllegalArgumentException e) {
      log.error("Invalid user ID: {}", userId, e);
      return CommonResponse.failure(e.getMessage());
    }
  }

  /**
   * 인증 메일 발송 결과 조회. 요청한 본인 또는 관리자만 볼 수 있다.
   *
   * <p>남의 발송 기록이면 없는 것과 같이 빈 값을 돌려준다. 존재 여부를 알려 주지 않기 위해서다.
   */
  public Optional<SendStatusResponse> getSendStatus(
      String requestId, String currentUserId, boolean isAdmin) {
    return emailVerificationRepository
        .findById(requestId)
        .filter(token -> isAdmin || token.getUser().getId().equals(currentUserId))
        .map(
            token ->
                new SendStatusResponse(
                    token.getId(),
                    // 상태 기록 이전에 발급된 토큰은 발송 결과를 그때 응답으로 이미 알렸다. 화면이 조회할 일이 없어 SENT 로 둔다
                    token.getSendStatus() == null ? SendStatus.SENT.name() : token.getSendStatus().name(),
                    token.getSendErrorCode() == null ? null : token.getSendErrorCode().name()));
  }

  /** 발송 전용 스레드에서 메일을 보내고 결과를 토큰에 기록한다. 예외를 밖으로 던지지 않는다. */
  void sendAndRecord(
      String requestId,
      MailSettings mailSettings,
      String email,
      String tokenValue,
      String userName,
      String baseUrl) {
    try {
      verificationMailSender.send(mailSettings, email, tokenValue, userName, baseUrl);
      recordResult(requestId, SendStatus.SENT, null);
    } catch (Exception e) {
      SendErrorCode code = classify(e);
      log.error(
          "Failed to send verification email to: {} (request: {}, reason: {})",
          email,
          requestId,
          code,
          e);
      recordResult(requestId, SendStatus.FAILED, code);
    }
  }

  private void recordResult(String requestId, SendStatus status, SendErrorCode errorCode) {
    try {
      emailVerificationRepository
          .findById(requestId)
          .ifPresent(
              token -> {
                token.setSendStatus(status);
                token.setSendErrorCode(errorCode);
                token.setSendFinishedAt(LocalDateTime.now());
                emailVerificationRepository.save(token);
              });
    } catch (Exception e) {
      // 기록에 실패해도 발송 결과는 위 로그에 남아 있다. 화면은 조회 시간이 지나면 확인 불가로 안내한다.
      log.error("Failed to record verification email result (request: {}, status: {})", requestId, status, e);
    }
  }

  /** 예외 원인 사슬을 따라가 화면에 보여 줄 실패 분류를 고른다. 예외 원문은 내부 정보라 화면에 내보내지 않는다. */
  static SendErrorCode classify(Throwable error) {
    for (Throwable t = error; t != null; t = t.getCause() == t ? null : t.getCause()) {
      if (t instanceof MailAuthenticationException || t instanceof AuthenticationFailedException) {
        return SendErrorCode.AUTH_FAILED;
      }
      if (t instanceof SocketTimeoutException) {
        return SendErrorCode.TIMEOUT;
      }
      if (t instanceof ConnectException || t instanceof UnknownHostException) {
        return SendErrorCode.CONNECT_FAILED;
      }
      // 메시지 단위 실패는 원인 사슬이 아니라 실패 메시지 목록에 담겨 온다
      if (t instanceof MailSendException mailSendException) {
        for (Exception messageException : mailSendException.getMessageExceptions()) {
          SendErrorCode code = classify(messageException);
          if (code != SendErrorCode.SEND_FAILED) {
            return code;
          }
        }
      }
    }
    return SendErrorCode.SEND_FAILED;
  }
}
