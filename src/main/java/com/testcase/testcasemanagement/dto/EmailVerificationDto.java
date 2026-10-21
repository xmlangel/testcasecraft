// src/main/java/com/testcase/testcasemanagement/dto/EmailVerificationDto.java
package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class EmailVerificationDto {

  /** 이메일 발송 요청 DTO */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SendVerificationRequest {
    private String userId;
    private String email;
  }

  /** 이메일 재발송 요청 DTO */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ResendVerificationRequest {
    private String userId;
  }

  /** 토큰 검증 응답 DTO */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class VerifyTokenResponse {
    private boolean success;
    private String message;
    private String error; // EXPIRED, USED, INVALID, null

    public static VerifyTokenResponse success(String message) {
      return new VerifyTokenResponse(true, message, null);
    }

    public static VerifyTokenResponse failure(String message, String error) {
      return new VerifyTokenResponse(false, message, error);
    }
  }

  /** 공통 응답 DTO */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CommonResponse {
    private boolean success;
    private String message;
    // ICT-439: 메일을 비동기로 보낼 때 발송 결과를 조회할 식별자. 발송을 접수하지 않은 응답에서는 null
    private String requestId;

    public CommonResponse(boolean success, String message) {
      this(success, message, null);
    }

    public static CommonResponse success(String message) {
      return new CommonResponse(true, message);
    }

    public static CommonResponse accepted(String message, String requestId) {
      return new CommonResponse(true, message, requestId);
    }

    public static CommonResponse failure(String message) {
      return new CommonResponse(false, message);
    }
  }

  /** ICT-439: 인증 메일 발송 결과 조회 응답 */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SendStatusResponse {
    private String requestId;
    private String status; // PENDING, SENT, FAILED
    private String errorCode; // CONNECT_FAILED, AUTH_FAILED, TIMEOUT, REJECTED, SEND_FAILED, null
  }
}
