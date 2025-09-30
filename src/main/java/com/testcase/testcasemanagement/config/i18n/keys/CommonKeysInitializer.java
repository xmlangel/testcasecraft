// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/CommonKeysInitializer.java
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
public class CommonKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 버튼 공통 키들
        createTranslationKeyIfNotExists("button.save", "button", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("button.cancel", "button", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("button.delete", "button", "삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("button.edit", "button", "편집 버튼", "편집");
        createTranslationKeyIfNotExists("button.add", "button", "추가 버튼", "추가");
        createTranslationKeyIfNotExists("button.close", "button", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("button.confirm", "button", "확인 버튼", "확인");

        // 메시지 키들
        createTranslationKeyIfNotExists("message.success", "message", "성공 메시지", "성공적으로 처리되었습니다.");
        createTranslationKeyIfNotExists("message.error", "message", "오류 메시지", "오류가 발생했습니다.");
        createTranslationKeyIfNotExists("message.loading", "message", "로딩 메시지", "로딩 중...");
        createTranslationKeyIfNotExists("message.confirm_delete", "message", "삭제 확인 메시지", "정말로 삭제하시겠습니까?");

        // 검증 메시지 키들
        createTranslationKeyIfNotExists("validation.required", "validation", "필수 입력 검증", "필수 입력 항목입니다.");
        createTranslationKeyIfNotExists("validation.email", "validation", "이메일 형식 검증", "올바른 이메일 형식을 입력하세요.");
        createTranslationKeyIfNotExists("validation.min_length", "validation", "최소 길이 검증", "최소 {0}글자 이상 입력하세요.");
        createTranslationKeyIfNotExists("validation.max_length", "validation", "최대 길이 검증", "최대 {0}글자까지 입력 가능합니다.");
        createTranslationKeyIfNotExists("validation.required.all", "validation", "모든 필드 필수 입력", "모든 필드를 입력해주세요.");
        createTranslationKeyIfNotExists("validation.password.mismatch", "validation", "비밀번호 불일치", "비밀번호가 일치하지 않습니다.");

        // 언어 선택 키들
        createTranslationKeyIfNotExists("language.select", "language", "언어 선택 라벨", "언어 선택");
        createTranslationKeyIfNotExists("language.korean", "language", "한국어", "한국어");
        createTranslationKeyIfNotExists("language.english", "language", "영어", "English");
        createTranslationKeyIfNotExists("language.japanese", "language", "일본어", "日本語");
        createTranslationKeyIfNotExists("language.chinese", "language", "중국어", "中文");
        createTranslationKeyIfNotExists("language.settings.title", "language", "언어 설정 제목", "언어 설정");
        createTranslationKeyIfNotExists("language.settings.description", "language", "언어 설정 설명", "선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.");
        createTranslationKeyIfNotExists("language.interface", "language", "인터페이스 언어 라벨", "인터페이스 언어");
        createTranslationKeyIfNotExists("language.helperText", "language", "언어 변경 도움말", "변경된 언어는 즉시 적용되며 자동으로 저장됩니다.");
        createTranslationKeyIfNotExists("language.current", "language", "현재 언어", "현재 언어:");

        // Header Navigation 전용 키들
        createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 네비게이션", "대시보드");
        createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "조직 관리 네비게이션", "조직 관리");
        createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 네비게이션", "사용자 관리");
        createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 네비게이션", "메일 설정");
        createTranslationKeyIfNotExists("header.nav.translationManagement", "header", "번역 관리 네비게이션", "번역 관리");
        createTranslationKeyIfNotExists("header.nav.projectSelection", "header", "프로젝트 선택 네비게이션", "프로젝트 선택");

        // User Menu 관련
        createTranslationKeyIfNotExists("header.userMenu.profile", "header", "사용자 프로필 메뉴", "프로필");
        createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

        // 공통 메시지들
        createTranslationKeyIfNotExists("common.loading", "common", "로딩 메시지", "로딩 중...");
        createTranslationKeyIfNotExists("common.unauthorized.title", "common", "인증 실패 제목", "접근 권한이 없습니다");
        createTranslationKeyIfNotExists("common.unauthorized.description", "common", "인증 실패 설명", "이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("common.unauthorized.loginButton", "common", "로그인 버튼", "로그인하기");
        createTranslationKeyIfNotExists("common.changeLanguage", "common", "언어 변경 툴팁", "언어 변경");
        createTranslationKeyIfNotExists("common.buttons.delete", "common", "공통 삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("common.buttons.cancel", "common", "공통 취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.buttons.save", "common", "공통 저장 버튼", "저장");
        createTranslationKeyIfNotExists("common.buttons.create", "common", "공통 생성 버튼", "생성");
        createTranslationKeyIfNotExists("common.buttons.edit", "common", "공통 수정 버튼", "수정");
        createTranslationKeyIfNotExists("common.buttons.update", "common", "공통 업데이트 버튼", "수정");

        // 추가 공통 키들
        createTranslationKeyIfNotExists("common.close", "common", "닫기", "닫기");
        createTranslationKeyIfNotExists("common.select", "common", "선택", "선택");
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
