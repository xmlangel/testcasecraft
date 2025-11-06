// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/JiraIntegrationKeysInitializer.java
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
public class JiraIntegrationKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        log.info("JIRA 연동 관련 번역 키 초기화 시작");

        // JIRA 상태 키들
        createTranslationKeyIfNotExists("jira.status.connectionStatus", "jira", "JIRA 연결 상태", "연결 상태");
        createTranslationKeyIfNotExists("jira.status.notConfigured", "jira", "JIRA 미설정 상태", "설정되지 않음");
        createTranslationKeyIfNotExists("jira.status.connected", "jira", "JIRA 연결됨", "연결됨");
        createTranslationKeyIfNotExists("jira.status.disconnected", "jira", "JIRA 연결 안됨", "연결 안됨");

        // JIRA 메시지 키들
        createTranslationKeyIfNotExists("jira.messages.noConfig", "jira", "JIRA 설정 없음 메시지", "JIRA 서버가 설정되지 않았습니다.");
        createTranslationKeyIfNotExists("jira.messages.connectionError", "jira", "JIRA 연결 오류", "JIRA 연결에 실패했습니다");
        createTranslationKeyIfNotExists("jira.messages.syncSuccess", "jira", "JIRA 동기화 성공", "JIRA와 성공적으로 동기화되었습니다");
        createTranslationKeyIfNotExists("jira.messages.syncError", "jira", "JIRA 동기화 오류", "JIRA 동기화에 실패했습니다");

        // JiraStatusIndicator 컴포넌트 관련
        createTranslationKeyIfNotExists("jira.indicator.checkingStatus", "jira", "JIRA 상태 확인 중", "확인 중...");
        createTranslationKeyIfNotExists("jira.indicator.unknown", "jira", "알 수 없는 상태", "알 수 없음");
        createTranslationKeyIfNotExists("jira.indicator.connectionFailed", "jira", "연결 실패", "연결 실패");
        createTranslationKeyIfNotExists("jira.indicator.setupRequired", "jira", "설정 필요 메시지", "JIRA와 연동하려면 먼저 설정을 완료해주세요.");
        createTranslationKeyIfNotExists("jira.indicator.setupButton", "jira", "JIRA 설정 버튼", "JIRA 설정하기");
        createTranslationKeyIfNotExists("jira.indicator.settingsButton", "jira", "설정 버튼", "설정");
        createTranslationKeyIfNotExists("jira.indicator.refreshTooltip", "jira", "새로고침 툴팁", "상태 새로고침");
        createTranslationKeyIfNotExists("jira.indicator.settingsTooltip", "jira", "설정 툴팁", "JIRA 설정");
        createTranslationKeyIfNotExists("jira.indicator.connectionInfo", "jira", "연결 정보", "연결 정보");
        createTranslationKeyIfNotExists("jira.indicator.server", "jira", "서버 라벨", "서버");
        createTranslationKeyIfNotExists("jira.indicator.user", "jira", "사용자 라벨", "사용자");
        createTranslationKeyIfNotExists("jira.indicator.lastTested", "jira", "마지막 테스트", "마지막 테스트");
        createTranslationKeyIfNotExists("jira.indicator.lastUpdate", "jira", "마지막 업데이트", "마지막 업데이트");
        createTranslationKeyIfNotExists("jira.indicator.error", "jira", "오류 라벨", "오류");
        createTranslationKeyIfNotExists("jira.indicator.connectedMessage", "jira", "연결 성공 메시지", "JIRA 서버와 정상적으로 연결되었습니다.");
        createTranslationKeyIfNotExists("jira.indicator.connectionFailedMessage", "jira", "연결 실패 메시지", "JIRA 서버 연결에 실패했습니다.");

        // JiraConfigDialog 컴포넌트 관련
        createTranslationKeyIfNotExists("jira.config.dialogTitle.add", "jira", "JIRA 설정 추가 제목", "JIRA 설정 추가");
        createTranslationKeyIfNotExists("jira.config.dialogTitle.edit", "jira", "JIRA 설정 수정 제목", "JIRA 설정 수정");
        createTranslationKeyIfNotExists("jira.config.serverUrl", "jira", "서버 URL 라벨", "JIRA 서버 URL");
        createTranslationKeyIfNotExists("jira.config.serverUrlPlaceholder", "jira", "서버 URL 플레이스홀더", "https://your-domain.atlassian.net");
        createTranslationKeyIfNotExists("jira.config.serverUrlHelper", "jira", "서버 URL 도움말", "JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)");
        createTranslationKeyIfNotExists("jira.config.username", "jira", "사용자명 라벨", "사용자명 (이메일)");
        createTranslationKeyIfNotExists("jira.config.usernamePlaceholder", "jira", "사용자명 플레이스홀더", "user@company.com");
        createTranslationKeyIfNotExists("jira.config.usernameHelper", "jira", "사용자명 도움말", "JIRA 로그인에 사용하는 이메일 주소");
        createTranslationKeyIfNotExists("jira.config.apiToken", "jira", "API 토큰 라벨", "API 토큰");
        createTranslationKeyIfNotExists("jira.config.apiTokenHelper", "jira", "API 토큰 도움말", "JIRA API 토큰을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.testProjectKey", "jira", "테스트 프로젝트 키 라벨", "테스트 프로젝트 키 (선택사항)");
        createTranslationKeyIfNotExists("jira.config.testProjectKeyPlaceholder", "jira", "테스트 프로젝트 키 플레이스홀더", "TEST");
        createTranslationKeyIfNotExists("jira.config.testProjectKeyHelper", "jira", "테스트 프로젝트 키 도움말", "연결 테스트 시 사용할 프로젝트 키 (선택사항)");
        createTranslationKeyIfNotExists("jira.config.autoTest", "jira", "자동 테스트 라벨", "저장 전 자동으로 연결 테스트 수행");
        createTranslationKeyIfNotExists("jira.config.testButton", "jira", "연결 테스트 버튼", "연결 테스트");
        createTranslationKeyIfNotExists("jira.config.testing", "jira", "테스트 중 라벨", "테스트 중...");
        createTranslationKeyIfNotExists("jira.config.testSuccess", "jira", "테스트 성공", "연결 성공");
        createTranslationKeyIfNotExists("jira.config.testFailed", "jira", "테스트 실패", "연결 실패");
        createTranslationKeyIfNotExists("jira.config.jiraVersion", "jira", "JIRA 버전", "JIRA 버전");
        createTranslationKeyIfNotExists("jira.config.testTime", "jira", "테스트 시각", "테스트 시각");
        createTranslationKeyIfNotExists("jira.config.availableProjects", "jira", "사용 가능한 프로젝트", "사용 가능한 프로젝트:");
        createTranslationKeyIfNotExists("jira.config.moreProjects", "jira", "더 많은 프로젝트", "외 {count}개 프로젝트");

        // API 토큰 생성 가이드
        createTranslationKeyIfNotExists("jira.config.apiTokenGuide", "jira", "API 토큰 생성 안내", "API 토큰 생성 방법:");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep1", "jira", "API 토큰 생성 1단계", "1. JIRA → 프로필 → 계정 설정 → 보안");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep2", "jira", "API 토큰 생성 2단계", "2. \"API 토큰 만들기\" 클릭");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep3", "jira", "API 토큰 생성 3단계", "3. 토큰 이름 입력 후 생성");
        createTranslationKeyIfNotExists("jira.config.apiTokenStep4", "jira", "API 토큰 생성 4단계", "4. 생성된 토큰을 복사하여 위에 입력");

        // 설정 다이얼로그 버튼
        createTranslationKeyIfNotExists("jira.config.cancelButton", "jira", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("jira.config.saveButton", "jira", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("jira.config.saving", "jira", "저장 중", "저장 중...");

        // 설정 검증 오류
        createTranslationKeyIfNotExists("jira.config.error.serverUrlRequired", "jira", "서버 URL 필수 오류", "JIRA 서버 URL을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.invalidUrl", "jira", "잘못된 URL 오류", "올바른 URL 형식을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.usernameRequired", "jira", "사용자명 필수 오류", "사용자명을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.apiTokenRequired", "jira", "API 토큰 필수 오류", "API 토큰을 입력하세요");
        createTranslationKeyIfNotExists("jira.config.error.connectionTestFailed", "jira", "연결 테스트 실패 오류", "연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.");
        createTranslationKeyIfNotExists("jira.config.error.testError", "jira", "테스트 중 오류", "연결 테스트 중 오류가 발생했습니다");
        createTranslationKeyIfNotExists("jira.config.confirm.saveWithoutTest", "jira", "테스트 없이 저장 확인", "JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?");

        // API 응답 메시지 번역 키
        createTranslationKeyIfNotExists("jira.api.connectionSuccess", "jira", "API 연결 성공", "JIRA 연결 성공");
        createTranslationKeyIfNotExists("jira.api.authFailure", "jira", "API 인증 실패", "인증 실패 또는 권한 부족");
        createTranslationKeyIfNotExists("jira.api.serverError", "jira", "API 서버 오류", "JIRA 서버 오류");
        createTranslationKeyIfNotExists("jira.api.networkError", "jira", "API 네트워크 오류", "네트워크 연결 실패");
        createTranslationKeyIfNotExists("jira.api.testFailure", "jira", "API 테스트 실패", "연결 테스트 실패");
        createTranslationKeyIfNotExists("jira.api.unknownError", "jira", "API 알 수 없는 오류", "알 수 없는 오류");

        log.info("JIRA 연동 관련 번역 키 초기화 완료");
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
