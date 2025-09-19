// src/main/java/com/testcase/testcasemanagement/config/I18nDataInitializer.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@Order(10) // 다른 초기화 후에 실행
@RequiredArgsConstructor
public class I18nDataInitializer implements CommandLineRunner {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== 다국어 지원 데이터 초기화 시작 ===");

        initializeLanguages();
        initializeTranslationKeys();
        initializeTranslations();

        log.info("=== 다국어 지원 데이터 초기화 완료 ===");
    }

    private void initializeLanguages() {
        log.info("기본 언어 데이터 초기화 중...");

        // 한국어 (기본 언어)
        createLanguageIfNotExists("ko", "Korean", "한국어", true, 1);

        // 영어
        createLanguageIfNotExists("en", "English", "English", false, 2);

        // 불필요한 언어들 삭제
        deleteLanguageIfExists("ja");
        deleteLanguageIfExists("zh");

        log.info("언어 데이터 초기화 완료");
    }

    private void createLanguageIfNotExists(String code, String name, String nativeName, boolean isDefault, int sortOrder) {
        Optional<Language> existingLanguage = languageRepository.findByCode(code);
        if (existingLanguage.isEmpty()) {
            Language language = new Language(code, name, nativeName, isDefault, sortOrder);
            languageRepository.save(language);
            log.info("언어 생성: {} ({})", name, code);
        } else {
            log.debug("언어 이미 존재: {} ({})", name, code);
        }
    }

    private void deleteLanguageIfExists(String code) {
        Optional<Language> existingLanguage = languageRepository.findByCode(code);
        if (existingLanguage.isPresent()) {
            Language language = existingLanguage.get();

            // 해당 언어의 모든 번역 데이터 먼저 삭제
            List<Translation> translations = translationRepository.findByLanguage(language);
            if (!translations.isEmpty()) {
                translationRepository.deleteAll(translations);
                log.info("언어 {} 관련 번역 데이터 {} 개 삭제됨", code, translations.size());
            }

            // 언어 삭제
            languageRepository.delete(language);
            log.info("언어 완전 삭제: {} ({})", language.getName(), code);
        }
    }

    private void initializeTranslationKeys() {
        log.info("번역 키 데이터 초기화 중...");

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

        // 검증 메시지 추가
        createTranslationKeyIfNotExists("validation.required.all", "validation", "모든 필드 필수 입력", "모든 필드를 입력해주세요.");
        createTranslationKeyIfNotExists("validation.password.mismatch", "validation", "비밀번호 불일치", "비밀번호가 일치하지 않습니다.");

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

        // 언어 선택 키들
        createTranslationKeyIfNotExists("language.select", "language", "언어 선택 라벨", "언어 선택");
        createTranslationKeyIfNotExists("language.korean", "language", "한국어", "한국어");
        createTranslationKeyIfNotExists("language.english", "language", "영어", "English");
        createTranslationKeyIfNotExists("language.japanese", "language", "일본어", "日本語");
        createTranslationKeyIfNotExists("language.chinese", "language", "중국어", "中文");

        // 프로젝트 관리 페이지 키들
        createTranslationKeyIfNotExists("project.title", "project", "프로젝트 관리 페이지 제목", "프로젝트 관리");
        createTranslationKeyIfNotExists("project.buttons.createNew", "project", "새 프로젝트 생성 버튼", "새 프로젝트 생성");
        createTranslationKeyIfNotExists("project.tabs.byOrganization", "project", "조직별 프로젝트 탭", "조직별 프로젝트");
        createTranslationKeyIfNotExists("project.tabs.independent", "project", "독립 프로젝트 탭", "독립 프로젝트");
        createTranslationKeyIfNotExists("project.tabs.all", "project", "전체 프로젝트 탭", "전체 프로젝트");
        createTranslationKeyIfNotExists("project.types.independent", "project", "독립 프로젝트 타입", "독립 프로젝트");
        createTranslationKeyIfNotExists("project.buttons.open", "project", "프로젝트 열기 버튼", "프로젝트 열기");
        createTranslationKeyIfNotExists("project.buttons.edit", "project", "프로젝트 편집 버튼", "편집");
        createTranslationKeyIfNotExists("project.buttons.transfer", "project", "프로젝트 이전 버튼", "이전");
        createTranslationKeyIfNotExists("project.buttons.delete", "project", "프로젝트 삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("project.buttons.forceDelete", "project", "강제 삭제 버튼", "강제 삭제");
        createTranslationKeyIfNotExists("project.tooltips.testCaseCount", "project", "테스트케이스 수 툴팁", "테스트케이스 수");
        createTranslationKeyIfNotExists("project.tooltips.memberCount", "project", "멤버 수 툴팁", "멤버 수");
        createTranslationKeyIfNotExists("project.tooltips.junitStatus", "project", "자동화 테스트 현황 툴팁", "자동화 테스트 현황");
        createTranslationKeyIfNotExists("project.stats.projectCount", "project", "프로젝트 수 통계", "{count}개 프로젝트");
        createTranslationKeyIfNotExists("project.messages.noOrganizationProjects", "project", "조직별 프로젝트 없음 메시지", "조직별 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.addOrganizationProjectsHint", "project", "조직 프로젝트 추가 힌트", "조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.messages.noProjectsInOrganization", "project", "조직 내 프로젝트 없음", "이 조직에는 아직 프로젝트가 없습니다.");
        createTranslationKeyIfNotExists("project.messages.noIndependentProjects", "project", "독립 프로젝트 없음", "독립 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.addIndependentProjectsHint", "project", "독립 프로젝트 추가 힌트", "독립 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.messages.noAllProjects", "project", "전체 프로젝트 없음", "등록된 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.addFirstProjectHint", "project", "첫 프로젝트 생성 힌트", "첫 번째 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.form.nameRequired", "project", "프로젝트 이름 필수 입력", "프로젝트 이름을 입력해주세요.");
        createTranslationKeyIfNotExists("project.dialog.create.title", "project", "프로젝트 생성 다이얼로그 제목", "새 프로젝트 생성");
        createTranslationKeyIfNotExists("project.dialog.edit.title", "project", "프로젝트 편집 다이얼로그 제목", "프로젝트 편집");
        createTranslationKeyIfNotExists("project.dialog.transfer.title", "project", "프로젝트 이전 다이얼로그 제목", "프로젝트 이전");
        createTranslationKeyIfNotExists("project.dialog.delete.title", "project", "프로젝트 삭제 다이얼로그 제목", "프로젝트 삭제 확인");

        // 추가 프로젝트 관련 키들
        createTranslationKeyIfNotExists("project.form.codeRequired", "project", "프로젝트 코드 필수 입력", "프로젝트 코드를 입력해주세요.");
        createTranslationKeyIfNotExists("project.tooltips.automationTestCount", "project", "자동화 테스트 결과 수 툴팁", "자동화 테스트 결과 수");
        createTranslationKeyIfNotExists("project.buttons.openProject", "project", "프로젝트 열기 버튼", "프로젝트 열기");
        createTranslationKeyIfNotExists("project.buttons.addProject", "project", "프로젝트 추가 버튼", "프로젝트 추가");
        createTranslationKeyIfNotExists("project.buttons.createIndependent", "project", "독립 프로젝트 생성 버튼", "독립 프로젝트 생성");
        createTranslationKeyIfNotExists("project.buttons.createFirstIndependent", "project", "첫 번째 독립 프로젝트 생성 버튼", "첫 번째 독립 프로젝트 생성");
        createTranslationKeyIfNotExists("project.buttons.createProject", "project", "프로젝트 생성 버튼", "프로젝트 생성");
        createTranslationKeyIfNotExists("project.stats.totalProjectCount", "project", "총 프로젝트 수 통계", "총 {count}개 프로젝트");
        createTranslationKeyIfNotExists("project.messages.createIndependentProjectHint", "project", "독립 프로젝트 생성 힌트", "조직에 속하지 않는 개인 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.messages.noParticipatingProjects", "project", "참여 중인 프로젝트 없음", "참여 중인 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.needInvitation", "project", "프로젝트 초대 필요", "프로젝트가 없는 사용자는 프로젝트에 초대가 되어야 이용이 가능합니다.");
        createTranslationKeyIfNotExists("project.messages.requestInvitation", "project", "프로젝트 초대 요청", "시스템관리자에게 프로젝트 초대를 요청하세요.");
        createTranslationKeyIfNotExists("project.menu.transfer", "project", "조직 이전 메뉴", "조직 이전");
        createTranslationKeyIfNotExists("project.menu.forceDelete", "project", "강제 삭제 메뉴", "강제 삭제");
        createTranslationKeyIfNotExists("project.dialog.editTitle", "project", "프로젝트 편집 다이얼로그 제목", "프로젝트 수정");
        createTranslationKeyIfNotExists("project.dialog.createTitle", "project", "프로젝트 생성 다이얼로그 제목", "새 프로젝트 생성");
        createTranslationKeyIfNotExists("project.form.name", "project", "프로젝트 이름 폼", "프로젝트 이름");
        createTranslationKeyIfNotExists("project.form.code", "project", "프로젝트 코드 폼", "프로젝트 코드");
        createTranslationKeyIfNotExists("project.form.codePlaceholder", "project", "프로젝트 코드 플레이스홀더", "예: PROJ001");
        createTranslationKeyIfNotExists("project.form.organization", "project", "소속 조직 폼", "소속 조직");
        createTranslationKeyIfNotExists("project.form.noOrganization", "project", "조직 없음 옵션", "독립 프로젝트 (조직 없음)");
        createTranslationKeyIfNotExists("project.form.description", "project", "설명 폼", "설명");
        createTranslationKeyIfNotExists("project.form.descriptionPlaceholder", "project", "설명 플레이스홀더", "프로젝트에 대한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("project.dialog.transferTitle", "project", "프로젝트 이전 다이얼로그 제목", "프로젝트 조직 이전");
        createTranslationKeyIfNotExists("project.form.targetOrganization", "project", "대상 조직 폼", "대상 조직");
        createTranslationKeyIfNotExists("project.form.convertToIndependent", "project", "독립 프로젝트 전환 옵션", "독립 프로젝트로 전환");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteTitle", "project", "강제 삭제 다이얼로그 제목", "프로젝트 강제 삭제 확인");
        createTranslationKeyIfNotExists("project.dialog.deleteTitle", "project", "삭제 다이얼로그 제목", "프로젝트 삭제 확인");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteWarningTitle", "project", "강제 삭제 경고 제목", "⚠️ 강제 삭제 경고");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteWarningMessage", "project", "강제 삭제 경고 메시지", "연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.");
        createTranslationKeyIfNotExists("project.dialog.deleteWarningMessage", "project", "삭제 경고 메시지", "이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.");

        // 공통 키들
        createTranslationKeyIfNotExists("common.changeLanguage", "common", "언어 변경 툴팁", "언어 변경");
        createTranslationKeyIfNotExists("common.buttons.delete", "common", "공통 삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("common.buttons.cancel", "common", "공통 취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.buttons.save", "common", "공통 저장 버튼", "저장");
        createTranslationKeyIfNotExists("common.buttons.create", "common", "공통 생성 버튼", "생성");
        createTranslationKeyIfNotExists("common.buttons.edit", "common", "공통 수정 버튼", "수정");
        createTranslationKeyIfNotExists("common.buttons.update", "common", "공통 업데이트 버튼", "수정");

        log.info("번역 키 데이터 초기화 완료");
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

    private void initializeTranslations() {
        log.info("기본 번역 데이터 초기화 중...");

        // 한국어 번역 (기본 언어)
        initializeKoreanTranslations();

        // 영어 번역
        initializeEnglishTranslations();

        log.info("번역 데이터 초기화 완료");
    }

    private void initializeKoreanTranslations() {
        String languageCode = "ko";
        String createdBy = "system";

        // 로그인 관련 번역
        createTranslationIfNotExists("login.title", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("login.username", languageCode, "아이디", createdBy);
        createTranslationIfNotExists("login.password", languageCode, "비밀번호", createdBy);
        createTranslationIfNotExists("login.button", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("login.remember", languageCode, "로그인 상태 유지", createdBy);
        createTranslationIfNotExists("login.forgot_password", languageCode, "비밀번호를 잊으셨나요?", createdBy);
        createTranslationIfNotExists("login.error.failed", languageCode, "로그인에 실패했습니다.", createdBy);
        createTranslationIfNotExists("login.error.general", languageCode, "로그인 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("login.back", languageCode, "로그인으로 돌아가기", createdBy);

        // 회원가입 관련 번역
        createTranslationIfNotExists("register.title", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("register.confirm_password", languageCode, "비밀번호 확인", createdBy);
        createTranslationIfNotExists("register.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("register.email", languageCode, "이메일", createdBy);
        createTranslationIfNotExists("register.button", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("register.switch", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("register.success", languageCode, "회원가입이 완료되었습니다. 로그인 해주세요.", createdBy);
        createTranslationIfNotExists("register.error.general", languageCode, "회원가입 중 오류가 발생했습니다.", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required.all", languageCode, "모든 필드를 입력해주세요.", createdBy);
        createTranslationIfNotExists("validation.password.mismatch", languageCode, "비밀번호가 일치하지 않습니다.", createdBy);

        // 버튼 번역
        createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("button.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("button.add", languageCode, "추가", createdBy);
        createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("button.confirm", languageCode, "확인", createdBy);

        // 메시지 번역
        createTranslationIfNotExists("message.success", languageCode, "성공적으로 처리되었습니다.", createdBy);
        createTranslationIfNotExists("message.error", languageCode, "오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("message.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("message.confirm_delete", languageCode, "정말로 삭제하시겠습니까?", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required", languageCode, "필수 입력 항목입니다.", createdBy);
        createTranslationIfNotExists("validation.email", languageCode, "올바른 이메일 형식을 입력하세요.", createdBy);
        createTranslationIfNotExists("validation.min_length", languageCode, "최소 {0}글자 이상 입력하세요.", createdBy);
        createTranslationIfNotExists("validation.max_length", languageCode, "최대 {0}글자까지 입력 가능합니다.", createdBy);

        // 언어 선택 번역
        createTranslationIfNotExists("language.select", languageCode, "언어 선택", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "한국어", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);
        createTranslationIfNotExists("language.japanese", languageCode, "日本語", createdBy);
        createTranslationIfNotExists("language.chinese", languageCode, "中文", createdBy);

        // 프로젝트 관리 페이지 번역
        createTranslationIfNotExists("project.title", languageCode, "프로젝트 관리", createdBy);
        createTranslationIfNotExists("project.buttons.createNew", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "조직별 프로젝트", createdBy);
        createTranslationIfNotExists("project.tabs.independent", languageCode, "독립 프로젝트", createdBy);
        createTranslationIfNotExists("project.tabs.all", languageCode, "전체 프로젝트", createdBy);
        createTranslationIfNotExists("project.types.independent", languageCode, "독립 프로젝트", createdBy);
        createTranslationIfNotExists("project.buttons.open", languageCode, "프로젝트 열기", createdBy);
        createTranslationIfNotExists("project.buttons.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("project.buttons.transfer", languageCode, "이전", createdBy);
        createTranslationIfNotExists("project.buttons.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("project.buttons.forceDelete", languageCode, "강제 삭제", createdBy);
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "테스트케이스 수", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "멤버 수", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "자동화 테스트 현황", createdBy);
        createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count}개 프로젝트", createdBy);
        createTranslationIfNotExists("project.messages.noOrganizationProjects", languageCode, "조직별 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.addOrganizationProjectsHint", languageCode, "조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.messages.noProjectsInOrganization", languageCode, "이 조직에는 아직 프로젝트가 없습니다.", createdBy);
        createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "독립 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.addIndependentProjectsHint", languageCode, "독립 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.messages.noAllProjects", languageCode, "등록된 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.addFirstProjectHint", languageCode, "첫 번째 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.form.nameRequired", languageCode, "프로젝트 이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("project.dialog.create.title", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.dialog.edit.title", languageCode, "프로젝트 편집", createdBy);
        createTranslationIfNotExists("project.dialog.transfer.title", languageCode, "프로젝트 이전", createdBy);
        createTranslationIfNotExists("project.dialog.delete.title", languageCode, "프로젝트 삭제 확인", createdBy);

        // 추가 프로젝트 관련 한국어 번역
        createTranslationIfNotExists("project.form.codeRequired", languageCode, "프로젝트 코드를 입력해주세요.", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "자동화 테스트 결과 수", createdBy);
        createTranslationIfNotExists("project.buttons.openProject", languageCode, "프로젝트 열기", createdBy);
        createTranslationIfNotExists("project.buttons.addProject", languageCode, "프로젝트 추가", createdBy);
        createTranslationIfNotExists("project.buttons.createIndependent", languageCode, "독립 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.buttons.createFirstIndependent", languageCode, "첫 번째 독립 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.buttons.createProject", languageCode, "프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "총 {count}개 프로젝트", createdBy);
        createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode, "조직에 속하지 않는 개인 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode, "참여 중인 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.needInvitation", languageCode, "프로젝트가 없는 사용자는 프로젝트에 초대가 되어야 이용이 가능합니다.", createdBy);
        createTranslationIfNotExists("project.messages.requestInvitation", languageCode, "시스템관리자에게 프로젝트 초대를 요청하세요.", createdBy);
        createTranslationIfNotExists("project.menu.transfer", languageCode, "조직 이전", createdBy);
        createTranslationIfNotExists("project.menu.forceDelete", languageCode, "강제 삭제", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "프로젝트 수정", createdBy);
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "프로젝트 이름", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "프로젝트 코드", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "예: PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "소속 조직", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "독립 프로젝트 (조직 없음)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "프로젝트에 대한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "프로젝트 조직 이전", createdBy);
        createTranslationIfNotExists("project.form.targetOrganization", languageCode, "대상 조직", createdBy);
        createTranslationIfNotExists("project.form.convertToIndependent", languageCode, "독립 프로젝트로 전환", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "프로젝트 강제 삭제 확인", createdBy);
        createTranslationIfNotExists("project.dialog.deleteTitle", languageCode, "프로젝트 삭제 확인", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ 강제 삭제 경고", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode, "연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.", createdBy);
        createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode, "이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.", createdBy);

        // 공통 번역
        createTranslationIfNotExists("common.changeLanguage", languageCode, "언어 변경", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.buttons.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "생성", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "수정", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "수정", createdBy);
    }

    private void initializeEnglishTranslations() {
        String languageCode = "en";
        String createdBy = "system";

        // 로그인 관련 번역
        createTranslationIfNotExists("login.title", languageCode, "Login", createdBy);
        createTranslationIfNotExists("login.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("login.password", languageCode, "Password", createdBy);
        createTranslationIfNotExists("login.button", languageCode, "Login", createdBy);
        createTranslationIfNotExists("login.remember", languageCode, "Remember me", createdBy);
        createTranslationIfNotExists("login.forgot_password", languageCode, "Forgot your password?", createdBy);
        createTranslationIfNotExists("login.error.failed", languageCode, "Login failed.", createdBy);
        createTranslationIfNotExists("login.error.general", languageCode, "An error occurred during login.", createdBy);
        createTranslationIfNotExists("login.back", languageCode, "Back to login", createdBy);

        // 회원가입 관련 번역
        createTranslationIfNotExists("register.title", languageCode, "Sign Up", createdBy);
        createTranslationIfNotExists("register.confirm_password", languageCode, "Confirm Password", createdBy);
        createTranslationIfNotExists("register.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("register.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("register.button", languageCode, "Sign Up", createdBy);
        createTranslationIfNotExists("register.switch", languageCode, "Sign Up", createdBy);
        createTranslationIfNotExists("register.success", languageCode, "Registration completed successfully. Please log in.", createdBy);
        createTranslationIfNotExists("register.error.general", languageCode, "An error occurred during registration.", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required.all", languageCode, "Please fill in all fields.", createdBy);
        createTranslationIfNotExists("validation.password.mismatch", languageCode, "Passwords do not match.", createdBy);

        // 버튼 번역
        createTranslationIfNotExists("button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("button.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("button.add", languageCode, "Add", createdBy);
        createTranslationIfNotExists("button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("button.confirm", languageCode, "Confirm", createdBy);

        // 메시지 번역
        createTranslationIfNotExists("message.success", languageCode, "Successfully processed.", createdBy);
        createTranslationIfNotExists("message.error", languageCode, "An error occurred.", createdBy);
        createTranslationIfNotExists("message.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("message.confirm_delete", languageCode, "Are you sure you want to delete?", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required", languageCode, "This field is required.", createdBy);
        createTranslationIfNotExists("validation.email", languageCode, "Please enter a valid email format.", createdBy);
        createTranslationIfNotExists("validation.min_length", languageCode, "Please enter at least {0} characters.", createdBy);
        createTranslationIfNotExists("validation.max_length", languageCode, "Maximum {0} characters allowed.", createdBy);

        // 언어 선택 번역
        createTranslationIfNotExists("language.select", languageCode, "Select Language", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "한국어", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);
        createTranslationIfNotExists("language.japanese", languageCode, "日本語", createdBy);
        createTranslationIfNotExists("language.chinese", languageCode, "中文", createdBy);

        // 프로젝트 관리 페이지 번역
        createTranslationIfNotExists("project.title", languageCode, "Project Management", createdBy);
        createTranslationIfNotExists("project.buttons.createNew", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "By Organization", createdBy);
        createTranslationIfNotExists("project.tabs.independent", languageCode, "Independent Projects", createdBy);
        createTranslationIfNotExists("project.tabs.all", languageCode, "All Projects", createdBy);
        createTranslationIfNotExists("project.types.independent", languageCode, "Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.open", languageCode, "Open Project", createdBy);
        createTranslationIfNotExists("project.buttons.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("project.buttons.transfer", languageCode, "Transfer", createdBy);
        createTranslationIfNotExists("project.buttons.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("project.buttons.forceDelete", languageCode, "Force Delete", createdBy);
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "Members", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "Automation Status", createdBy);
        createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count} Projects", createdBy);
        createTranslationIfNotExists("project.messages.noOrganizationProjects", languageCode, "No organization projects", createdBy);
        createTranslationIfNotExists("project.messages.addOrganizationProjectsHint", languageCode, "Add projects to organizations or create new organizational projects.", createdBy);
        createTranslationIfNotExists("project.messages.noProjectsInOrganization", languageCode, "This organization has no projects yet.", createdBy);
        createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "No independent projects", createdBy);
        createTranslationIfNotExists("project.messages.addIndependentProjectsHint", languageCode, "Create an independent project.", createdBy);
        createTranslationIfNotExists("project.messages.noAllProjects", languageCode, "No projects registered", createdBy);
        createTranslationIfNotExists("project.messages.addFirstProjectHint", languageCode, "Create your first project.", createdBy);
        createTranslationIfNotExists("project.form.nameRequired", languageCode, "Please enter a project name.", createdBy);
        createTranslationIfNotExists("project.dialog.create.title", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.dialog.edit.title", languageCode, "Edit Project", createdBy);
        createTranslationIfNotExists("project.dialog.transfer.title", languageCode, "Transfer Project", createdBy);
        createTranslationIfNotExists("project.dialog.delete.title", languageCode, "Confirm Project Deletion", createdBy);

        // 추가 프로젝트 관련 영어 번역
        createTranslationIfNotExists("project.form.codeRequired", languageCode, "Please enter a project code.", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "Automation Test Results", createdBy);
        createTranslationIfNotExists("project.buttons.openProject", languageCode, "Open Project", createdBy);
        createTranslationIfNotExists("project.buttons.addProject", languageCode, "Add Project", createdBy);
        createTranslationIfNotExists("project.buttons.createIndependent", languageCode, "Create Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.createFirstIndependent", languageCode, "Create First Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.createProject", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "Total {count} Projects", createdBy);
        createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode, "Create personal projects that don't belong to any organization.", createdBy);
        createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode, "No participating projects", createdBy);
        createTranslationIfNotExists("project.messages.needInvitation", languageCode, "Users without projects need to be invited to projects to use the system.", createdBy);
        createTranslationIfNotExists("project.messages.requestInvitation", languageCode, "Please request project invitation from the system administrator.", createdBy);
        createTranslationIfNotExists("project.menu.transfer", languageCode, "Transfer Organization", createdBy);
        createTranslationIfNotExists("project.menu.forceDelete", languageCode, "Force Delete", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "Edit Project", createdBy);
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "Project Code", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "e.g., PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "Organization", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "Independent Project (No Organization)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "Enter project description...", createdBy);
        createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "Transfer Project Organization", createdBy);
        createTranslationIfNotExists("project.form.targetOrganization", languageCode, "Target Organization", createdBy);
        createTranslationIfNotExists("project.form.convertToIndependent", languageCode, "Convert to Independent Project", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "Confirm Force Delete Project", createdBy);
        createTranslationIfNotExists("project.dialog.deleteTitle", languageCode, "Confirm Project Deletion", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ Force Delete Warning", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode, "All connected test plans, test cases, and execution history will be deleted together! This action cannot be undone.", createdBy);
        createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode, "This action cannot be undone. All test cases and data belonging to the project will also be deleted.", createdBy);

        // 공통 번역
        createTranslationIfNotExists("common.changeLanguage", languageCode, "Change Language", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.buttons.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "Update", createdBy);
    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<Translation> existingTranslation = translationRepository.findByKeyNameAndLanguageCode(keyName, languageCode);
        if (existingTranslation.isEmpty()) {
            Optional<TranslationKey> translationKey = translationKeyRepository.findByKeyName(keyName);
            Optional<Language> language = languageRepository.findByCode(languageCode);

            if (translationKey.isPresent() && language.isPresent()) {
                Translation translation = new Translation(translationKey.get(), language.get(), value, createdBy);
                translationRepository.save(translation);
                log.debug("번역 생성: {} - {} = {}", keyName, languageCode, value);
            } else {
                log.warn("번역 생성 실패 - 키 또는 언어 없음: {} - {}", keyName, languageCode);
            }
        } else {
            log.debug("번역 이미 존재: {} - {}", keyName, languageCode);
        }
    }
}