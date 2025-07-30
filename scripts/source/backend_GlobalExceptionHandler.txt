// src/main/java/com/testcase/testcasemanagement/exception/GlobalExceptionHandler.java

package com.testcase.testcasemanagement.exception;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.testcase.testcasemanagement.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 커스텀 접근 거부 예외 처리
     */
    @ExceptionHandler(com.testcase.testcasemanagement.exception.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleCustomAccessDeniedException(
            com.testcase.testcasemanagement.exception.AccessDeniedException ex,
            WebRequest request) {
        
        logger.warn("Access denied: {} - Request: {}", ex.getMessage(), request.getDescription(false));
        
        ErrorResponse response = new ErrorResponse(
                "ACCESS_DENIED",
                ex.getMessage(),
                LocalDateTime.now(),
                null
        );
        
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * 스프링 시큐리티 접근 거부 예외 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleSpringAccessDeniedException(
            AccessDeniedException ex,
            WebRequest request) {
        
        logger.warn("Spring Security access denied: {} - Request: {}", ex.getMessage(), request.getDescription(false));
        
        ErrorResponse response = new ErrorResponse(
                "ACCESS_DENIED",
                "접근 권한이 없습니다.",
                LocalDateTime.now(),
                null
        );
        
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
                null
        );
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * 인증 자격 증명 없음 예외 처리
     */
    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationCredentialsNotFoundException(
            AuthenticationCredentialsNotFoundException ex,
            WebRequest request) {
        
        logger.warn("Authentication credentials not found: {} - Request: {}", ex.getMessage(), request.getDescription(false));
        
        ErrorResponse response = new ErrorResponse(
                "AUTHENTICATION_REQUIRED",
                "인증이 필요합니다.",
                LocalDateTime.now(),
                null
        );
        
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * 인증 불충분 예외 처리
     */
    @ExceptionHandler(InsufficientAuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientAuthenticationException(
            InsufficientAuthenticationException ex,
            WebRequest request) {
        
        logger.warn("Insufficient authentication: {} - Request: {}", ex.getMessage(), request.getDescription(false));
        
        ErrorResponse response = new ErrorResponse(
                "INSUFFICIENT_AUTHENTICATION",
                "적절한 인증이 필요합니다.",
                LocalDateTime.now(),
                null
        );
        
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResourceNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(ResourceNotValidException ex) {
        ErrorResponse response = new ErrorResponse(
                "VALIDATION_FAILED",
                ex.getMessage(),
                LocalDateTime.now(),
                ex.getErrors()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : ""
                ));

        ErrorResponse response = new ErrorResponse(
                "INVALID_REQUEST",
                "유효하지 않은 요청 데이터",
                LocalDateTime.now(),
                errors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        ErrorResponse response = new ErrorResponse(
                "DATA_CONFLICT",
                "데이터 무결성 위반: " + ex.getMostSpecificCause().getMessage(),
                LocalDateTime.now(),
                null
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    // [추가] 파일 업로드 용량 초과 예외 처리
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        ErrorResponse response = new ErrorResponse(
                "FILE_SIZE_EXCEEDED",
                "File size exceeds 2MB limit",
                LocalDateTime.now(),
                null
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        ErrorResponse response = new ErrorResponse(
                "INTERNAL_ERROR",
                "서버 내부 오류 발생: " + ex.getMessage(),
                LocalDateTime.now(),
                null
        );
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
                null
        );
        return new ResponseEntity<>(response, status);
    }
}
