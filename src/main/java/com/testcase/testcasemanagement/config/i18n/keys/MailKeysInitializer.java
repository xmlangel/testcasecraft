// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/MailKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // MailSettingsManager 관련
        createTranslationKeyIfNotExists("mail.manager.title", "mail", "메일 설정 관리 제목", "메일 설정 관리");
        createTranslationKeyIfNotExists("mail.manager.currentSettings", "mail", "현재 메일 설정", "현재 메일 설정");
        createTranslationKeyIfNotExists("mail.manager.subheader", "mail", "시스템 메일 발송 설정 현황", "시스템 메일 발송 설정 현황");
        createTranslationKeyIfNotExists("mail.manager.notConfigured", "mail", "설정되지 않음", "메일 설정이 구성되지 않았습니다. 새로운 설정을 추가하세요.");

        // 메일 상태 관련
        createTranslationKeyIfNotExists("mail.status.enabled", "mail", "메일 기능", "메일 기능");
        createTranslationKeyIfNotExists("mail.status.active", "mail", "활성화", "활성화");
        createTranslationKeyIfNotExists("mail.status.inactive", "mail", "비활성화", "비활성화");
        createTranslationKeyIfNotExists("mail.status.activatedStatus", "mail", "활성화됨", "활성화됨");
        createTranslationKeyIfNotExists("mail.status.deactivatedStatus", "mail", "비활성화됨", "비활성화됨");

        // SMTP 설정 관련
        createTranslationKeyIfNotExists("mail.smtp.server", "mail", "SMTP 서버", "SMTP 서버");
        createTranslationKeyIfNotExists("mail.smtp.sender", "mail", "발신자", "발신자");
        createTranslationKeyIfNotExists("mail.smtp.security", "mail", "보안 설정", "보안 설정");
        createTranslationKeyIfNotExists("mail.smtp.auth", "mail", "인증", "인증");
        createTranslationKeyIfNotExists("mail.smtp.tls", "mail", "TLS", "TLS");
        createTranslationKeyIfNotExists("mail.smtp.used", "mail", "사용", "사용");
        createTranslationKeyIfNotExists("mail.smtp.notUsed", "mail", "미사용", "미사용");

        // 버튼 관련
        createTranslationKeyIfNotExists("mail.button.newSettings", "mail", "새 설정 버튼", "새 설정");
        createTranslationKeyIfNotExists("mail.button.modifySettings", "mail", "설정 수정 버튼", "설정 수정");
        createTranslationKeyIfNotExists("mail.button.testSend", "mail", "테스트 발송 버튼", "테스트 발송");
        createTranslationKeyIfNotExists("mail.button.disable", "mail", "비활성화 버튼", "비활성화");
        createTranslationKeyIfNotExists("mail.button.detailedMethod", "mail", "자세한 설정 방법 버튼", "자세한 설정 방법");

        // Gmail 가이드 관련
        createTranslationKeyIfNotExists("mail.guide.title", "mail", "Gmail 설정 가이드 제목", "Gmail 설정 가이드");
        createTranslationKeyIfNotExists("mail.guide.description", "mail", "Gmail 가이드 설명", "TestCase Manager는 Gmail SMTP만 지원합니다. Gmail 앱 비밀번호 설정이 필요합니다.");
        createTranslationKeyIfNotExists("mail.guide.requirements", "mail", "필수 요구사항", "필수 요구사항");
        createTranslationKeyIfNotExists("mail.guide.gmailAccount", "mail", "Gmail 계정", "Gmail 계정");
        createTranslationKeyIfNotExists("mail.guide.twoFactorAuth", "mail", "2단계 인증 필수", "2단계 인증 필수");
        createTranslationKeyIfNotExists("mail.guide.appPassword", "mail", "앱 비밀번호 생성", "앱 비밀번호 생성");

        // MailConfigDialog 관련
        createTranslationKeyIfNotExists("mail.config.title.new", "mail", "새 메일 설정 제목", "새 메일 설정");
        createTranslationKeyIfNotExists("mail.config.title.edit", "mail", "메일 설정 수정 제목", "메일 설정 수정");
        createTranslationKeyIfNotExists("mail.config.gmailInfo", "mail", "Gmail 전용 안내", "이 시스템은 Gmail SMTP만 지원합니다. Gmail 2단계 인증과 앱 비밀번호가 필요합니다.");
        createTranslationKeyIfNotExists("mail.config.enableMail", "mail", "메일 기능 활성화", "메일 기능 활성화");

        // 폼 필드 관련
        createTranslationKeyIfNotExists("mail.config.form.gmailAddress", "mail", "Gmail 주소", "Gmail 주소");
        createTranslationKeyIfNotExists("mail.config.form.gmailAddressPlaceholder", "mail", "Gmail 주소 플레이스홀더", "your-email@gmail.com");
        createTranslationKeyIfNotExists("mail.config.form.gmailAddressHelper", "mail", "Gmail 주소 도움말", "예: your-email@gmail.com");
        createTranslationKeyIfNotExists("mail.config.form.appPassword", "mail", "Gmail 앱 비밀번호", "Gmail 앱 비밀번호");
        createTranslationKeyIfNotExists("mail.config.form.appPasswordPlaceholder", "mail", "앱 비밀번호 플레이스홀더", "Gmail 앱 비밀번호");
        createTranslationKeyIfNotExists("mail.config.form.appPasswordHelper", "mail", "앱 비밀번호 도움말", "16자리 Gmail 앱 비밀번호 (공백 없이)");
        createTranslationKeyIfNotExists("mail.config.form.senderName", "mail", "발신자 이름", "발신자 이름");
        createTranslationKeyIfNotExists("mail.config.form.senderNamePlaceholder", "mail", "발신자 이름 플레이스홀더", "TestCase Manager");
        createTranslationKeyIfNotExists("mail.config.form.senderNameHelper", "mail", "발신자 이름 도움말", "메일에 표시될 발신자 이름");
        createTranslationKeyIfNotExists("mail.config.form.testRecipient", "mail", "테스트 메일 수신자", "테스트 메일 수신자 (선택사항)");
        createTranslationKeyIfNotExists("mail.config.form.testRecipientPlaceholder", "mail", "테스트 수신자 플레이스홀더", "test@example.com");
        createTranslationKeyIfNotExists("mail.config.form.testRecipientHelper", "mail", "테스트 수신자 도움말", "설정 후 테스트 메일을 받을 이메일 주소");

        // 검증 메시지
        createTranslationKeyIfNotExists("mail.config.validation.gmailRequired", "mail", "Gmail 주소 필수", "Gmail 주소는 필수입니다.");
        createTranslationKeyIfNotExists("mail.config.validation.gmailFormat", "mail", "Gmail 형식 오류", "Gmail 주소만 지원됩니다. (@gmail.com으로 끝나야 함)");
        createTranslationKeyIfNotExists("mail.config.validation.passwordRequired", "mail", "앱 비밀번호 필수", "Gmail 앱 비밀번호는 필수입니다.");
        createTranslationKeyIfNotExists("mail.config.validation.passwordLength", "mail", "앱 비밀번호 길이", "앱 비밀번호는 8자 이상이어야 합니다.");
        createTranslationKeyIfNotExists("mail.config.validation.senderNameRequired", "mail", "발신자 이름 필수", "발신자 이름은 필수입니다.");

        // Gmail 고정 설정
        createTranslationKeyIfNotExists("mail.config.fixedSettings", "mail", "Gmail 고정 설정", "Gmail 고정 설정:");
        createTranslationKeyIfNotExists("mail.config.fixedSettings.smtp", "mail", "SMTP 서버 정보", "SMTP 서버: smtp.gmail.com:587");
        createTranslationKeyIfNotExists("mail.config.fixedSettings.tls", "mail", "TLS 암호화 사용", "TLS 암호화: 사용");
        createTranslationKeyIfNotExists("mail.config.fixedSettings.auth", "mail", "SMTP 인증 사용", "SMTP 인증: 사용");

        // 다이얼로그 버튼
        createTranslationKeyIfNotExists("mail.config.button.cancel", "mail", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("mail.config.button.save", "mail", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("mail.config.button.saving", "mail", "저장 중", "저장 중...");

        // GmailGuideDialog 관련
        createTranslationKeyIfNotExists("mail.guide.dialog.title", "mail", "Gmail 앱 비밀번호 설정 가이드", "Gmail 앱 비밀번호 설정 가이드");
        createTranslationKeyIfNotExists("mail.guide.stepGuide", "mail", "단계별 설정 방법", "단계별 설정 방법");
        createTranslationKeyIfNotExists("mail.guide.troubleshooting", "mail", "문제 해결", "문제 해결");
        createTranslationKeyIfNotExists("mail.guide.securityWarnings", "mail", "보안 주의사항", "보안 주의사항");
        createTranslationKeyIfNotExists("mail.guide.button.close", "mail", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("mail.guide.button.next", "mail", "다음 버튼", "다음");
        createTranslationKeyIfNotExists("mail.guide.button.previous", "mail", "이전 버튼", "이전");
        createTranslationKeyIfNotExists("mail.guide.button.complete", "mail", "완료 버튼", "완료");
        createTranslationKeyIfNotExists("mail.guide.button.reset", "mail", "다시 보기 버튼", "다시 보기");

        // 설정 단계 관련
        createTranslationKeyIfNotExists("mail.guide.step1.title", "mail", "1단계 제목", "Gmail 계정 로그인");
        createTranslationKeyIfNotExists("mail.guide.step1.description", "mail", "1단계 설명", "Gmail 계정에 로그인합니다");
        createTranslationKeyIfNotExists("mail.guide.step2.title", "mail", "2단계 제목", "Google 계정 관리로 이동");
        createTranslationKeyIfNotExists("mail.guide.step2.description", "mail", "2단계 설명", "보안 설정을 위해 Google 계정 관리 페이지로 이동합니다");
        createTranslationKeyIfNotExists("mail.guide.step3.title", "mail", "3단계 제목", "2단계 인증 활성화");
        createTranslationKeyIfNotExists("mail.guide.step3.description", "mail", "3단계 설명", "앱 비밀번호 생성을 위해 2단계 인증을 활성화합니다");
        createTranslationKeyIfNotExists("mail.guide.step4.title", "mail", "4단계 제목", "앱 비밀번호 생성");
        createTranslationKeyIfNotExists("mail.guide.step4.description", "mail", "4단계 설명", "TestCase Manager용 앱 비밀번호를 생성합니다");
        createTranslationKeyIfNotExists("mail.guide.step5.title", "mail", "5단계 제목", "TestCase Manager에 설정");
        createTranslationKeyIfNotExists("mail.guide.step5.description", "mail", "5단계 설명", "생성한 정보를 TestCase Manager에 입력합니다");

        // 성공/오류 메시지
        createTranslationKeyIfNotExists("mail.message.saveSuccess", "mail", "저장 성공", "메일 설정이 성공적으로 저장되었습니다.");
        createTranslationKeyIfNotExists("mail.message.saveError", "mail", "저장 실패", "메일 설정 저장에 실패했습니다.");
        createTranslationKeyIfNotExists("mail.message.loadError", "mail", "로드 실패", "메일 설정을 불러오는데 실패했습니다.");
        createTranslationKeyIfNotExists("mail.message.testSuccess", "mail", "테스트 성공", "테스트 메일이 {email}로 발송되었습니다.");
        createTranslationKeyIfNotExists("mail.message.testError", "mail", "테스트 실패", "테스트 메일 발송에 실패했습니다.");
        createTranslationKeyIfNotExists("mail.message.disableSuccess", "mail", "비활성화 성공", "메일 기능이 비활성화되었습니다.");
        createTranslationKeyIfNotExists("mail.message.disableError", "mail", "비활성화 실패", "메일 설정 비활성화에 실패했습니다.");
        createTranslationKeyIfNotExists("mail.message.disableConfirm", "mail", "비활성화 확인", "정말 메일 기능을 비활성화하시겠습니까?");
        createTranslationKeyIfNotExists("mail.message.testRecipientPrompt", "mail", "테스트 수신자 입력", "테스트 메일을 받을 이메일 주소를 입력하세요:");
        createTranslationKeyIfNotExists("mail.message.setupComplete", "mail", "설정 완료", "모든 설정이 완료되었습니다! 이제 TestCase Manager에서 메일 기능을 사용할 수 있습니다.");

        // 문제 해결 Q&A
        createTranslationKeyIfNotExists("mail.troubleshoot.q1", "mail", "문제 해결 질문 1", "앱 비밀번호를 생성할 수 없어요");
        createTranslationKeyIfNotExists("mail.troubleshoot.a1", "mail", "문제 해결 답변 1", "2단계 인증이 활성화되어 있는지 확인하세요. 2단계 인증 없이는 앱 비밀번호를 생성할 수 없습니다.");
        createTranslationKeyIfNotExists("mail.troubleshoot.q2", "mail", "문제 해결 질문 2", "메일 발송이 실패해요");
        createTranslationKeyIfNotExists("mail.troubleshoot.a2", "mail", "문제 해결 답변 2", "앱 비밀번호를 정확히 입력했는지 확인하세요. 공백 없이 16자리를 모두 입력해야 합니다.");
        createTranslationKeyIfNotExists("mail.troubleshoot.q3", "mail", "문제 해결 질문 3", "일반 비밀번호로 안 되나요?");
        createTranslationKeyIfNotExists("mail.troubleshoot.a3", "mail", "문제 해결 답변 3", "보안상의 이유로 Gmail 계정의 일반 비밀번호는 사용할 수 없습니다. 반드시 앱 비밀번호를 사용해야 합니다.");
        createTranslationKeyIfNotExists("mail.troubleshoot.q4", "mail", "문제 해결 질문 4", "G Suite 계정도 사용할 수 있나요?");
        createTranslationKeyIfNotExists("mail.troubleshoot.a4", "mail", "문제 해결 답변 4", "G Suite/Google Workspace 계정은 관리자 설정에 따라 다를 수 있습니다. 관리자에게 SMTP 사용 권한을 확인하세요.");

        // 보안 주의사항
        createTranslationKeyIfNotExists("mail.security.warning1", "mail", "보안 경고 1", "앱 비밀번호는 Gmail 계정 비밀번호와 동일한 권한을 가집니다.");
        createTranslationKeyIfNotExists("mail.security.warning2", "mail", "보안 경고 2", "앱 비밀번호를 다른 사람과 공유하지 마세요.");
        createTranslationKeyIfNotExists("mail.security.warning3", "mail", "보안 경고 3", "필요하지 않은 앱 비밀번호는 정기적으로 삭제하세요.");
        createTranslationKeyIfNotExists("mail.security.warning4", "mail", "보안 경고 4", "의심스러운 활동이 감지되면 즉시 앱 비밀번호를 삭제하세요.");
        createTranslationKeyIfNotExists("mail.security.warning5", "mail", "보안 경고 5", "정기적으로 Google 계정의 보안 활동을 검토하세요.");

        // 단계별 지시사항 추가
        createTranslationKeyIfNotExists("mail.guide.step1.instruction1", "mail", "1단계 지시사항 1", "1. 웹 브라우저에서 Gmail(");
        createTranslationKeyIfNotExists("mail.guide.step1.instruction1.suffix", "mail", "1단계 지시사항 1 접미사", ")에 접속합니다.");
        createTranslationKeyIfNotExists("mail.guide.step1.instruction2", "mail", "1단계 지시사항 2", "2. 메일 설정에 사용할 Gmail 계정으로 로그인합니다.");
        createTranslationKeyIfNotExists("mail.guide.step1.alert.title", "mail", "1단계 경고 제목", "주의:");
        createTranslationKeyIfNotExists("mail.guide.step1.alert.message", "mail", "1단계 경고 메시지", "개인 Gmail 계정만 지원됩니다. G Suite/Google Workspace 계정은 추가 설정이 필요할 수 있습니다.");

        // 2단계 상세 지시사항
        createTranslationKeyIfNotExists("mail.guide.step2.instruction1", "mail", "2단계 지시사항 1", "1. Gmail 우상단의 프로필 아이콘을 클릭합니다.");
        createTranslationKeyIfNotExists("mail.guide.step2.instruction2", "mail", "2단계 지시사항 2", "2. \"Google 계정 관리\" 버튼을 클릭합니다.");
        createTranslationKeyIfNotExists("mail.guide.step2.instruction3.prefix", "mail", "2단계 지시사항 3 접두사", "또는 직접 ");
        createTranslationKeyIfNotExists("mail.guide.step2.instruction3.suffix", "mail", "2단계 지시사항 3 접미사", "에 접속하세요.");

        // 3단계 상세 지시사항
        createTranslationKeyIfNotExists("mail.guide.step3.instruction1", "mail", "3단계 지시사항 1", "1. 왼쪽 메뉴에서 \"보안\"을 클릭합니다.");
        createTranslationKeyIfNotExists("mail.guide.step3.instruction2", "mail", "3단계 지시사항 2", "2. \"2단계 인증\" 섹션을 찾아 \"시작하기\"를 클릭합니다.");
        createTranslationKeyIfNotExists("mail.guide.step3.instruction3", "mail", "3단계 지시사항 3", "3. 안내에 따라 휴대폰 번호를 등록하고 인증을 완료합니다.");
        createTranslationKeyIfNotExists("mail.guide.step3.alert.title", "mail", "3단계 경고 제목", "필수 단계:");
        createTranslationKeyIfNotExists("mail.guide.step3.alert.message", "mail", "3단계 경고 메시지", "2단계 인증이 활성화되어야 앱 비밀번호를 생성할 수 있습니다.");

        // 4단계 상세 지시사항
        createTranslationKeyIfNotExists("mail.guide.step4.instruction1", "mail", "4단계 지시사항 1", "1. \"보안\" 페이지에서 \"앱 비밀번호\"를 클릭합니다.");
        createTranslationKeyIfNotExists("mail.guide.step4.instruction2", "mail", "4단계 지시사항 2", "2. \"앱 선택\" 드롭다운에서 \"메일\"을 선택합니다.");
        createTranslationKeyIfNotExists("mail.guide.step4.instruction3", "mail", "4단계 지시사항 3", "3. \"기기 선택\" 드롭다운에서 \"기타(맞춤 이름)\"을 선택합니다.");
        createTranslationKeyIfNotExists("mail.guide.step4.instruction4", "mail", "4단계 지시사항 4", "4. \"TestCase Manager\" 라고 입력하고 \"생성\"을 클릭합니다.");
        createTranslationKeyIfNotExists("mail.guide.step4.instruction5", "mail", "4단계 지시사항 5", "5. 생성된 16자리 비밀번호를 복사합니다.");
        createTranslationKeyIfNotExists("mail.guide.step4.alert.title", "mail", "4단계 경고 제목", "중요:");
        createTranslationKeyIfNotExists("mail.guide.step4.alert.message", "mail", "4단계 경고 메시지", "생성된 앱 비밀번호는 한 번만 표시됩니다. 안전한 곳에 보관하세요.");

        // 5단계 상세 지시사항
        createTranslationKeyIfNotExists("mail.guide.step5.instruction1", "mail", "5단계 지시사항 1", "1. 메일 설정 다이얼로그에서 다음 정보를 입력합니다:");
        createTranslationKeyIfNotExists("mail.guide.step5.instruction2", "mail", "5단계 지시사항 2", "2. \"저장\" 버튼을 클릭하여 설정을 완료합니다.");
        createTranslationKeyIfNotExists("mail.guide.step5.instruction3", "mail", "5단계 지시사항 3", "3. \"테스트 발송\" 버튼으로 설정이 올바른지 확인합니다.");
        createTranslationKeyIfNotExists("mail.guide.step5.gmail.address", "mail", "5단계 Gmail 주소", "Gmail 주소: your-email@gmail.com");
        createTranslationKeyIfNotExists("mail.guide.step5.app.password", "mail", "5단계 앱 비밀번호", "앱 비밀번호: 16자리 생성된 비밀번호");
        createTranslationKeyIfNotExists("mail.guide.step5.sender.name", "mail", "5단계 발신자 이름", "발신자 이름: TestCase Manager (또는 원하는 이름)");

        // 필수 요구사항 목록
        createTranslationKeyIfNotExists("mail.guide.requirements.header", "mail", "필수 요구사항 헤더", "📋 필수 요구사항");
        createTranslationKeyIfNotExists("mail.guide.requirements.gmail", "mail", "Gmail 계정 요구사항", "Gmail 계정 (@gmail.com)");
        createTranslationKeyIfNotExists("mail.guide.requirements.twoFactor", "mail", "2단계 인증 요구사항", "2단계 인증 활성화");
        createTranslationKeyIfNotExists("mail.guide.requirements.appPassword", "mail", "앱 비밀번호 요구사항", "앱 비밀번호 생성");
        createTranslationKeyIfNotExists("mail.guide.requirements.https", "mail", "HTTPS 요구사항", "HTTPS 연결");

        // 섹션 제목들
        createTranslationKeyIfNotExists("mail.guide.sections.stepGuide", "mail", "단계별 설정 섹션", "🔧 단계별 설정 방법");
        createTranslationKeyIfNotExists("mail.guide.sections.troubleshooting", "mail", "문제 해결 섹션", "🔍 문제 해결");
        createTranslationKeyIfNotExists("mail.guide.sections.security", "mail", "보안 주의사항 섹션", "🔒 보안 주의사항");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description, String defaultValue) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
        if (existingKey.isEmpty()) {
            TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
            translationKeyRepository.save(translationKey);
            log.debug("번역 키 생성: {}", keyName);
        } else {
            log.debug("번역 키 이미 존재: {}", keyName);
        }
    }
}