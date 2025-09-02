package com.testcase.testcasemanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "시스템 메일 설정 정보")
public class MailSettingsDto {
    
    @Schema(description = "메일 기능 활성화 여부", example = "true", required = true)
    @NotNull
    private Boolean mailEnabled;
    
    @Schema(description = "SMTP 호스트 (Gmail만 지원)", example = "smtp.gmail.com", required = true)
    @NotBlank
    private String smtpHost;
    
    @Schema(description = "SMTP 포트", example = "587", required = true)
    @NotNull
    private Integer smtpPort;
    
    @Schema(description = "Gmail 사용자명 (이메일 주소)", example = "your-email@gmail.com", required = true)
    @NotBlank
    @Email(message = "유효한 이메일 주소를 입력하세요")
    private String username;
    
    @Schema(description = "Gmail 앱 비밀번호", example = "your-app-password", required = true)
    @NotBlank
    private String password;
    
    @Schema(description = "발신자 이름", example = "TestCase Manager", required = true)
    @NotBlank
    private String fromName;
    
    @Schema(description = "인증 사용 여부", example = "true", required = true)
    @NotNull
    private Boolean useAuth;
    
    @Schema(description = "TLS 암호화 사용 여부", example = "true", required = true)
    @NotNull
    private Boolean useTLS;
    
    @Schema(description = "테스트 메일 수신자 (설정 테스트용)", example = "test@example.com")
    private String testRecipient;
}