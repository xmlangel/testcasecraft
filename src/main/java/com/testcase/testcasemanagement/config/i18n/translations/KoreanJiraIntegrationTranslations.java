// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanJiraIntegrationTranslations.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 한국어 번역 - JIRA 연동 관련
 * jira.* 관련 번역들
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanJiraIntegrationTranslations {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    public void initialize() {
        String languageCode = "ko";
        String createdBy = "system";

        createTranslationIfNotExists("jira.summary.title", languageCode, "JIRA 상태 요약", createdBy);
        createTranslationIfNotExists("jira.summary.loading", languageCode, "JIRA 상태 정보를 불러오는 중...", createdBy);
        createTranslationIfNotExists("jira.summary.error", languageCode, "JIRA 상태 정보를 불러오는데 실패했습니다: {error}",
                createdBy);
        createTranslationIfNotExists("jira.summary.noData", languageCode, "연결된 JIRA 이슈가 없습니다.", createdBy);
        createTranslationIfNotExists("jira.summary.filterAll", languageCode, "전체", createdBy);
        createTranslationIfNotExists("jira.summary.filterActive", languageCode, "진행중", createdBy);
        createTranslationIfNotExists("jira.summary.filterFailed", languageCode, "실패", createdBy);
        createTranslationIfNotExists("jira.summary.filterPassed", languageCode, "통과", createdBy);
        createTranslationIfNotExists("jira.summary.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("jira.summary.latestTest", languageCode, "최근 테스트:", createdBy);
        createTranslationIfNotExists("jira.summary.executionTime", languageCode, "실행 시간:", createdBy);
        createTranslationIfNotExists("jira.summary.sync", languageCode, "동기화:", createdBy);
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA 연결 상태", createdBy);
        createTranslationIfNotExists("jira.status.notConfigured", languageCode, "JIRA 미설정", createdBy);
        createTranslationIfNotExists("jira.messages.noConfig", languageCode,
                "JIRA 설정이 없습니다. 설정 페이지에서 JIRA 서버 정보를 등록해주세요.", createdBy);
        createTranslationIfNotExists("jira.summary.summaryStats", languageCode, "요약 통계", createdBy);
        createTranslationIfNotExists("jira.summary.totalIssues", languageCode, "전체 이슈", createdBy);
        createTranslationIfNotExists("jira.summary.activeIssues", languageCode, "활성 이슈", createdBy);
        createTranslationIfNotExists("jira.summary.allPassed", languageCode, "전체 통과", createdBy);
        createTranslationIfNotExists("jira.summary.hasFailed", languageCode, "실패 포함", createdBy);
        createTranslationIfNotExists("jira.summary.latestTest", languageCode, "최근 테스트:", createdBy);
        createTranslationIfNotExists("jira.summary.executionTime", languageCode, "실행 시간:", createdBy);
        createTranslationIfNotExists("jira.summary.sync", languageCode, "동기화:", createdBy);
        createTranslationIfNotExists("jira.settings.title", languageCode, "JIRA 통합 설정", createdBy);
        createTranslationIfNotExists("jira.settings.description", languageCode,
                "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.", createdBy);
        createTranslationIfNotExists("jira.button.configure", languageCode, "설정 수정", createdBy);
        createTranslationIfNotExists("jira.button.delete", languageCode, "설정 삭제", createdBy);
        createTranslationIfNotExists("jira.success.saved", languageCode, "JIRA 설정이 저장되었습니다.", createdBy);
        createTranslationIfNotExists("jira.success.deleted", languageCode, "JIRA 설정이 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "JIRA 설정 저장에 실패했습니다.", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "JIRA 설정 삭제 실패", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "네트워크 연결을 확인해주세요.", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "로그인이 만료되었습니다. 다시 로그인해주세요.", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("jira.confirm.delete", languageCode, "JIRA 설정을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("jira.indicator.checkingStatus", languageCode, "확인 중...", createdBy);
        createTranslationIfNotExists("jira.indicator.unknown", languageCode, "알 수 없음", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailed", languageCode, "연결 실패", createdBy);
        createTranslationIfNotExists("jira.indicator.setupRequired", languageCode, "JIRA와 연동하려면 먼저 설정을 완료해주세요.",
                createdBy);
        createTranslationIfNotExists("jira.indicator.setupButton", languageCode, "JIRA 설정하기", createdBy);
        createTranslationIfNotExists("jira.indicator.settingsButton", languageCode, "설정", createdBy);
        createTranslationIfNotExists("jira.indicator.refreshTooltip", languageCode, "상태 새로고침", createdBy);
        createTranslationIfNotExists("jira.indicator.settingsTooltip", languageCode, "JIRA 설정", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionInfo", languageCode, "연결 정보", createdBy);
        createTranslationIfNotExists("jira.indicator.server", languageCode, "서버", createdBy);
        createTranslationIfNotExists("jira.indicator.user", languageCode, "사용자", createdBy);
        createTranslationIfNotExists("jira.indicator.lastTested", languageCode, "마지막 확인", createdBy);
        createTranslationIfNotExists("jira.indicator.lastUpdate", languageCode, "업데이트", createdBy);
        createTranslationIfNotExists("jira.indicator.error", languageCode, "오류", createdBy);
        createTranslationIfNotExists("jira.indicator.connectedMessage", languageCode, "JIRA 서버와 정상적으로 연결되었습니다.",
                createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailedMessage", languageCode, "JIRA 서버 연결에 실패했습니다.",
                createdBy);
        createTranslationIfNotExists("jira.config.dialogTitle.add", languageCode, "JIRA 설정 추가", createdBy);
        createTranslationIfNotExists("jira.config.dialogTitle.edit", languageCode, "JIRA 설정 수정", createdBy);
        createTranslationIfNotExists("jira.config.serverUrl", languageCode, "JIRA 서버 URL", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlPlaceholder", languageCode,
                "https://your-domain.atlassian.net", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlHelper", languageCode,
                "JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)", createdBy);
        createTranslationIfNotExists("jira.config.username", languageCode, "사용자명 (이메일)", createdBy);
        createTranslationIfNotExists("jira.config.usernamePlaceholder", languageCode, "user@company.com", createdBy);
        createTranslationIfNotExists("jira.config.usernameHelper", languageCode, "JIRA 로그인에 사용하는 이메일 주소", createdBy);
        createTranslationIfNotExists("jira.config.apiToken", languageCode, "API 토큰", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenHelper", languageCode, "JIRA API 토큰을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKey", languageCode, "테스트 프로젝트 키 (선택사항)", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyPlaceholder", languageCode, "TEST", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyHelper", languageCode, "연결 테스트 시 사용할 프로젝트 키 (선택사항)",
                createdBy);
        createTranslationIfNotExists("jira.config.autoTest", languageCode, "저장 전 자동으로 연결 테스트 수행", createdBy);
        createTranslationIfNotExists("jira.config.testButton", languageCode, "연결 테스트", createdBy);
        createTranslationIfNotExists("jira.config.testing", languageCode, "테스트 중...", createdBy);
        createTranslationIfNotExists("jira.config.testSuccess", languageCode, "연결 성공", createdBy);
        createTranslationIfNotExists("jira.config.testFailed", languageCode, "연결 실패", createdBy);
        createTranslationIfNotExists("jira.config.jiraVersion", languageCode, "JIRA 버전", createdBy);
        createTranslationIfNotExists("jira.config.testTime", languageCode, "테스트 시각", createdBy);
        createTranslationIfNotExists("jira.config.availableProjects", languageCode, "사용 가능한 프로젝트:", createdBy);
        createTranslationIfNotExists("jira.config.moreProjects", languageCode, "외 {count}개 프로젝트", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenGuide", languageCode, "API 토큰 생성 방법:", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep1", languageCode, "1. JIRA → 프로필 → 계정 설정 → 보안",
                createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep2", languageCode, "2. \"API 토큰 만들기\" 클릭", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep3", languageCode, "3. 토큰 이름 입력 후 생성", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep4", languageCode, "4. 생성된 토큰을 복사하여 위에 입력", createdBy);
        createTranslationIfNotExists("jira.config.cancelButton", languageCode, "취소", createdBy);
        createTranslationIfNotExists("jira.config.saveButton", languageCode, "저장", createdBy);
        createTranslationIfNotExists("jira.config.saving", languageCode, "저장 중...", createdBy);
        createTranslationIfNotExists("jira.config.error.serverUrlRequired", languageCode, "JIRA 서버 URL을 입력하세요",
                createdBy);
        createTranslationIfNotExists("jira.config.error.invalidUrl", languageCode, "올바른 URL 형식을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.usernameRequired", languageCode, "사용자명을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.apiTokenRequired", languageCode, "API 토큰을 입력하세요", createdBy);
        createTranslationIfNotExists("jira.config.error.connectionTestFailed", languageCode,
                "연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.", createdBy);
        createTranslationIfNotExists("jira.config.error.testError", languageCode, "연결 테스트 중 오류가 발생했습니다", createdBy);
        createTranslationIfNotExists("jira.config.confirm.saveWithoutTest", languageCode,
                "JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?", createdBy);
        createTranslationIfNotExists("jira.config.error.general", languageCode, "설정 저장 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("jira.api.connectionSuccess", languageCode, "JIRA 연결 성공", createdBy);
        createTranslationIfNotExists("jira.api.authFailure", languageCode, "인증 실패 또는 권한 부족", createdBy);
        createTranslationIfNotExists("jira.api.serverError", languageCode, "JIRA 서버 오류", createdBy);
        createTranslationIfNotExists("jira.api.networkError", languageCode, "네트워크 연결 실패", createdBy);
        createTranslationIfNotExists("jira.api.testFailure", languageCode, "연결 테스트 실패", createdBy);
        createTranslationIfNotExists("jira.api.unknownError", languageCode, "알 수 없는 오류", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "저장에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "삭제에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "네트워크 연결 오류", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "인증에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "암호화 처리 오류", createdBy);
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA 연결 상태", createdBy);
        createTranslationIfNotExists("jira.status.connected", languageCode, "연결됨", createdBy);
        createTranslationIfNotExists("jira.status.disconnected", languageCode, "연결 안됨", createdBy);
        createTranslationIfNotExists("jira.messages.connectionError", languageCode, "JIRA 연결에 실패했습니다", createdBy);
        createTranslationIfNotExists("jira.messages.syncSuccess", languageCode, "JIRA와 성공적으로 동기화되었습니다", createdBy);
        createTranslationIfNotExists("jira.messages.syncError", languageCode, "JIRA 동기화에 실패했습니다", createdBy);

        // JiraCommentDialog 컴포넌트 관련
        createTranslationIfNotExists("jira.comment.dialogTitle", languageCode, "JIRA 코멘트 추가", createdBy);
        createTranslationIfNotExists("jira.comment.connectionStatus.connected", languageCode, "JIRA 연결됨 ({serverUrl})",
                createdBy);
        createTranslationIfNotExists("jira.comment.connectionStatus.notConnected", languageCode,
                "JIRA 설정을 확인하거나 연결 상태를 점검해주세요", createdBy);
        createTranslationIfNotExists("jira.comment.error.noConfig", languageCode,
                "JIRA 설정이 없거나 연결에 실패했습니다. 설정을 확인해주세요.", createdBy);
        createTranslationIfNotExists("jira.comment.error.checkStatusFailed", languageCode, "JIRA 연결 상태를 확인할 수 없습니다.",
                createdBy);
        createTranslationIfNotExists("jira.comment.error.issueKeyRequired", languageCode, "JIRA 이슈 키를 입력하세요.",
                createdBy);
        createTranslationIfNotExists("jira.comment.error.invalidIssueKey", languageCode,
                "올바른 JIRA 이슈 키 형식이 아닙니다. (예: TEST-123)", createdBy);
        createTranslationIfNotExists("jira.comment.error.commentRequired", languageCode, "코멘트 내용을 입력하세요.", createdBy);
        createTranslationIfNotExists("jira.comment.success.added", languageCode, "JIRA 이슈에 코멘트가 성공적으로 추가되었습니다!",
                createdBy);
        createTranslationIfNotExists("jira.comment.detectedIssues.linked", languageCode, "연결된 이슈 및 감지된 JIRA 이슈:",
                createdBy);
        createTranslationIfNotExists("jira.comment.detectedIssues.fromNotes", languageCode, "테스트 노트에서 감지된 JIRA 이슈:",
                createdBy);
        createTranslationIfNotExists("jira.comment.detectedIssues.legend", languageCode, "초록색: 연결된 이슈, 회색: 노트에서 감지된 이슈",
                createdBy);
        createTranslationIfNotExists("jira.comment.field.issueKey.label", languageCode, "JIRA 이슈 키", createdBy);
        createTranslationIfNotExists("jira.comment.field.issueKey.placeholder", languageCode, "예: TEST-123, BUG-456",
                createdBy);
        createTranslationIfNotExists("jira.comment.field.issueKey.helper", languageCode,
                "JIRA 이슈 키를 입력하세요 (프로젝트키-번호 형식)", createdBy);
        createTranslationIfNotExists("jira.comment.field.autoGenerate.label", languageCode, "테스트 결과 기반 자동 코멘트 생성",
                createdBy);
        createTranslationIfNotExists("jira.comment.field.comment.label", languageCode, "코멘트 내용", createdBy);
        createTranslationIfNotExists("jira.comment.field.comment.placeholder", languageCode,
                "JIRA 이슈에 추가할 코멘트를 입력하세요...", createdBy);
        createTranslationIfNotExists("jira.comment.field.comment.charCount", languageCode, "{count} 글자", createdBy);
        createTranslationIfNotExists("jira.comment.testInfo.title", languageCode, "테스트 정보:", createdBy);
        createTranslationIfNotExists("jira.comment.testInfo.result", languageCode, "결과: {result}", createdBy);
        createTranslationIfNotExists("jira.comment.testInfo.notes", languageCode, "테스트 노트", createdBy);
        createTranslationIfNotExists("jira.comment.button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("jira.comment.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("jira.comment.button.send", languageCode, "코멘트 전송", createdBy);
        createTranslationIfNotExists("jira.comment.button.sending", languageCode, "전송 중...", createdBy);
        createTranslationIfNotExists("jira.comment.button.regenerate", languageCode, "코멘트 재생성", createdBy);
        createTranslationIfNotExists("jira.comment.template.title", languageCode, "테스트 결과 업데이트", createdBy);
        createTranslationIfNotExists("jira.comment.template.testCase", languageCode, "테스트 케이스:", createdBy);
        createTranslationIfNotExists("jira.comment.template.result", languageCode, "결과:", createdBy);
        createTranslationIfNotExists("jira.comment.template.executedAt", languageCode, "실행 시각:", createdBy);
        createTranslationIfNotExists("jira.comment.template.details", languageCode, "상세 내용:", createdBy);
        createTranslationIfNotExists("jira.comment.template.actionRequired", languageCode,
                "조치 필요: 실패한 테스트를 검토하고 관련 이슈를 수정해 주세요.", createdBy);
        createTranslationIfNotExists("jira.comment.template.footer", languageCode, "Test Case Manager에서 자동 생성됨",
                createdBy);
    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
        if (translationKeyOpt.isPresent()) {
            TranslationKey translationKey = translationKeyOpt.get();
            Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
            if (languageOpt.isPresent()) {
                Language language = languageOpt.get();
                Optional<Translation> existingTranslationOpt = translationRepository
                        .findByTranslationKeyAndLanguage(translationKey, language);
                if (existingTranslationOpt.isEmpty()) {
                    Translation translation = new Translation();
                    translation.setTranslationKey(translationKey);
                    translation.setLanguage(language);
                    translation.setValue(value);
                    translation.setCreatedBy(createdBy);
                    translation.setUpdatedBy(createdBy);
                    translation.setIsActive(true);
                    translationRepository.save(translation);
                    log.debug("번역 생성: {} - {}", keyName, languageCode);
                } else {
                    Translation existingTranslation = existingTranslationOpt.get();
                    if (!existingTranslation.getValue().equals(value)) {
                        existingTranslation.setValue(value);
                        existingTranslation.setUpdatedBy(createdBy);
                        translationRepository.save(existingTranslation);
                        log.debug("번역 업데이트: {} - {}", keyName, languageCode);
                    } else {
                        log.debug("번역 이미 존재하며 동일함: {} - {}", keyName, languageCode);
                    }
                }
            }
        } else {
            log.warn("번역 키를 찾을 수 없음: {}", keyName);
        }
    }
}
