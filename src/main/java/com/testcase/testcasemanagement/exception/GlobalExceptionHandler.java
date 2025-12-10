// src/main/java/com/testcase/testcasemanagement/exception/GlobalExceptionHandler.java

package com.testcase.testcasemanagement.exception;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.testcase.testcasemanagement.dto.ErrorResponse;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @Autowired
        private Environment environment;

        // ICT-134: 에러 메트릭 수집을 위한 카운터
        private final Counter dashboardErrorCounter;
        private final Counter generalErrorCounter;
        private final Counter authenticationErrorCounter;
        private final Counter authorizationErrorCounter;

        public GlobalExceptionHandler(MeterRegistry meterRegistry) {
                this.dashboardErrorCounter = Counter.builder("dashboard.errors")
                                .description("Dashboard API errors")
                                .tag("component", "dashboard")
                                .register(meterRegistry);
                this.generalErrorCounter = Counter.builder("api.errors.general")
                                .description("General API errors")
                                .register(meterRegistry);
                this.authenticationErrorCounter = Counter.builder("api.errors.authentication")
                                .description("Authentication errors")
                                .register(meterRegistry);
                this.authorizationErrorCounter = Counter.builder("api.errors.authorization")
                                .description("Authorization errors")
                                .register(meterRegistry);
        }

        // ===============================
        // ICT-134: 대시보드 특화 예외 처리
        // ===============================

        /**
         * 대시보드 일반 예외 처리
         */
        @ExceptionHandler(DashboardException.class)
        public ResponseEntity<ErrorResponse> handleDashboardException(
                        DashboardException ex,
                        WebRequest request) {

                dashboardErrorCounter.increment();
                logger.error("Dashboard error in component [{}]: {} - Request: {}",
                                ex.getComponent(), ex.getMessage(), request.getDescription(false), ex);

                ErrorResponse response = new ErrorResponse(
                                ex.getErrorCode(),
                                ex.getMessage(),
                                LocalDateTime.now(),
                                Map.of(
                                                "component", ex.getComponent(),
                                                "timestamp", LocalDateTime.now().toString(),
                                                "requestPath", request.getDescription(false)));

                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        /**
         * 대시보드 데이터 조회 예외 처리
         */
        @ExceptionHandler(DashboardException.DataRetrievalException.class)
        public ResponseEntity<ErrorResponse> handleDashboardDataRetrievalException(
                        DashboardException.DataRetrievalException ex,
                        WebRequest request) {

                dashboardErrorCounter.increment();
                logger.error("Dashboard data retrieval error in [{}]: {} - Request: {}",
                                ex.getComponent(), ex.getMessage(), request.getDescription(false), ex);

                ErrorResponse response = new ErrorResponse(
                                ex.getErrorCode(),
                                "대시보드 데이터 조회 중 오류가 발생했습니다: " + ex.getMessage(),
                                LocalDateTime.now(),
                                Map.of(
                                                "component", ex.getComponent(),
                                                "errorType", "DATA_RETRIEVAL",
                                                "suggestion", "잠시 후 다시 시도해주세요."));

                return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
        }

        /**
         * 대시보드 캐시 예외 처리
         */
        @ExceptionHandler(DashboardException.CacheException.class)
        public ResponseEntity<ErrorResponse> handleDashboardCacheException(
                        DashboardException.CacheException ex,
                        WebRequest request) {

                dashboardErrorCounter.increment();
                logger.warn("Dashboard cache error in [{}]: {} - Request: {}",
                                ex.getComponent(), ex.getMessage(), request.getDescription(false), ex);

                ErrorResponse response = new ErrorResponse(
                                ex.getErrorCode(),
                                "캐시 처리 중 오류가 발생했지만 서비스는 계속 이용할 수 있습니다.",
                                LocalDateTime.now(),
                                Map.of(
                                                "component", ex.getComponent(),
                                                "errorType", "CACHE_ERROR",
                                                "impact", "응답 시간이 다소 느려질 수 있습니다."));

                return new ResponseEntity<>(response, HttpStatus.OK); // 캐시 오류는 서비스 가용성에 영향 없음
        }

        /**
         * 대시보드 통계 계산 예외 처리
         */
        @ExceptionHandler(DashboardException.StatisticsException.class)
        public ResponseEntity<ErrorResponse> handleDashboardStatisticsException(
                        DashboardException.StatisticsException ex,
                        WebRequest request) {

                dashboardErrorCounter.increment();
                logger.error("Dashboard statistics error in [{}]: {} - Request: {}",
                                ex.getComponent(), ex.getMessage(), request.getDescription(false), ex);

                ErrorResponse response = new ErrorResponse(
                                ex.getErrorCode(),
                                "통계 계산 중 오류가 발생했습니다: " + ex.getMessage(),
                                LocalDateTime.now(),
                                Map.of(
                                                "component", ex.getComponent(),
                                                "errorType", "STATISTICS_ERROR",
                                                "fallback", "기본값이 반환됩니다."));

                return new ResponseEntity<>(response, HttpStatus.PARTIAL_CONTENT);
        }

        /**
         * 대시보드 쿼리 성능 예외 처리
         */
        @ExceptionHandler(DashboardException.QueryPerformanceException.class)
        public ResponseEntity<ErrorResponse> handleDashboardQueryPerformanceException(
                        DashboardException.QueryPerformanceException ex,
                        WebRequest request) {

                dashboardErrorCounter.increment();
                logger.warn("Dashboard query performance issue in [{}]: {} - Request: {}",
                                ex.getComponent(), ex.getMessage(), request.getDescription(false), ex);

                ErrorResponse response = new ErrorResponse(
                                ex.getErrorCode(),
                                "쿼리 실행 시간이 예상보다 오래 걸렸습니다: " + ex.getMessage(),
                                LocalDateTime.now(),
                                Map.of(
                                                "component", ex.getComponent(),
                                                "errorType", "QUERY_PERFORMANCE",
                                                "recommendation", "시스템 관리자에게 문의하세요."));

                return new ResponseEntity<>(response, HttpStatus.REQUEST_TIMEOUT);
        }

        // ===============================
        // 기존 예외 처리 (메트릭 추가)
        // ===============================

        /**
         * 커스텀 접근 거부 예외 처리
         */
        @ExceptionHandler(com.testcase.testcasemanagement.exception.AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleCustomAccessDeniedException(
                        com.testcase.testcasemanagement.exception.AccessDeniedException ex,
                        WebRequest request) {

                authorizationErrorCounter.increment();
                logger.warn("Access denied: {} - Request: {}", ex.getMessage(), request.getDescription(false));

                ErrorResponse response = new ErrorResponse(
                                "ACCESS_DENIED",
                                ex.getMessage(),
                                LocalDateTime.now(),
                                null);

                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        /**
         * 스프링 시큐리티 접근 거부 예외 처리
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleSpringAccessDeniedException(
                        AccessDeniedException ex,
                        WebRequest request) {

                authorizationErrorCounter.increment();
                logger.warn("Spring Security access denied: {} - Request: {}", ex.getMessage(),
                                request.getDescription(false));

                ErrorResponse response = new ErrorResponse(
                                "ACCESS_DENIED",
                                "접근 권한이 없습니다.",
                                LocalDateTime.now(),
                                null);

                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

        /**
         * 리소스 없음 예외 처리
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
                        ResourceNotFoundException ex,
                        WebRequest request) {

                logger.warn("Resource not found: {} - Request: {}", ex.getMessage(), request.getDescription(false));

                ErrorResponse response = new ErrorResponse(
                                "RESOURCE_NOT_FOUND",
                                ex.getMessage(),
                                LocalDateTime.now(),
                                null);

                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        /**
         * 인증 자격 증명 없음 예외 처리
         */
        @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleAuthenticationCredentialsNotFoundException(
                        AuthenticationCredentialsNotFoundException ex,
                        WebRequest request) {

                logger.warn("Authentication credentials not found: {} - Request: {}", ex.getMessage(),
                                request.getDescription(false));

                ErrorResponse response = new ErrorResponse(
                                "AUTHENTICATION_REQUIRED",
                                "인증이 필요합니다.",
                                LocalDateTime.now(),
                                null);

                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        /**
         * 인증 불충분 예외 처리
         */
        @ExceptionHandler(InsufficientAuthenticationException.class)
        public ResponseEntity<ErrorResponse> handleInsufficientAuthenticationException(
                        InsufficientAuthenticationException ex,
                        WebRequest request) {

                logger.warn("Insufficient authentication: {} - Request: {}", ex.getMessage(),
                                request.getDescription(false));

                ErrorResponse response = new ErrorResponse(
                                "INSUFFICIENT_AUTHENTICATION",
                                "적절한 인증이 필요합니다.",
                                LocalDateTime.now(),
                                null);

                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(ResourceNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationExceptions(ResourceNotValidException ex,
                        WebRequest request) {
                // 상세한 검증 실패 로깅 추가
                logger.warn("Validation failed: {} - Request: {} - Errors: {}",
                                ex.getMessage(),
                                request.getDescription(false),
                                ex.getErrors());

                ErrorResponse response = new ErrorResponse(
                                "VALIDATION_FAILED",
                                ex.getMessage(),
                                LocalDateTime.now(),
                                ex.getErrors());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
                Map<String, String> errors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .collect(Collectors.toMap(
                                                FieldError::getField,
                                                error -> error.getDefaultMessage() != null ? error.getDefaultMessage()
                                                                : ""));

                ErrorResponse response = new ErrorResponse(
                                "INVALID_REQUEST",
                                "유효하지 않은 요청 데이터",
                                LocalDateTime.now(),
                                errors);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
                ErrorResponse response = new ErrorResponse(
                                "DATA_CONFLICT",
                                "데이터 무결성 위반: " + ex.getMostSpecificCause().getMessage(),
                                LocalDateTime.now(),
                                null);
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        }

        // [추가] 파일 업로드 용량 초과 예외 처리
        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
                // 실제 제한 크기를 동적으로 가져오기
                String maxFileSize = environment.getProperty("spring.servlet.multipart.max-file-size", "100MB");
                String message = String.format("File size exceeds %s limit", maxFileSize);

                Map<String, String> details = new HashMap<>();
                details.put("maxFileSize", maxFileSize);
                details.put("description", String.format("Maximum allowed file size is %s", maxFileSize));

                ErrorResponse response = new ErrorResponse(
                                "FILE_SIZE_EXCEEDED",
                                message,
                                LocalDateTime.now(),
                                details);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
                HttpStatus status = ex.getStatusCode() instanceof HttpStatus httpStatus ? httpStatus
                                : HttpStatus.INTERNAL_SERVER_ERROR;
                ErrorResponse response = new ErrorResponse(
                                status == HttpStatus.NOT_FOUND ? "NOT_FOUND" : "ERROR",
                                ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(),
                                LocalDateTime.now(),
                                null);
                return new ResponseEntity<>(response, status);
        }

        /**
         * Rate Limit 초과 예외 처리 (Resilience4j)
         */
        @ExceptionHandler(io.github.resilience4j.ratelimiter.RequestNotPermitted.class)
        public ResponseEntity<ErrorResponse> handleRateLimitException(
                        io.github.resilience4j.ratelimiter.RequestNotPermitted ex,
                        WebRequest request) {

                logger.warn("Rate limit exceeded - Request: {}", request.getDescription(false));

                Map<String, String> details = new HashMap<>();
                details.put("retryAfter", "60");
                details.put("message", "60초 후에 다시 시도해주세요.");
                details.put("requestPath", request.getDescription(false));

                ErrorResponse response = new ErrorResponse(
                                "RATE_LIMIT_EXCEEDED",
                                "동일 IP에서 1초에 10번 이상 요청이 발생했습니다. 60초 후 다시 시도해주세요.",
                                LocalDateTime.now(),
                                details);

                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                                .header("Retry-After", "60")
                                .body(response);
        }

        /**
         * 클라이언트 연결 중단 예외 처리 (Broken Pipe)
         * 사용자가 페이지를 새로고침하거나 이동할 때 정상적으로 발생할 수 있는 에러
         */
        @ExceptionHandler(org.apache.catalina.connector.ClientAbortException.class)
        public void handleClientAbortException(
                        org.apache.catalina.connector.ClientAbortException ex,
                        WebRequest request) {

                // ClientAbortException은 정상적인 사용자 행동으로 발생하므로 WARN 레벨로 처리
                logger.warn("Client disconnected: {} - Request: uri={}",
                                ex.getMessage(), request.getDescription(false));

                // 응답을 반환하지 않음 (클라이언트가 이미 연결을 끊은 상태)
        }

        /**
         * 비동기 요청 불가 예외 처리 (AsyncRequestNotUsableException with Broken Pipe)
         * Jackson 직렬화 중 클라이언트 연결이 끊긴 경우
         */
        @ExceptionHandler(org.springframework.web.context.request.async.AsyncRequestNotUsableException.class)
        public void handleAsyncRequestNotUsableException(
                        org.springframework.web.context.request.async.AsyncRequestNotUsableException ex,
                        WebRequest request) {

                // 근본 원인이 ClientAbortException인지 확인
                Throwable rootCause = ex;
                while (rootCause.getCause() != null) {
                        rootCause = rootCause.getCause();
                }

                if (rootCause instanceof java.io.IOException &&
                                rootCause.getMessage() != null &&
                                rootCause.getMessage().contains("Broken pipe")) {

                        logger.warn("Client disconnected during response: {} - Request: uri={}",
                                        ex.getMessage(), request.getDescription(false));
                } else {
                        // 다른 원인의 AsyncRequestNotUsableException은 ERROR로 처리
                        generalErrorCounter.increment();
                        logger.error("Async request error: {} - Request: {}",
                                        ex.getMessage(), request.getDescription(false), ex);
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
                if (ex instanceof org.apache.catalina.connector.ClientAbortException ||
                                rootCause instanceof org.apache.catalina.connector.ClientAbortException ||
                                (rootCause instanceof java.io.IOException &&
                                                rootCause.getMessage() != null &&
                                                rootCause.getMessage().contains("Broken pipe"))) {

                        logger.warn("Client disconnected during request processing: {} - Request: uri={}",
                                        ex.getMessage(), request.getDescription(false));

                        // 클라이언트가 연결을 끊었으므로 응답 반환하지 않음
                        return null;
                }

                generalErrorCounter.increment();
                logger.error("Unexpected error: {} - Request: {}", ex.getMessage(), request.getDescription(false), ex);

                // Debugging: Include stack trace in error message
                String debugMessage = "서버 내부 오류 발생: " + ex.getMessage();
                for (StackTraceElement element : ex.getStackTrace()) {
                        if (element.getClassName().startsWith("com.testcase")) {
                                debugMessage += " [At: " + element.getFileName() + ":" + element.getLineNumber() + "]";
                                break;
                        }
                }

                ErrorResponse response = new ErrorResponse(
                                "INTERNAL_ERROR",
                                debugMessage,
                                LocalDateTime.now(),
                                null);
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(GoogleJsonResponseException.class)
        public ResponseEntity<ErrorResponse> handleGoogleJsonResponseException(GoogleJsonResponseException ex) {
                HttpStatus status;
                if (ex.getStatusCode() == 404) {
                        status = HttpStatus.NOT_FOUND;
                } else if (ex.getStatusCode() == 400) {
                        status = HttpStatus.BAD_REQUEST;
                } else {
                        status = HttpStatus.INTERNAL_SERVER_ERROR;
                }
                ErrorResponse response = new ErrorResponse(
                                "GOOGLE_SHEETS_ERROR",
                                ex.getDetails() != null ? ex.getDetails().getMessage() : ex.getMessage(),
                                LocalDateTime.now(),
                                null);
                return new ResponseEntity<>(response, status);
        }
}
