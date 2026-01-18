// src/main/java/com/testcase/testcasemanagement/dto/EmailVerificationDto.java
package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class EmailVerificationDto {

    /**
     * 이메일 발송 요청 DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendVerificationRequest {
        private String userId;
        private String email;
    }

    /**
     * 이메일 재발송 요청 DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResendVerificationRequest {
        private String userId;
    }

    /**
     * 토큰 검증 응답 DTO
     */
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

    /**
     * 공통 응답 DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommonResponse {
        private boolean success;
        private String message;

        public static CommonResponse success(String message) {
            return new CommonResponse(true, message);
        }

        public static CommonResponse failure(String message) {
            return new CommonResponse(false, message);
        }
    }
}
