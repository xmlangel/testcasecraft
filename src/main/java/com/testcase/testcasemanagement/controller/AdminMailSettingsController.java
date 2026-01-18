package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.MailSettingsDto;
import com.testcase.testcasemanagement.service.MailSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/mail-settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin - Mail Settings", description = "관리자 전용 메일 설정 관리 API")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMailSettingsController {
    
    private final MailSettingsService mailSettingsService;
    
    @Operation(
        summary = "메일 설정 조회",
        description = "현재 시스템의 메일 설정을 조회합니다. 관리자만 접근 가능합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "메일 설정 조회 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MailSettingsDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "메일 설정이 없음",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = "{\"message\": \"메일 설정이 존재하지 않습니다.\"}")
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "접근 권한 없음 (관리자 전용)",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = "{\"message\": \"관리자 권한이 필요합니다.\"}")
            )
        )
    })
    @GetMapping
    public ResponseEntity<?> getMailSettings() {
        log.info("메일 설정 조회 요청");
        
        Optional<MailSettingsDto> settings = mailSettingsService.getCurrentSettings();
        
        if (settings.isPresent()) {
            return ResponseEntity.ok(settings.get());
        } else {
            return ResponseEntity.ok(getDefaultMailSettings());
        }
    }
    
    @Operation(
        summary = "메일 설정 저장",
        description = "시스템의 메일 설정을 저장합니다. Gmail만 지원하며, 앱 비밀번호가 필요합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "메일 설정 저장 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MailSettingsDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 데이터",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = "{\"message\": \"Gmail 주소만 지원됩니다.\"}")
            )
        )
    })
    @PostMapping
    public ResponseEntity<?> saveMailSettings(
            @Parameter(description = "메일 설정 정보", required = true)
            @Valid @RequestBody MailSettingsDto mailSettingsDto,
            Principal principal) {
        
        try {
            log.info("메일 설정 저장 요청 - 사용자: {}", principal.getName());
            
            MailSettingsDto savedSettings = mailSettingsService.saveSettings(
                mailSettingsDto, principal.getName()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "메일 설정이 성공적으로 저장되었습니다.",
                "settings", savedSettings
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("메일 설정 저장 실패 - 검증 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("메일 설정 저장 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "message", "메일 설정 저장 중 오류가 발생했습니다."
            ));
        }
    }
    
    @Operation(
        summary = "메일 설정 업데이트",
        description = "기존 메일 설정을 업데이트합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "메일 설정 업데이트 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 데이터"
        )
    })
    @PutMapping
    public ResponseEntity<?> updateMailSettings(
            @Valid @RequestBody MailSettingsDto mailSettingsDto,
            Principal principal) {
        
        try {
            log.info("메일 설정 업데이트 요청 - 사용자: {}", principal.getName());
            
            MailSettingsDto updatedSettings = mailSettingsService.updateSettings(
                mailSettingsDto, principal.getName()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "메일 설정이 성공적으로 업데이트되었습니다.",
                "settings", updatedSettings
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("메일 설정 업데이트 실패 - 검증 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("메일 설정 업데이트 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "message", "메일 설정 업데이트 중 오류가 발생했습니다."
            ));
        }
    }
    
    @Operation(
        summary = "메일 발송 테스트",
        description = "현재 설정으로 테스트 메일을 발송합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "테스트 메일 발송 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "메일 설정이 없거나 비활성화됨"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "메일 발송 실패"
        )
    })
    @PostMapping("/test")
    public ResponseEntity<?> testMailSettings(
            @Parameter(description = "테스트 메일 수신자", required = true)
            @RequestParam String testRecipient,
            Principal principal) {
        
        try {
            log.info("메일 테스트 발송 요청 - 수신자: {}, 관리자: {}", testRecipient, principal.getName());
            
            boolean success = mailSettingsService.testMailSettings(testRecipient, principal.getName());
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "message", "테스트 메일이 성공적으로 발송되었습니다.",
                    "recipient", testRecipient
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "메일 설정이 없거나 비활성화되어 있습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("메일 테스트 발송 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "message", "테스트 메일 발송 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    @Operation(
        summary = "메일 기능 비활성화",
        description = "메일 기능을 비활성화합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "메일 기능 비활성화 성공"
        )
    })
    @PostMapping("/disable")
    public ResponseEntity<?> disableMailSettings(Principal principal) {
        try {
            log.info("메일 설정 비활성화 요청 - 사용자: {}", principal.getName());
            
            boolean success = mailSettingsService.disableMailSettings(principal.getName());
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "message", "메일 기능이 성공적으로 비활성화되었습니다."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "비활성화할 메일 설정이 없습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("메일 설정 비활성화 실패", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "message", "메일 설정 비활성화 중 오류가 발생했습니다."
            ));
        }
    }
    
    @Operation(
        summary = "Gmail 설정 가이드 조회",
        description = "Gmail 앱 비밀번호 설정 방법에 대한 가이드를 제공합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "설정 가이드 조회 성공"
        )
    })
    @GetMapping("/guide")
    public ResponseEntity<?> getGmailGuide() {
        return ResponseEntity.ok(Map.of(
            "title", "Gmail 앱 비밀번호 설정 가이드",
            "steps", getGmailSetupSteps(),
            "requirements", getGmailRequirements(),
            "troubleshooting", getTroubleshootingTips(),
            "warnings", getSecurityWarnings()
        ));
    }
    
    /**
     * 기본 메일 설정 반환
     */
    private MailSettingsDto getDefaultMailSettings() {
        return MailSettingsDto.builder()
                .mailEnabled(false)
                .smtpHost("smtp.gmail.com")
                .smtpPort(587)
                .username("")
                .password("")
                .fromName("TestCase Manager")
                .useAuth(true)
                .useTLS(true)
                .build();
    }
    
    /**
     * Gmail 설정 단계
     */
    private String[] getGmailSetupSteps() {
        return new String[]{
            "1. Gmail 계정에 로그인합니다",
            "2. Google 계정 관리 페이지로 이동합니다",
            "3. '보안' 탭을 클릭합니다",
            "4. '2단계 인증'을 활성화합니다 (필수)",
            "5. '앱 비밀번호'를 클릭합니다",
            "6. 앱을 '메일'로, 기기를 '기타'로 선택합니다",
            "7. 생성된 16자리 앱 비밀번호를 복사합니다",
            "8. 아래 폼에 Gmail 주소와 앱 비밀번호를 입력합니다"
        };
    }
    
    /**
     * Gmail 요구사항
     */
    private String[] getGmailRequirements() {
        return new String[]{
            "Gmail 계정 (@gmail.com)",
            "2단계 인증 활성화 (필수)",
            "앱 비밀번호 생성 (16자리)",
            "SMTP: smtp.gmail.com:587",
            "TLS/SSL 암호화 필수"
        };
    }
    
    /**
     * 문제 해결 팁
     */
    private String[] getTroubleshootingTips() {
        return new String[]{
            "앱 비밀번호는 공백 없이 16자리로 입력하세요",
            "2단계 인증이 비활성화되어 있으면 앱 비밀번호를 생성할 수 없습니다",
            "Gmail 계정이 아닌 주소는 지원되지 않습니다",
            "앱 비밀번호는 일반 비밀번호와 다릅니다",
            "테스트 메일 발송으로 설정을 검증하세요"
        };
    }
    
    /**
     * 보안 경고
     */
    private String[] getSecurityWarnings() {
        return new String[]{
            "앱 비밀번호는 안전하게 보관하세요",
            "필요하지 않은 앱 비밀번호는 삭제하세요",
            "의심스러운 활동이 감지되면 즉시 비밀번호를 변경하세요",
            "앱 비밀번호를 다른 사람과 공유하지 마세요",
            "정기적으로 보안 설정을 검토하세요"
        };
    }
}