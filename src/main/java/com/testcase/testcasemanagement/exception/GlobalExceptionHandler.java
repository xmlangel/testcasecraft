// src/main/java/com/testcase/testcasemanagement/exception/GlobalExceptionHandler.java

package com.testcase.testcasemanagement.exception;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.testcase.testcasemanagement.dto.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

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
