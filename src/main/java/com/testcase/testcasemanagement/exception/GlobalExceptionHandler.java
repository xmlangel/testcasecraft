// src/main/java/com/testcase/testcasemanagement/exception/GlobalExceptionHandler.java

package com.testcase.testcasemanagement.exception;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.testcase.testcasemanagement.dto.ErrorResponse;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @Autowired private Environment environment;

  // ICT-134: 에러 메트릭 수집을 위한 카운터
  private final Counter dashboardErrorCounter;
  private final Counter generalErrorCounter;
  private final Counter authenticationErrorCounter;
  private final Counter authorizationErrorCounter;

  public GlobalExceptionHandler(MeterRegistry meterRegistry) {
    this.dashboardErrorCounter =
        Counter.builder("dashboard.errors")
            .description("Dashboard API errors")
            .tag("component", "dashboard")
            .register(meterRegistry);
    this.generalErrorCounter =
        Counter.builder("api.errors.general")
            .description("General API errors")
            .register(meterRegistry);
    this.authenticationErrorCounter =
        Counter.builder("api.errors.authentication")
            .description("Authentication errors")
            .register(meterRegistry);
    this.authorizationErrorCounter =
        Counter.builder("api.errors.authorization")
            .description("Authorization errors")
            .register(meterRegistry);
  }

  // ===============================
  // ICT-134: 대시보드 특화 예외 처리
  // ===============================

  /** 대시보드 일반 예외 처리 */
  @ExceptionHandler(DashboardException.class)
  public ResponseEntity<ErrorResponse> handleDashboardException(
      DashboardException ex, WebRequest request) {

    dashboardErrorCounter.increment();
    logger.error(
        "Dashboard error in component [{}]: {} - Request: {}",
        ex.getComponent(),
        ex.getMessage(),
        request.getDescription(false),
        ex);

    ErrorResponse response =
        new ErrorResponse(
            ex.getErrorCode(),
            ex.getMessage(),
            LocalDateTime.now(),
            Map.of(
                "component", ex.getComponent(),
                "timestamp", LocalDateTime.now().toString(),
                "requestPath", request.getDescription(false)));

    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /** 대시보드 데이터 조회 예외 처리 */
  @ExceptionHandler(DashboardException.DataRetrievalException.class)
  public ResponseEntity<ErrorResponse> handleDashboardDataRetrievalException(
      DashboardException.DataRetrievalException ex, WebRequest request) {

    dashboardErrorCounter.increment();
    logger.error(
        "Dashboard data retrieval error in [{}]: {} - Request: {}",
        ex.getComponent(),
        ex.getMessage(),
        request.getDescription(false),
        ex);

    ErrorResponse response =
        new ErrorResponse(
            ex.getErrorCode(),
            "An error occurred while retrieving dashboard data: " + ex.getMessage(),
            LocalDateTime.now(),
            Map.of(
                "component", ex.getComponent(),
                "errorType", "DATA_RETRIEVAL",
                "suggestion", "Please try again later."));

    return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
  }

  /** 대시보드 캐시 예외 처리 */
  @ExceptionHandler(DashboardException.CacheException.class)
  public ResponseEntity<ErrorResponse> handleDashboardCacheException(
      DashboardException.CacheException ex, WebRequest request) {

    dashboardErrorCounter.increment();
    logger.warn(
        "Dashboard cache error in [{}]: {} - Request: {}",
        ex.getComponent(),
        ex.getMessage(),
        request.getDescription(false),
        ex);

    ErrorResponse response =
        new ErrorResponse(
            ex.getErrorCode(),
            "A cache error occurred, but the service remains available.",
            LocalDateTime.now(),
            Map.of(
                "component", ex.getComponent(),
                "errorType", "CACHE_ERROR",
                "impact", "Response times may be slightly slower."));

    return new ResponseEntity<>(response, HttpStatus.OK); // 캐시 오류는 서비스 가용성에 영향 없음
  }

  /** 대시보드 통계 계산 예외 처리 */
  @ExceptionHandler(DashboardException.StatisticsException.class)
  public ResponseEntity<ErrorResponse> handleDashboardStatisticsException(
      DashboardException.StatisticsException ex, WebRequest request) {

    dashboardErrorCounter.increment();
    logger.error(
        "Dashboard statistics error in [{}]: {} - Request: {}",
        ex.getComponent(),
        ex.getMessage(),
        request.getDescription(false),
        ex);

    ErrorResponse response =
        new ErrorResponse(
            ex.getErrorCode(),
            "An error occurred while calculating statistics: " + ex.getMessage(),
            LocalDateTime.now(),
            Map.of(
                "component", ex.getComponent(),
                "errorType", "STATISTICS_ERROR",
                "fallback", "Default values will be returned."));

    return new ResponseEntity<>(response, HttpStatus.PARTIAL_CONTENT);
  }

  /** 대시보드 쿼리 성능 예외 처리 */
  @ExceptionHandler(DashboardException.QueryPerformanceException.class)
  public ResponseEntity<ErrorResponse> handleDashboardQueryPerformanceException(
      DashboardException.QueryPerformanceException ex, WebRequest request) {

    dashboardErrorCounter.increment();
    logger.warn(
        "Dashboard query performance issue in [{}]: {} - Request: {}",
        ex.getComponent(),
        ex.getMessage(),
        request.getDescription(false),
        ex);

    ErrorResponse response =
        new ErrorResponse(
            ex.getErrorCode(),
            "Query execution took longer than expected: " + ex.getMessage(),
            LocalDateTime.now(),
            Map.of(
                "component", ex.getComponent(),
                "errorType", "QUERY_PERFORMANCE",
                "recommendation", "Please contact the system administrator."));

    return new ResponseEntity<>(response, HttpStatus.REQUEST_TIMEOUT);
  }

  // ===============================
  // 기존 예외 처리 (메트릭 추가)
  // ===============================

  /** 커스텀 접근 거부 예외 처리 */
  @ExceptionHandler(com.testcase.testcasemanagement.exception.AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleCustomAccessDeniedException(
      com.testcase.testcasemanagement.exception.AccessDeniedException ex, WebRequest request) {

    authorizationErrorCounter.increment();
    logger.warn("Access denied: {} - Request: {}", ex.getMessage(), request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse("ACCESS_DENIED", ex.getMessage(), LocalDateTime.now(), null);

    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
  }

  /** 스프링 시큐리티 접근 거부 예외 처리 */
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleSpringAccessDeniedException(
      AccessDeniedException ex, WebRequest request) {

    authorizationErrorCounter.increment();
    logger.warn(
        "Spring Security access denied: {} - Request: {}",
        ex.getMessage(),
        request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse("ACCESS_DENIED", "Access denied.", LocalDateTime.now(), null);

    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
  }

  /** 리소스 없음 예외 처리 */
  /**
   * 벡터 쓰기가 꺼진 상태에서 색인·임베딩 생성을 요청한 경우.
   *
   * <p>실패가 아니라 관리자가 의도적으로 막아 둔 상태다. 화면이 errorCode 로 원인을 가려내 "질문은 그대로 된다"까지 안내할 수 있도록 코드를 함께 내려준다.
   */
  /**
   * RAG 기능이 통째로 꺼진 상태에서 요청한 경우.
   *
   * <p>장애가 아니라 관리자가 중지해 둔 상태다. 전에는 IllegalStateException 이 컨트롤러의 catch(Exception) 에 걸려 500 으로 나갔고
   * 화면에는 아무 설명도 오지 않았다.
   */
  @ExceptionHandler(RagDisabledException.class)
  public ResponseEntity<ErrorResponse> handleRagDisabled(
      RagDisabledException ex, WebRequest request) {

    logger.info("RAG 중지 상태에서 요청 거부: {}", request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse(
            RagDisabledException.ERROR_CODE, ex.getMessage(), LocalDateTime.now(), null);

    return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
  }

  @ExceptionHandler(RagVectorWriteDisabledException.class)
  public ResponseEntity<ErrorResponse> handleRagVectorWriteDisabled(
      RagVectorWriteDisabledException ex, WebRequest request) {

    logger.info("벡터 색인 중지 상태에서 요청 거부: {}", request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse(
            RagVectorWriteDisabledException.ERROR_CODE, ex.getMessage(), LocalDateTime.now(), null);

    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
      ResourceNotFoundException ex, WebRequest request) {

    logger.warn(
        "Resource not found: {} - Request: {}", ex.getMessage(), request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage(), LocalDateTime.now(), null);

    return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
  }

  /** 인증 자격 증명 없음 예외 처리 */
  @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleAuthenticationCredentialsNotFoundException(
      AuthenticationCredentialsNotFoundException ex, WebRequest request) {

    logger.warn(
        "Authentication credentials not found: {} - Request: {}",
        ex.getMessage(),
        request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse(
            "AUTHENTICATION_REQUIRED", "Authentication required.", LocalDateTime.now(), null);

    return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
  }

  /** 인증 불충분 예외 처리 */
  @ExceptionHandler(InsufficientAuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleInsufficientAuthenticationException(
      InsufficientAuthenticationException ex, WebRequest request) {

    logger.warn(
        "Insufficient authentication: {} - Request: {}",
        ex.getMessage(),
        request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse(
            "INSUFFICIENT_AUTHENTICATION",
            "Proper authentication is required.",
            LocalDateTime.now(),
            null);

    return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(ResourceNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationExceptions(
      ResourceNotValidException ex, WebRequest request) {
    // 상세한 검증 실패 로깅 추가
    logger.warn(
        "Validation failed: {} - Request: {} - Errors: {}",
        ex.getMessage(),
        request.getDescription(false),
        ex.getErrors());

    ErrorResponse response =
        new ErrorResponse(
            "VALIDATION_FAILED", ex.getMessage(), LocalDateTime.now(), ex.getErrors());
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex) {
    Map<String, String> errors =
        ex.getBindingResult().getFieldErrors().stream()
            .collect(
                Collectors.toMap(
                    FieldError::getField,
                    error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "",
                    (existing, replacement) -> existing + ", " + replacement));

    String errorMessage =
        "Invalid request data: "
            + errors.entrySet().stream()
                .map(e -> String.format("[%s] %s", e.getKey(), e.getValue()))
                .collect(Collectors.joining(", "));

    logger.warn("Method argument validation failed: {}", errors);

    ErrorResponse response =
        new ErrorResponse("INVALID_REQUEST", errorMessage, LocalDateTime.now(), errors);
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
      DataIntegrityViolationException ex) {
    String rawMessage = ex.getMostSpecificCause().getMessage();
    logger.warn("Data integrity violation: {}", rawMessage);

    String friendlyMessage = translateDataIntegrityMessage(rawMessage);
    Map<String, String> details = extractDataIntegrityDetails(rawMessage);

    ErrorResponse response =
        new ErrorResponse(
            "DATA_CONFLICT",
            friendlyMessage,
            LocalDateTime.now(),
            details.isEmpty() ? null : details);
    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
  }

  // PG/H2 unique violation 메시지에서 컬럼·값을 추출해 사용자 친화적 메시지로 변환한다.
  // 예: ERROR: duplicate key value violates unique constraint "uk_xxx"
  //     Detail: Key (email)=(user@example.com) already exists.
  private static final java.util.regex.Pattern PG_DUPLICATE_KEY_DETAIL =
      java.util.regex.Pattern.compile("Key \\(([^)]+)\\)=\\(([^)]*)\\) already exists");

  private static final Map<String, String> FIELD_LABELS =
      Map.of(
          "email", "email",
          "username", "username",
          "name", "name",
          "project_key", "project key",
          "project_name", "project name");

  private String translateDataIntegrityMessage(String rawMessage) {
    if (rawMessage == null) {
      return "Data already exists. Please check your input.";
    }

    java.util.regex.Matcher m = PG_DUPLICATE_KEY_DETAIL.matcher(rawMessage);
    if (m.find()) {
      String column = m.group(1);
      String label = FIELD_LABELS.getOrDefault(column, column);
      return String.format("This %s is already registered.", label);
    }

    String lower = rawMessage.toLowerCase();
    if (lower.contains("duplicate") || lower.contains("unique constraint")) {
      return "This value is already registered. Please check your input.";
    }
    if (lower.contains("foreign key") || lower.contains("violates foreign key constraint")) {
      return "The operation cannot be completed because the data is still referenced.";
    }
    if (lower.contains("not-null") || lower.contains("null value")) {
      return "A required field is missing.";
    }

    return "A data integrity violation occurred. Please check your input.";
  }

  private Map<String, String> extractDataIntegrityDetails(String rawMessage) {
    if (rawMessage == null) {
      return Map.of();
    }
    java.util.regex.Matcher m = PG_DUPLICATE_KEY_DETAIL.matcher(rawMessage);
    if (m.find()) {
      Map<String, String> details = new HashMap<>();
      details.put("field", m.group(1));
      details.put("value", m.group(2));
      return details;
    }
    return Map.of();
  }

  // [추가] 파일 업로드 용량 초과 예외 처리
  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(
      MaxUploadSizeExceededException ex) {
    // 실제 제한 크기를 동적으로 가져오기
    String maxFileSize = environment.getProperty("spring.servlet.multipart.max-file-size", "100MB");
    String message = String.format("File size exceeds %s limit", maxFileSize);

    Map<String, String> details = new HashMap<>();
    details.put("maxFileSize", maxFileSize);
    details.put("description", String.format("Maximum allowed file size is %s", maxFileSize));

    ErrorResponse response =
        new ErrorResponse("FILE_SIZE_EXCEEDED", message, LocalDateTime.now(), details);
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
    HttpStatus status =
        ex.getStatusCode() instanceof HttpStatus httpStatus
            ? httpStatus
            : HttpStatus.INTERNAL_SERVER_ERROR;
    ErrorResponse response =
        new ErrorResponse(
            status == HttpStatus.NOT_FOUND ? "NOT_FOUND" : "ERROR",
            ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(),
            LocalDateTime.now(),
            null);
    return new ResponseEntity<>(response, status);
  }

  /** Rate Limit 초과 예외 처리 (Resilience4j). ICT-444 의 LLM 호출 사용자별 제한(LlmCallRateLimiter)이 이 경로로 온다. */
  @ExceptionHandler(io.github.resilience4j.ratelimiter.RequestNotPermitted.class)
  public ResponseEntity<ErrorResponse> handleRateLimitException(
      io.github.resilience4j.ratelimiter.RequestNotPermitted ex, WebRequest request) {

    logger.warn("Rate limit exceeded - Request: {}", request.getDescription(false));

    Map<String, String> details = new HashMap<>();
    details.put("retryAfter", "60");
    details.put("message", "Please try again in 60 seconds.");
    details.put("requestPath", request.getDescription(false));

    ErrorResponse response =
        new ErrorResponse(
            "RATE_LIMIT_EXCEEDED",
            "Too many requests. Please try again in 60 seconds.",
            LocalDateTime.now(),
            details);

    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header("Retry-After", "60")
        .body(response);
  }

  /** 클라이언트 연결 중단 예외 처리 (Broken Pipe) 사용자가 페이지를 새로고침하거나 이동할 때 정상적으로 발생할 수 있는 에러 */
  @ExceptionHandler(org.apache.catalina.connector.ClientAbortException.class)
  public void handleClientAbortException(
      org.apache.catalina.connector.ClientAbortException ex, WebRequest request) {

    // ClientAbortException은 정상적인 사용자 행동으로 발생하므로 WARN 레벨로 처리
    logger.warn(
        "Client disconnected: {} - Request: uri={}",
        ex.getMessage(),
        request.getDescription(false));

    // 응답을 반환하지 않음 (클라이언트가 이미 연결을 끊은 상태)
  }

  /**
   * 비동기 요청 불가 예외 처리 (AsyncRequestNotUsableException with Broken Pipe) Jackson 직렬화 중 클라이언트 연결이 끊긴 경우
   */
  @ExceptionHandler(
      org.springframework.web.context.request.async.AsyncRequestNotUsableException.class)
  public void handleAsyncRequestNotUsableException(
      org.springframework.web.context.request.async.AsyncRequestNotUsableException ex,
      WebRequest request) {

    // 근본 원인이 ClientAbortException인지 확인
    Throwable rootCause = ex;
    while (rootCause.getCause() != null) {
      rootCause = rootCause.getCause();
    }

    if (rootCause instanceof java.io.IOException
        && rootCause.getMessage() != null
        && rootCause.getMessage().contains("Broken pipe")) {

      logger.warn(
          "Client disconnected during response: {} - Request: uri={}",
          ex.getMessage(),
          request.getDescription(false));
    } else {
      // 다른 원인의 AsyncRequestNotUsableException은 ERROR로 처리
      generalErrorCounter.increment();
      logger.error(
          "Async request error: {} - Request: {}",
          ex.getMessage(),
          request.getDescription(false),
          ex);
    }

    // 응답을 반환하지 않음 (클라이언트가 이미 연결을 끊은 상태)
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex, WebRequest request) {
    // Broken Pipe 에러를 포함한 ClientAbortException 체크
    Throwable rootCause = ex;
    while (rootCause.getCause() != null) {
      rootCause = rootCause.getCause();
    }

    // ClientAbortException이나 Broken Pipe는 WARN 레벨로 처리
    if (ex instanceof org.apache.catalina.connector.ClientAbortException
        || rootCause instanceof org.apache.catalina.connector.ClientAbortException
        || (rootCause instanceof java.io.IOException
            && rootCause.getMessage() != null
            && rootCause.getMessage().contains("Broken pipe"))) {

      logger.warn(
          "Client disconnected during request processing: {} - Request: uri={}",
          ex.getMessage(),
          request.getDescription(false));

      // 클라이언트가 연결을 끊었으므로 응답 반환하지 않음
      return null;
    }

    generalErrorCounter.increment();
    // 내부 예외 상세(원문 메시지·예외 클래스·파일명·라인번호)는 응답에 노출하지 않고 서버 로그로만 남긴다 (CWE-209).
    // 클라이언트에는 추적용 traceId만 전달해 로그와 상관관계를 맺는다.
    String traceId = java.util.UUID.randomUUID().toString().substring(0, 8);
    logger.error(
        "Unexpected error [traceId={}]: {} - Request: {}",
        traceId,
        ex.getMessage(),
        request.getDescription(false),
        ex);

    ErrorResponse response =
        new ErrorResponse(
            "INTERNAL_ERROR",
            "An internal server error occurred. (traceId: " + traceId + ")",
            LocalDateTime.now(),
            null);
    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(GoogleJsonResponseException.class)
  public ResponseEntity<ErrorResponse> handleGoogleJsonResponseException(
      GoogleJsonResponseException ex) {
    HttpStatus status;
    if (ex.getStatusCode() == 404) {
      status = HttpStatus.NOT_FOUND;
    } else if (ex.getStatusCode() == 400) {
      status = HttpStatus.BAD_REQUEST;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    ErrorResponse response =
        new ErrorResponse(
            "GOOGLE_SHEETS_ERROR",
            ex.getDetails() != null ? ex.getDetails().getMessage() : ex.getMessage(),
            LocalDateTime.now(),
            null);
    return new ResponseEntity<>(response, status);
  }
}
