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
                createTranslationKeyIfNotExists("jira.messages.noConfig", "jira", "JIRA 설정 없음 메시지",
                                "JIRA 서버가 설정되지 않았습니다.");
                createTranslationKeyIfNotExists("jira.messages.connectionError", "jira", "JIRA 연결 오류",
                                "JIRA 연결에 실패했습니다");
                createTranslationKeyIfNotExists("jira.messages.syncSuccess", "jira", "JIRA 동기화 성공",
                                "JIRA와 성공적으로 동기화되었습니다");
                createTranslationKeyIfNotExists("jira.messages.syncError", "jira", "JIRA 동기화 오류", "JIRA 동기화에 실패했습니다");

                // JiraStatusIndicator 컴포넌트 관련
                createTranslationKeyIfNotExists("jira.indicator.checkingStatus", "jira", "JIRA 상태 확인 중", "확인 중...");
                createTranslationKeyIfNotExists("jira.indicator.unknown", "jira", "알 수 없는 상태", "알 수 없음");
                createTranslationKeyIfNotExists("jira.indicator.connectionFailed", "jira", "연결 실패", "연결 실패");
                createTranslationKeyIfNotExists("jira.indicator.setupRequired", "jira", "설정 필요 메시지",
                                "JIRA와 연동하려면 먼저 설정을 완료해주세요.");
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
                createTranslationKeyIfNotExists("jira.indicator.connectedMessage", "jira", "연결 성공 메시지",
                                "JIRA 서버와 정상적으로 연결되었습니다.");
                createTranslationKeyIfNotExists("jira.indicator.connectionFailedMessage", "jira", "연결 실패 메시지",
                                "JIRA 서버 연결에 실패했습니다.");

                // JiraConfigDialog 컴포넌트 관련
                createTranslationKeyIfNotExists("jira.config.dialogTitle.add", "jira", "JIRA 설정 추가 제목", "JIRA 설정 추가");
                createTranslationKeyIfNotExists("jira.config.dialogTitle.edit", "jira", "JIRA 설정 수정 제목", "JIRA 설정 수정");
                createTranslationKeyIfNotExists("jira.config.serverUrl", "jira", "서버 URL 라벨", "JIRA 서버 URL");
                createTranslationKeyIfNotExists("jira.config.serverUrlPlaceholder", "jira", "서버 URL 플레이스홀더",
                                "https://your-domain.atlassian.net");
                createTranslationKeyIfNotExists("jira.config.serverUrlHelper", "jira", "서버 URL 도움말",
                                "JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)");
                createTranslationKeyIfNotExists("jira.config.username", "jira", "사용자명 라벨", "사용자명 (이메일)");
                createTranslationKeyIfNotExists("jira.config.usernamePlaceholder", "jira", "사용자명 플레이스홀더",
                                "user@company.com");
                createTranslationKeyIfNotExists("jira.config.usernameHelper", "jira", "사용자명 도움말",
                                "JIRA 로그인에 사용하는 이메일 주소");
                createTranslationKeyIfNotExists("jira.config.apiToken", "jira", "API 토큰 라벨", "API 토큰");
                createTranslationKeyIfNotExists("jira.config.apiTokenHelper", "jira", "API 토큰 도움말",
                                "JIRA API 토큰을 입력하세요");
                createTranslationKeyIfNotExists("jira.config.testProjectKey", "jira", "테스트 프로젝트 키 라벨",
                                "테스트 프로젝트 키 (선택사항)");
                createTranslationKeyIfNotExists("jira.config.testProjectKeyPlaceholder", "jira", "테스트 프로젝트 키 플레이스홀더",
                                "TEST");
                createTranslationKeyIfNotExists("jira.config.testProjectKeyHelper", "jira", "테스트 프로젝트 키 도움말",
                                "연결 테스트 시 사용할 프로젝트 키 (선택사항)");
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
                createTranslationKeyIfNotExists("jira.config.apiTokenStep1", "jira", "API 토큰 생성 1단계",
                                "1. JIRA → 프로필 → 계정 설정 → 보안");
                createTranslationKeyIfNotExists("jira.config.apiTokenStep2", "jira", "API 토큰 생성 2단계",
                                "2. \"API 토큰 만들기\" 클릭");
                createTranslationKeyIfNotExists("jira.config.apiTokenStep3", "jira", "API 토큰 생성 3단계",
                                "3. 토큰 이름 입력 후 생성");
                createTranslationKeyIfNotExists("jira.config.apiTokenStep4", "jira", "API 토큰 생성 4단계",
                                "4. 생성된 토큰을 복사하여 위에 입력");

                // 설정 다이얼로그 버튼
                createTranslationKeyIfNotExists("jira.config.cancelButton", "jira", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("jira.config.saveButton", "jira", "저장 버튼", "저장");
                createTranslationKeyIfNotExists("jira.config.saving", "jira", "저장 중", "저장 중...");

                // 설정 검증 오류
                createTranslationKeyIfNotExists("jira.config.error.serverUrlRequired", "jira", "서버 URL 필수 오류",
                                "JIRA 서버 URL을 입력하세요");
                createTranslationKeyIfNotExists("jira.config.error.invalidUrl", "jira", "잘못된 URL 오류",
                                "올바른 URL 형식을 입력하세요");
                createTranslationKeyIfNotExists("jira.config.error.usernameRequired", "jira", "사용자명 필수 오류",
                                "사용자명을 입력하세요");
                createTranslationKeyIfNotExists("jira.config.error.apiTokenRequired", "jira", "API 토큰 필수 오류",
                                "API 토큰을 입력하세요");
                createTranslationKeyIfNotExists("jira.config.error.connectionTestFailed", "jira", "연결 테스트 실패 오류",
                                "연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.");
                createTranslationKeyIfNotExists("jira.config.error.testError", "jira", "테스트 중 오류",
                                "연결 테스트 중 오류가 발생했습니다");
                createTranslationKeyIfNotExists("jira.config.confirm.saveWithoutTest", "jira", "테스트 없이 저장 확인",
                                "JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?");

                // API 응답 메시지 번역 키
                createTranslationKeyIfNotExists("jira.api.connectionSuccess", "jira", "API 연결 성공", "JIRA 연결 성공");
                createTranslationKeyIfNotExists("jira.api.authFailure", "jira", "API 인증 실패", "인증 실패 또는 권한 부족");
                createTranslationKeyIfNotExists("jira.api.serverError", "jira", "API 서버 오류", "JIRA 서버 오류");
                createTranslationKeyIfNotExists("jira.api.networkError", "jira", "API 네트워크 오류", "네트워크 연결 실패");
                createTranslationKeyIfNotExists("jira.api.testFailure", "jira", "API 테스트 실패", "연결 테스트 실패");
                createTranslationKeyIfNotExists("jira.api.unknownError", "jira", "API 알 수 없는 오류", "알 수 없는 오류");

                // JiraCommentDialog 컴포넌트 관련
                createTranslationKeyIfNotExists("jira.comment.dialogTitle", "jira", "코멘트 다이얼로그 제목", "JIRA 코멘트 추가");
                createTranslationKeyIfNotExists("jira.comment.connectionStatus.connected", "jira", "JIRA 연결됨 메시지",
                                "JIRA 연결됨 ({serverUrl})");
                createTranslationKeyIfNotExists("jira.comment.connectionStatus.notConnected", "jira", "JIRA 미연결 메시지",
                                "JIRA 설정을 확인하거나 연결 상태를 점검해주세요");
                createTranslationKeyIfNotExists("jira.comment.error.noConfig", "jira", "설정 없음 에러",
                                "JIRA 설정이 없거나 연결에 실패했습니다. 설정을 확인해주세요.");
                createTranslationKeyIfNotExists("jira.comment.error.checkStatusFailed", "jira", "상태 확인 실패",
                                "JIRA 연결 상태를 확인할 수 없습니다.");
                createTranslationKeyIfNotExists("jira.comment.error.issueKeyRequired", "jira", "이슈 키 필수",
                                "JIRA 이슈 키를 입력하세요.");
                createTranslationKeyIfNotExists("jira.comment.error.invalidIssueKey", "jira", "잘못된 이슈 키",
                                "올바른 JIRA 이슈 키 형식이 아닙니다. (예: TEST-123)");
                createTranslationKeyIfNotExists("jira.comment.error.commentRequired", "jira", "코멘트 필수",
                                "코멘트 내용을 입력하세요.");
                createTranslationKeyIfNotExists("jira.comment.success.added", "jira", "코멘트 추가 성공",
                                "JIRA 이슈에 코멘트가 성공적으로 추가되었습니다!");

                // 감지된 이슈 관련
                createTranslationKeyIfNotExists("jira.comment.detectedIssues.linked", "jira", "연결된 이슈 및 감지",
                                "연결된 이슈 및 감지된 JIRA 이슈:");
                createTranslationKeyIfNotExists("jira.comment.detectedIssues.fromNotes", "jira", "노트에서 감지됨",
                                "테스트 노트에서 감지된 JIRA 이슈:");
                createTranslationKeyIfNotExists("jira.comment.detectedIssues.legend", "jira", "이슈 범례",
                                "초록색: 연결된 이슈, 회색: 노트에서 감지된 이슈");

                // 입력 필드 관련
                createTranslationKeyIfNotExists("jira.comment.field.issueKey.label", "jira", "이슈 키 라벨", "JIRA 이슈 키");
                createTranslationKeyIfNotExists("jira.comment.field.issueKey.placeholder", "jira", "이슈 키 플레이스홀더",
                                "예: TEST-123, BUG-456");
                createTranslationKeyIfNotExists("jira.comment.field.issueKey.helper", "jira", "이슈 키 도움말",
                                "JIRA 이슈 키를 입력하세요 (프로젝트키-번호 형식)");
                createTranslationKeyIfNotExists("jira.comment.field.autoGenerate.label", "jira", "자동 생성 라벨",
                                "테스트 결과 기반 자동 코멘트 생성");
                createTranslationKeyIfNotExists("jira.comment.field.comment.label", "jira", "코멘트 라벨", "코멘트 내용");
                createTranslationKeyIfNotExists("jira.comment.field.comment.placeholder", "jira", "코멘트 플레이스홀더",
                                "JIRA 이슈에 추가할 코멘트를 입력하세요...");
                createTranslationKeyIfNotExists("jira.comment.field.comment.charCount", "jira", "글자 수", "{count} 글자");

                // 테스트 정보 관련
                createTranslationKeyIfNotExists("jira.comment.testInfo.title", "jira", "테스트 정보 제목", "테스트 정보:");
                createTranslationKeyIfNotExists("jira.comment.testInfo.result", "jira", "결과 라벨", "결과: {result}");
                createTranslationKeyIfNotExists("jira.comment.testInfo.notes", "jira", "테스트 노트 라벨", "테스트 노트");

                // 버튼 관련
                createTranslationKeyIfNotExists("jira.comment.button.close", "jira", "닫기 버튼", "닫기");
                createTranslationKeyIfNotExists("jira.comment.button.cancel", "jira", "취소 버튼", "취소");
                createTranslationKeyIfNotExists("jira.comment.button.send", "jira", "전송 버튼", "코멘트 전송");
                createTranslationKeyIfNotExists("jira.comment.button.sending", "jira", "전송 중", "전송 중...");
                createTranslationKeyIfNotExists("jira.comment.button.regenerate", "jira", "재생성 버튼", "코멘트 재생성");

                // 자동 생성 코멘트 템플릿 관련
                createTranslationKeyIfNotExists("jira.comment.template.title", "jira", "코멘트 템플릿 제목", "테스트 결과 업데이트");
                createTranslationKeyIfNotExists("jira.comment.template.testCase", "jira", "테스트 케이스", "테스트 케이스:");
                createTranslationKeyIfNotExists("jira.comment.template.result", "jira", "결과", "결과:");
                createTranslationKeyIfNotExists("jira.comment.template.executedAt", "jira", "실행 시각", "실행 시각:");
                createTranslationKeyIfNotExists("jira.comment.template.details", "jira", "상세 내용", "상세 내용:");
                createTranslationKeyIfNotExists("jira.comment.template.actionRequired", "jira", "조치 필요",
                                "조치 필요: 실패한 테스트를 검토하고 관련 이슈를 수정해 주세요.");
                createTranslationKeyIfNotExists("jira.comment.template.footer", "jira", "자동 생성 푸터",
                                "Test Case Manager에서 자동 생성됨");

                // JIRA Summary 관련 추가 키들
                createTranslationKeyIfNotExists("jira.summary.filterInProgress", "jira", "진행 중 필터링", "진행 중 테스트 결과만 표시");
                createTranslationKeyIfNotExists("jira.summary.loadingData", "jira", "데이터 로딩 중", "데이터를 불러오는 중...");
                createTranslationKeyIfNotExists("jira.summary.testResultsCount", "jira", "테스트 결과 수",
                                "총 {count}개 테스트 결과");
                createTranslationKeyIfNotExists("jira.summary.noResults", "jira", "결과 없음", "테스트 결과가 없습니다");
                createTranslationKeyIfNotExists("jira.summary.connectedResults", "jira", "연결된 결과", "JIRA 연결: {count}개");
                createTranslationKeyIfNotExists("jira.summary.connectionRate", "jira", "연결률", "연결률: {rate}%");
                createTranslationKeyIfNotExists("jira.summary.hasNoFailed", "jira", "실패 없음", "실패한 테스트가 없습니다");

                // JIRA Settings 관련 추가 키들
                createTranslationKeyIfNotExists("jira.settings.title", "jira", "JIRA 설정 제목", "JIRA 설정");
                createTranslationKeyIfNotExists("jira.settings.description", "jira", "JIRA 설정 설명",
                                "JIRA 서버 연결 설정을 관리합니다");

                // JIRA Success/Confirm/Button 관련 추가 키들
                createTranslationKeyIfNotExists("jira.success.saved", "jira", "저장 성공", "JIRA 설정이 저장되었습니다");
                createTranslationKeyIfNotExists("jira.success.deleted", "jira", "삭제 성공", "JIRA 설정이 삭제되었습니다");
                createTranslationKeyIfNotExists("jira.confirm.delete", "jira", "삭제 확인", "JIRA 설정을 삭제하시겠습니까?");
                createTranslationKeyIfNotExists("jira.button.configure", "jira", "설정 버튼", "설정");
                createTranslationKeyIfNotExists("jira.button.delete", "jira", "삭제 버튼", "삭제");

                // JIRA Config Error 관련
                createTranslationKeyIfNotExists("jira.config.error.general", "jira", "일반 설정 오류",
                                "JIRA 설정 중 오류가 발생했습니다");

                log.info("JIRA 연동 관련 번역 키 초기화 완료");
        }

        private void createTranslationKeyIfNotExists(String keyName, String category, String description,
                        String defaultValue) {
                Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
                if (existingKey.isEmpty()) {
                        TranslationKey translationKey = new TranslationKey(keyName, category, description,
                                        defaultValue);
                        translationKeyRepository.save(translationKey);
                        log.debug("번역 키 생성: {}", keyName);
                } else {
                        log.debug("번역 키 이미 존재: {}", keyName);
                }
        }
}
