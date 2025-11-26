package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.MailSettingsDto;
import com.testcase.testcasemanagement.model.MailSettings;
import com.testcase.testcasemanagement.repository.MailSettingsRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailSettingsService {

    private final MailSettingsRepository mailSettingsRepository;
    private final EncryptionUtil encryptionUtil;

    /**
     * 현재 메일 설정 조회
     */
    @Transactional(readOnly = true)
    public Optional<MailSettingsDto> getCurrentSettings() {
        Optional<MailSettings> settings = mailSettingsRepository.findFirstByOrderByCreatedAtDesc();
        return settings.map(this::convertToDto);
    }

    /**
     * 메일 설정 저장
     */
    @Transactional
    public MailSettingsDto saveSettings(MailSettingsDto dto, String updatedBy) {
        log.info("메일 설정 저장 시작 - 사용자: {}", updatedBy);

        // Gmail 설정 검증
        validateGmailSettings(dto);

        // 비밀번호 암호화
        String encryptedPassword = encryptionUtil.encrypt(dto.getPassword());

        // 엔티티 생성
        MailSettings settings = MailSettings.builder()
                .mailEnabled(dto.getMailEnabled())
                .smtpHost("smtp.gmail.com") // Gmail 고정
                .smtpPort(587) // Gmail 포트 고정
                .username(dto.getUsername())
                .password(encryptedPassword)
                .fromName(dto.getFromName())
                .useAuth(true) // Gmail은 인증 필수
                .useTLS(true) // Gmail은 TLS 필수
                .updatedBy(updatedBy)
                .build();

        MailSettings savedSettings = mailSettingsRepository.save(settings);
        log.info("메일 설정 저장 완료 - ID: {}", savedSettings.getId());

        return convertToDto(savedSettings);
    }

    /**
     * 메일 설정 업데이트
     */
    @Transactional
    public MailSettingsDto updateSettings(MailSettingsDto dto, String updatedBy) {
        log.info("메일 설정 업데이트 시작 - 사용자: {}", updatedBy);

        validateGmailSettings(dto);

        Optional<MailSettings> existingOpt = mailSettingsRepository.findFirstByOrderByCreatedAtDesc();

        if (existingOpt.isPresent()) {
            MailSettings existing = existingOpt.get();

            // 기존 설정 업데이트
            existing.setMailEnabled(dto.getMailEnabled());
            existing.setUsername(dto.getUsername());
            existing.setFromName(dto.getFromName());
            existing.setUpdatedBy(updatedBy);

            // 비밀번호가 변경된 경우만 암호화
            if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                existing.setPassword(encryptionUtil.encrypt(dto.getPassword()));
            }

            MailSettings updatedSettings = mailSettingsRepository.save(existing);
            log.info("메일 설정 업데이트 완료 - ID: {}", updatedSettings.getId());

            return convertToDto(updatedSettings);
        } else {
            // 기존 설정이 없으면 새로 생성
            return saveSettings(dto, updatedBy);
        }
    }

    /**
     * 메일 테스트 발송
     */
    public boolean testMailSettings(String testRecipient, String adminUser) {
        try {
            log.info("메일 테스트 발송 시작 - 수신자: {}", testRecipient);

            Optional<MailSettings> settingsOpt = mailSettingsRepository.findFirstByOrderByCreatedAtDesc();
            if (settingsOpt.isEmpty()) {
                log.warn("메일 설정이 없습니다.");
                return false;
            }

            MailSettings settings = settingsOpt.get();
            if (!settings.getMailEnabled()) {
                log.warn("메일 기능이 비활성화되어 있습니다.");
                return false;
            }

            // 동적 JavaMailSender 생성
            org.springframework.mail.javamail.JavaMailSender dynamicMailSender = createDynamicMailSender(settings);

            // 테스트 메일 내용 구성
            String subject = "[TestCase Manager] 메일 설정 테스트";
            String content = String.format(
                    "안녕하세요,\n\n" +
                            "TestCase Manager 시스템의 메일 설정 테스트입니다.\n\n" +
                            "✅ 메일 기능이 정상적으로 작동하고 있습니다.\n" +
                            "✅ SMTP 설정: %s:%d\n" +
                            "✅ 발신자: %s <%s>\n\n" +
                            "테스트 시간: %s\n" +
                            "설정 관리자: %s\n\n" +
                            "TestCase Manager",
                    settings.getSmtpHost(),
                    settings.getSmtpPort(),
                    settings.getFromName(),
                    settings.getUsername(),
                    java.time.LocalDateTime.now().toString(),
                    adminUser);

            // 동적 MailSender로 메일 발송
            jakarta.mail.internet.MimeMessage message = dynamicMailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, false, "UTF-8");

            helper.setFrom(settings.getFromName() + " <" + settings.getUsername() + ">");
            helper.setTo(testRecipient);
            helper.setSubject(subject);
            helper.setText(content, false);

            dynamicMailSender.send(message);

            log.info("메일 테스트 발송 성공 - 수신자: {}", testRecipient);
            return true;

        } catch (Exception e) {
            log.error("메일 테스트 발송 실패", e);
            return false;
        }
    }

    /**
     * 동적 JavaMailSender 생성 (MailSettings 기반)
     */
    private org.springframework.mail.javamail.JavaMailSender createDynamicMailSender(MailSettings settings) {
        org.springframework.mail.javamail.JavaMailSenderImpl mailSender = new org.springframework.mail.javamail.JavaMailSenderImpl();

        mailSender.setHost(settings.getSmtpHost());
        mailSender.setPort(settings.getSmtpPort());
        mailSender.setUsername(settings.getUsername());

        // 비밀번호 복호화
        String decryptedPassword = encryptionUtil.decrypt(settings.getPassword());
        mailSender.setPassword(decryptedPassword);

        // SMTP 속성 설정
        java.util.Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", settings.getUseAuth() ? "true" : "false");
        props.put("mail.smtp.starttls.enable", settings.getUseTLS() ? "true" : "false");
        props.put("mail.debug", "false");

        return mailSender;
    }

    /**
     * 메일 설정 삭제 (비활성화)
     */
    @Transactional
    public boolean disableMailSettings(String updatedBy) {
        log.info("메일 설정 비활성화 - 사용자: {}", updatedBy);

        Optional<MailSettings> settingsOpt = mailSettingsRepository.findFirstByOrderByCreatedAtDesc();
        if (settingsOpt.isPresent()) {
            MailSettings settings = settingsOpt.get();
            settings.setMailEnabled(false);
            settings.setUpdatedBy(updatedBy);
            mailSettingsRepository.save(settings);

            log.info("메일 설정 비활성화 완료");
            return true;
        }
        return false;
    }

    /**
     * Gmail 설정 검증
     */
    private void validateGmailSettings(MailSettingsDto dto) {
        if (!dto.getUsername().endsWith("@gmail.com")) {
            throw new IllegalArgumentException("Gmail 주소만 지원됩니다. (@gmail.com으로 끝나야 함)");
        }

        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new IllegalArgumentException("Gmail 앱 비밀번호는 8자 이상이어야 합니다.");
        }

        if (dto.getFromName() == null || dto.getFromName().trim().isEmpty()) {
            throw new IllegalArgumentException("발신자 이름은 필수입니다.");
        }
    }

    /**
     * 엔티티를 DTO로 변환 (비밀번호는 마스킹)
     */
    private MailSettingsDto convertToDto(MailSettings settings) {
        return MailSettingsDto.builder()
                .mailEnabled(settings.getMailEnabled())
                .smtpHost(settings.getSmtpHost())
                .smtpPort(settings.getSmtpPort())
                .username(settings.getUsername())
                .password("****") // 보안을 위해 마스킹
                .fromName(settings.getFromName())
                .useAuth(settings.getUseAuth())
                .useTLS(settings.getUseTLS())
                .build();
    }
}