// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/AuthKeysInitializer.java
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
public class AuthKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 로그인 관련 키들
        createTranslationKeyIfNotExists("login.title", "login", "로그인 페이지 제목", "로그인");
        createTranslationKeyIfNotExists("login.username", "login", "사용자명 입력 라벨", "아이디");
        createTranslationKeyIfNotExists("login.password", "login", "비밀번호 입력 라벨", "비밀번호");
        createTranslationKeyIfNotExists("login.button", "login", "로그인 버튼 텍스트", "로그인");
        createTranslationKeyIfNotExists("login.remember", "login", "로그인 상태 유지 체크박스", "로그인 상태 유지");
        createTranslationKeyIfNotExists("login.forgot_password", "login", "비밀번호 찾기 링크", "비밀번호를 잊으셨나요?");
        createTranslationKeyIfNotExists("login.error.failed", "login", "로그인 실패 메시지", "로그인에 실패했습니다.");
        createTranslationKeyIfNotExists("login.error.general", "login", "로그인 일반 오류", "로그인 중 오류가 발생했습니다.");
        createTranslationKeyIfNotExists("login.back", "login", "로그인으로 돌아가기", "로그인으로 돌아가기");

        // 회원가입 관련 키들
        createTranslationKeyIfNotExists("register.title", "register", "회원가입 페이지 제목", "회원가입");
        createTranslationKeyIfNotExists("register.confirm_password", "register", "비밀번호 확인 라벨", "비밀번호 확인");
        createTranslationKeyIfNotExists("register.name", "register", "이름 입력 라벨", "이름");
        createTranslationKeyIfNotExists("register.email", "register", "이메일 입력 라벨", "이메일");
        createTranslationKeyIfNotExists("register.button", "register", "회원가입 버튼", "회원가입");
        createTranslationKeyIfNotExists("register.switch", "register", "회원가입 전환 버튼", "회원가입");
        createTranslationKeyIfNotExists("register.success", "register", "회원가입 성공 메시지", "회원가입이 완료되었습니다. 로그인 해주세요.");
        createTranslationKeyIfNotExists("register.error.general", "register", "회원가입 일반 오류", "회원가입 중 오류가 발생했습니다.");

        // 사용자 프로필 관리 관련 키들
        createTranslationKeyIfNotExists("profile.title", "profile", "사용자 프로필 다이얼로그 제목", "사용자 프로필");
        createTranslationKeyIfNotExists("profile.tabs.basicInfo", "profile", "기본 정보 탭", "기본 정보");
        createTranslationKeyIfNotExists("profile.tabs.password", "profile", "비밀번호 탭", "비밀번호");
        createTranslationKeyIfNotExists("profile.tabs.language", "profile", "언어 설정 탭", "언어 설정");
        createTranslationKeyIfNotExists("profile.tabs.jira", "profile", "JIRA 설정 탭", "JIRA 설정");

        // 기본 정보 관련
        createTranslationKeyIfNotExists("profile.form.name", "profile", "이름 입력 라벨", "이름");
        createTranslationKeyIfNotExists("profile.form.email", "profile", "이메일 입력 라벨", "이메일");
        createTranslationKeyIfNotExists("profile.validation.nameRequired", "profile", "이름 필수 입력", "이름을 입력하세요.");
        createTranslationKeyIfNotExists("profile.validation.emailRequired", "profile", "이메일 필수 입력", "이메일을 입력하세요.");
        createTranslationKeyIfNotExists("profile.validation.allRequired", "profile", "모든 필드 필수", "이름과 이메일을 모두 입력하세요.");
        createTranslationKeyIfNotExists("profile.success.updated", "profile", "정보 업데이트 성공", "정보가 성공적으로 변경되었습니다.");
        createTranslationKeyIfNotExists("profile.error.updateFailed", "profile", "정보 업데이트 실패", "정보 변경에 실패했습니다.");

        // 비밀번호 변경 관련
        createTranslationKeyIfNotExists("password.change.title", "password", "비밀번호 변경 제목", "비밀번호 변경");
        createTranslationKeyIfNotExists("password.change.description", "password", "비밀번호 변경 설명",
                "보안을 위해 정기적으로 비밀번호를 변경해주세요.");
        createTranslationKeyIfNotExists("password.form.current", "password", "현재 비밀번호 라벨", "현재 비밀번호");
        createTranslationKeyIfNotExists("password.form.new", "password", "새 비밀번호 라벨", "새 비밀번호");
        createTranslationKeyIfNotExists("password.form.confirm", "password", "새 비밀번호 확인 라벨", "새 비밀번호 확인");
        createTranslationKeyIfNotExists("password.button.change", "password", "비밀번호 변경 버튼", "비밀번호 변경");
        createTranslationKeyIfNotExists("password.button.changing", "password", "비밀번호 변경 중 버튼", "변경 중...");

        // 비밀번호 검증 관련
        createTranslationKeyIfNotExists("password.validation.currentRequired", "password", "현재 비밀번호 필수",
                "현재 비밀번호를 입력해주세요");
        createTranslationKeyIfNotExists("password.validation.newRequired", "password", "새 비밀번호 필수", "새 비밀번호를 입력해주세요");
        createTranslationKeyIfNotExists("password.validation.confirmRequired", "password", "비밀번호 확인 필수",
                "비밀번호 확인을 입력해주세요");
        createTranslationKeyIfNotExists("password.validation.mismatch", "password", "비밀번호 불일치", "새 비밀번호와 일치하지 않습니다");
        createTranslationKeyIfNotExists("password.validation.sameAsCurrent", "password", "동일한 비밀번호",
                "새 비밀번호는 현재 비밀번호와 달라야 합니다");
        createTranslationKeyIfNotExists("password.validation.minLength", "password", "최소 길이", "최소 8자 이상이어야 합니다");
        createTranslationKeyIfNotExists("password.validation.maxLength", "password", "최대 길이", "최대 100자까지 입력 가능합니다");
        createTranslationKeyIfNotExists("password.validation.complexity", "password", "복잡도 요구사항",
                "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다");

        // 비밀번호 요구사항 표시
        createTranslationKeyIfNotExists("password.requirements.title", "password", "비밀번호 요구사항 제목", "비밀번호 요구사항:");
        createTranslationKeyIfNotExists("password.requirements.length", "password", "길이 요구사항", "8-100자 길이");
        createTranslationKeyIfNotExists("password.requirements.letter", "password", "영문 포함", "영문 포함");
        createTranslationKeyIfNotExists("password.requirements.digit", "password", "숫자 포함", "숫자 포함");
        createTranslationKeyIfNotExists("password.requirements.special", "password", "특수문자 포함", "특수문자 포함");
        createTranslationKeyIfNotExists("password.requirements.combination", "password", "조합 요구사항", "2가지 이상 조합");
        createTranslationKeyIfNotExists("password.success.changed", "password", "비밀번호 변경 성공", "비밀번호가 성공적으로 변경되었습니다.");
        createTranslationKeyIfNotExists("password.error.changeFailed", "password", "비밀번호 변경 실패",
                "비밀번호 변경 중 오류가 발생했습니다.");
        // 세션 만료 관련 키들
        createTranslationKeyIfNotExists("auth.session.expired.title", "session", "세션 만료 제목", "세션 만료");
        createTranslationKeyIfNotExists("auth.session.expired.message", "session", "세션 만료 메시지",
                "세션이 종료되었거나 접근 권한이 없습니다.");
        createTranslationKeyIfNotExists("auth.session.expired.cause", "session", "세션 만료 원인",
                "장시간 미사용으로 인해 자동 로그아웃되었을 수 있습니다.");
        createTranslationKeyIfNotExists("auth.session.button.refresh", "session", "새로고침 버튼", "페이지 새로고침");
        createTranslationKeyIfNotExists("auth.session.button.login", "session", "로그인 이동 버튼", "로그인 페이지로 이동");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description,
            String defaultValue) {
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
